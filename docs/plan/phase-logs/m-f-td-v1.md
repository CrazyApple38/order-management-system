# Phase M-F TD v1 — OB a11y（M-F1）+ OB 印刷CSS（M-F2）

> Role: Test Designer（TD） / Target: Sub-Phase **M-F1 + M-F2**（統合 TD）
> Scope:
> - HTML: `docs/order-book.html`
> - CSS: `docs/mockup/order-book.css`
> - CSS（共有ユーティリティ、必要時のみ追加）: `docs/mockup/co-forms.css`
> - JS: 変更なし
> Upstream: Phase M0 / M-A / M-B / M-C / M-D / M-E 完了
> Downstream: Phase M-G（旧エイリアス最終削除）
> New DS Reference:
> - a11y: `docs/ui-components/styles-light.css` L4316-4414（Phase D7 `.sr-only` / D9 `.skip-link`）
> - 印刷: `docs/ui-components/styles-light.css` L3980-4165（Phase D4 `@media print` / `.no-print` / `.print-only` / `.page-break` / `.avoid-break`）

---

## 1. 目的

### 1.1 M-F1: a11y（アクセシビリティ）

受注簿（OB）画面の「モーダル」「フォーム」「テーブルヘッダ」「ライブリージョン」に **WAI-ARIA 属性**を追加し、新DS Phase D9 の a11y 方針に揃える。具体的には:

- **モーダル**（`.modal-overlay` / `.md-cn-modal`）: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`（タイトル）
- **フォーム**: `<input required>` には `aria-required="true"`、エラー表示時の対応に `aria-invalid` 属性を付けられる状態にする
- **テーブルヘッダ**: `tbl-grid__cell.tbl-grid__header` は `role="columnheader"` の意味を持つ（非 `<table>` 要素のため明示）
- **ライブリージョン**: `#obCnToastContainer` に `aria-live="polite"` を付与（変更通知トーストの内容がスクリーンリーダーで読み上げられる）
- **スキップリンク**: `body` 先頭に `<a class="skip-link" href="#obGrid">メインコンテンツへスキップ</a>` を追加
- **sr-only**: 視覚には出さずスクリーンリーダーでのみ読む補足テキストが使えるよう、`.sr-only` クラスを共有CSSに確保

### 1.2 M-F2: 印刷CSS

OB 画面を A4 で印刷した際に、**業務帳票として実用できる**レベルのレイアウトに整える:

- **ヘッダ／ツールバー／フィルタ行／モーダル／ツールチップ／時刻ピッカー／トースト／通知バッジ等の「画面専用UI」を `.no-print` で一括非表示**
- **グリッドの sticky 解除**（`.tbl-grid__cell.tbl-grid__header` の `position: sticky` / `.tbl-grid__sticky--*` の左固定など、印刷では意味が無く紙面を崩す）
- **sticky 行背景の白化**（sticky 列は `background: var(--base-grid)` を持つが、印刷で transparent 化してトナー節約）
- **セル明滅アニメの無効化**（印刷時は `animation: none`）
- **月ラベル・会社名などは `.print-only` 経由で帳票用ヘッダに代替表示できる余地を残す**（今回は最小限で OK）
- **ページブレイク制御**: グリッドが複数ページに跨る際、行内での破断を避ける（`break-inside: avoid`）

---

## 2. 採用方針

### 2.1 M-F1（a11y）

**案B: 最小 ARIA 追加 + `.sr-only` / `.skip-link` を co-forms.css に集約**を採用。

| 観点 | 案A 新規 co-a11y.css | **案B co-forms.css 追記（採用）** | 案C 全クラスに aria |
|------|-------|-------|-------|
| 追加ファイル | 1（新規） | 0 | 0 |
| CSS 記述規模 | 中 | 小（20行程度） | 小（変更なし） |
| `<link>` 追加 | 必要 | 不要 | 不要 |
| DS 準拠（値） | ○ | ○ | × |
| スコープ | M-F1 範囲内 | M-F1 範囲内 | 広い |

採用理由:
- `.sr-only` / `.skip-link` は全モックアップ共通で使える汎用ユーティリティ → `co-forms.css` に追記するのが自然（co-buttons や co-modal では責務が合わない）
- 新規 CSS ファイルを増やすと OB 以外の mockup HTML にも `<link>` を足す波及が出る（M-F1 スコープ外）
- a11y 属性の付与は HTML のみに閉じ、JS/動的生成コードを触らない

### 2.2 M-F2（印刷CSS）

**案B: `order-book.css` 末尾に `@media print` セクション追記**を採用。

| 観点 | 案A 新規 co-print.css | **案B order-book.css 追記（採用）** | 案C styles-light.css を link |
|------|-------|-------|-------|
| 追加ファイル | 1（新規） | 0 | — |
| `<link>` 追加 | 必要（他モックアップに波及リスク） | 不要 | 大（styles-light.css は UI集本体、mockup では読まない） |
| OB 固有セレクタ対応 | CSS 分離で可 | ○（OB 固有の `.md-ob-*` / `.tbl-grid__*` を直接扱える） | × |
| スコープ | M-F2 範囲 | **M-F2 範囲**（OB のみ） | 過大 |
| DS 準拠（値） | styles-light.css 値を転記 | **styles-light.css L3980-4165 値をOB 固有クラスに拡張して転記** | ○ |

採用理由:
- OB の印刷は「グリッドスティッキー列の解除」「`.md-ob-*` UI 群の一括非表示」が肝で、**OB 固有セレクタが必須** → `order-book.css` に書くのが最短
- 他モックアップ（WS/QA/SL）には現時点で印刷要件が未定義 → 新規 CSS ファイルで共有するのは時期尚早（M-G 以降で集約検討）

---

## 3. 配点

### 3.1 M-F1（a11y）配点: A=20 / D=20 / E=20 / F=40（合計 100）

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| DS準拠（新DS a11y 値との同値） | A | **20** | `.sr-only` の9プロパティ (position/width/height/padding/margin/overflow/clip/white-space/border) が styles-light.css L4318-4328 と完全一致。`.skip-link` の9プロパティが L4396-4414 と完全一致 |
| コンポーネント一貫性 | D | **20** | モーダル（editModal / rowEditModal / sortModal / calendarModal / obChangeNotifyModal）の5つ全てに `role="dialog"` + `aria-modal="true"` + `aria-labelledby` が付与。タイトル要素に id があることを確認 |
| 機能回帰ゼロ | E | **20** | OB の全操作（モーダル開閉、保存、編集、ドラッグ、検索、フィルタ、通知トグル）が動作。aria 属性は DOM 参照や CSS セレクタに使われていないため機能に影響しない |
| a11y（本命評価） | F | **40** | (1) skip-link が body 先頭 / (2) `.sr-only` クラスが共有CSSに定義 / (3) モーダル 5つに dialog セマンティクス / (4) フィルタ列（`required` 無し → aria-required は不要）・編集モーダル入力に aria-required 候補識別（対応入力が無ければ配点満） / (5) ライブリージョン `#obCnToastContainer` に `aria-live` |

### 3.2 M-F2（印刷CSS）配点: A=20 / C=15 / D=15 / E=30 / G=20（合計 100）

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| DS準拠（トークン・値） | A | **20** | `@page { size: A4; margin: 15mm 10mm }` が styles-light.css L3988-3991 と同値。色リセット `* { color:#000; background:transparent; box-shadow:none }` が L4005-4013 と同等 |
| レイアウト（紙面構成） | C | **15** | h1/h2/h3 の font-size 指定、tbl 系セル border 指定、thead 継続（`display: table-header-group`）、行 `break-inside: avoid` が揃う |
| コンポーネント一貫性 | D | **15** | `.no-print` / `.print-only` / `.page-break` / `.avoid-break` 計 4ユーティリティが OB CSS でも使える（`display:none` / `display:block` / `break-before:always` / `break-inside:avoid`） |
| 機能回帰ゼロ（画面表示破壊なし） | E | **30** | 画面表示時（非印刷）のレイアウトが変わらない。sticky も効く。`.no-print` / `.print-only` クラス付与が既存スタイルを上書きしない（`.print-only { display: none !important }` が screen モードでは .md-ob-* を巻き込まない） |
| コード品質 | G | **20** | セクションコメント `/* Phase M-F2 — 印刷CSS */` 明示、`@media print` ブロックが 単一（複数に分散しない）、OB 固有 sticky 解除セレクタが過不足なく列挙 |

---

## 4. 重大Claim（Critical）— 1件でも該当 → 不合格

### 4.1 M-F1（a11y）共通

- **機能破壊**: OB の操作（モーダル開閉、編集、保存、ドラッグ、フィルタ、通知）のいずれかが動作停止
- **誤った aria 付与**: `role="dialog"` を `aria-modal` なしで付与（WAI-ARIA 仕様逸脱）、`aria-labelledby` の参照先 id が存在しない、`aria-live` を動的要素以外に誤付与
- **skip-link のリンク切れ**: `href` の target id が DOM に存在しない（存在するのは `#obGrid` のみ）
- **`.sr-only` の値ズレ**: styles-light.css L4318-4328 と **1 プロパティでも値不一致**（position / width / height / padding / margin / overflow / clip / white-space / border）

### 4.2 M-F2（印刷CSS）共通

- **sticky 印刷残留**: `.tbl-grid__cell.tbl-grid__header` の `position: sticky` や `.tbl-grid__sticky--*` の `left` が印刷で effective（position:static への上書きなし）
- **no-print 欠落**: toolbar / filter-bar / modal / tooltip / time-picker / toast-container / month-nav のいずれかが印刷で残留
- **画面表示破壊**: `@media print` 外で `display:none` や `visibility:hidden` を誤混入、または既存 `.md-ob-toolbar` / `.md-ob-filter-bar` の display 値を screen で壊している
- **他モックアップ波及**: OB 以外の CSS/HTML（screen-layout / weekly-schedule / quick-access / co-*.css のうち co-forms.css 以外）に diff

### 4.3 共通

- **新規記号混入**: 絵文字・Unicode 新記号（既存の `✕ / ☰ / ▼ / ▲ / ◀ / ▶ / ↩ / ↪ / ⚠` は温存）
- **アイコン運用ルール違反**: 既存に無い絵文字を本文に混入

---

## 5. テスト項目（チェックリスト）

### M-F1 a11y 系（10項目）

| # | 項目 | 検証方法 |
|---|------|----------|
| F1-01 | `body` 先頭に `<a class="skip-link" href="#obGrid">...</a>` が存在 | grep `class="skip-link"` in `order-book.html` → 1件 |
| F1-02 | skip-link の href target id が DOM に存在 | grep `id="obGrid"` → 存在 |
| F1-03 | `.sr-only` が `co-forms.css` または他 co-*.css に定義 | grep `.sr-only` in `docs/mockup/co-*.css` → 定義行 |
| F1-04 | `.sr-only` の値が styles-light.css L4318-4328 と同値 | 9プロパティ (position/width/height/padding/margin/overflow/clip/white-space/border) 完全一致 |
| F1-05 | `.skip-link` が `co-forms.css` または他 co-*.css に定義 | grep `.skip-link` in `docs/mockup/co-*.css` → 定義行 |
| F1-06 | 5つのモーダル（editModal/rowEditModal/sortModal/calendarModal/obChangeNotifyModal）に `role="dialog"` + `aria-modal="true"` + `aria-labelledby="..."` | grep で 5件×3属性を確認 |
| F1-07 | 各 `aria-labelledby` の id がモーダル内タイトル要素に付与されている | 各 id を grep で検索 → hit |
| F1-08 | `#obCnToastContainer` に `aria-live="polite"` + `aria-atomic="true"` | grep で確認 |
| F1-09 | `#editModalOverlay` 等の隠蔽 (`style="display:none;"`) と併用しても ARIA 属性が矛盾しない（`aria-hidden` は display:none の要素には付けない方針で、役割は dialog のまま） | 目視 |
| F1-10 | aria-* 属性が 合計 **15件以上** 追加（5モーダル × 3属性 = 15 + live-region 2 = 17 最低） | grep `aria-` → count ≥ 15 |

### M-F2 印刷CSS 系（11項目）

| # | 項目 | 検証方法 |
|---|------|----------|
| F2-01 | `order-book.css` に `@media print {` ブロックが存在 | grep `@media\s+print` → 1件以上 |
| F2-02 | `.no-print { display: none !important }` が print モード内に定義 | grep 内容 |
| F2-03 | `.print-only` が screen モードで `display: none`、print モードで `display: block` | 2定義を確認 |
| F2-04 | `.page-break` / `.page-break-after` / `.avoid-break` が定義 | grep |
| F2-05 | `.md-ob-toolbar` / `.md-ob-filter-bar` / `.md-ob-tooltip` / `.md-ob-time-dropdown` / `.md-ob-month-nav` / `.modal-overlay` / `.md-cn-modal` / `#obCnToastContainer` が print で `display: none !important` に設定される | 明示セレクタまたは `.no-print` クラス付与 |
| F2-06 | HTML の `.md-ob-toolbar` / `.md-ob-filter-bar` / `.md-ob-tooltip` / `.md-ob-time-dropdown` / `.md-ob-month-nav` / `#obCnToastContainer` 等に `.no-print` クラスが付与されている（もしくは CSS 側で一括非表示セレクタで吸収） | grep で `class=` に `no-print` が付いている箇所を確認 |
| F2-07 | 印刷時 `.tbl-grid__cell.tbl-grid__header { position: static !important }` で sticky 解除 | print ブロック内確認 |
| F2-08 | 印刷時 `.tbl-grid__sticky--0` … `.tbl-grid__sticky--8` の position/left を解除 | セレクタ存在確認 |
| F2-09 | 印刷時 `*, *::before, *::after { color:#000 !important; background:transparent !important; box-shadow:none !important }` が入る | 値一致 |
| F2-10 | `md-cn-cell-glow-*` / `md-cn-flash-*` 系アニメが印刷で `animation: none` | 確認 |
| F2-11 | 画面表示（非印刷）では既存スタイルが変更なし（`@media print` 外では既存 CSS と同値） | diff 確認（@media print ブロック追加のみ、それ以外のセレクタ書き換えなし） |

### 共通（4項目）

| # | 項目 | 検証方法 |
|---|------|----------|
| C-01 | 他ファイル波及ゼロ: `docs/screen-layout.html` / `docs/mockup/screen-layout.css` / `docs/mockup/weekly-schedule.*` / `docs/mockup/quick-access.*` / `docs/mockup/co-tokens.css` / `docs/mockup/co-buttons.css` / `docs/mockup/co-modal.css` / `docs/mockup/co-navbar.css` / `docs/mockup/co-shared-badges.css` / `docs/ui-components/*` に diff 無し | git diff で波及ファイル確認 |
| C-02 | JS 変更ゼロ: `docs/mockup/order-book.js` に diff 無し | git diff |
| C-03 | 既存絵文字・Unicode 記号が温存（`✕` / `☰` / `▼` / `▲` / `◀` / `▶` / `↩` / `↪` / `⚠` / `＋` / `◎` 等） | grep |
| C-04 | 新規絵文字・Unicode 記号の追加ゼロ | grep 差分確認 |

---

## 6. 合格条件

**M-F1 合格**: F1 配点総合 ≥ 70/100 かつ M-F1 重大Claim = 0
**M-F2 合格**: F2 配点総合 ≥ 70/100 かつ M-F2 重大Claim = 0
**M-F 統合合格**: 両サブフェーズ合格 かつ 共通 Claim (C-01〜C-04) = 0

---

## 7. 実装マッピング

### 7.1 M-F1 IM 指針

#### (a) `docs/mockup/co-forms.css` 末尾に a11y ユーティリティ追加

```css
/* ============================================================================
   Phase M-F1 — アクセシビリティ・ユーティリティ
   参照元: docs/ui-components/styles-light.css L4316-4414 (Phase D7 / D9)
   ============================================================================ */

/* スクリーンリーダー専用（視覚非表示） */
.sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}

/* スキップリンク */
.skip-link {
    position: absolute;
    top: -40px;
    left: var(--space-md);
    z-index: var(--z-toast);
    padding: var(--space-sm) var(--space-md);
    background: var(--accent);
    color: #fff;
    font-size: var(--fs-sm);
    font-weight: var(--fw-semibold);
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: top var(--duration-fast) var(--ease-out);
}
.skip-link:focus {
    top: var(--space-md);
    outline: none;
    box-shadow: var(--focus-ring);
}
```

#### (b) `docs/order-book.html` に aria 属性追加

- body 先頭に `<a class="skip-link" href="#obGrid">メインコンテンツへスキップ</a>`
- `#obGrid` ラッパ（`<div class="tbl-grid" id="obGrid">`）→ `tabindex="-1"` 付与でフォーカス受け可能に
- 5モーダル: `role="dialog"` + `aria-modal="true"` + `aria-labelledby="<title-id>"` + `aria-hidden` は付けない（display:none 制御で代替）
  - editModal → タイトル `#editModalTitle`
  - rowEditModal → タイトル `#rowEditModalTitle`
  - sortModal → 新規タイトル id `#sortModalTitle`
  - calendarModal → タイトル `#calendarModalTitle`
  - obChangeNotifyModal → 新規タイトル id `#obChangeNotifyTitle`
- `#obCnToastContainer` → `aria-live="polite"` + `aria-atomic="true"` + `role="status"`
- `#cellTooltip` → `role="tooltip"` + `aria-hidden="true"`（display制御で代替）
- フィルタクリアボタン `.md-ob-filter-clear` → `aria-label="フィルタをクリア"`（既存テキスト `✕ クリア` で補足）
- 時刻ピッカー `#timePickerDropdown` → `role="dialog"` + `aria-label="時刻を選択"`

### 7.2 M-F2 IM 指針

#### (a) `docs/mockup/order-book.css` 末尾に印刷CSS追加（1ブロック）

```css
/* ============================================================================
   Phase M-F2 — 印刷CSS
   参照元: docs/ui-components/styles-light.css L3980-4165 (Phase D4)
   ============================================================================ */

/* 画面モードで print-only を非表示 */
.print-only { display: none !important; }

@media print {
    /* ページ設定 */
    @page { size: A4; margin: 15mm 10mm; }

    /* カラー・影・背景のリセット */
    *, *::before, *::after {
        color: #000 !important;
        background: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
    }

    html, body {
        display: block !important;
        width: 100% !important;
        min-height: 0 !important;
        overflow: visible !important;
        font-size: 10pt;
        line-height: var(--lh-base);
        background: #fff !important;
    }

    /* 画面専用UIの一括非表示 */
    .no-print,
    .md-ob-toolbar,
    .md-ob-filter-bar,
    .md-ob-tooltip,
    .md-ob-time-dropdown,
    .md-ob-month-nav,
    .modal-overlay,
    #obChangeNotifyModal,
    #obCnToastContainer,
    .skip-link,
    button:not(.print-include) {
        display: none !important;
    }

    /* ヘッダ（月ラベル・タイトル）は印刷 */
    .md-ob-header {
        display: flex !important;
        border-bottom: 1px solid #000 !important;
        padding-bottom: 4pt !important;
        margin-bottom: 8pt !important;
    }
    .md-ob-header h1 { font-size: 14pt !important; }
    .md-ob-today-label { font-size: 10pt !important; }

    /* グリッドの sticky 解除（印刷では無意味、紙面を崩す） */
    .tbl-grid__cell.tbl-grid__header,
    .tbl-grid__sticky--0,
    .tbl-grid__sticky--1,
    .tbl-grid__sticky--2,
    .tbl-grid__sticky--3,
    .tbl-grid__sticky--4,
    .tbl-grid__sticky--5,
    .tbl-grid__sticky--6,
    .tbl-grid__sticky--7,
    .tbl-grid__sticky--8 {
        position: static !important;
        left: auto !important;
    }

    /* グリッドコンテナを紙面幅いっぱいに、オーバーフローも解除 */
    .tbl-grid__wrapper,
    .tbl-grid__scroll {
        overflow: visible !important;
        max-width: 100% !important;
        width: 100% !important;
    }

    /* セル内で行の破断を避ける */
    .tbl-grid__cell {
        break-inside: avoid;
        page-break-inside: avoid;
    }

    /* ヘッダを各ページに継続（CSS Grid のため table-header-group は効かないが、
       break-after:avoid で見出し直後の破断は抑制） */
    .tbl-grid__header {
        break-after: avoid;
        page-break-after: avoid;
    }

    /* 通知フラッシュ・セル明滅アニメを停止 */
    [class*="md-cn-cell-glow-"],
    [class*="md-cn-flash-"] {
        animation: none !important;
    }

    /* ページブレイク・ユーティリティ */
    .page-break,
    .page-break-before {
        page-break-before: always;
        break-before: page;
    }
    .page-break-after {
        page-break-after: always;
        break-after: page;
    }
    .avoid-break,
    .page-break-avoid {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    /* print-only を表示 */
    .print-only { display: block !important; }
    span.print-only,
    .print-only-inline { display: inline !important; }
}
```

#### (b) HTML 側での `.no-print` クラス付与

- `<header class="md-ob-header">` → タイトルは **印刷したい** ので付けない。代わりに `.md-ob-header-right` の通知ベル（非表示バッジ） → そのまま
- `<div class="md-ob-toolbar">` → `.no-print` 付与（CSS一括でも吸収するが HTML 側にも明示してガバナンスを可視化）
- `<div class="md-ob-filter-bar">` → `.no-print` 付与
- `<div class="md-ob-tooltip">` → `.no-print` 付与
- `<div class="md-ob-time-dropdown">` → `.no-print` 付与
- 各 `.modal-overlay` → `.no-print` 付与
- `#obCnToastContainer` → `.no-print` 付与
- `#obChangeNotifyModal` → `.no-print` 付与

### 7.3 不触ファイル

- `docs/mockup/order-book.js`（変更なし）
- `docs/mockup/screen-layout.*` / `docs/mockup/weekly-schedule.*` / `docs/mockup/quick-access.*`
- `docs/mockup/co-tokens.css` / `co-buttons.css` / `co-modal.css` / `co-navbar.css` / `co-shared-badges.css`
- `docs/ui-components/*`

---

## 8. Test Executor 向け運用

1. 本ドキュメント §5 のチェックリスト全 25 項目を順に実施（F1=10, F2=11, C=4）
2. grep カウントは Grep ツール `output_mode:"count"` で取得
3. 印刷レイアウトの機能確認は、印刷プレビュー相当として `@media print` ブロック内の CSS セレクタを grep で検証すれば可
4. 結果は `docs/plan/phase-logs/m-f-te-v1.md` に保存

---

## 9. SC 向け運用

1. TE v1 レポートを読み、F1 配点 A=20/D=20/E=20/F=40 と F2 配点 A=20/C=15/D=15/E=30/G=20 で個別採点 + 統合評価
2. 重大Claim 発生時は総合点を付けた上で「重大Claim: 不合格」と明記
3. 結果は `docs/plan/phase-logs/m-f-sc-v1.md` に保存
