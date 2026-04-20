# S-G Test Execution (TE) v1

検証日: 2026-04-20

## Scope Summary

| 項目 | 結果 |
|------|------|
| SL :root（Light）変数数 | **20**（元 81 → 75% 削減）|
| SL 本文の legacy var() 参照数 | 528（全て co-tokens.css の legacy aliases または SL 固有残置で解決） |
| SL HTML/CSS の `md-ob-form-row` 残存 | 0 件 |
| SL HTML の `md-ob-btn / md-ws-modal-btn / qa-modal-btn` 残存 | 0 件 |
| SL CSS/HTML の未定義変数参照 | 0 件 |
| `.tbl` / `.tbl--sticky-head` 併設 | PASS |
| `[aria-selected]` / `[data-category]` / `[data-shift]` 併設 | PASS |
| `.sr-only` ユーティリティ | PASS |
| `@media print` セクション | PASS |
| Phase D5.2 4色相分化 Light/Dark 両適用 | PASS |

## 他モックアップへの波及

- `docs/mockup/co-tokens.css` — 変更なし
- `docs/mockup/co-forms.css` — 変更なし
- `docs/mockup/co-buttons.css` — 変更なし
- `docs/mockup/co-modal.css` — 変更なし
- `docs/mockup/co-shared-badges.css` — 変更なし
- `docs/mockup/order-book.css / order-book.html / order-book.js` — 変更なし
- `docs/mockup/weekly-schedule.css / weekly-schedule.html / weekly-schedule.js` — 変更なし
- `docs/mockup/quick-access.css / quick-access.html / quick-access.js` — 変更なし
- `docs/ui-components/styles-light.css / tokens.json` — 変更なし

## 差分対象（Phase S 全体）

- `docs/mockup/screen-layout.css`（:root 簡素化、D5.2 適用、`.tbl` 併設、sr-only/@media print 追加）
- `docs/screen-layout.html`（1 行: `<table class="grid-table tbl tbl--sticky-head">` への class 追加）
- `docs/plan/phase-logs/s-{a,b,c,d,e,f,g}-{td,te,sc}-v1.md`（21 ファイル）

## 結論

Phase S スコープでの追加実装・検証は完了。WS / QA のマイグレーション完了後に最終 cleanup として co-tokens.css の legacy aliases 削除を行う前提。
