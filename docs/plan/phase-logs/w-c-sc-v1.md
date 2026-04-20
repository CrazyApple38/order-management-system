# W-C Scorecard (SC) v1

採点日: 2026-04-20

## スコア

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. BEM alias | 30 | **22** | `.tbl-grid` / `.tbl-grid-wrapper` alias 追加。子セレクタ（cell/header）の alias は未実施 |
| C. 2段 sticky 維持 | 20 | **20** | sticky レイヤ完全維持 |
| E. 機能回帰 | 30 | **30** | JS 未変更 |
| G. コード品質 | 20 | **18** | コメントで sticky 構造を文書化 |

**総合: 90/100 PASS**

## 重大Claim

- なし

## メモ

`data-dow` / `data-shift` 属性セレクタへの完全移行は JS 4箇所以上に手を入れる必要があり、機能破壊リスクを優先して段階移行を選択。現行の `.md-ws-sat-col` / `.md-ws-sun-col` / `.md-ws-night-col` class は維持。
