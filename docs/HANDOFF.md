# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-13
- **コミット**: agent-env `7333afa`（BP-6 本体）／本 PR = OMS `claude/bp6-shared-memory`（doc 記録のみ）

## 直前にやったこと
- **BP-6（独立レビュー自動化）完了**。`pr-flow review` サブコマンド新設（agent-env `7333afa`・両AI junction 配備）。確定差分が独立レビュー発動基準に該当するか判定→該当時に実装文脈非継承レビュー用プロンプトを生成。判定は `_review_detect` に共通化し submit のソフト警告（非ブロック）と共用。反復ループ（最大2回＋エスカレーション）を SKILL.md に明文化。
- ドッグフード独立レビュー2回で確定欠陥2件（core.quotePath 未無効化で日本語パス分類崩壊／未追跡の単語分割で行数過小計上）を修正、#2 clean。
- 本 OMS PR は SHARED-MEMORY に BP-6 完了を記録＋HANDOFF 更新（md のみ＝`auto-merge-ok` 見込み）。

## 次にやるべきこと
1. 本 PR（`claude/bp6-shared-memory`）は md のみ＝CI green で auto-merge 成立見込み。
2. 次の実装はユーザー指示待ち。**F-6 は未定義**（Codex 確認済み）— 着手時は目的・対象範囲・完了条件をユーザーへステップ確認し、合意後に SSOT `docs/plan/mockup-master-account-plan.md` へ追加。
3. Phase 3 は「モックアップ完了」の明示宣言がない限り開始しない。
4. Codex 側サブエージェント機構の R-9 実機確認（BP-6 の Codex 自動化可否）は未実施＝別途 Codex セッションで。

## 今だけの申し送り
- `pr-flow review` は両AI junction 配備済み（Codex も利用可・SKILL.md 参照）。
- F-0〜F-5 の再検証証跡は `docs/verification/f0-f5-verification-report.md` を正とする。
