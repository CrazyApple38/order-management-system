# Q-A Test Execution (TE) v1

検証日: 2026-04-20
対象: `docs/mockup/quick-access.css` (Phase Q-A 実施後)

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | `:root` から `--base-*` 4変数削除 | PASS |
| T2 | `:root` から `--sub-primary/secondary` 削除 | PASS |
| T3 | `:root` から `--accent-primary/light/dim` 削除 | PASS |
| T4 | `:root` から `--text-*` 4変数削除 | PASS |
| T5 | `:root` から `--divider`, `--error` 削除 | PASS |
| T6 | 後方互換 `--bg-*/--accent/--secondary` 削除 | PASS |
| T7 | 重複 `:root`（通知）の `--success/--success-text/--warning` 削除 | PASS |
| T8 | `--warning-text: #975A16` / `--warning-bg: #FEFCBF`（値不一致）残留 | PASS（L1566-1567） |
| T9 | `--night-text: #DB577B`（QA固有）残留 | PASS（L9） |
| T10 | 本文 `var(--xxx)` すべて co-tokens / QA残留で解決 | PASS（`--error`,`--base-page`,`--accent-primary`,`--divider`,`--text-*`,`--sub-primary` はすべて co-tokens.css で直接 or alias 経由で解決） |
| T11 | body 背景 `#E9F1F6` で解決 | 期待通り（`--base-page` alias → `--bg-page: #E9F1F6`） |
| T12 | アクセント `#44A6B5` で解決 | 期待通り（`--accent-primary` は co-tokens.css の新DS同名定義） |
| T13 | 差分は quick-access.css のみ | PASS |
| T14 | JS qa-* querySelector 影響ゼロ | PASS（class 名未改変） |

## `:root` 変数数

- 変更前: 24（Light 基本 17 + 後方互換 7）+ 重複 `:root` 5 = 合計 29
- 変更後: 1（`--night-text`） + 重複 `:root` 2（`--warning-text`, `--warning-bg`） = 合計 3
- 削減率: 約 90%

## 残存した旧変数参照（本文）の解決先

本文の `var(--base-page)`, `var(--base-surface)`, `var(--base-surface-alt)`, `var(--base-muted)`, `var(--sub-primary)`, `var(--sub-secondary)`, `var(--accent-primary)`, `var(--accent-light)`, `var(--accent-dim)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-disabled)`, `var(--divider)`, `var(--error)`, `var(--success)`, `var(--success-text)`, `var(--warning)`, `var(--warning-text)`, `var(--warning-bg)` は、co-tokens.css が提供する legacy aliases（`--base-page → --bg-page`, `--accent-primary`（同名定義）, `--error → --semantic-error`, `--warning-text → --semantic-warning-text` 等）で全て解決。

なお、QA 側で上書きしている `--warning-text: #975A16` / `--warning-bg: #FEFCBF` は後勝ちで機能する。

## 重大Claim

- C1: なし（co-tokens.css alias / 新DS同名定義で全解決）
- C2: 値不一致の `--warning-text` / `--warning-bg` は意図的に残留
- C3: quick-access.css のみ差分
- C4: JS 非影響
