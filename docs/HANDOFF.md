# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-11
- **コミット**: 直前 HEAD `b3c9c4e`（F-0成果は本HANDOFFと同一コミットでpush予定）

## 直前にやったこと
- `mockup-master-account-plan.md` の **F-0（マスタモックデータ棚卸し）を完了**し、全20項目の種別×データソース対応表を§3へ追記。
- 既存正本は `demo-data.js` / `mock-employees-data.js` / `mock-vehicles-data.js` / `mock-assignments-data.js`。`co-mock-store.js` は画面状態ストアでマスタ正本ではないと確認。
- 組織階層は既存データを再利用可能。祝日はLA/OB/WSで重複し単一正本なし。資格/祝日/ペナルティ/定型文はDB初期値からF用シードが必要。
- `ds-audit.js` は NG=0 / WARN=0、`git diff --check` OK。F-0は文書のみのためruntime検証対象外。

## 次にやるべきこと
1. 推奨順の次は **F-1（骨格+契約先CRUDパターン）**。着手前にユーザー確認し、仮ファイル名 `master-management.html` を確定する。
2. F-1の保存方式は `co-mock-store.js` を拡張せず専用キー/専用シードにするか、着手時に確認する。
3. G-1を先行する選択も可。仮ファイル名 `account-settings.html` と共有 `.menu-user` 改修を着手前に確認する。
4. Phase 3（仕様書）へは「モックアップ完了」宣言があるまで進まない。

## 今だけの申し送り
- `.agent-env.json` と `docs/doc-export-smoke-test.{md,docx,pdf}` は未追跡成果物。変更・コミットしない。
- OB の cn:jump 着地で右プロパティ詳細ペインが「未選択」なのは仕様（詳細ドックは編集時のみ。着地行は連携・所在/変更履歴モードへ反映）。
- 区分・バッジ共有化と祝日一本化は既存画面への横断影響があるため、F-3/F-2着手時に事前確認する。
