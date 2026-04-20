# S-D Test Design (TD) v1

サブフェーズ: **S-D — ボタン・モーダルの DS 規約補完**

作成日: 2026-04-20

## 1. 目的

M-D1 / M-D2 で SL のボタン・モーダル共通化は既完了。旧 `md-ob-btn*` / `md-ob-modal*` / `md-ws-modal-btn*` / `qa-modal-btn*` の残存を SL HTML で最終確認する。

## 2. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠 | 35 |
| D. 一貫性 | 30 |
| E. 機能回帰 | 25 |
| G. 保守性 | 10 |

## 3. チェックリスト

- T1 SL HTML に `md-ob-btn` / `md-ws-modal-btn` / `qa-modal-btn` が 0 件
- T2 SL HTML の主要モーダルが `.modal` 系または `.md-modal-overlay` の共通ラッパーを使用
- T3 SL HTML に `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-ghost` 等の DS クラスが使用されている
