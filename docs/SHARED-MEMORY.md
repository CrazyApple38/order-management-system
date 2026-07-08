# 共有永続事実ストア（SHARED-MEMORY）

両 AI（Claude Code / Codex）が共有する **永続的な事実・制約・決定・構造履歴** の正本。

- **新会話開始時に本ファイルを読む**（HANDOFF.md と合わせて。詳細手順は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」）。
- ここに置くのは「変わりにくい事実・制約・構造履歴」。**揮発的な「今セッションの作業状態」は `docs/HANDOFF.md`（10〜30 行）に書く**（ここには書かない）。
- 更新は **変更が確定したときのみ**（毎セッションの定型更新は不要）。古くなった行は git 履歴に委ね、本ファイルから削除して肥大を防ぐ。

---

## 未決の横断判断（ユーザー判断待ち）

> 2026-06-30 NotebookLM 横断レビュー → 現物照合で確定。いずれも「要件 vs DB のどちらを正とするか」の判断待ち。

- **① 顧客側金額** — 要件 3.1.1 は「単価／請求額／支払条件」を要求するが `daily_site_orders` に該当列なし（`purchase_orders`＝協力業者側・`intergroup_billings`＝GC間のみ）。顧客請求をシステムで保持するか／保持先を要判断。
- **② 契約先連絡先** — `companies` は 2026-02-04 に住所/phone/email/contact_person を削除済だが、要件 3.1.1 は契約先「連絡先・住所」を要求（`group_companies.phone` は注文書甲情報で別物）。要件を更新するか `companies` に戻すか要判断。
- ※同レビューの他3件（既定時刻の格納先＝「本実装フェーズで確定」と明記／カスタム連絡タイプ＝マスタを持たない設計意図／`workedPrevNight`＝モック専用・実装時に導出置換と明記）は **対応不要** と確認済。

## プロジェクト決定（SSOT ポインタ）

- **リファクタ統合計画** `docs/plan/mockup-refactor-plan.md` がプロジェクトの SSOT。新DS適用 × 通知簡素化 × カテゴリ再定義を画面ごとに一括適用。**本計画外での個別先行実装は凍結**（ユーザー指示）。
- **新DSの正本（2026-07-03 / R-1 完了）**: `docs/design-system/`（仕様5冊）+ `docs/mockup/ds-tokens.css` / `ds-components.css`（プレビュー2本から機械抽出）。コンポーネントカタログ **37件は全件採用確定**（ユーザー宣言）。**旧 `co-tokens.css` と同名・別値トークンがあるため同一ページ併載禁止**（R-3 で画面ごと差し替え → 全画面移行後に旧ファイル廃止）。ds-*.css 新設方式は **2026-07-03 ユーザー追認済み（正式決定）**。同日確定: 曜日セル色=青灰の濃淡のみ（桃色面廃止）/ density 3段維持（spacious を新DSへ追加、値は R-3b で確定）/ モーション・z層・モーダル幅トークンは ds-tokens.css へ移設済み（03 §3.2）。
- **サブ機能の右プロパティ集約（2026-07-03 確定）**: 振り分け基準（中央→ツールバー→右プロパティ→モーダルの判定順）と画面別 panel-rail モード構成（OB=3モード選択連動 / WS=4モード / LA=3モード×作業面連動+ミニカレンダー prop-card 上部常設 / QA=モバイル例外・デスクトップ右プロパティは将来拡張）は `docs/design-system/03_screen-application.md` §1.1・§4 が正本。編集モーダル→右プロパティ転換は R-3 と同時一括。フィルタ=ツールバー seg 統一 / 凡例=ヘルプ集約 / OB カレンダー入力=中央ビュー切替化 / センター・admin-notify は対象外。
- **デザイン刷新** は **案B改: Calm Operations** 方向で継続（ツールバーはフラット維持、左メニュー／中央パネル／縦型アイコンメニュー／右プロパティを同一マテリアル表現で統一。影＝高さレイヤー、縦型アイコンメニューが最上位）。
- **通知** はエンティティ別カテゴリ（受注/配置/申請/マスタ）＋対象日ファセット。責務は「知らせる＋該当箇所を示す」に限定し確認は系外（電話・チャット）。詳細は `docs/plan/notification-refactor-plan.md` §3.7.8/3.7.9。

## 会社マッピング（`demo-data.js` 由来・確定）

- `touo` = 東央警備 / `nikkei` = Nikkei-HD / `zennihon` = AJE（全日本〜）。**トーゴーは OMS 未定義**。
- SL 区分円 GC 色: `--gc-touo` = A社（belong-1）/ `--gc-nikkei` = B社（belong-2）/ `--gc-zennihon` = C社（belong-3）。所属カラー(belong)スウォッチ UI に追従。

## 命名規約（共有）

- `sm*` = 現場詳細モーダル用の関数・ID / `ob*` = 受注簿由来の CSS 共通クラス / `belong-*` = 所属会社色トークン。
- `category-*` / `shift-*` CSS クラスは `smCategoryClassMap` / `smShiftClassMap` で管理。

## 触らないでほしいもの / 注意事項

- `docs/mockup/ds-tokens.css` / `ds-components.css` は新DS正本（プレビューモックから機械抽出）。**値の変更・追加はユーザー承認必須**。`docs/preview/design-refresh-components.html` / `design-refresh-sl-layer-mockup.html` は参照専用（改変禁止）。
- **（R-3a-1a 2026-07-06）`docs/mockup/ds-tokens-bridge.css` / `sl-ds.css` は SL 移行専用の別ファイル**（ds-tokens/components 正本は非改変）。`ds-tokens-bridge.css`＝co-tokens専用トークン（ds未提供分）を元値で供給する移行シム（残置モーダル回帰ゼロ用）。R-3a完了（モーダル→右プロパティ転換・ds-componentsクラス化）でSLの旧CSS依存が消えたら両ファイルを読込チェーンから外し撤去。**現状 SL だけが読込（他4画面は co-tokens のまま）**。
- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること。
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと。
- N-5 の別画面遷移は URL パラメータ `cnJump` に JSON を載せる。**同タブ遷移** で着地し `history.replaceState` で cnJump を除去する設計（2026-05-27 Claude Code 修正）。`window.open(_blank)` には戻さないこと。
- 共通パネルは `affects[]` だけでは通知フォーカスしない。現在画面用 `target` が解決できる場合のみ即時フォーカスする。
- 通知ベルは表示上4分類だが、画面側 SelfNotify は旧 ID で呼んでよい。共通シード済みの初期通知はページ側 `setItems('sl'|'ws'...)` で上書きしない。実操作の `addItem(...)` は統合ベルへ追加される。
- 発信元/主担当画面が現在画面と異なる通知は、現在画面でフォーカスできてもパネルを閉じない。アコーディオンを展開し、発信元画面で開くボタンを残す。
- **（R-2 2026-07-04）通知は統合ベル1個 + `.cn-card`。DOM 上のベルは常に `data-bell="all"`**。各画面 SelfNotify / seed は旧ベルID（ob/sl/ws/la/pending/vehicle/master）で `addItem/setItems` を呼んでよい（`co-notify-panel.js` の `normalizeBellId()` が `'all'` へ吸収し、カテゴリは `domain` から導出）。旧4分類ベル（order/assignment/approval/master）DOM は廃止。
- **cn-card の CSS は旧画面と ds-tokens.css を併載できない**（同名別値トークン）ため、`co-notify-panel.css` 末尾に `.cn-card` スコープで **DS 値を内蔵した `--cn-*` 変数**を持つ（出典=ds-tokens.css・値変更はユーザー承認必須）。R-3 で画面がレール化して ds-tokens を読むようになったら、この内蔵ブロックを ds 参照へ差し替え検討。
- **QA（quick-access）は旧 `.cn-panel` マークアップ（最新/履歴タブ・検索・一覧選択）を自前保持**。`co-notify-panel.js` 末尾の「QA モバイル互換セクション」ハンドラが依存。旧 `.cn-panel`/`.cn-history-*`/`.cn-pick-*` CSS も残置（R-3e で QA を新カードへ移行したら撤去）。
- **既知の欠損アセット（R-2無関係・未修正）**: `docs/mockup/icons/shield.svg` が実在せず 404。参照元は `quick-access.html:82`（`<img class="qa-brand-icon">`・commit `bf93d8c` 由来のブランドアイコン）で QA/admin-notify ヘッダで発生。2026-07-05 ユーザー判断「今回は触らず記録のみ」。差し替え or 削除は別途（アイコン選定要確認）。

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
| 2026-06-01 | Codex | LA休暇申請 seed を LA 画面専用生成から `mock-assignments-data.js` 共通生成へ移し、`co-mock-store.js` 未初期化時も seed を返すよう変更。SL/WS/共通ナビ単体起動でも LA 通知 seed が成立 | `mock-assignments-data.js` (`createLeaveApplications`) / `co-mock-store.js` (`getLeaveApplications` fallback) / `leave-application.js` seed 利用 / `co-navbar.js` 現在日優先 LA seed / HTML キャッシュバスター |
| 2026-07-04 | Claude Code | **R-2 通知データモデル改修（コア実装・runtime検証保留）**: 通知ベルを4分類横並び→**統合ベル1個 + 単一 `.cn-card`（レール通知カード）** へ。カテゴリは**エンティティ(domain)から導出**（受注/配置/申請・承認/マスタ）、配置は**サブタグ**（自社/応援/協力業者/車両・ETC）、**`targetDate`（単日=文字列 / 範囲={start,end}）を第一級ファセット化し日別グルーピングを対象日基準に**。パネルの履歴タブ・検索・一覧選択フローは撤去（集積・検索はセンターの責務）。フッターに「変更通知センターで開く→」（同タブ遷移）。旧ベルID/旧4分類IDは `normalizeBellId()` が全て `'all'` へ吸収、`sourceBell` はジャンプ解決メタとして保持 | `co-notify-panel.js`(v39: カテゴリ/subTag/targetDate導出・buildItemHtml・renderBellLatest・setItems 全置換・QAモバイル互換ハンドラ隔離) / `co-notify-panel.css`(v18: `.cn-card` スコープの DS 内蔵ブロック追加) / `co-navbar.js`(v22: 単一ベルDOM・seedフラット化・targetDate/subTag付与) / HTML6本キャッシュバスター |
| 2026-07-06 | Claude Code | **R-3a-1a（SL 新骨格＋CSS読替・runtime検証済）**: SL のみ `co-tokens.css`撤去→`ds-tokens.css`＋新設`ds-tokens-bridge.css`＋`ds-components.css`＋新設`sl-ds.css`。骨格を `app > toolbar / workspace(rail｜main-card｜prop｜panel-rail)` へ再構成。左minimap撤去→総数はツールバー`stat-strip`（`renderMinimap`を retarget）。中央表は`<table class="grid-table">`を維持しCSSでDS化（縦罫線撤去・淡見出し・青選択）。右サイドD&D供給源を`.prop`列へ暫定収容。9モーダル残置・回帰ゼロ。**ブリッジ機構**: `ds-tokens-bridge.css`＝co専用トークン（ds未提供分）を元値でshim（残置モーダル無改造で回帰ゼロ・同名トークンは ds 新値へ自動読替）。**SL専用**（他4画面は co-tokens のまま無影響） | `screen-layout.html`（head CSSリンク差替・骨格HTML再構成）/ 新規 `docs/mockup/ds-tokens-bridge.css`・`docs/mockup/sl-ds.css` / `screen-layout.js`(v53: renderMinimap→stat-strip) |
| 2026-07-06 | Codex | **R-3a-1b（SL 中央表7列化・runtime検証済）**: SL中央表を10列→7列（区分/契約先・現場名、集合、時間、人数、配置、車両・ETC、変更履歴・備考）へ再構成。No.列撤去（行番号は `data-sl-seq` へ退避）、地図は現場名セル内 `info-pill`（`data-maps` は `.col-site-info`）、作業内容は区分セル内 `.work-badge-slot` へ統合。変更履歴はプレースホルダで、実データ配線は R-3a-3。表DOM上の旧 `.col-no/.col-map/.col-badge` は0件だが、旧DOM互換フォールバックはJSに残置。 | `screen-layout.html`（表ヘッダ・固定行7列化）/ `screen-layout.js`（`cnCreateRow`・地図/作業内容/行番号参照再配線）/ `sl-ds.css`（7列幅・地図ピル・履歴プレースホルダ） |
| 2026-07-06 | Codex | **R-3a-2（SL 右プロパティ4モード化・runtime検証済）**: `.prop` を `.prop-card` 化し、panel-rail 4モード（現場詳細 / 社員配置 / 車両・ETC / 変更履歴）を実動化。`siteModal` / `meetingModal` / `workModal` / `workTimeModal` / `mapModal` / `notesModal` / `staffEditModal` / `vehicleEditModal` は既存フォームID・保存関数を維持したまま、開く時に右プロパティ内 `.sl-prop-dock` へ移動表示。`sortModal`・新規追加・印刷・カラー設定は従来通り。変更履歴は R-3a-3 の通知rail検証で実データ配線予定。 | `screen-layout.html`（prop-card 4モード・panel-rail onclick）/ `screen-layout.js`（`slSetPropMode`・`slOpenPropDock`・各 open/close 置換）/ `sl-ds.css`（右プロパティ/ドックCSS） |
| 2026-07-07 | Codex | **R-3a-3（SL 通知rail cn-card＋履歴配線・runtime検証済）**: SL の共通統合ベル DOM を左 `.rail` へ移動（他画面は従来の `co-navbar` 位置維持）。右プロパティ「変更履歴」は `coNotifyPanel.getItems('all')` 由来の SL 関連通知を表示し、中央表 `.col-notes` は該当行の通知件数/最新要約を `data-history-*` で表示。SL SelfNotify/seed は `targetDate` と画面別 target を補完。 | `screen-layout.html`（履歴コンテナ・cache bust）/ `screen-layout.js`（rail移動・履歴描画・通知hook・targetDate補完）/ `sl-ds.css`（rail cn-card・履歴/notes表示） |
| 2026-07-05 | Claude Code | **R-2 完了（runtime検証済 + SelfNotify 明示付与）**: OB/SL/WS/LA/QA/admin-notify を Playwright 検証（R-2起因のコンソールエラー0・cn-card DS準拠・全4カテゴリ+サブタグ+対象日・フィルタ・cn:jump着地・OB復旧トグル・QA旧.cn-panel 全て回帰なし）。enhancement: **OB `obCnSelfNotify` に明示 `targetDate`**（`currentYear/currentMonth`+day から生成→月移動中でも対象日がズレない） / **WS `wsCnSelfNotify` に明示 `subTag`+`targetDate`**（従来のパネル導出は domain=person-assignment を一律「自社」・support-reservation を一律「協力業者」と判定し、**車両配置→自社・応援予約→協力業者を誤判定していた取りこぼしを補正**。vehicleName→vehicle / empName→own / kind==='partner'→partner / それ以外reservation→support、targetDate=dateKey）。固定文字列を書かず実値から導出 | `order-book.js`(v19) / `weekly-schedule.js`(v19) / order-book.html・weekly-schedule.html キャッシュバスター |
| 2026-07-08 | Claude Code | **R-3c-2b 完了（WS 応援予約モーダル→ドック転換・runtime検証済）**: `openReservationModal`/`openReservationQuickModal`/`openReservationWeekModal`/`showPartnerRowMenu` の4関数を撤去し、④「協力業者・応援予約」モードの右プロパティドック（`wsRenderSupportContent` 全書換）へ**縦リスト化**して集約。GC別に業者カード（ヘッダ=D&D配置供給源[dragstart payload維持]+名前+マスタ未完備警告+⋮メニュー / ボディ=7日予約ステッパー[配置済み下限・schedule発火 `wsCnSelfNotify` 維持]）を縦積み。GCセクション折りたたみ（`wsSupportCollapsedGc`）+業者追加（`createPartnerAutocomplete`）+⋮メニュー（この週クリア/マスタから削除）。中央ボードの名前セル/日付セル「＋」は `wsSetPropMode('support')`+`wsFocusSupportInDock`（対象GC/日へスクロール+フラッシュ）へ差替。`showLinkPopover` は据置（チップ文脈依存のため）。`createStepper`/`createPartnerAutocomplete` は再利用のため残置。**他画面無影響**（WS専用ファイルのみ） | `weekly-schedule.js`(v22) / `weekly-schedule.html` / `ws-ds.css`(v4) |
| 2026-07-08 | Claude Code | **R-3c-3 完了（WS 通知rail cn-card＋履歴配線・runtime検証済）**: 統合ベルDOMを `.ws-workspace .rail` へ移設。④協力業者・応援予約と同様、WSは専用「変更履歴」panel-railモードを持たないため、①「選択セル」モードの下部に `wsRenderHistorySection` で埋め込み（選択中は siteId+日付でフィルタ／未選択時は週間予定表全体の直近6件）。cn:jump着地時に `selectedCell` を再設定し `wsPropMode='cell'` へ切替える改修（OB `obSelectRow` 同型）で、着地セルが選択セル編集パネルにそのまま反映されるよう修正。**副産物のバグ修正**: 通知カード委譲クリック（隠しDOMの `.cn-item-row` へ `.click()` 委譲）が実DOM `click` として bubble し、WS固有の「グリッド外クリックで選択解除」グローバルリスナーに誤反応して選択セルが即解除される問題を発見・修正（`.rail`/`.cn-card`/`.cn-panel` を解除除外に追加）。OB/SLにはこの「外側クリックで解除」リスナー自体が無いため同種バグ無し＝WS固有の注意点。N-6 schedule発火19箇所は回帰なしを実操作で確認 | `weekly-schedule.js`(v23) / `weekly-schedule.html` / `ws-ds.css`(v5) |
| 2026-07-08 | Claude Code | **R-3b 完了（OB・runtime検証済）**: ①**カレンダー入力モーダルを廃止**し行カレンダーを中央ビュー切替化（`obSetView('grid'|'calendar')`・`#obGridFrame`⇄`#obCalFrame`）。旧 `openCalendarModal`/`calUndo`/`calRedo`/`onCalendarCellClick`(旧実装)/カレンダー専用 undo redo スタック・アコーディオン機構・週表示ヘルパーは全撤去（`openCalendarModal` 等は undefined 化）。月ナビ=ツールバー `changeMonth`・undo redo=グローバル一本化。日セル編集=`openEditModal`→右プロパティ「詳細」ドック。②右プロパティ「連携・所在」実配線（`obFindLinkedSite`=`createSiteOrderMap` 逆引き / 地図URL集約 / 288px内 iframe プレビュー）③「変更履歴」実配線（`obNotifyItems`=getItems('all') OB関連を選択行フィルタ・SL R-3a-3 と同型・cn:jump 委譲）④夜間色 `--night-text` を order-book.css ローカル上書き `#DB577B` 撤去→ds-tokens.css `#d14d41`（03 §3.1）+ 死にCSS削除（`.md-ob-filter-*`・カレンダーモーダルchrome）。**他画面は無影響**（OB 専用ファイルのみ変更） | `order-book.js`(v22) / `order-book.html` / `ob-ds.css`(v4) / `order-book.css`(v6) |

## アクティブな計画書

- `docs/plan/mockup-refactor-plan.md` — **リファクタ統合計画（SSOT。R-2 完了 2026-07-05 / R-3a 完了 2026-07-07 / R-3b OB 完了 2026-07-08 / R-3c WS 全段階完了 2026-07-08 / 次は R-3d LA）**
- `docs/design-system/` — 新DS仕様の正本（README + 01〜04。実施順序は mockup-refactor-plan が正）
- `docs/plan/mock-data-unification-plan.md` — SL/WS/LA/通知seed ダミーデータ一本化（**Phase 1+2 完了 / 残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題**）
- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-6 完了（§17）/ 次は Phase 2.5 登録**）
- `docs/plan/design-refresh-plan.md` — デザイン刷新 診断・比較計画（**案B改: Calm Operations 採用 / 次は SL 適用範囲確定**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
