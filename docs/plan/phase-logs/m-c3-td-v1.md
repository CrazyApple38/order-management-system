# Phase M-C3 TD v1 — OB グリッドの曜日色・夜シフトを属性セレクタ化

> Role: Test Designer（TD） / Target: Sub-Phase **M-C3**
> Scope: `docs/mockup/order-book.css` / `docs/order-book.html` / `docs/mockup/order-book.js`
> Upstream: M-C1（`.tbl-grid*` リネーム完了）/ M-C2（sticky z-index → `--z-sticky`）
> Downstream: M-C4（zebra/total/empty の汎用化）/ M-D（モーダル系）

---

## 1. 目的

### 1.1 主目的（M-C3 の範囲）

OB グリッドの**曜日色**（土 / 日）と**夜シフト強調**を、BEM クラス `.tbl-grid__sat / __sun / __sat-head / __sun-head / __night` から、**データ属性セレクタ** `[data-dow="sat"]` / `[data-dow="sun"]` / `[data-dow="sat-head"]` / `[data-dow="sun-head"]` / `[data-shift="night"]` に切り替える。

- CSS セレクタを `.tbl-grid__cell.tbl-grid__sat { ... }` 形式から `.tbl-grid__cell[data-dow="sat"] { ... }` 形式へ変更
- JS のテンプレート文字列 / `classList.toggle` を `data-dow` / `data-shift` の属性付与に置換
- HTML 静的記述に該当は無し（グリッドは JS 生成）
- 見た目・動作は完全不変

### 1.2 採用案（TD 決定）: **案A' — 属性化完全移行（名称変更: `data-day` → `data-dow`）**

> 元提示の案A / B / C を検討のうえ、**命名衝突を回避する派生案 A'** を採用する。

#### 命名の決定: `data-dow` / `data-shift` を採用（`data-day` は採用しない）

- **致命的衝突**: 既存 JS では `data-day="${d}"`（`d` = 日付数値 1〜31）が `.tbl-grid__cell` と `.tbl-grid__site-entry` の全セルに付いている（`order-book.js` L668, L683）。さらに `obCnHighlightCells(ri, day, ...)` が `querySelectorAll('[data-ri="0"][data-day="1"]')` で**日付数値**として利用している（L3680, L3685）
- → 曜日を `data-day="sat"` にすると、既存「日付数値」と**同一属性に異なる意味の値が混入**し、セレクタで区別不能になる（`data-day="1"` と `data-day="sat"` が同一 dimension）
- **解決策**: 曜日は `data-dow`（day-of-week）、夜シフトは `data-shift` に分離する。`data-day` は既存の「日付数値」専用として残す。Governance L91（M-C3）の `data-day` 記法はプラン起草時に衝突を想定していなかったため、TD としてここで `data-dow` への命名修正を提案し、phase-log に Governance 記述の訂正メモを残す

#### 採用理由（案A' = 完全属性化）

1. **DS 推奨**: 曜日・シフトは「セル状態を識別する属性」であり、クラス（プレゼンテーションの分類）ではなく**data-属性**で表現するのが DS 規約（Governance L91）
2. **規模が小さい**: CSS 10行 / JS 7箇所（曜日クラス付与 4 + `classList.toggle('tbl-grid__night',...)` 2 + その他 1）と限定的。機械的置換で完結
3. **M-C1 時点で既に下地が整っている**: M-C1 SC レビュー（`m-c1-sc-v1.md` L105）で「`.tbl-grid__sat/sun/sat-head/sun-head` が独立セレクタとして確立したため、M-C3 では属性セレクタへの段階的移行ができる」と判定済
4. **他モックアップへの波及ゼロ**: `.tbl-grid__sat/sun/night` は OB 閉じ込め。WS には `.md-ws-sat-col` 等の別系統があり（ds-migration-plan L276 の M-C 対象として別枠管理）M-C3 は触らない
5. **案B（クラスと属性の両対応）の却下理由**: 一時併用は二重管理コストが大きく、M-C3 の残作業（クラス撤去）を M-G に持ち越すことになる。規模が小さい今回は一気通貫が正しい
6. **案C（クラス据え置き）の却下理由**: DS 準拠度で減点。かつ Governance L91 の明示指示に反する

#### 採用案の留意点

- `.md-ob-holiday` / `.md-ob-holiday-head`（祝日）は `tbl-grid` 系ではない既存クラスとして残っており（CSS L345, L349 / JS L554, L613）、**本フェーズ対象外**。祝日も `data-dow="holiday"` に統一するのが DS 整合性では好ましいが、M-C3 は「Governance L91 で明示された sat/sun/night」に限定する（祝日は M-C4 or M-G で別途検討する Warning）
- 複合セレクタ `.tbl-grid__cell.tbl-grid__night { color: ... }`（L352）は `.tbl-grid__cell[data-shift="night"]` に置換
- 番号付き BEM Modifier との複合 `.tbl-grid__night.tbl-grid__sticky--2 { font-weight: 700; }`（L355）は `[data-shift="night"].tbl-grid__sticky--2` に置換
- カレンダーモーダル内の `.md-ob-cal-info-meta.tbl-grid__night ...`（L1167-1170, 4件）も同時に `.md-ob-cal-info-meta[data-shift="night"]` に置換する（同じ `tbl-grid__night` クラスが共有されているため、片方だけ変更すると dangling 参照が生まれる）
- `editMeta.classList.toggle('tbl-grid__night', ...)`（JS L1817）と `calMeta.classList.toggle('tbl-grid__night', ...)`（JS L3093）は `setAttribute('data-shift', ...)` / `removeAttribute('data-shift')` パターンに置換。**カレンダーモーダル装飾側と同じ属性に揃える**

### 1.3 非目標（スコープ外）

- `.md-ob-holiday` / `.md-ob-holiday-head` の属性化（祝日）→ M-C4 or M-G で別途
- WS 側 `.md-ws-sat-col / .sun-col / .holiday / .night-col` の属性化 → ds-migration-plan L276 の別枠（M-C 同フェーズ内の別サブタスク）
- `.tbl-grid__even-row` の `.tbl--zebra` 統合 → M-C4
- `.tbl-grid__total-row / __total-cell` の `.tbl-row--total` 統合 → M-C4
- 密度モード → M-C5
- プロパティ値の変更（現状色 `--day-sat / --day-sun / --day-sat-head / --day-sun-head / --night-text` を完全保持）

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 25 | 土日曜日色・夜シフトcolor・sticky2太字が完全不変 |
| ブラウザ互換（Browser） | B | 10 | Chrome/Edge/Firefox で属性セレクタが同一に動作 |
| 機能（Domain/Behavior） | D | 25 | 曜日判定ロジック・夜シフトtoggle・既存 `data-day` との衝突なし |
| **見た目不変・置換完全性（Equivalence）** | **E** | **30** | **旧クラスが残留していない / 新属性が期待位置に存在 / 見た目が前後同一** |
| ガバナンス | G | 10 | 命名規約（`data-dow` 採用と Governance 修正提案の記載） |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0**

---

## 3. 事前調査結果

### 3.1 対象 CSS 定義（`docs/mockup/order-book.css`）

> Grep実測: `tbl-grid__(sat|sun|night|sat-head|sun-head)` で **10 件**

| # | 行 | 旧記述 | 用途 | 置換後 |
|---|----|-------|------|--------|
| 1 | 343 | `.tbl-grid__sat { background-color: var(--day-sat) !important; }` | 土データセル背景 | `.tbl-grid__cell[data-dow="sat"] { background-color: var(--day-sat) !important; }` |
| 2 | 344 | `.tbl-grid__sun { background-color: var(--day-sun) !important; }` | 日データセル背景 | `.tbl-grid__cell[data-dow="sun"] { background-color: var(--day-sun) !important; }` |
| 3 | 347 | `.tbl-grid__sat-head { background-color: var(--day-sat-head) !important; color: var(--text-primary) !important; }` | 土ヘッダ背景 | `.tbl-grid__cell[data-dow="sat-head"] { ... }`（※）|
| 4 | 348 | `.tbl-grid__sun-head { background-color: var(--day-sun-head) !important; color: var(--text-primary) !important; }` | 日ヘッダ背景 | `.tbl-grid__cell[data-dow="sun-head"] { ... }`（※）|
| 5 | 352 | `.tbl-grid__cell.tbl-grid__night { color: var(--night-text); }` | 夜シフト行 color | `.tbl-grid__cell[data-shift="night"] { color: var(--night-text); }` |
| 6 | 355 | `.tbl-grid__night.tbl-grid__sticky--2 { font-weight: 700; }` | 夜×シフト列を太字 | `[data-shift="night"].tbl-grid__sticky--2 { font-weight: 700; }` |
| 7 | 1167 | `.md-ob-cal-info-meta.tbl-grid__night .md-ob-cal-meta-company { ... }` | カレンダーモーダル（夜） | `.md-ob-cal-info-meta[data-shift="night"] .md-ob-cal-meta-company { ... }` |
| 8 | 1168 | `.md-ob-cal-info-meta.tbl-grid__night .md-ob-cal-meta-contract { color: var(--night-text); }` | 同上 | `.md-ob-cal-info-meta[data-shift="night"] .md-ob-cal-meta-contract { ... }` |
| 9 | 1169 | `.md-ob-cal-info-meta.tbl-grid__night .md-ob-cal-meta-task { color: var(--night-text); }` | 同上 | `.md-ob-cal-info-meta[data-shift="night"] .md-ob-cal-meta-task { ... }` |
| 10 | 1170 | `.md-ob-cal-info-meta.tbl-grid__night .md-ob-cal-meta-tags { color: var(--night-text); background: rgba(208,80,80,0.1); }` | 同上 | `.md-ob-cal-info-meta[data-shift="night"] .md-ob-cal-meta-tags { ... }` |

**CSS 置換: 10行（ほぼ1行単位で find/replace 可能）**

※（ヘッダ`-head`について）: `data-dow` 値を `sat-head` / `sun-head` と命名することで既存クラス構造と 1:1 対応。代替案として `data-row="header"` + `data-dow="sat"` の多次元構造もあるが、規模に対してオーバーエンジニアリングのため採用しない。

### 3.2 対象 JS 参照（`docs/mockup/order-book.js`）

> Grep実測: `tbl-grid__(sat|sun|night|sat-head|sun-head)` で **7 件**

| # | 行 | 旧記述 | 置換後 | 種別 |
|---|----|-------|--------|------|
| 1 | 555 | `else if (dow === 0) cls += ' tbl-grid__sun-head';` | `if (dow === 0) dowAttr = 'sun-head';` + 組み立てを `data-dow` attr に | テンプレ |
| 2 | 556 | `else if (dow === 6) cls += ' tbl-grid__sat-head';` | `else if (dow === 6) dowAttr = 'sat-head';` | テンプレ |
| 3 | 577 | `if (row.shift === '夜') rowCls += ' tbl-grid__night';` | `const shiftAttr = (row.shift === '夜') ? ' data-shift="night"' : '';`（そして下で `rowCls` から夜を除外） | テンプレ |
| 4 | 614 | `else if (dow === 0) cls += ' tbl-grid__sun';` | `if (dow === 0) dowAttr = 'sun';` | テンプレ |
| 5 | 615 | `else if (dow === 6) cls += ' tbl-grid__sat';` | `else if (dow === 6) dowAttr = 'sat';` | テンプレ |
| 6 | 1817 | `editMeta.classList.toggle('tbl-grid__night', row.shift === '夜');` | `if (row.shift === '夜') editMeta.setAttribute('data-shift', 'night'); else editMeta.removeAttribute('data-shift');` | DOM API |
| 7 | 3093 | `calMeta.classList.toggle('tbl-grid__night', row.shift === '夜');` | 同上（`calMeta` に対して） | DOM API |

**追加必要な HTML 属性の付与箇所（テンプレ）**:
- L541-547: ヘッダ frozen セル（9箇所） → 曜日無しのため属性追加不要
- L552-558: 日付ヘッダセル → `data-dow="sat-head"|"sun-head"|""`（未設定でも OK。dowAttr 空なら省略）
- L561: 合計ヘッダ → 属性なし
- L585-601: 行内 frozen cells（9箇所） → `data-shift="night"` を夜シフト行の全セルに付与（既存の `rowCls` に代わり、属性ベース）
- L606-683: 日付データセル → `data-dow` + `data-shift="night"` を付与
- L688: 行合計セル → `data-shift="night"` を付与

### 3.3 HTML 静的記述（`docs/order-book.html`）

> Grep実測: `tbl-grid__(sat|sun|night)` で **0 件**

静的 HTML 側では曜日・シフト属性クラスの記述は存在しない（グリッドは完全にJS生成）。**HTML 置換: 0件**。

### 3.4 他モックアップへの波及

| ファイル | 波及 | 根拠 |
|---------|------|------|
| `docs/mockup/weekly-schedule.css` / `.js` / `weekly-schedule.html` | **無** | WS は独自の `.md-ws-sat-col` 系統。M-C3 OB対象外 |
| `docs/mockup/quick-access.css` / `.js` / `quick-access.html` | **無** | QA は曜日色クラスなし |
| `docs/mockup/screen-layout.css` / `.js` / `screen-layout.html` | **無** | SL も曜日色クラスなし |

→ **M-C3 は OB 閉じ込めで完結**。

### 3.5 既存 `data-day` との衝突分析（重要）

OB JS の既存 `data-day` 属性は**日付数値（1〜31）**として以下で使用:

| 箇所 | 用途 |
|------|------|
| JS L668: `.tbl-grid__site-entry ... data-day="${d}"` | 現場エントリの日付付与 |
| JS L683: `.tbl-grid__cell ... data-day="${d}"` | 日付データセルの日付付与 |
| JS L3680: `querySelector('.tbl-grid__site-entry[data-ri="..."][data-day="..."][data-si="..."]')` | ハイライト対象検索 |
| JS L3685: `querySelectorAll('.tbl-grid__cell[data-ri="..."][data-day="..."]')` | 同上 |

もし M-C3 で曜日に `data-day="sat"` を採用すると:
- `data-day="1"`（日付数値）と `data-day="sat"`（曜日）が**同一属性で共存不能**
- 既存 `querySelectorAll('[data-day="5"]')` が「5日のセル」と「"5"という曜日」を区別できず、ロジック破綻

**→ 曜日は `data-dow` を採用（`data-day` は既存の日付数値専用として維持）**

### 3.6 Governance / Plan の修正提案

- `docs/plan/ds-migration-governance.md` L91: 「**M-C3**: 曜日色（sat/sun/night）→ `data-day` 属性化」 → **`data-dow` / `data-shift` 属性化** に訂正提案
- `docs/plan/ds-migration-plan.md` L246: 「`.md-ob-sat/.md-ob-sun/.md-ob-night` を `data-day="sat/sun"` 属性セレクタへ切替」 → **`data-dow="sat|sun"` / `data-shift="night"`** に訂正提案

M-C3 IC（Implementation Coder）が phase-log の最後に、上記 2 ファイルへの訂正追記を行うこと（Governance 遡及修正）。

---

## 4. 置換マッピング

### 4.1 CSS セレクタ（10行）

| 旧 | 新 |
|----|----|
| `.tbl-grid__sat` | `.tbl-grid__cell[data-dow="sat"]` |
| `.tbl-grid__sun` | `.tbl-grid__cell[data-dow="sun"]` |
| `.tbl-grid__sat-head` | `.tbl-grid__cell[data-dow="sat-head"]` |
| `.tbl-grid__sun-head` | `.tbl-grid__cell[data-dow="sun-head"]` |
| `.tbl-grid__cell.tbl-grid__night` | `.tbl-grid__cell[data-shift="night"]` |
| `.tbl-grid__night.tbl-grid__sticky--2` | `[data-shift="night"].tbl-grid__sticky--2` |
| `.md-ob-cal-info-meta.tbl-grid__night X` | `.md-ob-cal-info-meta[data-shift="night"] X`（4件）|

### 4.2 JS テンプレ記述

**ヘッダ日付セル生成（L548-558）の書き換え例**:

```js
// Before
let cls = 'tbl-grid__cell tbl-grid__header tbl-grid__date-header';
if (weekendColorsEnabled) {
    if (holidays[dateStr]) cls += ' md-ob-holiday-head';
    else if (dow === 0) cls += ' tbl-grid__sun-head';
    else if (dow === 6) cls += ' tbl-grid__sat-head';
}
html += `<div class="${cls}"><span class="tbl-grid__day-num">${d}</span>...</div>`;

// After
let cls = 'tbl-grid__cell tbl-grid__header tbl-grid__date-header';
let dowAttr = '';
if (weekendColorsEnabled) {
    if (holidays[dateStr]) cls += ' md-ob-holiday-head'; // 祝日は M-C3 対象外
    else if (dow === 0) dowAttr = ' data-dow="sun-head"';
    else if (dow === 6) dowAttr = ' data-dow="sat-head"';
}
html += `<div class="${cls}"${dowAttr}><span class="tbl-grid__day-num">${d}</span>...</div>`;
```

**データ日付セル生成（L606-683）の書き換え例**:

```js
// Before
let cls = `tbl-grid__cell tbl-grid__date-cell ${rowCls}${evenCls}`;
if (weekendColorsEnabled) {
    if (holidays[dateStr]) cls += ' md-ob-holiday';
    else if (dow === 0) cls += ' tbl-grid__sun';
    else if (dow === 6) cls += ' tbl-grid__sat';
}
// （L577 で rowCls に 'tbl-grid__night' が含まれていた場合、ここにも流入）
html += `<div class="${cls}" data-ri="${ri}" data-day="${d}" ...>${cellContent}</div>`;

// After
let cls = `tbl-grid__cell tbl-grid__date-cell ${rowCls}${evenCls}`;
let dowAttr = '';
if (weekendColorsEnabled) {
    if (holidays[dateStr]) cls += ' md-ob-holiday';
    else if (dow === 0) dowAttr = ' data-dow="sun"';
    else if (dow === 6) dowAttr = ' data-dow="sat"';
}
// rowCls から 'tbl-grid__night' を除外し、shiftAttr に分離する（L577 改修）
html += `<div class="${cls}"${shiftAttr} data-ri="${ri}" data-day="${d}" ...>${cellContent}</div>`;
```

**行内 `tbl-grid__night` の分離（L577）**:

```js
// Before
if (row.shift === '夜') rowCls += ' tbl-grid__night';

// After
const shiftAttr = (row.shift === '夜') ? ' data-shift="night"' : '';
// （rowCls には追加しない。全セルの HTML 生成時に shiftAttr を末尾に追加）
```

**`classList.toggle` 2箇所の書き換え（L1817, L3093）**:

```js
// Before
editMeta.classList.toggle('tbl-grid__night', row.shift === '夜');

// After
if (row.shift === '夜') editMeta.setAttribute('data-shift', 'night');
else editMeta.removeAttribute('data-shift');
```

### 4.3 置換手順（推奨順）

1. **Step 1**: CSS 10行を find/replace（§4.1 のマッピング）
2. **Step 2**: JS L577 で `rowCls += ' tbl-grid__night'` を `shiftAttr = ' data-shift="night"'` に分離
3. **Step 3**: JS L585-683 の各セル HTML で、生成文字列末尾に `${shiftAttr}` を追記（9 frozen cells + 日付cells + 合計cell）
4. **Step 4**: JS L555-556 / L614-615 を `dowAttr` 変数経由の属性付与に書き換え
5. **Step 5**: JS L1817, L3093 の `classList.toggle('tbl-grid__night', ...)` を `setAttribute` / `removeAttribute` に書き換え
6. **Step 6**: Grep で `tbl-grid__(sat|sun|night|sat-head|sun-head)` 残留ゼロを確認

---

## 5. テストチェックリスト

> 凡例: A=視覚 / B=ブラウザ / D=機能 / E=置換完全性 / G=ガバナンス

### A. 視覚回帰（25点）

- [ ] **A-1 (4)** 土曜列データセル背景が `--day-sat`（#E3F2FD 相当）で前後不変
- [ ] **A-2 (4)** 日曜列データセル背景が `--day-sun`（#FFEBEE 相当）で前後不変
- [ ] **A-3 (3)** 土曜列ヘッダ背景が `--day-sat-head` / 文字色 `--text-primary` で前後不変
- [ ] **A-4 (3)** 日曜列ヘッダ背景が `--day-sun-head` / 文字色 `--text-primary` で前後不変
- [ ] **A-5 (4)** 夜シフト行のセル文字色が `--night-text`（#D05050 相当）で前後不変
- [ ] **A-6 (4)** 夜シフト行のシフト列（sticky--2）が `font-weight: 700` で前後不変
- [ ] **A-7 (3)** カレンダーモーダル内（`.md-ob-cal-info-meta[data-shift="night"]`）の会社名・契約・業務・タグの色が前後不変

### B. ブラウザ互換（10点）

- [ ] **B-1 (3)** Chrome 最新で属性セレクタ `[data-dow="sat"]` / `[data-shift="night"]` が適用される
- [ ] **B-2 (3)** Edge 最新で同上
- [ ] **B-3 (2)** Firefox 最新で同上
- [ ] **B-4 (2)** DevTools Computed で旧クラスと同じスタイル値（背景色・文字色・font-weight）が出る

### D. 機能（25点）

- [ ] **D-1 (3)** 月切替（prev/next）で全日付セルに正しい `data-dow` 属性が付く（土=sat / 日=sun / 平日=属性なし）
- [ ] **D-2 (3)** ヘッダ行の日付セルに正しい `data-dow` 属性が付く（土=sat-head / 日=sun-head）
- [ ] **D-3 (4)** 夜シフト行の全セル（9 frozen + 日付 + 合計）に `data-shift="night"` が付く
- [ ] **D-4 (3)** 昼シフト行のセルに `data-shift` が付かない（属性の不存在を確認）
- [ ] **D-5 (3)** 編集モーダル起動時、`row.shift === '夜'` なら `editMeta.getAttribute('data-shift') === 'night'`、それ以外なら属性が存在しない
- [ ] **D-6 (3)** カレンダーモーダル起動時、`row.shift === '夜'` なら `calMeta.getAttribute('data-shift') === 'night'`
- [ ] **D-7 (3)** **既存 `data-day`（日付数値）との衝突なし**: `querySelectorAll('[data-ri="0"][data-day="1"]')` が依然として 1 日目の正しいセルを返す（JS L3685）
- [ ] **D-8 (3)** `weekendColorsEnabled` トグルで全セルの `data-dow` 属性が再生成される（ON→OFFで属性が消え、OFF→ONで再付与）

### E. 見た目不変・置換完全性（30点）

- [ ] **E-1 (4)** `Grep "tbl-grid__sat\b|tbl-grid__sun\b|tbl-grid__night\b|tbl-grid__sat-head|tbl-grid__sun-head" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-2 (4)** `Grep "tbl-grid__sat\b|tbl-grid__sun\b|tbl-grid__night\b|tbl-grid__sat-head|tbl-grid__sun-head" docs/mockup/order-book.js` 結果が **0件**
- [ ] **E-3 (3)** `Grep "data-dow" docs/mockup/order-book.css` が CSS 4 箇所（sat/sun/sat-head/sun-head）ヒット
- [ ] **E-4 (3)** `Grep "data-shift" docs/mockup/order-book.css` が CSS 6 箇所（night本体1 + sticky--2 + モーダル4）ヒット
- [ ] **E-5 (3)** `Grep "data-dow" docs/mockup/order-book.js` が JS ≥4 箇所（ヘッダsun-head/sat-head + データsun/sat）ヒット
- [ ] **E-6 (3)** `Grep "data-shift" docs/mockup/order-book.js` が JS ≥3 箇所（行L577生成 + setAttribute×2）ヒット
- [ ] **E-7 (2)** `Grep "classList.toggle\('tbl-grid__night'" docs/mockup/order-book.js` 結果が **0件**
- [ ] **E-8 (3)** Before/After スクリーンショット（月表示・夜シフト行含む月）を pixel diff → 差分 < 50px²
- [ ] **E-9 (3)** 月切替・編集モーダル起動・カレンダーモーダル起動の3操作後のDOM snapshot を比較 → 属性名以外の差分ゼロ
- [ ] **E-10 (2)** `md-ob-holiday` / `md-ob-holiday-head` は M-C3 対象外として据え置かれている（Grep 結果は Before と同じ件数 2件）

### G. ガバナンス（10点）

- [ ] **G-1 (2)** `data-dow` / `data-shift` の命名が採用され、既存 `data-day`（日付数値）との衝突が回避されている
- [ ] **G-2 (2)** Governance L91 の記述が`data-day` → `data-dow/data-shift` に訂正追記されている（phase-log 末尾に訂正提案 + 該当ファイルへの追記コミット）
- [ ] **G-3 (2)** ds-migration-plan L246 も同様に訂正追記されている
- [ ] **G-4 (2)** M-C4（zebra/total の汎用化）の前提を満たす（夜シフト関連クラスが属性化され、クラス名として干渉しない）
- [ ] **G-5 (1)** phase-log に Before/After の属性付与表と「祝日は M-C4 or M-G で別途検討」の Warning 記載あり
- [ ] **G-6 (1)** `docs/plan/ds-migration-plan.md` の M-C3 行にチェックマークまたは完了コミットハッシュを追記

---

## 6. 重大Claim（Critical Claims）

次のいずれかが発生した場合、点数に関わらず **合格不可（不合格）**。

| ID | Claim | 検証方法 | 重大度 |
|----|-------|---------|--------|
| **CC-1** | 曜日色が消失・誤配置（土が日の色に / 平日に色が付く 等） | DevTools で各日付セルの computed 背景色を検証。土=`--day-sat` / 日=`--day-sun` / 平日=親背景のまま | Critical |
| **CC-2** | 夜シフト行の color/font-weight が効かない | DevTools で夜シフト行の sticky--2 セルが `color: --night-text` + `font-weight: 700` になっているか確認 | Critical |
| **CC-3** | 既存 `data-day`（日付数値）を利用した JS 動作破綻（ハイライト・月切替・行編集が動かない） | `obCnHighlightCells(ri, day)` 経由でセルハイライトを実行し、正しいセルが輝くことを確認。Playwright で月切替・編集・カレンダー起動がエラーなく動作 | Critical |
| **CC-4** | `data-dow` と `data-day` の混同によるセレクタ誤動作（例: `data-day="sat"` としてしまっている） | Grep で `data-day="sat"` / `data-day="sun"` / `data-day="night"` のリテラルが**ゼロ件**であることを確認 | Critical |
| **CC-5** | カレンダーモーダルの夜シフト装飾（会社名/契約/業務/タグの色）が崩れる | `.md-ob-cal-info-meta[data-shift="night"] .md-ob-cal-meta-*` 全4件が Before と同色で表示 | Critical |
| **CC-6** | 他モックアップ（WS/QA/SL）への波及 | `git diff --stat` が `docs/mockup/order-book.css` / `docs/mockup/order-book.js` の2ファイルに限定（HTML 変更はゼロ） | Critical |
| **CC-7** | `md-ob-holiday` / `md-ob-holiday-head` の誤触（祝日はスコープ外） | Grep 結果の `md-ob-holiday` 件数が Before と同じ（CSS 2 / JS 2） | High（Warning可） |

**合格条件: 70点以上 AND CC-1〜CC-6 いずれも未発生（CC-7 は Warning 扱い可）**

---

## 7. 実装順序の推奨

1. **Step 1**: `docs/mockup/order-book.css` のセレクタ 10行を属性セレクタに置換
2. **Step 2**: `docs/mockup/order-book.js` L577 で `rowCls` から `tbl-grid__night` を除外 → `shiftAttr` 変数に分離
3. **Step 3**: JS のグリッドセル生成ループ（L541〜L688）で、全セル HTML に `${shiftAttr}` を追記
4. **Step 4**: JS L555-556 / L614-615 の曜日クラス付与を `dowAttr` 変数経由の `data-dow` 属性付与に置換
5. **Step 5**: JS L1817 / L3093 の `classList.toggle('tbl-grid__night', ...)` を `setAttribute`/`removeAttribute` に書き換え
6. **Step 6**: ブラウザで OB 起動 → 以下を目視確認
   - 土曜・日曜の色表示
   - 夜シフト行の color + シフト列太字
   - 編集モーダル / カレンダーモーダルの夜シフト装飾
   - 月切替・行編集・カレンダー起動が動作
7. **Step 7**: Grep で `tbl-grid__(sat|sun|night|sat-head|sun-head)` 残留ゼロを確認
8. **Step 8**: Governance L91 / plan L246 の訂正追記コミット

---

## 8. 参考資料

- Governance: `docs/plan/ds-migration-governance.md` L91（M-C3 `data-day` → **本TDで `data-dow/data-shift` に訂正提案**）
- 計画: `docs/plan/ds-migration-plan.md` L246（M-C3 OB行）
- 既往: `docs/plan/phase-logs/m-c1-td-v1.md` / `m-c1-sc-v1.md` L105, L112, L143（M-C3 下地完成言及）
- OB CSS: `docs/mockup/order-book.css` L343-355, L1167-1170
- OB JS: `docs/mockup/order-book.js` L555-556, L577, L614-615, L1817, L3093
- 既存 `data-day` 使用箇所: `docs/mockup/order-book.js` L668, L683, L3680, L3685（日付数値として既定用途）
