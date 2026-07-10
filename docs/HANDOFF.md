# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-11
- **コミット**: R-3f B-3（co-shared-badges 廃止）（本コミット）。B-2b-2 は `e7d6ef7` / B-2b-1 は `32e9d73`

## 直前にやったこと（最新のみ）

- **R-3f #8/#1 B群 全完了**: B-2b-1=SL bridge 撤去+区分色青一色（`32e9d73`）→
  B-2b-2=md-fi-*→DS A-05 置換・co-forms 削除・§I 受け皿（`e7d6ef7`）→
  B-3=md-ob バッジ編集一式を §J 受け皿化・co-shared-badges 削除（本コミット）。
- 色読替はユーザー承認済み: 旧teal淡色→--blue-soft/--info-*・undo琥珀→DS alert・
  var(--primary)→var(--ink)。**信頼度 active の琥珀#f59e0b/灰青#94a3b8 はリテラル維持=#5 案件**。
- 検証: 各コミットで ds-audit NG=0 WARN=8 / OB・SL 実測 / 全画面回帰なし・コンソール0。
  スクショ `screenshots/r3f8-*`。

## 次にやるべきこと

1. **D群（各着手時にユーザー判断）**: #3 既存負債トークン（--focus-ring 全画面 a11y ほか。
   ds-audit ALLOWLIST と同期して解消）/ #5 直書き WARN 8件+信頼度チップ2色の正式パレット /
   #10 ダークテーマの廃止 or 正式対応（SL/WS の [data-theme=dark] 残存）/ #11 LA 土日祝文字色の確認。
2. **E群**: #6 menu-user チップを共有 co-navbar へ（LA ロール切替移設も同時）/ #7 ヘルプ icon-btn 全画面。
3. **#12 余白・密度・直書き hex 横断棚卸し** → R-4 センター改修へ。

## 今だけの申し送り（任意）

- 共用 CSS の残りは co-modal / co-navbar / co-notify-panel / co-company-input の4本
  （co-buttons/co-forms/co-shared-badges は DS 正本 §H/§I/§J へ移設済み・旧クラスの新規使用禁止）。
- `buildComposedIconHtml`（co-notify-panel.js）は呼び出し元ゼロの死にJS（JS整理は別途判断）。
- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。
