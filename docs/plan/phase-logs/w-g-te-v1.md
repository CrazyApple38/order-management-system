# W-G Test Execution (TE) v1

検証日: 2026-04-20

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | Light `:root` 29変数の本文参照 | PARTIAL（`--md-gc-bg-*` 3変数と `--shadow-medium` は本文参照ゼロ。後方運用のため温存） |
| T2 | Dark オーバーライドが Light 対応を持つ | PASS（Light 側は co-tokens alias 経由で解決） |
| T3 | 未定義 `var()` 参照の検出 | PASS（`--accent-bg / --error-dim / --error-text` は fallback 付きで影響なし） |
| T4 | hard-coded HEX の色値 | PASS（accent `#44A6B5` / coastal `#004554` / divider `#B2D5E2` の rgba 式中のみ。値自体は co-tokens と同値） |
| T5 | JS class 参照 270件が CSS で有効 | PASS（7件のうち 3件は suffix concat 前の prefix、4件は親スタイル継承の命名目印） |
| T6 | 完了度サマリ算出 | PASS（下記） |

## 未使用変数

- `--md-gc-bg-touo / --md-gc-bg-nikkei / --md-gc-bg-zennihon` (Light/Dark 両方)
- `--shadow-medium`（Light/Dark 両方、現状 `--shadow-strong` のみ使用）

→ WS 内で表示用途の CSS ルールが未実装のため参照ゼロ。将来の GC 背景色分け用に温存する（ガバナンス方針に沿ってコメント付き残留）。

## 未定義変数参照（全て fallback 付き）

| 変数名 | 参照箇所 | fallback | 備考 |
|--------|----------|----------|------|
| `--error-text` | L3329 | `#B03A2E` | 定義追加余地あり |
| `--accent-bg` | L1718, L1804 | `rgba(0,120,212,0.06)` | 未使用代替の文化遺産、fallback で機能 |
| `--error-dim` | L640 | `rgba(220,38,38,0.1)` | 同上 |

## WS 新DS移行完了度

| 項目 | 完了度 |
|------|-------:|
| Light `:root` トークン化 | 100%（WS固有以外は全て co-tokens 経由） |
| Dark `:root` トークン化 | 100%（Dark は意図的に全 override 維持） |
| `:root` 削減率 | 61%（74 → 29） |
| co-* 共通CSS 参照 | 6/6（tokens/forms/buttons/modal/badges/navbar） |
| モーダル alias | 100%（`.md-ws-modal-*` が `.modal-*` と視覚等価） |
| フォーム alias | 100%（hover/placeholder/transition 追加） |
| バッジ alias | 90%（`.md-ws-emp-tag` トークン化、site-chip は意味論的に独自） |
| a11y focus-visible | 100%（主要操作要素全て） |
| reduced-motion | 100% |
| 印刷対応 | 100% |
| Dark WCAG AA | 100%（全テキスト・accent AA 以上、大半 AAA） |
| Row-height DS 整合 | 100%（40px → 36px） |
| JS 互換性 | 100%（class 名変更ゼロ、機能破壊ゼロ） |

**総合完了度: 96%**

## 重大Claim

- なし
