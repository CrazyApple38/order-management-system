#!/usr/bin/env node
/* ============================================================================
   classify-changed-files.js — PR の変更ファイルを「視覚 / 非視覚」で判定し、
   マージラベル（auto-merge-ok | needs-visual-review）を stdout に1トークン出力する。
   ----------------------------------------------------------------------------
   agent-env PR ワークフロー自動化 BP-4 の判定ロジック（単一情報源）。
   CI（.github/workflows/pr-checks.yml の classify ジョブ）が本スクリプトで PR に
   ラベルを付与し、pr-flow の automerge がそのラベルを読んでマージ挙動を分岐する。
   パス判定表の SSOT: agent-env docs/plan/pr-workflow-automation-plan.md §2B。

   判定アルゴリズム（安全側 = 疑わしきは視覚扱い）:
     各ファイル f について
       1) f が視覚パターンに一致        → visual
       2) でなければ非視覚パターンに一致 → non-visual
       3) どちらにも一致しない          → visual（unknown=安全側）
     PR 全体: 全ファイルが non-visual のときだけ auto-merge-ok。
              1つでも visual があれば needs-visual-review。
              変更ファイルが空の場合も needs-visual-review（安全側）。
     ※ 視覚パターンを先に判定するため、視覚ディレクトリ下の *.json 等は
       非視覚パターン（設定系 *.json）に一致しても visual に倒れる。

   入力: 変更ファイルパスを stdin または引数で渡す。stdin は NUL 区切り・改行区切りの
         どちらも受け付ける（CI は `git diff -z` の NUL 区切りを渡す）。
   ※ CI から呼ぶときは必ず `git diff -z`（NUL 区切り）を使うこと。`-z` なしだと
     git は core.quotepath=true 既定で非ASCIIパスを "..." の8進エスケープで出力し、
     本スクリプトが誤解して unknown→visual に倒れる（日本語名ドキュメントで発生）。
   出力: stdout に決定ラベル1行、stderr に内訳（デバッグ用）。
   使い方:
     git diff -z --name-only origin/master...HEAD | node scripts/ci/classify-changed-files.js
     node scripts/ci/classify-changed-files.js path/a path/b
     node scripts/ci/classify-changed-files.js --selftest
   終了コード: 通常 0。--selftest で1件でも失敗すれば 1。
   ============================================================================ */
'use strict';

const fs = require('fs');

const AUTO = 'auto-merge-ok';
const NEEDS = 'needs-visual-review';

function norm(p) {
  return String(p).trim().replace(/\\/g, '/').replace(/^\.\//, '');
}

// 視覚パターン（先に判定 = 安全側）
function isVisual(p) {
  if (/\.css$/i.test(p)) return true;          // **/*.css
  if (/\.html?$/i.test(p)) return true;        // **/*.html（docs/*.html を含み広めに）
  if (p.startsWith('docs/mockup/')) return true;
  if (p.startsWith('docs/preview/')) return true;
  if (p.startsWith('docs/ui-components/')) return true;
  return false;
}

// 非視覚パターン（視覚に当たらなかったものだけ判定）
function isNonVisual(p) {
  if (/\.md$/i.test(p)) return true;           // **/*.md
  if (p.startsWith('docs/plan/')) return true;
  if (p.startsWith('scripts/')) return true;
  if (p === '.agent-env.json') return true;
  if (p.startsWith('.github/')) return true;
  if (/\.json$/i.test(p)) return true;         // 設定系 *.json（視覚dir下は上で visual 済み）
  return false;
}

function classifyFile(raw) {
  const p = norm(raw);
  if (!p) return null;
  if (isVisual(p)) return { path: p, kind: 'visual' };
  if (isNonVisual(p)) return { path: p, kind: 'non-visual' };
  return { path: p, kind: 'visual', unknown: true };
}

function classify(files) {
  const items = files.map(classifyFile).filter(Boolean);
  const visual = items.filter(i => i.kind === 'visual');
  let label;
  if (items.length === 0) label = NEEDS;       // 空=安全側
  else label = visual.length === 0 ? AUTO : NEEDS;
  return { label, items, visual };
}

function readStdinLines() {
  try {
    // NUL 区切り（git diff -z）と改行区切りの両方に対応する。
    return fs.readFileSync(0, 'utf8').split(/\0|\r?\n/);
  } catch (e) {
    return [];
  }
}

function selftest() {
  const cases = [
    [['docs/HANDOFF.md'], AUTO],
    [['scripts/ci/classify-changed-files.js'], AUTO],
    [['.github/workflows/pr-checks.yml'], AUTO],
    [['.agent-env.json'], AUTO],
    [['package.json'], AUTO],
    [['docs/plan/x.md', 'scripts/a.js'], AUTO],
    [['docs/mockup/order-book.html'], NEEDS],
    [['docs/preview/notify-compare.html'], NEEDS],
    [['docs/ui-components/index.html'], NEEDS],
    [['docs/mockup/app.css'], NEEDS],
    [['docs/mockup/data.json'], NEEDS],        // 視覚dir下の json は視覚（V先判定）
    [['scripts/x.css'], NEEDS],                // scripts下でも css は視覚
    [['docs/HANDOFF.md', 'docs/mockup/x.html'], NEEDS], // 混在→視覚
    [['some/random/file.txt'], NEEDS],         // unknown→視覚
    [[], NEEDS],                               // 空→視覚（安全側）
  ];
  let fail = 0;
  for (const [files, expected] of cases) {
    const got = classify(files.map(norm)).label;
    const ok = got === expected;
    if (!ok) fail++;
    process.stderr.write(`${ok ? 'PASS' : 'FAIL'} expect=${expected} got=${got} <- ${JSON.stringify(files)}\n`);
  }
  process.stdout.write(fail === 0 ? 'selftest: all passed\n' : `selftest: ${fail} case(s) FAILED\n`);
  process.exit(fail === 0 ? 0 : 1);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) return selftest();

  const argPaths = argv.filter(a => !a.startsWith('--'));
  let files = argPaths;
  if (files.length === 0) {
    if (process.stdin.isTTY) {
      process.stderr.write('入力なし（引数か stdin で変更ファイルパスを渡してください）。\n');
    } else {
      files = readStdinLines();
    }
  }
  files = files.map(norm).filter(Boolean);

  const { label, items, visual } = classify(files);
  for (const i of items) {
    process.stderr.write(`  [${i.kind}${i.unknown ? ':unknown' : ''}] ${i.path}\n`);
  }
  process.stderr.write(`files=${items.length} visual=${visual.length} => ${label}\n`);
  process.stdout.write(label + '\n');
}

main();
