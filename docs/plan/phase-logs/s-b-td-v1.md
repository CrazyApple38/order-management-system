# S-B Test Design (TD) v1

サブフェーズ: **S-B — Screen Layout フォーム（`.md-fi-*` 体系）への移行補完**

作成日: 2026-04-20

## 1. 目的

M-B1 時点で SL のモーダル・インラインフォームを既に `.md-fi-field / .md-fi-label / .md-fi-input*` に移行済。残存する旧フォームクラス (`md-ob-form-row` 等) が無いことを確認、`co-forms.css` が SL に読み込まれていることを確認する。

## 2. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠 | 30 |
| D. フォーム一貫性 | 30 |
| E. 機能回帰 | 30 |
| G. コード品質 | 10 |

## 3. チェックリスト

- T1 `docs/screen-layout.html` の `co-forms.css` link が存在する
- T2 SL HTML/CSS に `md-ob-form-row` クラスが 0 件
- T3 SL HTML に `md-fi-field / md-fi-label / md-fi-input` が使われている（≥10 件）
- T4 数値入力に `md-fi-input-number` / tabular-nums が適用されている
