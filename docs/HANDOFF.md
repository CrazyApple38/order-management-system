# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-10
- **コミット**: 作業コミット前（親=`dab8751`）。**R-3d（LA）は実装・runtime検証まで完了**。次は R-3e QA。

## 直前にやったこと（最新のみ）

- **R-3d LA 新DS適用**: `co-tokens.css`を撤去し、`ds-tokens.css` / `ds-components.css` / 新設`la-ds.css`へ読替。`toolbar / workspace(rail｜main-card｜prop｜panel-rail)`骨格へ移行。
- 左レールへ休暇/車両の作業面切替と統合通知ベルを集約。右プロパティはミニカレンダー常設+詳細/リスト/要対応の3モード。
- 申請詳細ポップオーバーと車両マスタ編集モーダルを右プロパティドックへ転換。作業面切替で古い詳細を閉じ、休暇通知の`cn:jump`は休暇面へ切替後に着地するよう修正。
- Apache（`http://localhost`）を起動し、初期表示・詳細ドック・車両ドック・要対応・車両面からの休暇通知着地を確認。コンソールエラー0。スクリーンショットは`/screenshots/r3d-la-*.png`。

## 次にやるべきこと

- **R-3e QA（quick-access.html）新DS適用**: 着手前に `docs/plan/mockup-refactor-plan.md` と `docs/design-system/03_screen-application.md` の QA 節を確認。
- QAはモバイル例外のため、レール/右プロパティを導入せず、既存カード型入力フローをDSコンポーネントへ置換する。
- R-3全体完了後に、直書きhex・色の細かいズレ・画面間余白/密度の横断レビューを実施する。

## 今だけの申し送り（任意）

- Apacheは本セッションで起動済み。`shield.svg` 404は既知の別件で未対応。
