# W-C Test Execution (TE) v1

検証日: 2026-04-20

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | `.md-ws-grid` / `.tbl-grid` display: grid | PASS |
| T2 | 日付ヘッダー sticky top:0 | PASS（`.md-ws-date-header` z-index: 12） |
| T3 | 昼夜サブヘッダー sticky | PASS（`.md-ws-shift-header` z-index: 11） |
| T4 | 名前セル sticky left:0 | PASS（z-index: 10） |
| T5 | 左上コーナー 2重 sticky | PASS（`.md-ws-corner-row1` z-index: 30） |
| T6 | `.md-ws-today-col` 左 3px accent border | PASS |
| T7 | CSS パースエラーなし | PASS |
| T8 | JS 未変更 | PASS |

## 追加実装

- `.md-ws-grid-wrapper` / `.md-ws-grid` に新DS BEM alias（`.tbl-grid-wrapper` / `.tbl-grid`）を併記。
- 2段 sticky の意図をコメントで明文化。

## 重大Claim

- なし
