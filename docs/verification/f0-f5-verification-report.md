# F-0〜F-5 検証レポート

- 実施日: 2026-07-13
- 対象: `docs/plan/mockup-master-account-plan.md` F-0〜F-5
- ブランチ: `codex/f0-f5-verification`
- 検証プロンプト: `docs/verification/f0-f5-verification-prompt.md`
- ブラウザ: 内部ブラウザ利用不可のため Google Chrome
- URL: `http://localhost/order-management-system/docs/...`

## Findings

重大な問題は検出されなかった。

### 独立検証指摘の精査

独立セッションから「通知カードからマスター画面へ直接遷移できない」という MEDIUM 指摘があったが、F-5の受け入れ条件は、他画面ベルへの反映、対象日なしグループ、通知センター種別軸への表示である。要件定義 §3.14.3 はレール通知カードのアクションを「変更通知センターで開く」に限定しているため、通知カードからのマスター直通は必須条件ではない。

実ブラウザでは、通知カードから変更通知センターを開き、種別軸「マスタ」の詳細にある「現場画面で開く」から `master-management.html` へ遷移する現行契約を確認した。よって本指摘は不採用とした。

## Phase判定

| Phase | 判定 | 主な証跡 |
| --- | --- | --- |
| F-0 | PASS | 計画書のデータソース対応表と現行seed関数を照合。F専用 `mock.oms.master.v1` と既存画面正本の分離を確認 |
| F-1 | PASS | 契約先の追加、編集、無効化、状態絞り込み、検索、再読込復元、コード重複拒否を実操作確認 |
| F-2 | PASS | 単純マスタ10種すべてで追加、編集、無効化、検索、再読込復元を実操作確認 |
| F-3 | PASS | 4階層マスタの子追加と復元、親変更、自己の親候補除外、折りたたみ、最大深度制限を確認 |
| F-4 | PASS | 社員追加、GC/組織連動、資格/配置制約の保存・削除・復元、配置制約の対称同期/対称削除を確認 |
| F-5 | PASS | 対象日なし通知、直近50件上限、他画面ベル、通知センター2軸、マスター画面導線、既存6画面回帰を確認 |

## 実施証跡

### 静的検査

すべて成功した。

```powershell
node --check docs/mockup/master-management.js
node --check docs/mockup/mock-master-notifications.js
node --check docs/mockup/co-navbar.js
node --check docs/mockup/quick-access.js
node scripts/design-audit/ds-audit.js
git diff --check
```

- DS監査: `NG=0 WARN=0`
- `mock.oms.master.v1` はversion 4。version 2 / 3 / 4の読込移行を保持
- `mock.oms.master.notifications.v1` は直近50件で切り詰め
- F実装は `mock.oms.state.v1` を拡張していない
- `co-mock-store.js` → `co-navbar.js` の順序を維持
- 新DS正本ファイルに本PR差分なし

### F-1 / F-2 共通CRUD

検証データは `VERIFY-F0F5-*` 接頭辞を使用した。

| マスタ | 追加 | 編集 | 無効化 | 検索 | 再読込復元 |
| --- | --- | --- | --- | --- | --- |
| 契約先 | PASS | PASS | PASS | PASS | PASS |
| グループ会社 | PASS | PASS | PASS | PASS | PASS |
| 資格検定 | PASS | PASS | PASS | PASS | PASS |
| 協力業者 | PASS | PASS | PASS | PASS | PASS |
| 料金特記定型文 | PASS | PASS | PASS | PASS | PASS |
| その他特記定型文 | PASS | PASS | PASS | PASS | PASS |
| 車両 | PASS | PASS | PASS | PASS | PASS |
| ETCカード | PASS | PASS | PASS | PASS | PASS |
| 祝日 | PASS | PASS | PASS | PASS | PASS |
| ペナルティコード | PASS | PASS | PASS | PASS | PASS |

契約先コード `VERIFY-F0F5-COMP` の重複追加は「同じ契約先コードが登録されています。」で拒否され、既存行は1件のまま維持された。

### F-3 階層マスタ

| マスタ | 子追加・復元 | 追加確認 |
| --- | --- | --- |
| 組織階層種別 | PASS | 全日本エンタープライズ第3階層へ追加 |
| 組織ノード | PASS | 追加した階層種別を参照して第3階層へ追加 |
| 現場 | PASS | 既存現場の子項目を追加 |
| 区分・バッジ | PASS | 親を施設→イベントへ変更、自己候補除外、折りたたみ/展開 |

区分・バッジの第3階層では「子を追加」が非表示となり、最大3階層制限を確認した。

### F-4 社員マスタ

- `VERIFY-F0F5-EMP` を全日本エンタープライズ / 交通一課へ追加
- GC変更後の所属組織候補は全日本所属だけに更新
- 「交通誘導警備 1級」と田中への配置制約を保存し、再読込後も復元
- 田中側に `VERIFY-F0F5社員 / VERIFY-F0F5-EMP` が選択済みで現れ、対称同期を確認
- 検証社員側で資格と制約を削除後、双方から制約が消えることを確認

### F-5 通知・回帰

- マスター通知カード: `domain=master`、対象日なし、カード表示領域とフィルタチップにクリップなし
- 連続更新で保存通知を50件超にし、再読込後は保存50件 + 共通seed 2件 = 52件。QAは保存分のみ50件
- 通知センター: 種別軸「マスタ 50件」、全カード「対象日なし」
- 通知センター詳細「現場画面で開く」から `master-management.html` へ同タブ遷移

| 既存画面 | 主要面 | 統合ベル | マスタ通知 | 対象日なし | 横あふれ | アプリconsole |
| --- | --- | --- | --- | --- | --- | --- |
| OB | PASS | 1 | 52 | PASS | なし | 0 |
| SL | PASS | 1 | 52 | PASS | なし | 0 |
| WS | PASS | 1 | 52 | PASS | なし | 0 |
| LA | PASS | 1 | 52 | PASS | なし | 0 |
| QA | PASS | 1 | 50 | PASS | なし | 0 |
| admin-notify | PASS | 1 | 52 | PASS | なし | 0 |

1100 x 900ではページ幅1100、通知カード `left=71 / right=415 / width=344`。フィルタチップの縦横overflowはなかった。

### スクリーンショット

- `screenshots/verify-f0-f5-master-notifications.png`
- `screenshots/verify-f0-f5-master-1100.png`
- `screenshots/verify-f0-f5-notification-center.png`

## 独立プロンプト実行記録

別の一時Codexセッションへ検証プロンプトを渡して実行した。Windowsのread-only sandbox helperが見つからず最初の実行は停止したため、同じ読み取り専用指示を通常実行モードで再実行した。

独立セッションは静的レビュー結果を返したが、内部のシェルとブラウザを利用できず、実行検査は `PARTIAL` と報告した。唯一の指摘は前述の通知カード直通導線で、要件現物とChrome実操作によりF-5違反ではないと判定した。独立セッション実行前後でGit差分が増えていないことを確認した。

## 残留リスク

- モックのlocalStorage検証であり、本番SupabaseのRLS、制約、同時更新を保証しない。
- version 2 / 3からversion 4への移行はコードと既存保存状態の復元で確認したが、破損JSONや将来versionからのダウングレードは対象外。
- 検証用 `VERIFY-F0F5-*` レコードと通知はCodex側ChromeのlocalStorageに残る。リポジトリデータには影響しない。
- 既知の `quick-access.html` の `shield.svg` 404とChrome拡張由来ログは本検証の回帰判定から除外した。

## 総合判定

**PASS**

F-0〜F-5の計画上の受け入れ条件を静的検査とChrome実操作で満たした。独立検証の指摘は現行要件の範囲外であり、通知センター経由のマスター画面導線は実動確認済みである。
