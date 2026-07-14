# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-d7-reproduction` ブランチ（直前 HEAD `9306b39`）

## 直前にやったこと
- D-7のAI担当分完了: OMS READMEにノートPC再現手順、web-stack READMEに母艦災害復旧手順を整備。
- localStorage / Supabaseデータの端末独立、80番競合時の8080読み替え、母艦専用範囲を明記。
- 災害復旧では正常dump 3本 + 90-users.sqlのみを使い、partial dump / 破損mysqlスキーマを除外。

## 次にやるべきこと
1. ユーザーがノートPC実機で `docker/README.md` の手順を実施し、再現可否を確認する。
2. 旧 `C:\xampp\htdocs` と部分退避 `htdocs_MOVED-20260714` の整理は、全関連セッション終了後にユーザー判断で行う。
3. Next.js scaffold・Supabaseスキーマは「モックアップ完了」宣言まで禁止。

## 今だけの申し送り
- web-stack起動中（HTTP 80 / DB 3306）。XAMPP Apache/MySQLは停止済みで起動禁止。
- Dockerは `C:\dev\legacy-htdocs` のみ参照。旧htdocs 58,143ファイルと部分退避574ファイルはDocker非依存・削除禁止。
- Git管理外のmigration-backup / legacy-htdocsは、ディスク故障対策として別媒体・別端末への保全が必要。
