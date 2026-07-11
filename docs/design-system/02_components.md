# 02. コンポーネント仕様 — Calm Operations

**最終更新**: 2026-07-03（カタログ 37 件 全採用確定 / 2026-07-03 ユーザー宣言）
**CSS 正本**: `docs/mockup/ds-components.css`（ds-tokens.css を先に読み込む）
**DOM 見本の正本**: `docs/preview/design-refresh-components.html`（各 `<article data-comp="X-nn">`）/
レイアウト骨格は `docs/preview/design-refresh-sl-layer-mockup.html`

実装ルール: **新しい CSS を書く前に必ず ds-components.css の既存クラスを探す**。
無い場合は §1 の語彙ファミリーから最も近いレシピを使う。それでも足りない場合は実装せずユーザーへ提案する。

---

## 1. 語彙ファミリー（レシピの系統）

同じ「素材語彙」を共有するコンポーネント群。新規部品が必要なときは必ずこのどれかに帰属させる。

| ファミリー | レシピ | 属するクラス |
| --- | --- | --- |
| 浮きカード | `--shadow-card-outer` + `--bevel-card` + 白面グラデ | `.surface` `.prop-card` `.kpi` `.toast` `.menu-pop` `.cn-card` `.main-card::before`(トレイ) |
| ライトカード | `--soft-line` 枠 + 淡グラデ、hover で `--elevation-1` | `.lite-card` `.cn-item` `.acc-item` |
| 白ベベル浮きボタン | 白縁ベベル（上左明・右下暗）+ 薄影 | `.btn-secondary` `.log-tab` `.pg-btn` `.tab` `.icon-btn` `.split-soft` |
| 凹トラック（インセット） | 左上暗→右下明の押し込み面 | `.seg` `.switch .track` `.progress` `.input` `.check .box` `.tbl-frame` `.grid-frame` |
| 濃紺選択ピル | 濃紺ベタ+白文字（濃色面使用権③） | `.filter-btn.active` `.pg-btn.current` |
| 青塗り主操作 | `to bottom right` 青グラデ+白文字 | `.btn-primary` `.tab.active` `.check :checked+.box` `.switch :checked~.track` `.progress-fill` `.step.done .step-dot` |
| カプセルバッジ（D&D） | 中央凹みグラデ（公式例外①）+ 2層影 | `.person` `.vehicle-tag` `.user-chip` |
| 淡色フラット面 | `--soft-line` 枠 + 淡面色・影なし | `.section` `.acc-body` `.empty-state` `.change-log` `.note-content` |
| 濃紺ポップ | `rgba(20,38,53,0.94)` オーバーレイ | `.tip::after` ツールチップ各種（`data-tip` 属性方式） |

## 2. A. ボタン・入力系（12件）

| ID | 名前 | 主クラス | 規範 | 禁止・注意 |
| --- | --- | --- | --- | --- |
| A-01 | ボタン階層 | `.btn` + `-primary/-secondary/-flat/-ghost/-danger`、サイズ `-sm/-lg` | 主操作=青塗り（**1画面1〜2個**）/ 標準=白ベベル / フラット=ツールバー用（高さ0）/ ゴースト=文字のみ / 危険=薄背景+オレンジ文字 | 危険操作を強い塗りにしない。既定高 32px・sm 26px・lg 38px |
| A-01拡張 | 旧 co-buttons 由来バリアント | `.btn-outline`（青枠副操作）/ `.btn-icon`（正方形・幅=高さ）/ `.btn-ghost--danger-hover`（hover で警告色）/ `.btn-ghost--pill-dashed`（破線ピル追加ボタン）+ `[data-density]` 連動（compact/spacious は sm/lg 実値へ1段シフト） | R-3f #1（2026-07-11 ユーザー承認）で ds-components.css §H に受け皿化し co-buttons.css を撤去。旧 teal→`--blue`・旧桃色 danger→Signal Orange へ読替 | 使用箇所は OB/SL の残置モーダル・右プロパティドック |
| A-02 | アイコンボタン | `.icon-btn`（`.sm` 26px / `.active` 青リング） | **必ず `title` + `aria-label`** を付ける | アイコンだけの操作に tooltip 無しは不可 |
| A-03 | 分割ボタン | `.split` + `.split-caret`（`.split-soft` 白版） | 既定動作+派生動作（保存して次へ 等） | — |
| A-04 | ボタングループ | `.btn-group` + `.btn.active`（押し込み表現） | **表示切替=グループ / フィルタ=seg** と使い分ける | seg と役割を混在させない |
| A-05 | テキスト入力 | `.field` + `.field-label` + `.input`（`.error` / `:disabled`）+ `.field-help` | 入力欄=押し込み面（インセット例外）。フォーカス=青2pxリング、エラー=オレンジ枠+ヘルプ文字 | — |
| A-05拡張 | 旧 co-forms 由来 | `.field-row`（フォーム行レイアウト・行内 .field は min-width 解除+input 幅追従）/ `.input-number`（80px 中央揃え・ネイティブスピナー維持）/ `.skip-link`（a11y。focus リングは DS 標準リング値へ読替） | R-3f #8 B-2b-2（2026-07-11 ユーザー承認）で ds-components.css §I に受け皿化し co-forms.css を撤去（.md-fi-* → .field/.field-label/.input へ置換） | 使用箇所は OB/SL のフォーム・右プロパティドック |
| A-06 | セレクト | `.select-wrap > select.input` | CSS山括弧（`::after`）。リッチな候補一覧は C-07 を使う | ネイティブ矢印を出さない（appearance:none） |
| A-07 | テキストエリア | `textarea.input` | 備考・作業内容など複数行 | — |
| A-08 | チェックボックス | `.check` = `<label class="check"><input><span class="box"></span>ラベル</label>` | 選択=青塗り+白チェック（CSS描画） | input は視覚非表示（opacity:0）で box が描画を担う |
| A-09 | ラジオ | `.check.radio`（同 DOM） | 排他 3〜5 個なら seg でも代替可 | — |
| A-10 | トグルスイッチ | `.switch` = `<span class="switch"><input><span class="track"></span><span class="knob"></span></span>` + `.switch-row` | 即時反映スイッチ向け。フォーム送信前提はチェックボックス | — |
| A-11 | 数値ステッパー | `.stepper`（btn-flat ± + 中央 `.input` tabular-nums） | 人数など小さい整数入力 | — |
| A-12 | 検索カプセル | `.search`（ピル型・内部 `<input>`） | SL 配置検索の確立形 | — |

## 3. B. テーブル・データ表示系（9件）

| ID | 名前 | 主クラス | 規範 | 禁止・注意 |
| --- | --- | --- | --- | --- |
| B-01 | 標準データテーブル | `.tbl-frame > table.dtable` | 彫り込みフレーム+**横罫線のみ**+行ホバー淡青+選択行 `.is-selected`（左青バー）。数値セル `.num`（中央揃え tabular-nums）、副行 `.sub` | 縦罫線を追加しない |
| B-02 | 高密度テーブル | `.dtable.dense` | 行高約28px・本文12px。OB 的一覧向け | 罫線は増やさず**余白だけ**詰める |
| B-03 | ソート+ページャ付き | `th.sortable`(+`.sorted`+`.sort-arrow`) / `.tbl-foot` + C-03 | ソート中=青文字+CSS三角 | — |
| B-04 | カード2種 | 浮き=`.surface`(+`.card-head/.card-foot`) / ライト=`.lite-card`(+`.clickable`) | 浮きカードは1画面の主役カード、ライトカードは一覧内項目 | — |
| B-05 | 統計サマリ行 | `.stat-strip > .stat`（`.stat-label`+`.stat-num`） | 縦罫線区切り・ラベル10px+数値18px。ツールバー右/カードヘッダ用 | — |
| B-06 | KPIカード | `.kpi`（`.kpi-label/.kpi-row/.kpi-num/.kpi-unit`） | **画面トップの集計用途限定**（ダッシュボード/経理D） | 現場詳細パネル内の3連タイルは却下判例（dl 行形式を維持） |
| B-07 | リスト3種 | `.list-plain`（タイムライン型）/ `.list-select`（`.is-selected`） | 履歴=時刻+内容、選択リスト=淡青面+白インセットリング | — |
| B-08 | セマンティックバッジ一覧 | `.tag`(+`.cat-*`) / `.info-pill`(+`.req/.missing`) / `.mini-badge`(+`.ok/.warn/.alert`) / `.count-state`(+`.ok/.short/.over`) / `.bell-count` / `.night-sample` | 意味色体系（01 §3）に厳密対応 | 意味の転用禁止。bell-count のグローは要対応系限定 |
| B-09 | アバター/ユーザーチップ | `.avatar`(`.sm/.lg`) / `.avatar-group` / `.menu-user`+`.presence-dot` / `.user-chip` | メニューバー右端にログインユーザー（全画面共通） | user-chip はカプセルバッジ語彙（公式例外①） |
| B拡張 | バッジ編集・表示（旧 co-shared-badges 由来） | `.md-ob-badge-*`（選択式バッジ D&D 編集一式）/ `.md-ob-row-chip(s)` / `.md-ob-confidence-chip`（確度）/ `.badge-display`+`.badge-tag`+`.badge-child-tag`/`.badge-gc-tag`（表示専用・SL） | R-3f B-3（2026-07-11 ユーザー承認）で ds-components.css §J に受け皿化し co-shared-badges.css を撤去。旧 teal 淡色→--blue-soft/--info-*・undo バー琥珀→DS alert 系・未定義 var(--primary)→var(--ink) へ読替 | 信頼度 active の琥珀 #f59e0b/灰青 #94a3b8 は確度の意味色のためリテラル維持（正式パレットは R-3f #5 で判断）。使用箇所は OB/SL |

## 4. C. ナビゲーション系（7件）

| ID | 名前 | 主クラス | 規範 | 禁止・注意 |
| --- | --- | --- | --- | --- |
| C-01 | タブ3種 | カード=`.tabs > .tab(.active)` / セグメント=`.seg > button(.active)` / アンダーライン=`.utabs > .utab(.active)` | **カードタブ=右プロパティの機能切替 / seg=フィルタ・小型タブ / アンダーライン=ページ級の大きな切替** | seg は `data-multi` で複数選択対応（GC 組み合わせフィルタ） |
| C-02 | パンくず | `.crumbs`（`.current` + `.chev`） | 設定・管理・センター詳細など階層ページ用 | メイン4画面はレール切替なので多用しない |
| C-03 | ページネーション | `.pager > .pg-btn(.current)` | 現在ページ=濃紺選択ピル | — |
| C-04 | ステッパー（進行段階） | `.steps > .step(.done/.current/.todo)` + `.step-line(.done)` | 完了=青塗り白チェック / 現在=白ベベル+青リング / 未到達=フラット青灰 | 接続線は完了区間だけ青 |
| C-05 | アコーディオン | `.accordion > .acc-item(.open)`（`.acc-head` + `.acc-body`） | 開いた本文は淡色フラット面 | — |
| C-06 | サイドメニュー（件数付きナビ） | `.side-nav`（`.side-nav-heading` / `.side-nav-item(.active)` + `.nav-count`） | アイコン+ラベル+右端件数。アクティブ=淡グレー面 | 変更通知センターの確立形 |
| C-07 | ドロップダウンメニュー | `.menu-pop > .menu-item(.danger)` + `.menu-divider` + `.shortcut` | 浮きカード（elevation-4）。危険項目=オレンジ文字+薄橙ホバー | — |

## 5. D. フィードバック・オーバーレイ系（9件）

| ID | 名前 | 主クラス | 規範 | 禁止・注意 |
| --- | --- | --- | --- | --- |
| D-01 | モーダル（カード型） | `.modal`（`.modal-head/.modal-body/.modal-foot`）+ ボディ内 `.modal-body-card` | **ui-rules 準拠**: ボディ=#E9F1F6+白カード。用途は印刷プレビュー/ソート設定/カラー設定/集計・CSV出力/一括操作/削除確認に限定（03 §1.1 の振り分け基準 2026-07-03。通常編集は右プロパティ） | 暗幕=`rgba(23,43,58,0.38)`（`.modal-stage` の背景値を流用） |
| D-02 | 確認ダイアログ（危険操作） | `.modal` 小型 + `.confirm-msg` + `.warn-icon` | 実行ボタンも `.btn-danger`（薄背景+オレンジ文字）。**キャンセルを標準ボタンにして安全側優先** | — |
| D-03 | トースト | `.toast`（`.toast-icon.info` / `.toast-title/.toast-msg`） | **操作フィードバック専用**（保存完了等）。変更通知はレール通知カード（cn-card）を使う | 完了系は緑にせずニュートラル+青アイコン |
| D-04 | アラートバナー | `.banner.info/.warn/.danger`（`.banner-action`） | 画面・カード上部の常駐帯。右端にアクション可 | — |
| D-05 | プログレスバー | `.progress-row`（`.progress-meta` + `.progress(.thin) > .progress-fill`） | 凹トラック+青フィル | — |
| D-06 | スピナー | `.spinner`（`.sm`） | 青リング回転のみ | 装飾光なし |
| D-07 | スケルトン | `.skel`（`.line/.title/.circle` + `.skel-card/.skel-row/.skel-col`） | シマーは左→右（光源方向と整合） | — |
| D-08 | 空状態 | `.empty-state`（`.empty-title/.empty-sub` + 標準ボタン） | データ0件時に次の行動を示す。空欄のまま放置しない | — |
| D-09 | ツールチップ | `.tip` + `data-tip` 属性（`::after` 描画） | 濃紺ポップ・上方向8px。hover/focus-visible で表示 | — |

## 6. L. レイアウト骨格・SL 確立コンポーネント

DOM 正本: `docs/preview/design-refresh-sl-layer-mockup.html`。全画面をこの骨格に揃える（詳細は 03）。

| 部位 | 主クラス | 規範 |
| --- | --- | --- |
| アプリ枠 | `.app` | 画面全体の丸枠トレイ |
| メニューバー | `.menubar` + `.menu-user` | 濃紺帯（濃色面使用権①）。右端にユーザーチップ+在席ドット。R-3f #6 で共有 `co-navbar` へ実装済み。LA はチップメニュー内で本人/DCP/管理ロールを切替 |
| ツールバー | `.toolbar` / `.tool-group` / `.tool-btn(.primary)` | **高さ0のフラット面**（影なし）。主操作 `.tool-btn.primary` は1〜2個 |
| ワークスペース | `.workspace` | grid 4カラム: 左レール 72px / 中央 main / 右プロパティ 288px / panel-rail 58px |
| 左レール（作業面切替） | `.rail`（+ `.rail .bell-count`） | 白フレームに濃紺内面が嵌まる二重構造。**最上位の高さ（elevation-5）**。アイコンは白抜き（`filter: invert(1)`）。ベルボタンに件数バッジ（グロー例外②） |
| レール通知カード | `.cn-card`（`.cn-head/.cn-list > .cn-item/.cn-foot`） | ベル右横にスライド表示するオーバーレイ（レイアウトを動かさない）。項目=`.cn-site`+`.cn-diff`（`.d-label/.d-from/.d-arrow/.d-to`）+`.cn-meta`。アクションは「センターで開く→」のみ。着地は `.cn-flash`（1.1s フラッシュ）+既存 `.is-selected` |
| 中央メインカード | `.main-card`（`::before`=外側トレイ）+ `.main-head` + `.main-title` | 一枚板の白面（個別セルにグラデを掛けない）。外側トレイが浮き、内側は `.grid-frame` で彫り込み |
| 彫り込みフレーム | `.grid-frame`（SL 中央表用・margin あり）/ `.tbl-frame`（汎用・B-01） | 内側段差リング方式で「少しへこんだ境界」。同心円の角丸（外14px→内8px） |
| SL 中央表 | `.grid > .cell(.head/.center-cell/...)` | 7列+履歴列。列罫線なし・横罫線 `--soft-line`。集合/時間/人数は中央揃え |
| 区分バッジ | `.category-badge`（`.gc-touo/.gc-nikkei/.gc-zennihon` / `.long`）+ `.category-cell[data-gc]`（ホバーで GC 名ポップ） | 44px 円・GC 色ベタ。中に会社アイコン（metaball）+区分名 |
| 現場セル | `.site-cell`（`.client` + `.site-name` + `.site-icons`） | 夜間は行内文字へ `.night-text` |
| 時間・人数 | `.time-block/.time-stack/.time-line` / `.count-line/.count-main` + `.count-state` | tabular-nums。開始/終了は縦積み（区切り記号なし） |
| 社員カプセル | `.person`（`.person-icon`(svg sprite `#ic-person`) + `.person-name` + `.person-warn` + `.contact`）+ `.belong-N` | D&D 対象（cursor:grab・2層影・hover増強）。所属色は人物シルエットの fill のみ。`.contact`（電話アイコン連絡状態）は**現在無効化中**（`display:none !important` 1行で制御。再開時はその1行を削除） |
| 車両/ETC タグ | `.vehicle-tag` + `.vehicle-label` + `.belong-N` | `わ 12-34` / `ETC-A` 形式。社員カプセルと同語彙 |
| 警告アイコン | `.warn-icon[data-tip]` / `.person-warn[data-tip]`（子 svg `#ic-caution-line`） | `.warn-icon` は **::before の mask で自動描画するため子要素不要**（カタログ D-02/D-03 の子 svg 版は本仕様で廃止）。理由はホバーポップで示す |
| 右プロパティ | `.prop > .prop-card`（`.prop-head/.prop-mode/.prop-body`）+ `.tabs` | 浮くのは prop-card 1枚だけ。内部 `.section` は淡色フラット面 |
| panel-rail（右パネル切替） | `.panel-rail > button(.active)` | icon-btn と同レシピ。**active=青リング（ds-components 実値が正 / 2026-07-10 ユーザー確定）**。WS/LA の旧「白面+ニュートラル枠」再実装は R-3f #2（2026-07-10）で正へ統一済み |
| セクション/詳細 | `.section` + `.section-title` / `.detail-list > .detail-row` | 現場詳細は dl 行形式（3連タイル禁止） |
| D&D 受け皿 | `.drop-zone(.empty)` / `.drag-pool` | 点線はドラッグ中/ホバー時に強調（常時主張させない） |
| 絞り込みチップ | `.filter-row > .filter-btn(.active)` | active=濃紺選択ピル |
| 候補リスト | `.candidate` | 社員候補（並び: 所属GC→区分/所属課→入社日古い順） |
| 変更履歴/備考 | `.change-cell > .change-log`（`.cl-label/.cl-from/.cl-arrow/.cl-to`）/ `.note-content` + `.log-head .seg .log-tab` | 淡色カード統一（濃紺の未確認シグナルは廃止 2026-06-11）。切替はヘッダ内 seg |
| セル選択 | `.clickable-cell(.is-selected)` | 選択=青アウトライン（inset）+白インセットリング |
| 履歴リスト | `.history-list` | 右プロパティの時刻+内容リスト |

## 7. 共通規範（全コンポーネント）

- **アイコン**: `docs/assets/icons/` の SVG のみ（icon-usage 規約）。絵文字・Unicode 記号での代用禁止。
  実装は ①CSS 変数方式 `.icon.i-xxx`（`--icon-*` + filter で着色: `icon-ink`=濃青灰 / `icon-white`）
  ②インライン svg sprite（`#ic-person` / `#ic-caution-line` — fill=currentColor で所属色・警告色を継承）の 2 方式
- **方向記号**（山括弧）: アイコンライブラリ対象外のため CSS シェイプ `.chev(.down/.right/.left)` で描く
- **ツールチップ**: `data-tip` 属性 + `::after` 方式で統一（`.tip` / `.warn-icon` / `.person-warn` / `.contact`）
- **a11y**: icon-only ボタンに `title` + `aria-label`、装飾要素に `aria-hidden="true"`、視覚非表示テキストは `.sr-only`、グループに `role="group"` + `aria-label`
- **インタラクション時間**: transition は 120〜160ms ease を基準（出現アニメ `cnSlideIn` 160ms）
