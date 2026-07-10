# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-11
- **コミット**: R-3f #8 B-2b-1（SL bridge 撤去・区分色青一色）（本コミット）。B-2a は `c7100b6` / B-1 は `53a3190`

## 直前にやったこと（最新のみ）

- **R-3f #8 B-2b-1 完了**: SL 区分色を DS 青一色へ（`--cat-*` 8個+`--cat-bg/text-support` 新設を
  screen-layout.css :root に `--blue-soft`/`--blue` で定義。応援系含め全区分＝ユーザー承認。dark は従来描画維持=#10）。
  `--space-2xl` を aliases へ移管し、**SL の読込を bridge→`ds-legacy-aliases.css?v=2` へ差替・bridge 削除**。
  残置9モーダル（8ドック収容+sortModal）は旧トークン名のまま DS 値描画へ。
- 検証: ds-audit NG=0 WARN=8 / SL バッジ全種 #eaf3ff/#1f5fae・dock 内 muted/ink・sortModal DS 値・
  死にシム未定義化 / OB/WS/LA/QA aliases v2 回帰なし・コンソール0。スクショ `screenshots/r3f8-sl-b2b1-*.png`。

## 次にやるべきこと

1. **B-2b-2/B-3 = SL/OB のモーダル・フォーム内部の DS レシピ置換**: co-forms（md-fi-* 生存6クラス:
   field/input/label/row/input-number/textarea。combo系等13クラスは使用ゼロ）と
   co-shared-badges（md-ob-* バッジ編集 D&D 一式 = OB 設定系）の依存解消→撤去。
   **md-ob D&D 群の受け皿判断（ds-components 追補 or ob-ds へ画面固有化）が必要**（B-1 §H の前例あり）。
2. その後 D群（#3/#5/#10/#11 = 各着手時にユーザー判断。#10 dark: SL/WS の [data-theme=dark] 残存）
   → E群（#6 menu-user / #7 ヘルプ icon-btn）→ #12 棚卸し。
3. 監査 ALLOWLIST（ds-audit.js 内）と #3 既存負債（--focus-ring 等）の解消を同期させること。

## 今だけの申し送り（任意）

- SL でも旧トークン名は DS 値で解決される（旧 co-tokens 実値シムは消滅）。旧値前提の CSS 追加禁止。
- `buildComposedIconHtml`（co-notify-panel.js）は呼び出し元ゼロの死にJS（CSS撤去済み・JS整理は別途判断）。
- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。
