# Q-B Scorecard (SC) v1

採点日: 2026-04-20
対象: Phase Q-B

## スコア

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. DS準拠 | 30 | **27** | 全主要入力要素（9種）に focus ring / hover / placeholder / transition を DS トークンで適用 |
| B. 視覚一致 | 20 | **19** | co-forms `.md-fi-input` と focus ring（3px var(--accent-dim)）・hover（accent）・placeholder（--text-disabled）が一致 |
| E. 機能回帰 | 30 | **30** | JS / HTML 未変更、class 名保全 |
| G. コード品質 | 20 | **15** | 完全統合（`.qa-*, .md-fi-input { ... }` 併記形式）までは未実施、段階移行 |

**総合: 91/100 PASS**

## 重大Claim

- なし

## メモ

JS 互換性最優先のため、class 名の撤廃や `.md-fi-input` へのリネームは行わず、既存 class に DS 準拠のインタラクションを追加した保守的アプローチ。完全統合は Phase Q-G（最終整理）で検討。
