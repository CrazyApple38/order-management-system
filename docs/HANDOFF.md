# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-13
- **コミット**: 直前HEAD（本 PR = `claude/bp4-conditional-merge`）

## 直前にやったこと
- **agent-env BP-4 完了（条件付きマージ）**: リポジトリの「Allow auto-merge」を有効化。CI（`.github/workflows/pr-checks.yml`）に **`classify` ジョブ**を追加し、変更ファイルを視覚/非視覚で判定して PR にラベル付与（`auto-merge-ok` / `needs-visual-review`）。判定ロジックの単一情報源 = **`scripts/ci/classify-changed-files.js`**（安全側=疑わしきは視覚扱い、パス表は計画書 §2B）。`classify` は非 required（`quality-gate` のみ required 維持）。両AI共通の **`pr-flow.sh automerge`** を追加: 非視覚のみ=`gh pr merge --auto --squash` でサイレント自動マージ／視覚=自動マージせずユーザー確認へ。**この PR 自体が非視覚のみ = auto-merge-ok の実地ドッグフード**。詳細= agent-env `docs/plan/pr-workflow-automation-plan.md` BP-4。
- BP-3（前）: `pr-flow` スキル（start/submit）+ PR テンプレ5節。

## 次にやるべきこと
1. **今後の OMS 変更はブランチ + PR + CI green**。`pr-flow.sh start <topic>` → 実装 → コミット → `submit` → **`automerge`**（非視覚=自動 / 視覚=CI green・見た目確認後にユーザー承認 → 手動マージ）。
2. agent-env の次フェーズは **BP-5（検証・運用定着: verify.ps1 に ruleset/required-checks/workflow 存在確認を追加、標準フロー文書化）**。着手はユーザーの「BP-5 開始」宣言待ち。§2A（agent-env 自身への横展開）も未実施。
3. F系はF-0〜F-5完了。次の実装（G-2 等）はユーザー指示を確認。Phase 3 は「モックアップ完了」宣言なしで進まない。

## 今だけの申し送り
- **視覚変更を含む PR は自動マージ禁止**。`automerge` は `needs-visual-review` ラベルで有効化を拒否し人手確認を案内する。AI は勝手にマージ可否を判断しないこと（計画書 §0）。
- Playwright は AI 別プロファイル分離済み・HTTP ポート Claude=8765/Codex=8766（SHARED-MEMORY 参照）。
