# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-06
- **コミット**: 69a72b0（R-3a-2 実装コミット）

## 直前にやったこと（最新のみ）

- **R-3a-2 完了・runtime検証済**: SL右プロパティを4モード化（現場詳細 / 社員配置 / 車両・ETC / 変更履歴）し、panel-rail の切替を実動化。
- `siteModal` / `meetingModal` / `workModal` / `workTimeModal` / `mapModal` / `notesModal` / `staffEditModal` / `vehicleEditModal` は、既存フォームID・保存関数を維持したまま `.prop-card` 内へドック表示する方式に変更。
- `sortModal`・新規追加・印刷・カラー設定は従来通り維持。変更履歴モードはプレースホルダで、R-3a-3 の通知rail検証時に実データ配線予定。
- 検証: `node --check docs/mockup/screen-layout.js` OK。Playwright localhost 検証で4パネル、site/meeting/work/workTime/map/notes/staff/vehicle のドック表示、ページ由来console error 0。スクショ `screenshots/r3a2-sl-prop.png`。

## 次にやるべきこと

- **R-3a-3 着手**: SLのベルを rail へ移し、通知rail cn-card・cn:jump・元に戻す/seed回帰をまとめて検証。
- 変更履歴モードへ、R-3a-1b の `.col-notes::before` プレースホルダと R-3a-3 の通知/履歴表示を整合させる。
- 右プロパティ化後の site/meeting/work/workTime/map/notes 保存操作で、通知差分・undo・セル再描画に回帰がないか追加操作検証する。

## 今だけの申し送り（任意）

- in-app browser は今回も `node_repl js` が露出せず利用不可。代替でローカル Playwright headless を使用。
