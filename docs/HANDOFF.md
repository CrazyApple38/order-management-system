# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-10
- **コミット**: R-3f #4+#9（死にCSS撤去 + cn-card トークン ds 参照化）（本コミット）

## 直前にやったこと（最新のみ）

- **R-3f #4 完了**: 使用者ゼロを機械確認したセレクタのみ撤去（見た目不変）。旧 .cn-panel 系一式 / 旧 .cn-icon・.cn-composed /
  旧 .md-cn-* 通知モーダル一族（SL 431行）/ 旧 md-cn バッジ群 + .bt-* 全部 / .md-cn-body-overlay / OB・WS の死に glow/flash。
- **R-3f #9 完了**: cn-card 内蔵 --cn-* 11個を var(--ds名, 現値) 参照化。4個（--radius-sm/md・--elevation-1/5）は
  co-tokens 同名別値のため admin-notify 誤解決の制約でリテラル維持（SHARED-MEMORY 注意事項に記録）。
- 検証: ds-audit NG=0 WARN=9（悪化なし）/ OB/SL/WS/LA/QA/admin-notify の cn-card computed style 一致 /
  QA toast・glow 存置動作 / notify-compare 埋込自己完結 / コンソール0。スクショ `screenshots/r3f4-*-cn-card.png`。

## 次にやるべきこと

1. **R-3f 残項目**（計画書 §4 表が SSOT）: 承認済み着手順 = 次は **#2 panel-rail active 青リング統一**（正=ds-components・02 §6）、
   その後 #1 .btn 新旧統一 / #8 SL bridge 撤去（構造統一系）。#3/#5/#10/#11 は各着手時にユーザー判断を確認。
2. 監査 ALLOWLIST（ds-audit.js 内）と #3 既存負債（--focus-ring 等）の解消を同期させること。

## 今だけの申し送り（任意）

- `buildComposedIconHtml`（co-notify-panel.js）は呼び出し元ゼロの死にJS。今回は CSS のみ撤去し JS 非改変。JS 整理は別途判断。
- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。
