# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Fable 5）
- **日付**: 2026-07-14
- **コミット**: `claude/docker-plan-worktree-note` ブランチ（直前 = PR #17 `cd224b0`。PR 予定）

## 直前にやったこと
- **XAMPP → Docker 全面移行の計画書を新規作成**: `docs/plan/docker-migration-plan.md`（SSOT）。ユーザー確定方針 = ポート80 URL完全互換で XAMPP 廃止 / OMS を `C:\dev` へ移動 / legacy PHP 群 + MariaDB 全DBも移行 / orca worktree 配信も Docker 対応 / Next.js・Supabase は環境のみ（Phase 3 前倒ししない）。
- フェーズ D-0〜D-7 に受け入れ基準・既知の分岐・ロールバック・ユーザー確認ゲートを明記（他 AI / 下位モデル実装前提）。
- SHARED-MEMORY: プロジェクト決定 + アクティブな計画書に追記。
- **追補（PR #17 マージ後）**: Docker 移行は **orca worktree 不使用・main 直列実施**の制約を計画書 §2.4 / D-3・D-5 前提条件へ明記（D-3 のリポジトリ移動が linked worktree の絶対パス参照を全破壊するため）。

## 次にやるべきこと
1. **Docker 移行の実装は D-0（棚卸し・バックアップ）から**。着手前に計画書全読 + フェーズごとユーザー確認（§2 厳守）。
2. **D-3（OMS リポジトリ移動 + AI 環境引っ越し）は Claude Code 自身が実施推奨**（Codex 担当時は手順4をスキップし引き継ぎ明記）。
3. F-6 は未定義。Phase 3 は「モックアップ完了」宣言待ち（従来どおり）。

## 今だけの申し送り
- D-4 完了までは XAMPP を一切変更しない設計（並走検証・一時ポート 8080/13306）。XAMPP を止めるのは D-5 のみ。
- 本計画の実装で乖離が出たら計画書 §2.2 プロトコル（既知の分岐 → 無ければ停止してユーザー確認）に従うこと。
