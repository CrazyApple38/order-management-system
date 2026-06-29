# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-06-30
- **コミット**: 8017cf1（直前 HEAD）

## 直前にやったこと（最新のみ）

- (Claude Code) 引き継ぎ構造を再設計: 永続事実ストア `docs/SHARED-MEMORY.md` を新設し、HANDOFF の「触らないで／構造的変更の警告／アクティブ計画書」と要件↔DB整合課題を移設。HANDOFF を揮発状態のみ（10〜30行）に痩せさせ、AGENTS.md / CLAUDE.md の「AI 間引き継ぎ運用」を両AI共有ストア前提に更新。
- (Claude Code) SLモック微調整（2026-06-14, commit `52df8e6` まで）: 所属会社メタボールアイコン追加 / Color Themes 削除 / belong 色パステル化 / 区分円 GC 色 / 配置の青灰バッジ化。相性問題アイコンは警告三角型（`.person-warn` + `#ic-caution-line`）で確定し、吹き出し（si-4675 / compatibility-alert.svg）は破棄済。

## 次にやるべきこと

- `docs/plan/mockup-refactor-plan.md` に従って **R-1（DS基盤統合）から着手**。R-3/R-4/R-5 は本計画に統合済・個別先行実装は凍結。
- R-2 着手前に Codex と `mock.oms.state.v1` 構造変更の期間調整（`SHARED-MEMORY.md` の構造的変更の警告表へ追記）。
- SL 右プロパティ4モードの情報粒度をユーザー確認（現場詳細項目 / 候補並び / 車両ETC 分割 / 変更履歴粒度）。
- **未決の横断判断（要件↔DB 整合2件）は `docs/SHARED-MEMORY.md` 参照・ユーザー判断待ち**。

## 今だけの申し送り（任意）

- 作業ツリーは clean・`origin/master` と一致（直前確認時点）。
