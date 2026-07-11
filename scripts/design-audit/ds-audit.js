#!/usr/bin/env node
/* ============================================================================
   ds-audit.js — デザイントークン静的監査（R-3 系作業の完了前に必ず実行）
   ----------------------------------------------------------------------------
   経緯: R-3d(LA) で「co-tokens.css 撤去後の旧トークン参照が未定義化 → コンソール
   エラー 0 のまま太字・意味色が無効化」する回帰が発生（2026-07-10 の横断レビューで
   OB/WS にも同型欠落を検出）。CSS カスタムプロパティの未定義参照はエラーを出さない
   ため、本スクリプトで機械検出する。運用規約: docs/design-system/04 §5。

   検査内容（docs/*.html の <link rel="stylesheet"> から読込チェーンを自動導出）:
     [NG]   1. co-tokens.css と ds-tokens.css の同一ページ併載（同名別値トークン）
     [NG]   2. フォールバック無し var(--x) 参照の未定義（ALLOWLIST 除く）
     [INFO] 3. フォールバック付き var(--x, ...) 参照の未定義（--verbose で表示）
     [WARN] 4. 画面別 DS CSS（*-ds.css / ds-legacy-aliases.css）内の、正本
              （ds-tokens.css + ds-components.css）に無い直書き hex / rgba /
              スケール外 border-radius / 700 超 font-weight

   使い方:  node scripts/design-audit/ds-audit.js [--verbose]
   終了コード: NG が 1 件でもあれば 1（ALLOWLIST 内は除外・[allowed] 表示のみ）
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', '..', 'docs');
const MOCKUP = path.join(DOCS, 'mockup');
const VERBOSE = process.argv.includes('--verbose');

/* 既存負債の未定義トークン参照は R-3f #3（2026-07-11）で全解消済み。
   --focus-ring/--primary/--secondary = B-2b-2/B-3 で参照側を DS 値へ読替済み。
   --bg-primary/--bg-secondary/--shadow-strong = #3 で --panel/--bg/--elevation-5 へ書換。
   ここへの新規追加は禁止（未定義参照は発生時点で修正すること）。 */
const ALLOWLIST = new Set([]);

/* JS から setProperty で供給されるトークン（動的定義。プレフィックス一致も可） */
const JS_DEFINED_PREFIXES = ['--belong-', '--la-tip-pointer-left', '--icon-url'];

const read = f => fs.readFileSync(f, 'utf8');
const stripComments = t => t.replace(/\/\*[\s\S]*?\*\//g, s => ' '.repeat(s.length));

function cssDefs(text) {
    const s = new Set();
    for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) s.add(m[1]);
    return s;
}

// docs/*.html から読込チェーンを自動導出
const pages = [];
for (const f of fs.readdirSync(DOCS).filter(f => f.endsWith('.html'))) {
    const html = read(path.join(DOCS, f));
    const links = [...html.matchAll(/<link[^>]+href="mockup\/([^"?]+\.css)[^"]*"/g)].map(m => m[1]);
    if (links.length) pages.push({ name: f, html, links });
}

// 正本の literal 集合（WARN 判定用）
const canonicalLiterals = new Set();
for (const src of ['ds-tokens.css', 'ds-components.css']) {
    const t = read(path.join(MOCKUP, src));
    for (const m of t.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) canonicalLiterals.add(m[0].toLowerCase());
    for (const m of t.matchAll(/rgba?\([^)]*\)/g)) canonicalLiterals.add(m[0].replace(/\s+/g, ''));
}
const RADIUS_SCALE = new Set(['0px', '4px', '8px', '14px', '20px', '999px']);
// R-3f #5 承認済み。既存描画を維持する局所的な同心角丸 / 極小チップのみ許可する。
const APPROVED_RADIUS_EXCEPTIONS = new Set([
    'la-ds.css:2px',
    'ws-ds.css:3px',
]);

// JS 由来の動的定義を収集
const jsDefined = new Set();
for (const f of fs.readdirSync(MOCKUP).filter(f => f.endsWith('.js'))) {
    for (const m of read(path.join(MOCKUP, f)).matchAll(/setProperty\(\s*[`'"](--[a-zA-Z0-9-]+)/g)) jsDefined.add(m[1]);
}

let ngCount = 0, warnCount = 0;
const isKnown = (name, defined) =>
    defined.has(name) || jsDefined.has(name) || JS_DEFINED_PREFIXES.some(p => name.startsWith(p));

for (const page of pages) {
    const lines = [];
    // 1. co-tokens / ds-tokens 併載
    if (page.links.includes('co-tokens.css') && page.links.includes('ds-tokens.css')) {
        lines.push('  [NG] co-tokens.css と ds-tokens.css を併載（同名別値トークン・禁止）');
        ngCount++;
    }
    // 定義集合 = 読込CSS全体 + HTML内 <style>/style属性
    const defined = cssDefs(page.html);
    const cssTexts = {};
    for (const f of page.links) {
        const p = path.join(MOCKUP, f);
        if (!fs.existsSync(p)) { lines.push(`  [NG] 参照CSSが存在しない: ${f}`); ngCount++; continue; }
        cssTexts[f] = read(p);
        for (const d of cssDefs(cssTexts[f])) defined.add(d);
    }
    // 2,3. 未定義 var() 参照
    for (const [f, text] of Object.entries(cssTexts)) {
        const seen = new Set();
        for (const m of stripComments(text).matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
            const [_, name, delim] = m;
            if (isKnown(name, defined)) continue;
            const key = `${f}:${name}:${delim}`;
            if (seen.has(key)) continue;
            seen.add(key);
            if (delim === ')') {
                if (ALLOWLIST.has(name)) {
                    if (VERBOSE) lines.push(`  [allowed] ${f}: ${name}（既存負債・R-3f）`);
                } else { lines.push(`  [NG] ${f}: var(${name}) が未定義（フォールバック無し）`); ngCount++; }
            } else if (VERBOSE) {
                lines.push(`  [INFO] ${f}: var(${name}, ...) 未定義（フォールバックで描画）`);
            }
        }
    }
    // 4. 画面別 DS CSS の直書き値
    for (const [f, text] of Object.entries(cssTexts)) {
        if (!/-ds\.css$|ds-legacy-aliases\.css$/.test(f)) continue;
        stripComments(text).split(/\r?\n/).forEach((ln, i) => {
            for (const m of ln.matchAll(/#[0-9a-fA-F]{3,8}\b/g))
                if (!canonicalLiterals.has(m[0].toLowerCase())) { lines.push(`  [WARN] ${f}:${i + 1} 直書き ${m[0]}（正本に無い値）`); warnCount++; }
            for (const m of ln.matchAll(/rgba?\([^)]*\)/g)) {
                const v = m[0].replace(/\s+/g, '');
                if (!canonicalLiterals.has(v)) { lines.push(`  [WARN] ${f}:${i + 1} 直書き ${v}`); warnCount++; }
            }
            for (const m of ln.matchAll(/border-radius\s*:\s*([^;]+);/g))
                for (const v of m[1].match(/\d+px/g) || [])
                    if (!RADIUS_SCALE.has(v) && !APPROVED_RADIUS_EXCEPTIONS.has(`${f}:${v}`)) { lines.push(`  [WARN] ${f}:${i + 1} スケール外角丸 ${v}`); warnCount++; }
            for (const m of ln.matchAll(/font-weight\s*:\s*(\d+)/g))
                if (+m[1] > 700) { lines.push(`  [WARN] ${f}:${i + 1} font-weight ${m[1]}（上限700）`); warnCount++; }
        });
    }
    if (lines.length || VERBOSE) {
        console.log(`=== ${page.name} ===`);
        lines.forEach(l => console.log(l));
    }
}

console.log(`\n結果: NG=${ngCount} WARN=${warnCount}${VERBOSE ? '' : '（詳細は --verbose）'}`);
process.exit(ngCount ? 1 : 0);
