# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.7)
- **日付**: 2026-05-28
- **コミット**: f0a2b7e (Add OB row-deletion recovery toggle and row-level notification demos)（本コミットの直前 HEAD）

## 直前にやったこと

- OB/SL から WS の変更通知の「WSで開く ↗」クロスジャンプをクリックすると遷移はするが**フラッシュが発火しない**バグを修正。原因は `co-navbar.js` の seed が `target.weekly-schedule.value` に OB のサイト名（例 `商業施設A > 設備点検`）を入れていたが、WS のサンプルサイト（`〇〇ビル` / `△△マンション` / `国道1号線 舗装工事` 等の s1〜s6）と一致せず、[weekly-schedule.js:5594](docs/mockup/weekly-schedule.js#L5594) `cn:jump` ハンドラ内の `wsCnFindSiteByLabel(target.value)` が null を返して siteId 空で早期 return していたこと
- 修正方針: WS発信の seed (`items.ws`) を WS サイトに組み替え、SL発信 (`items.sl`) は target.weekly-schedule を削除（OB/WS のモックサイト名が共有されないため WS への正確なジャンプは提供できない）
  - items.ws: main を `〇〇株式会社 / 〇〇ビル｜<emp> を配置` に、target を `{ 'weekly-schedule': { axis:'wsCell', value:'s1', date: currentDateKey } }` に変更（axis:'wsCell' なら siteId を直接渡せて wsCnFindSiteByLabel を経由せず確実に解決）。affects も `['weekly-schedule']` のみ
  - items.sl[0] 受注追加 / items.sl[1] employee place: target から `weekly-schedule` キーを削除、affects から `'weekly-schedule'` を削除
- Playwright で DOMTokenList hook を仕込んで timeline を計測。click→go から T+566ms に `cn-focus-target × 2 + cn-focus-dim × 131` が DOM に付与され、T+2573ms に 2秒タイマーで自動クリアされることを確認

## 次にやるべきこと

- **N-6（結合テスト・既存計画との整合性確認）へ進む**（前回からの継続）
- OB/SL/WS のモックサイト名が共有されていない件は根本未解決（命名揺れ）。今回は WS発信の通知だけ WS サイトを直接指す形で回避したが、後で OB sampleRows と WS sites のマッピング表（または共通サイトマスタ）を整備すると、`axis:'siteName'` 経由のクロスジャンプも自然に動くようになる
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
| 2026-05-28 | Claude Code | OB行削除→復旧トグルを追加（localStorageフラグ単一真実源 + 汎用 `cn:action` ボタン機構 + `item.locked`/`item.actions` 表示 + デモ削除行 `OMS_DEMO_DELETED_ROW`） | `co-navbar.js`(`mdNavRefreshBells`) / `co-notify-panel.js`/`.css` / `order-book.js`(グリッド増減・cellData再マップ) / `mock-orders-data.js` |
| 2026-05-28 | Claude Code | WSクロスジャンプの seed を OBサイト名 → WS実サイト(`axis:'wsCell' / value:'s1'`) へ変更、items.sl の target.weekly-schedule を削除（OB/WSモックサイト名が共有されないため） | `co-navbar.js` `mdNavBuildBellItems` の items.sl / items.ws |

## アクティブな計画書

- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-5 完了 + 4ベル統合調整完了 / 次は N-6**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
