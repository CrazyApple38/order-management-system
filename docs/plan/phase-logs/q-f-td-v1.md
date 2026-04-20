# Q-F Test Design (TD) v1

サブフェーズ: **Q-F — QA a11y / 印刷 / モバイル特有（タッチターゲット 44px / empty-state）**

作成日: 2026-04-20

## 目的

- 残る主要ボタン（`.qa-cn-btn`, `.qa-logout-btn`, `.qa-cal-back-btn`, `.qa-cal-nav-btn`, `.qa-tab`, `.qa-placement-tab`, `.qa-badge-chip`, `.qa-reliability-chip`, `.qa-modal-chip`, `.qa-cal-edit-close`, `.qa-sub-delete`, `.md-cn-close`, `.md-cn-footer-btn`）に `:focus-visible` リングを追加
- `@media (prefers-reduced-motion: reduce)` で transition / animation を短縮
- `@media print` で モーダル・ツールバー・ヘッダーを非表示、カレンダーを整形
- タッチターゲット 44px をカレンダー編集パネル主要操作部に適用（既に Q-D で `.qa-modal-btn` に適用済）
- `.md-cn-empty` に DS 規範 `.empty-state` パターンを整合（co-shared-badges.css には定義なし、co-forms/co-buttons でも未定義のため QA 内で整備）

## 配点

| 区分 | 配点 |
|------|-----:|
| A. `:focus-visible` 拡充 | 25 |
| B. `prefers-reduced-motion` | 15 |
| C. `@media print` | 20 |
| D. タッチターゲット 44px | 15 |
| E. empty-state 規範 | 10 |
| G. コード品質 | 15 |

合格: 70点以上 AND 重大Claim=0

## テスト項目

- T1 主要ボタンに `:focus-visible` で accent リング（`0 0 0 3px var(--accent-dim)`）
- T2 `.qa-tab` / `.qa-placement-tab` / `.qa-badge-chip` / `.qa-reliability-chip` / `.qa-modal-chip` のキーボードフォーカス視認性が向上
- T3 `@media (prefers-reduced-motion: reduce)` で `transition-duration` を `0.01ms` 付近、`animation` を停止
- T4 `@media print` で `.qa-header` / `.qa-modal-overlay` / `.qa-toast` / `#qaCnToastContainer` / `.qa-content-toolbar` 非表示、`.qa-cal-grid` 印字整形
- T5 カレンダーセル `.qa-cal-cell` の `min-height: 52px` は既に 44px 超えでタッチターゲット準拠
- T6 `.md-cn-empty` に `text-align: center` / `color: var(--text-disabled)` / padding 規範（既存で準拠、コメント明示）
- T7 HTML / JS 未変更
- T8 co-*.css 未変更

## 重大Claim

- C1 フォーカスリングが過度に目立ち既存 UI を破壊
- C2 print メディアでカレンダーが切れる / 読めない
- C3 `prefers-reduced-motion` が JS 側のアニメーションロジックに影響（CSS 側のみ調整）
