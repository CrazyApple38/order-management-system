# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-06-11
- **コミット**: 355150f（Codex の変更通知情報照合 + スレッドUIモックを独立コミット化した直後）

## 直前にやったこと

- (Claude Code) **参考画像（screenshots/plan_pic/ 11枚）から新デザイン要素を抽出 → 仮実装 → ユーザー個別判断で確定（2026-06-12）**。判断記録は `mockup-refactor-plan.md` §2.1。**採用7点**: ①セグメントコントロール（凹トラック+浮き白ピル、`data-multi` で GC 複数選択対応）②濃紺選択ピル（**濃色面の使用権に「選択状態」を追加**、見本=SL社員配置の絞り込みチップ。昼夜フィルタは機能不要で撤去）③統計サマリ行（未連絡/OB更新/不足の縦罫数値ブロック）④件数付きナビ（センターをライトリストナビ化、軸ごとのグループ数表示）⑤白カウンター影（`--shadow-card-outer` に上方向白光1行）⑥ユーザーチップ+在席ドット（メニューバー右端「● 佐藤」）⑦要対応バッジの極小グロー（橙ハロー、**「意味のある光」の公式例外=要対応・警告系バッジ限定**）。**却下1点**: ⑧ラベル付きインフォタイル（dl行へ復元済み）。実装は SL層モック + センターモックの2ファイル、Playwright 検証済み。
- (Claude Code) **通知カテゴリの導出ルールを採用・記録（2026-06-12）**: カテゴリは画面別ではなく**エンティティ別**（受注/配置/申請/マスタの現行4分類を維持、導出ルールのみ変更）。車両・ETCは配置のサブタグ（専任担当を置く場合は昇格再検討）。**対象日（影響する勤務日）を第一級ファセット化**し日別表示は対象日基準に。通知は事実の変更のみ・派生状態（不足等）は警告の責務。`notification-refactor-plan.md` §3.7.9 + 要件定義に記録。
- (Claude Code) **リファクタ統合計画を新規作成**: `docs/plan/mockup-refactor-plan.md`。新DS適用 × 通知簡素化 × カテゴリ再定義を**画面ごとに一括適用**する計画（R-0 決定記録=完了 / R-1 DS基盤統合 / R-2 通知データモデル改修 / R-3a〜e 画面別適用 SL→OB→WS→LA→QA / R-4 センター改修 / R-5 DB追補 / R-6 結合検証）。**本計画外での個別先行実装は凍結**（ユーザー指示）。R-2 は `mock.oms.state.v1` 構造変更を伴うため Codex と期間調整が必要。
- (Claude Code) **変更通知を簡素化モデルへ改訂（ユーザー判断 2026-06-11）**: 責務を「知らせる + 該当箇所を示す」に限定し、確認のやりとりは**システム外（電話・チャット）**で行う運用に。情報照合スレッド・照合状態は将来拡張へ格下げ（計画書 §3.7.5/3.7.6 に注記、新 §3.7.8 が現行の正。要件定義も同期更新）。変更通知センター（集積ページ）は採用継続、スレッド領域は簡素化対象。
- (Claude Code) **SL モックにレール通知カードを実装**: 左レールのベルボタン（件数バッジ付き）→ プロパティ風カードがレール横へスライド表示（同一画面オーバーレイ・レイアウト不変、AskUserQuestion 4項目確認済み）。通知項目クリックで該当セルへスクロール + 既存 `selectCell` の選択枠 + 初回フラッシュ（`.cn-flash` 1.1s）。アクションは「変更通知センターで開く」リンクのみ。×/ベル再クリックで閉じる。閉じるアイコンは `im-11911-hosoi-batsu.svg`。Playwright 実証済み（console error 0）。
- (Claude Code) **変更通知の未決論点①〜⑤をユーザー採用で確定し、計画書 §3.7.6/3.7.7 に記録**。要点: 照合状態は opt-in（スレッド生成時から `確認中→解消済み` 2状態 + 食い違いタグ）/ 自動検知は候補フラグのみで状態遷移させない / 依頼先は社内ユーザーのみ（社外は外部確認タスク+転記）/ 「採用」専用ボタンは作らない（現行情報切替=通常編集+スレッド自動リンク）/ SL・WS判断理由は警告踏み越え時のみ必須 / 要返信バッジ=自分宛確認依頼のある確認中スレッド数のみ。
- (Claude Code) **スレッドUIは3層構造に決定**（§3.7.7）: 通知パネル=トリアージ（検索撤去）/ **変更通知センター**（専用ページ・新設）=検索・縦型軸タブ・スレッド集約 / SL右プロパティ=文脈内スレッド。**3カラム構成（キュー+業務管理計画書テーブル+スレッド）はユーザー判断で不採用**（理由付き判例として §3.7.7 に記録。`change-notification-thread-mockup.html` は残置）。
- (Claude Code) **変更通知センターのモック新作**: `docs/preview/change-notification-center-mockup.html`（新DS準拠・自己完結）。左=縦型軸タブ（要対応/日別/契約先/現場/種別/担当者、SL左レールと同じダークガラス意匠）、中=グループ化リスト、右=詳細+情報照合スレッド。軸切替でリストのグループ見出しが変わる方式。スレッド操作（返信/確認依頼/食い違い報告/電話確認記録/解消として記録/再開）と要対応バッジ連動を実装。Playwright 実証済み（console error 0）。レール用アイコンは `docs/assets/icons/` から採用（カレンダー im-00188 / ビル im-00084 / ピン im-00020 / タグ im-14540 / 人物 im-00142 / タスク im-16152）。
- (Claude Code) SL モックの追加調整2点（ユーザー指示）: (1) **社員/車両ETCバッジの浮きを強化** — 静止時影を2層 `0 4px 8px / 0 2px 3px` へ（AskUserQuestion で「やや強め」を選択、hover は `0 6px 12px / 0 2px 4px` に連動増強）。(2) **変更履歴カードの濃紺・状態駆動（確認済み機能）を廃止** — 全行を淡色カード（`#f9fbfc→#edf1f5` グラデ + `--soft-line` ヘアライン縁）に統一し、備考カード `.note-content` にも同じ縁を適用。`.change-log.confirmed` / `.cl-status` は削除済み。cl-* 文字色は淡色カード用（label/from/arrow=グレー系、to=`#2c4356`）に変更。
- (Claude Code) **光源ルールの公式例外を確定**: 社員/車両ETCバッジ表面の「青灰→白(60%)→青灰＝中央が凹んで見える」グラデは本デザイン最大の特徴部位としてユーザー判断で復元・維持（左上光源統一の対象外）。CSS とレビュー文書 §6 に例外として明記。今後この2箇所のグラデを左上明へ「修正」しないこと。
- (Claude Code) デザインレビューの改善案を **ユーザー承認の上で全面実装**（AskUserQuestion 8項目すべて推奨案採用、判断記録はレビュー文書 §6）。内容: (1) **光源を左上に統一** — 面グラデ約12箇所を「左上=明→右下=暗」へ反転、:root 冒頭に DS第一条コメントを明文化。(2) grid-frame の彫り込みを知覚可能レベルへ（alpha 0.02→0.04-0.055）。(3) **変更履歴カードを状態駆動化** — `.change-log.confirmed`（淡色+確認済ラベル）新設、1行目をデモ確認済みに。濃紺=未確認シグナル専用。(4) **ウェイト全面削減** — 900→700 / 800→600、`--table-strong` 800→600、フォント読込 400-700 のみに。(5) **角丸トークン化** — `--radius-xs/sm/md/lg/pill`（4/8/14/20/999）、レール13→14、grid内側10→8（同心円修正）。(6) バッジ静止時の外影1層化（hover で2層）+ 区分円 `0 2px 0`→`0 2px 4px`。(7) prop-card 内 section フラット化（淡面+ヘアライン、影全廃）。(8) 余白4px量子化（例外6px）、見出し/grid-frame の左右16px整列、muted `#667786`→`#5a6b7a`、person-name max-width 42→56px。共通影レシピ `--shadow-card-outer`/`--bevel-card` 新設（main-card::before と prop-card で共用）。**バグ修正**: 8列化の取り残し `.grid .cell:nth-last-child(-n+7)`→`(-n+8)`（最終行の区分セルに下罫線が残っていた）。Playwright 検証済み（console error 0、状態駆動表示・整列・レイアウト崩れなし確認）。
- (Claude Code) SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）の**デザインレビューを文書化**: `docs/plan/design-refresh-sl-review-2026-06-11.md`。最重要指摘は**光源の矛盾**（ベベル/影=左上光源 vs 面グラデ=右下光源、Codex と Claude が逆方向で実装した履歴の共存）。他に角丸12種の在庫過多、タイポウェイトのインフレ(700-900多用)、grid-frame 彫り込みの不可視化(alpha 0.02)、変更履歴濃紺カードの視覚階層支配、muted `#667786` のコントラスト境界、prop-card 内 section のカード入れ子等。§6 にユーザー判断チェックリスト8項目あり。**このコミットがデザイン改善実装前の状態保存点**。
- (Codex) `docs/plan/notification-refactor-plan.md` と `docs/01_要件定義.md` を更新し、変更通知の新しい中心目的を **受注変更の承認/却下ではなく、情報ソースの食い違いを解消する情報照合** として明文化。通常利用者はフラットな関係で、マスター権限と将来検討中の申請専用アカウントは別系統。
- (Codex) 変更入力を **受領記録型（OB/LA）** と **業務判断型（SL/WS）** に分類。OBの情報経路を `現場受注` / `営業連絡` / `契約先連絡` の3種類とし、現場・社員・営業担当者・契約先をマスタ参照バッジで選択する初期要件を追加。
- (Codex) 初期リリースは入力者とシステム入力日時を自動記録し、受領日時・各伝達時刻は扱わない方針を確定。変更通知1件に情報照合スレッドを紐づけ、外部確認結果と解消経緯を残す要件を追加。モックアップは変更していない。
- (Codex) 変更通知の発展案として、**変更確認スレッドUI専用モック** `docs/preview/change-notification-thread-mockup.html` を新規追加。共通メニューバー（要返信/変更通知入口）、左縦メニュー（画面/通知領域切替）、SL上部ツールバー（未確認/要返信/解決済フィルタ・確認依頼・履歴検索・連絡出力・配置確定）、中央の変更確認キュー、右プロパティの変更内容/理由/確認スレッド/確認依頼/返信欄を一画面で確認できる構成。
- (Codex) 変更キューの選択に応じて右プロパティのスレッド内容が切り替わるJSと、返信追加でスレッド件数が更新される簡易動作を実装。Apache 経由 `http://localhost/order-management-system/docs/preview/change-notification-thread-mockup.html` で 200 OK を確認。
- (Codex) Playwright 代替検証で 1440x920 表示、キュー選択、返信追加、横見切れなし、console/page error なしを確認。スクリーンショットは `screenshots/change-notification-thread-mockup.png` に保存。
- (Claude Code) SL モックのタイポ微調整 + レイアウト修正。**集合 `.time-sub` / 時間 `.time-line`（+予備 `.time-main`）を 18px → 14px**（人数 `.count-main` は 18px 据え置きで突出）。**配置 `.person-name` / 車両ETC `.vehicle-tag` のバッジ文字を 12px → 14px**。区分バッジの円拡大（52px）は試したがユーザー判断で 44px に戻し据え置き。**区分列の見切れバグ修正**: `.grid` 1列目 58px → 64px（`.category-cell` 左右パディング各8px=16px を引くと 42px<バッジ44px で `overflow:hidden` により左右が欠けていた。64−16=48px で解消、グリッド総幅 +6px）。
- (Claude Code) SL モックに**「数値大・文字小」のタイポ階層**を適用（明快=数値1.6×）。新変数 `--table-num: 18px` を新設し、数値（時間 `.time-main/sub/line` / 人数 `.count-main`）を 18px へ。現場名 `--table-main` を 15→14px、区分バッジ `.category-badge` を 12→11px に。**配置 `.person-name`・車両ETC `.vehicle-tag` のバッジ文字はユーザー判断で 12px**（13→11→12 と推移して確定）。「数値を横圧縮して縦長に見せる（`scaleX`）」は一度試したがユーザー判断で**撤回・元の横幅に戻した**（`--num-scale-x` 等は残さず全撤去）。補助/サブ文字は 11px 据え置き。階層は「数値18=主役 / 現場名14=準 / 区分・バッジ・ラベル11〜12=従」。
- (Claude Code) SL モックの**メイン土台 `.main-card` の角丸を 18px → 14px** へ下げ、プロパティ(14px)・左レール(13px)と同一帯へ統一。`::before` トレイは同心構造維持のため 24px → 20px（本体+6px）に連動。折衷案16pxを一度経由しユーザー判断で14px基準に確定。**メイン/プロパティの土台構造はコミット `fdc799e` 時点と同一**（プロパティへの `::before` 適用は検討したがユーザー判断で撤回、メインのみ `::before` トレイ保持）。なお `::before` の `inset:-6px` を 0 にするとトレイ(白リム/白枠/背景/ベベル)が本体背面に隠れ outer 影だけ残る挙動である旨をユーザーへ説明済み（未適用）。
- (Claude Code) SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）の `.prop-card`（右プロパティ土台）の縁の陰影を **メイン土台（`.main-card::before`）と同方向＝左上明・右下暗** に整合。(1) 内側ベベルを方向別8 inset → メインと同一の2行（`inset 1px 1px 0 rgba(255,255,255,0.96)` 左上明 + `inset -1px -1px 0 rgba(182,198,211,0.20)` 右下暗）に置換。(2) 枠線を青灰の方向別4色 → メインと同じ均一純白 `rgba(255,255,255,0.88)` に。(3) メインに無い暗い内側線 `inset 0 0 0 1px rgba(58,84,104,0.08)` を削除。outer ドロップシャドウ（`0.040/0.075/0.045`）は両者一致のまま維持。**構造差（メインは `::before` で6px外側に張り出す土台トレイ／プロパティは本体直貼り）は今回は揃えずユーザー判断で残置 → 次タスクでメイン側を本体直貼りへ寄せる予定**。
- (Codex) SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）の右側縦型アイコンメニューを **現場詳細 / 社員配置 / 車両・ETC / 変更履歴** の4モードに整理。中央表クリックと縦メニュークリックを同期し、選択セルをハイライトするJSを追加。
- (Codex) 中央表のクリック定義を実装: 区分・契約先/現場名・集合・時間・人数列は現場詳細、配置列は社員バッジD&D表示、車両/ETC列は車両/ETCバッジD&D表示、変更履歴カードは変更履歴一覧を右プロパティへ表示。
- (Codex) 右プロパティ本文を行データから動的生成するよう変更。現場詳細は区分/契約先/GC/集合/時間/人数/備考、社員配置と車両/ETCは配置済みドロップ領域 + 候補バッジ、変更履歴はカード内の履歴3件 + 備考を表示。
- (Codex) 右側縦型アイコンメニューの配置を **メイン表 | プロパティ | 縦型アイコンメニュー** に変更。プロパティ右パディングとメニュー左右マージンを詰め、メニュー影を `elevation-5` からプロパティ相当の `elevation-2` へ下げた。
- (Codex) 右側縦型アイコンメニューは、ユーザー判断により **アイコンのみの小ボタン** へ復帰。右端列は 58px、ボタンは 34px 四方。ラベルは `sr-only` に戻し、視覚上はアイコンのみ。さらにメニューバー本体の背景/枠/影を撤去し、ボタンだけが縦に並ぶシンプル構造にした。ボタンの立体感（薄い白面/細枠/浅い影）は維持。
- (Codex) 右プロパティカードの土台枠は、`.main-card` と同じ `::before` 方式を試したが浮き感が強いためユーザー判断で撤回。現在はひとつ前の状態に戻し、`.prop-card` 本体に外側ドロップシャドウ（`0 0 0 1px` / `0 4px 9px` / `0 1px 3px`）と既存の内側縁表現を直接持たせている。
- (Codex) 右プロパティカード内のヘッダー/本文境界を撤去。`.prop-head` の下罫線・個別グラデーション背景・insetハイライトを外し、カード全体のグラデーションが一枚板として連続するようにした。
- (Codex) 右プロパティカードに、中央メイン土台 `.main-card::before` と同量の外側ドロップシャドウ（`0 0 0 1px` / `0 4px 9px` / `0 1px 3px`）を追加。内側の縁表現は維持。
- (Codex) Apache 経由 `http://localhost/order-management-system/docs/preview/design-refresh-sl-layer-mockup.html` で 200 OK を確認。Playwright 代替検証で現場詳細/社員配置/車両ETC/変更履歴/縦メニュー切替が通り、pageerror/console error なし。※in-app Browser 推奨経路は `node_repl` 起動失敗のため代替 Playwright で確認。
- (Claude Code) SL 変更履歴列を**「変更履歴／備考」タブ切替式**に。ヘッダの「変更履歴」を `.log-tab` 2ボタン（角丸四角・border 方向別色のエッジ＋薄グラデ・アクティブは inset 押し込み）に変更し、各行に `.note-content`（現場メモのダミー）を追加。末尾 script でタブクリック→ `.change-log`/`.note-content` の `hidden` を切替（`[hidden]{display:none!important}` で flex を上書き）。**変更履歴カード＝濃紺（rail 風黒カード）／備考カード＝白寄りグレーのグラデ**（`#edf1f5→#f9fbfc`・文字 `#3d505f`）で切替時に区別しやすく。
- (Claude Code) 変更履歴カードを整形: `.change-cell` を `align-items:stretch`＋左右 padding 0 で**カードを行高100%・列幅100%**に。ダミーを各行 **3項目（3行）**に拡張。**契約先/現場名（`.site-cell`）を flex 縦中央**に。
- (Claude Code) 配置の**人物アイコンを 16→20px** に拡大（社員バッジも min-height 28→32 等で拡大、車両/ETC は据え置き）。※所属色の角丸四角バッジ化を一度試したがユーザー判断で却下し、所属色アイコンのみへ復帰。
- (Claude Code) **所属会社カラーを Flexoki パレットへ刷新**。従来の寒色アナログ10色は色相が狭く小アイコンで識別困難だったため、`--belong-1〜5` を Flexoki 600 の離散5色相（Blue/Cyan/Green/Purple/Magenta、警告の赤橙は回避）に変更。下部 `Belonging Company Colors`(#bcList) の `belongPalette` を **Flexoki 16色**（8色相×明400/濃600）へ差し替え、選択ターゲットを **A〜E の5社**に縮小（初期割当 `[12,10,8,14,16]`）。bg/border は `color-mix` で hex から動的生成。**選択色は区分円(`--gc-*`→belong-1〜3)・配置の人物アイコン(`--belong-color`)へ即反映**（Playwright で実証: A社→Orange で施設/イベント区分円＋林アイコンが連動）。
- (Claude Code) 社員バッジの名前左に**人物アイコン**を追加。`person/im-15537-jimbutsu.svg` をスプライト(`#ic-person`)化し、`.person-icon`（`color: var(--belong-color)` で所属色）で5名に表示。**所属色の識別はこのアイコンで担う**（バッジ面の所属色は前段で廃止済み）。社員バッジを拡大（min-height 28→32/min-width 52→58/padding 5px 11px）、アイコン 13→16px。車両/ETC バッジはユーザー判断で現状サイズ維持。
- (Claude Code) SL モックの社員/車両/ETC バッジを**二重カプセル → 1枚バッジに刷新**。`.person::before`/`.vehicle-tag::before`（内側カプセル）と `::after`（所属色左リブ）を削除し、外バッジ背景を**青灰の斜めグラデ**（`rgba(200,213,226,0.38) 0% → #fff 60% → rgba(206,219,230,0.22) 100%`、左上濃→中央白→右下端薄、ごく薄く）に。`.rail`（左縦メニュー）の白縁の作り（border 方向別色のベベル＋inset 左白/右暗＋落ち影）を参考に、rail 風白縁ベベルは維持。**所属色（belong）の面表現は廃止**（ユーザー判断で所属色なし）、hover の color-mix(belong) も青灰固定へ。※belong-* クラス/トークンは DOM・:root に残置（未使用）。
- (Claude Code) SL 中央表に**8列目「変更履歴」列を追加**（車両/ETC の右）。各行に「項目ラベル＋旧→新」を縦並び表示（例: 集合 07:00→06:40 / 配置 田中→林）。**ダミー固定**（co-mock-store 等の共通ストアには未連動）。列追加に伴い全体幅を拡張: `.page` 1500→1710px / `.workspace` 中央 minmax 918→1128px / レスポンシブ `.workspace` 1388→1598px / `.grid` に 210px 列追加。CSS は `.change-log`/`.cl-*` 系を新設。右プロパティ(288px)は維持。
- (Claude Code) 「業務管理計画書」ヘッダー（`.main-head`）の `border-bottom`（下区切り線）を削除。
- (Claude Code) SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）の `.grid-frame`（区分/配置テーブル外周）の**沈み込み表現を作り直し**。従来は上内側が白くハイライト＝凸の光り方で平板だったため、**光源を左上に統一**し inset 影を「上・左内壁＝影 / 下・右内壁＝受光（右下が明るい）」へ反転。深さはユーザー指示で段階的に減衰させ、最終的に影成分はごく薄く（上左 `rgba(40,60,80,0.02)`／下右受光 white `0.30〜0.40`）。試作した内側ドロップシャドウ（左上→右下方向）は最終的に不採用で撤去。
- (Claude Code) **主線（grid-frame の border、inset 影の外側にある実線）を4辺個別色化**してベベル風の立体感を付与。左上2辺 `rgba(226,234,241,0.95)`／右下2辺 `rgba(232,238,243,0.95)`（base `rgba(216,225,232,0.95)`）。微調整はユーザー目視で確定。`border-radius`/`margin`/`padding` 等の他属性は不変更。
- (Codex) ユーザー判断により、SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）の社員バッジ・車両/ETCバッジから、所属GC色フレア、白リム、下辺中央の点光源、チップ影を撤去。フラットデザインに合わせ、淡い所属色の面 + 細枠 + 左側所属色ラインへ戻した。`.flare-source` マークアップも本体から削除。
- (Codex) 撤去した光と影の表現は再利用候補の判例として `docs/preview/reference/sl-badge-flare-shadow-reference.css` に独立保存。現行モックからは読み込まない保存用CSS。
- (Codex) ユーザー添付画像を参考に、モノトーンベース + 最小量のサイバーアクセント方向の配色候補 `Mono Cyber Operations` を追加。上部にあった `SL 情報レイヤー モックアップ` 説明、凡例、所属カラーUIをページ下部へ移動し、下部にベース/意味色/所属会社10色のカラー一覧表を追加。所属カラーUIは5色固定から10社/10色候補へ拡張。
- (Codex) `Mono Cyber Operations` の高彩度ライム/シアンは子供っぽさが強いというフィードバックを受け、下部の配色検討を添付画像風のテーマカード群へ置換。`Matcha Fog` / `Slate Mono` / `Icy Indigo` / `Warm Sandstone` / `Modern Mauve` / `Deep Mint` と、画像外補完の `Cool Graphite` / `Crimson Ledger` / `Olive Steel` / `Soft Azure` を追加。所属会社の選択カラーは後工程として、選択UIを下部から外した。
- (Codex) 下部の `SL 情報レイヤー モックアップ` カード右側から旧凡例（昼夜は橙文字/警告はアイコン/GC/区分/所属色）を削除し、夜間文字と警告アイコンの決定色カードへ置換。夜間文字はFlexokiの赤を参考にした `Flexoki Red #D14D41`、警告アイコン/バッジはピンポイントで目立たせる `Signal Orange #F15E2A` + 背景 `#FFF0E8` + 枠 `#F5A17C`。`.person-warn` も警告色へ統一。
- (Codex) 所属会社カラー選択UI（`#bcList`）を下部に復活。A〜J社の10社分を対象に、低〜中彩度の寒色〜紫灰系10色（`Slate Blue #4F6F9F` / `Steel Cyan #2F7E9A` / `Blue Gray #637A8E` / `Indigo #5967B1` / `Soft Violet #7A6BAE` / `Plum Slate #8A638E` / `Deep Azure #3D73B7` / `Teal Slate #2C7C78` / `Periwinkle #7185C6` / `Graphite #6F7784`）へ再コーディネート。重複選択時はスワップして常に10社10色を維持し、`--belong-*` を更新して社員/車両/ETCバッジとGC行色へ即反映。UIは会社名 + 小型10スウォッチのみを常時表示し、色名/コードは `title` / `aria-label` に残す。横1段に詰め込まず、2〜3段で余裕を持たせる。
- (Codex) 業務管理計画書テーブルのタイトルヘッダー、列ヘッダー、セル背景を白い素材表面として調整。浮遊感、下方向の強いドロップシャドウ、暖色反射は使わず、タイトルヘッダーを含む業務管理計画書パネル全体を一枚板として左上がやや暗く右下が明るい、ごく浅い面内グラデーションにした。タイトルヘッダー/列ヘッダー/ボディセル単位の個別グラデーションは撤去し、外側に白いリム、その外周に薄い黒〜青灰の狭いグロー、パネル本体に弱い内側境界を追加。低めの高さで左側縦型メニューバーに近い白い外枠の浮き上がりを出す方針。社員バッジ・車両/ETCバッジはカプセル型 + わずかな影 + 内側カプセルの入れ子へ変更し、所属会社色は全面塗りではなく内側カプセル左端の細い縦リブで示す。
- (Codex) 区分、契約先/現場名、配置などが並ぶ実テーブル外周（`.grid-frame`）を案Bの内側段差リング方式へ変更。内側の薄い青灰境界線、そのすぐ内側の白いハイライト、弱い内向き陰で少しへこんだ境界として見せる。
- (Codex) SLモック全体の白い素材面の光源方向を、右下から浅い拡散光が入る前提へ統一。ページ背景、検索カプセル、社員/車両/ETCバッジ、右プロパティカード、タブ、補助パネルは、左上をやや締めて右下を白く抜く `to bottom right` の浅い面内グラデーションへ寄せた。警告色やテーマカード内の色見本など意味色は変更しない。
- (Codex) 参考画像中央の白い物体風に寄せた旧試作の落ち影/暖色反射と内側エッジ効果は、ユーザー判断でイメージと異なるため撤去。2つ前の状態（右下光源へ揃えた浅い一枚板グラデーション）へ戻した。
- (Claude Code) SL モック（`docs/preview/design-refresh-sl-layer-mockup.html`）の**情報バッジ配置を整理**。不要情報（時間列「未定」/ 車両ETC列「未配・ETC未」）を削除。**資格者不足を配置列 → 該当現場(港湾道路 夜間片交/Nikkei)の `.site-icons` 下へ移動**（契約先/現場名の下）。配置列の info-pill/alert-row を全廃（残 alert-row は右プロパティのみ）。これに伴い配置セルのストレッチ/最下部ピン留めCSSを撤去し**社員バッジを上下中央(`align-items:center`)に復帰**。`.assign-people`(横並び)構造は維持。
- (Claude Code) **区分の円（`.category-badge`）を行ごとのGC色ベタ塗りに**（前コミット11eb9c8）。GC色は**上部の所属カラー(belong)参照に確定**: `--gc-touo: var(--belong-1)`(A社青) / `--gc-nikkei: var(--belong-2)`(B社シアン) / `--gc-zennihon: var(--belong-3)`(C社緑)。スウォッチUI(#bcList)変更に追従。※DBブランド色(group_companies.badge_color)/emp-badge色とは割当が異なる不整合あり（採用せず所属カラーに統一）。
- (Claude Code) SL モックバッジ内に**社員個人警告アイコンを導入**（前コミット705dab0）。線画注意三角 `im-11907` を SVG スプライト（`#ic-caution-line`、body直後 symbol）化し `.person-warn`（`--accent-orange`・13px・名前左）で表示。佐藤=「連勤12日」/ 高橋=「NG 伊藤」/ 伊藤=「NG 高橋」。CSS mask は file:// で読めず非表示になったため**インライン/スプライト方式**に。
- (Claude Code) `資格者不足` を warn-icon → `info-pill missing` バッジ化。**情報系 info-pill を配置セル最下部へ再配置**: `.assign-list` を column 化し社員バッジ群を `.assign-people`（flex 行ラップ＝横並び可）で包む2段構成、`.cell…:has(.assign-list)` で縦ストレッチ＋ `.alert-row{margin-top:auto;width:100%}` で最下部ピン留め。
- (Claude Code) **連絡確認機能を一旦無効化**: `.contact{display:none!important}`（コメント付き、1行削除で復帰可）。マークアップは残置。
- (Claude Code) フレア調整: 所属GC色フレアを2段階「透明＋小型化」、外側フェードを約30%手前へ引き込み（gradient stops 45/55/64/73）、横長・薄型化。`.flare-source` の白い芯 1%→5%。**車両flare中央ずれバグ修正**（`.vehicle-tag .flare-source` に `position:absolute` 明示、Playwright で中心0px確認）。
- (Codex) SL を「OB受注情報を配置担当者が翌日以降の実行可能な社員指示へ確定していく画面」として整理。`docs/01_要件定義.md` 3.2/5.1.3 と `docs/plan/design-refresh-plan.md` に SL 情報レイヤー方針（共通コア/配置判断/社員連絡/差分・権限/区分制約/中央グリッド・右プロパティ分担）を追記。`docs/preview/design-refresh-sl-layer-mockup.html` を新規作成（中央7列表＋縦型アイコンメニュー＋右プロパティ、左メニュー濃紺＋マテリアル表現、Inter/Noto Sans JP）。
- (Claude Code) 上記モックの配色をカラーコーディネート観点で調整。夜間/警告文字を赤寄せ・トーンダウン（`--accent-text-warn: #cf4626`）、`不足` バッジをオレンジ塗り＋白文字、中央表データ文字（時間/人数/現場名/社員名）をセミボールド `600`（`--table-data-weight`）に。
- (Claude Code) タイトルバーを紺→青→ティールのアナロガス2色グラデ＋ガラスエッジに（変数 `--title-navy`/`--title-blue-mid`/`--title-teal`）。左メニュー濃紺・ベース淡青を基準に画面全体を青〜ティール基調へ統一。
- (Claude Code) アクセントオレンジの彩度を抑え（`--accent-orange: #f15e2a`）、所属ドット調整（※下記で所属5色は再設計済み）。
- (Claude Code) 車両/ETCバッジ文字を `--table-data-weight`(600) に統一。配置社員の連絡アイコンを状態別画像に差し替え（連絡済み=`si-26526-telephone-call.png` / 未連絡=`im-00027-denwa-no-juwaki.svg` / 再連絡=`si-36957-tel-orikaeshi.png`）、`.contact` の色フィルタを廃止し黒表示に。
- (Claude Code) 所属カラーを寒色アナログ判別5色（`--belong-1`〜`5` = ブルー#3a72b4 / シアン#1f8fa0 / ティールグリーン#2f9579 / インディゴ#5562ad / バイオレット#7a5ba6）へ再設計。上部に各社A〜E×5色スウォッチの選択UI（`#bcList`）を新設。JS（末尾 `<script>`）で衝突時スワップ→常に5社5色・重複なしを維持し、社員/車両バッジへ即反映。暖色はオレンジアクセントと競合するため選択肢から除外。
- (Claude Code) タイトルバー「業務管理計画書」見出しの太さを 900→700（`.main-title`）に。
- (Codex) ユーザーの新しい参考画像を受け、所属GC表現をドットから「外側所属GC色フレア + 内側2pxの白リム付きソリッドバッジ + 下辺中央の白い点光源」へ変更。内側バッジが光を覆い、下辺からだけ所属GC色の光が漏れる構造。所属GC色フレアは、所属GC色自体は変えず、中心から3割程度までを明るい薄黄色、4割程度を明るく鮮やかな所属GC色、65%以降をグレーがかった所属色へ変化させる。白い光は下罫線全体の `box-shadow` ではなく、`flare-source` レイヤーで中央一点から放射し、最も明るい芯は1%程度に抑える。6割以降は薄い黄色へ変化。前回不採用だった全面ネオン/強いグローではなく、下側の細い発光エッジ + 外側の小さなぼかしに限定。社員バッジと車両/ETCバッジへ同じルールを適用。

## 次にやるべきこと

- ~~変更通知の情報照合 論点(1)〜(5)~~ → **2026-06-11 全決定済み**（計画書 §3.7.6）。スレッドUIも3層構造で決定済み（§3.7.7、3カラム案は不採用判例）。
- **`docs/plan/mockup-refactor-plan.md` に従って R-1（DS基盤統合）から着手**。通知センター改修（R-4）・DB追補（R-5）・各画面の通知カード/カテゴリ適用（R-3）はすべて本計画に統合済み — 個別先行実装は凍結。
- R-3a（SL）の前提: SL 配色テーマの確定（Color Themes 比較）と SL 右プロパティ4モードの情報粒度確認。
- R-2 着手前に Codex と `mock.oms.state.v1` 構造変更の期間調整（構造的変更の警告表へ追記すること）。
- SL モックの**レール通知カード**（ベル → スライドカード → 該当セル選択+フラッシュ）のユーザー目視フィードバックがあれば R-2 のコンポーネント化に反映。
- SL 右プロパティ4モードの情報粒度をユーザー確認する。特に **現場詳細に含める項目（住所/地図/作業内容/必要資格/備考）**、社員配置D&Dに出す候補の並び、車両/ETCを同一ドロップ領域にするか分割するか、変更履歴一覧の表示粒度（全履歴/差分だけ/備考との関係）は次の判断ポイント。
- SL モックの次の配色判断は、下部の `Color Themes` カード群と復活済みの `Belonging Company Colors` を見て進める。高彩度のサイバーライム/シアンは現時点では不採用寄りで、低彩度の `Slate Mono` / `Cool Graphite` / `Icy Indigo`、赤系の `Crimson Ledger` あたりを比較する。夜間文字と警告アイコン/バッジは先に分離済み（夜間 `#D14D41` / 警告 `#F15E2A`）。社員・車両/ETCバッジの所属GC表現はカプセル内側左端リブ方式を現行採用。下辺フレア + 白リム + 点光源方式は現行採用せず、`docs/preview/reference/sl-badge-flare-shadow-reference.css` を判例として参照する。
- `docs/00_開発手順書.md` のモック状態表とプロジェクトルート `CLAUDE.md` の表に「E 休日申請管理」表記が残存（今回スコープ外）。用語統一を広げる場合は別途。
- デザイン刷新は **案B改: Calm Operations / B案v2 デスクトップワークスペース方向で継続**。ツールバーはフラット維持、左メニュー、中央業務管理計画書パネル、中央右の縦型アイコンメニュー、右プロパティカードは同じマテリアル表現で統一済み。影は高さレイヤーとして扱い、縦型アイコンメニューが最上位。
- まだ議論すべき課題: 車両/ETCの中央表示優先度、固定行の見せ方、社員連絡の最終出力仕様（LINE等）、印刷帳票との情報差、右プロパティ内の情報密度。
- WS `schedule×modify`（busy 移動 / 候補リスト移動）は構文 OK だが Playwright 実 UI 未実証。
- Phase 2.5（モックアップ検証）への通知システム登録。
- mock-data-unification-plan は Phase 1+2 完了（残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題）。

## 触らないでほしいもの / 注意事項

- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと
- N-5 の別画面遷移は URL パラメータ `cnJump` に JSON を載せる。**同タブ遷移** で着地し `history.replaceState` で cnJump を除去する設計（2026-05-27 Claude Code 修正）。`window.open(_blank)` には戻さないこと
- 共通パネルは `affects[]` だけでは通知フォーカスしない。現在画面用 `target` が解決できる場合のみ即時フォーカスする
- 通知ベルは表示上4分類だが、画面側 SelfNotify は旧IDで呼んでよい。共通シード済みの初期通知はページ側 `setItems('sl'|'ws'...)` で上書きしない。実操作の `addItem(...)` は統合ベルへ追加される
- 発信元/主担当画面が現在画面と異なる通知は、現在画面でフォーカスできてもパネルを閉じない。アコーディオンを展開し、発信元画面で開くボタンを残す

## 構造的変更の警告

| 日付 | 担当 | 変更内容 | 影響範囲 |
|------|------|---------|---------|
| 〜2026-05-25 | Codex | ダミーデータを HTML ハードコード → `mock.oms.state.v1` 共通ストアへ移行 | 各画面のシード通知 / SelfNotify の target / 通知ジャンプ先 DOM |
| 2026-05-27 | Codex | 通知デモ seed を固定文字列 → 共通モックデータ参照へ変更 | `co-navbar.js` 初期ベル / OB・SL・WS seed / HTML script 読み込み順 |
| 2026-05-27 | Codex | 通知クリック判定を `affects[]` 依存 → `domain` / `primaryPage` / 画面別 `target` 解決へ変更 | `co-notify-panel.js` / 各画面 SelfNotify / admin-notify 優先度表 |
| 2026-05-27 | Codex | 通知ベル7種 → 4分類へ統合し、旧ベルIDをエイリアス化 | `co-navbar.js` / `co-notify-panel.js` / 各画面 `addItem/setItems` / 管理者アイコン選定 |
| 2026-05-27 | Codex | 通知ジャンプ演出を点滅 → 対象外セル/行の2秒フェードオーバーレイへ変更 | `co-notify-panel.js/css` / OB・SL・WS・LA の `cn:jump` 着地処理 |
| 2026-05-28 | Claude Code | OB行削除→復旧トグルを追加（localStorageフラグ単一真実源 + 汎用 `cn:action` ボタン機構 + `item.locked`/`item.actions` 表示 + デモ削除行 `OMS_DEMO_DELETED_ROW`） | `co-navbar.js`(`mdNavRefreshBells`) / `co-notify-panel.js`/`.css` / `order-book.js`(グリッド増減・cellData再マップ) / `mock-orders-data.js` |
| 2026-05-28 | Claude Code | WSクロスジャンプの seed を OBサイト名 → WS実サイト(`axis:'wsCell' / value:'s1'`) へ変更、items.sl の target.weekly-schedule を削除（OB/WSモックサイト名が共有されないため） | `co-navbar.js` `mdNavBuildBellItems` の items.sl / items.ws |
| 2026-05-29 | Claude Code | 通知ジャンプ着地演出をセル単位部分オーバーレイ → 全画面スポットライト (透明穴 + box-shadow 9999px) へ変更。`showFocusOverlay` 1関数差し替えで全画面共通化、`candidateSelector` 引数は無視に | `co-notify-panel.js` (showFocusOverlay/clearFocusOverlay) / `co-notify-panel.css` (.cn-focus-spotlight) / HTML 6本キャッシュバスター |
| 2026-05-29 | Claude Code | Phase 2: SL の社員配置を共通ソースから読み取り描画。`createSiteOrderMap` (siteId↔OB受注行) 新設、SL 描画ループで保存状態の無い行に初期充填。OB `buildMonthState` にデモ今日の対応6行への受注エントリ保証注入 (`ensureDemoTodayPlacementRows`) を追加 (クロス画面修正) | `mock-assignments-data.js` (createSiteOrderMap + デモ今日配置) / `mock-orders-data.js` (buildMonthState 注入) / `screen-layout.js` (初期充填) / HTML キャッシュバスター |
| 2026-05-29 | Claude Code | SL/WS/LA + 通知seed のダミーデータ (配置/応援/休み/車両配置) を `mock-assignments-data.js` に一本化。WS hardcode 28件配置 / 応援 partners 5社 / 予約 / 車両配置 / 整備を共通ソース由来に。LA の empIdx 配列外バグ修正 + デモ今日に isOnLeave 3名 approved 追加。通知seed の架空人名 "DCP-柊本" を実在社員に修正 | 新規 `docs/mockup/mock-assignments-data.js` / `weekly-schedule.js` (seed 2関数 + holidays hardcode 削除) / `screen-layout.js` (slSeedSupportDemoData) / `leave-application.js` (seedDemoLeaves + seedWsAssignments + 通知 seed) / HTML 6本に script タグ + キャッシュバスター |
| 2026-05-29 | Claude Code | N-6: WS schedule 発火を全配置パスに追加 (delete 8 + add 9 + modify 2 = 19箇所)。**LA通知 target を単一 `{axis:'leaveId'}` → 画面別マップ形式へ変更**（SL 用 `empName` 軸追加 + affects に screen-layout）。SL に empName 着地 `slCnFocusLeaveEmployee` 新設 | `weekly-schedule.js` (削除/追加/移動ハンドラ) / `leave-application.js` (`laCnSelfNotify` target) / `co-navbar.js` (la seed target) / `screen-layout.js` (cn:jump リスナー)。WS の leaveId 処理は画面別マップでも `weekly-schedule` キー維持で無影響 |
| 2026-06-01 | Codex | LA休暇申請 seed を LA 画面専用生成から `mock-assignments-data.js` 共通生成へ移し、`co-mock-store.js` 未初期化時も seed を返すよう変更。SL/WS/共通ナビ単体起動でも LA 通知 seed が成立 | `mock-assignments-data.js` (`createLeaveApplications`) / `co-mock-store.js` (`getLeaveApplications` fallback) / `leave-application.js` seed 利用 / `co-navbar.js` 現在日優先 LA seed / HTML キャッシュバスター |

## アクティブな計画書

- `docs/plan/mockup-refactor-plan.md` — **リファクタ統合計画（新DS適用 × 通知簡素化 × カテゴリ再定義の一括適用。R-0 完了 / 次は R-1）**
- `docs/plan/mock-data-unification-plan.md` — SL/WS/LA/通知seed ダミーデータ一本化（**Phase 1+2 完了 / 残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題**）
- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-6 静的検証 + 要対応実装 + SL↔LA seed フルフロー実証 完了（§17）/ 次は Phase 2.5 登録**）
- `docs/plan/design-refresh-plan.md` — デザイン刷新 診断・比較計画（**案B改: Calm Operations 採用方針 / 差分モック作成済み / 次は SL 適用範囲確定**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
