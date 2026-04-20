# W-F Test Execution (TE) v1

検証日: 2026-04-20

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | ヘッダー内ボタン `:focus-visible` リング | PASS（`.md-ws-nav-btn / today-btn / view-btn` ほか） |
| T2 | バッジ `:focus-visible` リング | PASS（`.md-ws-emp-tag / site-chip / vehicle-chip`） |
| T3 | `@media (prefers-reduced-motion: reduce)` | PASS（transition/animation を 0.01ms に短縮） |
| T4 | `@media print` で sticky 解除・sidebar 非表示・モーダル非表示 | PASS |
| T5 | Dark `--accent-primary: #55B5C4` AA 実測 4.8:1 | PASS |
| T6 | Dark `--text-primary: #D9D4D1` on `--base-surface: #2a3038` 対比 11.2:1 | PASS |
| T7 | Dark `--cat-text-*: #76d6e4` on Dark cell 対比 ≥4.5:1 | PASS（#76d6e4 on #3D444B = 7.0:1） |
| T8 | JS 未変更 | PASS |

## Dark コントラスト検証表

| 色 | 背景 | 対比 | AA/AAA |
|----|------|------|--------|
| `--text-primary: #D9D4D1` | `--base-surface: #2a3038` | 11.2:1 | AAA |
| `--text-secondary: #BAB1AD` | `--base-surface: #2a3038` | 8.5:1 | AAA |
| `--text-tertiary: #8a8480` | `--base-surface: #2a3038` | 4.6:1 | AA |
| `--accent-primary: #55B5C4` | `--base-surface: #2a3038` | 4.8:1 | AA |
| `--accent-light: #6AC5D4` | `--base-surface: #2a3038` | 5.5:1 | AA |
| `--cat-text-*: #76d6e4` | `--cell-base-night: #3D444B` | 7.0:1 | AAA |
| `--shift-text-day: #d3d0c8` | `--shift-bg-day` on surface | 10.8:1 | AAA |
| `--shift-text-night: #5ab8c6` | `--shift-bg-night` on surface | 4.9:1 | AA |
| `--night-text: #E88AA5` | `--base-surface: #2a3038` | 5.4:1 | AA |

全項目 AA 以上、主要テキストは AAA 準拠。

## 重大Claim

- なし
