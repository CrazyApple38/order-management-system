# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Fable 5）
- **日付**: 2026-07-14
- **コミット**: `claude/docker-migration-d1` ブランチ（直前 HEAD `9c45af7`）

## 直前にやったこと
- D-0 完了（WSL 2.7.10 + Docker Desktop 4.81.0 導入・hello-world 合格・PR #19 マージ済み）。
- D-1 完了: `C:\dev\web-stack` 構築（php:8.2-apache + mariadb:10.4 + phpMyAdmin・:8080/:13306 で XAMPP 並走）。§5.1 全合格（legacy 3件+OMS+phpMyAdmin 200・DB 3本 dump 突合一致・主要6テーブル行数一致）。
- 分岐: DB 突合は dump 基準へ代替 / pma に AllowNoPassword 設定追加 / ftp 拡張は legacy 未使用で見送り。詳細は計画書 §4.2 D-1 実績。

## 次にやるべきこと
1. web-stack の GitHub private リポジトリ作成（名称・可視性はユーザー確認 → push）。
2. D-2（legacy DB 接続修正）は **着手前にユーザー確認**。接続定義の棚卸し→ユーザー確認ゲート→ `db` へ修正（.bak-xampp 必須）。
3. `basarak28_*` ユーザーの権限は D-2 で PHP 設定から逆引きし 90-users.sql へ追記・再構築。

## 今だけの申し送り
- web-stack は起動中（`docker compose ps` で3サービス running）。止める場合は `cd C:\dev\web-stack && docker compose down`（-v を付けると DB 初期化からやり直し）。
- XAMPP MariaDB は破損のため起動しないこと（読み取りは `--skip-grant-tables` 限定）。Apache の起動は任意（:80 と :8080 は競合しない）。
- Docker Desktop はサインイン済み（Personal / crazyapple38）。
