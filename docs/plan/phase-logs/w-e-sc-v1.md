# W-E Scorecard (SC) v1

採点日: 2026-04-20

## スコア

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. バッジ alias | 25 | **19** | `.md-ws-emp-tag` のトークン化済。site-chip/candidate-item は既存維持（意味論的カテゴリ不一致） |
| B. 視覚一致 | 20 | **18** | `.bt-drag-tag` と padding/gap/radius/transition 整合 |
| C. Dark 対応 | 15 | **13** | Dark :root で accent/warning/error 色オーバーライド、視認可 |
| E. 機能回帰 | 30 | **30** | JS 未変更、class 名保全 |
| G. コード品質 | 10 | **8** | 主要バッジのトークン化完了 |

**総合: 88/100 PASS**

## 重大Claim

- なし

## メモ

`.md-ws-site-chip`（セル内現場チップ）は `padding: 3px 6px` など独自の密度設定が必要なため `.bt-cell-tag` への完全統合は見送り。`.md-ws-candidate-item` は「リスト行」であってバッジカテゴリではないため対象外。監督バッジ（`.bt-supervisor`）は WS に該当要素が存在しないため新設しない。
