# S-A Test Design (TD) v1

サブフェーズ: **S-A — Screen Layout の `:root` 変数を co-tokens.css 参照に整合**

作成日: 2026-04-20
参照: `docs/plan/ds-migration-governance.md` / `docs/plan/ds-migration-plan.md` Part 2.4 / OB M-A1 TD

---

## 1. 目的

`docs/mockup/screen-layout.css` の `:root`（Light）から、**co-tokens.css で解決可能な共通トークンを削除**する。SL固有のトークン（`--md-gc-bg-*`, `--cat-*`, `--shift-*`, α値独自の `--error-bg/success-bg`, 値不一致の `--warning-text`, `--night-text`, `--tooltip-*`, `--header-btn-*`, `--shadow-*`）は残留。Dark オーバーライドは co-tokens.css が Light のみのため全面維持するが、カテゴリ4色相分化（D5.2）は Dark にも適用する。

## 2. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠（重複削除の網羅） | 30 |
| B. カラー一致（見た目不変） | 15 |
| D. SL固有変数の残留 | 15 |
| E. 機能回帰・見た目不変 | 30 |
| G. コード品質・:root 縮小 | 10 |

合格: 総合 70点以上 AND 重大Claim=0

## 3. テストチェックリスト

- T1 SL `:root`（Light）から `--base-*` 系4変数が削除されている
- T2 `:root`（Light）から `--sub-primary/secondary` が削除されている
- T3 `:root`（Light）から `--accent-primary/light/dim` が削除されている
- T4 `:root`（Light）から `--text-primary/secondary/tertiary/disabled` が削除されている
- T5 `:root`（Light）から `--divider`, `--error`, `--success`, `--success-text`, `--warning`, `--warning-bg` が削除されている
- T6 `:root`（Light）から後方互換ブロックの `--bg-page/surface/surface-2/surface-3/sidebar`, `--accent` が削除されている
- T7 `--secondary: var(--sub-secondary)` は残留（co-shared-badges.css が参照するため）
- T8 SL固有 `--md-gc-bg-*`, `--cat-*`, `--shift-*` は残留
- T9 `--warning-text: #975A16` は値不一致のため残留
- T10 `--shadow-color/medium/strong` は SL 本文の `box-shadow: 0 Ypx Xpx <color>` 形式で色として使われるため、:root 定義を残留
- T11 Dark `[data-theme="dark"]` は全変数オーバーライドを維持（co-tokens.css は Light のみ）
- T12 Dark のカテゴリ色を D5.2 相当に4色相分化（teal/blue-violet/brown/green の Dark 版トーン）
- T13 Light テーマでの body 背景色が `#E9F1F6`（解決結果）
- T14 Light テーマでのカテゴリバッジが 4 色相分化で表示される（co-tokens.css 経由）
- T15 差分対象は `docs/mockup/screen-layout.css` のみ

## 4. 重大Claim

- C1 削除した変数により本文 `var(--xxx)` が未定義化
- C2 SL以外のファイル (co-* / OB / WS / QA / HTML / JS) に差分発生
- C3 `--shadow-medium/strong` を削除し box-shadow が破綻
- C4 Dark テーマが崩壊（オーバーライド欠損）
