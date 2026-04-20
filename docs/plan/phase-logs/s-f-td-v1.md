# S-F Test Design (TD) v1

サブフェーズ: **S-F — Screen Layout a11y + 印刷**

作成日: 2026-04-20

## 1. 目的

SL に以下を追加:

1. `.sr-only` ユーティリティ（スクリーンリーダー専用）
2. `.print-only` / `.no-print` のトグル
3. `@media print` ルール（テーブル sticky 解除、サイドパネル・モーダル非表示、A4 横向き、白黒最適化）

a11y: S-C で追加済みの `tr[aria-selected="true"]` セレクタにより、JS が `aria-selected` を切替えても見た目が一致する。

## 2. 配点

| 区分 | 配点 |
|------|-----:|
| F. アクセシビリティ | 40 |
| 印刷最適化 | 40 |
| E. 機能回帰 | 15 |
| G. 保守性 | 5 |

## 3. チェックリスト

- T1 SL CSS に `.sr-only` ブロックが存在（position: absolute + clip: rect 方式）
- T2 SL CSS に `@media print { ... }` セクションが存在
- T3 print 内で `*/*::before/*::after` が `color: #000 !important; background: transparent !important; box-shadow: none !important` にリセット
- T4 print 内で `.side-panel, .md-modal-overlay, .toolbar, .sort-modal, .md-cn-modal` 等の画面UIが `display: none`
- T5 print 内で `.grid-table / .tbl` の thead が `position: static; display: table-header-group`
- T6 print 内で `grid-container { overflow: visible }`（sticky 解除）
- T7 print 内で `tr[aria-selected="true"]` の outline が解除
- T8 `.print-only` が画面モードでは `display: none !important`
