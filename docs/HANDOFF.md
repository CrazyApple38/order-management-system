# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-d7-close` ブランチ（直前 HEAD `944da0e`）

## 直前にやったこと
- D-7完了: OMSのノートPC再現手順とweb-stackの母艦災害復旧手順を整備・マージ済み。
- ユーザー判断により、ノートPC実機テストは今回行わず、実行可能な時点の将来課題へ分離。
- Docker移行計画のD-0〜D-7を全完了としてクローズ。

## 次にやるべきこと
1. ノートPCを使用できる時期に `docker/README.md` の再現手順を実機テストする。
2. 旧 `C:\xampp\htdocs` と部分退避 `htdocs_MOVED-20260714` の整理は、全関連セッション終了後にユーザー判断で行う。
3. Next.js scaffold・Supabaseスキーマは「モックアップ完了」宣言まで禁止。

## 今だけの申し送り
- web-stack起動中（HTTP 80 / DB 3306）。XAMPP Apache/MySQLは停止済みで起動禁止。
- Dockerは `C:\dev\legacy-htdocs` のみ参照。旧htdocs 58,143ファイルと部分退避574ファイルはDocker非依存・削除禁止。
- Git管理外のmigration-backup / legacy-htdocsは、ディスク故障対策として別媒体・別端末への保全が必要。
