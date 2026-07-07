# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5 → Opus 4.8)
- **日付**: 2026-07-08
- **コミット**: 本コミット（親=9a2c8ae）。**R-3b（OB）完遂** — R-3b 途中チェックポイントの残タスクを全消化

## 直前にやったこと（最新のみ）

- **R-3b（OB）完了**（4項目・全て Playwright localhost 1440px で runtime 検証済・コンソールエラー0）:
  1. **行カレンダーを中央ビュー切替化**: カレンダー入力モーダル廃止。ツールバー A-04 `#obViewCalBtn` を配線し `#obGridFrame`⇄`#obCalFrame` を切替。対象行=選択行/未選択なら先頭表示行（`obFirstCalendarRow`）。行内カレンダーアイコンは `obOpenRowCalendar(ri)` でその行を選択しビュー切替。編集は日セルクリック→`openEditModal`→右プロパティ「詳細」ドック。**月ナビ=ツールバー `changeMonth`・undo/redo=グローバル一本化**（カレンダー専用 undo/redo・専用月週ナビ・セッションスナップショット・アコーディオン機構は全撤去）。バッジ表示はツールバー「バッジ」に統合。
  2. **右プロパティ「連携・所在」実データ配線**: 請求先・契約（会社/契約先/業務名/現場住所=マスタ未整備の旨）+ 地図URL（表示月セルから集約・288px内 iframe プレビュー成立を実測=228px）+ SL/WS 連携状況（`createSiteOrderMap` 逆引きで SL 現場・本日/今週の配置数）。
  3. **右プロパティ「変更履歴」実データ配線**: `coNotifyPanel.getItems('all')` の OB 関連通知を選択行でフィルタ表示（SL R-3a-3 と同型）。項目クリック→通知パネル該当項目に委譲、無ければ target で直接 cn:jump。通知追加/削除フック(`obPatchNotifyRefreshHooks`)で追従。
  4. **夜間色分離 + 死にCSS削除**: order-book.css の `--night-text: #DB577B`（旧ピンク）上書きを撤去→ds-tokens.css の `--night-text: #d14d41`（03 §3.1 夜間/警告分離）。旧フィルタDD CSS（`.md-ob-filter-*` 21件）とカレンダーモーダルchrome CSS（close/月ナビ/info-bar/undo-redo/バッジbtn/編集パネル/フッター）を削除。info-meta+meta-* は中央ビューが再利用のため残置。
- 検証: `node --check` OK / Playwright: ソートモーダル開閉・seg フィルタ（夜5件/クリア18件）・月移動・cn:action（recover/cancel-recover）・**月移動中の6月編集→targetDate=2026-06-10（日またぎドリフト無し）**・cn:jump 着地スポットライト・履歴クリック着地・削除関数の undefined 化を確認。スクショ `screenshots/r3b-ob-cal-view.png` / `r3b-ob-linkage.png` / `r3b-ob-history.png`。

## 次にやるべきこと

- **R-3c WS `weekly-schedule.html`**（次サイクル）。03 §4 R-3c: 週配置ボードの色面整理・schedule 発火19箇所（N-6）全維持・週間=対象日範囲。`wsVehiclesData`/`wsSitesData` 共通ソース統一は本フェーズで混ぜない（別課題）。
- 以降 R-3d LA → R-3e QA。

## 今だけの申し送り（任意）

- **共通ナビ GC フィルタモーダルの「ツールバー seg 吸収」（03 §1.1 横断ルール）は未着手**。共有コンポーネント（`co-navbar`）のため OB 会社 seg と二重フィルタ状態（旧来挙動のまま）。全画面横断で別途対応が要る。
- Apache(httpd) が本セッション中に一度停止していた（`C:\xampp\apache\bin\httpd.exe` を起動して復帰）。検証時は起動確認を。
- OB の 404: `shield.svg`（既知・R-2無関係・SHARED-MEMORY記録）は未対応のまま。
