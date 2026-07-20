# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Opus 4.8）
- **日付**: 2026-07-20
- **コミット**: `claude/sl-design-uplift` ブランチ（直前 HEAD `34cb4ce`）

## 直前にやったこと（3回目イテレーション 2026-07-19〜20）
- **LEDドットは差し戻し済み（2026-07-20 ユーザー判断: イメージ不一致）**。所属識別は「アイコン統一」に決定 —
  社員=`#ic-person` / 車両=`#ic-car`(transport/im-00237) / ETC=`#ic-card`(business/im-10551)、色は `--belong-color`。
  `--belong-N-led` トークンと `.sl-led` レシピは DS 正本から削除。夜勤明けフラグは
  `#ic-moon`（other/im-15067-yoru.svg の三日月パスのみ・viewBox 15 24 490 488）。
  **アイコンは必ず `docs/assets/icons/` の素材から選ぶこと（自作パス禁止）。**
- 備考列: seg が列ラベルを置換、区分・作業内容バッジを横並び化、履歴表示中の備考列クリックで
  プロパティに当該行の変更履歴をフォーカス表示。
- **列別プロパティ（今回）**: 「全表示」を廃止し、クリックした列の節だけを表示。
  現場列=siteinfo / 人数列=count（インライン編集廃止→プロパティへ統一）/ 集合列=meetingModal /
  時間列=workTimeModal / 備考列=notes（作業内容・担当者・地図・業務詳細・備考・集合場所・その他項目の catch-all）。
  `slOpenColumnProp()` / `slApplyPropSecFilter()` / sl-ds.css の `data-sec-filter` 5種で実装。
  siteModal の備考テキスト（#smRemarks）が未保存だった不具合を修正（`notesCell.dataset.remarks` + `ntRenderNotesCell` へ集約）。
  旧スナップショット救済は `slUpgradeColumnPropHandlers()`。
- **整合性4点（ユーザー選択 2026-07-20）**: ①ドック内モーダルヘッダー廃止 → `.sl-prop-head` に ✕ を移設
  （`slClosePropHead` / `slUpdatePropHeadClose`）②夜勤明けフラグ ☾ → `#ic-moon` SVG（フォント差で C に化けるため）
  ③siteModal の死にUI「連絡チップ」削除（集合列＝meetingModal に一本化。#smMeetingTime は往復用に非表示保持）
  ④配置列・車両ETC列クリック → 供給源パネル（社員配置／車両・ETC）を開く `slOpenSupplyProp`（バッジ自身のクリックは従来どおり）。
- **列クリック=プロパティのトグル（2026-07-20 ユーザー決定・全列対象）**: onclick を `slColumnProp(event, this, kind)`
  に一本化。同じ行・同じ列の再クリックで閉じる（列ごと収納 `--prop-w: 0px`、中央表が広がる）。✕ も同じ経路。
  下位エディタ（notesModal/mapModal）の「戻る」は `slPropSuppressReturn` で抑止。
- **プロパティ高さ**: `.sl-prop-card` を `height:auto` + `max-height:100%`、`.sl-prop-panel` を `flex:0 1 auto` に変更。
  内容が短ければカードも短く（余りは背景）、長ければパネルが内部スクロール。あわせて `.workspace > .main` に
  `min-height:0` を入れ、grid の既定 `min-height:auto` が行を 12px 押し広げ viewport を超えていた問題を解消。
- **バグ修正4件（2026-07-20 ユーザー報告）**:
  ① フラッシュのスポットライトが右プロパティ列まで広がる → `co-notify-panel.js` に
     `clipRectToScrollAncestors()` を追加し、外接矩形をスクロール祖先で切り詰め（全画面共通の改善）。
  ② フラッシュ/履歴クリックした行の選択背景が他行クリックで消えない → `selectRow()` は
     `.clickable-cell` を無視するため、`slColumnProp()` 側で行選択を一元的に移すよう変更。
  ③ 社員配置/車両ETCプロパティがスクロールできない → `.sl-prop-source-panel` が
     `flex:1 1 auto` + `.side-panel` の `overflow:hidden` で内容が切れていた。`flex:0 0 auto` +
     `overflow:visible` にしてスクロールを `.sl-prop-panel` に委ねる（社員 994px / 車両 1702px スクロール可）。
  ④ 車両・ETCプロパティ内のバッジが角丸矩形 → 配置済みタグと同じ DS カプセル（pill+グラデ+3層影）に統一。
     配置済みは緑背景ではなく `opacity: .55`（社員チップと同じ扱い）。
- 検証: node --check OK / ds-audit NG=0 WARN=7 / build-rules OK / Chrome で各列プロパティ・保存往復・履歴切替・月アイコン描画・
  トグル開閉・スクロール量（1414→ch339 で 1074px スクロール可）・短い内容時の余白 159.5px を確認。

## 次にやるべきこと
0. **`master` を取り込まないこと**（2026-07-20 ユーザー決定）。#29 `c4a229a`（Codex 版の社員バッジDSカプセル化）と
   本ブランチが同じ機能を別方式で実装しており3ファイルが衝突する。詳細と統合判断は SHARED-MEMORY「未決の横断判断 ③」。
   PR も未作成（ブランチ `origin/claude/sl-design-uplift` に push 済みで保全）。
1. **ユーザーの視覚承認待ち**（SL試作の3イテレーション分）。
2. 承認後: 計画書 `docs/plan/` に横展開計画を新規作成し OB/WS/LA/QA/F/G へ展開（会社選択のseg-multi統一・D&D拡充含む）。
3. ds-audit WARN7（ミニフラグ等の直書き色）をユーザー承認のうえトークン化。

## 今だけの申し送り
- **検証時にDOMへインラインstyleを注入しないこと**。2026-07-20 に拡大確認用の `transform: scale(4)` が
  localStorage スナップショット（`mock.sl.state.v1` / `mock.oms.state.v1`）へ行HTMLごと焼き付き、
  バッジサイズ逸脱としてユーザーに露見した（両キーから除去済み）。確認は計測値かCSSクラスで行う。
- このノートPCには pre-commit hook / pr-flow / web-stack Docker が未整備。検証は `python -m http.server 8765` + chrome-devtools MCP で実施。
- 参照プレビュー3本（design-refresh-*, ds-foundation-test）は改変していない。
- `startCountEdit` / `openWorkModal` は列別プロパティ化により未参照（削除は横展開時に判断）。
