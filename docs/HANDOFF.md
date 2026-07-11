# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-11
- **コミット**: F-1成果 `93b6c69`（push済み）

## 直前にやったこと
- **F-1（骨格+契約先CRUDパターン）を完了**。`master-management.html` / `ma-ds.css` / `master-management.js` を新設。
- 契約先の一覧・検索・有効状態seg・追加・編集・論理削除を右プロパティで実装。専用キー `mock.oms.master.v1` で再読込復元。
- `co-navbar.js` v25で全マスタ項目を統合画面へ直接遷移。未展開種別はF-1時点では契約先へ正規化。
- localhost 1440pxでCRUD/復元/遷移を確認。既存6画面回帰、ds-audit NG=0/WARN=0、node --check、diff-check合格。

## 次にやるべきこと
1. 推奨順の次は **G-1（骨格+個人設定タブ）**。着手前にユーザー確認し、`account-settings.html` と共有 `.menu-user` 改修を確定する。
2. **F-2（単純マスタ横展開）**を先行する選択も可。祝日一本化は横断影響があるためF側シード追加だけに留めるか事前確認する。
3. F-2は §3.1 のCRUD契約を使い、種別ごとの列/フォーム/シードのみ追加する。
4. Phase 3へは「モックアップ完了」宣言があるまで進まない。

## 今だけの申し送り
- `.agent-env.json` と `docs/doc-export-smoke-test.{md,docx,pdf}` は未追跡成果物。変更・コミットしない。
- QAの `shield.svg` 404とOB iframe sandbox警告は既知の既存事象。F-1起因のコンソールエラー/警告は0。
- `screenshots/f1-master-management.png` がF-1合格スクリーンショット。
