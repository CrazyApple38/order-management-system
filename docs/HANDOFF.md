# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-07
- **コミット**: 0046a88（直前HEAD。R-3a-3実装コミット前）

## 直前にやったこと（最新のみ）

- **R-3a-3 完了・runtime検証済**: SL の統合ベル DOM を左 rail へ移動し、cn-card を rail から開く形にした（他画面は co-navbar 位置維持）。
- 右プロパティ「変更履歴」を `coNotifyPanel.getItems('all')` 由来で表示し、中央表 `.col-notes` に通知件数/最新要約を表示。
- SL SelfNotify/seed に `targetDate` と画面別 target を補完。履歴項目クリックは既存 cn-card の `cn:jump` 経路を再利用。
- 検証: `node --check docs/mockup/screen-layout.js` OK / Playwright localhost で railベル、cn-card、SL自発通知 cn:jump、履歴クリック cn:jump、action button 存在、console error 0。スクショ `screenshots/r3a3-sl-notify-rail.png`。

## 次にやるべきこと

- **R-3b OB 着手**: `mockup-refactor-plan.md` と `docs/design-system/03_screen-application.md` の OB 節を読み、受注簿の新DS適用サイクルへ進む。
- OB は行削除→復旧トグル、`cn:action`、日またぎ targetDate、月間グリッド/行カレンダー切替の回帰を重点確認する。
- R-3a SL は完了扱い。追加で色・配置・サイズなど主観デザインを触る場合はユーザー確認が必要。

## 今だけの申し送り（任意）

- Apache は `http://localhost/order-management-system/docs/screen-layout.html` で応答確認済み。
