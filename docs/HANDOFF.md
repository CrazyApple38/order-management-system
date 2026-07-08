# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Sonnet 5)
- **日付**: 2026-07-08
- **コミット**: 本コミット（親=452da70）。**R-3c-3（WS 通知rail cn-card＋履歴配線）完了 → R-3c 全段階完了**。次は R-3d LA
- 直近コミット: `452da70` R-3c-2b 応援予約モーダル→ドック転換 / `678b45d` R-3c-2a panel-rail 4モード / `0e10e4d` 休み色 info化

## 直前にやったこと（最新のみ）

- **R-3c-3（WS 通知rail cn-card＋履歴配線＋回帰確認）完了**（Playwright 1440px runtime 検証済・コンソール0/0）:
  - **統合ベルDOM移設**: `wsMountNotifyRail()` 新設。`#mdNavCnBells` を `.ws-workspace .rail` へ移動（アンカーCSSは ws-ds.css に先行定義済み）。init() から `wsMountNotifyRail(); setTimeout(..., 0);` で呼び出し。
  - **変更履歴を「選択セル」モードに埋め込み**（WSは専用history modeを持たないため、①選択セルパネルの下部に追加）: `wsRenderHistorySection(sidebar, cell)` 新設。`wsNotifyItems()`（sourceBell==='ws' || primaryPage==='weekly-schedule' || affects含む || target.axis==='wsCell' でフィルタ）→ `cell` があれば `wsResolveCellSiteIds()`（siteId直接 / empIndex→`getAssignedSites` / vehicleId→`getVehicleAssignedSites`）で対象siteId群を解決し `wsNotifyMatchesCell()` で絞り込み。未選択時は週間予定表全体の直近6件を表示。カード→`data-cn-history-id`委譲→隠れた`.cn-item`があれば`.cn-item-row`をclick()（OB/SL同型）、無ければ直接`cn:jump`dispatch。
  - **cn:jump リスナー強化**: 着地時に `selectedCell` を再設定し `wsPropMode='cell'` に切替えて `renderSidebar()`（OB `obSelectRow(ri)` と同型）。従来はハイライトのみでパネルが連動していなかった欠落を補完。
  - **副産物バグ修正**: `.cn-item-row`委譲クリック（`rowEl.click()`）が実DOM `click` イベントとしてもbubbleし、WS独自の「グリッド外クリックで選択解除」グローバルリスナー（co-notify-panel由来の隠しDOMは`.md-ws-sidebar`外にあるため誤爆）に反応して選択セルが即座に解除される問題を発見。`.rail`/`.cn-card`/`.cn-panel` を解除除外対象に追加して修正（OB/SLにはこのグローバル「外側クリックで解除」リスナー自体が存在しないため同種バグなし＝WS固有）。
  - **通知の追加/削除への追従**: `wsPatchNotifyRefreshHooks()` — `coNotifyPanel.setItems/addItem/removeItem/clearItems` をラップし、`wsPropMode==='cell'` のときのみ `renderSidebar()` で履歴セクションを再描画。
  - **N-6 回帰確認**: 現場軸/社員軸切替・週送り・GCフィルタモーダル・応援予約ドック・セル選択→社員配置→schedule通知発火→ベル件数増加→履歴フィルタ反映→cn:jump着地→選択セル再選択、を実操作で確認。コンソールエラー0を全工程で維持。
  - スクショ `screenshots/r3c3-ws-notify-rail.png`。`weekly-schedule.js?v=23` / `ws-ds.css?v=5`（`weekly-schedule.css?v=5` 据置）。

## 次にやるべきこと

- **R-3d LA（leave-application.html）新DS適用**: SSOT=`docs/plan/mockup-refactor-plan.md` §4 表（LA=3モード×作業面連動+ミニカレンダー prop-card 上部常設）。着手前に該当設計章（`docs/design-system/03_screen-application.md`）を確認し、詳細段階計画（R-3c の `vivid-swinging-elephant.md` 相当）が必要か判断。
- 以降 R-3e QA。

## 今だけの申し送り（任意）

- **R-3c は全段階（1/2a/2b/3）完了**。WS はこれで新DS(Calm Operations)＋通知簡素化＋panel-rail 4モード＋通知rail cn-card が揃った状態。
- WS の「選択セル」モードには変更履歴セクションが常設（専用historyモードは無し・OB/SLとはUI配置が異なる点に注意——次画面で同型実装する際は「専用historyモードを設けるか/選択中モードに埋め込むか」を都度 03 §4 で確認）。
- Playwright の孤立 Chrome ロックが出たら該当プロファイルのみ kill。OB の `shield.svg` 404 は既知・未対応。
