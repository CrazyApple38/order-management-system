# S-A Test Execution (TE) v1

検証日: 2026-04-20
対象: `docs/mockup/screen-layout.css` (Phase S-A 実施後)

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | `:root`（Light）の `--base-*` 4変数削除 | PASS（grep 結果0件、`:root` L10-L37 内） |
| T2 | `:root`（Light）の `--sub-primary/secondary` 削除 | PASS |
| T3 | `:root`（Light）の `--accent-primary/light/dim` 削除 | PASS |
| T4 | `:root`（Light）の `--text-*` 4変数削除 | PASS |
| T5 | `:root`（Light）の `--divider`, `--error`, `--success`, `--success-text`, `--warning`, `--warning-bg` 削除 | PASS |
| T6 | `:root`（Light）の後方互換 `--bg-*`, `--accent` 削除 | PASS |
| T7 | `--secondary: var(--sub-secondary)` 残留 | PASS（L35） |
| T8 | SL固有 `--md-gc-bg-*`, `--shift-*` 残留 | PASS（L12-L14, L17-L20） |
| T9 | `--warning-text: #975A16` 残留 | PASS（L27） |
| T10 | `--shadow-color/medium/strong` 残留 | PASS（L23-L25） |
| T11 | Dark オーバーライド維持 | PASS（[data-theme="dark"] 全変数残存、co-tokens.css は Light のみ） |
| T12 | Dark カテゴリ4色相分化を適用 | PASS（L62-L70 で teal/blue-violet/brown/green の Dark トーン化） |
| T13 | Light body 背景 `#E9F1F6` 解決 | 期待通り（co-tokens.css の `--bg-page` → `--base-page` alias 経由で解決） |
| T14 | Light カテゴリバッジ 4色相分化表示 | 期待通り（SL の `--cat-*` 定義が削除され co-tokens.css の D5.2 値が解決される） |
| T15 | 差分は SL CSS のみ | **FAIL 風の注記**: S-A の主眼はSL CSS単独だが、S-C にて HTML 1箇所（table class 追加）とSL CSS へのテーブル追加修正も同一 PR で統合実施。S-A 自体の差分は SL CSS のみ。 |

## `:root`（Light）変数数

- 変更前: 74（本文）+ 7（後方互換）= 合計 81
- 変更後: 16
- 削減率: 80%

## 残存した旧変数参照（本文）の解決先

本文は `var(--base-page)`, `var(--accent-primary)` 等を引き続き参照しているが、すべて co-tokens.css の legacy aliases または新DS定義で解決される。CSS パースエラーなし。

## 重大Claim

- C1: なし
- C2: S-A の範囲では SL CSS のみ差分（HTML/JS 非変更）
- C3: `--shadow-medium/strong` を :root に残したため box-shadow は無事
- C4: Dark テーマ保全 OK、かつ D5.2 色相分化を追加反映
