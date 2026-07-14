# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-orca-wt` ブランチ（直前 HEAD `0a6c3c6`）

## 直前にやったこと
- D-4 完了: Windows junctionはDocker越しに解決不能（403）だったため、既知の分岐どおりorca workspacesルートをweb-stackへread-only直接マウント。
- `scripts/orca-wt.sh` はjunction操作を廃止し、new/drop/listとDocker配信URL対応へ変更。HTTP_PORTはweb-stack `.env` に追従する。
- 実worktreeでnew/list・`docs/index.html`/`order-book.html` 200・drop後404を確認。独立レビュー2回の確定欠陥は全修正済み。

## 次にやるべきこと
1. **以後の作業はすべて新パス `C:\dev\order-management-system` で行う**（旧パスは触らない）。
2. D-5（切替・XAMPP停止・legacy-htdocs移動・80/3306切替）— **破壊的操作のため着手前と各ステップでユーザー確認**。
3. D-5前にD-0バックアップ実在、worktreeゼロ、CI復旧状況を再確認する。

## 今だけの申し送り
- web-stack 起動中（:8080/:13306・OMS は新パスから配信中）。XAMPP MariaDB は破損・停止のまま起動禁止。
- 旧 `C:\xampp\htdocs\order-management-system` のリネーム退避は未実施。旧パスは残骸として触らない。
- GitHub Actions障害が継続中なら、計画書§4.4記録のユーザー承認済み緊急時手順を使う。ローカル品質ゲートは必ずgreen確認。
- web-stack変更はcommit `82905bb`・Draft PR #1（`codex/docker-orca-wt`）。
