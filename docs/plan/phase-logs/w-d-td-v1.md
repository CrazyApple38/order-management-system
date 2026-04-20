# W-D Test Design (TD) v1

サブフェーズ: **W-D — WS ボタン・モーダル・ドロワーを新DS alias と整合**

作成日: 2026-04-20

## 目的

- `.md-ws-modal-overlay/content/header/title/close/body/footer/btn/btn-primary/btn-secondary` を co-modal.css `.modal-*` と視覚統合
- `.md-ws-modal-btn` を co-buttons.css `.btn` / `.btn-primary` / `.btn-secondary` と互換
- `.md-ws-nav-btn`, `.md-ws-today-btn`, `.md-ws-assign-nav-btn`, `.md-ws-view-btn` は既存維持（ヘッダー内白ボタンは共通 `.btn` と外観要件が異なる）
- サイドパネル（`.md-ws-sidebar`）は画面常駐の inline 要素であり、`.drawer`（スライドイン overlay パネル）とは別物。alias は見送り

## 配点

| 区分 | 配点 |
|------|-----:|
| A. モーダル alias | 25 |
| B. ボタン alias | 20 |
| C. 視覚一致 | 20 |
| E. 機能回帰 | 25 |
| G. コード品質 | 10 |

合格: 70点以上

## テスト項目

- T1 co-modal.css を weekly-schedule.html から読込
- T2 `.md-ws-modal-overlay` / `.md-ws-modal-content` / `.md-ws-modal-header` / `.md-ws-modal-body` / `.md-ws-modal-footer` / `.md-ws-modal-close` が `.modal-*` と同一ルールで定義される
- T3 `.md-ws-modal-btn` が `.btn` と同一 padding / radius / transition
- T4 `.md-ws-modal-btn-primary` が `.btn-primary` と同一背景色
- T5 `.md-ws-modal-btn-secondary` が `.btn-secondary` と同一背景色
- T6 共通アイコン / ヘッダー内ボタンは既存維持
- T7 JS 未変更
- T8 視覚差分はモーダルヘッダーの `padding` と背景色（`var(--accent-light)` で一致）のみ、機能不変

## 重大Claim

- C1 モーダル開閉ロジックが破壊される
- C2 JS 側の querySelector('.md-ws-modal-overlay') が解決しなくなる
