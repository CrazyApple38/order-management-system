# Phase M-C5 TE v1 — OB テーブルの密度モード対応 検証結果

> Role: Test Executor（TE） / Target: Sub-Phase **M-C5**
> TD: `docs/plan/phase-logs/m-c5-td-v1.md`
> 検証対象: `docs/order-book.html` / `docs/mockup/order-book.css`

---

## 1. 検証サマリ

| 観点 | 結果 |
|------|------|
| HTML `<html data-density="compact">` 付与 | Pass |
| CSS 4箇所のトークン化 | Pass（4/4） |
| compact 既定の解決値が現状値と一致 | Pass（28/4/28/13） |
| 密度切替で comfortable / spacious に即時連動 | Pass |
| co-tokens.css 他モックアップへの波及 | Pass（差分ゼロ） |
| CSS パースエラー | Pass（なし） |
| 固定値（header=11, total=11, tbl=12px） | Pass（維持） |
| **重大Claim（CC-1〜CC-6）** | **0件発生** |

**TE 判定**: **Pass 9 / Fail 0**

---

## 2. 個別検証結果

### 2.1 HTML L2: `<html lang="ja" data-density="compact">`

- 確認: Read `docs/order-book.html` L1-5
- 結果: L2 = `<html lang="ja" data-density="compact">` → **Pass**
- Playwright で `document.documentElement.attributes` → `["lang=ja","data-density=compact"]`、`html.dataset.density = "compact"` → **Pass**

### 2.2 CSS `.tbl-grid__cell`: `padding: var(--space-row) 6px` / `min-height: var(--tbl-row-h)`

- 確認: Read `docs/mockup/order-book.css` L249-259
- 結果:
  - L250: `padding: var(--space-row) 6px;` → **Pass**
  - L257: `min-height: var(--tbl-row-h);` → **Pass**

### 2.3 CSS `.tbl-grid__sticky--0`: `line-height: var(--tbl-row-h)`

- 確認: Read `docs/mockup/order-book.css` L275
- 結果: `line-height: var(--tbl-row-h);`（sticky--1〜8 は `line-height` 指定なし、固定列 left 座標のみ） → **Pass**

### 2.4 CSS `.tbl-grid__date-cell`: `font-size: var(--fs-density-base)`

- 確認: Read `docs/mockup/order-book.css` L309-317
- 結果: L312 = `font-size: var(--fs-density-base);` → **Pass**

### 2.5 既定 `data-density="compact"` で解決値 = 現状値

Playwright（Chromium）で `http://localhost/order-management-system/docs/order-book.html` を開き、初期属性（compact）状態で getComputedStyle を取得:

| プロパティ | 期待値 | 実測値 | 判定 |
|-----------|-------|-------|------|
| `.tbl-grid__cell.minHeight` | 28px | 28px | Pass |
| `.tbl-grid__cell.padding` | 4px 6px | 4px 6px | Pass |
| `.tbl-grid__sticky--0.lineHeight` | 28px | 28px | Pass |
| `.tbl-grid__date-cell.fontSize` | 13px | 13px | Pass |
| `.tbl-grid.fontSize`（固定） | 12px | 12px | Pass |
| `.tbl-grid__cell.tbl-grid__header.fontSize`（固定） | 11px | 11px | Pass |
| `.tbl-grid__cell--total.fontSize`（固定） | 11px | 11px | Pass |

→ **Pass**（現状値完全一致、font-size 12px の `.tbl-grid` / 11px の header / 11px の total は密度連動せず固定維持）

### 2.6 旧リテラル残存 grep（対象箇所）

```
Grep "padding: 4px 6px|min-height: 28px|line-height: 28px" docs/mockup/order-book.css
→ No matches found
```

→ L250 / L257 / L275 の3箇所が完全にトークン化済み。他の `13px` は `.tbl-grid__day-num` / `.tbl-grid__cell-count` 等の個別スコープで、密度連動対象外（TD §3.3 の判断どおり維持）→ **Pass**

### 2.7 co-tokens.css / 他モックアップ差分ゼロ

```
git diff --stat docs/mockup/co-tokens.css
→ （差分なし）
git diff --stat docs/mockup/weekly-schedule.css docs/mockup/quick-access.css
→ （差分なし）
```

→ **Pass**（CC-4 クリア）

※ `docs/mockup/screen-layout.css` は初期 git status で M だが、`git diff` 内に `data-density` / `tbl-row-h` / `space-row` / `fs-density-base` のヒットなし。本 Phase M-C5 とは無関係の既存変更のため波及外判定。

### 2.8 CSS パースエラーなし

Playwright Console: `0 errors, 1 warnings`（warning は既存の関数引数警告等で本 Phase 由来なし）。CSS 属性解決が正常に行われ、全 3 density で期待値どおり computed された時点でパースエラー不在が確認できる → **Pass**

### 2.9 密度切替動作（Playwright `setAttribute`）

`document.documentElement.setAttribute('data-density', ...)` で動的切替:

| density | `.tbl-grid__cell.minHeight` | `.tbl-grid__cell.padding` | `.tbl-grid__sticky--0.lineHeight` | `.tbl-grid__date-cell.fontSize` |
|---------|----------------------------|--------------------------|----------------------------------|--------------------------------|
| compact（既定）| 28px | 4px 6px | 28px | 13px |
| comfortable | 36px | 8px 6px | 36px | 14px |
| spacious | 44px | 12px 6px | 44px | 15px |

- 全 density で TD §5 D-1〜D-3 の期待値と完全一致
- 属性変更でページリロード不要で即時再レイアウト → **D-4 Pass**
- 固定列 sticky--0 の line-height が density に連動、縦中央揃え維持 → **D-5 Pass**

→ **Pass**（CC-1, CC-2, CC-3, CC-5 クリア、CC-6 も密度別差分が TD 範囲どおりで逸脱なし）

---

## 3. 重大Claim（CC-1〜CC-8）チェック

| ID | Claim | 結果 |
|----|-------|------|
| CC-1 | 既定 compact で行高 28px 以外 | **クリア**（28px 実測） |
| CC-2 | 既定 compact で縦 padding 4px 以外 | **クリア**（4px 6px 実測） |
| CC-3 | `data-density="comfortable"` 切替で変化なし | **クリア**（36/8/14 連動） |
| CC-4 | co-tokens.css を改変 | **クリア**（diff 空） |
| CC-5 | `<html data-density="compact">` 未追加 | **クリア**（L2 に存在） |
| CC-6 | 対象4箇所以外で見た目変化 | **クリア**（L244 tbl font / header 11 / total 11 固定維持） |
| CC-7 | 密度切替で sticky 列破綻 | **クリア**（sticky--0 line-height のみ密度連動、left 座標は 0/100/164/… 不変） |
| CC-8 | spacious 時に日付セル内容はみ出し | **クリア**（`.tbl-grid__date-cell` font 15px 時も `.tbl-grid__cell-count`(13px固定) と `.tbl-grid__cell-subtask`(7px固定) の内部指定が個別優先で折返し発生なし） |

→ Critical/High いずれも **0件発生**。

---

## 4. 判定

**TE 判定: Pass 9 / Fail 0**

M-C5 実装は TD v1 の置換マッピング（CSS 4箇所 + HTML 1箇所）を完全に満たし、既定 compact での現状値不変・3段 density 切替動作・他モックアップ非波及 の三条件をすべて達成。
