# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-11
- **コミット**: R-3f #3（既存負債トークン解消）（本コミット）。B群3コミットは `32e9d73`/`e7d6ef7`/`5e60474`

## 直前にやったこと（最新のみ）

- **R-3f #3 完了**（ユーザー承認 = 未定義参照のみ解消）: --focus-ring/--primary/--secondary は
  B群で解消済みと実測確認 → **ds-audit ALLOWLIST を空に**（新規追加禁止を明記）。
  実参照の書換 = 地図URL入力/プレビュー背景5箇所（--bg-primary→--panel / --bg-secondary→--bg）+
  OB .sort-modal 影（未定義=影なし→var(--elevation-5)）。
- SL/WS のローカル --shadow-strong（旧teal影 rgba(0,69,84,.15)・描画あり）は **#12 送り**（承認済み）。
- 検証: ds-audit NG=0 WARN=8 / OB・SL 実測・コンソール0。スクショ `screenshots/r3f3-*`。

## 次にやるべきこと

1. **D群 残り（各着手時にユーザー判断）**: #5 直書き WARN 8件（ws-ds/la-ds）+
   信頼度チップ active 2色（#f59e0b/#94a3b8）の正式パレット /
   #10 ダークテーマの廃止 or 正式対応（SL/WS の [data-theme=dark] + --cat-*-support dark 値も対象）/
   #11 LA 土日祝文字色の確認。
2. **E群**: #6 menu-user チップを共有 co-navbar へ（LA ロール切替移設も同時）/ #7 ヘルプ icon-btn 全画面。
3. **#12 余白・密度・直書き hex 横断棚卸し**（SL/WS ローカル --shadow-strong の DS 化を含む）→ R-4 へ。

## 今だけの申し送り（任意）

- 共用 CSS の残りは co-modal / co-navbar / co-notify-panel / co-company-input の4本
  （co-buttons/co-forms/co-shared-badges は DS 正本 §H/§I/§J へ移設済み・旧クラスの新規使用禁止）。
- `buildComposedIconHtml`（co-notify-panel.js）は呼び出し元ゼロの死にJS（JS整理は別途判断）。
- `shield.svg` 404 は既知の別件（QA/admin-notify ヘッダ・アイコン選定待ち）。
