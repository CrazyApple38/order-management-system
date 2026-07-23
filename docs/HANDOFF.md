# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-24
- **コミット**: `master` の `cdec203`（PR #33 マージ済み）

## 直前にやったこと
- PR #32: SL（screen-layout.html）の応援/応援予約バッジを社員と同じ DS カプセル型へ統一（人物アイコン無し・中立グラデ・緑廃止・配置列チップ高さ32px）→ master マージ済み。
- PR #33: 応援チップの×ボタンを社員バッジ（`.assigned-employee .remove-btn`）と同一へ（右上角の赤丸+白×・absolute・hover表示）→ master マージ済み。
- いずれも CSS のみ（`screen-layout.css`）・JS/挙動非変更。DS監査 NG=0・Docker+Chrome 検証済み。決定は SHARED-MEMORY「SL 応援バッジのカプセル化（2026-07-22）」に記録。

## 次にやるべきこと
1. **新しいセッションで SL のデザイン細部修正を継続**する。
2. まずユーザーに修正箇所を順に確認してから着手。指示外の色・形・サイズ・配置は絶対に触らない。
3. 修正前に現状を Docker + Chrome で確認し、視覚変更ごとに実画面検証。緑シェルへ戻さない等の既存決定は SHARED-MEMORY を参照。

## 今だけの申し送り
- 未追跡 `_ai-inbox/` は既存ファイル・PR対象外。ai-inbox 未処理2件の蒸留は別タスクとして保留中。
- XAMPP起動禁止。ローカル確認はDockerの `http://localhost/order-management-system/`。
- 内部ブラウザ（Claude in Chrome）拡張が未接続のため、検証は Playwright MCP + 実機Chrome で実施（2026-07-12 フォールバック運用）。
- 検証時にDOMへ要素インラインstyleを注入しない（localStorage保存の恐れ）。×表示確認等は head の一時 `<style>`＋確認後除去で対応。
