# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-18
- **コミット**: `codex/sl-employee-capsule` ブランチ（更新前 HEAD `06b97e1`）

## 直前にやったこと
- SL中央表の配置済み社員バッジを、DS正本 `.person` のカプセルへ変更。
- 保存済みlocalStorageの旧社員DOMも、データ消去なしで読み込み時に自動変換。
- 既存のD&D・休暇・連勤・連絡・解除表示を維持し、社員色設定を人物アイコンへ接続。
- Chrome 1440×920で全8件の高さ32px、社員名14px/最大56px、参照モックとのCSS一致を確認。

## 次にやるべきこと
1. PRのCIと検証ループ結果を確認する。
2. 視覚変更のため、ユーザー目視承認後にマージする。
3. Phase 2の次作業はユーザー指示を待つ。

## 今だけの申し送り
- 確認画像: `screenshots/sl-employee-capsule.png`（git管理対象外）。
- 未追跡 `_ai-inbox/` は既存ファイルであり、今回のPRには含めない。
- XAMPPは起動禁止。ローカル確認はDockerの `http://localhost/order-management-system/` を使用。
