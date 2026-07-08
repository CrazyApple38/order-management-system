# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Sonnet 5)
- **日付**: 2026-07-08
- **コミット**: 本コミット（親=59364e5）。**R-3c（WS）は前コミットで全段階完了済み**（Claude実装 + Codexフォロー修正）。本コミットは**ドキュメント肥大化監査・是正**（機能変更なし）。次は R-3d LA。

## 直前にやったこと（最新のみ）

- **ドキュメント肥大化監査**（ユーザー依頼）: `wc -l -c` で実測し、`docs/SHARED-MEMORY.md`（毎回全読）が自己ルール「古い行は削除」を守れておらず20行/8,682字まで膨張していたことと、`docs/plan/notification-refactor-plan.md`（122KB完了済み計画書）が「進行中プロジェクト参照ルール」で全読対象のままだったことを発見。ユーザーにAskUserQuestionで是正案を確認の上、**SHARED-MEMORY.md の古い構造的変更履歴12行（2026-05-25〜06-01・R-2で上書き済み）を4行へ圧縮**＋**notification-refactor-plan.md 末尾に§18完了サマリを追加**＋**CLAUDE.md/AGENTS.mdの参照ルールに「完了済み計画書は完了サマリ節のみで足りる」例外を追記**（commit `59364e5`）。
- 直前の R-3c-3（commit `5719c7c`→`47d7c1c`）: WS通知rail cn-card+履歴配線が完了。詳細は git log 参照。

## 次にやるべきこと

- **R-3d LA（leave-application.html）新DS適用**: 着手前に `docs/plan/mockup-refactor-plan.md` と `docs/design-system/03_screen-application.md` の LA 節（3モード×作業面連動+ミニカレンダー prop-card 上部常設）を確認。
- LA/QA で通知履歴パネルを実装する際は、R-3c-3 で見つかった2つの落とし穴（外側クリック解除リスナーの有無確認／popupは開いた状態でスクショ。詳細はClaude私的メモリ `notify-rail-pitfalls`）を必ずチェックする。
- R-3 全体完了後に、色の細かいズレ・直書き hex・画面間余白/密度の横断レビューをまとめて行う（Codex申し送り、継続）。
- 他の完了済み大型計画書（`design-refinement-plan.md`等）も、同様の「完了サマリ追加」パターンが適用できないか将来的に検討可（今回は notification-refactor-plan.md のみ対応）。

## 今だけの申し送り（任意）

- WS の休み行ピンク系残りや直書き hex は今回の対象外（Codex申し送り、継続）。OB の `shield.svg` 404 は既知・未対応。
- Playwright の孤立 Chrome ロックが出たら該当プロファイルのみ kill。
