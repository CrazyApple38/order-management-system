# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-08
- **コミット**: 本コミット（親=678b45d）。**R-3c-2b（応援予約モーダル→ドック転換）完了** — 応援予約3モーダル＋⋮メニューを撤去し④モードの右プロパティドックへ縦リスト化集約。次は R-3c-3（通知rail cn-card＋履歴配線）
- 直近コミット: `678b45d` R-3c-2a panel-rail 4モード / `0e10e4d` 休み色 info化 / `6d4650e` R-3c-1 骨格

## 直前にやったこと（最新のみ）

- **R-3c-2b（応援予約モーダル→ドック転換）完了**（Playwright 1440px runtime 検証済・コンソール0/0）:
  - **モーダル4関数を撤去**: `openReservationModal`/`openReservationQuickModal`/`openReservationWeekModal`/`showPartnerRowMenu`。`createStepper`/`createPartnerAutocomplete` は再利用で残置。
  - **`wsRenderSupportContent` を全書換**（④協力業者・応援予約モード）: GC別に**業者カード縦積み**。カード = ヘッダ（`∷`グリップ+名前+マスタ未完備警告+`⋮`メニュー、**ヘッダ自体が D&D 配置供給源**＝dragstart payload `{type:'sidebar-support',partnerId}` 維持）+ ボディ（7日予約ステッパー、配置済み下限・`wsCnSelfNotify` schedule発火維持、予約変更時 `renderGrid` のみでドック非再構築）。ヘルパー `wsBuildSupportCard`/`wsBuildSupportAddRow`/`wsShowSupportCardMenu`/`wsFocusSupportInDock` 追加。統合応援プリセット（`appendUnifiedSupportSection`）は据置。
  - **GCセクション折りたたみ**: `wsSupportCollapsedGc`（gcCode→true）。見出しクリックで▼▶トグル。
  - **⋮メニュー**（旧 showPartnerRowMenu 相当・`.md-ws-res-week-row-menu` CSS 再利用）: 「この週の予約をクリア」/「マスタから削除」。**業者追加**は各GC末尾の `＋ 業者追加`（`createPartnerAutocomplete`）。
  - **中央ボード「＋」差替**: 名前セル「＋」（旧 WeekModal）/日付セル「＋」（旧 QuickModal）とも `wsSupportCollapsedGc[gc]=false → wsSetPropMode('support') → wsFocusSupportInDock(gc, dateKey|null)`（対象GC/日へスクロール+`md-ws-support-flash` 着地）。
  - **`showLinkPopover` 据置**（ユーザー承認 2026-07-08・チップ文脈依存のため）。
  - **CSSレイアウトバグ修正**: `.md-ws-support-content`（flex列）内で子カードが `flex-shrink` されクリップ→7行中1行しか見えなかったため `> * { flex-shrink:0 }` 追加。
  - 検証: 3GC/5カード/各7日ステッパー・ヘッダdraggable(payload正常)・ステッパー編集→予約更新＋通知+1＋グリッド`残N`反映＋ドック非再構築・GC折りたたみ▼▶・cell「＋」/名前「＋」→support遷移+flash着地・⋮メニュー2項目・業者追加トグル+autocomplete・全モード巡回・コンソール0/0。スクショ `screenshots/r3c2b-ws-support-dock.png`。`weekly-schedule.js?v=22` / `ws-ds.css?v=4`（`weekly-schedule.css?v=5` 据置）。

## 次にやるべきこと

- **R-3c-3（通知rail cn-card＋履歴配線＋回帰＋検証）**: ①統合ベルDOMを左 `.rail` へ移動（SL R-3a-3 / OB R-3b と同型・アンカーCSSは ws-ds.css に先行定義済 `.ws-workspace .cn-card`/`.rail .md-nav-cn-bells`）。②変更履歴の右プロパティ配線（`coNotifyPanel.getItems('all')` の WS関連を選択セル/対象でフィルタ・cn:jump委譲・`scrollToRowAndFlash`/`wsCnHighlightCell` 着地整合）。③**N-6 回帰**（schedule発火19箇所を実操作で確認）。④Playwright検証+コミット。スクショ `screenshots/r3c3-ws-notify-rail.png`。
- 以降 R-3d LA → R-3e QA。SSOT=`docs/plan/mockup-refactor-plan.md`、詳細計画=`~/.claude/plans/vivid-swinging-elephant.md`（R-3c 3段階・2a/2b サブ分割）。

## 今だけの申し送り（任意）

- **GC フィルタ seg 化は延期のまま**（R-3c では現行の共有モーダルを回帰ゼロで維持。seg 吸収は全画面横断の別課題）。WS には会社ローカル seg を追加していない。
- **昼夜ヘッダ文字色**（`--shift-header-text-day` amber / `-night` navy-teal）は据え置き（DS非トークン・昼夜識別軸）。色面の最終調整はユーザー確認の上で別途。
- **ダークテーマ**は DS(Calm Operations)=light 専用のため WS でも対象外（`weekly-schedule.css [data-theme="dark"]` は残置・未検証）。
- R-3c-2b で予約ステッパーは**過去日も編集可**（旧 WeekModal の挙動を踏襲・意図的）。過去日ロックが要るなら別途指示を。
- 旧モーダルの死にCSS（`.md-ws-modal-*`/`.md-ws-res-quick-*`/`.md-ws-res-week-*` の一部）は `weekly-schedule.css` に残置（`.md-ws-modal-btn`/`.md-ws-res-week-row-menu`/`.md-ws-pac-*` は新ドックで再利用中）。掃除は将来。
- Playwright の孤立 Chrome ロックが出たら該当プロファイルのみ kill。OB の `shield.svg` 404 は既知・未対応。
