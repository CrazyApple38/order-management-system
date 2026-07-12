# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-12
- **コミット**: `16dae21`（F-3完了文書・F-4実装/検証をcommit・push済み）

## 直前にやったこと
- **F-4（社員マスタ）実装・Chrome検証を完了**。社員CRUD、GC/組織連動、資格・配置制約の追加削除、対称同期、再読込復元を確認。
- `mock.oms.master.v1` をversion 4へ移行し、version 2/3の既存データセットを保持。
- 1440pxで横あふれなし。`screenshots/f4-employee-master.png` を保存。アプリ由来console warning/error 0（既知のChrome拡張由来ログのみ）。
- `node --check`、`ds-audit NG=0 WARN=0`、localhost HTTP 200も合格。

## 次にやるべきこと
1. F-5（通知+全体回帰）着手は別途ユーザー確認を取る。
2. F-5ではマスタ変更通知を `domain:'master'` / 対象日なしで発火し、通知センターまで確認する。
3. 既存6ページ回帰とF全体スクリーンショットを実施する。
4. 内部ブラウザ不可時はユーザー指示どおりGoogle Chromeを使用する。

## 今だけの申し送り
- Chromeコンソールの `efaidnbmnnnibpcajpcglclefindmkaj` / message channel系エラーは拡張機能由来。アプリJSのURL・スタックを持つエラーはなし。
