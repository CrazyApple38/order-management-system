# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-10
- **コミット**: `2a12d30`（push 済み）— 横断デザインレビュー+旧トークン欠落補修+R-3f 新設。

## 直前にやったこと（最新のみ）

- **横断レビュー**: R-1〜R-3d 実装を DS 正本と全照合。R-3d 型トークン欠落が OB（実害）/WS/LA にも存在 → **`ds-legacy-aliases.css` 新設**（旧トークン→DS値の正準表・03 §3.3）で補修、runtime 再検証済（`screenshots/r3f0-*.png`）。
- **監査恒久化**: `scripts/design-audit/ds-audit.js`（未定義var/co・ds併載/直書き値）。**R-3 系の完了条件 = NG:0**（04 §5）。現在 NG=0 / WARN9 は R-3f #5 で棚卸し予定。
- **R-3f 横断クリーンアップ（12項目）を計画書 §4 に正式フェーズ化**（.btn新旧統一 / panel-rail active=青リングが正 / focus-ring等既存負債 / 死にCSS / menu-user / ヘルプicon-btn / SL bridge撤去 / ダークテーマ扱い 等）。

## 次にやるべきこと（順序はユーザー確認済み: R-3e → R-3f）

1. **R-3e QA（quick-access.html）新DS適用**: 着手前に `mockup-refactor-plan.md` と 03 の QA 節を全読。
   モバイル例外（レール/右プロパティ無し・通知はトースト維持）。カード型入力フローを ds コンポーネントへ置換のみ。
   co-tokens 撤去時は **ds-tokens → ds-legacy-aliases → ds-components の順で読込**（03 §3.3。エイリアス再導出禁止）。
   QA 自前の旧 `.cn-panel` マークアップと co-notify-panel.js「QAモバイル互換セクション」の扱いに注意（SHARED-MEMORY 参照）。
   完了条件: `node scripts/design-audit/ds-audit.js` **NG=0** + computed style 実測 + コンソール0（04 §5。再検証時は URL に `?cachebust=N`）。
2. **R-3f 横断クリーンアップ**: 計画書 §4 R-3f 表の12項目が SSOT。値・見た目の変更は全てユーザー承認必須。
   #4 QA分・#9 cn-card内蔵ブロックは R-3e 完了が前提（それ以外は独立）。監査 ALLOWLIST（ds-audit.js 内）と #3 既存負債の解消を同期させること。

## 今だけの申し送り（任意）

- Apache 起動済み。`shield.svg` 404 は既知の別件（QA ヘッダで発生・アイコン選定待ち。R-3e 中に触らない）。
