# W-B Test Design (TD) v1

サブフェーズ: **W-B — WS フォーム要素を co-forms.css `.md-fi-*` 系と整合**

作成日: 2026-04-20

## 目的

WS の JS 内で生成されるフォーム要素（`md-ws-res-quick-input`, `md-ws-pac-input`, `md-ws-res-quick-label`, `md-ws-stepper-input`）が、co-forms.css の `.md-fi-*` スタイルと視覚・挙動の両面で整合するようにする。JS の class 名は互換性のため温存し、**CSS セレクタを共通化**する方式を採る。

## 配点

| 区分 | 配点 |
|------|-----:|
| A. DS 準拠（co-forms 共通化） | 30 |
| B. 視覚一致（フォーカス・ホバー・エラー） | 20 |
| E. 機能回帰（JS 非破壊） | 30 |
| G. コード品質（重複削減） | 20 |

合格: 70点以上 AND 重大Claim=0

## テスト項目

- T1 `.md-ws-res-quick-input`, `.md-ws-pac-input`, `.md-ws-stepper-input` が `.md-fi-input` と同一のフォーカスリング色（`var(--accent-dim)`）になる
- T2 ラベル `.md-ws-res-quick-label` が `.md-fi-label` と同色・同サイズ
- T3 JS コードの class 名変更ゼロ（互換性維持）
- T4 co-forms.css は変更しない
- T5 視覚差分が発生しない

## 重大Claim

- C1 JS の class 名が変更され機能破壊
- C2 co-forms.css / 他ファイルに差分発生
