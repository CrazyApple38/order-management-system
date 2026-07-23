# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-24
- **コミット**: `master` の `af7bb91`（作業ブランチ = `claude/sl-select-outline-flag-cleanup`）

## 直前にやったこと
- SL 中央表の**選択行の枠線を撤去**（発生源 `screen-layout.css` の `outline: 2px solid var(--accent-primary)` と `transition: outline` を削除、`sl-ds.css` の打ち消しも不要化）。**選択行の青背景 `--blue-soft` は維持**。
- 右プロパティ社員リストの**旧インジケータ `::before`（「休」朱 /「明け」#DECCBE）を `print-touo-nikkei.css` から削除**。DS カプセル `.person` の `overflow:hidden` に切られ左上に角だけ見切れていたため。表示は `.sl-mini-flag`（休 / 月アイコン）へ一本化。休み社員カプセルの薄赤着色は維持（ユーザー確認済み）。
- 独立レビュー（別エージェント）実施 = 確定欠陥0。主観提案のうち CSS 後片づけ（死に transition・枠線発生源・print CSS の古いコメント/空見出し）をユーザー承認のうえ実施。DS監査 NG=0 / コンソールエラー0（favicon 404 のみ）/ Docker + 実機Chrome 検証済み。

## 次にやるべきこと
1. PR 作成 → CI green → **視覚変更を含むためユーザー確認後に人手マージ**（`pr-flow automerge` の判定に従う）。
2. その後、SL デザイン細部修正の続きをユーザー指示ベースで継続する。指示外の色・形・サイズ・配置は触らない。

## 今だけの申し送り
- 枠線撤去により、選択行 `#eaf3ff` とホバー行 `rgba(31,95,174,0.035)` の差が淡い青の濃淡のみになった（視認性は検証時点で問題なし。弱く感じるならユーザー判断で再調整）。
- レビュー未着手の残提案: `screen-layout.js` の `emp-after-night` クラス付与が CSS 参照ゼロ（今回は JS 非変更と判断）。
- 未追跡 `_ai-inbox/` は既存ファイル・PR対象外。ai-inbox 未処理2件の蒸留は別タスクとして保留中。
- XAMPP起動禁止。ローカル確認はDockerの `http://localhost/order-management-system/`。
- 内部ブラウザ（Claude in Chrome）拡張が未接続のため、検証は Playwright MCP + 実機Chrome で実施。前セッションの Chrome が profile をロックしていた場合は残留プロセスを終了してから起動する。
