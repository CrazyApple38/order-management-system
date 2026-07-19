# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code（Opus 4.8）
- **日付**: 2026-07-20
- **コミット**: `claude/sl-design-uplift` ブランチ（直前 HEAD `34cb4ce`）

## 直前にやったこと（3回目イテレーション 2026-07-19〜20）
- LEDドット: 社員/車両/ETC バッジの人物アイコンを廃止し `.sl-led`（白熱コア→所属発光色→減衰グロー3層）へ統一。
  `--belong-N-led` / `--belong-N-led-deep` を ds-tokens に新設（ユーザー承認済み）。
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
- 検証: node --check OK / ds-audit NG=0 WARN=7 / build-rules OK / Chrome で各列プロパティ・保存往復・履歴切替・月アイコン描画を確認。

## 次にやるべきこと
1. **ユーザーの視覚承認待ち**（SL試作の3イテレーション分）。
2. 承認後: 計画書 `docs/plan/` に横展開計画を新規作成し OB/WS/LA/QA/F/G へ展開（会社選択のseg-multi統一・D&D拡充含む）。
3. ds-audit WARN7（ミニフラグ等の直書き色）をユーザー承認のうえトークン化。

## 今だけの申し送り
- このノートPCには pre-commit hook / pr-flow / web-stack Docker が未整備。検証は `python -m http.server 8765` + chrome-devtools MCP で実施。
- 参照プレビュー3本（design-refresh-*, ds-foundation-test）は改変していない。
- `startCountEdit` / `openWorkModal` は列別プロパティ化により未参照（削除は横展開時に判断）。
