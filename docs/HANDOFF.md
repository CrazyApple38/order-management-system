# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Sonnet 5)（Codex (GPT-5) の同日フォロー修正を統合してコミット）
- **日付**: 2026-07-08
- **コミット**: 本コミット（親=5719c7c）。**R-3c（WS）全段階が完了** — R-3c-3 実装（Claude）＋直後の `.cn-card` 表示クリップ修正（Codex）を統合。次は R-3d LA。

## 直前にやったこと（最新のみ）

- **R-3c-3（Claude, commit 5719c7c）**: 統合ベルDOMを `.rail` へ移設、変更履歴を「選択セル」パネルへ埋め込み（`wsRenderHistorySection`）、cn:jump着地時に `selectedCell` を再設定してパネルを追従させる修正、**および** 通知カード委譲クリック（`.cn-item-row.click()`）がWS固有の「グリッド外クリックで選択解除」リスナーに誤反応し選択セルが即解除される不具合を発見・修正（`.rail`/`.cn-card`/`.cn-panel` を解除除外に追加）。
- **直後のフォロー修正（Codex, 本コミットで確定）**: `.cn-card`（通知ドロップダウン）が `.rail` 移設後も共通 `.workspace{overflow:hidden}` の影響でクリップされ**画面上に表示されない**バグを実動作確認で発見。`docs/mockup/ws-ds.css` に `.ws-workspace .rail { overflow: visible; }` / `.ws-workspace .cn-card { right: auto; }` を追加し `ws-ds.css?v=6` へキャッシュバスター更新。Claude 側で再度 Playwright 再検証（ベル open→17件表示・カテゴリフィルタ・cn:jump着地・履歴パネル、コンソールエラー0）して確定。
- 両修正とも他画面（OB/SL/LA/QA）へは無影響（WS専用ファイルのみ）。
- Obsidian（Claude私的メモリ）へ本セッションの技術的教訓を記録済み: 「`.cn-item-row`委譲clickの実DOMバブル」と「popup移設は開いた状態のスクショ必須（DOM評価だけでは表示クリップを検知できない）」の2点。

## 次にやるべきこと

- **R-3d LA（leave-application.html）新DS適用**: 着手前に `docs/plan/mockup-refactor-plan.md` と `docs/design-system/03_screen-application.md` の LA 節（3モード×作業面連動+ミニカレンダー prop-card 上部常設）を確認。R-3c の詳細段階計画（`vivid-swinging-elephant.md`相当）が必要か判断してから着手。
- LA/QA で通知履歴パネルを実装する際は、上記の2つの落とし穴（外側クリック解除リスナーの有無確認／popupは開いた状態でスクショ）を必ずチェックする。
- R-3 全体完了後に、色の細かいズレ・直書き hex・画面間余白/密度の横断レビューをまとめて行う（Codex申し送り、継続）。

## 今だけの申し送り（任意）

- WS の休み行ピンク系残りや直書き hex は今回の対象外。R-3 全体完了後の横断品質チェック候補（Codex申し送り、継続）。
- OB の `shield.svg` 404 は既知・未対応。
- Playwright の孤立 Chrome ロックが出たら該当プロファイルのみ kill。
