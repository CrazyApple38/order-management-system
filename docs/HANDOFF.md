# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-11
- **コミット**: 直前HEAD `d4d681d`（G-1成果は本コミット）

## 直前にやったこと
- **G-1（骨格+個人設定タブ）を完了**。`account-settings.html` / `ac-ds.css` / `account-settings.js` を新設。
- プロフィール表示、GCフィルタ既定、通知スコープ、画面表示、密度、QA/カラー設定導線を実装。専用キー `mock.oms.account.preferences.v1` で保存・再読込復元。
- `co-navbar.js` v26で共通 `.menu-user` に「アカウント設定」を追加し、既存LAロール切替と併存。
- localhost 1440pxで保存/復元/リセット/OBからの遷移を確認。既存6画面回帰、HTTP 200、ds-audit NG=0/WARN=0、node --check、diff-check合格。

## 次にやるべきこと
1. 次は **G-2（ユーザー管理タブ）** または **F-2（単純マスタ横展開）**。着手Phaseをユーザーへ確認する。
2. G-2は管理権限者のみの一覧+右プロパティ編集とし、ロール/社員/担当契約先紐付けを実装する。
3. F-2は §3.1 のCRUD契約を使い、祝日はF側シードだけに留めて画面間一本化を行わない。
4. Phase 3へは「モックアップ完了」宣言があるまで進まない。

## 今だけの申し送り
- `.agent-env.json` と `docs/doc-export-smoke-test.{md,docx,pdf}` は未追跡成果物。変更・コミットしない。
- Chrome拡張由来の既知エラーを除き `account-settings.js` 起因ログは0。QAの `shield.svg` 404とOB iframe sandbox警告は既知の既存事象。
- `screenshots/g1-account-settings.png` がG-1合格スクリーンショット。
