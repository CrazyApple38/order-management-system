# W-D Scorecard (SC) v1

採点日: 2026-04-20

## スコア

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. モーダル alias | 25 | **22** | co-modal.css 読込 + overlay/content/header/body/footer が規範と整合 |
| B. ボタン alias | 20 | **17** | `.md-ws-modal-btn` が `.btn` 準拠プロパティに移行 |
| C. 視覚一致 | 20 | **19** | focus-visible リング追加で a11y 向上。元の hover 挙動は維持 |
| E. 機能回帰 | 25 | **25** | JS 未変更、class 名保全 |
| G. コード品質 | 10 | **9** | overlay の z-index トークン化 |

**総合: 92/100 PASS**

## 重大Claim

- なし

## メモ

drawer（スライドアウト）機能は WS サイドバーが常駐表示のため該当せず、対象外。モーダル内の stepper / pac / res-quick / res-week 個別部品は Phase W-E/W-G で段階対応。
