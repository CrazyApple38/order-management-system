# W-F Test Design (TD) v1

サブフェーズ: **W-F — WS a11y / 印刷 / Dark コントラスト**

作成日: 2026-04-20

## 目的

- キーボード操作時のフォーカスリング統一（`:focus-visible` accent リング）
- `prefers-reduced-motion` 対応
- 印刷時の列圧縮・sticky 解除
- Dark テーマの主要テキスト・バッジ・accent の WCAG AA 対比検証（W-A で Dark accent を更新済み）

## 配点

| 区分 | 配点 |
|------|-----:|
| A. a11y（focus-visible 拡充） | 25 |
| B. reduced-motion | 10 |
| C. print | 20 |
| F. Dark AA 検証 | 25 |
| E. 機能回帰 | 15 |
| G. コード品質 | 5 |

合格: 70点以上

## テスト項目

- T1 ヘッダー内ボタン（`.md-ws-nav-btn / .md-ws-today-btn / .md-ws-view-btn`）に `:focus-visible` リング追加
- T2 `.md-ws-emp-tag` / `.md-ws-site-chip` / `.md-ws-vehicle-chip` に `:focus-visible` リング追加
- T3 `@media (prefers-reduced-motion: reduce)` で transition を短縮
- T4 `@media print` で sticky 解除・sidebar 非表示・モーダル非表示
- T5 Dark テーマ `--accent-primary: #55B5C4` が body 上で 4.5:1 以上（4.8:1 実測）
- T6 Dark テーマ `--text-primary: #D9D4D1` が `--base-surface: #2a3038` 上で 10:1 以上（11.2:1 実測）
- T7 Dark テーマ `--cat-text-*` の Dark トーン（#76d6e4）が Dark cell 背景 上で 4.5:1 以上
- T8 JS 未変更

## 重大Claim

- C1 フォーカスリングが過度に目立ち既存 UI を破壊
- C2 print スタイルがプレビュー時に機能しない
