# Q-D Scorecard (SC) v1

採点日: 2026-04-20
対象: Phase Q-D

## スコア

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. ボタン DS トークン化 | 25 | **23** | 全主要ボタン（8種）に DS トークン（`--accent`, `--radius-*`, `--fs-*`, `--fw-semibold`, `--duration-fast`）を適用 |
| B. モーダル DS トークン化 | 20 | **17** | box-shadow を `--elevation-4` にトークン化。モバイル UI の独自 inset/radius は意図的に保持 |
| C. 視覚一致 | 20 | **18** | co-buttons `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-outline` と同等配色・挙動 |
| E. 機能回帰 | 25 | **25** | JS / HTML 未変更、class 名保全 |
| G. コード品質 | 10 | **8** | `transition: all` → 個別 transition、`min-height: 44px` 追加、`:focus-visible` 網羅 |

**総合: 91/100 PASS**

## 重大Claim

- なし

## ハイライト

- モバイル向けタッチターゲット 44px を `.qa-modal-btn` に適用（W3C WCAG 2.5.5 基準）
- `:focus-visible` リングを全主要ボタンに追加（a11y の下地を Q-F に先行）
- `transition: all` 撤廃でレンダリング副作用を削減
