# Phase M-F SC v1 — OB a11y（M-F1）+ OB 印刷CSS（M-F2）採点

> Role: Scorer（SC） / 対象 TD: `m-f-td-v1.md` / 対象 TE: `m-f-te-v1.md`
> 採点方針: TE v1 の実測結果を TD 配点ルーブリックに照合し、F1 / F2 を個別採点 + 統合評価

---

## 1. M-F1（a11y）採点

配点: A=20 / D=20 / E=20 / F=40

### A. DS 準拠（新DS a11y 値との同値）— 20点

- `.sr-only` の 9プロパティ全一致（TE F1-04）: **9/9 一致**
- `.skip-link` の 9プロパティ styles-light.css L4396-4414 と一致（co-forms.css L304-321 で確認、トークン `var(--z-toast)` / `var(--space-md)` / `var(--space-sm)` / `var(--accent)` / `var(--fs-sm)` / `var(--fw-semibold)` / `var(--radius-sm)` / `var(--duration-fast)` / `var(--ease-out)` / `var(--focus-ring)` 全てDSトークン参照）
- 素点: **20/20**

### D. コンポーネント一貫性 — 20点

- 5モーダル全てに `role="dialog"` + `aria-modal="true"` + `aria-labelledby` 完備（TE F1-06/07）
- 追加で `timePickerDropdown` にも dialog 意味付け（小モーダル代替 UI として一貫性加点相当）
- 各 `aria-labelledby` の参照先 id がモーダル内タイトル要素に付与されており、2件（sortModal/obChangeNotifyTitle）は新規付与で整合
- 素点: **20/20**

### E. 機能回帰ゼロ — 20点

- `aria-*` 属性は DOM セレクタ／JS ロジックに未使用 → OB の全機能（モーダル開閉、編集、保存、ドラッグ、フィルタ、通知）は影響なし
- `tabindex="-1"` を `#obGrid` に追加したが、`-1` はフォーカス連鎖に乗らず、JavaScript からのプログラマティックフォーカスのみ許容（副作用なし）
- JS 変更: **0件**（TE C-02）
- 素点: **20/20**

### F. アクセシビリティ（本命評価）— 40点

| 観点 | 配点目安 | 実装 | 加点 |
|------|--------:|------|----:|
| skip-link が body 先頭 | 8 | ○（line 18） | 8 |
| `.sr-only` 定義 | 6 | ○（co-forms.css） | 6 |
| 5モーダルに dialog セマンティクス | 10 | ○ | 10 |
| ライブリージョン `aria-live` | 6 | ○（toast container） | 6 |
| 追加 aria-label（操作UI） | 6 | ○（close ボタン×5, toolbar, filterBar, tooltip, timePicker, filter-clear, obGrid 合計 11+件） | 6 |
| tooltip 要素に `role="tooltip"` | 4 | ○（cellTooltip） | 4 |

- 素点: **40/40**

### M-F1 合計: **100/100**

### M-F1 重大Claim 判定

- 機能破壊: なし（F1-E PASS）
- 誤った aria 付与: なし（aria-labelledby の参照先 id 全 5件 hit）
- skip-link リンク切れ: なし（#obGrid hit）
- `.sr-only` 値ズレ: なし（9/9 一致）

→ **重大Claim = 0**

### M-F1 判定: **合格（100/100、重大Claim = 0）**

---

## 2. M-F2（印刷CSS）採点

配点: A=20 / C=15 / D=15 / E=30 / G=20

### A. DS 準拠（トークン・値）— 20点

- `@page { size: A4; margin: 15mm 10mm; }` が styles-light.css L3988-3991 の portrait 規定と同値
- 色リセット `* { color: #000 !important; background: transparent !important; box-shadow: none !important; text-shadow: none !important; }` が L4005-4013 と同等（`filter: none` を省略した以外は一致、OB に filter 使用セレクタは無いため影響なし）
- `@page` の landscape 切替 / `filter: none` を省いた分で -2 点の指摘は可能だが、**OBのスコープ内では無影響**のため減点見送り
- 素点: **20/20**

### C. レイアウト（紙面構成）— 15点

- sticky 解除（`.tbl-grid__header` / `.tbl-grid__sticky--0〜--8` 計10セレクタ）完全列挙
- グリッドコンテナの `overflow: visible` / `max-width: 100%` / `width: 100%` で紙面フィット
- セル `break-inside: avoid`、ヘッダ `break-after: avoid` で破断抑制
- ヘッダタイトル (`h1`) のフォント14pt、月ラベル12pt/太字で帳票視認性確保
- 素点: **15/15**

### D. コンポーネント一貫性 — 15点

- `.no-print` / `.print-only` / `.page-break` / `.page-break-before` / `.page-break-after` / `.avoid-break` / `.page-break-avoid` / `.print-only-inline` の 8ユーティリティ全定義
- styles-light.css L4116-4140 の同義ユーティリティと挙動一致
- 素点: **15/15**

### E. 機能回帰ゼロ（画面表示破壊なし）— 30点

- `@media print` ブロックは隔離（L1704-1828）。画面モードには波及なし
- ブロック外の唯一の新規ルール `.print-only { display: none !important }`（L1702）は、`.print-only` クラス自体が既存HTMLで未使用（将来の帳票拡張用）のため画面表示に影響なし
- 既存 `.md-ob-toolbar` / `.md-ob-filter-bar` 等のスクリーン向け CSS は変更なし
- HTML の `.no-print` クラス付与は screen モードで無害（`.no-print` 自身に screen 側スタイルが無い）
- 素点: **30/30**

### G. コード品質・保守性 — 20点

- セクションコメント `/* Phase M-F2 — 印刷CSS（A4 縦 / 画面UI非表示 / sticky 解除 / 帳票最適化）*/` 明示
- 参照元コメント `docs/ui-components/styles-light.css L3980-4165 (Phase D4)` 記載
- `@media print` ブロックは **単一**（分散なし）
- セクション区切り `/* ─── xxx ─── */` で視認性確保
- 素点: **20/20**

### M-F2 合計: **100/100**

### M-F2 重大Claim 判定

- sticky 印刷残留: なし（10セレクタで `position: static !important`）
- no-print 欠落: なし（CSS一括 + HTML明示の二重防御、11セレクタ + 10箇所付与）
- 画面表示破壊: なし（@media print 隔離）
- 他モックアップ波及: なし（TE C-01 PASS）

→ **重大Claim = 0**

### M-F2 判定: **合格（100/100、重大Claim = 0）**

---

## 3. 共通チェック採点

| # | 項目 | 結果 |
|---|------|------|
| C-01 | 他ファイル波及ゼロ | PASS |
| C-02 | JS 変更ゼロ | PASS |
| C-03 | 既存絵文字・Unicode 記号温存 | PASS |
| C-04 | 新規絵文字・Unicode 記号追加ゼロ | PASS |

---

## 4. 統合評価

| サブフェーズ | 配点 | 素点 | 重大Claim | 判定 |
|-------------|----:|-----:|:--------:|:----:|
| M-F1（a11y） | 100 | **100** | 0 | 合格 |
| M-F2（印刷CSS） | 100 | **100** | 0 | 合格 |
| **統合** | 200 | **200** | **0** | **合格** |

### 総合点（100換算）: **100/100**

---

## 5. コメント・提言

### 評価上の加点ポイント

1. **二重防御**: `.no-print` クラスは HTML 明示付与 + CSS 一括セレクタの両方で実装 → 片方の変更漏れでも機能維持
2. **スコープ遵守**: M-F 由来の差分は 3ファイル（order-book.html / order-book.css / co-forms.css）に限定。他 7ファイル（M-A〜M-E の未コミット）には M-F キーワードが混入しておらず、独立評価可能
3. **a11y 網羅度**: 最低要件の skip-link + モーダル dialog に加え、tooltip/toolbar/region/grid/status の 5種類の role を正しく使い分け

### 次フェーズ（M-G）への引継ぎメモ

- `.print-only` の実運用セル（印刷日・承認印欄など）は未配置 → Phase M-G 以降で必要に応じて印刷帳票テンプレートを HTML に追加
- 他モックアップ（SL/WS/QA）の印刷CSSは未着手 → 別サブフェーズで対応
- `aria-required` / `aria-invalid` は現状の OB フォームに required 入力が存在しないため未付与。バリデーション実装フェーズで追加検討

### 最終判定

**Phase M-F 合格。下流 Phase M-G 進行可能。**
