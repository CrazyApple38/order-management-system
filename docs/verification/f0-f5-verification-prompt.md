# F-0〜F-5 独立検証プロンプト

あなたは受注管理システムの独立検証担当です。実装担当の説明を信用せず、リポジトリの現物と実行結果から F-0〜F-5 を検証してください。

## 目的

`docs/plan/mockup-master-account-plan.md` の F-0〜F-5 が、計画・要件・保存契約・通知契約を満たし、既存6画面へ回帰を起こしていないか判定する。

## 厳守事項

- 会話・報告は日本語。
- この検証の実行はユーザー承認済み。追加確認を挟まず、読み取り専用の範囲で最後まで実行する。
- **読み取り専用**で検証し、ファイル・localStorage・Git履歴を変更しない。
- 最初に `AGENTS.md`、`docs/SHARED-MEMORY.md`、`docs/HANDOFF.md`、`docs/plan/mockup-master-account-plan.md` を読む。
- `docs/mockup/ds-tokens.css`、`ds-components.css`、`ds-legacy-aliases.css`、プレビュー正本を変更しない。
- 既知の `quick-access.html` の `shield.svg` 404とChrome拡張由来ログは、新規回帰と区別する。
- 推測で合格にしない。未実施項目は「未検証」、再現不能は理由付きで「判定不能」とする。
- 問題を見つけても修正しない。重大度、再現手順、根拠ファイルと行番号を報告する。

## 検証範囲

### F-0 データ準備

- 計画書 §3 F-0のデータソース対応表が、現行のシード参照先と矛盾しない。
- 既存画面の正本とF専用スナップショットの境界が維持されている。

### F-1 共通CRUD基盤

- `docs/master-management.html` の統合1画面構成、左種別ナビ、中央一覧、右編集プロパティ。
- 契約先の追加・編集・無効化・有効/無効/すべて絞り込み・検索・再読込復元。
- コード重複検証と `mock.oms.master.v1` の専用保存。

### F-2 単純マスタ展開

- 契約先を含む単純マスタ10種で、一覧・追加・編集・無効化・検索・状態絞り込みが動く。
- 種別切替で選択・検索・保存データが混線しない。
- version 2形式から後続version 4まで既存データセットが保持される。

対象: 契約先、グループ会社、資格検定、協力業者、料金特記、その他特記、車両、ETCカード、祝日、ペナルティコード。

### F-3 階層マスタ

- 組織階層種別、組織ノード、現場、区分・バッジの4種。
- 展開/折りたたみ、子追加、親変更、無効化、最大深度、再読込復元。
- 親変更時の循環参照や不正な深度を防止している。

### F-4 社員マスタ

- 既存25名のシード、基本情報、所属GCと組織候補の連動。
- 資格と配置制約の追加・削除・重複防止・再読込復元。
- 配置制約が双方の社員へ対称同期され、削除時も双方から消える。

### F-5 通知と回帰

- 追加・更新・無効化・有効化が `coNotifyPanel.addItem('all', ...)` を呼び、`domain:'master'`、targetDateなしとなる。
- `mock.oms.master.notifications.v1` に直近50件が保持される。
- マスター画面、OB、SL、WS、LA、QA、admin-notifyのベルに反映される。
- 通知カードの「対象日なし」、通知センターの日別軸「対象日なし」と種別軸「マスタ」、マスター画面への導線。
- 既存6画面 OB / SL / WS / LA / QA / admin-notify がHTTP 200、主要画面表示、統合ベル1個、アプリ由来console error 0。

## 必須の静的検査

```powershell
node --check docs/mockup/master-management.js
node --check docs/mockup/mock-master-notifications.js
node --check docs/mockup/co-navbar.js
node --check docs/mockup/quick-access.js
node scripts/design-audit/ds-audit.js
git diff --check
```

次も確認する。

- HTMLのscript読込順で `co-mock-store.js` が `co-navbar.js` より前にある。
- 編集した共有JS/CSSのキャッシュバスターが全参照画面で一致する。
- `mock.oms.state.v1` をF用に拡張していない。
- 新DS正本トークンへ無断変更がない。

## ブラウザ検証

- XAMPP Apacheの `http://localhost/order-management-system/docs/...` を使う。
- 内部ブラウザを優先し、利用不可ならGoogle Chromeを使う。
- 検証用データは `VERIFY-F0F5-*` の接頭辞を使い、既存データと区別する。
- 可能ならデスクトップ幅と1100px付近の表示を確認し、横あふれ・通知カードのクリップ・文字折返し崩れを確認する。
- スクリーンショットを撮る場合はプロジェクトルートの `screenshots/` に `verify-f0-f5-*.png` で保存する。

## 報告形式

次の順番で、Markdownのみを出力する。

1. `## Findings`：重大度順。問題なしなら「重大な問題は検出されませんでした」。各指摘に重大度、再現、期待、実際、`file:line`を含める。
2. `## Phase判定`：F-0〜F-5を `PASS / FAIL / PARTIAL / NOT TESTED` で表にする。
3. `## 実施証跡`：実行コマンド、ブラウザ、URL、確認した操作。
4. `## 残留リスク`：未検証、環境依存、モック限定事項。
5. `## 総合判定`：`PASS / FAIL / PARTIAL` のいずれかと1〜3文の根拠。

報告だけを返し、前置き、修正提案の実装、コミット、push、PR操作は行わないこと。
