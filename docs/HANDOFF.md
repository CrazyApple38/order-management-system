# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-04
- **コミット**: 0688b90（直前 HEAD・本作業は本コミットに含む）

## 直前にやったこと（最新のみ）

- **R-2 通知データモデル改修（コア実装済み・runtime検証保留）**に着手。Codex と期間衝突なしを確認済み（`mock.oms.state.v1`/`co-mock-store.js` の直近 Codex 変更は 2026-06-01 が最後）。
- 実装済み: ①`co-notify-panel.js`(v39) = 統合ベル1個化・カテゴリをエンティティ(domain)導出・配置サブタグ導出・`targetDate`(単日文字列/範囲{start,end})の日別グルーピング・`buildItemHtml` を cn-card 構造へ・履歴/検索/一覧選択の撤去（QA互換ハンドラは末尾に隔離）・センター導線 ②`co-notify-panel.css`(v18) = `.cn-card` スコープで DS 値内蔵ブロック追加 ③`co-navbar.js`(v22) = 単一ベルDOM + seed フラット化 + targetDate/subTag 付与。HTML6本のキャッシュバスター更新。
- 静的検証: 両 JS `node --check` 合格 / 削除済み関数への未解決参照なし。**runtime検証は未（XAMPP停止 + Playwright file://ブロックのため本セッションで実行不可）**。

## 次にやるべきこと

- **最優先: runtime検証**（XAMPP起動 → `http://localhost/order-management-system/docs/...`）。OB/SL/WS/LA/QA + admin-notify のコンソール0、統合ベル→cn-card表示、カテゴリ/サブタグ/対象日バッジ、カテゴリフィルタ、cn:jump着地（スポットライト）、OB復旧トグル・「元に戻す/やっぱり反映」の回帰。screenshots/ へ保存。**崩れ・エラーがあれば cn-card CSS か buildItemHtml を調整**。
- **R-2 残タスク（enhancement）**: ①各画面 SelfNotify に明示 `targetDate`/`subTag` を付与（現状は panel 側の domain/scope 導出で概ね充足するが、OB 日またぎ等は明示が確実）②admin-notify（notify-compare の BELLS/PANELS）を4分類+サブタグ表示へ追従（現状は旧7ベル authoring UI のまま／runtime ベルは1個で不整合なし）。
- 検証・残タスク完了後に mockup-refactor-plan §7 の R-2 を「完了」へ更新し、Phase Gate 判断へ。

## 今だけの申し送り（任意）

- 本コミットは **R-2 コア実装のチェックポイント（runtime未検証）**。次セッションは上記「runtime検証」から再開すること。
- R-3b/c 持ち越し（曜日色トークン選定 / density spacious 具体値 / OB 地図プレビュー右プロパティ成立性）は R-2 では触らない前提を継続。
