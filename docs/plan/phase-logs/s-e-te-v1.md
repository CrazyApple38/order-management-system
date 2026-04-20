# S-E Test Execution (TE) v1

検証日: 2026-04-20

| ID | 結果 | 詳細 |
|----|------|------|
| T1 | PASS | S-C で `[data-category=*]` 9種、`[data-shift=*]` 2種併設（SL CSS L1234-L1245） |
| T2 | PASS | `--cat-bg-event/traffic/highway` は co-tokens.css で D5.2 4色相値（blue-violet/brown/green）。SL :root から同名定義を削除済のため Light テーマで差別化表示 |
| T3 | PASS | Dark `[data-theme="dark"]` の `--cat-bg-*` を S-A で 4色相Dark トーンに更新（SL CSS L62-L70） |
| T4 | PASS | `.continuous-badge { color: var(--warning-text); }`（SL CSS L1549-L1553） |
| T5 | PASS | `.employee-tag` / `.vehicle-list-tag` / `.etc-tag` は現状維持（JS 互換優先）、トークン経由で描画 |

## 備考

- SL の badge クラスは co-tokens.css の legacy aliases を通じて新DS値で解決されており、意味等価性が担保されている
- `.bt-*` 体系へのクラス名 rename は JS 参照多数（`classList.add/remove` で 'selected' や 'assigned' を toggle）のためSLスコープでは見送り
- co-shared-badges.css の `.bt-cat-*` / `.bt-shift-*` 相当の機能は、SL の `[data-category=*]` / `[data-shift=*]` 併設セレクタで実現
