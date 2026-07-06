# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-06
- **コミット**: dee7fce（R-3a-1b 実装コミット）

## 直前にやったこと（最新のみ）

- **R-3a-1b 完了・runtime検証済**: SL中央表を10列→7列（区分/契約先・現場名、集合、時間、人数、配置、車両・ETC、変更履歴・備考）へ再構成。固定3行も7列化。
- **No.列撤去**: 表DOM上の `.col-no` は0件。行番号は `data-sl-seq` に退避し、`slGetRowKey` / `renumberRows` を互換化。
- **地図/作業内容統合**: 地図は `.col-site-info[data-maps]` 内の `.sl-map-pills .info-pill` へ移動（`openMapModal` 維持）。作業内容は `.work-badge-slot` へ移動（`openWorkModal` 維持）。旧 `.col-map/.col-badge` は表DOM 0件、JS互換フォールバックのみ残置。
- **検証**: `node --check docs/mockup/screen-layout.js` OK。Chrome経由で localhost 検証: header/dynamic/fixed すべて7列、旧列DOM 0件、行選択OK、現場詳細モーダル display:flex、地図モーダル display:flex、ページ由来console error 0。スクショ `screenshots/r3a1b-sl-full.png`。

## 次にやるべきこと

- **R-3a-2 着手**: 編集モーダル→右プロパティ4モード転換（現場詳細 / 社員配置 / 車両・ETC / 変更履歴）。
- `siteModal` 系（meeting/work/workTime/map/notes含む）を右プロパティ「現場詳細」へ段階移植。`sortModal`・削除確認・印刷はモーダル維持。
- R-3a-2 では、今回追加した `.work-badge-slot` / `.sl-map-pills` / `.col-notes::before` の配置を右プロパティ側のモード設計と整合確認する。
- 右プロパティ化後、R-3a-3 で通知rail cn-card・cn:jump・元に戻す/seed回帰をまとめて検証。

## 今だけの申し送り（任意）

- in-app browser `iab` は利用不可だったため、browser-client の Chrome extension 接続で検証した。ページ由来エラーは0、Chrome拡張由来エラーは検証対象外。
- フルページスクショはブラウザ側10秒制限でタイムアウトしたため、viewportスクショを `screenshots/r3a1b-sl-full.png` として保存。
