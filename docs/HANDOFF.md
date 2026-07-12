# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-12
- **コミット**: 直前HEAD（本 PR = `claude/bp3-pr-template`）

## 直前にやったこと
- **agent-env BP-3 完了（自動ブランチ・自動 PR）**: 両AI共通の `pr-flow` スキル新設（`start <topic>`=ブランチ作成 / `submit`=push + `gh pr create`）。OMS に `.github/pull_request_template.md`（5節: 変更概要／視覚変更の有無〈自己申告〉／独立レビュー記録／受け入れ基準／テスト結果）を追加。**この PR 自体を `pr-flow` で作成して実地ドッグフード**。詳細= agent-env `docs/plan/pr-workflow-automation-plan.md` BP-3。
- BP-2（前）: `.github/workflows/pr-checks.yml`（`quality-gate`）+ GitHub ruleset（id 18830708・airtight）で OMS master を GitHub 側でも保護。

## 次にやるべきこと
1. **今後の OMS 変更は例外なくブランチ + PR + CI green**。着手= `pr-flow.sh start <topic>` → 実装 → コミット → `pr-flow.sh submit --title <t> --body-file <埋めたテンプレ.md>` → CI green → マージ（非視覚=可 / 視覚=ユーザー確認後）。
2. agent-env の次フェーズは **BP-4（条件付きマージ: 非視覚=CI green でサイレント自動 / 視覚=確認後）**。着手はユーザーの「BP-4 開始」宣言待ち。
3. F系はF-0〜F-5完了。次の実装（G-2 等）はユーザー指示を確認。Phase 3 は「モックアップ完了」宣言なしで進まない。

## 今だけの申し送り
- 条件付き自動マージ（非視覚=CI green で自動 / 視覚=確認後）は BP-4。現時点は CI green・mergeable を確認してから人手マージ。計画は agent-env `docs/plan/pr-workflow-automation-plan.md`。
- Playwright は AI 別プロファイル分離済み・HTTP ポート Claude=8765/Codex=8766（SHARED-MEMORY 参照）。
