# モックアップ リファクタ統合計画（新DS適用 × 通知簡素化）

**最終更新**: 2026-07-10
**ステータス**: R-2 完了（2026-07-05）/ R-3a 完了（2026-07-07）/ R-3b OB 完了（2026-07-08）/ R-3c WS 完了（2026-07-08）/ **R-3d LA 完了（2026-07-10・runtime検証済）→ 次は R-3e QA**
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
| 通知センター（プレビュー） | 済（新DS準拠） | — | ○ R-4（スレッド領域簡素化・日別軸=対象日） | 将来の本組み込みは別フェーズ |
| admin-notify | △ 表示確認のみ | — | ○ R-2 に追従（4分類+サブタグ表示） | アイコン優先度表の整合 |
| DB設計 `03_データベース設計.md` | — | — | ◎ R-5 | change_notifications / route_participants / target_date |

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

### R-4 通知センター改修（プレビュー）

- スレッド/確認依頼/解消記録 UI を撤去し、詳細パネルを「変更内容 + 情報経路 + 現場画面で開く」中心へ
- 日別軸を対象日基準へ変更、配置サブタグのフィルタ追加

### R-5 DB設計追補

- `03_データベース設計.md` へ追補: `change_notifications`（カテゴリ=エンティティ導出・`target_date`・スナップショット）、`route_participants`（情報経路関係者）
- スレッド系テーブルは「将来拡張」として設計メモのみ

### R-6 結合検証

- 通知発火マトリクス（notification-refactor-plan §17 相当）を新カテゴリ/対象日で再実行
- 4画面クロスジャンプ + センター導線の一括 Playwright 検証

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
| R-3a〜e 画面別適用 | R-3a/R-3b/R-3c/R-3d 完了 / 次は R-3e QA | 2026-07-06 | — | **R-3a 完了（SL・runtime検証済 2026-07-06〜07）**: 骨格再構成＋CSS読替＋中央表7列化＋右プロパティ4モード＋通知rail cn-card。スクショ `screenshots/r3a*.png`。**R-3b 完了（OB・runtime検証済 2026-07-08）**: 骨格＋右プロパティ3モード＋seg フィルタ（チェックポイント 9a2c8ae）に加え、**①行カレンダーを中央ビュー切替化**（カレンダー入力モーダル廃止・月ナビ/undo redo をツールバー共通へ一本化・編集は右プロパティ詳細ドック）**②連携・所在パネル実配線**（請求先/地図URL集約+288px内 iframe プレビュー/SL現場逆引き）**③変更履歴パネル実配線**（getItems('all') 行フィルタ+cn:jump 委譲）**④夜間色を `--night-text`(#d14d41) へ分離+死にCSS削除**（.md-ob-filter-*・カレンダーモーダルchrome）。スクショ `screenshots/r3b-ob-cal-view.png` / `r3b-ob-linkage.png` / `r3b-ob-history.png`。**R-3c 完了（WS・runtime検証済 2026-07-08）**: R-3c-1骨格＋R-3c-2a panel-rail4モード＋R-3c-2b応援予約モーダル→ドック転換に加え、**R-3c-3 通知rail cn-card＋履歴配線**（統合ベルDOMを`.rail`へ移設／①選択セルモードに`wsRenderHistorySection`で変更履歴を埋め込み・選択時はsiteId+日付でフィルタ）。**R-3d 完了（LA・runtime検証済 2026-07-10）**: `co-tokens.css`を撤去し、`ds-tokens.css`/`ds-components.css`/`la-ds.css`へ読替。骨格を `toolbar / workspace(rail｜main-card｜prop｜panel-rail)` 化し、左レール=休暇/車両作業面+統合ベル、右プロパティ=ミニカレンダー常設+詳細/リスト/要対応の3モードへ統合。休暇詳細ポップオーバー・車両マスタ編集をドックへ転換し、通知の休暇target着地時は車両作業面から休暇面へ戻す。スクショ `screenshots/r3d-la-initial.png` / `r3d-la-detail-dock-settled.png` / `r3d-la-vehicle-dock.png`。**次=R-3e QA**。 |
| R-4 センター改修 | 未着手 | — | — | |
| R-5 DB設計追補 | 未着手 | — | — | |
| R-6 結合検証 | 未着手 | — | — | |
