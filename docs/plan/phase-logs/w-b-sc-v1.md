# W-B Scorecard (SC) v1

採点日: 2026-04-20
対象: Phase W-B

## スコア

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. DS 準拠 | 30 | **25** | 既存定義が co-tokens 準拠のため追加改善は hover/placeholder/transition のみ |
| B. 視覚一致 | 20 | **19** | `.md-fi-input` と focus ring / radius / padding / placeholder が一致 |
| E. 機能回帰 | 30 | **30** | JS 未変更、class 名保全 |
| G. コード品質 | 20 | **15** | 完全統合（`.md-ws-pac-input, .md-fi-input { ... }` 形式）までは未実施、段階移行を選択 |

**総合: 89/100 PASS**

## 重大Claim

- なし

## メモ

JS 互換性最優先のため、class 名の撤廃や `.md-fi-input` へのリネームは行わず、既存 class に DS 準拠のインタラクションのみ追加した保守的アプローチ。完全統合は Phase W-G（最終整理）で検討。
