# S-C Test Execution (TE) v1

検証日: 2026-04-20

| ID | 結果 | 詳細 |
|----|------|------|
| T1 | PASS | SL CSS L793–L823 に `.tbl / .tbl th / .tbl td / .tbl--sticky-head thead / .tbl thead th` を追加 |
| T2 | PASS | `docs/screen-layout.html` L60 の `<table class="grid-table tbl tbl--sticky-head">` |
| T3 | PASS | `thead th` が `var(--bg-surface-3)`, `var(--z-sticky)`, `var(--fw-semibold)`, `var(--space-sm)` でトークン化 |
| T4 | PASS | `tbody tr.selected` と `tbody tr[aria-selected="true"]` が並列セレクタで同等 style（L1425–L1453） |
| T5 | PASS | `.category-*` 9種 + `.shift-*` 2種 に `[data-category=*]` / `[data-shift=*]` を併設（L1234–L1245） |
| T6 | PASS | `.grid-table` セレクタは全て残存（JS 互換） |
| T7 | PASS | S-C の差分は SL CSS + SL HTML のみ |

## 機能想定確認

- `document.querySelectorAll('.grid-table tbody tr')` → `.grid-table` が HTML に残存するため取得可能
- `tr.classList.add('selected')` による選択ハイライト → 既存 CSS の `.selected` セレクタで動作継続
- 追加された `.tbl` クラスは `.grid-table` と並列セレクタのため干渉しない
