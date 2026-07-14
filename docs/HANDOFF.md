# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Fable 5）
- **日付**: 2026-07-14
- **コミット**: `claude/docker-migration-d3` ブランチ（直前 HEAD `ecbb72e`）

## 直前にやったこと
- D-3 完了: OMS を **`C:\dev\order-management-system`** へ複製（git 検証合格）。Claude メモリ junction 再作成・settings/Codex config.toml/orca 追従・rules（Local Browser Verification=Docker 前提）再生成・web-stack `OMS_DIR` 切替＆200 確認。
- 旧 `C:\xampp\htdocs\order-management-system` の**リネーム退避のみ未実施**（実施セッションが旧 cwd を保持していたため。全 AI セッション終了後にユーザーが `order-management-system_MOVED-20260714` へリネーム）。
- **GitHub Actions 障害中**: pull_request で check-suite が生成されない（原因不明・githubstatus 正常）。PR マージは緊急時手順=ruleset 18830708 を一時 disabled→手動 squash マージ→active 戻し（ユーザー承認済み運用）。マージ前に ds-audit NG=0 と build-rules --check をローカル green 確認すること。

## 次にやるべきこと（Codex 担当・D-4 から）
1. **以後の作業はすべて新パス `C:\dev\order-management-system` で行う**（旧パスは触らない）。
2. D-4（orca-wt.sh Docker 対応）: 着手前ユーザー確認 → 計画書 §4.5 全読。junction 置き場= `C:\dev\oms-wt-serve`・web-stack への AliasMatch 追記・**junction がバインドマウント越しに解決されるかの検証が最重要**。
3. D-4 完了後、D-5（切替・XAMPP 停止）へ。CI 復旧状況も PR ごとに確認（復旧していれば通常 automerge へ戻す）。

## 今だけの申し送り
- web-stack 起動中（:8080/:13306・OMS は新パスから配信中）。XAMPP MariaDB は破損・停止のまま起動禁止。
- Claude メモリの旧 projects dir（C--xampp-htdocs-...）は junction 除去済みの残骸。削除はユーザー判断。
