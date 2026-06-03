# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-06-03
- **コミット**: 38ee7b8（直前 HEAD。本「警告アイコン/info-pill/配置セル再構成＋連絡アイコン非表示」作業は本コミットで反映）

## 直前にやったこと

- (Claude Code) SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）バッジ内に**社員個人警告アイコンを導入**。線画注意三角 `im-11907` を SVG スプライト（`#ic-caution-line`、body直後 symbol）化し `.person-warn`（`--accent-orange`・13px・名前左）で表示。佐藤=「連勤12日」/ 高橋=「NG 伊藤」/ 伊藤=「NG 高橋」。旧 alert-row の warn-icon は移設して削除。CSS mask は file:// で読めずユーザー環境で非表示だったため**インライン/スプライト方式へ変更**（外部ファイル依存ゼロ）。
- (Claude Code) `資格者不足` を warn-icon → `info-pill missing` バッジ化。**情報系 info-pill を配置セル最下部へ再配置**: `.assign-list` を column 化し社員バッジ群を `.assign-people`（flex 行ラップ＝横並び可）で包む2段構成、`.cell…:has(.assign-list)` で縦ストレッチ＋ `.alert-row{margin-top:auto;width:100%}` で最下部ピン留め。
- (Claude Code) **連絡確認機能を一旦無効化**: `.contact{display:none!important}`（コメント付き、1行削除で復帰可）。マークアップは残置。
- (Claude Code) フレア調整: 所属GC色フレアを2段階「透明＋小型化」、外側フェードを約30%手前へ引き込み（gradient stops 45/55/64/73）、横長・薄型化。`.flare-source` の白い芯 1%→5%。**車両flare中央ずれバグ修正**（`.vehicle-tag .flare-source` に `position:absolute` 明示、Playwright で中心0px確認）。
- (Codex) SL を「OB受注情報を配置担当者が翌日以降の実行可能な社員指示へ確定していく画面」として整理。`docs/01_要件定義.md` 3.2/5.1.3 と `docs/plan/design-refresh-plan.md` に SL 情報レイヤー方針（共通コア/配置判断/社員連絡/差分・権限/区分制約/中央グリッド・右プロパティ分担）を追記。`docs/preview/design-refresh-sl-layer-mockup.html` を新規作成（中央7列表＋縦型アイコンメニュー＋右プロパティ、左メニュー濃紺＋マテリアル表現、Inter/Noto Sans JP）。
- (Claude Code) 上記モックの配色をカラーコーディネート観点で調整。夜間/警告文字を赤寄せ・トーンダウン（`--accent-text-warn: #cf4626`）、`不足` バッジをオレンジ塗り＋白文字、中央表データ文字（時間/人数/現場名/社員名）をセミボールド `600`（`--table-data-weight`）に。
- (Claude Code) タイトルバーを紺→青→ティールのアナロガス2色グラデ＋ガラスエッジに（変数 `--title-navy`/`--title-blue-mid`/`--title-teal`）。左メニュー濃紺・ベース淡青を基準に画面全体を青〜ティール基調へ統一。
- (Claude Code) アクセントオレンジの彩度を抑え（`--accent-orange: #f15e2a`）、所属ドット調整（※下記で所属5色は再設計済み）。
- (Claude Code) 車両/ETCバッジ文字を `--table-data-weight`(600) に統一。配置社員の連絡アイコンを状態別画像に差し替え（連絡済み=`si-26526-telephone-call.png` / 未連絡=`im-00027-denwa-no-juwaki.svg` / 再連絡=`si-36957-tel-orikaeshi.png`）、`.contact` の色フィルタを廃止し黒表示に。
- (Claude Code) 所属カラーを寒色アナログ判別5色（`--belong-1`〜`5` = ブルー#3a72b4 / シアン#1f8fa0 / ティールグリーン#2f9579 / インディゴ#5562ad / バイオレット#7a5ba6）へ再設計。上部に各社A〜E×5色スウォッチの選択UI（`#bcList`）を新設。JS（末尾 `<script>`）で衝突時スワップ→常に5社5色・重複なしを維持し、社員/車両バッジへ即反映。暖色はオレンジアクセントと競合するため選択肢から除外。
- (Claude Code) タイトルバー「業務管理計画書」見出しの太さを 900→700（`.main-title`）に。
- (Codex) ユーザーの新しい参考画像を受け、所属GC表現をドットから「外側所属GC色フレア + 内側2pxの白リム付きソリッドバッジ + 下辺中央の白い点光源」へ変更。内側バッジが光を覆い、下辺からだけ所属GC色の光が漏れる構造。所属GC色フレアは、所属GC色自体は変えず、中心から3割程度までを明るい薄黄色、4割程度を明るく鮮やかな所属GC色、65%以降をグレーがかった所属色へ変化させる。白い光は下罫線全体の `box-shadow` ではなく、`flare-source` レイヤーで中央一点から放射し、最も明るい芯は1%程度に抑える。6割以降は薄い黄色へ変化。前回不採用だった全面ネオン/強いグローではなく、下側の細い発光エッジ + 外側の小さなぼかしに限定。社員バッジと車両/ETCバッジへ同じルールを適用。

## 次にやるべきこと

- 上記4ファイル（plan / 要件定義 / HANDOFF / sl-layer-mockup）は本コミットで反映済み。SL モックの配色は **青〜ティール基調＋オレンジ1アクセントで確定**（左メニュー濃紺・ベース淡青・タイトルバー紺→青→ティール・アクセント `#f15e2a`）。所属GC表現はドットではなく、下辺フレア + 内側ソリッド面 + 下辺中央の白い点光源方式で継続する。今後の SL 系モック/実装はこのパレットに準拠する。
- `docs/00_開発手順書.md` のモック状態表とプロジェクトルート `CLAUDE.md` の表に「E 休日申請管理」表記が残存（今回スコープ外）。用語統一を広げる場合は別途。
- デザイン刷新は **案B改: Calm Operations / B案v2 デスクトップワークスペース方向で継続**。ツールバーはフラット維持、左メニュー、中央業務管理計画書パネル、中央右の縦型アイコンメニュー、右プロパティカードは同じマテリアル表現で統一済み。影は高さレイヤーとして扱い、縦型アイコンメニューが最上位。
- まだ議論すべき課題: 車両/ETCの中央表示優先度、固定行の見せ方、社員連絡の最終出力仕様（LINE等）、印刷帳票との情報差、右プロパティ内の情報密度。
- WS `schedule×modify`（busy 移動 / 候補リスト移動）は構文 OK だが Playwright 実 UI 未実証。
- Phase 2.5（モックアップ検証）への通知システム登録。
- mock-data-unification-plan は Phase 1+2 完了（残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題）。

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
| 2026-06-01 | Codex | LA休暇申請 seed を LA 画面専用生成から `mock-assignments-data.js` 共通生成へ移し、`co-mock-store.js` 未初期化時も seed を返すよう変更。SL/WS/共通ナビ単体起動でも LA 通知 seed が成立 | `mock-assignments-data.js` (`createLeaveApplications`) / `co-mock-store.js` (`getLeaveApplications` fallback) / `leave-application.js` seed 利用 / `co-navbar.js` 現在日優先 LA seed / HTML キャッシュバスター |

## アクティブな計画書

- `docs/plan/mock-data-unification-plan.md` — SL/WS/LA/通知seed ダミーデータ一本化（**Phase 1+2 完了 / 残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題**）
- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-6 静的検証 + 要対応実装 + SL↔LA seed フルフロー実証 完了（§17）/ 次は Phase 2.5 登録**）
- `docs/plan/design-refresh-plan.md` — デザイン刷新 診断・比較計画（**案B改: Calm Operations 採用方針 / 差分モック作成済み / 次は SL 適用範囲確定**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
