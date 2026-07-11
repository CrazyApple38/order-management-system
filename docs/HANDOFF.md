# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-11
- **コミット**: `973b9ce`（本セッション成果は 7a5180a / 988917b / 973b9ce の3コミット・push済み）

## 直前にやったこと
- R-6 runtime 検証を Playwright で完遂し **mockup-refactor-plan R-0〜R-6 全完了**（R-4〜R-6 の Codex 実装レビュー = ズレ・抜けなし。スクショ `screenshots/r6-*.png`）。
- 通知UX採用6項目（既読分離/削除系復元統一/関与ベース既定スコープ/着地選択永続化/連続変更集約/センター文脈引き継ぎ）を要件 §3.14.3 + DB §3.15.4 `notification_reads` へ記録。§3.14.3 の旧記述（4分類ベル・履歴タブ・センター要対応/状態フィルタ）は現行仕様へ是正済み。
- **F マスタ管理（統合1画面）/ G アカウント画面を計画化**: 要件 §3.21 改訂+§3.22 新設 / DB §3.31 `user_profiles`+§3.32 `user_preferences` / 画面別設計 = `docs/design-system/03_screen-application.md` §4 F/G 節 / 計画 SSOT = `docs/plan/mockup-master-account-plan.md`（**実装エージェントは §2 AI実装ガイドライン厳守・必読リスト順に全読**）。

## 次にやるべきこと
1. F-0（マスタモックデータ棚卸し）または G-1 から着手可。**各 Phase 着手時にユーザー確認**。F/G のファイル名（master-management.html / account-settings.html は仮称）も着手時に確認。
2. 通知UX採用項目のうち着地選択永続化・連続変更集約はモック実装候補（着手前ユーザー確認）。
3. Phase 3（仕様書）へは「モックアップ完了」宣言があるまで進まない。

## 今だけの申し送り
- `docs/doc-export-smoke-test.{md,docx,pdf}` は先行作業の未追跡成果物。変更・コミットしない。
- OB の cn:jump 着地で右プロパティ詳細ペインが「未選択」なのは仕様（詳細ドックは編集時のみ。着地行は連携・所在/変更履歴モードへ反映）。
