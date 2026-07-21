# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-22
- **コミット**: ブランチ `claude/sl-support-badge-capsule`（base = `master` の `aa00207`）

## 直前にやったこと
- SL（screen-layout.html）の応援/応援予約バッジを社員バッジと同じ DS カプセル型へ統一（ユーザー承認済み）。
- `screen-layout.css` の `.sl-support-tag`（ドック応援予約）と `.assigned-support`（配置列チップ）を緑シェル→カプセル材質（pill・白ベベル縁・青灰グラデ・2層影・`--ink`）へ置換。人物アイコンは付けない・色は社員と同じ中立グラデ（緑廃止）。プリセット「応援」の灰別扱いも廃止。配置列チップは社員と同じ高さ32pxに統一。
- CSSのみ（JS/挙動非変更）。DS監査 NG=0・コンソールエラー0・Docker+Chromeで実画面検証済み。

## 次にやるべきこと
1. PR作成（submit）→ CI（quality-gate）green 確認。視覚変更のため automerge はユーザー確認後に手動マージ（見た目はユーザー承認済み）。
2. SLデザイン修正の残りをユーザーと継続。指示外の色・形・サイズ・配置は変更しない。

## 今だけの申し送り
- 未追跡 `_ai-inbox/` は既存ファイル・PR対象外。ai-inbox 未処理2件の蒸留は別タスクとして保留中。
- XAMPP起動禁止。ローカル確認はDockerの `http://localhost/order-management-system/`。
- 内部ブラウザ（Claude in Chrome）拡張が未接続だったため、検証は Playwright MCP + 実機Chrome で実施（2026-07-12 フォールバック運用）。
- 検証時にDOMへインラインstyleを注入しない（localStorage保存の恐れ）。
