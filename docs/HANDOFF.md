# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-cutover-d5` ブランチ（直前 HEAD `3eae08f`）

## 直前にやったこと
- D-5完了: legacy 35,862ファイルを完全コピーし、web-stackを80/3306へ切替。全URL・DB・ブラウザ・worktree回帰green。
- Docker Desktop AutoStartを有効化し、OS再起動後に3コンテナ自動復帰・主要13 URL 200・ホスト3306接続を再確認。
- 旧htdocsのMove-Item部分移動574ファイルは元へコピー復元し欠損0を確認。元と部分退避は両方保全（削除禁止）。

## 次にやるべきこと
1. D-6（Next.js / Supabase環境のみ）は別途ユーザー確認を得て着手する（アプリ実装は禁止）。
2. 旧 `C:\xampp\htdocs` と部分退避 `htdocs_MOVED-20260714` の整理は、全関連セッション終了後にユーザー判断で行う。
3. D-5のOMS PRとweb-stack PR #2をCI/検証後にマージする。

## 今だけの申し送り
- web-stack起動中（HTTP 80 / DB 3306）。XAMPP Apache/MySQLは停止済みで起動禁止。
- Dockerは `C:\dev\legacy-htdocs` のみ参照。旧htdocs 58,143ファイルと部分退避574ファイルはDocker非依存・削除禁止。
- web-stack Draft PR #2。OMSは `codex/docker-cutover-d5`。
