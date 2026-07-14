# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Fable 5）
- **日付**: 2026-07-14
- **コミット**: `claude/docker-migration-d2` ブランチ（直前 HEAD = PR #20 マージ後 master）

## 直前にやったこと
- D-1 完了 + web-stack を private `CrazyApple38/web-stack` へ push。
- D-2 完了: keibi-system/.env と ZNG_Recruit/database_local.php の DB_HOST を `db` へ（.bak-xampp あり）。keibi-report-quiz は DB 不使用で対象外・休眠3件は非修正。
- `basarak28_zgu1` を実DB + 90-users.sql（+migration-backup コピー）へ再構築。keibi-system の storage/framework 欠損を補修（500→200）。
- 検証: ZNG companies API が DB データ返却 / Laravel migrate:status 12件認識 / www-data 書込 3 箇所 OK。

## 次にやるべきこと
1. D-3（OMS リポジトリ移動 + AI 環境引っ越し）— **着手前ユーザー確認・Claude Code 自身が実施推奨**（メモリ dir / Obsidian junction / settings が Claude 固有）。
2. D-3 前提条件の確認: git clean / worktree・junction ゼロ / 進行中 PR なし / 他 AI セッションなし。
3. 以降 D-4（orca-wt Docker 対応）→ D-5（切替・XAMPP 停止）。

## 今だけの申し送り
- web-stack 起動中（:8080/:13306）。legacy の「配信の正」は Docker 側へ移行済み（XAMPP Apache でも静的配信は動くが、DB 接続は db 前提のため PHP アプリは XAMPP では動かない。復元は .bak-xampp）。
- XAMPP MariaDB は破損・停止のまま起動しないこと。
