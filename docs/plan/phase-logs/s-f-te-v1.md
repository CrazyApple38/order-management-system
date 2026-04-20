# S-F Test Execution (TE) v1

検証日: 2026-04-20

| ID | 結果 | 詳細 |
|----|------|------|
| T1 | PASS | SL CSS L4281 に `.sr-only` 実装（標準パターン） |
| T2 | PASS | SL CSS L4294 `@media print { ... }` セクション追加 |
| T3 | PASS | print 内 `*,*::before,*::after` リセット記述あり |
| T4 | PASS | `.side-panel / .toolbar / .md-modal-overlay / .sort-modal / .md-cn-modal / .color-settings-panel` 等が非表示 |
| T5 | PASS | `thead { position: static; display: table-header-group }` |
| T6 | PASS | `.grid-container { overflow: visible }` |
| T7 | PASS | `tr[aria-selected="true"] { outline: none }` |
| T8 | PASS | `.print-only { display: none !important }` |
