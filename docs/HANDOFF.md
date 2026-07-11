# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-11
- **コミット**: 直前HEAD `d4d681d`（本コミット = .agent-env.json 追加）

## 直前にやったこと
- **軽微**: agent-env 整備の仕上げとして `.agent-env.json`（pre-commit品質ゲート設定: node-syntax / json-parse / ds-audit）をユーザー承認のうえコミット。doc-export スモークテスト残骸3ファイルは削除（ユーザー承認済み）
- 前セッション（Codex/GPT-5）: **G-1（骨格+個人設定タブ）完了**。`account-settings.html` / `ac-ds.css` / `account-settings.js` 新設、`co-navbar.js` v26で「アカウント設定」導線追加。保存/復元/リセット/OB遷移・既存6画面回帰・ds-audit NG=0 合格（詳細は d4d681d）

## 次にやるべきこと
1. 次は **G-2（ユーザー管理タブ）** または **F-2（単純マスタ横展開）**。着手Phaseをユーザーへ確認する。
2. G-2は管理権限者のみの一覧+右プロパティ編集とし、ロール/社員/担当契約先紐付けを実装する。
3. F-2は §3.1 のCRUD契約を使い、祝日はF側シードだけに留めて画面間一本化を行わない。
4. Phase 3へは「モックアップ完了」宣言があるまで進まない。

## 今だけの申し送り
- `.agent-env.json` は今回コミット済み（品質ゲートがCodexのコミットにも有効）。pre-commit は HANDOFF 未ステージのコミットをブロックする（スキップ: `AGENT_ENV_SKIP_HANDOFF=1` か `--no-verify`）
- Chrome拡張由来の既知エラーを除き `account-settings.js` 起因ログは0。QAの `shield.svg` 404とOB iframe sandbox警告は既知の既存事象。
- `screenshots/g1-account-settings.png` がG-1合格スクリーンショット。
