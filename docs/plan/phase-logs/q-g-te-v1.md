# Q-G Test Execution (TE) v1

検証日: 2026-04-20
対象: `docs/mockup/quick-access.css` / `docs/mockup/quick-access.js` / `docs/quick-access.html`

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | 死変数 `--night-text` 削除 | PASS（QA 本文参照ゼロを grep で確認済、他ファイルへの影響なし） |
| T2 | 残る `:root` 変数 2 件（`--warning-text: #975A16` / `--warning-bg: #FEFCBF`）が通知UIの意図通り上書き | PASS（L1750 付近） |
| T3 | `var()` 参照 32 種のうち未定義なし | PASS（`accent`, `accent-dim`, `accent-light`, `accent-primary`, `base-muted`, `base-page`, `base-surface`, `base-surface-alt`, `divider`, `duration-base`, `duration-fast`, `error`, `font-family-body`, `fs-base`, `fs-caption`, `fs-sm`, `fw-bold`, `fw-semibold`, `lh-base`, `radius-lg`, `radius-md`, `radius-sm`, `space-lg`, `space-sm`, `sub-primary`, `success`, `success-text`, `text-disabled`, `text-primary`, `text-secondary`, `text-tertiary`, `warning` の全てが co-tokens.css に定義あり） |
| T4 | 本文 hard-coded HEX の妥当性 | PASS（`#44A6B5`, `#004554`, `#DB577B`, `#DECCBE`, `#856404`, `#ffc107`, `#c0392b` 等は装飾・特殊状態用、意図的） |
| T5 | JS の class 名参照（136 箇所の qa-* 参照）全て CSS で有効 | PASS |
| T6 | 新DS移行完了度の算出 | → Q-G SC に記載 |

## 死変数除去

- `--night-text: #DB577B`（QA 本文参照ゼロ、画面挙動への影響なし）

## `:root` 変数数（最終）

- Phase Q-A 開始時: 29 変数（Light 17 + 後方互換 7 + 重複 :root 5）
- Phase Q-G 完了時: **2 変数**（`--warning-text` / `--warning-bg`、値不一致で意図的に残留）
- 削減率: **93%**

## 重大Claim

- C1: なし（全 var() 解決済み）
- C2: なし（JS class 参照全て保全）
- C3: なし（QA ファイル内のみ差分）
