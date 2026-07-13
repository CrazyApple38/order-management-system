# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Fable 5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-migration-d0` ブランチ（直前 HEAD `598b2a0`）

## 直前にやったこと
- ユーザー承認のもと WSL 2.7.10（`--no-distribution`）+ Docker Desktop 4.81.0 を導入代行（UAC承認・OS再起動はユーザー）。
- 再起動後に `docker --version`（29.6.1）/ `docker compose version`（v5.2.0）/ `hello-world` 成功を確認 — **D-0 受け入れ基準を全達成・D-0 完了**。
- Docker Desktop のサインインは不要のため Skip 運用（アカウント未作成）。
- 計画書 §4.1 実績・実績ログ・ステータス行を D-0 完了へ更新。

## 次にやるべきこと
1. 本ブランチ（Codex の D-0 記録 + 本更新）を pr-flow review→commit→submit→automerge。
2. D-1（web-stack 構築・:8080 で XAMPP 並走）は **着手前にユーザー確認**（§2.1）。
3. D-1 では db-init に個別 dump 3 本 + 90-users.sql を使う（破損 `mysql` スキーマは入れない）。

## 今だけの申し送り
- XAMPP MariaDB は破損のため停止中・起動しないこと（読み取りが必要なら `--skip-grant-tables` 限定）。Apache の起動は任意。
- 正常dump: `keibi_system.sql` 206,868 bytes / `basarak28_zennippon.sql` 113,481 bytes / `zng_recruit_test.sql` 1,482 bytes（不完全な全DB dumpは `.PARTIAL-*` 名）。
