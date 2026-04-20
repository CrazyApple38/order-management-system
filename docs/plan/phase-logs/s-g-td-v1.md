# S-G Test Design (TD) v1

サブフェーズ: **S-G — Screen Layout スコープの旧クラス・旧変数の最終検証**

作成日: 2026-04-20

## 1. 目的

SL スコープで、S-A〜S-F の成果を最終検証する。実際の旧変数削除・クラス rename は行わない（**案B: 検証のみ**）。co-tokens.css の legacy aliases は他画面（WS/QA）がまだ参照しているため M-G1 同様に残置。

## 2. 検証内容

- SL CSS 本文の `var(--base-*/sub-*/accent*/error*/success*/warning*/shadow-*)` 残存数計測（co-tokens.css 経由で解決済であれば OK）
- SL HTML / JS に旧共通クラス（`md-ob-form-row / md-ob-btn* / md-ws-modal-btn*`）が 0 件
- SL :root（Light）が S-A で 16 変数まで縮小されている
- `.tbl` / `.tbl--sticky-head` / `[aria-selected]` / `[data-category]` / `[data-shift]` の併設が維持
- `.sr-only` / `@media print` セクションが存在

## 3. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS 参照健全性 | 30 |
| D. クラス残存のチェック | 20 |
| E. 機能回帰（差分のみ） | 30 |
| G. 保守性・引継ぎ | 20 |

## 4. 許容残存

- `var(--base-*) / var(--sub-*) / var(--accent-primary/light/dim) / var(--error*) / var(--success*) / var(--warning*) / var(--shadow-*)` — SL 本文は合計 284 件。全て co-tokens.css の legacy aliases または SL :root の SL 固有残置で解決されるため **残存を許容**
- `.md-ob-*` 系のOB固有クラス（SLにも混在） — 残置（OB M-G1 方針に準拠）
- `.grid-table / .category-* / .shift-* / .selected` — JS 依存のため残置
