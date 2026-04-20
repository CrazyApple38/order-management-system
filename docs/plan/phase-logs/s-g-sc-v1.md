# S-G Scorecard (SC) v1

| 区分 | 配点 | 獲得 | 所見 |
|------|-----:|-----:|------|
| A. DS 参照健全性 | 30 | 30 | 未定義変数参照 0 件、legacy aliases 経由で全解決 |
| D. クラス残存チェック | 20 | 19 | 旧共通クラス（md-ob-form-row 等）0 件。`.md-ob-*` の SL流用分は OB M-G1 同様に許容残置 |
| E. 機能回帰 | 30 | 30 | 他モックアップ・co-*・JS 全て差分なし |
| G. 保守性・引継ぎ | 20 | 18 | 残作業（legacy aliases 撤去）を明文化、WS/QA への依存関係を記述 |

**総合: 97/100 PASS**

重大Claim: なし

## 次フェーズ（SL外）への引継ぎ

1. co-tokens.css の legacy aliases は **WS / QA の移行完了後** に撤去予定
2. SL の `.grid-table` / `.category-*` / `.shift-*` / `.selected` クラスは JS 依存のため永続残置
3. `.bt-*` 体系への完全rename は SL JS の大規模リファクタが必要（Phase 外）
