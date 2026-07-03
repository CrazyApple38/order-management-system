# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-03
- **コミット**: 0efa357（直前 HEAD・本作業は未コミット）

## 直前にやったこと（最新のみ）

- **R-1（DS基盤統合）完了**: カタログ37件を全採用確定（ユーザー宣言）として、新DS正本一式を作成。
  - `docs/mockup/ds-tokens.css` / `ds-components.css`（プレビュー2本から sed 機械抽出・2853行・波括弧バランス検証済）
  - `docs/design-system/` 仕様5冊（README / 01 原則・トークン / 02 コンポーネント / 03 画面適用設計 / 04 AI実装ガイド）
  - `docs/preview/ds-foundation-test.html` スモークテスト合格（コンソール0 / `screenshots/ds-foundation-test.png`）
- mockup-refactor-plan（R-1 完了・方式変更記録）/ SHARED-MEMORY（DS正本・併載禁止・追認待ち）を更新。

## 次にやるべきこと

- **次セッションの主題（ユーザー指示済み）**: SL の「サブ機能は右プロパティ（prop-card + panel-rail）へ集約して中央をスッキリさせる」思想を、SL 以外（OB/WS/LA/QA、必要ならセンター/admin-notify）へ展開する横断設計を `docs/design-system/03_screen-application.md` に追記する（設計のみ。実装は R-3 凍結ルールどおり）。基準の出発点は `design-refresh-plan.md` §4.3（右プロパティ化する対象 / モーダルに残すもの）
- **ユーザー追認待ち**: R-1 の方式変更「co-tokens.css 統合 → ds-*.css 新設」（同名別値トークン衝突が理由。無応答のため暫定採用）
- 03_screen-application.md §3.2 の「未定義ギャップ」（曜日セル色 / density 3段 / motion・z-index 移設）をユーザーと決める
- その後は R-2（通知データモデル改修・Codex と期間調整）

## 今だけの申し送り（任意）

- R-1 成果物一式はコミット済み（本コミット）。screenshots/ は gitignore 対象のためローカルのみ（`ds-foundation-test.png` = スモークテスト合格証跡）。
