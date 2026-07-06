# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-06
- **コミット**: 3a26caa（直前 HEAD・本セッション分は本コミットに含む）

## 直前にやったこと（最新のみ）

- **R-3a を 2チェックポイントに分割承認**（調査で規模判明: 骨格再構成＋列クラス40箇所再配線＋minimap撤去）。**R-3a-1a 完了・runtime検証済**。
- **R-3a-1a**: SL（`docs/screen-layout.html`）を新骨格へ再構成（`app > toolbar / workspace(rail｜main-card｜prop｜panel-rail)`）。CSS読替: `co-tokens.css`撤去 → `ds-tokens.css`＋新設`ds-tokens-bridge.css`＋`ds-components.css`＋新設`sl-ds.css`。minimap撤去→総数はツールバー`stat-strip`（配置10/24・不足6）へ（`renderMinimap`を retarget）。**中央表は現10列のまま維持しCSSでDS化**。右サイドD&D供給源は`.prop`列へ暫定収容。menubar=既存`co-navbar`活用。**9モーダル残置・回帰ゼロ**（siteModal起動flex/行選択青枠/D&D供給源/コンソール0を Playwright 1440px 確認・`screenshots/r3a1a-sl-full.png`）。
- **CSS機構（重要）**: `ds-tokens-bridge.css`＝co専用トークン（ds未提供の fs/fw/space/lh/icon-size/font-family/cat/day/semantic 等）を元値でshim（残置モーダル回帰ゼロ。同名トークンは ds 新値へ自動読替）。`sl-ds.css`＝SL固有オーバーライド（`.grid-table`のDS化・workspace responsive・prop収容）。screen-layout.css/co-*.cssは無改造。
- **menu-userチップは延期**: `.menu-user`/`.presence-dot` CSSが ds-components 専用のため、共有co-navbarへ今追加すると他4画面で無スタイル化。共有co-navbar.cssへCSSを置く専用手順が必要。

## 次にやるべきこと

- **R-3a-1b 着手（中央表7列化）**: `screen-layout.js` の `cnCreateRow` を10列→7列（区分/契約先・現場名/集合/時間/人数/配置/車両・ETC＋変更履歴・備考）へ。**地図=現場名セルの info-pill**（openMapModal維持）、**No.列撤去**、**作業内容→区分バッジへ内包**。下流の col-no(9)/col-map(6)/col-badge(8)/col-notes(6) 参照を再配線。変更履歴タブは R-3a-3 で実データ配線（1bは備考=実データ／変更履歴=プレースホルダ）。セル内容は ds-components クラス（category-badge/person/vehicle-tag/info-pill等）へ寄せる。回帰: ソート/選択/D&D/cnJump/元に戻す/seed 維持。→ Playwright 検証・コミット。

## 今だけの申し送り（任意）

- R-3a-1a のコミット後、他4画面は未移行（co-tokens）。`ds-tokens-bridge.css`/`sl-ds.css`はSL専用（読込はSLのみ）。他画面へ拡張時に流用検討。
- 中央表は1aで10列のまま横スクロール（地図/車両/備考は右へ）。1bで7列化すれば main 幅に収まる想定。
- 比較ツール `design-refresh-theme-palettes.html` は色変動再開用に保持（不要なら撤去可）。
