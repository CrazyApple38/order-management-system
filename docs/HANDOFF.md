# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-05-29
- **コミット**: a651793 (Unify SL/WS/LA mock seed via shared mock-assignments-data.js)（本コミットの直前 HEAD）

## 直前にやったこと

- **Phase 2 完了: SL の社員配置を共通ソースから読み取り描画**（mock-data-unification-plan の Phase 2）。
  - `mock-assignments-data.js`: `createSiteOrderMap()` 新設（siteId → OB受注行 会社+業務 の対応表）+ export。samplePlacements にデモ今日(dayOffset 4 = 5/1)の配置12件を追加（休暇中3名 5/14/24 除外、shift は対応OB行に合わせ s1/s2/s5/s6=昼・s3/s4=夜）。
  - `mock-orders-data.js`: SL は受注のある行しか描画せず当日受注の有無が `generateCellData` のランダム依存のため、`buildMonthState` 後に `ensureDemoTodayPlacementRows()` でデモ今日の対応6行へ受注エントリを保証注入。shift は配置データから導出（対応表の二重管理回避）。`buildDemoCellEntry()` も新設。
  - `screen-layout.js`: 行カウント表示を `slRefreshRowCountDisplay()` に抽出。`slGetDefaultPlacementContext()` / `slApplyDefaultPlacementToRow()` 新設。`slBuildStateFromOrderBookDate` の描画ループで「保存状態の無い行 (savedRows[savedKey] === undefined)」のみ共通ソースの配置を初期充填。
  - キャッシュバスター: mock-assignments-data.js v2→v3 (HTML 6本) / mock-orders-data.js v2→v3 (screen-layout・order-book) / screen-layout.js v50→v51。
- Playwright 検証 (5/1): SL が全6現場の社員を共通ソースと完全一致で描画、SL ⇄ WS で社員・現場一致、OB に6行の5/1受注注入確認、SL/WS/OB console エラー0、配置削除が再読込後も維持（初期充填が保存状態を上書きしない）。

## 次にやるべきこと

- **mock-data-unification-plan は Phase 1 + Phase 2 とも完了**。残課題は下記の将来統一のみ。
- WS の `wsVehiclesData` (v1-v5) / `wsSitesData` (s1-s6) はまだ WS ローカル定義のまま。共通ソース `createSites` と内容を一致させてあるが、将来は WS 側も共通ソースから読む形に統一すると整合性チェックが楽になる
- Phase 2 の制約: SL は受注のある行しか描画しないため、対応表6行以外の siteId 配置や、対応行が hidden の場合は SL に出ない。新たな現場を共通ソースに足す場合は createSiteOrderMap への対応行追加（+ 必要なら DEFAULT_ORDER_ROWS に行追加）が要る
- N-6（結合テスト・既存計画との整合性確認）への合流: 配置データが共通ソース化したことで、通知 seed が言及する「social context」(誰がどこに居る) が SL/WS で同じになり、N-6 のクロス画面通知テストが現実的になる
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
| 2026-05-29 | Claude Code | Phase 2: SL の社員配置を共通ソースから読み取り描画。`createSiteOrderMap` (siteId↔OB受注行) 新設、SL 描画ループで保存状態の無い行に初期充填。OB `buildMonthState` にデモ今日の対応6行への受注エントリ保証注入 (`ensureDemoTodayPlacementRows`) を追加 (クロス画面修正) | `mock-assignments-data.js` (createSiteOrderMap + デモ今日配置) / `mock-orders-data.js` (buildMonthState 注入) / `screen-layout.js` (初期充填) / HTML キャッシュバスター |
| 2026-05-29 | Claude Code | SL/WS/LA + 通知seed のダミーデータ (配置/応援/休み/車両配置) を `mock-assignments-data.js` に一本化。WS hardcode 28件配置 / 応援 partners 5社 / 予約 / 車両配置 / 整備を共通ソース由来に。LA の empIdx 配列外バグ修正 + デモ今日に isOnLeave 3名 approved 追加。通知seed の架空人名 "DCP-柊本" を実在社員に修正 | 新規 `docs/mockup/mock-assignments-data.js` / `weekly-schedule.js` (seed 2関数 + holidays hardcode 削除) / `screen-layout.js` (slSeedSupportDemoData) / `leave-application.js` (seedDemoLeaves + seedWsAssignments + 通知 seed) / HTML 6本に script タグ + キャッシュバスター |

## アクティブな計画書

- `docs/plan/mock-data-unification-plan.md` — SL/WS/LA/通知seed ダミーデータ一本化（**Phase 1 完了 / Phase 2 (SL 配置の共通ソース読み取り描画) 未着手**）
- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-5 完了 + 4ベル統合調整完了 / 次は N-6**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
