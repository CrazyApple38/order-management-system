# S-C Scorecard (SC) v1

採点日: 2026-04-20

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. DS準拠 | 25 | 22 | `.tbl` / `.tbl--sticky-head` / `[aria-selected]` / `[data-category]` / `[data-shift]` 全て併設。ただし class 名は残置（JS依存のため妥当） |
| C. トークン化 | 15 | 14 | thead の bg/z-index/font-weight/padding をトークンで定義 |
| D. テーブル一貫性 | 20 | 18 | `.tbl` 12規約のうち 7規約対応（sticky-head / aria-selected / data-* / base）。zebra / row--total / cell--num 等は SL 未使用 |
| E. 機能回帰 | 30 | 30 | JS 参照セレクタ維持、見た目不変 |
| G. 保守性 | 10 | 9 | 並列セレクタでコメント付き、DS 移行の意図が明示 |

**総合: 93/100 PASS**

重大Claim: なし
