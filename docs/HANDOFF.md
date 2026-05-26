# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-05-27
- **コミット**: d4142dc (Document shared mock data and notification ID references)

## 直前にやったこと

- N-5 実装前の前提整理として、通知デモデータの固定文言を共通モックデータ由来へ変更
- `co-navbar.js` の全ベル初期デモ通知 / 履歴タブを、`co-mock-store.js`・`mock-orders-data.js`・`demo-data.js` の実値から組み立てる形に変更
- OB / SL / WS の画面別 seed 通知を、表示中データ・配置データ・応援予約データから生成する形に変更
- 4画面 HTML で `co-mock-store.js` を `co-navbar.js` より先に読み込むよう調整し、cache-buster を更新
- `docs/plan/notification-refactor-plan.md` の現在地と次確認ポイントを同期

## 次にやるべきこと

- **N-5（クロス画面フラッシュ）は Codex 側で完遂予定** — Claude Code 側では着手しない
- N-5 本実装では、今回動的化した `affects` / `target` を前提に、ページ別 target 解決・URLパラメータ起動・同画面フラッシュリスナーを接続する
- 設計は `docs/plan/notification-refactor-plan.md` の §6（クロス画面フラッシュ設計）と §14.3（`cn:jump` 拡張仕様）を参照
- N-5 完了後、N-6 結合テスト等を Claude Code に戻すか Codex で継続するかはユーザーが判断

## 触らないでほしいもの / 注意事項

- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと

## 構造的変更の警告

| 日付 | 担当 | 変更内容 | 影響範囲 |
|------|------|---------|---------|
| 〜2026-05-25 | Codex | ダミーデータを HTML ハードコード → `mock.oms.state.v1` 共通ストアへ移行 | 各画面のシード通知 / SelfNotify の target / 通知ジャンプ先 DOM |
| 2026-05-27 | Codex | 通知デモ seed を固定文字列 → 共通モックデータ参照へ変更 | `co-navbar.js` 初期ベル / OB・SL・WS seed / HTML script 読み込み順 |

## アクティブな計画書

- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-5 進行中 / Codex 担当**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
