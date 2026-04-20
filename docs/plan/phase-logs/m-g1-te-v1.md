# M-G1 Test Execution (TE) v1

サブフェーズ: **M-G1 — OB スコープにおける旧クラス・旧変数エイリアスの最終検証**

実施者: Tester (TE)
実施日: 2026-04-20
対象 TD: `m-g1-td-v1.md`
対象 IM: `docs/mockup/order-book.css`（3件の `var(--accent)` → `var(--accent-primary)` 置換のみ）

---

## 1. 実行環境

- OS: Windows 11 Pro
- 作業ディレクトリ: `C:/xampp/htdocs/order-management-system`
- 計測ツール: Grep（ripgrep）
- Git HEAD: `33183fd refactor(ds-migration): Phase M-A2/M-A3 OB本文を新DS変数名へ + フォント棚卸`（M-G1 開始時点）

---

## 2. チェック結果一覧

### A. DS 準拠（旧変数参照の駆逐）

| # | テスト | 結果 | 実測値 |
|---|--------|------|-------|
| T1 | `var(--base-page)` / `var(--base-surface)` / `var(--base-surface-alt)` / `var(--base-muted)` in OB CSS | **PASS** | 0件 |
| T2 | `var(--sub-primary)` / `var(--sub-secondary)` in OB CSS | **PASS** | 0件 |
| T3 | `var(--accent-light)` / `var(--accent-dim)` in OB CSS | **PASS** | 0件 |
| T4 | `var(--accent)` 単独 in OB CSS | **PASS** | 0件（IM で 3件を `var(--accent-primary)` に置換） |
| T5 | `var(--error)` / `var(--success)` / `var(--success-text)` / `var(--warning)` / `var(--warning-bg)` in OB CSS | **PASS** | 0件 |
| T6 | `var(--shadow-sm/md/lg/medium/strong)` in OB CSS | **PASS** | 0件 |

**A 合計: 6/6 PASS**

### D. 移行対象クラスの残存検証

| # | テスト | 結果 | 実測値 |
|---|--------|------|-------|
| T7 | `md-ob-btn` in order-book.html | **PASS** | 0件 |
| T8 | `md-ob-btn` in order-book.js | **PASS** | 0件 |
| T9 | `md-ob-btn` in order-book.css | **PASS** | 0件 |
| T10 | `md-ob-modal` in order-book.html | **PASS** | 0件 |
| T11 | `md-ob-modal` in order-book.js | **PASS** | 0件 |
| T12 | `md-ob-modal` in order-book.css | **PASS** | 0件 |
| T13 | `md-ob-grid` in order-book.html | **PASS** | 0件 |
| T14 | `md-ob-grid` in order-book.js | **PASS** | 0件 |
| T15 | `md-ob-grid` in order-book.css | **PASS** | 0件 |
| T16 | `md-ob-cell` in order-book.html | **PASS** | 0件 |
| T17 | `md-ob-cell` in order-book.js | **PASS** | 0件 |
| T18 | `md-ob-cell` in order-book.css | **PASS** | 0件 |
| T19 | `md-ob-form-row` in order-book.html | **PASS** | 0件 |
| T20 | `md-ob-form-row` in order-book.js | **PASS** | 0件 |
| T21 | `md-ob-form-row` in order-book.css | **PASS** | 3件（全てコメント、L504/L706/L783 — 実定義・参照なし） |
| T22 | `md-ob-badge-` in order-book.html | **PASS**（意図的残存） | 12件（M-E1 案C'' 方針） |
| T23 | `md-ob-badge-` in order-book.js | **PASS**（意図的残存） | 32件（同上） |
| T24 | `md-ob-badge-` in order-book.css | **PASS** | 1件（L641 のコメント `/* .md-ob-badge-grandchild, gc-*, btn-add-gc → co-shared-badges.css */`） |

**D 合計: 18/18 PASS**

### E. 機能回帰ゼロ

| # | テスト | 結果 | 実測値 |
|---|--------|------|-------|
| T25 | M-G1 IM による差分が `docs/mockup/order-book.css` のみ | **PASS** | `git diff --name-only` で他ファイル差分なし（他ファイルは M-B〜M-F の未コミット差分） |
| T26 | `var(--accent)` → `var(--accent-primary)` の解決値同値 | **PASS** | 両者とも `#44A6B5`（co-tokens.css L205 `--accent: var(--accent-primary);` により legacy alias も同値） |
| T27 | OB の主要インタラクション動作 | **PASS**（静的検証） | CSS 変数置換のみで、JS セレクタ・クラス名・DOM 構造は一切変更なし → 機能への影響ゼロを静的検証で担保 |

**E 合計: 3/3 PASS**

### G. コード品質・保守性

| # | テスト | 結果 | 実測値 |
|---|--------|------|-------|
| T28 | OB CSS 内に移行対象クラスの CSS 定義 0件（コメント除外） | **PASS** | `.md-ob-btn*` / `.md-ob-modal*` / `.md-ob-grid*` / `.md-ob-cell*` / `.md-ob-form-row*` / `.md-ob-badge-*` の実定義 0件 |
| T29 | co-tokens.css legacy aliases セクション差分ゼロ | **PASS** | `git diff docs/mockup/co-tokens.css` 空 |
| T30 | 変更禁止ファイル差分ゼロ | **PASS** | co-forms.css / co-buttons.css / co-shared-badges.css / co-modal.css / co-navbar.css / co-navbar.js / weekly-schedule.css / weekly-schedule.js / quick-access.css / quick-access.js / screen-layout.css / screen-layout.js / 全 HTML / order-book.js に M-G1 由来の差分なし（他ファイルの既存 M-B〜M-F 差分は M-G1 スコープ外で前フェーズの未コミット分） |

**G 合計: 3/3 PASS**

---

## 3. 重大Claim 判定

| # | Claim | 結果 |
|---|-------|------|
| C1 | 移行対象の旧クラスが OB HTML/JS/CSS の実コードに残存 | **未検出**（`.md-ob-badge-*` は M-E1 案C'' の意図的残存） |
| C2 | M-A2 で定めた旧変数参照が残存 | **未検出**（`var(--accent)` 3件は IM で修正） |
| C3 | co-tokens.css legacy aliases を誤削除・改変 | **未検出** |
| C4 | 変更禁止ファイルに差分発生 | **未検出** |
| C5 | OB の機能破壊 | **未検出** |
| C6 | `.md-ob-badge-*` 物理リネームを M-G1 で実施（先食い） | **未検出**（件数は M-F 完了時点と同数） |

**重大Claim: 0件**

---

## 4. 付録: Grep 実行ログ

### 4.1 置換前（IM 前）

```
$ Grep "var\(--accent\)" docs/mockup/order-book.css
649:    background: rgba(68,166,181,0.15); color: var(--accent);
1026:    font-size: 12px; font-weight: 600; color: var(--accent);
1161:.md-ob-cal-badge-btn.active { background: rgba(0,0,0,0.12); border-color: var(--accent); color: var(--accent); }
```

### 4.2 置換後（IM 後）

```
$ Grep "var\(--accent\)" docs/mockup/order-book.css
(0 matches)
```

### 4.3 移行対象クラス総当たり（IM 後）

```
$ Grep "md-ob-btn|md-ob-modal|md-ob-grid|md-ob-cell|md-ob-form-row" docs/order-book.html
(0 matches)

$ Grep "md-ob-btn|md-ob-modal|md-ob-grid|md-ob-cell|md-ob-form-row" docs/mockup/order-book.js
(0 matches)

$ Grep "md-ob-btn|md-ob-modal|md-ob-grid|md-ob-cell" docs/mockup/order-book.css
(0 matches)

$ Grep "md-ob-form-row" docs/mockup/order-book.css
504:/* 編集フォーム（M-B1: .md-ob-form-row* → 新DS .md-fi-* 体系へ移行済） */
706:/* M-B1: .md-ob-form-row-half は .md-fi-row（新DS）に置換済 */
783:/* M-B1: .md-ob-form-row select の独自定義は新DS .md-fi-select に集約済 */
(3 matches — all in comments)
```

### 4.4 意図的残存の確認（IM 後、M-E1 案C'' 方針）

```
$ Grep "md-ob-badge-" docs/order-book.html
(12 matches, all runtime class usages)

$ Grep "md-ob-badge-" docs/mockup/order-book.js
(32 matches, innerHTML/querySelector/classList)

$ Grep "md-ob-badge-" docs/mockup/order-book.css
641:/* .md-ob-badge-grandchild, gc-*, btn-add-gc → co-shared-badges.css */
(1 match — comment only)
```

---

## 5. 総合結果

- **合計 PASS: 30 / 30**
- **重大Claim: 0件**
- **OB スコープでの旧クラス・旧変数最終検証: 合格ライン達成**
