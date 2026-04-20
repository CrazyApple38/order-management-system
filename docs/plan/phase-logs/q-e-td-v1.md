# Q-E Test Design (TD) v1

サブフェーズ: **Q-E — QA カード・バッジを新DS（co-shared-badges / elevation トークン）と整合**

作成日: 2026-04-20

## 目的

- `.qa-client-card` の box-shadow を `var(--elevation-2/3)` トークン化
- `.qa-cn-badge`（変更通知バッジ）を `.bt-count` / `.bt-notify-badge` 相当の DS 規範に整合
- `.qa-badge-parent` / `.qa-badge-chip` / `.qa-modal-chip` / `.qa-reliability-chip` の視覚整合（既存値は DS に近いのでトークン化のみ）
- カテゴリ色分化は QA 対象外（事前確定済）

JS は `qa-client-card.expanded` / `.qa-cn-badge` 等の class 操作を多数含むため **クラス名は全保全**。CSS トークン化のみ適用。

## 配点

| 区分 | 配点 |
|------|-----:|
| A. カード elevation トークン化 | 25 |
| B. バッジ / chip 整合 | 20 |
| C. 視覚一致 | 20 |
| E. 機能回帰 | 25 |
| G. コード品質 | 10 |

合格: 70点以上 AND 重大Claim=0

## テスト項目

- T1 `.qa-client-card` の box-shadow が `var(--elevation-2)` 付近にトークン化
- T2 `.qa-client-card:active` の box-shadow が `var(--elevation-3)` 付近にトークン化
- T3 `.qa-cn-badge` の背景色が `var(--error)` で解決
- T4 `.qa-badge-chip.active` / `.qa-modal-chip.active` / `.qa-reliability-chip.active` が `var(--accent)` 塗り + `#fff`
- T5 `.qa-badge-parent` が `var(--accent-dim)` 背景 + `var(--accent)` 文字
- T6 `.qa-add-client-btn` の破線ピル `var(--accent)` がトークン化
- T7 JS の class 参照全て有効
- T8 HTML 未変更、co-shared-badges.css 未変更
- T9 カテゴリ色分化（cat-bg-facility 等）は QA で未使用（事前確定）

## 重大Claim

- C1 JS の class 参照が破れる
- C2 co-shared-badges.css / 他ファイルに差分発生
- C3 elevation トークン化で影の見え方が大幅に変化
