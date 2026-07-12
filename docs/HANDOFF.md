# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-12
- **コミット**: 直前HEAD（本 PR = `claude/bp1-protect-master`）

## 直前にやったこと
- **OMS を branch + PR 運用へ移行（agent-env BP-1）**: `.agent-env.json` に `workflow.protectMaster: true` を追加。以後 master 直コミットは pre-commit v4 がブロックする。実装は `claude/<topic>` / `codex/<topic>` ブランチ + PR で行う（詳細は SHARED-MEMORY「OMS は branch + PR 運用へ移行」）。
- 前セッション（Codex/GPT-5）: **F-5（マスタ変更通知+全体回帰）完了 → F-0〜F-5 全完了**。ds-audit NG=0 WARN=0、8 URL HTTP 200、既存6画面回帰OK（詳細は `1c5f736`）。

## 次にやるべきこと
1. **今後の OMS コミットは必ずブランチで**（master 直コミットはブロックされる）。緊急時のみ `AGENT_ENV_ALLOW_MASTER=1` / `--no-verify`。
2. F系はF-0〜F-5完了。次の実装（G-2 等）はユーザー指示を確認。
3. Phase 3には「モックアップ完了」宣言なしで進まない。

## 今だけの申し送り
- 現時点（BP-1）は PR 作成・マージは**手動**（`gh pr create` → `gh pr merge --squash --delete-branch`）。CI・GitHub ruleset・自動 PR・条件付き自動マージは agent-env `docs/plan/pr-workflow-automation-plan.md` の BP-2 以降。
- Playwright は AI 別プロファイル分離済み・HTTP ポート Claude=8765/Codex=8766（SHARED-MEMORY 参照）。
