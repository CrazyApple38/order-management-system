# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-06
- **コミット**: 6c39402（直前 HEAD・本セッション分は本コミットに含む）

## 直前にやったこと（最新のみ）

- **R-3a 着手条件の配色テーマを検討 → 方針転換**。10候補比較ツール `docs/preview/design-refresh-theme-palettes.html` を作成し runtime 確認（コンソール0・切替動作OK）。だが「Slate Mono＋青灰グラデ変動」の議論が**当初計画（DS第一条＝全面 `to bottom right` グラデ・テキスト無地は既に既定済）とズレやすい**と判明。→ **ユーザー判断: 色変更/変動機能は後回し、当初計画どおり現行DS（`ds-tokens.css`/`ds-components.css`）で実装**（計画書 §5 フォールバック）。比較ツールはリポジトリに保持（後回しの色機能用の参考）。
- **右プロパティ = 4モード**（現場詳細／社員配置／車両・ETC／変更履歴）確定。
- **R-3a 実装計画を作成・承認・plan へ記録**（mockup-refactor-plan §R-3 の「R-3a 実施ブレークダウン」）。staged 分割 / minimap「配置状況」=総数は stat-strip・行一覧は撤去 / ベルは rail（03§1）。
- 教訓メモリ `feedback_color_work_ground_in_plan` 追加（色は既存DS仕様を先に確認・引用してから／主観選択肢を連射しない）。

## 次にやるべきこと

- **R-3a-1 着手**: プレビューモック `design-refresh-sl-layer-mockup.html` の骨格/CSS を本番 `docs/screen-layout.html` へ移植。`co-tokens.css` を外し `ds-tokens.css`→`ds-components.css` を読込、骨格を `app/menubar/toolbar/workspace(rail|main-card|prop|panel-rail)` へ再構成、中央7列表を本番データで描画。**既存9モーダルは一旦残置**（機能維持）。→ 見た目=新DS・データ描画・回帰ゼロを確認。
- **大規模のため R-3a-1 は完結単位で**（途中で本番HTMLを壊さない）。不変条件（03 §5 技術注意）厳守: script 読込順 / cnJump 同タブ / showFocusOverlay / seed・target 固定文字列禁止 / smCategoryClassMap・smShiftClassMap / D&D / 区分円GC色（applyBelongVariables）。

## 今だけの申し送り（任意）

- 比較ツール `design-refresh-theme-palettes.html` はリポジトリに保持。色変動を再開する時の出発点（不要なら撤去可）。
- R-3a-1 は 117KB の `screen-layout.css` と 7801行の `screen-layout.js` に触れる。CSS は ds へ寄せ、JS 資産（renderGrid/D&D/保存/通知）は新骨格へ配線し直す方針。
