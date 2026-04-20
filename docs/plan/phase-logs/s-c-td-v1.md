# S-C Test Design (TD) v1

サブフェーズ: **S-C — Screen Layout テーブルの `.tbl` DS 12 規約への対応**

作成日: 2026-04-20

## 1. 目的

SL の `.grid-table` `<table>` ベースに対し、新DS `.tbl` / `.tbl--sticky-head` / `[aria-selected]` / `[data-category]` / `[data-shift]` 規約を**追加（エイリアス）**で対応。`.grid-table` は JS互換のため残置する（SL JS で 121+ 件参照）。見た目不変 + DS エイリアス併設を原則とする。

## 2. 方針

案B（クラス並行運用）を採用。クラス rename ではなく、セレクタ列挙で DS クラス・属性の併設を行う。

- `.grid-table` と `.tbl` を並列セレクタで同一宣言
- `.grid-table thead` と `.tbl--sticky-head thead` の sticky を併設
- 既存 `thead th` の `background: var(--base-muted)` を `var(--bg-surface-3)` に、`z-index: 10` を `var(--z-sticky)` に、`font-weight: 600` を `var(--fw-semibold)` に、`padding: 8px` を `var(--space-sm)` にトークン化
- `tbody tr.selected` ≡ `tbody tr[aria-selected="true"]` を併設
- `.category-*` / `.shift-*` ≡ `[data-category=*]` / `[data-shift=*]` を併設

## 3. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠（tbl / sticky-head / aria-selected / data-* の併設） | 25 |
| C. タイポ・余白（tbl padding/fs/z-index のトークン化） | 15 |
| D. テーブル一貫性 | 20 |
| E. 機能回帰（JS 選択/ハイライト動作維持） | 30 |
| G. 保守性 | 10 |

## 4. チェックリスト

- T1 SL CSS に `.tbl` 規約（`.tbl / .tbl th / .tbl td / .tbl thead th / .tbl--sticky-head thead`）が追加されている
- T2 SL HTML の `<table class="grid-table">` に `tbl tbl--sticky-head` クラスが追加されている
- T3 `thead th` の style が `var(--bg-surface-3)` / `var(--z-sticky)` / `var(--fw-semibold)` / `var(--space-sm)` 等のトークンで定義される
- T4 `tbody tr[aria-selected="true"]` セレクタが `.selected` と同等の style を持つ
- T5 `.category-facility` と `[data-category="facility"]` が同等の style を持つ（他 8 カテゴリ + 2 シフト同様）
- T6 `.grid-table` クラスの JS 参照（querySelector 等）は破壊されない（差分なし）
- T7 SL以外のCSS/HTML/JSに差分が発生していない（HTMLは SL のみ、追加 1 行）
