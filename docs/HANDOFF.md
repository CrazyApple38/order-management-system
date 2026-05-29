# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-05-29
- **コミット**: 4c22de5 (Make notification jump flash a full-screen spotlight)（本コミットの直前 HEAD）

## 直前にやったこと

- **Phase N-6（結合テスト・整合性確認）を実施**（`notification-refactor-plan.md` §17）。静的レビュー中心 + Playwright 実動検証。
  - **通知網羅マトリクス照合**: 全 `*CnSelfNotify` 呼出 + co-navbar 共通 seed の **2 系統**で §16.3 と照合（当初 1 系統のみ見て OB row×delete を誤検出 → 共通 seed L348/372 で網羅と訂正、OB は対応不要）。
  - **WS schedule 発火漏れを実装**: WS は D&D ドロップ経由でしか schedule 通知を出しておらず、(1) 8 削除 UI の `schedule×delete`、(2) クリック追加/候補リスト/ロングプレス/busy 移動の `schedule×add` 9 件 + `schedule×modify` 2 件 = **計 19 箇所**に発火追加。
  - **LA→SL 波及（§17.4-C）実装**: `laCnSelfNotify` / co-navbar la seed の target を画面別マップ化（LA/WS は leaveId 維持、SL は休み社員名 `empName` 軸を追加）+ affects に `screen-layout` 追加。SL cn:jump に `slCnFocusLeaveEmployee`（休み社員チップ/配置済み休バッジへフォーカス）新設。
  - **既存 3 計画書に本計画への参照リンク追記**（ws-support-partner / leave-application / leave-vehicle-schedule、§10 で予定されていたが未実施だった）。
  - キャッシュバスター: co-navbar v19→20 / weekly-schedule v16→18 / screen-layout v51→52 / leave-application v27→28。4 JS の node --check OK。
- **Playwright 検証 (5/1)**: WS schedule×delete「〇〇ビル [昼] から 田中 を削除」/ schedule×add「〇〇ビル [夜] に 田中 を配置」を実 UI で実証、SL `empName` 着地は休み社員「林」でスポットライト出現・未知社員で非発火、console error 0。

## 次にやるべきこと

- **SL画面で `OmsMockStore.getLeaveApplications()` が空 → LA通知 seed が 0件**（approval/la ベル空、§17.8）。このため「SL で実 LA 通知をクリック → 休み社員へフォーカス」のフルフローが再現できない。**SL↔LA データ連携の調査が次の優先**（通知システムとは別系統の既存課題）。
- WS `schedule×modify`（busy 移動 / 候補リスト移動）は同型実装で構文 OK だが Playwright 実 UI 未実証 → busy 状態を作って確認すると堅い。
- N-6 の §17.3 要対応はクローズ済み。次は **Phase 2.5（モックアップ検証）への通知システム登録**。
- mock-data-unification-plan は Phase 1+2 完了（残: WS `wsVehiclesData`/`wsSitesData` の共通ソース統一は将来課題）。

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
| 2026-05-29 | Claude Code | 通知ジャンプ着地演出をセル単位部分オーバーレイ → 全画面スポットライト (透明穴 + box-shadow 9999px) へ変更。`showFocusOverlay` 1関数差し替えで全画面共通化、`candidateSelector` 引数は無視に | `co-notify-panel.js` (showFocusOverlay/clearFocusOverlay) / `co-notify-panel.css` (.cn-focus-spotlight) / HTML 6本キャッシュバスター |
| 2026-05-29 | Claude Code | Phase 2: SL の社員配置を共通ソースから読み取り描画。`createSiteOrderMap` (siteId↔OB受注行) 新設、SL 描画ループで保存状態の無い行に初期充填。OB `buildMonthState` にデモ今日の対応6行への受注エントリ保証注入 (`ensureDemoTodayPlacementRows`) を追加 (クロス画面修正) | `mock-assignments-data.js` (createSiteOrderMap + デモ今日配置) / `mock-orders-data.js` (buildMonthState 注入) / `screen-layout.js` (初期充填) / HTML キャッシュバスター |
| 2026-05-29 | Claude Code | SL/WS/LA + 通知seed のダミーデータ (配置/応援/休み/車両配置) を `mock-assignments-data.js` に一本化。WS hardcode 28件配置 / 応援 partners 5社 / 予約 / 車両配置 / 整備を共通ソース由来に。LA の empIdx 配列外バグ修正 + デモ今日に isOnLeave 3名 approved 追加。通知seed の架空人名 "DCP-柊本" を実在社員に修正 | 新規 `docs/mockup/mock-assignments-data.js` / `weekly-schedule.js` (seed 2関数 + holidays hardcode 削除) / `screen-layout.js` (slSeedSupportDemoData) / `leave-application.js` (seedDemoLeaves + seedWsAssignments + 通知 seed) / HTML 6本に script タグ + キャッシュバスター |
| 2026-05-29 | Claude Code | N-6: WS schedule 発火を全配置パスに追加 (delete 8 + add 9 + modify 2 = 19箇所)。**LA通知 target を単一 `{axis:'leaveId'}` → 画面別マップ形式へ変更**（SL 用 `empName` 軸追加 + affects に screen-layout）。SL に empName 着地 `slCnFocusLeaveEmployee` 新設 | `weekly-schedule.js` (削除/追加/移動ハンドラ) / `leave-application.js` (`laCnSelfNotify` target) / `co-navbar.js` (la seed target) / `screen-layout.js` (cn:jump リスナー)。WS の leaveId 処理は画面別マップでも `weekly-schedule` キー維持で無影響 |

## アクティブな計画書

- `docs/plan/mock-data-unification-plan.md` — SL/WS/LA/通知seed ダミーデータ一本化（**Phase 1 完了 / Phase 2 (SL 配置の共通ソース読み取り描画) 未着手**）
- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-6 静的検証 + 要対応実装 完了（§17）/ 次は SL↔LA データ連携調査 → Phase 2.5 登録**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
