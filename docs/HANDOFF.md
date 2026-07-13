# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-13
- **コミット**: agent-env `c642d4a`（BP-6 Codex実機確定）／OMS `eb758d8`（作業開始時 HEAD）

## 直前にやったこと
- BP-6 Codex 側レビュー機構を R-9 実機確認し、`spawn_agent(fork_turns="none")` で新規文脈の独立レビューを自動起動できると確定。
- `pr-flow review` の `status=required` と生成プロンプト、CONFIRMED / SUGGESTION の2区分返却を使い捨てリポジトリで実走確認。
- agent-env の `pr-flow` SKILL.md・BP-6 計画・HANDOFFを更新し、完了済み手順書を削除。
- OMS の SHARED-MEMORY に Codex 標準起動手順を永続事実として記録。
- agent-env 本番差分の独立レビュー4回で確定欠陥6件を修正。上限到達時はユーザー承認を得て追加サイクルを実施し、#4 clean。

## 次にやるべきこと
1. Phase 2 の次作業はユーザー指示待ち。
2. F-6 は未定義。着手時は目的・対象範囲・完了条件を確認してから計画へ追加。
3. Phase 3 は「モックアップ完了」の明示宣言がない限り開始しない。

## 今だけの申し送り
- PowerShell では `sh` が PATH に無いため、pr-flow は `C:\Program Files\Git\bin\sh.exe` を実体指定して実行する。
