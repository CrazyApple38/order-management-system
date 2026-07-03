# デザインシステム「Calm Operations」— 正本（SSOT）

**最終更新**: 2026-07-03 / Claude Code (Fable 5)
**ステータス**: v1.0（コンポーネントカタログ37件 全採用確定を反映）

受注管理システム（OMS）モックアップ全画面に適用する新デザインシステムの正本。
**どの AI（Claude / Codex / Gemini ほか）・どの人間が実装しても同じデザインに収束する**ことを目的に、
判断余地を残さない形で「原則・トークン・コンポーネント・適用手順・検証」を定める。

---

## 1. 正本の構成と優先順位

| 種別 | 正本 | 内容 |
| --- | --- | --- |
| **トークン値**（色・影・角丸・タイポ） | `docs/mockup/ds-tokens.css` | CSS カスタムプロパティ。**値はここからコピーする。再発明禁止** |
| **コンポーネント CSS** | `docs/mockup/ds-components.css` | 全コンポーネントのクラス定義（プレビューモックから機械抽出） |
| **DOM 構造の見本** | `docs/preview/design-refresh-components.html`（37件カタログ）/ `docs/preview/design-refresh-sl-layer-mockup.html`（レイアウト骨格） | 実際に動く見本。**これらのプレビューは参照専用・改変禁止** |
| **規範・使用ルール・禁止事項** | 本ディレクトリの 01〜04 | 下記の読み順で参照 |

**矛盾時のルール**: `ds-tokens.css` / `ds-components.css` の実値 > プレビューモック > 文書の記述。
矛盾を発見した AI は**勝手に直さず**、矛盾の内容をユーザーへ報告すること。

## 2. 文書の読み順（実装セッション開始時）

1. `README.md`（本書）— 全体像と正本の所在
2. `01_principles-and-tokens.md` — 原則（光源第一条・公式例外・使用権）・意味色・トークン
3. `02_components.md` — コンポーネント仕様（37件 + レイアウト骨格）・語彙ファミリー
4. `03_screen-application.md` — 画面別リファクタリング設計（SL / OB / WS / LA / QA）
5. `04_ai-implementation-guide.md` — AI 実装プロトコル・準拠チェックリスト・検証手順

※ プロジェクト全体の実施順序（R-1〜R-6）の SSOT は `docs/plan/mockup-refactor-plan.md`。
本ディレクトリは「何をどう作るか（設計）」の正本であり、「いつやるか（計画）」は計画書側が正。

## 3. 変更手順（トークン・コンポーネントを変えたいとき）

1. **値・見た目の変更は必ずユーザー承認を得る**（AI の自己判断での追加・変更は禁止）
2. 承認後、`ds-tokens.css` / `ds-components.css` を更新し、本ディレクトリの該当文書を同期
3. 影響が横断的なら `docs/SHARED-MEMORY.md`（両 AI 共有の永続事実）へ 1 行追記
4. プレビューモック（design-refresh-*.html）は歴史的正本として原則触らない

## 4. 関連ファイル

- `docs/preview/ds-foundation-test.html` — 基盤 CSS 単体読込のスモークテストページ（回帰確認用）
- `screenshots/ds-foundation-test.png` — スモークテストの合格スクリーンショット（2026-07-03）
- `docs/plan/design-refresh-plan.md` — デザイン刷新の経緯・診断・判断記録（歴史的経緯の正本）
- `docs/plan/mockup-refactor-plan.md` — 適用フェーズ（R-1〜R-6）の実施順序 SSOT
- `docs/mockup/co-tokens.css` — **旧 DS（Plaster UI）。新 DS とトークン名が同名・別値のため同一ページに併載禁止**。R-3 完了まで既存画面用に併存、全画面移行後に廃止予定
