# モックアップ リファクタ統合計画（新DS適用 × 通知簡素化）

**最終更新**: 2026-07-11
**ステータス**: **R-0〜R-6 全完了（2026-07-11）**。本計画の実施項目は完了。Phase 3 への進行はユーザーの「モックアップ完了」宣言が必要（§5）
**対象**: 本番モックアップ全画面（OB / SL / WS / LA / QA）+ 共通基盤（co-*）+ admin-notify + 通知センター
**起点**: 2026-06-12 ユーザー指示「通知カテゴリ再定義のモック修正は、デザイン大幅変更やその他変更と合わせて一括で行う」

---

## 1. 目的

確定済みの複数の変更（新デザインシステム適用・通知簡素化モデル・通知カテゴリ再定義）を**画面ごとに一括適用**し、同じ画面を二度触らない。個別の先行実装は凍結し、本計画を唯一の実施単位とする。

## 2. 確定済みの決定（単一情報源への参照）

本計画は実施順序の SSOT であり、決定内容の詳細は各計画書を正とする。

| 決定 | 内容（要約） | 詳細の所在 |
| --- | --- | --- |
| 新DS（Calm Operations 確立分） | 光源左上固定（DS第一条）、角丸スケール 4/8/14/20/pill、ウェイト 400-700、サーフェスレシピ（`--shadow-card-outer`/`--bevel-card`）、バッジ中央凹みグラデ=公式例外、淡色変更履歴カード、バッジ2層影 | **正本: `docs/design-system/`（仕様5冊）+ `docs/mockup/ds-tokens.css`/`ds-components.css`（R-1 成果物 2026-07-03）**。経緯: `design-refresh-plan.md` / `design-refresh-sl-review-2026-06-11.md`（§6 判断記録）/ DOM 見本: `docs/preview/design-refresh-sl-layer-mockup.html` |
| 通知簡素化モデル | 責務は「知らせる + 該当箇所を示す」のみ。照合のやりとりはシステム外（電話・チャット）。スレッド・照合状態は将来拡張 | `notification-refactor-plan.md` §3.7.8 |
| レール通知カード | ベル（件数バッジ）→ プロパティ風カードが同一画面スライド表示。項目クリック=該当セルへスクロール+選択枠+フラッシュ。アクションはセンターリンクのみ | 同 §3.7.8 / 実装例: SL層モック |
| 通知カテゴリ導出 | 画面別ではなく**エンティティ別**（受注/配置/申請/マスタ）。車両・ETCは配置のサブタグ。**対象日**を第一級ファセット化（日別軸は対象日基準） | 同 §3.7.9 |
| 変更通知センター | 集積・検索専用ページ（縦型軸タブ + グループ化リスト + 詳細）。3カラム構成は不採用判例 | 同 §3.7.7 / `docs/preview/change-notification-center-mockup.html` |

## 2.1 追加デザイン要素（2026-06-12 参考画像レビュー → 仮実装 → ユーザー個別判断で確定）

`screenshots/plan_pic/` の参考画像から抽出し、SL層モック / センターモックに仮実装して1件ずつ判断した結果。採用分は R-1 の共通コンポーネント語彙に含めて全画面へ展開する。

| 要素 | 判断 | 内容・適用先 |
| --- | --- | --- |
| セグメントコントロール | **採用** | 凹トラック+浮き白ピル選択（`.seg`）。`data-multi` で複数選択対応（GC は東央+Nikkei 等の組み合わせ選択が必要）。適用: フィルタ・タブ類（GCフィルタ / 変更履歴・備考タブで実装済み） |
| 濃紺選択ピル | **採用（パターン）** | 選択状態 = 濃紺ベタ+白文字。**濃色面の使用権に「選択状態」を追加**（ナビ/未確認シグナルに次ぐ第3の使用先）。見本: SL 社員配置パネルの絞り込みチップ。昼夜フィルタ機能自体は不要のため撤去 |
| 統計サマリ行 | **採用** | 縦罫線区切りの数値ブロック（`.stat-strip`、ラベル10px+数値18px）。SL ツールバー右（未連絡/OB更新/不足）で実装済み。センターヘッダ等へ展開 |
| ユーザーチップ+在席ドット | **採用** | メニューバー右端にログインユーザー表示（`.menu-user`+緑ドット）。全画面へ展開 |
| 件数付きナビ | **採用** | センターの軸タブをライトリストナビ化: アイコン+ラベル+右端グループ数、セクション見出し、アクティブ=淡グレー面（Zendesk風）。`change-notification-center-mockup.html` で実装済み |
| 白カウンター影 | **採用** | `--shadow-card-outer` に上方向の淡い白光 `0 -2px 6px rgba(255,255,255,0.55)` を追加（ニューモーフィズムの部分採用） |
| 要対応バッジの極小グロー | **採用** | ベル件数バッジに橙ハロー `0 0 12px 3px rgba(241,94,42,0.75)`。**「意味のある光」の公式例外**（要対応・警告系バッジ限定。装飾用の光・所属色フレアは引き続き不採用） |
| コンポーネントカタログ 37件 | **採用（2026-07-03 全件確定）** | `docs/preview/design-refresh-components.html` の A（ボタン・入力12）/ B（テーブル・データ9）/ C（ナビ7）/ D（フィードバック9）を全件採用。仕様は `docs/design-system/02_components.md`、CSS は `ds-components.css` へ反映済み |
| ラベル付きインフォタイル | **却下** | 現場詳細のキー情報3連タイル（KuCoin風）は省スペース優先で dl 行形式を維持 |
| 人物アイコンの角丸四角バッジ化 | **却下（試作後差し戻し）** | 「所属色の角丸四角 + ピル表面色で抜いた人物」を 20px / 27px(1.35倍) の2段階で試作したが、実物がイメージと合わずユーザー判断で差し戻し。**現行の正: 所属色の人物シルエットのみ（20px・fill=belong-color）**。同型の再提案はしない |

参考画像由来で**不採用**とした方向: 暖色ベージュのキャンバス（青灰基調+警告橙の独占権と衝突）/ 全面ニューモーフィズム化（カード on キャンバスのモデルと矛盾）/ 黒インセットカードの再導入 / エッジライト演出。

## 3. スコープマトリクス（画面 × 変更内容）

| 対象 | 新DS適用 | レール/ベル通知カード | カテゴリ・対象日対応 | 備考 |
| --- | --- | --- | --- | --- |
| 共通基盤 `co-tokens.css` / `co-navbar.js` / `co-notify-panel.{js,css}` | ◎ R-1 | ◎ R-2（カード共通コンポーネント化） | ◎ R-2（導出ルール・targetDate） | 全画面の前提 |
| SL `screen-layout.html` | ○ R-3a | ○ R-3a | ○ R-3a | 新DSの基準画面。プレビューモックの確立分を本番へ移植 |
| OB `order-book.html` | ○ R-3b | ○ R-3b | ○ R-3b（日またぎ=対象日） | 行削除復旧トグル等の既存通知機構を維持 |
| WS `weekly-schedule.html` | ○ R-3c | ○ R-3c | ○ R-3c（週間=対象日範囲） | schedule 発火 19箇所（N-6）を維持 |
| LA `leave-application.html` | ○ R-3d | ○ R-3d | ○ R-3d（approval 独立） | 画面別 target マップ（N-6）を維持 |
| QA `quick-access.html` | ○ R-3e | △（モバイルはトースト維持） | ○ R-3e | QA登録現場フィルタ維持 |
| 通知センター（プレビュー） | 済（新DS準拠） | — | 済 R-4（スレッド領域簡素化・日別軸=対象日） | 将来の本組み込みは別フェーズ |
| admin-notify | △ 表示確認のみ | — | ○ R-2 に追従（4分類+サブタグ表示） | アイコン優先度表の整合 |
| DB設計 `03_データベース設計.md` | — | — | 済 R-5 | change_notifications / route_participants / target_date |

◎=本計画の主作業 / ○=画面単位で一括適用 / △=影響確認のみ

## 4. Phase 構成（依存順）

### R-0 決定記録（完了 2026-06-12）

- 通知カテゴリ導出ルール・対象日ファセットを `notification-refactor-plan.md` §3.7.9 へ記録
- 本計画書の作成

### R-1 新DS基盤統合（共通CSS）— 完了 2026-07-03

**方式変更（2026-07-03 / Claude Code 暫定判断 → 同日ユーザー追認済み・正式決定）**: 当初の「`co-tokens.css` へ統合」は、
新旧で**同名・別値のトークン**（`--radius-sm` 旧4px/新8px、`--elevation-1..5` 別値 等）が衝突し、
完了条件「既存4画面の見た目は旧のまま」と両立しないため、**別ファイル新設方式**へ変更した。
旧 `co-tokens.css` は R-3 完了まで既存画面用に併存し、全画面移行後に廃止する（同一ページ併載は禁止）。

成果物:

- `docs/mockup/ds-tokens.css` — 新DSトークン正本（SL層モック :root から機械抽出）
- `docs/mockup/ds-components.css` — 共通コンポーネントCSS（カタログ37件 + SL層モック確立分から機械抽出・2853行）
- `docs/design-system/` — 仕様5冊（README / 01 原則・トークン / 02 コンポーネント / 03 画面適用設計 / 04 AI実装ガイド）
- `docs/preview/ds-foundation-test.html` — 基盤CSS単体読込のスモークテスト（合格: コンソール0 / `screenshots/ds-foundation-test.png`）

完了条件の充足: 既存4画面は ds-*.css を読み込まないため無影響（見た目は旧のまま）。置換は R-3 で画面ごとに実施。

### R-2 通知データモデル改修（共通JS）

- カテゴリ導出を発信元画面ベース → **エンティティベース**へ（`co-navbar.js` / `co-notify-panel.js` / 各画面 SelfNotify / seed 生成 `mock-assignments-data.js` 等）
- 通知レコードへ **`targetDate`（対象日 or 範囲）** を追加。日別グルーピングは対象日基準
- 配置カテゴリのサブタグ（自社/応援/協力業者/車両・ETC）導入
- レール通知カードを**共通コンポーネント化**（SLモックの実装を移植。レールが無い画面はベル位置アンカー）
- パネルからの検索撤去、「センターで開く→」導線追加
- admin-notify の分類・アイコン表示を追従
- 注意: `mock.oms.state.v1` の構造変更を伴うため、**Codex と作業期間を調整**し、構造的変更の警告表へ追記する

### R-3 画面別一括適用（R-1 + R-2 完了後、1画面=1サイクル）

順序（提案・調整可）: **R-3a SL → R-3b OB → R-3c WS → R-3d LA → R-3e QA**

**画面別の設計正本は `docs/design-system/03_screen-application.md`**（旧→新トークン対応表・画面別設計・サブ機能振り分け含む）。
サブ機能（フィルタ・詳細・履歴・設定・検索・一括操作・凡例）の振り分け基準と画面別 panel-rail モード構成は
同 §1.1・§4（**2026-07-03 ユーザー確定**）。編集モーダル→右プロパティ転換は R-3 の画面別適用と同時に一括実施する。

各画面で同一チェックリストを回す:

1. 新DS適用（トークン置換・光源整合・角丸/ウェイト/余白・カード/バッジレシピ）
2. サブ機能の振り分け適用（03 §1.1 + 各画面節の確定表）: 編集モーダル→右プロパティ転換・フィルタのツールバー seg 化・凡例のヘルプ集約を同時実施
3. レール/ベル通知カード組み込み（該当セル選択+フラッシュ着地）
4. 通知発火の category/targetDate/サブタグ改修
5. 既存機能の回帰確認（cn:jump・元に戻す/やっぱり反映・seed 整合）
6. Playwright 検証 + スクリーンショット + コミット（1画面1コミット）

**R-3a 実施ブレークダウン（2026-07-06 ユーザー承認）** — 大規模（本番 `screen-layout.html`＋`screen-layout.css` 117KB＋`screen-layout.js` 7801行）ゆえ段階分割:

- **R-3a-1 骨格＋CSS読替＋中央表** — 調査で規模判明（骨格再構成＋列クラス40箇所再配線＋minimap撤去）につき**動くチェックポイントに2分割**（2026-07-06 ユーザー承認）:
  - **R-3a-1a 骨格＋CSS読替＋minimap撤去（完了 2026-07-06・runtime検証済）**: `co-tokens.css`撤去→`ds-tokens.css`＋`ds-tokens-bridge.css`＋`ds-components.css`＋`sl-ds.css`。骨格を `app > toolbar / workspace(rail｜main-card｜prop｜panel-rail)` へ再構成。menubar=既存`co-navbar`活用（menu-userチップは延期＝`.menu-user`CSSがds-components専用のため他4画面で無スタイル化する。共有co-navbar.cssへ置く専用手順が必要）。minimap撤去→総数はツールバー`stat-strip`（配置/不足）へ（`renderMinimap`を retarget）。**中央表は現10列のまま維持しCSSでDS化**（縦罫線撤去・淡見出し・青選択）。右サイドD&D供給源は`.prop`列へ暫定収容。**既存9モーダル残置・回帰ゼロ**（siteModal起動/行選択/D&D供給源/コンソール0を Playwright 確認）。**CSS機構**: `ds-tokens-bridge.css`＝co専用トークン（ds未提供分）を元値でshim（残置モーダル回帰ゼロ・同名は ds 新値へ自動読替）／ `sl-ds.css`＝SL固有オーバーライド（表DS化・workspace responsive・prop収容）。
  - **R-3a-1b 中央表7列化（完了 2026-07-06・runtime検証済）**: `cnCreateRow`を7列化（区分/契約先・現場名/集合/時間/人数/配置/車両・ETC/変更履歴・備考）。地図=現場名セルのinfo-pill（openMapModal維持）、No.列撤去、作業内容→区分セル内のバッジスロットへ内包。col-no/col-map/col-badge の下流JSを再配線。変更履歴はプレースホルダ（実データ配線は R-3a-3）。
- **R-3a-2 編集モーダル→右プロパティ4モード転換（完了 2026-07-06・runtime検証済）**: `siteModal`(+meeting/work/workTime/map/notes)→「現場詳細」/ `staffEditModal`→「社員配置」/ `vehicleEditModal`→「車両・ETC」/ 履歴→「変更履歴」。既存フォームIDと保存関数を維持し、モーダル内容を `.prop-card` 内のドックへ移動表示。`sortModal`・削除確認・印刷はモーダル維持（D-01/D-02）。スクショ `screenshots/r3a2-sl-prop.png`。
- **R-3a-3 通知rail cn-card＋回帰＋検証（完了 2026-07-07・runtime検証済）**: SL の統合ベル DOM を左 rail へ移動（他画面は co-navbar 位置維持）。通知ストア `getItems('all')` 由来で右プロパティ「変更履歴」リストと中央表 `.col-notes` 件数/最新要約を配線。SL SelfNotify/seed に `targetDate` と画面別 target を補完。検証: `node --check` OK、Playwright localhost で rail ベル表示、cn-card、SL 自発通知 cn:jump、履歴項目クリック cn:jump、action button 存在、console error 0。スクショ `screenshots/r3a3-sl-notify-rail.png`。
- **確定事項**: 配色＝現行DS（`ds-tokens`/`ds-components`）そのまま（**§5 フォールバック採用・色テーマ変動は後回し** 2026-07-06）／ 右プロパティ＝4モード（現場詳細/社員配置/車両・ETC/変更履歴）／ 左 `minimap`「配置状況」＝**総数はツールバー stat-strip へ・行ジャンプ一覧は撤去**（中央7列表が全行＋不足バッジで代替）／ ベルは rail（03 §1）。
- **後回しの参考物**: 色テーマ変動の比較ツール `docs/preview/design-refresh-theme-palettes.html`（リポジトリ保持。10候補＋現行Calm Operations を低彩度パレット化しSLライブ切替、意味色・所属色は固定）。

### R-3f 横断クリーンアップ（R-3e 完了後・R-4 の前 / 2026-07-10 新設・ユーザー承認）

2026-07-10 の横断デザインレビュー（実装 vs DS 正本の全照合 + runtime 検証）で確定した残課題を一括処理する。
HANDOFF に散在していた「R-3 全体完了後の横断レビュー」項目の正式フェーズ化。
**先行対応済み（同日）**: 旧トークン欠落の補修 = `ds-legacy-aliases.css` 新設（03 §3.3）+ 監査スクリプト
`scripts/design-audit/ds-audit.js` 配備（OB のフォーム余白 0 化・ボタン太字 400 化等の実害を解消済み）。

| # | 項目 | 内容 |
| --- | --- | --- |
| 1 | `.btn` 系の新旧統一 | ds-components（A-01）と旧 co-buttons が**同名別レシピ**で衝突し旧が勝つ。残置モーダルのボタンを DS クラスへ置換し co-buttons/co-forms/co-shared-badges の依存を解消 → 撤去。旧 CSS 内の廃止ティール `#0a9db0`（btn-primary:active）もこれで消える |
| 2 | panel-rail active の統一 | 正 = ds-components の青リング（02 §6 / 2026-07-10 確定）。WS/LA の白面+ニュートラル枠再実装を正へ寄せる |
| 3 | 既存負債トークンの解消 | `--focus-ring`（**全画面でキーボードフォーカスリング無効 = a11y**）/ `--primary` / `--secondary` / `--bg-primary` / `--bg-secondary` / `--shadow-strong`。旧 co-tokens 時代から未定義。定義追加（値はユーザー承認）or 参照側を DS トークンへ書換。監査 ALLOWLIST と同期して解消 |
| 4 | 死に CSS 撤去 | `.md-nav-cn-*`（旧通知ドロップ）/ 旧 `.cn-panel` 系一式（co-notify-panel.css。**R-3e で QA が cn-card へ移行済みのため利用者ゼロ = 撤去可**）/ `.bt-*` チップ系 等。現行 JS が生成しないことを確認済み |
| 5 | 直書き値の残り | `ws-ds.css`（レール右罫線 rgba(0,0,0,0.15)・radius:3px）/ `la-ds.css`（レール内 seg の白黒アルファ・radius calc-2px）→ トークン化 or 承認（監査 WARN 9件） |
| 6 | menu-user チップ導入 | `.menu-user` を共有 co-navbar へ導入（全画面）。LA ロール切替のチップメニュー移設も同時（03 §4 R-3d 実装確定メモ） |
| 7 | ヘルプ icon-btn | 凡例廃止の受け皿（03 §1.1）を全画面へ |
| 8 | SL bridge 撤去 | SL 残置9モーダルの新 DS 化 → `ds-tokens-bridge.css`+旧依存 CSS を読込チェーンから外す |
| 9 | cn-card 内蔵ブロック | `co-notify-panel.css` の `--cn-*` DS 値内蔵を ds-tokens 参照へ差替（QA が ds-tokens を読むようになってから = R-3e 後） |
| 10 | ダークテーマの扱い | 共有ナビ `mdNavThemeBtn` + `weekly-schedule.css` [data-theme=dark] が残存。新 DS はライトのみでダーク時は混在描画。廃止 or 正式対応をユーザー判断 |
| 11 | 確認: LA 月間ビューの土日祝の日付文字色 | 赤系表示が §3.2「青灰の濃淡+ウェイト」方針と整合するか確認（慣習表示として維持の可能性あり） |
| 12 | 画面間の余白・密度・直書き hex 横断確認 | 従来 HANDOFF 記載分。監査 WARN と合わせて棚卸し |

**完了（2026-07-11）**: R-3f #1〜#12 を全完了。E群 #6 は共有 `co-navbar` に「佐藤＋在席ドット」のユーザーメニューを導入し、LA の本人/DCP/管理ロール切替を同メニューへ移設。#7 は OB/SL/WS/LA のツールバー右端と QA ヘッダーへ画面別の色・記号ヘルプを追加し、LA 年間ビューの常設凡例を撤去。#12 は余白・密度・直書き値を横断棚卸しし、未承認値0件、確定済み3段密度との整合を確認。SL/WS の `--shadow-strong` 4箇所を用途別に `--elevation-4/5/3` へ置換し、5画面の共有トークン競合照合で唯一残っていた SL `--night-text: #DB577B` 上書きも撤去して DS 夜間赤へ統一。`ds-audit NG=0 WARN=0`、JS構文検査・HTTP 200確認済み。アプリ内ブラウザ接続先が利用不可のためruntime実測・スクリーンショットは未実施。

### R-4 通知センター改修（プレビュー・2026-07-11 完了）

- スレッド/確認依頼/解消記録 UI と、それらに依存する要対応軸・状態フィルタを撤去。詳細パネルを「変更内容 + 情報経路 + 現場画面で開く」へ簡素化
- `targetDate` を追加して日別軸を対象日基準へ変更。配置サブタグ（自社/応援/協力業者/車両・ETC）のフィルタを追加
- 検証: inline JS 構文正常 / 旧スレッド参照0 / 配置サブタグ4種網羅 / localhost HTTP 200 / `ds-audit NG=0 WARN=0`。アプリ内ブラウザは接続先なしのため runtime 操作確認・スクリーンショットは未実施

### R-5 DB設計追補（2026-07-11 完了）

- `03_データベース設計.md` へ `change_notifications`（domainからカテゴリ導出・`target_date`/範囲・画面別target・差分・復元スナップショット）と `route_participants`（順序付き情報経路関係者）を追補
- 旧 `notification_logs` は画面通知本体から LINE/メール外部送信ログへ責務を限定。主要検索索引・RLS有効化対象・ER概要を同期
- スレッド系テーブルは作成せず「将来拡張」設計メモのみ。静的構造検査・現行Mockup語彙とのCHECK制約照合・`git diff --check` 済み（ローカルに `psql` が無いためDDL実行検証は未実施）

### R-6 結合検証（完了 2026-07-11）

- 通知発火マトリクス（notification-refactor-plan §17 相当）を新カテゴリ/対象日で再実行
- 4画面クロスジャンプ + センター導線の一括 Playwright 検証
- **静的検証完了**: `scripts/verify-r6-notifications.js` で OB/SL/WS/LA/QA の発火組み合わせ、domainカテゴリ導出、targetDate、配置4サブタグ、同タブcnJump、センター導線、DB制約を60項目照合し全件合格
- **R-6で修正**: 「対象日なし」を扱う行全体・マスタ通知との整合のためDB `target_date` をNULL許容化。通知センターの未配線だった「現場画面で開く」をOB/SL/WS/LAへの同タブ遷移へ接続
- **検証済み（静的）**: inline JS / 関連JS構文正常、6画面localhost HTTP 200、`ds-audit NG=0 WARN=0`、`git diff --check`
- **runtime検証完了（2026-07-11 Claude Code / Playwright 実操作）**: ①センター描画（対象日基準の日別4グループ・11件・スレッド残骸0・詳細=変更内容+情報経路+サブタグチップ）②配置サブタグフィルタ実動（vehicle→1件へ絞込・詳細自動切替・軸カウント連動）③センター「現場画面で開く」→SL 同タブ遷移 ④クロスジャンプ一巡 SL→OB→WS→LA（各 `.cn-cross-jump-btn`・同タブ・着地後 cnJump 除去・`cn-focus-spotlight` 発火・WS=対象セル選択着地・LA=該当申請が詳細ドックに展開・OB=着地行が連携/変更履歴パネルへ反映〔詳細ペイン「未選択」は編集ドック専用のため仕様どおり〕）⑤LA ベル→「変更通知センターで開く」→センター遷移 ⑥全行程コンソールエラー0（警告1=OB地図プレビュー iframe sandbox・既存）。スクショ `screenshots/r6-*.png` 7枚

## 5. 着手条件・凍結事項

- **R-3a（SL）の前提**: SL 配色テーマの確定（`design-refresh-plan.md` の Color Themes 比較）と SL 右プロパティ4モードの情報粒度確認。未確定のまま着手する場合は現行配色のまま DS 構造のみ適用し、配色は後続差し替え
- **凍結**: 本計画外での個別モックへの通知カテゴリ/通知カード先行実装は行わない（2026-06-12 ユーザー指示）
- Phase Gate: 本計画はモックアップ内リファクタであり、Phase 3（仕様書作成）への進行はユーザーの「モックアップ完了」宣言が必要

## 6. リスク・注意事項

- `mock.oms.state.v1` / `co-mock-store.js` 周辺は Codex 側の大幅構造変更履歴あり。R-2 着手前に HANDOFF で同期し、固定文字列を書かず実値から動的取得する既存原則を維持
- `co-navbar.js` の script 読み込み順・N-5 の cnJump 同タブ遷移・スポットライト着地は変更しない（HANDOFF 注意事項）
- 旧4分類ベル → レール通知カードへの置換時、既存 seed・SelfNotify 呼び出し（旧ベルIDエイリアス）の互換を R-2 で吸収する

## 7. 進捗

| Phase | 状態 | 開始 | 完了 | メモ |
| --- | --- | --- | --- | --- |
| R-0 決定記録 | 完了 | 2026-06-12 | 2026-06-12 | §3.7.9 追記 + 本計画書作成 |
| R-1 DS基盤統合 | 完了 | 2026-07-03 | 2026-07-03 | ds-tokens/ds-components.css 新設 + docs/design-system/ 5冊 + スモークテスト合格。方式変更はユーザー追認済み（2026-07-03） |
| R-2 通知データモデル改修 | 完了 | 2026-07-04 | 2026-07-05 | 統合ベル1個+cn-card / カテゴリ=エンティティ導出 / 配置サブタグ / targetDate日別グルーピング / 履歴・検索撤去 / センター導線。実装=co-notify-panel.js(v39)・css(v18)・co-navbar.js(v22)。**runtime検証済**(OB/SL/WS/LA/QA/admin-notify: コンソール0=R-2起因エラーなし・cn-card DS準拠・全4カテゴリ+サブタグ+対象日・フィルタ・cn:jump着地・OB復旧トグル・QA旧.cn-panel全てOK)。**enhancement 完了**: OB=obCnSelfNotify に明示 targetDate(表示月+day, v19) / WS=wsCnSelfNotify に明示 subTag(車両/応援の導出取りこぼしを補正)+targetDate(v19)。admin-notify は notify-compare.js が既に4分類+旧キー互換のため表示確認のみで完了（ユーザー承認 2026-07-05）。既知の別件: shield.svg 404（R-2無関係・SHARED-MEMORY記録） |
| R-3a〜e 画面別適用 | **全完了**（R-3a〜R-3e） | 2026-07-06 | 2026-07-10 | **R-3a 完了（SL・runtime検証済 2026-07-06〜07）**: 骨格再構成＋CSS読替＋中央表7列化＋右プロパティ4モード＋通知rail cn-card。スクショ `screenshots/r3a*.png`。**R-3b 完了（OB・runtime検証済 2026-07-08）**: 骨格＋右プロパティ3モード＋seg フィルタ（チェックポイント 9a2c8ae）に加え、**①行カレンダーを中央ビュー切替化**（カレンダー入力モーダル廃止・月ナビ/undo redo をツールバー共通へ一本化・編集は右プロパティ詳細ドック）**②連携・所在パネル実配線**（請求先/地図URL集約+288px内 iframe プレビュー/SL現場逆引き）**③変更履歴パネル実配線**（getItems('all') 行フィルタ+cn:jump 委譲）**④夜間色を `--night-text`(#d14d41) へ分離+死にCSS削除**（.md-ob-filter-*・カレンダーモーダルchrome）。スクショ `screenshots/r3b-ob-cal-view.png` / `r3b-ob-linkage.png` / `r3b-ob-history.png`。**R-3c 完了（WS・runtime検証済 2026-07-08）**: R-3c-1骨格＋R-3c-2a panel-rail4モード＋R-3c-2b応援予約モーダル→ドック転換に加え、**R-3c-3 通知rail cn-card＋履歴配線**（統合ベルDOMを`.rail`へ移設／①選択セルモードに`wsRenderHistorySection`で変更履歴を埋め込み・選択時はsiteId+日付でフィルタ）。**R-3d 完了（LA・runtime検証済 2026-07-10）**: `co-tokens.css`を撤去し、`ds-tokens.css`/`ds-components.css`/`la-ds.css`へ読替。骨格を `toolbar / workspace(rail｜main-card｜prop｜panel-rail)` 化し、左レール=休暇/車両作業面+統合ベル、右プロパティ=ミニカレンダー常設+詳細/リスト/要対応の3モードへ統合。休暇詳細ポップオーバー・車両マスタ編集をドックへ転換し、通知の休暇target着地時は車両作業面から休暇面へ戻す。スクショ `screenshots/r3d-la-initial.png` / `r3d-la-detail-dock-settled.png` / `r3d-la-vehicle-dock.png`。**R-3e 完了（QA・runtime検証済 2026-07-10）**: `co-tokens.css` 撤去→`ds-tokens`+`ds-legacy-aliases`+`ds-components`+新設`qa-ds.css`（浮きカード/btn-primary・secondary/濃紺ヘッダーグラデの DS レシピ + cn-card モバイル位置補正）。モバイル例外のためカード型フロー構造は維持し、旧パレット直書き（teal/pink/黄・曜日セル桃色面含む）を DS トークンへ置換。**旧 `.cn-panel`（最新/履歴タブ・検索・一覧選択）を撤去し統合ベル + 共通 `.cn-card` へ移行（ユーザー判断 2026-07-10）**: 通知は `coNotifyPanel.addItem('all')`（domain=order・targetDate=dayKey・target=新設 `qaCell` 軸）、ベルアンカー1個をホーム⇄カレンダーのヘッダーへ JS 移設、元に戻す/やっぱり反映は `cn:action`（qa-revert/qa-reapply）化しスナップショット復元は維持、トースト・QA登録現場フィルタ維持。co-notify-panel.js(v40)=QA互換セクション撤去+qaCell 軸+**アクションボタン付きアイテムはジャンプ後もパネル維持**（全画面共通の一般則）。検証: ds-audit NG=0（qa-ds WARN 0）/ QA 通知全フロー+他4画面・admin-notify 回帰なし・コンソール0（shield.svg 404 は既知別件）/ computed style で DS 値実測。スクショ `screenshots/r3e-qa-*.png`。 |
| R-3f 横断クリーンアップ | **完了**（#1〜#12） | 2026-07-10 | 2026-07-11 | 2026-07-10 横断レビューで新設（§4 R-3f 表）。**先行対応済み**: 旧トークン欠落補修 = `ds-legacy-aliases.css` 新設（OB/WS/LA 読込・SL は bridge 継続）+ `scripts/design-audit/ds-audit.js` 配備（NG=0 確認済み・WARN 9件は R-3f #5）。runtime 再検証: OB `.btn` fw600 / `.md-fi-*` 余白復旧・WS/LA 全トークン解決・R-3d 修正維持・コンソール0。スクショ `screenshots/r3f0-{ob,ws,la}-alias-fix.png`。**#4 完了（2026-07-10・runtime検証済）**: 使用者ゼロを機械確認（定義クラス vs 全モックJS/HTML使用クラスの集合比較）したセレクタのみ撤去＝見た目不変。co-notify-panel.css=旧.cn-panel系一式+旧.cn-icon/.cn-composed（buildComposedIconHtml は呼び出し元ゼロの死にJSとして残置・CSSのみ撤去）/ co-navbar.css=bells-divider+旧.cn-panel位置 / screen-layout.css=旧.md-cn-*通知モーダル一族431行（存置=.md-cn-cell-old/new） / co-shared-badges.css=旧md-cnバッジ群+.bt-*エイリアス全部 / co-modal.css=.md-cn-body-overlay系 / order-book.css・weekly-schedule.css=死にglow/flash（glow付与はquick-access.jsのみ=QA側CSSが正）。**#9 完了（同日）**: cn-card 内蔵 `--cn-*` 11個を `var(--ds名, 現値フォールバック)` へ参照化。**--radius-sm/md・--elevation-1/5 の4個は co-tokens と同名別値のため admin-notify（co-tokensのまま cn-card 表示）が誤解決する制約でリテラル維持**（admin-notify DS化時に参照化）。検証: ds-audit NG=0 WARN=9（悪化なし）/ OB/SL/WS/LA/QA/admin-notify 全ベル cn-card=radius14px・ink色・item8px 実測一致 / admin-notify フォールバック解決一致 / QA toast・glow 存置動作 / notify-compare 埋込プレビュー自己完結を確認 / コンソール0（QA shield.svg 404 は既知別件）。スクショ `screenshots/r3f4-{ob,sl,ws,la,qa,admin}-cn-card.png`。**#2 完了（同日・runtime検証済）**: WS/LA の `.panel-rail button.active` を正（ds-components 実値: 白面+青枠+青リング `0 0 0 2px rgba(34,103,203,.12)`+elevation-2+inset-highlight）へ差替。幾何（min-height 52px・横書きラベル）は画面固有のまま。ds-audit WARN 9→8（旧 active の直書き影が消滅）。02 §6 の逸脱注記を解消。スクショ `screenshots/r3f2-{ws,la}-panel-rail.png`。**#1 B-1 完了（2026-07-11・runtime検証済）**: .btn 衝突解消のボタン層のみ（B-1/B-2/B-3 3分割はユーザー承認）。DS に無い4バリアント（outline/icon/ghost--danger-hover/ghost--pill-dashed・実使用は OB/SL のみ。WS/LA/QA の grep 該当は qa-btn 等の誤検知）+ density 連動（compact/spacious は DS sm/lg 実値へ1段シフト＝寸法の発明なし）を ds-components.css §H「A-01 拡張」へ受け皿化（正本追補はユーザー承認済み・旧teal→--blue・旧桃色→Signal Orange 読替）し、**co-buttons.css を全6ページから撤去→ファイル削除**（廃止ティール #0a9db0 消滅）。全ボタンが DS A-01 レシピへ切替。検証: ds-audit NG=0 / OB compact=26px・btn-outline/icon/dashed 実測 / SL primary/secondary 32px DS レシピ / コンソール0。スクショ `screenshots/r3f1-ob-{buttons,dock-buttons}.png`。**残: B-2=#8 SL 9モーダルDS化+bridge撤去 / B-3=co-forms・co-shared-badges 解消**。**#8 B-2a 完了（2026-07-11・runtime検証済）**: bridge トークン棚卸し = SL 読込チェーン全体（print CSS 含む）で参照数を機械集計し、**参照ゼロの死にシム36個を ds-tokens-bridge.css から削除**（chart系14・bp系5・fs/icon/space/radius/lh 拡張スケール・fw-regular/black・accent-secondary light/dim・density 3種+切替ブロック。171→122行）。生存= color.category 8個（screen-layout.css .category-* バッジ・**B-2b で DS 区分色を決める承認案件**）+ --space-2xl（print-touo-nikkei.css）+ aliases 同名群（B-2b の bridge→ds-legacy-aliases 差替で DS 値へ移行）。詳細は bridge ヘッダコメントに記録。検証: SL 生存トークン解決・死にシム未定義化・.category-facility 描画・ds-audit NG=0・コンソール0。**#8 B-2b-1 完了（2026-07-11・runtime検証済・ユーザー承認 = 区分色は応援系含め全区分青一色 / 分割 = トークン層先行）**: ①SL 区分色 DS 化 = `--cat-*` 8個+`--cat-bg/text-support`（応援・研修・社内の旧直書き緑5行を集約）を screen-layout.css :root へ `--blue-soft`/`--blue` で定義（03 §3.1・WS :27-34 と同一。dark は従来描画維持=#10 で判断） ②`--space-2xl: 32px` を ds-legacy-aliases へ移管（print-touo-nikkei 用・同値転記） ③SL の読込を bridge→`ds-legacy-aliases.css?v=2` へ差替・**ds-tokens-bridge.css 削除**（全5画面が同一対応表に合流。残置9モーダル=8ドック収容+sortModal が旧トークン名のまま DS 値描画へ）。検証: ds-audit NG=0 WARN=8（悪化なし）/ SL 区分バッジ全種 #eaf3ff/#1f5fae 実測・dock 内 label=muted/input=ink/btn-sm 26px・sortModal=白面 radius12+ink・死にシム未定義化・--space-2xl=32px / OB/WS/LA/QA aliases v2 で回帰なし・コンソール0（QA shield.svg 404 は既知）。スクショ `screenshots/r3f8-sl-b2b1-*.png`。**B-2b-2 完了(2026-07-11・runtime検証済・ユーザー承認 = 受け皿は ds-components 正本追補 / フォーム+バッジ一括実施)**: `.md-fi-*` 全量（OB/SL 約113箇所+JS6箇所）を DS A-05/A-07 レシピへ置換（field/field-label/input/textarea.input。number は `.input` + 新設 `.input-number`）。DS 非対応3点（.field-row 行レイアウト / .input-number / .skip-link〔focus リングは DS 標準値へ読替=旧 --focus-ring 未定義負債の1箇所解消〕）を **ds-components.css §I「A-05 拡張」へ受け皿化**（02 に A-05拡張 行）。行文脈では `.field` の min-width:200px 解除+input 幅追従（旧 width:100% 相当）を §I に内包 — 素の置換では dock 内で行が 236→312px に溢れることを実測して補正。**co-forms.css を全5ページから撤去→削除**（同居していた .sr-only は ds-components 既存・combo/select/time/checkbox 等13クラスは使用ゼロを機械確認）。検証: ds-audit NG=0 / SL siteModal ドック行 236/236・OB 編集ドック 214/214・人数 80px 中央 18px/700 維持（.md-ob-edit-form .input-number 差替）・label 11px/700/#31576f / WS/LA/QA 回帰なし・コンソール0。スクショ `screenshots/r3f8-{ob,sl}-b2b2-fields.png`。**B-3 完了(2026-07-11・runtime検証済・色読替はユーザー承認)**: co-shared-badges.css の生存全レシピ（md-ob バッジ編集 D&D 一式・行チップ・信頼度チップ・badge-tag 表示専用群）を **ds-components.css §J へ受け皿化**（02 に B拡張 行）し **co-shared-badges.css を全8ファイル（5画面+admin-notify+preview2本）から撤去→削除**。読替（承認済み）= 旧トークン名→DS名 / 旧teal淡色→--blue-soft・--info-* / undo バー琥珀→DS alert 3点 / 未定義負債 var(--primary)→var(--ink)（1箇所解消）/ radius 14px→var(--radius-md)・8px→var(--radius-sm)（同値）。**例外 = 信頼度 active の琥珀#f59e0b/灰青#94a3b8 はリテラル維持**（確度の意味色・DS橙=警告と衝突するため #5 で正式パレット判断）。副産物: screen-layout.css の死にシム --secondary 2箇所（light/dark）撤去（使用者ゼロ機械確認）・古いコメント参照を §J へ更新・aliases ヘッダの共用CSS一覧を実態化。検証: ds-audit NG=0 WARN=8（増減なし）/ OB 信頼度チップ=DS青 radius20・undo バー=alert 実測(#fff0e8/#f5a17c/#f15e2a) / SL badge-tag 13個= blue-soft/blue/info-border・gc-tag=info-bg/muted / admin-notify・notify-compare 回帰なし・コンソール0。スクショ `screenshots/r3f8-{ob,sl}-b3-badges.png`。**B群（#1/#8）これで全完了**。**#3 完了（2026-07-11・runtime検証済・ユーザー承認 = 未定義参照のみ解消・SL/WS ローカル --shadow-strong〔旧teal影・描画あり〕は #12 送り）**: 実測で範囲確定 = --focus-ring/--primary/--secondary は B-2b-2/B-3 で参照解消済み（残は ALLOWLIST 記載のみ）。実参照は --bg-primary ×3/--bg-secondary ×2（SL/OB 地図URL入力・プレビュー。未定義=透明描画）+ --shadow-strong 未定義は OB .sort-modal 1箇所のみ（SL/WS はローカル定義あり）。書換 = --bg-primary→--panel / --bg-secondary→--bg（5箇所・実質見た目不変）/ OB sort-modal→var(--elevation-5)（影なし→DS モーダル影の復元）。**ds-audit ALLOWLIST を空に**（解消経緯をコメント化・新規追加禁止を明記）。検証: ds-audit NG=0 WARN=8 / OB sort-modal=elevation-5 実値・地図入力=白・プレビュー=#eef4f8 / SL sm-map入力=白・contact-popup/sort-modal 影不変（範囲どおり）/ コンソール0。スクショ screenshots/r3f3-{ob-sort-modal-shadow,sl-site-dock-map-input}.png。**D群 #5/#10/#11、E群 #6/#7、#12 完了（詳細は §4 完了記録）** |
| R-4 センター改修 | 完了 | 2026-07-11 | 2026-07-11 | 通知センタープレビューからスレッド操作を撤去し、対象日グループ・配置サブタグフィルタ・変更内容/情報経路中心の詳細へ改修。静的検証とHTTP 200確認済み。アプリ内ブラウザ操作確認のみ環境制約で未実施。 |
| R-5 DB設計追補 | 完了 | 2026-07-11 | 2026-07-11 | change_notifications / route_participants を定義し、notification_logs を外部送信ログへ分離。スレッドは将来拡張メモのみ。静的検証済み、DDL実行は未実施。 |
| R-6 結合検証 | **完了** | 2026-07-11 | 2026-07-11 | 60項目の静的マトリクス合格（Codex）+ runtime実操作検証（Claude Code / Playwright）: センター描画・サブタグフィルタ・センター⇄実画面導線・SL→OB→WS→LA クロスジャンプ一巡・コンソールエラー0。DB対象日NULL整合・センター実画面導線を修正。スクショ `screenshots/r6-*.png` |
