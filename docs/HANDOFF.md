# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-10
- **コミット**: R-3f #1 B-1（.btn 統一・co-buttons 廃止）（本コミット）。#2 は `f20a205` / #4+#9 は `214732f`

## 直前にやったこと（最新のみ）

- **R-3f #4+#9 完了**（`214732f`）: 死にCSS一括撤去（-1,580行・使用者ゼロを機械確認＝見た目不変）+
  cn-card 内蔵 --cn-* 11個を var(--ds名, 現値) 参照化。4個（--radius-sm/md・--elevation-1/5）は
  co-tokens 同名別値のため admin-notify 誤解決の制約でリテラル維持（SHARED-MEMORY 注意事項に記録）。
- **R-3f #2 完了**（`f20a205`）: WS/LA の panel-rail active を正（青リング）へ統一。02 §6 の逸脱注記解消。
- **R-3f #1 B-1 完了**: co-buttons.css を全ページから撤去・削除（.btn 同名衝突解消→全ボタン DS A-01 化）。
  独自4バリアント+density 連動は ds-components §H「A-01 拡張」へ受け皿化（ユーザー承認済み・B群3分割も承認済み）。
- 検証: 各コミット時に ds-audit NG=0 / computed style 実測 / コンソール0。スクショ `screenshots/r3f1-* r3f2-* r3f4-*`。

## 次にやるべきこと

1. **B-2 = #8 SL 残置9モーダルの DS 化 + ds-tokens-bridge.css 撤去**（R-3a 級の規模。着手時に分割提案を推奨）。
2. **B-3 = co-forms（md-fi-* = OB/SL）・co-shared-badges（md-ob-* = OB/SL）の依存解消→撤去**。
3. その後 D群（#3/#5/#10/#11 = 各着手時にユーザー判断）→ E群（#6 menu-user / #7 ヘルプ icon-btn）→ #12 棚卸し。
2. 監査 ALLOWLIST（ds-audit.js 内）と #3 既存負債（--focus-ring 等）の解消を同期させること。

## 今だけの申し送り（任意）

- `buildComposedIconHtml`（co-notify-panel.js）は呼び出し元ゼロの死にJS。今回は CSS のみ撤去し JS 非改変。JS 整理は別途判断。
- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。
