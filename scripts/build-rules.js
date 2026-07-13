#!/usr/bin/env node
// build-rules.js — docs/rules/ から CLAUDE.md / AGENTS.md を生成する（OMS 用）
//
// 正本: docs/rules/shared.md（共通）+ claude-only.md / codex-only.md（AI 別差分）。
// shared.md 内の <!-- AI_SPECIFIC --> マーカー位置に AI 別ファイルの内容を挿入する。
// CLAUDE.md / AGENTS.md は生成物のため手編集禁止（drift 防止。agent-env の
// rules/build-rules.ps1 と同じ単一ソース方式）。
//
// 使い方:
//   node scripts/build-rules.js          # 生成（差分があれば上書き）
//   node scripts/build-rules.js --check  # 生成せず一致検査のみ（不一致なら exit 1）
//                                        # → .agent-env.json の品質ゲートから呼ばれる

'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const rulesDir = path.join(repoRoot, 'docs', 'rules');
const MARKER = '<!-- AI_SPECIFIC -->';

// core.autocrlf=true 環境では checkout で CRLF になり得るため、読み込みは常に LF へ
// 正規化して比較する（さもないと fresh clone / git worktree add 直後に --check が
// 「drift ゼロなのに不一致」で偽陽性となり、品質ゲートが全コミットをブロックする）。
// 書き出しは LF 統一（.gitattributes の eol=lf と対）。
function readNorm(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

const targets = [
  { title: 'Claude Code Configuration', aiFile: 'claude-only.md', out: 'CLAUDE.md' },
  { title: 'Codex Configuration', aiFile: 'codex-only.md', out: 'AGENTS.md' },
];

function build(t) {
  const shared = readNorm(path.join(rulesDir, 'shared.md'));
  // マーカーは「ちょうど1個」を要求（2個以上だと残骸が生成物に漏れる事故を防ぐ）
  const parts = shared.split(MARKER);
  if (parts.length !== 2) {
    throw new Error(`docs/rules/shared.md の ${MARKER} マーカーはちょうど1個必要です（現在 ${parts.length - 1} 個）。`);
  }
  const aiRaw = readNorm(path.join(rulesDir, t.aiFile)).trim();
  // HTML コメントを除いて空なら「実質空」= 挿入をスキップ（プレースホルダコメントを生成物に出さない）
  const ai = aiRaw.replace(/<!--[\s\S]*?-->/g, '').trim() ? aiRaw : '';
  const header =
    `# ${t.title}\n\n` +
    `<!-- AUTO-GENERATED from docs/rules/ -- 手編集禁止。編集は docs/rules/*.md を編集して \`node scripts/build-rules.js\` を再実行すること -->\n\n`;
  // 文字列連結で挿入する（String.replace の第2引数は $& 等を特殊展開するため使わない）。
  // 空行の整形はマーカー周辺のみに局所化（ルール本文中の連続空行やコードフェンスは触らない）。
  const [pre, post] = parts;
  const body = ai
    ? pre + ai + post
    : pre.replace(/\n+$/, '\n\n') + post.replace(/^\n+/, '');
  return header + body.replace(/^\n+/, '');
}

function main() {
  const checkOnly = process.argv.includes('--check');
  let dirty = 0;
  for (const t of targets) {
    const outPath = path.join(repoRoot, t.out);
    const expected = build(t);
    const current = fs.existsSync(outPath) ? readNorm(outPath) : '';
    if (current === expected) {
      console.log(`OK: ${t.out} は docs/rules/ と一致`);
      continue;
    }
    if (checkOnly) {
      console.error(`NG: ${t.out} が docs/rules/ と不一致です。手編集せず docs/rules/*.md を編集し、node scripts/build-rules.js で再生成してください。`);
      dirty = 1;
      continue;
    }
    fs.writeFileSync(outPath, expected);
    console.log(`Generated: ${t.out}`);
  }
  process.exit(dirty);
}

main();
