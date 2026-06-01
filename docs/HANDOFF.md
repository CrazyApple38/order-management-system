# 引き継ぎノート

両 AI（Claude Code / Codex）が共有する作業引き継ぎ用ノート。コミット前に必ず更新する。
詳細運用は `AGENTS.md` / `CLAUDE.md` の「AI 間引き継ぎ運用」セクション参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-06-01
- **コミット**: 9228ba8（直前 HEAD。本「デザイン刷新プレビュー」作業は**未コミット**）

## 直前にやったこと

- `SL画面で OmsMockStore.getLeaveApplications()` が空になり LA通知 seed が 0件になる原因を調査・修正。LA seed を `mock-assignments-data.js` の共通生成へ移し、未初期化ストアでも `co-mock-store.js` が同 seed を返すようにした。
- `co-navbar.js` の LA seed 表示で、承認済み通知は現在表示日を優先するよう修正。空ストア直後の SL で `getLeaveApplications()` 17件、申請・承認ベル表示、LA通知カードクリック → SL休み社員スポットライト表示、console error 0 を確認。
- デザイン不評の原因調査として、業務管理計画書・受注簿・週間予定表の監査スクショを `screenshots/design-audit-*.png` に保存し、簡易メトリクス（罫線/小文字/色面）を取得。
- `docs/plan/design-refresh-plan.md` を新規作成し、現行診断・不評要因・段階実装フェーズを整理。ユーザー判断で案Bを採用しつつ、SL中央一覧性維持・右プロパティ編集・右パネルアイコン切替・二層検索を含む **案B改: Calm Operations** へ更新。
- `docs/preview/design-refresh-compare.html` に A/B/C の3案比較に加え、案B改の Before/After 差分（黒オーバーレイ中央モーダル → 右プロパティ編集、中央配置検索 + 右候補検索）を追加。ユーザー指摘を受け、B案寄りのカード型ワークスペース・青系グラデーション・柔らかい影へ再調整。Material / Neumorphism / Glassmorphism / Dense Ops の着せ替え構想カードも追加。
- さらに Photoshop 型の上部横メニュー/ツールバー + 下部縦アイコンレール + 右プロパティ編集の B案v2 モックを追加。SL中央メインは列を省略しない高密度表示サンプルにし、`docs/assets/icons/` 配下 SVG をアイコンとして使用。
- 同じ B案v2 骨格を OB / Quick Access / WS / 経理 / LA へ展開した画面例を追加。各画面とも上部横ツールバー、左縦アイコンレール、中央メイン、右プロパティの構成で比較可能にした。

## 次にやるべきこと

- **現在の未コミット差分**は `docs/plan/design-refresh-plan.md` / `docs/preview/design-refresh-compare.html` / `docs/HANDOFF.md`。監査/比較スクショ `screenshots/design-audit-*.png`、`screenshots/design-refresh-compare.png`、`screenshots/design-refresh-calm-ops-diff.png`、`screenshots/design-refresh-photoshop-workspace.png`、`screenshots/design-refresh-screen-examples.png` は保存済みだが `screenshots/` 配下のため通常 `git status` では ignored（必要なら force add）。
- `docs/00_開発手順書.md` のモック状態表とプロジェクトルート `CLAUDE.md` の表に「E 休日申請管理」表記が残存（今回スコープ外）。用語統一を広げる場合は別途。
- デザイン刷新は **案B改: Calm Operations / B案v2 デスクトップワークスペース方向で継続**。次は SL 実画面へ適用する前に、右パネル切替の対象範囲（社員/車両/応援/予約/編集）と、中央配置検索の検索対象（社員・車両・現場・応援）を確定する。
- WS `schedule×modify`（busy 移動 / 候補リスト移動）は構文 OK だが Playwright 実 UI 未実証。
- Phase 2.5（モックアップ検証）への通知システム登録。
- mock-data-unification-plan は Phase 1+2 完了（残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題）。

## 触らないでほしいもの / 注意事項

- 共通ダミーデータ `mock.oms.state.v1`（localStorage キー / `co-mock-store.js`）周辺は **Codex 側が大幅構造変更を行っている**。シードや SelfNotify の `target` を扱う際は固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得する設計にすること
- `co-navbar.js` は `co-mock-store.js` が先に読み込まれる前提になったため、4画面の script 順序を戻さないこと
- N-5 の別画面遷移は URL パラメータ `cnJump` に JSON を載せる。**同タブ遷移** で着地し `history.replaceState` で cnJump を除去する設計（2026-05-27 Claude Code 修正）。`window.open(_blank)` には戻さないこと
- 共通パネルは `affects[]` だけでは通知フォーカスしない。現在画面用 `target` が解決できる場合のみ即時フォーカスする
- 通知ベルは表示上4分類だが、画面側 SelfNotify は旧IDで呼んでよい。共通シード済みの初期通知はページ側 `setItems('sl'|'ws'...)` で上書きしない。実操作の `addItem(...)` は統合ベルへ追加される
- 発信元/主担当画面が現在画面と異なる通知は、現在画面でフォーカスできてもパネルを閉じない。アコーディオンを展開し、発信元画面で開くボタンを残す

## 構造的変更の警告

| 日付 | 担当 | 変更内容 | 影響範囲 |
|------|------|---------|---------|
| 〜2026-05-25 | Codex | ダミーデータを HTML ハードコード → `mock.oms.state.v1` 共通ストアへ移行 | 各画面のシード通知 / SelfNotify の target / 通知ジャンプ先 DOM |
| 2026-05-27 | Codex | 通知デモ seed を固定文字列 → 共通モックデータ参照へ変更 | `co-navbar.js` 初期ベル / OB・SL・WS seed / HTML script 読み込み順 |
| 2026-05-27 | Codex | 通知クリック判定を `affects[]` 依存 → `domain` / `primaryPage` / 画面別 `target` 解決へ変更 | `co-notify-panel.js` / 各画面 SelfNotify / admin-notify 優先度表 |
| 2026-05-27 | Codex | 通知ベル7種 → 4分類へ統合し、旧ベルIDをエイリアス化 | `co-navbar.js` / `co-notify-panel.js` / 各画面 `addItem/setItems` / 管理者アイコン選定 |
| 2026-05-27 | Codex | 通知ジャンプ演出を点滅 → 対象外セル/行の2秒フェードオーバーレイへ変更 | `co-notify-panel.js/css` / OB・SL・WS・LA の `cn:jump` 着地処理 |
| 2026-05-28 | Claude Code | OB行削除→復旧トグルを追加（localStorageフラグ単一真実源 + 汎用 `cn:action` ボタン機構 + `item.locked`/`item.actions` 表示 + デモ削除行 `OMS_DEMO_DELETED_ROW`） | `co-navbar.js`(`mdNavRefreshBells`) / `co-notify-panel.js`/`.css` / `order-book.js`(グリッド増減・cellData再マップ) / `mock-orders-data.js` |
| 2026-05-28 | Claude Code | WSクロスジャンプの seed を OBサイト名 → WS実サイト(`axis:'wsCell' / value:'s1'`) へ変更、items.sl の target.weekly-schedule を削除（OB/WSモックサイト名が共有されないため） | `co-navbar.js` `mdNavBuildBellItems` の items.sl / items.ws |
| 2026-05-29 | Claude Code | 通知ジャンプ着地演出をセル単位部分オーバーレイ → 全画面スポットライト (透明穴 + box-shadow 9999px) へ変更。`showFocusOverlay` 1関数差し替えで全画面共通化、`candidateSelector` 引数は無視に | `co-notify-panel.js` (showFocusOverlay/clearFocusOverlay) / `co-notify-panel.css` (.cn-focus-spotlight) / HTML 6本キャッシュバスター |
| 2026-05-29 | Claude Code | Phase 2: SL の社員配置を共通ソースから読み取り描画。`createSiteOrderMap` (siteId↔OB受注行) 新設、SL 描画ループで保存状態の無い行に初期充填。OB `buildMonthState` にデモ今日の対応6行への受注エントリ保証注入 (`ensureDemoTodayPlacementRows`) を追加 (クロス画面修正) | `mock-assignments-data.js` (createSiteOrderMap + デモ今日配置) / `mock-orders-data.js` (buildMonthState 注入) / `screen-layout.js` (初期充填) / HTML キャッシュバスター |
| 2026-05-29 | Claude Code | SL/WS/LA + 通知seed のダミーデータ (配置/応援/休み/車両配置) を `mock-assignments-data.js` に一本化。WS hardcode 28件配置 / 応援 partners 5社 / 予約 / 車両配置 / 整備を共通ソース由来に。LA の empIdx 配列外バグ修正 + デモ今日に isOnLeave 3名 approved 追加。通知seed の架空人名 "DCP-柊本" を実在社員に修正 | 新規 `docs/mockup/mock-assignments-data.js` / `weekly-schedule.js` (seed 2関数 + holidays hardcode 削除) / `screen-layout.js` (slSeedSupportDemoData) / `leave-application.js` (seedDemoLeaves + seedWsAssignments + 通知 seed) / HTML 6本に script タグ + キャッシュバスター |
| 2026-05-29 | Claude Code | N-6: WS schedule 発火を全配置パスに追加 (delete 8 + add 9 + modify 2 = 19箇所)。**LA通知 target を単一 `{axis:'leaveId'}` → 画面別マップ形式へ変更**（SL 用 `empName` 軸追加 + affects に screen-layout）。SL に empName 着地 `slCnFocusLeaveEmployee` 新設 | `weekly-schedule.js` (削除/追加/移動ハンドラ) / `leave-application.js` (`laCnSelfNotify` target) / `co-navbar.js` (la seed target) / `screen-layout.js` (cn:jump リスナー)。WS の leaveId 処理は画面別マップでも `weekly-schedule` キー維持で無影響 |
| 2026-06-01 | Codex | LA休暇申請 seed を LA 画面専用生成から `mock-assignments-data.js` 共通生成へ移し、`co-mock-store.js` 未初期化時も seed を返すよう変更。SL/WS/共通ナビ単体起動でも LA 通知 seed が成立 | `mock-assignments-data.js` (`createLeaveApplications`) / `co-mock-store.js` (`getLeaveApplications` fallback) / `leave-application.js` seed 利用 / `co-navbar.js` 現在日優先 LA seed / HTML キャッシュバスター |

## アクティブな計画書

- `docs/plan/mock-data-unification-plan.md` — SL/WS/LA/通知seed ダミーデータ一本化（**Phase 1+2 完了 / 残: WS `wsVehiclesData`/`wsSitesData` 共通ソース統一は将来課題**）
- `docs/plan/notification-refactor-plan.md` — 変更通知システム リファクタリング（**N-6 静的検証 + 要対応実装 + SL↔LA seed フルフロー実証 完了（§17）/ 次は Phase 2.5 登録**）
- `docs/plan/design-refresh-plan.md` — デザイン刷新 診断・比較計画（**案B改: Calm Operations 採用方針 / 差分モック作成済み / 次は SL 適用範囲確定**）
- `docs/plan/ws-support-partner-plan.md` — WS 応援予約・協力業者
- `docs/plan/ui-components-improvement-plan.md` — UI コンポーネント整備
- その他: `docs/plan/*.md` 一覧を確認
