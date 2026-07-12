# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-12
- **コミット**: 直前HEAD（本 PR = `claude/bp2-ci-ruleset`）

## 直前にやったこと
- **agent-env BP-2 着手（CI + GitHub ruleset）**: `.github/workflows/pr-checks.yml` を新設。`on: pull_request`(master 対象) でローカル pre-commit Stage 2 と同一の3チェック（ds-audit 全体 NG=0 必須 / 変更 *.js に node --check / 変更 *.json を JSON.parse）を二重化。npm ci なし（3チェックとも node 標準モジュールのみで依存不要）。ジョブ名 `quality-gate` を ruleset の required check に登録予定。
- BP-1（前セッション）: OMS を branch + PR 運用へ移行、`workflow.protectMaster: true` で master 直コミットを pre-commit v4 がブロック。

## 次にやるべきこと
1. 本 PR を CI green 確認 → マージ後に GitHub ruleset を `gh api` で有効化（master 直 push 禁止・PR 必須・required check=`quality-gate`・**管理者 bypass なし=airtight**）。
2. **今後の OMS コミットは必ずブランチで**（master 直コミットはブロックされる）。緊急時のみ `AGENT_ENV_ALLOW_MASTER=1` / `--no-verify`（ただし ruleset 有効化後は GitHub 側は airtight）。
3. F系はF-0〜F-5完了。次の実装（G-2 等）はユーザー指示を確認。Phase 3 は「モックアップ完了」宣言なしで進まない。

## 今だけの申し送り
- BP-2 時点も PR マージは**手動**（CI green → ユーザー確認 → `gh pr merge --squash --delete-branch`）。自動 PR は BP-3、条件付き自動マージは BP-4。計画は agent-env `docs/plan/pr-workflow-automation-plan.md`。
- Playwright は AI 別プロファイル分離済み・HTTP ポート Claude=8765/Codex=8766（SHARED-MEMORY 参照）。
