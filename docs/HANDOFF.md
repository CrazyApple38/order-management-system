# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.7)
- **日付**: 2026-05-27
- **コミット**: d6feab8 (Refine N-5 cross-screen flash with domain priority rules)

## 直前にやったこと

- **N-5 クロス画面ジャンプの新タブ問題を修正**: `window.open(url, '_blank')` で新タブが量産される問題を解消し、`window.location.href = url` の同タブ遷移に変更
- `dispatchJumpFromUrl` に `history.replaceState` を追加 — リロード時の再発火と URL の `cnJump` 汚染を防ぐためのクリーンアップ
- `co-notify-panel.js?v=15 → ?v=16` バンプ（6 HTML）
- XAMPP localhost + Playwright で同タブ遷移 + 着地フラッシュ + cnJump URL クリーンを実機確認

## 次にやるべきこと

- 上記修正をコミット予定 (`co-notify-panel.js` + 6 HTML / 約 17 行差分)
- **N-6（結合テスト・既存計画との整合性確認）へ進む**
- 受注変更で SL/WS を現在画面優先にする場合は、OB通知側に画面別 `target.screen-layout` / `target.weekly-schedule` を付与できるだけの可視日付判定を追加する
- 車両配置と休暇競合は、LA側の `vehicleSchedule` / `leaveId` target を生成できるタイミングで補助フラッシュ対象へ拡張する

## 触らないでほしいもの / 注意事項

- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと
- N-5 の別画面遷移は URL パラメータ `cnJump` に JSON を載せる。**同タブ遷移** で着地し `history.replaceState` で cnJump を除去する設計（2026-05-27 Claude Code 修正）。`window.open(_blank)` には戻さないこと
- 共通パネルは `affects[]` だけではフラッシュしない。現在画面用 `target` が解決できる場合のみ即時フラッシュする

## 構造的変更の警告

| 日付 | 担当 | 変更内容 | 影響範囲 |
|------|------|---------|---------|
| 〜2026-05-25 | Codex | ダミーデータを HTML ハードコード → `mock.oms.state.v1` 共通ストアへ移行 | 各画面のシード通知 / SelfNotify の target / 通知ジャンプ先 DOM |
| 2026-05-27 | Codex | 通知デモ seed を固定文字列 → 共通モックデータ参照へ変更 | `co-navbar.js` 初期ベル / OB・SL・WS seed / HTML script 読み込み順 |
| 2026-05-27 | Codex | 通知クリック判定を `affects[]` 依存 → `domain` / `primaryPage` / 画面別 `target` 解決へ変更 | `co-notify-panel.js` / 各画面 SelfNotify / admin-notify 優先度表 |

## アクティブな計画書

- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-5 完了 / 次は N-6**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
