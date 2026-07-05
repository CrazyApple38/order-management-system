# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-05
- **コミット**: f2e1254（直前 HEAD・本セッションの作業は本 HANDOFF と同じ新規コミットに含める）

## 直前にやったこと（最新のみ）

- **R-2 完了**。Apache 稼働中で Playwright runtime 検証を実施し、OB/SL/WS/LA/QA + admin-notify を確認 → **R-2 起因のコンソールエラー0・崩れなし**。cn-card は DS準拠(344×560)、統合ベル1個、全4カテゴリ+サブタグ+対象日バッジ、フィルタチップ5種、cn:jump スポットライト着地、OB 復旧トグル反転/復元、QA 旧 .cn-panel（最新/履歴タブ・検索・一覧選択）全て回帰なし。スクショ `screenshots/r2-verify-*.png`。
- **enhancement 実装（ユーザー選択「OB/WSに明示付与」）**: ①OB `obCnSelfNotify`(v19) に明示 `targetDate`（`currentYear/currentMonth`+day から生成・表示月ズレに堅牢）②WS `wsCnSelfNotify`(v19) に明示 `subTag`+`targetDate`。**WSはパネル導出のバグ補正が主眼**: 従来 domain=person-assignment を一律「自社」・support-reservation を一律「協力業者」と誤導出し、**車両配置→自社・応援予約→協力業者を取りこぼしていた**。明示付与で vehicle/own/partner/support を正しく表示（runtime で payload→バッジを実証: 車両→車両・ETC / 応援→応援）。
- admin-notify は notify-compare.js が既に4分類(MTX_BELLS)+旧キー localStorage 互換のため **表示確認のみで完了**（ユーザー承認）。
- 既知の別件（R-2無関係）: `shield.svg` 404（QA/adminヘッダ・quick-access.html:82）。「今回は触らず記録のみ」でユーザー決定 → SHARED-MEMORY に記録済み。

## 次にやるべきこと

- **R-3a（SL 画面別一括適用）**。着手条件（SL 配色テーマ確定 + 右プロパティ4モード情報粒度）を `design-refresh-plan.md` / `03_screen-application.md` §1.1・§4 で確認してから。未確定なら現行配色のまま DS 構造のみ適用可（配色は後続差し替え）。実施チェックリストは mockup-refactor-plan §R-3。
- Phase Gate: R-3 はモックアップ内リファクタ。Phase 3（仕様書作成）進行はユーザーの「モックアップ完了」宣言が必要。

## 今だけの申し送り（任意）

- R-3 持ち越し（曜日色トークン選定 / density spacious 具体値 / OB 地図プレビュー右プロパティ成立性）は継続で温存。
- 別件 TODO 候補: shield.svg 404 の解消（アイコン差し替え or img 削除。要ユーザー確認）。R-2 スコープ外のため未着手。
