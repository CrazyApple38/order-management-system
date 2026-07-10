# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-10
- **コミット**: R-3e QA 新DS適用 + 旧 .cn-panel → 共通 cn-card 移行（本コミット）

## 直前にやったこと（最新のみ）

- **R-3e 完了（QA・runtime検証済）**: CSS 読替（ds-tokens → ds-legacy-aliases → ds-components + 新設 qa-ds.css）。
  モバイル例外のため骨格転換なし・カード型フローへ DS レシピ適用。旧パレット直書き（teal/pink/桃色曜日面）を DS トークン化。
- **QA 通知を統合ベル + 共通 cn-card へ移行**（ユーザー判断）: 旧 .cn-panel マークアップ + co-notify-panel.js QA互換セクション撤去、
  `qaCell` 軸新設、アンカー1個をホーム⇄カレンダーへ JS 移設、revert/reapprove は cn:action 化（スナップショット復元維持）。
- **共通挙動の追加**: アクションボタン付きアイテムはジャンプ後もパネル/展開を維持（co-notify-panel.js v40・全画面共通）。
- 検証: ds-audit NG=0（qa-ds WARN 0）/ QA 全フロー + OB/SL/WS/LA/admin-notify 回帰なし / コンソール0 / `screenshots/r3e-qa-*.png`。

## 次にやるべきこと

1. **R-3f 横断クリーンアップ**: 計画書 §4 R-3f 表の12項目が SSOT。値・見た目の変更は全てユーザー承認必須。
   R-3e 完了により前提解消済み: **#4 旧 .cn-panel CSS（co-notify-panel.css）は利用者ゼロ = 撤去可** / **#9 cn-card 内蔵 `--cn-*` ブロックの ds 参照化も着手可**（全画面が ds-tokens 読込済み）。
2. 監査 ALLOWLIST（ds-audit.js 内）と #3 既存負債（--focus-ring 等）の解消を同期させること。

## 今だけの申し送り（任意）

- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。R-3e では触っていない。
- QA のベルアンカーは DOM 1個を画面間で移設する方式（SHARED-MEMORY 注意事項参照）。複製すると共通 first-match 前提が壊れる。
