# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-d6-env` ブランチ（直前 HEAD `6782a2e`）

## 直前にやったこと
- D-6完了: `docker/compose.yaml` にmock-webとNode 22 app profileを追加し、Node.js v22.23.1を確認。
- Supabase CLI 2.109.1をnpm開発依存へ固定し、既存migrationsを保って `supabase/config.toml` を生成。
- WindowsではDocker API 2375を公開せずAnalyticsを無効化。全有効サービス、API/DB/Studio、ポート無競合を確認後に停止。

## 次にやるべきこと
1. D-7（ノートPC再現手順書）は別途ユーザー確認を得て着手する。
2. 旧 `C:\xampp\htdocs` と部分退避 `htdocs_MOVED-20260714` の整理は、全関連セッション終了後にユーザー判断で行う。
3. Next.js scaffold・Supabaseスキーマは「モックアップ完了」宣言まで禁止。

## 今だけの申し送り
- web-stack起動中（HTTP 80 / DB 3306）。XAMPP Apache/MySQLは停止済みで起動禁止。
- Dockerは `C:\dev\legacy-htdocs` のみ参照。旧htdocs 58,143ファイルと部分退避574ファイルはDocker非依存・削除禁止。
- D-6のapp profileとSupabaseは停止中。ローカルデータはDocker volumeに保持。
