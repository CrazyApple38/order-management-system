# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-05-27
- **コミット**: bcf5b7f

## 直前にやったこと

- N-5 クロス画面フラッシュを `domain` / `primaryPage` / 画面別 `target` 解決ルールへ整理
- `orderId` など単一 target を全画面で誤解釈しないよう、target 軸ごとの所有画面を共通パネルで判定
- SL の変更差分を `diffs[]` の構造化表示へ変更し、新値を上段・旧値を赤の取り消し線で表示
- `admin-notify.html` と `notify-compare` に「優先度ルール」タブ / 表を追加
- `node --check` と XAMPP `localhost` ブラウザ確認で、OB同画面フラッシュ・SL上のOB通知展開・admin優先度表を確認

## 次にやるべきこと

- **N-6（結合テスト・既存計画との整合性確認）へ進む**
- N-5 は Codex 側で完了済み。次は通知イベント網羅、既存計画（ws-support-partner / leave-application / leave-vehicle-schedule 等）との整合性確認を行う
- 受注変更で SL/WS を現在画面優先にする場合は、OB通知側に画面別 `target.screen-layout` / `target.weekly-schedule` を付与できるだけの可視日付判定を追加する
- 車両配置と休暇競合は、LA側の `vehicleSchedule` / `leaveId` target を生成できるタイミングで補助フラッシュ対象へ拡張する

## 触らないでほしいもの / 注意事項

- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと
- N-5 の別画面遷移は URL パラメータ `cnJump` に JSON を載せる。ページ側リスナーは `detail.inContext === true` の場合のみ処理すること
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
