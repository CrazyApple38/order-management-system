# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Fable 5）
- **日付**: 2026-07-13
- **コミット**: OMS `claude/rules-build` ブランチ（直前 = PR #15 `553b6df`。PR 予定）

## 直前にやったこと
- **CLAUDE.md/AGENTS.md 監査 → 生成方式へ移行**: 正本= `docs/rules/`（shared + claude-only/codex-only）、`node scripts/build-rules.js` で両ファイル生成（手編集禁止・pre-commit と CI の両方に `--check` 配線・`.gitattributes` で LF 固定）。独立レビュー2回（CONFIRMED 2件修正: CRLF 偽陽性／replace 特殊シーケンス）。Mockup Status 表を現状に最新化（E=休暇申請管理・F/G 完了状況、ユーザー承認済み）。TodoWrite 表記を現行ツール名に更新。グローバル rules/shared.md も圧縮（agent-env PR #2・−2.2KB/セッション）。
- 開発環境レビュー（OMS+グローバルハーネス横断）→ 確定問題4系統を修正。
- agent-env PR #1 マージ: **pre-commit v5**（linked worktree では HANDOFF ゲート免除）+ **session-start.ps1 worktree 検出**（worktree 内は「start 不使用・HANDOFF 非更新・引き継ぎ=PR本文」を注入）。OMS 実機で両モード検証済み・deploy 済み。
- OMS 本ブランチ: `orca-wt.sh` を main-root 解決に修正（worktree 内実行の誤動作解消）+ ぶら下がり junction 検出 + drop の自己削除ガード／CI に concurrency 追加／CLAUDE.md・AGENTS.md に「orca worktree 並列開発」節／計画書 §3・§5・§6 更新／SHARED-MEMORY に worktree 内 HANDOFF 非更新ルール追記。
- ~/.claude/settings.json の PreToolUse ガード matcher を `*`→`Bash`（実測 ~180ms/全ツールコールの除去）。
- GitHub ruleset 確認: required check は `strict=false`（up-to-date 必須なし）→ 並列 auto-merge は衝突がない限り順次マージされる。

## 次にやるべきこと
1. 本ブランチの PR → CI green → automerge（非視覚のみ想定）。
2. 実運用で Claude↔Codex 並列を1回回して §5 恒久設計（スレッド化等）の要否を判断。
3. F-6 は未定義。着手時は目的・対象範囲・完了条件を確認してから計画へ追加。
4. Phase 3 は「モックアップ完了」の明示宣言が無い限り開始しない。

## 今だけの申し送り
- worktree 内セッションは session-start が自動で worktree 運用を注入する（HANDOFF 更新不要・pre-commit も免除済み）。main 側は従来どおり本ファイル更新必須。
- pr-flow / orca-wt は PowerShell では `sh` が PATH に無いため Git Bash（`C:\Program Files\Git\bin\sh.exe`）で実行。
