# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-22
- **コミット**: ブランチ `claude/sl-support-remove-btn`（base = `master` の `e6fb1b6`）

## 直前にやったこと
- PR #32 で SL 応援/応援予約バッジを社員と同じ DS カプセル型へ統一（人物アイコン無し・中立グラデ・緑廃止）→ master マージ済み（`e6fb1b6`）。
- 続けて、応援チップ配置列の×ボタンが社員と違う指摘を受け修正（本ブランチ）。`screen-layout.css` の `.sl-support-remove-btn` を社員 `.assigned-employee .remove-btn` と同一（右上角の赤丸+白×・absolute・14px円・hover時 display:block）へ。
- CSSのみ（JS/挙動非変更）。DS監査 NG=0・コンソール0（favicon除く）・Docker+Chromeで社員×と一致を確認。

## 次にやるべきこと
1. 本ブランチをコミット→PR→CI green→視覚変更のためユーザー承認済み前提で手動マージ。
2. SLデザイン修正の残りをユーザーと継続。指示外の色・形・サイズ・配置は変更しない。

## 今だけの申し送り
- 未追跡 `_ai-inbox/` は既存ファイル・PR対象外。ai-inbox 未処理2件の蒸留は別タスクとして保留中。
- XAMPP起動禁止。ローカル確認はDockerの `http://localhost/order-management-system/`。
- 内部ブラウザ（Claude in Chrome）拡張が未接続のため、検証は Playwright MCP + 実機Chrome で実施（フォールバック運用）。
- 検証で×表示確認に head の一時 `<style>` を使用（要素インラインstyleは注入せず・確認後に除去）。localStorage汚染なし。
