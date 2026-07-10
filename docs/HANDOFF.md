# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-11
- **コミット**: R-3f #8 B-2a（bridge 棚卸し）（本コミット）。B-1 は `53a3190` / #2 は `f20a205` / #4+#9 は `214732f`

## 直前にやったこと（最新のみ）

- **R-3f #4+#9 完了**（`214732f`）: 死にCSS一括撤去（-1,580行・使用者ゼロを機械確認＝見た目不変）+
  cn-card 内蔵 --cn-* 11個を var(--ds名, 現値) 参照化。4個（--radius-sm/md・--elevation-1/5）は
  co-tokens 同名別値のため admin-notify 誤解決の制約でリテラル維持（SHARED-MEMORY 注意事項に記録）。
- **R-3f #2 完了**（`f20a205`）: WS/LA の panel-rail active を正（青リング）へ統一。02 §6 の逸脱注記解消。
- **R-3f #1 B-1 完了**: co-buttons.css を全ページから撤去・削除（.btn 同名衝突解消→全ボタン DS A-01 化）。
  独自4バリアント+density 連動は ds-components §H「A-01 拡張」へ受け皿化（ユーザー承認済み・B群3分割も承認済み）。
- **R-3f #8 B-2a 完了**: bridge トークン棚卸し。参照ゼロの死にシム36個を削除（171→122行）。
  生存 = 区分色8個（B-2b で DS 区分色の承認が必要）+ --space-2xl（印刷CSS）+ aliases 同名群。詳細は bridge ヘッダ。
- 検証: 各コミット時に ds-audit NG=0 / computed style 実測 / コンソール0。スクショ `screenshots/r3f1-* r3f2-* r3f4-*`。

## 次にやるべきこと

1. **B-2b = SL 残置9モーダル内部の DS 化 + bridge→ds-legacy-aliases 差替→撤去**（B-3 の md-fi-*/md-ob-* と統合実施が
   合理的と判明済み。着手時に分割提案を推奨。**区分色（--cat-bg/text-*）の DS 化はユーザー承認案件**）。
2. **B-3 = co-forms（md-fi-* = OB/SL）・co-shared-badges（md-ob-* = OB/SL）の依存解消→撤去**（B-2b と統合）。
3. その後 D群（#3/#5/#10/#11 = 各着手時にユーザー判断）→ E群（#6 menu-user / #7 ヘルプ icon-btn）→ #12 棚卸し。
4. 監査 ALLOWLIST（ds-audit.js 内）と #3 既存負債（--focus-ring 等）の解消を同期させること。

## 今だけの申し送り（任意）

- `buildComposedIconHtml`（co-notify-panel.js）は呼び出し元ゼロの死にJS。今回は CSS のみ撤去し JS 非改変。JS 整理は別途判断。
- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。
