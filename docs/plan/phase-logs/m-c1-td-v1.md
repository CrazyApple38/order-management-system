# Phase M-C1 TD v1 — OB CSS Grid テーブル `.md-ob-grid*` → `.tbl-grid` 規約リネーム テスト設計

> Role: Test Designer（TD） / Target: Sub-Phase **M-C1**
> Scope: `docs/mockup/order-book.css` / `docs/order-book.html` / `docs/mockup/order-book.js`
> Upstream: Phase M0 + M-A + M-B 完了（コミット `da190e2`）
> Downstream: M-C2（sticky z-index → `--z-sticky`）/ M-C3（曜日色 → `data-day`）/ M-C4（zebra/total/empty → `.tbl--zebra`/`.row--total`/`.cell--empty`）/ M-C5（密度モード）

---

## 1. 目的

### 1.1 主目的（M-C1 の範囲）

1. **OB の CSS Grid 用クラス名 `.md-ob-grid*` 系を、新DS規約 `.tbl-grid` 系へ機械的にリネームする**
   - リネーム対象は「CSS Grid テーブルを構成するクラス」に限定（グリッド骨格 + セル + 凍結列 + 合計行 + ゼブラ + 曜日色 + ヘッダセル）
   - グリッド**以外**の `.md-ob-*`（例: `.md-ob-header`=ページヘッダ、`.md-ob-modal*`、`.md-ob-edit-form` 等）は**完全に対象外**
   - BEM 命名規約: `.tbl-grid`（ルート） / `.tbl-grid__scroll` / `.tbl-grid__wrapper` / `.tbl-grid__cell` / `.tbl-grid__sticky--{n}` / `.tbl-grid__header` / `.tbl-grid__date-cell` / `.tbl-grid__total-cell` / `.tbl-grid__total-row` / `.tbl-grid__even-row` / `.tbl-grid__site-entry` / `.tbl-grid__day-num` / `.tbl-grid__row-add-btn` / `.tbl-grid__cal-open-btn` / `.tbl-grid__cell-count` / `.tbl-grid__cell-subtask` / `.tbl-grid__cell-badge-text` / `.tbl-grid__grand-total` / `.tbl-grid__date-header` / `.tbl-grid__sat` / `.tbl-grid__sun` / `.tbl-grid__night` / `.tbl-grid__sat-head` / `.tbl-grid__sun-head` / `.tbl-grid__clickable`

2. **見た目・JS動作に完全に不変であることを保証する**
   - 置換箇所は CSS 定義 + HTML 静的記述 + JS テンプレート文字列 + JS `querySelector` + JS `classList.toggle` の**全箇所**で対称に行う
   - プロパティ値・セレクタの特異度・カスケード順は変更しない（純リネームのみ）

3. **名前衝突の回避**
   - `.md-ob-header` は**ページヘッダ用（L45-62）**と**グリッドヘッダセル用（L262 `.md-ob-cell.md-ob-header`）**で二重用途
   - グリッド側のみを `.tbl-grid__header` にリネームし、ページヘッダ側（`.md-ob-header / .md-ob-header-left / -right / -center`）は**完全に触らない**

### 1.2 採用案（TD 決定）

**案A: 全クラス名を `.tbl-grid*` 規約に完全リネーム（CSS / HTML / JS 全置換）** を採用。

#### 採用理由

1. **他モックアップ波及=ゼロ** — WS/QA/SL は `.md-ob-grid*` を一切参照していない（`Grep docs/ md-ob-grid` 結果: 対象ファイル3つのみ）。OB 内に完結する
2. **JS 参照は全てテンプレート文字列と単純セレクタに限定** — 47件中、`classList.add/remove/contains` による動的判定は `classList.toggle('md-ob-night', …)` の2箇所のみ（L1817, L3093）。残り45件はテンプレート文字列 (``${rowCls}`` 等) と `document.querySelectorAll('.md-ob-cell[...]')`（L3685, L3689）。全て機械的置換が可能
3. **案B（併記）の欠点**: 旧クラス `.md-ob-grid*` が CSS に残留し、M-G（最終クリーンアップ）で同じ作業を二度実施することになる（Governance 原則「段階的移行は段階ごとに完結」違反）
4. **案C（セレクタ併記）の欠点**: `.md-ob-grid, .tbl-grid { ... }` は DS 準拠が「命名規約」のみで HTML/JS側に旧名が残留。M-C2以降（sticky z-index・曜日色 data-属性化）で HTML/JS を触る必要があるため、M-C1 でリネームを完遂した方が後続が楽

#### 採用案の留意点

- CSS Grid は `<table>` でないため `.tbl-grid` は `styles-light.css` の `.tbl` 規約の「Gridベース拡張」として **新規定義**が必要。ただし **M-C1 ではクラス名のリネームだけを行い、`.tbl` 本体の共通化（色・パディング・sticky z-index）は M-C2〜M-C4 に委ねる**
- `.tbl-grid` 定義は `co-forms.css` ではなくテーブル系として**新ファイル `co-tables.css` に配置**する（Governance L144 のBEM拡張として規約化する方針に整合）。ただし M-C1 では定義移動は行わず、`order-book.css` 内で `.tbl-grid*` 名に置換するにとどめる。`co-tables.css` への分離は M-C2 or M-G で実施
- `.md-ob-conf-tentative_high/low` は「件数セルの信頼度モディファイア」であり、**.md-ob-grid の子ではない**（L588, L1031 で使用）。M-C1 スコープ外（後続フェーズで `.tbl-grid__site-entry--tentative-high` 等へ）

### 1.3 非目標（スコープ外）

- sticky 列の z-index 統合（`--z-sticky(200)` 採用）→ M-C2
- 曜日色を `data-day` 属性化 → M-C3
- `.md-ob-even-row` → `.tbl--zebra` 化 → M-C4
- 合計行を `.row--total` に統合、空セルを `.cell--empty` に統合 → M-C4
- `.md-ob-conf-tentative_*` のモディファイア命名 → M-C4
- `.md-ob-cal-info-meta`, `.md-ob-cal-meta-*`（カレンダーモーダル内）のリネーム → M-D
- `.tbl-grid` のファイル分離（`co-tables.css` 新設）→ M-G
- 共通 `.tbl-*` 規約との色・パディング・padding等の共通化 → M-C2〜M-C4
- プロパティ値の変更（現状値を完全保持）

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 30 | グリッド表示・sticky列位置・曜日色・合計行背景・ゼブラ・見出しが完全不変 |
| ブラウザ互換（Browser） | B | 10 | Chrome/Edge/Firefox で CSS Grid レイアウト・sticky が同一に動作 |
| 機能（Domain/Behavior） | D | 20 | JS でのセル生成・クリック・classList.toggle・querySelector が機能 |
| **見た目不変・置換完全性（Equivalence）** | **E** | **30** | **旧クラスが残留していない / 新クラスが期待位置に存在 / 見た目が前後で同一** |
| ガバナンス | G | 10 | 命名規約（BEM）整合・M-C2以降の前提満足・コメント更新 |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0**

---

## 3. 事前調査結果

### 3.1 OB CSS の `.md-ob-grid*` 系クラス一覧

> `docs/mockup/order-book.css` / Grep実測

| # | 旧クラス | 行 | 用途 | 置換対象 |
|---|---------|-----|------|---------|
| 1 | `.md-ob-grid-wrapper` | 229 | CSS Grid ラッパー（外枠） | Yes |
| 2 | `.md-ob-grid-scroll` | 235 | CSS Grid スクロールコンテナ | Yes |
| 3 | `.md-ob-grid` | 241 | CSS Grid 本体（grid-template-columns） | Yes |
| 4 | `.md-ob-cell` | 249 | セル基底（padding/border/flex） | Yes |
| 5 | `.md-ob-cell.md-ob-header` | 262 | グリッドヘッダセル（複合セレクタ） | Yes (グリッド側のみ) |
| 6 | `.md-ob-frozen-0〜8` | 275-283 | sticky 凍結列（9列） | Yes |
| 7 | `.md-ob-cell.md-ob-header.md-ob-frozen-0〜8` | 286-294 | ヘッダ×凍結列の複合（9組） | Yes |
| 8 | `.md-ob-date-header` | 300 | 日付ヘッダセル | Yes |
| 9 | `.md-ob-day-num` | 305 | 日付番号 span | Yes |
| 10 | `.md-ob-date-cell` | 309 | 日付データセル | Yes |
| 11 | `.md-ob-cell-count` | 318 | 件数表示 span | Yes |
| 12 | `.md-ob-cell-subtask` | 321 | サブタスク表示 span | Yes |
| 13 | `.md-ob-cell-badge-text` | 329 | バッジテキスト span | Yes |
| 14 | `.md-ob-date-cell:hover` | 337 | 日付セルHover | Yes |
| 15 | `.md-ob-sat` / `.md-ob-sun` | 343-344 | 曜日色（データ行） | Yes（M-C3 で属性化予定だが M-C1 は命名リネームのみ） |
| 16 | `.md-ob-sat-head` / `.md-ob-sun-head` | 347-348 | 曜日色（ヘッダ行） | Yes |
| 17 | `.md-ob-cell.md-ob-night` | 352 | 夜シフト行強調 | Yes |
| 18 | `.md-ob-night.md-ob-frozen-2` | 355 | 夜シフト×凍結列2（太字） | Yes |
| 19 | `.md-ob-total-cell` | 362 | 行合計セル | Yes |
| 20 | `.md-ob-grand-total` | 368 | 総合計セル | Yes |
| 21 | `.md-ob-total-row.md-ob-frozen-0〜8` | 383-391 | 合計行×凍結列（複合） | Yes |
| 22 | `.md-ob-even-row` | 399 | ゼブラ（偶数行） | Yes |
| 23 | `.md-ob-even-row.md-ob-frozen-0〜8` | 402-410 | ゼブラ×凍結列（複合） | Yes |
| 24 | `.md-ob-date-cell.md-ob-conf-tentative_high .md-ob-cell-count` | 588 | 信頼度低 opacity（子 `.md-ob-cell-count` の親セレクタ） | Parent のみ Yes |
| 25 | `.md-ob-date-cell.md-ob-conf-tentative_low .md-ob-cell-count` | 589 | 同上 | Parent のみ Yes |
| 26 | `.md-ob-site-entry` | 1017 | 現場エントリ（セル内） | Yes |
| 27 | `.md-ob-site-entry:hover` | 1024 | 現場エントリHover | Yes |
| 28 | `.md-ob-site-entry + .md-ob-site-entry` | 1028 | 連続エントリ間 | Yes |
| 29 | `.md-ob-site-entry.md-ob-conf-tentative_*` `.md-ob-cell-count` | 1031-1032 | 信頼度低 opacity | Parent のみ Yes |
| 30 | `.md-ob-frozen-clickable` / `:hover` | 1107-1110 | 凍結列クリック可表示 | Yes |
| 31 | `.md-ob-row-add-btn` / `:hover` | 415-421 | 行追加ボタン（凍結列内） | Yes |
| 32 | `.md-ob-cal-open-btn` / `:hover` / `img` / `:hover img` | 424-437 | カレンダー起動ボタン（凍結列内） | Yes |

**CSS 置換対象クラス数: 約 28（複合セレクタを1単位としてカウント / 新命名へのmap は §4 参照）**

**名前衝突の警告（重要）:**
- `.md-ob-header`（L45-62: ページヘッダ用）は **対象外**
- `.md-ob-cell.md-ob-header`（L262, L286-294: グリッドヘッダセル用）は **対象**
- → 単純な文字列置換 `md-ob-header` → `tbl-grid__header` は**不可**。正規表現 or AST ベースで「`.md-ob-cell` と複合された場合のみ置換」する必要がある
- 推奨手順: 先に `.md-ob-cell.md-ob-header` を `.tbl-grid__cell.tbl-grid__header` に置換 → そのまま `md-ob-cell` を `tbl-grid__cell` に置換 → ページヘッダ（`md-ob-header-left / -right / -center` も含む）は touched されない

### 3.2 OB JS での参照（`docs/mockup/order-book.js`）

> Grep実測: `md-ob-(grid|cell|frozen|sat|sun|night|even-row|total-row|date-cell|total-cell)` で 47件

| 参照種別 | 件数 | 行（抜粋） | 対応方針 |
|---------|------|-----------|---------|
| テンプレート文字列 (`html += \`...md-ob-cell...\``) | 40 | L541-710 のヘッダ・セル生成ループ | 機械的 find/replace |
| `querySelectorAll('.md-ob-cell[...]')` | 2 | L3685, L3689（ツールチップ対象） | セレクタ文字列置換 |
| `classList.toggle('md-ob-night', ...)` | 2 | L1817, L3093（編集モーダル・カレンダーモーダルの夜シフト強調） | クラス名文字列置換 |
| `document.getElementById('obGrid')` | 1 | L530 | **id は変更しない**（HTML側と整合） |
| その他文字列内記述 | 0 (計測外) | — | — |

**JS 置換対象: 約 44件（文字列）**

### 3.3 OB HTML での記述（`docs/order-book.html`）

> Grep実測: `md-ob-grid` で3件

| 行 | 記述 | 置換 |
|----|------|------|
| 92 | `<div class="md-ob-grid-wrapper">` | `<div class="tbl-grid__wrapper">` |
| 93 | `<div class="md-ob-grid-scroll" id="gridScroll">` | `<div class="tbl-grid__scroll" id="gridScroll">` |
| 94 | `<div class="md-ob-grid" id="obGrid"></div>` | `<div class="tbl-grid" id="obGrid"></div>` |

**HTML 置換対象: 3件（id は不変）**

### 3.4 他モックアップへの波及（`docs/` 配下 OB以外）

> Grep実測: `md-ob-grid|md-ob-cell|md-ob-frozen|...` で OB以外ヒット**ゼロ**

| ファイル | 波及 |
|---------|------|
| `docs/mockup/weekly-schedule.css` / `.js` / `weekly-schedule.html` | 無 |
| `docs/mockup/quick-access.css` / `.js` / `quick-access.html` | 無 |
| `docs/mockup/screen-layout.css` / `.js` / `screen-layout.html` | 無 |
| `docs/mockup/co-forms.css` / `co-tokens.css` / `co-navbar.css` | 無 |
| `docs/plan/ds-migration-*.md` | 計画ドキュメント内での言及のみ（変更不要） |

→ **M-C1 は OB 閉じ込めで完結**。

### 3.5 新DS `.tbl-grid` 規約の参照状況

> `docs/ui-components/styles-light.css`

- `.tbl-grid` / `.tbl-grid__*` の定義は**未作成**（Grep実測: ヒット0件）
- `.tbl-*`（table系）は L3611-4100 に定義済（Phase D2.1-D2.2）
- Governance L144: 「`.tbl-grid / .tbl-grid__cell / .tbl-grid__sticky` のBEM拡張として規約化」と明記
- → M-C1 では `styles-light.css` に `.tbl-grid` を追加せず、OB CSS 内でクラス名をリネームするのみ（M-G で共通化）

### 3.6 既存 `.tbl-*` との重複回避

| 既存クラス（styles-light.css） | 類似候補 | 回避策 |
|-------------------------------|---------|--------|
| `.tbl-cell--num / --date / --text` | `.tbl-grid__cell` | BEM の `__cell`（Element）を使い、`.tbl-cell`（Block）と区別 |
| `.tbl--sticky-col` | `.tbl-grid__sticky--{n}` | CSS Grid は sticky を列番号で個別指定する仕様のため、BEM Modifier で番号付け |
| `.tbl--zebra` | `.tbl-grid__even-row` | M-C1 は命名のみ（M-C4 で `.tbl--zebra` に統合） |
| `.tbl-row--total` | `.tbl-grid__total-row` | 同上（M-C4 で統合） |

---

## 4. 置換マッピング表

### 4.1 CSS クラス名マップ

| 旧クラス | 新クラス | 備考 |
|---------|---------|------|
| `.md-ob-grid-wrapper` | `.tbl-grid__wrapper` | BEM Element |
| `.md-ob-grid-scroll` | `.tbl-grid__scroll` | BEM Element |
| `.md-ob-grid` | `.tbl-grid` | Block |
| `.md-ob-cell` | `.tbl-grid__cell` | BEM Element |
| `.md-ob-cell.md-ob-header`（グリッド内） | `.tbl-grid__cell.tbl-grid__header` | 複合。ページヘッダ `.md-ob-header` は不変 |
| `.md-ob-frozen-0` 〜 `.md-ob-frozen-8` | `.tbl-grid__sticky--0` 〜 `.tbl-grid__sticky--8` | BEM Modifier（番号付き） |
| `.md-ob-date-header` | `.tbl-grid__date-header` | |
| `.md-ob-day-num` | `.tbl-grid__day-num` | |
| `.md-ob-date-cell` | `.tbl-grid__date-cell` | |
| `.md-ob-cell-count` | `.tbl-grid__cell-count` | |
| `.md-ob-cell-subtask` | `.tbl-grid__cell-subtask` | |
| `.md-ob-cell-badge-text` | `.tbl-grid__cell-badge-text` | |
| `.md-ob-sat` | `.tbl-grid__sat` | M-C3 で `data-day` 化予定 |
| `.md-ob-sun` | `.tbl-grid__sun` | 同上 |
| `.md-ob-sat-head` | `.tbl-grid__sat-head` | 同上 |
| `.md-ob-sun-head` | `.tbl-grid__sun-head` | 同上 |
| `.md-ob-night` | `.tbl-grid__night` | M-C3 で整理予定 |
| `.md-ob-total-cell` | `.tbl-grid__total-cell` | M-C4 で `.tbl-row--total` に統合予定 |
| `.md-ob-grand-total` | `.tbl-grid__grand-total` | |
| `.md-ob-total-row` | `.tbl-grid__total-row` | M-C4 で `.tbl-row--total` に統合予定 |
| `.md-ob-even-row` | `.tbl-grid__even-row` | M-C4 で `.tbl--zebra` に統合予定 |
| `.md-ob-site-entry` | `.tbl-grid__site-entry` | |
| `.md-ob-frozen-clickable` | `.tbl-grid__clickable` | |
| `.md-ob-row-add-btn` | `.tbl-grid__row-add-btn` | |
| `.md-ob-cal-open-btn` | `.tbl-grid__cal-open-btn` | |

### 4.2 対象外（触らない）クラス

| クラス | 理由 |
|-------|------|
| `.md-ob-header` / `-left` / `-right` / `-center` / `-month-nav` | ページヘッダ（L45-62）。グリッドとは無関係 |
| `.md-ob-modal*` | モーダル系 → M-D |
| `.md-ob-edit-form` / `-count-confidence-row` | 編集フォーム → M-B |
| `.md-ob-conf-tentative_high / _low` | 信頼度モディファイア → M-C4 |
| `.md-ob-cal-info-meta` / `-cal-meta-*` | カレンダーモーダル → M-D |
| `.md-ob-badge-*` | バッジ → M-E |

### 4.3 置換手順（推奨順）

1. **最長一致から置換**（部分文字列誤爆回避）
   1. `.md-ob-frozen-clickable` → `.tbl-grid__clickable`
   2. `.md-ob-cell-badge-text` → `.tbl-grid__cell-badge-text`
   3. `.md-ob-cell-subtask` → `.tbl-grid__cell-subtask`
   4. `.md-ob-cell-count` → `.tbl-grid__cell-count`
   5. `.md-ob-grid-wrapper` → `.tbl-grid__wrapper`
   6. `.md-ob-grid-scroll` → `.tbl-grid__scroll`
   7. `.md-ob-row-add-btn` → `.tbl-grid__row-add-btn`
   8. `.md-ob-cal-open-btn` → `.tbl-grid__cal-open-btn`
   9. `.md-ob-date-header` → `.tbl-grid__date-header`
   10. `.md-ob-date-cell` → `.tbl-grid__date-cell`
   11. `.md-ob-day-num` → `.tbl-grid__day-num`
   12. `.md-ob-site-entry` → `.tbl-grid__site-entry`
   13. `.md-ob-total-cell` → `.tbl-grid__total-cell`
   14. `.md-ob-total-row` → `.tbl-grid__total-row`
   15. `.md-ob-grand-total` → `.tbl-grid__grand-total`
   16. `.md-ob-even-row` → `.tbl-grid__even-row`
   17. `.md-ob-sat-head` / `.md-ob-sun-head` → `.tbl-grid__sat-head` / `.tbl-grid__sun-head`
   18. `.md-ob-frozen-0` 〜 `.md-ob-frozen-8` → `.tbl-grid__sticky--0` 〜 `.tbl-grid__sticky--8`（数字大→小の順）
   19. `.md-ob-cell.md-ob-header` → `.tbl-grid__cell.tbl-grid__header`（`.md-ob-header` より先）
   20. `.md-ob-cell` → `.tbl-grid__cell`
   21. `.md-ob-sat` → `.tbl-grid__sat`
   22. `.md-ob-sun` → `.tbl-grid__sun`
   23. `.md-ob-night` → `.tbl-grid__night`
   24. `.md-ob-grid` → `.tbl-grid`（最短を最後）

2. **各step完了後に確認**: grep で旧名残留がゼロを確認してから次へ

---

## 5. テストチェックリスト

> 凡例: A=視覚 / B=ブラウザ / D=機能 / E=置換完全性 / G=ガバナンス

### A. 視覚回帰（30点）

- [ ] **A-1 (3)** グリッド全体のカラム幅（9凍結列 + 日付列×日数 + 合計列）が前後で同一
- [ ] **A-2 (3)** sticky 9列（支店/区分/シフト/業者/(+)/業務名/(+)/カレンダー/ベル）の水平オフセットが同一（0/100/164/200/330/358/488/516/552px）
- [ ] **A-3 (3)** 凍結列9列目の右端 `border-right: 2px solid var(--divider)` が表示される
- [ ] **A-4 (3)** ヘッダ行（グリッド内 `.tbl-grid__cell.tbl-grid__header`）の背景色 `--bg-surface-3 / var(--base-muted)`・太字が不変
- [ ] **A-5 (3)** 土曜列ヘッダ `--day-sat-head`、日曜列ヘッダ `--day-sun-head` の背景色が不変
- [ ] **A-6 (3)** 土曜列データ `--day-sat`、日曜列データ `--day-sun` の背景色が不変
- [ ] **A-7 (3)** 夜シフト行（`.tbl-grid__night`）の凍結列2（シフト）が `font-weight: 700` で強調
- [ ] **A-8 (3)** ゼブラ（`.tbl-grid__even-row`）の偶数行背景色が不変
- [ ] **A-9 (3)** 合計行（`.tbl-grid__total-row`）と総合計セル（`.tbl-grid__grand-total`）の背景・太字が不変

### B. ブラウザ互換（10点）

- [ ] **B-1 (3)** Chrome 最新で CSS Grid レイアウトとsticky が前後同一に描画される
- [ ] **B-2 (3)** Edge 最新で同上
- [ ] **B-3 (2)** Firefox 最新で同上（Grid 列幅・sticky 位置）
- [ ] **B-4 (2)** DevTools の Elements パネルで要素のクラス名が `.tbl-grid*` に変わっており、Computed スタイルが前と一致

### D. 機能（20点）

- [ ] **D-1 (3)** 月切替（prev/next）で `obGrid.innerHTML = html` を経由してグリッドが再生成され、`.tbl-grid__cell` で始まる全セルが生成される
- [ ] **D-2 (3)** 行追加ボタン `+`（L589 凍結列4 / L598 凍結列6）クリックで `addNewRowFromRow(ri)` / `addShiftRow(ri)` が動作
- [ ] **D-3 (3)** カレンダーボタン（凍結列7）クリックで `openCalendarModal(ri)` が起動
- [ ] **D-4 (3)** 凍結列（支店/区分/シフト/業者/業務名）クリックで `openRowEditModal(ri)` が起動
- [ ] **D-5 (2)** 日付セルクリックで `openCalendarWithEdit(ri,d,si)` が起動（`.tbl-grid__site-entry` 経由）
- [ ] **D-6 (2)** `document.querySelectorAll('.tbl-grid__cell[data-ri="…"][data-day="…"]')` が正しいセルを返す（L3685）
- [ ] **D-7 (2)** `document.querySelectorAll('.tbl-grid__cell[data-ri="…"]')` が正しいセルを返す（L3689）
- [ ] **D-8 (2)** 編集モーダル起動時 `editMeta.classList.toggle('tbl-grid__night', row.shift === '夜')` で夜シフト表示が切り替わる（L1817）

### E. 見た目不変・置換完全性（30点）

- [ ] **E-1 (3)** `Grep "md-ob-grid" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-2 (3)** `Grep "md-ob-cell" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-3 (2)** `Grep "md-ob-frozen" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-4 (2)** `Grep "md-ob-sat\|md-ob-sun\|md-ob-night" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-5 (2)** `Grep "md-ob-even-row\|md-ob-total-row\|md-ob-total-cell\|md-ob-grand-total\|md-ob-date-cell\|md-ob-date-header\|md-ob-day-num\|md-ob-site-entry\|md-ob-frozen-clickable\|md-ob-row-add-btn\|md-ob-cal-open-btn\|md-ob-cell-count\|md-ob-cell-subtask\|md-ob-cell-badge-text" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-6 (2)** `Grep "md-ob-grid\|md-ob-cell\|md-ob-frozen\|md-ob-sat\|md-ob-sun\|md-ob-night\|md-ob-even-row\|md-ob-total-row\|md-ob-date-cell\|md-ob-total-cell" docs/mockup/order-book.js` 結果が **0件**
- [ ] **E-7 (2)** `Grep "md-ob-grid" docs/order-book.html` 結果が **0件**
- [ ] **E-8 (3)** `Grep "md-ob-header[^-]" docs/mockup/order-book.css`（グリッドヘッダ）で残留ゼロ、**ただし** `Grep "md-ob-header\b" docs/mockup/order-book.css` ではページヘッダ関連が4件（L45, L54, L55, L62）残存している（正常）
- [ ] **E-9 (2)** `Grep "\.md-ob-header-left\|\.md-ob-header-right\|\.md-ob-header-center" docs/mockup/order-book.css` 結果が **そのまま**残存（ページヘッダ不変）
- [ ] **E-10 (2)** Before/After スクリーンショットをpixel diff（ImageMagick `compare` or `pixelmatch`）で比較 → 差分 < 50px² のピクセル領域
- [ ] **E-11 (2)** 月切替・行編集・カレンダー起動の3操作を実施したHTMLをsnapshot比較 → クラス名以外の差分ゼロ
- [ ] **E-12 (2)** `.md-ob-grid*` 系のサブセット （`site-entry / conf-tentative`）は M-C4 対応の可能性があるが、M-C1 時点で**これらのクラスは親セレクタの一部としては置換済、子 `.md-ob-cell-count` や `.md-ob-conf-tentative_*` 単独では残存する**ことを確認（`.md-ob-conf-tentative_high` / `_low` は M-C1 対象外）
- [ ] **E-13 (2)** Playwright で OB 起動 → コンソールエラー0件（`Uncaught TypeError` / `Cannot read property 'classList' of null` が出ない）
- [ ] **E-14 (1)** `docs/order-book.html` / `docs/mockup/order-book.css` / `docs/mockup/order-book.js` の3ファイル以外は変更されていない（git diff で確認）

### G. ガバナンス（10点）

- [ ] **G-1 (2)** BEM 命名規則（Block `__` Element `--` Modifier）準拠 — `tbl-grid__sticky--0` 等
- [ ] **G-2 (2)** Governance L144 の規約 `.tbl-grid / .tbl-grid__cell / .tbl-grid__sticky` と整合
- [ ] **G-3 (2)** M-C2（sticky z-index → `--z-sticky`）の前提を満たす（`.tbl-grid__sticky--{n}` セレクタで一括変更できる構造）
- [ ] **G-4 (2)** M-C3（曜日色 → `data-day` 属性化）の前提を満たす（`.tbl-grid__sat` 等がセレクタ単位で特定できる）
- [ ] **G-5 (1)** phase-log に Before/After のクラス名対応表と残Warning（`.md-ob-conf-tentative_*` / `.md-ob-cal-info-meta` 等は後続フェーズで対応）が記載されている
- [ ] **G-6 (1)** `docs/plan/ds-migration-plan.md` の M-C1 行にチェックマークまたは完了コミットハッシュを追記

---

## 6. 重大Claim（Critical Claims）

次のいずれかが発生した場合、点数に関わらず **合格不可（不合格）**。

| ID | Claim | 検証方法 | 重大度 |
|----|-------|---------|--------|
| **CC-1** | グリッド表示崩壊（列幅が変わる / セルが改行される / grid-template-columns が効かない） | Playwright で OB 起動 → gridScroll の子要素数 = `9 + 9×日数 + 1` であることを確認、かつ `obGrid` の `grid-template-columns` CSS が computed で旧と同一 | Critical |
| **CC-2** | sticky 列ずれ（凍結列が正しい left 位置で止まらない / scroll 時に流れる） | 水平スクロール時、9凍結列全てが `position: sticky` で固定されることを目視確認 + DevTools で computed `left` を確認 | Critical |
| **CC-3** | JS 動作不能（月切替・行追加・カレンダー起動のいずれかが例外） | Playwright で各操作実行 → コンソールエラー 0件 + 期待モーダルが開く | Critical |
| **CC-4** | 他モックアップ（WS/QA/SL）への波及 | `git diff` 対象ファイルが `docs/mockup/order-book.css`・`docs/mockup/order-book.js`・`docs/order-book.html` の3ファイルに限定されていることを確認 | Critical |
| **CC-5** | ページヘッダ `.md-ob-header`（L45-62）が破壊 | OB ページ最上部のヘッダ（「受注簿」見出し・月ナビ・右側操作）の見た目が前後で完全同一 | Critical |
| **CC-6** | `.md-ob-conf-tentative_*` の子要素参照が壊れる（L588, L1031 の `.md-ob-cell-count` opacity 制御） | 信頼度低の件数セル opacity が 0.5 / 0.25 で表示される | High（M-C4 で統合予定のためWarning止まりで可） |

**合格条件: 70点以上 AND CC-1〜CC-5 いずれも未発生（CC-6 は Warning 扱い可）**

---

## 7. 実装順序の推奨

1. **Step 1: order-book.css のクラス定義をリネーム**（§4.3 の順で find/replace）
2. **Step 2: order-book.html の 3箇所を置換**
3. **Step 3: order-book.js のテンプレート文字列・querySelector・classList.toggle を置換**
4. **Step 4: ブラウザで OB 起動 → 目視確認 + コンソールエラー確認**
5. **Step 5: 月切替・行追加・カレンダー起動・編集モーダルの4操作を実施**
6. **Step 6: Grep で旧クラス名残留ゼロを確認**（§5 E-1〜E-7）
7. **Step 7: Before/After スクリーンショット比較**（§5 E-10）

---

## 8. 参考資料

- Governance: `docs/plan/ds-migration-governance.md` L88-93（Phase M-C 分割）/ L144（`.tbl-grid` BEM規約）
- 計画: `docs/plan/ds-migration-plan.md` L139-144（CSS Grid運用方針）/ L244（M-C1 行）
- 新DS: `docs/ui-components/styles-light.css` L3611-4100（`.tbl-*` Phase D2.1-2.2）
- 既往TD: `docs/plan/phase-logs/m-b3-td-v1.md`（直前の TD テンプレ参考）
