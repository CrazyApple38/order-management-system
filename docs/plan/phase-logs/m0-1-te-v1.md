# Test Execution Report: M0-1 v1
- 検証日: 2026-04-18
- 検証者: Test Executor (TE)
- 対象: docs/mockup/co-tokens.css

## サマリ
- Pass: 44 / Total 44
- Fail: 0
- Warning: 0

## カテゴリ別結果

### A. DS準拠（22項目）

- A1: Pass — `^:root\s*\{` は18行目に1件ヒット（`:root {`）。トップレベルブロックは1つ。
- A2: Pass — L21-26 で `--bg-page:#E9F1F6 / --bg-surface:#FFFFFF / --bg-surface-2:#F0EDE9 / --bg-surface-3:#D3D0C8 / --bg-sidebar:#004554 / --divider:#B2D5E2` が全て期待値と一致。
- A3: Pass — L29 `--text-primary:#004554` / L30 `--text-secondary:#2A6B7A` / L31 `--text-tertiary:#5A8896` / L32 `--text-disabled:#8BAEB9`。D6.1 AA化値と完全一致。
- A4: Pass — L35-40 で `--accent-primary:#44A6B5 / -light:#5AB8C6 / -dim:rgba(68, 166, 181, 0.12) / --accent-secondary:#E07856 / -light:#EA9980 / -dim:rgba(224, 120, 86, 0.12)` が全て期待値と一致。新DS命名（`--accent-primary`系）を採用。
- A5: Pass — L43-48 で `--semantic-success:#38A169 / -text:#276749 / --semantic-warning:#D69E2E / -text:#92400e / -bg:rgba(214, 158, 46, 0.1) / --semantic-error:#DB577B` が全て期待値と一致。
- A6: Pass — L51-58 で 8変数全て定義。bg: rgba(68,166,181,0.14) / rgba(122,140,196,0.14) / rgba(180,135,100,0.14) / rgba(98,158,120,0.14)、text: #1c4d54 / #2d3e7a / #5a3f25 / #1f4e31。全て期待値と一致。
- A7: Pass — L61-78 で `--chart-1〜6` カテゴリカル6色 + `--chart-seq-0〜4` 連続5色 + `--chart-diverge-neg/neutral/pos` 差分3色、計14変数すべて期待値と一致。
- A8: Pass — L81 body font-family と tokens.json 行75 が文字列として完全一致。L82 mono font-family も tokens.json 行80 と完全一致。
- A9: Pass — L85-91 で `--fs-caption:11px / --fs-sm:13px / --fs-base:14px / --fs-md:16px / --fs-lg:20px / --fs-xl:26px / --fs-2xl:34px` が全て期待値と一致。
- A10: Pass — L94-98 で `--fw-regular:400 / -medium:500 / -semibold:600 / -bold:700 / -black:800`。
- A11: Pass — L101-103 で `--lh-tight:1.3 / --lh-base:1.5 / --lh-loose:1.7`。
- A12: Pass — L106-113 で `--space-2xs:2px / -xs:4px / -sm:8px / -md:12px / -lg:16px / -xl:24px / -2xl:32px / -3xl:48px` の8段完備。
- A13: Pass — L116-119 で `--radius-sm:4px / -md:8px / -lg:12px / -xl:16px`。
- A14: Pass — L122-127 で `--elevation-0:none / -1:0 1px 2px rgba(0, 69, 84, 0.06) / -2:0 2px 4px rgba(0, 69, 84, 0.08) / -3:0 4px 12px rgba(0, 69, 84, 0.10) / -4:0 8px 24px rgba(0, 69, 84, 0.14) / -5:0 16px 48px rgba(0, 69, 84, 0.18)` が期待値と一致。
- A15: Pass — L130-134 で `--duration-instant:0ms / -fast:120ms / -base:200ms / -slow:320ms / -slower:480ms`。
- A16: Pass — L137-140 で `--ease-out:cubic-bezier(0.16, 1, 0.3, 1) / -in:cubic-bezier(0.7, 0, 0.84, 0) / -in-out:cubic-bezier(0.87, 0, 0.13, 1) / -spring:cubic-bezier(0.34, 1.56, 0.64, 1)`。
- A17: Pass — L143-147 で `--bp-sm:640px / -md:768px / -lg:1024px / -xl:1280px / -2xl:1536px`。
- A18: Pass — L150-155 で `--icon-xs:12px / -sm:14px / -md:16px / -lg:20px / -xl:24px / -2xl:32px`。
- A19: Pass — L158-164 で `--z-dropdown:100 / -sticky:200 / -overlay:900 / -modal:1000 / -popover:1100 / -tooltip:1200 / -toast:2000`。
- A20: Pass — L167-170 で `--modal-w-sm:380px / -md:480px / -lg:600px / -xl:800px`（`styles-light.css` の命名規約に準拠）。
- A21: Pass — L183/189/195 で `:root[data-density="compact|comfortable|spacious"]` の3ブロックが存在。値: compact=28px/4px/13px (L184-186)、comfortable=36px/8px/14px (L190-192)、spacious=44px/12px/15px (L196-198)。全て期待値と一致。
- A22: Pass — `var(--` 参照は0件（grep結果 No matches found）。外部参照がないため自己完結（当ファイル内で未定義トークンを参照していない）。

### B. カラーコーディネーション（6項目）

- B1: Pass — `#[0-9A-Fa-f]{6}` 全ヒットを期待リストと突合。出現色: `#E9F1F6 / #FFFFFF / #F0EDE9 / #D3D0C8 / #004554 / #B2D5E2 / #2A6B7A / #5A8896 / #8BAEB9 / #44A6B5 / #5AB8C6 / #E07856 / #EA9980 / #38A169 / #276749 / #D69E2E / #92400e / #DB577B / #1c4d54 / #2d3e7a / #5a3f25 / #1f4e31 / #7A8CC4 / #629E78 / #B48764 / #B8607A / #6B9AA8`（Coastal+Accent+Semantic+Category+Chart 全て期待リスト内）。リスト外の16進カラー混入ゼロ。
- B2: Pass — `--text-tertiary` (L31) は `#5A8896`、`--text-disabled` (L32) は `#8BAEB9`。旧値 `#6B9AA8` は L71 の `--chart-seq-2` のみで出現（仕様通り許容）、`#A0BCC5` は 0件。tertiary/disabled での誤用なし。
- B3: Pass — L38-40 で `--accent-secondary:#E07856 / -light:#EA9980 / -dim:rgba(224, 120, 86, 0.12)` の3色が揃い、dim 値が期待と一致。
- B4: Pass — L51-58 で 4色相 (teal #1c4d54 / blue-violet #2d3e7a / warm brown #5a3f25 / sage green #1f4e31) が bg rgba(alpha=0.14) + text solid で揃う。bg rgba の先頭3値は facility:(68,166,181) / event:(122,140,196) / traffic:(180,135,100) / highway:(98,158,120) と全て異なり、使い回しなし。
- B5: Pass — カテゴリカル6 (L61-66) + 連続5 (L69-73) + 差分3 (L76-78) = 計14色完備。`--chart-seq-2:#6B9AA8` は用途がシーケンシャルで別トークン、混同なし（L71コメントで用途明記）。
- B6: Pass — L44 `--semantic-success-text:#276749`、L46 `--semantic-warning-text:#92400e`、L47 `--semantic-warning-bg:rgba(214, 158, 46, 0.1)` が全て定義済みで期待値と一致。

### C. タイポグラフィ・余白（8項目）

- C1: Pass — L81 の値は `'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Segoe UI', Roboto, sans-serif`。期待順序（Inter → Apple系 → 和文3種 → Segoe/Roboto/sans-serif）に完全一致。
- C2: Pass — L82 `--font-family-mono: 'SF Mono', Consolas, Menlo, monospace;` が期待文字列と完全一致。
- C3: Pass — `palt|tabular-nums` grep はヘッダコメント L14 の1件のみにヒット（注記: M0-4で実施する旨）。`body` セレクタおよび `font-feature-settings:` / `font-variant-numeric:` プロパティ宣言は存在しない。
- C4: Pass — font-size 7段 (L85-91) は全て `px` 単位。`rem / em / %` 単位は font-size 定義で0件。
- C5: Pass — L106 `--space-2xs: 2px;` が定義済み。セクション見出しコメント L105 に「バッジ padding 用」の意図が残されている（tokens.json の `$description` と整合）。
- C6: Pass — L116-119 で 4/8/12/16 の算術等差。
- C7: Pass — L123-127 の elevation-1〜5 は全て `rgba(0, 69, 84, x)` を使用。`rgba(0,0,0,...)` / `rgba(0, 0, 0,...)` は 0件（grep 対象0）。
- C8: Pass — L137-140 の cubic-bezier 係数は tokens.json L143-146 と完全一致（`0.16, 1, 0.3, 1` / `0.7, 0, 0.84, 0` / `0.87, 0, 0.13, 1` / `0.34, 1.56, 0.64, 1`）。空白パターンも一致。

### G. コード品質・保守性（8項目）

- G1: Pass — L1-16 のヘッダコメントでファイル目的、参照元（`styles-light.css` / `tokens.json v1.2.0`）、同期方針（手動）、スコープ（Light テーマのみ）を明記。
- G2: Pass — セクションコメント `^\s*/\*` grep で24件ヒット。`color.base (L20) / color.text (L28) / color.accent (L34) / color.semantic (L42) / color.category (L50) / color.chart.categorical (L60) / color.chart.sequential (L68) / color.chart.diverging (L75) / typography.font-family (L80) / typography.font-size (L84) / typography.font-weight (L93) / typography.line-height (L100) / spacing (L105) / radius (L115) / elevation (L121) / motion.duration (L129) / motion.easing (L136) / breakpoint (L142) / icon-size (L149) / z-index (L157) / modal.width (L166) / density (L172) / density mode overrides (L178)` の23セクションコメント（10件以上の要件を十分満たす）。tokens.json の階層と1対1対応。
- G3: Pass — `:root { ... }` メインブロック (L18-176) 内は各変数が1回ずつの定義。`--tbl-row-h / --space-row / --fs-density-base` は `:root` で1回、`:root[data-density="compact|comfortable|spacious"]` の各ブロックで1回ずつ再定義されるが、セレクタが異なるため仕様上の重複ではなく、density の上書き目的。同一セレクタ内での重複定義はゼロ。
- G4: Pass — `TODO|FIXME` grep 0件。空のダミー変数宣言（値が空の `--foo:;` 等）もファイル内に存在しない。
- G5: Pass — `prefers-color-scheme|data-theme` grep は0件。`data-density="..."` のみ3件ヒット（A21で検証）。ダーク対応は含まれない。
- G6: Pass — 旧エイリアス grep（`--base-page|--base-surface|--sub-primary|--sub-secondary|--shadow-sm|--shadow-md|--shadow-lg|--shadow-medium|--shadow-strong|--accent-light|--accent-dim`）は0件。M0-2 で導入予定の旧エイリアスは未混入。
- G7: Pass — ファイル総行数200行。末尾（L200）は `}` で改行あり（Read 出力に空行警告なし）。空行3連続は目視で確認できず。
- G8: Pass — インデントは2スペースで統一。タブ文字、4スペース混在ともに確認できず（Read 出力上のインデントパターンが全行 "  " の倍数）。

## 重大Claim候補
- なし
