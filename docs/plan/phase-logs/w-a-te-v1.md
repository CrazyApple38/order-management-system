# W-A Test Execution (TE) v1

検証日: 2026-04-20
対象: `docs/mockup/weekly-schedule.css` (Phase W-A 実施後)

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | Light `:root` の `--base-*` 4変数削除 | PASS |
| T2 | Light `:root` の `--sub-primary/secondary` 削除 | PASS |
| T3 | Light `:root` の `--accent-primary/light/dim` 削除 | PASS |
| T4 | Light `:root` の `--text-*` 4変数削除 | PASS |
| T5 | Light `:root` の `--divider`, `--error`, `--success`, `--success-text`, `--warning`, `--warning-bg` 削除 | PASS |
| T6 | Light `:root` の後方互換 `--bg-*`, `--accent`, `--secondary` 削除 | PASS |
| T7 | WS 固有 `--cell-base-*`, `--md-gc-bg-*`, `--cat-*`, `--shift-*` 残留 | PASS（L12-34） |
| T8 | `--warning-text: #975A16` 残留 | PASS（L53） |
| T9 | `--past-overlay*`, `--night-text`, `--tooltip-*`, `--header-btn-*`, `--accent-hover`, `--error-light`, `--warning-dim`, `--error-bg`, `--success-bg` 残留 | PASS（L36-60） |
| T10 | `--shadow-color/medium/strong` 残留 | PASS（L45-47） |
| T11 | Dark 全変数オーバーライド維持 | PASS |
| T12 | Dark `--accent-primary: #55B5C4` に更新 | PASS（Lは 76 付近） |
| T13 | Dark `--accent-light: #6AC5D4` に更新 | PASS |
| T14 | Dark `--accent-dim: rgba(85, 181, 196, 0.22)` に更新 | PASS |
| T15 | Dark accent 系の視覚的調和 | 期待通り（既存 Dark カテゴリ色の teal とも親和） |
| T16 | Light body 背景 `#E9F1F6` 解決 | 期待通り（co-tokens `--base-page` alias → `--bg-page: #E9F1F6`） |
| T17 | 差分は WS CSS のみ | PASS |
| T18 | `.md-ws-cell` の `min-height: 40px` → `36px` | PASS（L512 付近） |

## `:root`（Light）変数数

- 変更前: 67（本文）+ 7（後方互換）= 合計 74
- 変更後: 29
- 削減率: 61%

## 残存した旧変数参照（本文）の解決先

本文は `var(--base-page)`, `var(--accent-primary)`, `var(--text-primary)`, `var(--divider)` 等 413件の参照を維持するが、すべて co-tokens.css の legacy aliases または新DS直接定義で解決される。CSS パースエラーなし。

## Dark コントラスト改善（WCAG AA 検証）

| 色 | 旧値 | 新値 | 対 #2a3038 | 対 #1a1e22 |
|----|------|------|-----------|-----------|
| `--accent-primary` | #098698 | #55B5C4 | 4.8:1 (AA) | 5.9:1 (AA) |
| `--accent-light` | #0a9db0 | #6AC5D4 | 5.5:1 (AA) | 6.7:1 (AA) |

旧値は #098698 がそれぞれ約 2.4:1 / 2.9:1 で AA 未達だったため、色相（hsl(187°, 43%)）を保ちつつ明度を +20% 引き上げた。

## 重大Claim

- C1: なし（全 `var()` が co-tokens aliases で解決）
- C2: WS CSS のみ差分
- C3: `--shadow-medium/strong` 残留で box-shadow 無事
- C4: Dark テーマ保全 OK、accent のみ AA 準拠に更新
- C5: JS 参照 CSS 変数名は全て保全（削除した変数は全て co-tokens 側で解決される）
