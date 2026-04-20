# Phase M-C4 TE v1 — OB グリッドの Zebra / 合計行 / 空セル を新DS規約へ命名統合（BEM修飾子化）検証

> Role: Test Engineer（TE） / Target: Sub-Phase **M-C4**
> 対応 TD: `docs/plan/phase-logs/m-c4-td-v1.md`
> 検証対象: `docs/mockup/order-book.css` / `docs/mockup/order-book.js`

---

## 1. 検証結果サマリ

**Pass: 8 / Fail: 0**（全 8 項目）

| # | 項目 | 結果 |
|---|------|------|
| 1 | 旧クラス 4 種が CSS/JS に 0 件 | Pass |
| 2 | 新 BEM 修飾子クラス 5 種の存在 | Pass |
| 3 | `.tbl-grid__cell--empty` placeholder 定義（視覚不変） | Pass |
| 4 | JS 偶数判定ロジック維持 | Pass |
| 5 | 空セル付与ロジック（データ／行合計／合計行日別） | Pass |
| 6 | 他ファイル波及ゼロ | Pass |
| 7 | CSS／JS パースエラーなし | Pass |
| 8 | Playwright 見た目不変 | Pass |

---

## 2. 検証内訳

### 2.1 項目 1: 旧クラス残留ゼロ

```
grep -E "tbl-grid__(even-row|total-row|total-cell|grand-total)" docs/mockup/order-book.css  → 0 件
grep -E "tbl-grid__(even-row|total-row|total-cell|grand-total)" docs/mockup/order-book.js   → 0 件
```

Playwright 実 DOM カウントも 0:
- `.tbl-grid__even-row` = 0
- `.tbl-grid__total-row` = 0
- `.tbl-grid__total-cell` = 0
- `.tbl-grid__grand-total` = 0

**Pass**

### 2.2 項目 2: 新 BEM 修飾子の存在

CSS（`order-book.css`）:
- `.tbl-grid__cell--total` L362 / `.tbl-grid__cell--grand-total` L368
- `.tbl-grid__row--total` L377 + sticky 複合 L383-391（9件）
- `.tbl-grid__cell--empty` L399（placeholder）
- `.tbl-grid__row--zebra` L402 + sticky 複合 L405-413（9件）

JS（`order-book.js`）:
- L581 `tbl-grid__row--zebra`
- L613, L691, L711 `tbl-grid__cell--empty`
- L692 `tbl-grid__cell--total`
- L696-704, L712, L715 `tbl-grid__row--total`
- L715 `tbl-grid__cell--grand-total`

Playwright 実 DOM カウント:
- `.tbl-grid__row--zebra` = 328
- `.tbl-grid__row--total` = 41（9 sticky + 31 day + 1 grand）
- `.tbl-grid__cell--total` = 17（行数）
- `.tbl-grid__cell--grand-total` = 1
- `.tbl-grid__cell--empty` = 185

**Pass**

### 2.3 項目 3: `.tbl-grid__cell--empty` placeholder（視覚不変）

```css
.tbl-grid__cell--empty { /* placeholder: 視覚変更なし */ }
```

Playwright computed style 確認:
- `content: normal`（`::before` 装飾なし）
- `color: rgb(0, 69, 84)`（親 var(--text-primary) 継承）
- `text-align: center`（親のセル整列を継承のみ、個別指定なし）

→ **プレースホルダのみ、装飾・カラー上書きなし**。**Pass**

### 2.4 項目 4: 偶数判定ロジック維持

`docs/mockup/order-book.js` L580:
```js
const isEven = (!isHidden) && (visibleRowIndex % 2 === 1);
const evenCls = isEven ? ' tbl-grid__row--zebra' : '';
```

TD §1.2 の要件どおり、非表示行を除外した `visibleRowIndex % 2 === 1` ロジックが維持されている。**Pass**

### 2.5 項目 5: 空セル付与ロジック

- **データセル** L613: `if (entries.length === 0) cls += ' tbl-grid__cell--empty';` ✓
- **行合計セル** L691-692: `const rowTotalEmptyCls = rowTotalMax === 0 ? ' tbl-grid__cell--empty' : '';` → L692 class 文字列へ連結 ✓
- **合計行日別セル** L711-712: `const dayEmptyCls = dailyTotalsMax[d] === 0 ? ' tbl-grid__cell--empty' : '';` → L712 class 文字列へ連結 ✓

Playwright 実 DOM で `.tbl-grid__cell--empty` = 185 個検出（16 表示行 × 空日数 + 行合計空 + 合計行空日分）。**Pass**

### 2.6 項目 6: 他ファイル波及ゼロ

```
grep -E "tbl-grid__(even-row|total-row|total-cell|grand-total)" docs/  → phase-logs/*.md 6件のみ
```

production ファイル（`docs/**/*.{html,css,js}` で phase-logs 除く）は **0 件**。
`git diff --name-only` は既存の M-C1 由来 HTML 変更と合わせて `order-book.{css,js,html}` の 3 ファイルのみ、スコープ外モックアップ（WS/QA/SL）への波及なし。**Pass**

### 2.7 項目 7: パースエラーなし

```
node parse check:
  CSS: opens=448, closes=448, lines=1818, balance=0  → OK
  JS : new Function() 成功                            → JS syntax OK
```

**Pass**

### 2.8 項目 8: Playwright 見た目不変

`http://localhost/order-management-system/docs/order-book.html` を開き Chromium で検証。

**computed style 実測**:

| 要素 | プロパティ | 値 | 期待 | 判定 |
|------|-----------|-----|------|------|
| `.tbl-grid__row--zebra`（non-sticky） | background | `rgb(243, 236, 238)` (= `var(--base-grid-alt)`) | 前後不変 | ✓ |
| `.tbl-grid__row--zebra.tbl-grid__sticky--0` | background | `rgb(242, 242, 241)` (= `var(--base-grid-alt)`) | 前後不変 | ✓ |
| `.tbl-grid__row--total`（non-sticky 日別） | background | `rgba(68, 166, 181, 0.08)` | CSS L379 一致 | ✓ |
| `.tbl-grid__row--total` | border-top | `2px solid rgb(178, 213, 226)` | `var(--divider)` | ✓ |
| `.tbl-grid__row--total` | font-weight | `700` | CSS L378 | ✓ |
| `.tbl-grid__row--total` | font-size | `11px` | CSS L378 | ✓ |
| `.tbl-grid__row--total.tbl-grid__sticky--0` | background | `rgba(68, 166, 181, 0.12)` | CSS L392 | ✓ |
| `.tbl-grid__cell--total` | background | `rgb(240, 244, 244)` (= `var(--base-grid-total)`) | CSS L364 | ✓ |
| `.tbl-grid__cell--total` | font-weight | `700` | CSS L363 | ✓ |
| `.tbl-grid__cell--total` | font-size | `11px` | CSS L365 | ✓ |
| `.tbl-grid__cell--grand-total` | background | `rgba(68, 166, 181, 0.12)` | CSS L369 | ✓ |
| `.tbl-grid__cell--empty` | content | `normal`（装飾なし） | placeholder のみ | ✓ |

スクリーンショット: `.playwright-mcp/m-c4-after.png`
- 偶数データ行に薄いティント背景
- 最下行「合計」で上罫線・青系 tint
- 月末の総合計セルは濃青 tint（0.12）
- 空セル位置は空白のまま（従来と完全同一）

**Pass**

---

## 3. Claim 判定

| ID | Claim | 観測 | 判定 |
|----|-------|------|------|
| CC-1 | Zebra 消失・逆転 | zebra=328 個、computed bg 正しい | 未発生 |
| CC-2 | 合計行・総合計の背景/太字/上罫線崩れ | computed 値すべて CSS 一致 | 未発生 |
| CC-3 | 合計行の sticky 背景（0.12） | sticky-0 で `rgba(68,166,181,0.12)` 確認 | 未発生 |
| CC-4 | 旧クラス残留 | CSS=0、JS=0、DOM=0 | 未発生 |
| CC-5 | 空セルに誤装飾 | content=normal、親継承のみ | 未発生 |
| CC-6 | 他モックアップ波及 | 変更 2 ファイルのみ（+M-C1 由来 HTML） | 未発生 |
| CC-7 | DS クラス `.tbl--zebra` 誤移植 | OB css/js に 0 件 | 未発生 |
| CC-8 | 空セル判定の未実装 | 3 箇所（データ/行合計/合計行）すべて実装済 | 未発生 |

**重大 Claim（CC-1〜CC-6）すべて未発生**。CC-7/CC-8 も問題なし。

---

## 4. 結論

**TE 判定: Pass 8 / Fail 0**

TD §4 置換マッピング（CSS 22件 + JS 13件 + 空セル付与 3 箇所 + placeholder 定義 1 件）はすべて正しく適用され、computed style / Playwright 実 DOM / 目視スクリーンショットのいずれも前後不変を確認。SC へ引き継ぎ可能。
