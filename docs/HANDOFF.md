# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-12
- **コミット**: 直前HEAD（本 PR = `claude/bp2-docs`）

## 直前にやったこと
- **agent-env BP-2 完了（CI + GitHub ruleset）**: `.github/workflows/pr-checks.yml`（ジョブ `quality-gate`）でローカル品質ゲートを二重化（ds-audit 全体 NG=0 / 変更*.js に node --check / 変更*.json を JSON.parse・npm 依存なし）。**GitHub ruleset（id 18830708・active・airtight）有効化**: master 直 push 禁止・PR 必須・required check=`quality-gate`・**管理者 bypass なし**。実機検証済み（master 直 push 拒否 / CI 赤 PR はマージ不可 / green は通過）。詳細= SHARED-MEMORY「OMS master は branch + PR + CI 必須」。
- BP-1（前）: `workflow.protectMaster: true` で master 直コミットを pre-commit v4 がローカルブロック。

## 次にやるべきこと
1. **今後の OMS 変更は例外なくブランチ + PR + CI green**（master 直 push は GitHub 側でも拒否・管理者 bypass 不可）。手順: `claude/<topic>` ブランチ → `gh pr create` → CI green → `gh pr merge --squash --delete-branch`。
2. agent-env の次フェーズは **BP-3（自動ブランチ・自動 PR）**。着手はユーザーの「BP-3 開始」宣言待ち。
3. F系はF-0〜F-5完了。次の実装（G-2 等）はユーザー指示を確認。Phase 3 は「モックアップ完了」宣言なしで進まない。

## 今だけの申し送り
- 自動 PR は BP-3、条件付き自動マージ（非視覚=CI green で自動 / 視覚=確認後）は BP-4。現時点はマージ手動。計画は agent-env `docs/plan/pr-workflow-automation-plan.md`。
- Playwright は AI 別プロファイル分離済み・HTTP ポート Claude=8765/Codex=8766（SHARED-MEMORY 参照）。
