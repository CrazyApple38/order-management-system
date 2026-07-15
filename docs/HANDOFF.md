# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-15
- **コミット**: `claude/d7-laptop-verified` ブランチ（直前 HEAD `444dc4a`）

## 直前にやったこと
- 旧 `C:\xampp\htdocs\order-management-system` を `order-management-system_MOVED-20260714` へリネーム退避（D-3 残の最終手順完了。orca 旧登録は不活性化）。
- ノートPCで D-7 実機再現テスト合格（clone → mock-web 起動 → 同一URL表示・ポート80のまま）。
- docker-migration-plan.md に合格を記録し残課題をクローズ。Docker移行計画は全項目完了。

## 次にやるべきこと
1. Docker移行は完了。通常のモックアップ開発（Phase 2）へ復帰。
2. 旧 `C:\xampp\htdocs` と退避フォルダ群（`htdocs_MOVED-*` / `order-management-system_MOVED-20260714`）の削除は保持期間後にユーザー判断。
3. Next.js scaffold・Supabaseスキーマは「モックアップ完了」宣言まで禁止。

## 今だけの申し送り
- web-stack起動中（HTTP 80 / DB 3306）。XAMPP Apache/MySQLは停止済みで起動禁止。
- Dockerは `C:\dev\legacy-htdocs` のみ参照。旧htdocs 58,143ファイルと部分退避574ファイルはDocker非依存・削除禁止。
- Git管理外のmigration-backup / legacy-htdocsは、ディスク故障対策として別媒体・別端末への保全が必要。
