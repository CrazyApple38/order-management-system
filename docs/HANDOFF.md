# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5) → **次セッションは Codex 引き継ぎ想定**
- **日付**: 2026-07-11
- **コミット**: R-3f #3 = `82de662` / B群3コミット = `32e9d73`・`e7d6ef7`・`5e60474`

## 直前にやったこと（最新のみ）

- **R-3f #1〜#4/#8/#9 完了**（A/B/C群 + #3）。co-buttons/co-forms/co-shared-badges/ds-tokens-bridge
  の4ファイル廃止（受け皿 = ds-components §H/§I/§J）。共用 CSS 残り = co-modal/co-navbar/co-notify-panel/co-company-input。
- **#3**: 未定義トークン参照を全解消（地図URL入力/プレビュー5箇所 →--panel/--bg、OB .sort-modal 影
  →var(--elevation-5)）。**ds-audit ALLOWLIST は空**（以後、未定義参照 = 即 NG）。
- SL/WS ローカル --shadow-strong（旧teal影・描画あり）は **#12 送り**（ユーザー承認済み）。

## 次にやるべきこと（Codex への引き継ぎ）

1. **着手前に `docs/plan/mockup-refactor-plan.md` の R-3f 節（§ R-3f 表 + 進捗行）を全読**（SSOT）。
2. **D群 残り = #5/#10/#11。各項目とも着手時にユーザーへ方針確認が必須**（勝手に着手しない）:
   #5 直書き WARN 8件（ws-ds/la-ds）+ 信頼度チップ active 2色（#f59e0b/#94a3b8）の正式パレット判断 /
   #10 ダークテーマ廃止 or 正式対応（SL/WS [data-theme=dark] + --cat-*-support の dark 値も対象）/
   #11 LA 月間ビュー土日祝文字色が DS 03 §3.2（青灰濃淡）と整合するか確認。
3. その後 **E群 #6/#7 → #12 横断棚卸し**（#12 に SL/WS ローカル --shadow-strong の DS 化を含める）→ R-4。

## 今だけの申し送り（任意）

- 完了条件: `node scripts/design-audit/ds-audit.js` で **NG=0**（現状 WARN=8 = #5 案件）+ runtime 実測 + コンソール0。
- 旧クラス（.md-fi-* / md-ob バッジ系 / co-buttons 系）の新規使用禁止。フォームは DS A-05 体系。
- CSS/JS 編集時は HTML 側 `?v=N` の cache-buster を必ず bump。
- `buildComposedIconHtml`（co-notify-panel.js）= 呼び出し元ゼロの死にJS / `shield.svg` 404 = 既知別件（アイコン選定待ち）。
