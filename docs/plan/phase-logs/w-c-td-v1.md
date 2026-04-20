# W-C Test Design (TD) v1

サブフェーズ: **W-C — WS テーブル（Grid）を BEM 規約へ整合**

作成日: 2026-04-20

## 目的

`.md-ws-grid` と関連セル・ヘッダーが新DS の `.tbl-grid` BEM 規約と併用可能になるようにする。2段 sticky ヘッダー（日付行・昼夜行）は既に機能しているため、それを文書化し、セレクタ統合のための alias（`.tbl-grid`, `.tbl-grid__cell`, `.tbl-grid__header`）を追加する。

制約: JS 出力 class 名は温存。**HTML/JS への `data-dow` / `data-shift` 属性追加は JS 書き換えリスクが大きく Phase 範囲外**とし、CSS セレクタ統合のみで進める。

## 配点

| 区分 | 配点 |
|------|-----:|
| A. BEM セレクタ併用（.tbl-grid alias） | 30 |
| C. 2段 sticky 維持 | 20 |
| E. 機能回帰 | 30 |
| G. コード品質 | 20 |

合格: 70点以上

## テスト項目

- T1 `.md-ws-grid` で `display: grid` が有効
- T2 日付ヘッダー sticky top:0 が機能
- T3 昼夜サブヘッダー sticky が機能（top は JS 設定）
- T4 名前セル sticky left:0 が機能
- T5 コーナーセル（左上）sticky top+left が機能
- T6 `.md-ws-today-col` の左 3px accent border が描画される
- T7 CSS パースエラーなし
- T8 JS 未変更

## 重大Claim

- C1 sticky 機能が破壊される
- C2 JS 変更による機能破壊
