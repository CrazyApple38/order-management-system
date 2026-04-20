# Phase M-C4 TD v1 — OB グリッドの Zebra / 合計行 / 空セル を新DS規約へ命名統合（BEM修飾子化）

> Role: Test Designer（TD） / Target: Sub-Phase **M-C4**
> Scope: `docs/mockup/order-book.css` / `docs/mockup/order-book.js` / `docs/order-book.html`
> Upstream: M-C1（`.tbl-grid*` リネーム）/ M-C2（z-index）/ M-C3（`data-dow/data-shift`）
> Downstream: M-C5（密度モード）/ M-D（ボタン・モーダル）/ M-G（旧エイリアス削除）

---

## 1. 目的

### 1.1 主目的（M-C4 の範囲）

OB グリッドの **Zebra / 合計行 / 総合計セル / 空セル** を、新DS規約に合わせた **BEM修飾子** 命名へ統一する。
ただし OB は CSS Grid（flat `<div>` 構造）のため、DS の `<table>` ベースクラス `.tbl--zebra` / `.tbl-row--total` / `.tbl-cell--empty` をそのまま持ち込むと `:nth-child(even) td` 等の DS セレクタ仮定が崩れる。
→ **命名のみ BEM 修飾子化**し、親クラスは従来通り `.tbl-grid__cell` に残す（構造互換性の維持）。

### 1.2 採用案（TD 決定）: **案A — BEM修飾子への命名変更**

#### 置換方針

| 対象 | 旧 | 新 |
|------|----|----|
| Zebra（偶数行） | `.tbl-grid__even-row` | `.tbl-grid__row--zebra` |
| 合計行 | `.tbl-grid__total-row` | `.tbl-grid__row--total` |
| 行合計セル | `.tbl-grid__total-cell` | `.tbl-grid__cell--total` |
| 総合計セル | `.tbl-grid__grand-total` | `.tbl-grid__cell--grand-total` |
| 空セル（新規） | — | `.tbl-grid__cell--empty` |

#### 採用理由

1. **DS 整合**: BEM 修飾子 `--zebra / --total / --grand-total / --empty` で DS の `.tbl--zebra / .tbl-row--total / .tbl-cell--empty` と**同じ意味ベクトル**を持つ（sibling ネーミング）。M-G で Grid→Table 構造に寄せる際に機械置換しやすい
2. **DS 差分の現実**: OB は `<div>`-grid のため `.tbl--zebra tbody tr:nth-child(even) td { ... }` のような `tbody/tr` 前提セレクタが成立しない。よって DS クラスそのまま移植は不可。しかし命名意図だけを BEM 修飾子で揃えれば M-G での統合コストは最小化できる
3. **JS 偶数判定ロジックは維持**: `.tbl--zebra` は `:nth-child(even)` で自動化するが、OB ではヘッダ/frozen/合計が混在し DOM flat のため自動化困難。**JS の `visibleRowIndex % 2 === 1` 判定を継続**し、付与クラス名だけ変える
4. **規模が小さい**: CSS 22件 / JS 13件。find/replace + 空セル新規付与の 2 ステップで完結
5. **案B（現状維持）却下**: `even-row / total-row / total-cell / grand-total` は BEM 修飾子形式から逸脱（`__even-row` は element 扱いで `--zebra` の意味を持たない）。M-G で必ず再命名が発生する。今作業した方が安い
6. **空セル導入**: `count=0` または 値が無い日付データセルに `.tbl-grid__cell--empty` を付与し、M-G で `::before { content: "—" }` 装飾に昇格できる伏線を置く。**ただし M-C4 では装飾を入れない（視覚不変を優先）**。クラスを付けるだけ

#### 採用案の留意点

- 既存の `.tbl-grid__total-row.tbl-grid__sticky--N`（9件の複合セレクタ）は `.tbl-grid__row--total.tbl-grid__sticky--N` へ 1:1 置換
- 同様に `.tbl-grid__even-row.tbl-grid__sticky--N`（9件）も `.tbl-grid__row--zebra.tbl-grid__sticky--N` へ
- **命名上の注意**: `.tbl-grid__row--total` は「行全体のマーカー」、`.tbl-grid__cell--total` は「行合計列のセル」。意味が重ならないよう明確化（DS も同パターン: `.tbl-row--total` は `<tr>` 付与、`.tbl-cell--num` は `<td>` 付与）
- 空セル（`count=0` かつ entries 空の日付データセル）の判定は JS L673 の `entries.length === 0` で既存取得済み。`cls` に `tbl-grid__cell--empty` を追加するだけ
- **合計列の空値**（月初/月末など `rowTotalLabel === ''` の場合）も `.tbl-grid__cell--empty` 付与対象とする（DS の「—」装飾への伏線）

### 1.3 非目標（スコープ外）

- 空セルの `::before { content: "—" }` 装飾 → M-G または視覚変更フェーズ（本フェーズは**クラス付与のみ**、見た目不変を担保）
- `.tbl--zebra` の `:nth-child(even)` 自動化（CSS Grid では不可） → M-G で `<table>` 化検討時に再評価
- DS クラスそのもの（`.tbl--zebra / .tbl-row--total / .tbl-cell--empty`）の OB への適用 → M-G
- 密度モード → M-C5
- `--tbl-total-bg` など DS 変数への置き換え → M-A2 で一部済、残差は M-G
- プロパティ値の変更（背景色・font-weight・font-size・border を完全保持）

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 25 | Zebra / 合計行 / 総合計セルの見た目が完全不変 |
| ブラウザ互換（Browser） | B | 10 | Chrome/Edge/Firefox で BEM 修飾子セレクタが同一動作 |
| 機能（Domain/Behavior） | D | 20 | 偶数行付与・合計行生成・空セル付与のロジックが前後同等 |
| **見た目不変・置換完全性（Equivalence）** | **E** | **30** | **旧クラス残留ゼロ / 新クラス期待位置に存在 / 見た目前後同一** |
| ガバナンス（Governance） | G | 15 | BEM 修飾子採用と DS 整合性の phase-log 記載 / Grid→Table M-G 伏線明記 / 空セル装飾スコープ外の明示 |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0**

---

## 3. 事前調査結果

### 3.1 対象 CSS 定義（`docs/mockup/order-book.css`）

> Grep 実測: `even-row|total-row|total-cell|grand-total` で **22 件**

| # | 行 | 旧記述 | 置換後 |
|---|----|-------|--------|
| 1 | 362 | `.tbl-grid__total-cell {` | `.tbl-grid__cell--total {` |
| 2 | 368 | `.tbl-grid__grand-total {` | `.tbl-grid__cell--grand-total {` |
| 3 | 377 | `.tbl-grid__total-row {` | `.tbl-grid__row--total {` |
| 4-12 | 383-391 | `.tbl-grid__total-row.tbl-grid__sticky--N`（9件） | `.tbl-grid__row--total.tbl-grid__sticky--N`（9件） |
| 13 | 399 | `.tbl-grid__even-row {` | `.tbl-grid__row--zebra {` |
| 14-22 | 402-410 | `.tbl-grid__even-row.tbl-grid__sticky--N`（9件） | `.tbl-grid__row--zebra.tbl-grid__sticky--N`（9件） |

**CSS 置換: 22件**（find/replace で完結）

**新規 CSS（空セル・M-C4 ではクラス定義のみ、装飾なし）**:
```css
/* D2.1-#11 相当（装飾は M-G で --tbl-cell-empty-content などへ昇格予定） */
.tbl-grid__cell--empty { /* 視覚変更なし。クラスマーカーのみ */ }
```
→ **プレースホルダのみ**。装飾 `::before { content: "—" }` や `color: var(--text-disabled)` は M-C4 では入れない（視覚不変担保）。

### 3.2 対象 JS 参照（`docs/mockup/order-book.js`）

> Grep 実測: `even-row|total-row|total-cell|grand-total` で **13 件**

| # | 行 | 旧記述 | 置換後 | 種別 |
|---|----|-------|--------|------|
| 1 | 581 | `const evenCls = isEven ? ' tbl-grid__even-row' : '';` | `const evenCls = isEven ? ' tbl-grid__row--zebra' : '';` | テンプレ |
| 2 | 690 | `<div class="tbl-grid__cell tbl-grid__total-cell ${rowCls}${evenCls}" ...>` | `<div class="tbl-grid__cell tbl-grid__cell--total ${rowCls}${evenCls}" ...>` | テンプレ |
| 3 | 694 | `<div class="tbl-grid__cell tbl-grid__total-row tbl-grid__sticky--0"></div>` | `<div class="tbl-grid__cell tbl-grid__row--total tbl-grid__sticky--0"></div>` | テンプレ |
| 4-10 | 695-701 | 同上 `sticky--1 〜 --7`（7件） | `tbl-grid__row--total tbl-grid__sticky--N`（7件） | テンプレ |
| 11 | 702 | `<div class="tbl-grid__cell tbl-grid__total-row tbl-grid__sticky--8"></div>` | `tbl-grid__row--total tbl-grid__sticky--8` | テンプレ |
| 12 | 709 | `<div class="tbl-grid__cell tbl-grid__total-row">${dayLabel}</div>` | `<div class="tbl-grid__cell tbl-grid__row--total">${dayLabel}</div>` | テンプレ |
| 13 | 712 | `<div class="tbl-grid__cell tbl-grid__total-row tbl-grid__grand-total">${grandLabel}</div>` | `<div class="tbl-grid__cell tbl-grid__row--total tbl-grid__cell--grand-total">${grandLabel}</div>` | テンプレ |

**JS 置換: 13件**（find/replace で完結）

**新規 JS（空セル付与ロジック）**:

| # | 行 | 追加/変更内容 |
|---|----|------------|
| N-1 | 612 付近 | データセル `cls` 組み立て時: `if (entries.length === 0) cls += ' tbl-grid__cell--empty';`（L673 の `entries.length > 0` 判定の手前でクラス付与） |
| N-2 | 689 付近 | 行合計セル生成時: `const rowTotalEmptyCls = rowTotalMax === 0 ? ' tbl-grid__cell--empty' : '';` を導入し L690 の class 文字列に追加 |
| N-3 | 708 付近 | 合計行の日別セル: `const dayEmptyCls = dailyTotalsMax[d] === 0 ? ' tbl-grid__cell--empty' : '';` を導入し L709 に追加 |

> **注意**: `.tbl-grid__cell--empty` は M-C4 では**クラス付与のみ**。CSS 側は空定義（セレクタ存在を担保するのみ）で、視覚は前後不変。

### 3.3 HTML 静的記述（`docs/order-book.html`）

> Grep 実測: `even-row|total-row|total-cell|grand-total` で **0 件**

静的 HTML では該当クラスの記述は存在しない（グリッドは完全に JS 生成）。**HTML 置換: 0件**。

### 3.4 他モックアップへの波及

| ファイル | 波及 | 根拠 |
|---------|------|------|
| `weekly-schedule.*` | **無** | WS は独自構造、`.tbl-grid__*` は使っていない |
| `quick-access.*` | **無** | QA はグリッド非使用 |
| `screen-layout.*` | **無** | SL はコンポーネント catalog、`.tbl-grid__*` 非使用 |
| `ui-components/index-light.html` | **無** | DS の `.tbl--zebra / .tbl-row--total / .tbl-cell--empty` は `<table>` ベースで別系統。OB 命名変更とは独立 |

→ **M-C4 は OB 閉じ込めで完結**。

### 3.5 既存セレクタ（sticky / 曜日 / 夜シフト）との干渉分析

| セレクタ | 干渉リスク | 対策 |
|---------|-----------|------|
| `.tbl-grid__sticky--N` | 複合セレクタ `.tbl-grid__total-row.tbl-grid__sticky--N` が 18件存在 | 1:1 置換（上記 §3.1 #4-12, #14-22）で解消 |
| `[data-dow="sat"]` 等（M-C3） | Zebra / 合計行との背景色の優先順位 | 既存 `!important` / specificity 維持で前後不変（追加リスクなし） |
| `[data-shift="night"]`（M-C3） | 夜シフト×合計行・Zebra の色合成 | 既存スタイル継続（color のみ変更）、背景は Zebra/合計が優先で干渉なし |
| `.md-ob-row-hidden / .md-ob-row-dimmed` | 非表示行 × Zebra 判定 | 既存ロジック `isEven = !isHidden && ...` を維持（L580） |

### 3.6 空セル判定ロジックの確認

| 箇所 | 判定 | 空セル扱い |
|------|------|-----------|
| JS L607 付近（日付データセル） | `entries = getCellEntries(ri, d)`, `entries.length === 0` | Yes（空） |
| JS L673 | `if (entries.length > 0 && !isHidden) { ... }` | 既存判定を活用可能 |
| JS L689 付近（行合計セル） | `rowTotalMax === 0` で `rowTotalLabel = ''` | Yes（空） |
| JS L708 付近（合計行・日別） | `dailyTotalsMax[d] === 0` で `dayLabel = ''` | Yes（空） |
| JS L712（総合計セル） | 常に値あり（非空扱い） | No |

### 3.7 Governance / Plan の修正提案（必須）

- `docs/plan/ds-migration-governance.md` L92: 「**M-C4**: `.md-ob-even-row` → `.tbl--zebra`、合計 → `.row--total`、空セル → `.cell--empty`」
  → **OB の CSS Grid 構造上、DS の table 依存セレクタ（`.tbl--zebra tbody tr:nth-child(even) td`）は不適合。本 TD で BEM修飾子 `.tbl-grid__row--zebra / __row--total / __cell--total / __cell--grand-total / __cell--empty` を採用する。DS クラスそのものの移植は M-G（Grid→Table 構造検討と同時）に延期**と訂正追記
- `docs/plan/ds-migration-plan.md` L247-248: 同旨の訂正追記

M-C4 IC（Implementation Coder）が phase-log の最後に、上記 2 ファイルへの訂正追記コミットを行うこと（Governance 遡及修正）。

---

## 4. 置換マッピング

### 4.1 CSS 置換表（22 件）

| 旧（order-book.css） | 新 |
|----|----|
| `.tbl-grid__total-cell` | `.tbl-grid__cell--total` |
| `.tbl-grid__grand-total` | `.tbl-grid__cell--grand-total` |
| `.tbl-grid__total-row` | `.tbl-grid__row--total` |
| `.tbl-grid__total-row.tbl-grid__sticky--N`（N=0..8） | `.tbl-grid__row--total.tbl-grid__sticky--N` |
| `.tbl-grid__even-row` | `.tbl-grid__row--zebra` |
| `.tbl-grid__even-row.tbl-grid__sticky--N`（N=0..8） | `.tbl-grid__row--zebra.tbl-grid__sticky--N` |

### 4.2 JS 置換表（13 件 + 新規 3 件）

| 旧（order-book.js） | 新 |
|----|----|
| ` tbl-grid__even-row` | ` tbl-grid__row--zebra` |
| ` tbl-grid__total-cell ` | ` tbl-grid__cell--total ` |
| ` tbl-grid__total-row ` | ` tbl-grid__row--total ` |
| ` tbl-grid__grand-total` | ` tbl-grid__cell--grand-total` |

**新規追加**:

```js
// L612 付近（データ日付セル生成）
let cls = `tbl-grid__cell tbl-grid__date-cell ${rowCls}${evenCls}`;
if (entries.length === 0) cls += ' tbl-grid__cell--empty'; // ← 新規

// L689 付近（行合計セル）
const rowTotalLabel = rowTotalMax === 0 ? '' : (rowTotalMin === rowTotalMax ? `${rowTotalMax}` : `${rowTotalMin}<span class="md-ob-total-max">~${rowTotalMax}</span>`);
const rowTotalEmptyCls = rowTotalMax === 0 ? ' tbl-grid__cell--empty' : ''; // ← 新規
html += `<div class="tbl-grid__cell tbl-grid__cell--total ${rowCls}${evenCls}${rowTotalEmptyCls}" data-ri="${ri}"${shiftAttr}>${rowTotalLabel}</div>`;

// L708 付近（合計行・日別セル）
const dayLabel = dailyTotalsMax[d] === 0 ? '' : (dailyTotalsMin[d] === dailyTotalsMax[d] ? `${dailyTotalsMax[d]}` : `${dailyTotalsMin[d]}<span class="md-ob-total-max">~${dailyTotalsMax[d]}</span>`);
const dayEmptyCls = dailyTotalsMax[d] === 0 ? ' tbl-grid__cell--empty' : ''; // ← 新規
html += `<div class="tbl-grid__cell tbl-grid__row--total${dayEmptyCls}">${dayLabel}</div>`;
```

### 4.3 置換手順（推奨順）

1. **Step 1**: `docs/mockup/order-book.css` 22件を find/replace
2. **Step 2**: `docs/mockup/order-book.js` 13件を find/replace
3. **Step 3**: JS L612 付近に空セルクラス付与（データセル）を追加
4. **Step 4**: JS L689 付近に空セルクラス付与（行合計セル）を追加
5. **Step 5**: JS L708 付近に空セルクラス付与（合計行・日別）を追加
6. **Step 6**: CSS 末尾に `.tbl-grid__cell--empty { }` 空プレースホルダ定義を追加（Grep 検出用）
7. **Step 7**: ブラウザで OB 起動 → Zebra / 合計行 / 総合計セル / 空セル位置の目視確認
8. **Step 8**: Grep で `even-row|total-row|total-cell|grand-total`（Wordboundary 考慮）の残留ゼロを確認
9. **Step 9**: Governance / Plan の訂正追記コミット

---

## 5. テストチェックリスト（18項目）

> 凡例: A=視覚 / B=ブラウザ / D=機能 / E=置換完全性 / G=ガバナンス

### A. 視覚回帰（25点）

- [ ] **A-1 (5)** Zebra（偶数行背景）が `--base-grid-alt` で前後不変
- [ ] **A-2 (5)** 合計行の背景が `rgba(68,166,181,0.08)` / sticky 領域 `rgba(68,166,181,0.12)` で前後不変
- [ ] **A-3 (4)** 行合計セル（`--cell--total`）の font-weight=700 / background=`--base-grid-total` / font-size=11px が前後不変
- [ ] **A-4 (4)** 総合計セル（`--cell--grand-total`）の背景 `rgba(68,166,181,0.12)` が前後不変
- [ ] **A-5 (4)** 合計行の上罫線 `border-top: 2px solid var(--divider)` が前後不変
- [ ] **A-6 (3)** 空セル（`--cell--empty`）に装飾が適用されていない（視覚前後完全同一、placeholder 定義のみ）

### B. ブラウザ互換（10点）

- [ ] **B-1 (3)** Chrome 最新で BEM 修飾子セレクタ（`.tbl-grid__row--zebra` 等）が適用される
- [ ] **B-2 (3)** Edge 最新で同上
- [ ] **B-3 (2)** Firefox 最新で同上
- [ ] **B-4 (2)** DevTools Computed で旧クラスと同じスタイル値（背景色・font-weight・border）が出る

### D. 機能（20点）

- [ ] **D-1 (3)** 月切替（prev/next）で偶数行に正しく `tbl-grid__row--zebra` が付く（`visibleRowIndex % 2 === 1`）
- [ ] **D-2 (3)** 合計行（`--row--total`）の 9 frozen + 日別 + 総合計セルが生成される（子要素 数 = 9 + daysInMonth + 1）
- [ ] **D-3 (3)** `entries.length === 0` のデータセルに `tbl-grid__cell--empty` が付く
- [ ] **D-4 (3)** `rowTotalMax === 0` の行合計セルに `tbl-grid__cell--empty` が付く
- [ ] **D-5 (3)** `dailyTotalsMax[d] === 0` の合計行・日別セルに `tbl-grid__cell--empty` が付く
- [ ] **D-6 (3)** フィルタ ON/OFF で `tbl-grid__row--zebra` の付与位置が再計算される（表示行数の偶奇で）
- [ ] **D-7 (2)** 非表示行（`md-ob-row-hidden`）には `tbl-grid__row--zebra` が付与されない

### E. 見た目不変・置換完全性（30点）

- [ ] **E-1 (4)** `Grep "\btbl-grid__even-row\b" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-2 (4)** `Grep "\btbl-grid__(total-row|total-cell|grand-total)\b" docs/mockup/order-book.css` 結果が **0件**
- [ ] **E-3 (4)** `Grep "\btbl-grid__even-row\b" docs/mockup/order-book.js` 結果が **0件**
- [ ] **E-4 (4)** `Grep "\btbl-grid__(total-row|total-cell|grand-total)\b" docs/mockup/order-book.js` 結果が **0件**
- [ ] **E-5 (3)** `Grep "tbl-grid__row--zebra" docs/mockup/order-book.css` が CSS 10 箇所（本体1 + sticky 9件）ヒット
- [ ] **E-6 (3)** `Grep "tbl-grid__row--total" docs/mockup/order-book.css` が CSS 10 箇所（本体1 + sticky 9件）ヒット
- [ ] **E-7 (2)** `Grep "tbl-grid__cell--total\|tbl-grid__cell--grand-total" docs/mockup/order-book.css` が CSS 各1箇所
- [ ] **E-8 (3)** `Grep "tbl-grid__cell--empty" docs/mockup/order-book.(css|js)` が CSS ≥1件 / JS ≥3件ヒット
- [ ] **E-9 (3)** Before/After スクリーンショット（偶数行含む月・合計行含む月）を pixel diff → 差分 < 50px²

### G. ガバナンス（15点）

- [ ] **G-1 (3)** BEM 修飾子採用（`--zebra / --total / --grand-total / --empty`）の根拠（CSS Grid 構造 vs `<table>` 前提 DS セレクタ不適合）が phase-log に記載されている
- [ ] **G-2 (3)** Governance L92 の記述が「DS クラスそのものの移植は M-G に延期、M-C4 は BEM 修飾子化のみ」に訂正追記されている
- [ ] **G-3 (3)** ds-migration-plan L247-248 も同様に訂正追記されている
- [ ] **G-4 (2)** `.tbl-grid__cell--empty` は M-C4 ではクラス付与のみで装飾なし（視覚不変）と phase-log に明記
- [ ] **G-5 (2)** M-G（旧エイリアス削除）で `.tbl--zebra` / `.tbl-row--total` 等の DS クラス移植を再評価する旨が記載されている
- [ ] **G-6 (2)** `docs/plan/ds-migration-plan.md` の M-C4 行にチェックマークまたは完了コミットハッシュを追記

---

## 6. 重大Claim（Critical Claims）

次のいずれかが発生した場合、点数に関わらず **合格不可（不合格）**。

| ID | Claim | 検証方法 | 重大度 |
|----|-------|---------|--------|
| **CC-1** | Zebra（偶数行背景）が消失または全行・全偶奇逆転 | DevTools で偶数データ行の computed 背景 = `--base-grid-alt` / 奇数行 = 親背景であることを確認。月切替後も維持 | Critical |
| **CC-2** | 合計行または総合計セルの背景・太字・上罫線が崩れる | DevTools で `.tbl-grid__row--total > *` の background / font-weight / border-top を検証 | Critical |
| **CC-3** | 合計行セルの sticky 列背景が `rgba(68,166,181,0.12)` に切り替わらない | `.tbl-grid__row--total.tbl-grid__sticky--0〜8` の 9 件セレクタが全て存在し computed で明るい色が適用されているか確認 | Critical |
| **CC-4** | 旧クラス（`tbl-grid__even-row` / `tbl-grid__total-row` / `tbl-grid__total-cell` / `tbl-grid__grand-total`）が CSS/JS のどちらかに残留 | `\b`付 Grep 検索で CSS+JS 合計 0件 | Critical |
| **CC-5** | `tbl-grid__cell--empty` が誤って装飾付きで出力される（視覚差分発生） | CSS 定義は空プレースホルダのみ、DevTools の Computed で `content / color / text-align` 等に初期値以外が入っていないこと | Critical |
| **CC-6** | 他モックアップ（WS/QA/SL）への波及 | `git diff --stat` が `docs/mockup/order-book.css` / `docs/mockup/order-book.js` の2ファイルに限定（HTML 変更ゼロ）| Critical |
| **CC-7** | DS クラス（`.tbl--zebra` / `.tbl-row--total` / `.tbl-cell--empty`）を OB に移植してしまい構造齟齬を起こす | `Grep "\btbl--zebra\b\|\btbl-row--total\b\|\btbl-cell--empty\b" docs/mockup/order-book.*` が 0件 | High（Warning可） |
| **CC-8** | 空セル判定が行合計／合計行で未実装のまま | JS L689 付近 / L708 付近に `tbl-grid__cell--empty` 付与ロジックが存在するか確認 | High（Warning可） |

**合格条件: 70点以上 AND CC-1〜CC-6 いずれも未発生（CC-7・CC-8 は Warning 扱い可）**

---

## 7. 実装順序の推奨

1. **Step 1**: CSS 22件を find/replace（§4.1 マッピング）
2. **Step 2**: JS 13件を find/replace（§4.2 上段）
3. **Step 3**: JS L612 / L689 / L708 付近に空セルクラス付与（§4.2 下段）
4. **Step 4**: CSS 末尾に `.tbl-grid__cell--empty { }` プレースホルダ定義を追加
5. **Step 5**: ブラウザで OB 起動 → 目視確認
   - Zebra（偶数行）背景
   - 合計行の背景・sticky 領域の色差・上罫線
   - 行合計セル・総合計セルの太字＋背景
   - 空セル位置に `tbl-grid__cell--empty` が DOM に付与されている（装飾は無し）
   - 月切替・フィルタで Zebra が再計算される
6. **Step 6**: Grep で旧クラス残留ゼロを確認（`\b`付 word-boundary）
7. **Step 7**: Governance L92 / plan L247-248 の訂正追記コミット
8. **Step 8**: phase-log（`m-c4-te-v1.md` / `m-c4-sc-v1.md`）で TE/SC に引き継ぎ

---

## 8. 参考資料

- Governance: `docs/plan/ds-migration-governance.md` L92（M-C4 行、本TDで BEM修飾子化に訂正提案）
- 計画: `docs/plan/ds-migration-plan.md` L129, L135-136, L142, L247-248
- DS: `docs/ui-components/styles-light.css` L3697（`.tbl--zebra`）, L3785（`.tbl-row--total`）, L3796-3802（`.tbl-cell--empty`）
- 既往: `docs/plan/phase-logs/m-c1-td-v1.md` L177-178, L205-208（M-C4 統合予定の宣言）
- 既往: `docs/plan/phase-logs/m-c3-td-v1.md` L52-53（M-C4 スコープ外範囲）
- OB CSS: `docs/mockup/order-book.css` L362-412
- OB JS: `docs/mockup/order-book.js` L581, L612, L690, L694-702, L709, L712
