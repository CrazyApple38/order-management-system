# Q-D Test Design (TD) v1

サブフェーズ: **Q-D — QA ボタン・モーダルを co-buttons.css / co-modal.css と整合**

作成日: 2026-04-20

## 目的

- `.qa-login-btn` / `.qa-add-client-submit` / `.qa-add-client-cancel` / `.qa-modal-btn` / `.qa-modal-btn-save` / `.qa-modal-btn-cancel` / `.qa-header-save-btn` / `.qa-header-delete-btn` / `.qa-map-preview-btn` / `.qa-section-bar-btn` を co-buttons.css `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-outline` と視覚整合
- `.qa-modal-overlay` / `.qa-modal` / `.qa-modal-header` / `.qa-modal-body` / `.qa-modal-footer` を co-modal.css `.modal-*` と視覚整合（ただしモバイル向け独自の inset padding / border-radius: 14px は保持）

JS は `qa-*` クラスで多数の querySelector / innerHTML を持つため、**クラス名は全て保全**。CSS 側で DS トークン化（`var(--accent)`, `var(--radius-*)`, `var(--space-*)`）のみ適用する。

co-modal.css を QA HTML から読み込むか判断 → QA の `.qa-modal-*` は既存実装が DS 準拠（accent-primary ヘッダーなど）に近いため、**co-modal.css は読み込まず**、CSS トークン化のみで対応（モバイル向けの inset 配置・コンパクトヘッダーを維持）。

## 配点

| 区分 | 配点 |
|------|-----:|
| A. ボタン DS トークン化 | 25 |
| B. モーダル DS トークン化 | 20 |
| C. 視覚一致 | 20 |
| E. 機能回帰（JS 非破壊） | 25 |
| G. コード品質 | 10 |

合格: 70点以上 AND 重大Claim=0

## テスト項目

- T1 `.qa-login-btn` の色値 / border-radius を DS トークンで置換（`var(--accent)`, `var(--radius-md)` 相当）
- T2 `.qa-modal-btn-save` が `.btn-primary` と同一背景色系
- T3 `.qa-modal-btn-cancel` が `.btn-secondary` と同一背景色系
- T4 `.qa-header-delete-btn` が `.btn-danger` と同一色相
- T5 `.qa-header-save-btn` が `.btn-primary` と同一背景色系
- T6 `.qa-map-preview-btn` / `.qa-add-client-submit` が accent-primary 塗り
- T7 `.qa-modal-overlay` の overlay が DS modal overlay と整合（rgba 値は既存維持、z-index は `var(--z-modal)`相当）
- T8 `.qa-modal` の box-shadow / border-radius がトークン化
- T9 JS の class 名参照（`.qa-modal-chip`, `.qa-modal-btn-*` 等）全て有効
- T10 HTML の class 名未変更
- T11 co-buttons.css / co-modal.css 未変更
- T12 モバイル UI の特性（inset padding: 16px / border-radius: 14px）は維持

## 重大Claim

- C1 JS の class 参照が破れ機能破壊
- C2 co-buttons.css / co-modal.css / 他ファイルに差分発生
- C3 ボタン配色の視覚差異が大きく、UIの一貫性が崩れる
