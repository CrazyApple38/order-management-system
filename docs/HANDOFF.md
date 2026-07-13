# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Opus 4.8）
- **日付**: 2026-07-13
- **コミット**: OMS `claude/orca-worktree-workflow` ブランチ（本コミットで更新／作業開始時 HEAD `7b2161d`。PR 予定）

## 直前にやったこと
- orca × git worktree 並列開発環境を新設。ラッパー `scripts/orca-wt.sh`（new/drop/list）を実装。
- orca 実測: worktree は htdocs 外（`C:\Users\Owner\orca\workspaces\…`）／ブランチ `<gitUsername>/<name>` 固定／htdocs 内 junction で `http://localhost/oms-wt-<name>/` HTTP 配信可（curl 200 実証）。
- 独立レビュー2回（general-purpose・実装文脈非継承）: round1 で確定欠陥3件修正（`.cmd` の -x→-f 検出／`list` 終了コード／orca 不在時メッセージ分岐）→ round2 clean。SUGGESTION「junction 失敗時 URL 非表示」を採用。
- 計画書 `docs/plan/orca-worktree-workflow-plan.md` 新設・`docs/SHARED-MEMORY.md` 追記。

## 次にやるべきこと
1. PR の CI（quality-gate）green → automerge（非視覚のみ＝自動マージ）。
2. HANDOFF 並列化（plan §5）は暫定ルール「worktree 作業中は HANDOFF を触らず PR で引き継ぐ」。恒久設計は運用後に詰める。
3. F-6 は未定義。着手時は目的・対象範囲・完了条件を確認してから計画へ追加。
4. Phase 3 は「モックアップ完了」の明示宣言が無い限り開始しない。

## 今だけの申し送り
- pr-flow / orca-wt は PowerShell では `sh` が PATH に無いため Git Bash（`C:\Program Files\Git\bin\sh.exe`）で実行。
- orca-wt の round-2 追加 SUGGESTION（node 事前チェック順・`drop` の name 検証・ORCA_BIN 実在確認 等）は未適用。必要なら follow-up。
