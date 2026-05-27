# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-05-27
- **コミット**: 8d8fd32 (Restore SL modify flash to per-cell diff display)

## 直前にやったこと

- 共通メニューバーの通知ベルを 7 種類から 4 分類（受注・業務変更 / 配置・予定変更 / 申請・承認 / マスタ・システム）へ統合
- 旧ベルID `ob/sl/ws/la/pending/vehicle/master` は API 互換として残し、`co-notify-panel.js` で統合先へ正規化
- パネル内に発信元バッジを追加（受注簿 / 配置表 / 週間予定 / 休暇申請 / 車両予定 / マスタ）
- 管理者のベルアイコン選定（`admin-notify.html` → `notify-compare.html#matrix`）も4分類タイルへ更新
- ページ側初期シードが共通シードを上書きしないようにし、XAMPP + Playwright で配置表/週間予定の `配置・予定変更` 内容一致を確認済み
- 別発信元通知でも現在画面で対象日・対象行が解決できる場合は、対象以外を薄暗くする通知フォーカスを出しつつ、パネルを展開したまま発信元画面ボタンを表示するように変更
- 通知ジャンプの点滅アニメーションを廃止し、`coNotifyFocusOverlay` で対象行/セル以外を2秒フェードの薄黒オーバーレイ化。フェード中クリックで即解除
- OB固定列の通知フォーカス漏れを修正。`.tbl-grid__cell` は疑似要素ではなく inset shadow で暗くし、sticky列の位置指定を維持
- OBの受注セル通知は `target.day/subIndex` を保持するように修正。日付指定がある通知は行全体ではなく該当セルのみを残してフォーカスする
- 通知カード文言を整理。OBは受注セルの変更通知のみ対象日バッジを表示し、行追加/削除・契約先名/現場名変更では出さない。SL/WS/LAは対象日が分かる通知に `5/2（土）` 形式の日付バッジを表示。タイトルは `契約先 / 業務名｜変更内容`、サブ情報は `アカウント ・ 日付/時刻` へ寄せた

## 次にやるべきこと

- 4ベル統合調整をコミット予定（`co-navbar.js` / `co-notify-panel.js` / `co-notify-panel.css` / 7 HTML / `notify-compare.*` / 計画書）
- **N-6（結合テスト・既存計画との整合性確認）へ進む**
- N-6 では、統合後ベル単位の既読・履歴・クロス画面ジャンプが既存イベント網羅表と矛盾しないか確認する
- N-6 では、`週間予定` → SL 同日通知フォーカス / 別日非フォーカス、LA → WS など別発信元の互換ターゲットも結合確認する
- 受注変更で SL/WS を現在画面優先にする場合は、OB通知側に画面別 `target.screen-layout` / `target.weekly-schedule` を付与できるだけの可視日付判定を追加する
- 車両配置と休暇競合は、LA側の `vehicleSchedule` / `leaveId` target を生成できるタイミングで補助フラッシュ対象へ拡張する

## 触らないでほしいもの / 注意事項

- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと
- N-5 の別画面遷移は URL パラメータ `cnJump` に JSON を載せる。**同タブ遷移** で着地し `history.replaceState` で cnJump を除去する設計（2026-05-27 Claude Code 修正）。`window.open(_blank)` には戻さないこと
- 共通パネルは `affects[]` だけでは通知フォーカスしない。現在画面用 `target` が解決できる場合のみ即時フォーカスする
- 通知ベルは表示上4分類だが、画面側 SelfNotify は旧IDで呼んでよい。共通シード済みの初期通知はページ側 `setItems('sl'|'ws'...)` で上書きしない。実操作の `addItem(...)` は統合ベルへ追加される
- 発信元/主担当画面が現在画面と異なる通知は、現在画面でフォーカスできてもパネルを閉じない。アコーディオンを展開し、発信元画面で開くボタンを残す

## 構造的変更の警告

| 日付 | 担当 | 変更内容 | 影響範囲 |
|------|------|---------|---------|
| 〜2026-05-25 | Codex | ダミーデータを HTML ハードコード → `mock.oms.state.v1` 共通ストアへ移行 | 各画面のシード通知 / SelfNotify の target / 通知ジャンプ先 DOM |
| 2026-05-27 | Codex | 通知デモ seed を固定文字列 → 共通モックデータ参照へ変更 | `co-navbar.js` 初期ベル / OB・SL・WS seed / HTML script 読み込み順 |
| 2026-05-27 | Codex | 通知クリック判定を `affects[]` 依存 → `domain` / `primaryPage` / 画面別 `target` 解決へ変更 | `co-notify-panel.js` / 各画面 SelfNotify / admin-notify 優先度表 |
| 2026-05-27 | Codex | 通知ベル7種 → 4分類へ統合し、旧ベルIDをエイリアス化 | `co-navbar.js` / `co-notify-panel.js` / 各画面 `addItem/setItems` / 管理者アイコン選定 |
| 2026-05-27 | Codex | 通知ジャンプ演出を点滅 → 対象外セル/行の2秒フェードオーバーレイへ変更 | `co-notify-panel.js/css` / OB・SL・WS・LA の `cn:jump` 着地処理 |

## アクティブな計画書

- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-5 完了 + 4ベル統合調整完了 / 次は N-6**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
