# Phase M-C2 TD v1 — OB テーブル sticky の z-index をDSトークン化（`--z-sticky`） テスト設計

> Role: Test Designer（TD） / Target: Sub-Phase **M-C2**
> Scope: `docs/mockup/order-book.css`（OB テーブル sticky z-index のみ）
> Upstream: Phase M0 + M-A1〜A3 + M-B1〜B3 + M-C1 完了（コミット未、累積差分あり）
> Token Source: `docs/mockup/co-tokens.css` L158-164（`--z-dropdown:100 / --z-sticky:200 / --z-overlay:900 / --z-modal:1000 / --z-popover:1100 / --z-tooltip:1200 / --z-toast:2000`）

---

## 1. 目的

### 1.1 主目的

OB テーブル（`.tbl-grid*` 命名）で sticky 列・sticky ヘッダに用いられている **z-index ハードコード値（10 / 20 / 30）** を、`co-tokens.css` で既定済の `--z-sticky`（= 200）を基準とする `var(--z-sticky)` + `calc()` に統一する。

- 目的1: 階層ルール（sticky列 < sticky行ヘッダ < 交差ヘッダ）をトークン1個（`--z-sticky`）中心で記述し、将来値変更時の一元管理を可能にする
- 目的2: 上位レイヤー（dropdown=100 / overlay=900 / modal=1000 / popover=1100 / tooltip=1200 / toast=2000）との**序列の健全性**を明示的に保証する
- 目的3: ハードコード 10/20/30 は co-tokens.css の全レイヤー（dropdown=100 が最小）より小さく、既定トークン体系と不整合なため、値の底上げ（10→200、20→201、30→202）を含む

### 1.2 採用方針（置換マッピング）

| 対象セレクタ群 | 現状値 | 置換後 | 実効値 |
|---------------|-------|--------|--------|
| `.tbl-grid__sticky--0〜8`（sticky列） | `10` | `var(--z-sticky)` | 200 |
| `.tbl-grid__cell.tbl-grid__header`（sticky行ヘッダ） | `20` | `calc(var(--z-sticky) + 1)` | 201 |
| `.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--0〜8`（交差） | `30` | `calc(var(--z-sticky) + 2)` | 202 |

- **3段階ルール**（列 < ヘッダ < 交差）を `+1 / +2` で表現。将来 `--z-sticky` を調整しても相対関係は保持される
- 専用トークン `--z-sticky-head` の新規導入は**見送り**（co-tokens.css 側の増改築を避け、本フェーズ責務である「既存トークン利用」に絞る）

### 1.3 非目標（スコープ外 / 別フェーズ）

| z-index 箇所 | 行 | 値 | 用途 | 対応方針 |
|-------------|-----|-----|------|---------|
| `.md-ob-filter-dd-panel` | 191 | `200` | フィルタドロップダウン | **本フェーズ対象外**。`--z-dropdown`(=100) へは値が乖離、別フェーズ M-C3 等で `--z-dropdown` or `--z-popover` への整理を検討 |
| `.md-ob-tooltip` | 449 | `1000` | ツールチップ | 対象外 → `--z-tooltip`(1200) 候補、別フェーズ |
| `.md-ob-modal-overlay` | 472 | `500` | モーダル遮蔽 | 対象外 → `--z-overlay`(900) 候補、別フェーズ |
| `.md-ob-company-suggest` | 551 | `50` | サジェスト | 対象外 → `--z-dropdown`(100) 候補、別フェーズ |
| `.md-ob-time-dropdown` | 806 | `600` | 時刻入力 DD | 対象外 → `--z-popover`(1100) 候補、別フェーズ |
| `.md-ob-cal-close` | 1118 | `10` | モーダル内 閉じるボタン | モーダル内部レイヤー、対象外 |
| `#obCnToastContainer` | 1354 | `2500` | トースト | 対象外 → `--z-toast`(2000) 候補、別フェーズ |

> これら非対象の z-index はすべて `co-tokens.css` のレイヤートークンに将来整合させる方針を、SC 時のコメント（CSSコメントブロック）で明示する。

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 30 | sticky 列・行・交差の重なり順、スクロール時の見え方 |
| ブラウザ互換（Browser） | B | 10 | Chrome / Edge / Firefox で同一の積層 |
| 機能動作（Domain/Behavior） | D | 20 | 横スクロール・縦スクロール時の粘着動作、クリック可否 |
| **置換完全性（Exhaustiveness）** | **E** | **30** | **対象 18 セレクタの置換漏れ0、`var(--z-sticky)` 参照数の一致** |
| ガバナンス | G | 10 | コメント明示、非対象z-indexの方針明記、命名整合 |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0件**

---

## 3. 事前調査結果（OB CSS z-index 全件）

### 3.1 `order-book.css` の z-index ハードコード全件

| 行 | セレクタ / 文脈 | 値 | 用途カテゴリ | 本フェーズ対象 |
|----|----------------|----|-----------| :---: |
| 191 | `.md-ob-filter-dd-panel` | 200 | dropdown | × |
| **269** | **`.tbl-grid__cell.tbl-grid__header`** | **20** | **sticky-header** | **◎** |
| **275** | **`.tbl-grid__sticky--0`** | **10** | **sticky-col** | **◎** |
| **276** | **`.tbl-grid__sticky--1`** | **10** | **sticky-col** | **◎** |
| **277** | **`.tbl-grid__sticky--2`** | **10** | **sticky-col** | **◎** |
| **278** | **`.tbl-grid__sticky--3`** | **10** | **sticky-col** | **◎** |
| **279** | **`.tbl-grid__sticky--4`** | **10** | **sticky-col** | **◎** |
| **280** | **`.tbl-grid__sticky--5`** | **10** | **sticky-col** | **◎** |
| **281** | **`.tbl-grid__sticky--6`** | **10** | **sticky-col** | **◎** |
| **282** | **`.tbl-grid__sticky--7`** | **10** | **sticky-col** | **◎** |
| **283** | **`.tbl-grid__sticky--8`** | **10** | **sticky-col** | **◎** |
| **295** | **`.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--0〜8`**（9セレクタ束） | **30** | **sticky-header × sticky-col 交差** | **◎** |
| 449 | `.md-ob-tooltip` | 1000 | tooltip | × |
| 472 | `.md-ob-modal-overlay` | 500 | overlay | × |
| 551 | `.md-ob-company-suggest` | 50 | suggest | × |
| 806 | `.md-ob-time-dropdown` | 600 | time dropdown | × |
| 1118 | `.md-ob-cal-close` | 10 | modal内ボタン | × |
| 1354 | `#obCnToastContainer` | 2500 | toast | × |

**sticky 関連 z-index 箇所: 11 宣言（内訳: ヘッダ=1 / sticky列=9 / 交差ルール=1）**

### 3.2 sticky 積層の意図（現行）

- **列 z=10**: 左固定列が通常セルの上に乗る
- **ヘッダ z=20**: 上固定ヘッダが通常セル + sticky列の上に乗る
- **交差 z=30**: 左上角のヘッダセル（sticky行 × sticky列）が、縦スクロール時にsticky列に隠れず、横スクロール時にヘッダ行に隠れない最上位
- **1000 行ヘッダ（ノート）**: 現状値 10/20/30 は互いに階差があれば意図を満たすため、200/201/202 への底上げでも相対関係は同一

### 3.3 `co-tokens.css` z-index 既定（出典）

```
--z-dropdown: 100;
--z-sticky:   200;
--z-overlay:  900;
--z-modal:    1000;
--z-popover:  1100;
--z-tooltip:  1200;
--z-toast:    2000;
```

sticky の値 200 は、dropdown（100）より上、overlay（900）より下。**sticky 列と交差ヘッダに +1/+2 を加えても 202 以下**で、overlay/modal を侵食しない。

---

## 4. 置換マッピング（詳細）

### 4.1 置換前 → 置換後（行単位）

#### (a) ヘッダ行（L269）

```css
/* Before */
.tbl-grid__cell.tbl-grid__header {
    ...
    z-index: 20;
    ...
}

/* After */
.tbl-grid__cell.tbl-grid__header {
    ...
    z-index: calc(var(--z-sticky) + 1); /* 201: sticky列(200)より上 */
    ...
}
```

#### (b) sticky 列（L275-283、9セレクタ）

```css
/* Before (各行) */
.tbl-grid__sticky--N { position: sticky; left: ...; z-index: 10; background: ...; }

/* After */
.tbl-grid__sticky--N { position: sticky; left: ...; z-index: var(--z-sticky); background: ...; }
```

#### (c) 交差（L294-297、9セレクタ束ねの1宣言）

```css
/* Before */
.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--0,
... ,
.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--8 {
    z-index: 30;
    background: var(--bg-surface-3);
}

/* After */
.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--0,
... ,
.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--8 {
    z-index: calc(var(--z-sticky) + 2); /* 202: 交差の最上位 */
    background: var(--bg-surface-3);
}
```

### 4.2 置換件数

| 層 | 置換セレクタ数 | 置換 z-index 宣言数 |
|----|--------------|-------------------|
| sticky 列 | 9 (`--0〜8`) | 9 |
| sticky ヘッダ | 1 | 1 |
| 交差（束ねルール） | 9 (`--0〜8`) | 1（ルール単位） |
| **合計** | **19 セレクタ** | **11 宣言** |

### 4.3 `.tbl-grid__total-row.tbl-grid__sticky--N` の存在確認

- 本フェーズの事前調査範囲（`order-book.css`）では `.tbl-grid__total-row` 配下で追加の z-index 宣言は検出されていない
- 合計行は通常の `.tbl-grid__sticky--N` を共用し、上書きなしで `var(--z-sticky)` の恩恵を受ける想定

---

## 5. テストチェックリスト（18項目）

### A. 視覚回帰（30点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| A-1 | sticky列（左固定列）が通常セルの上に表示される | 4 | 横スクロールしても列0〜8が隠れない |
| A-2 | sticky行（ヘッダ）が通常セルの上に表示される | 4 | 縦スクロールしてもヘッダが隠れない |
| A-3 | sticky列 × sticky行 の交差セル（左上角）が最上位 | 4 | 縦横同時スクロール時も可視 |
| A-4 | sticky列同士の重なり順（左から右）が維持される | 3 | `--0` が `--8` より左で可視 |
| A-5 | ヘッダの背景色（`--bg-surface-3`）がスクロール時も崩れない | 3 | 背景透過で下層が透けない |
| A-6 | 交差セルの背景色（`--bg-surface-3`）がスクロール時も崩れない | 3 | 同上 |
| A-7 | sticky列背景（`--base-grid`）がスクロール時に維持 | 3 | 下のセルが透けない |
| A-8 | M-C1 時点のスクリーンショットと pixel-diff で**意図外差分 0** | 6 | 重なり順・背景色に変化なし |

### B. ブラウザ互換（10点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| B-1 | Chrome で計算値 200/201/202 が DevTools で確認できる | 3 | Computed z-index 値確認 |
| B-2 | Edge で同上 | 3 | 同上 |
| B-3 | Firefox で `calc(var())` が正しく評価される | 4 | Computed 201/202 確認、重なり順正常 |

### D. 機能動作（20点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| D-1 | 横スクロール時、sticky列が左端に粘着し続ける | 4 | position:sticky 挙動維持 |
| D-2 | 縦スクロール時、sticky行が上端に粘着し続ける | 4 | 同上 |
| D-3 | sticky列セルのクリック（編集・選択）が通常通り動作 | 4 | ポインタイベントが z=200 に届く |
| D-4 | ヘッダのクリック（ソート・フィルタ起動）が通常通り動作 | 4 | 同上 |
| D-5 | 上位レイヤー（モーダル z=500、tooltip z=1000）が sticky を正しく覆う | 4 | モーダル起動時に sticky 列が前面に出ない |

### E. 置換完全性（30点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| E-1 | `.tbl-grid__sticky--0〜8` の 9 宣言すべてに `var(--z-sticky)` が入る | 6 | Grep で `\.tbl-grid__sticky--\d.*z-index: var\(--z-sticky\)` が 9 件 |
| E-2 | `.tbl-grid__cell.tbl-grid__header` に `calc(var(--z-sticky) + 1)` が入る | 5 | Grep で `+ 1` ヒット 1件 |
| E-3 | 交差ルールに `calc(var(--z-sticky) + 2)` が入る | 5 | Grep で `+ 2` ヒット 1件 |
| E-4 | 置換後 `order-book.css` で、sticky 対象範囲（L260-300）に **数値 10/20/30 の z-index が0件** | 6 | Grep `z-index:\s*(10|20|30);` 範囲内 0件 |
| E-5 | 非対象（dropdown/modal/tooltip/toast 等）の z-index が**意図せず変更されていない** | 4 | 行 191/449/472/551/806/1118/1354 の値不変 |
| E-6 | `co-tokens.css` は変更されていない（トークン値不変） | 4 | `--z-sticky: 200;` 維持 |

### G. ガバナンス（10点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| G-1 | sticky 置換部に「M-C2: sticky z-index を `--z-sticky` に統一」コメントが追記されている | 3 | L260 付近にコメント |
| G-2 | 非対象の z-index（191, 449, 472, 551, 806, 1354）に「M-C3+ で `--z-*` 化予定」の TODO コメントを追加 | 3 | 各行付近にコメント |
| G-3 | `ds-migration-plan.md` の M-C2 チェック欄更新（SC 時） | 2 | 完了マーク |
| G-4 | 命名整合: `--z-sticky-head` 等の独自トークンを増やしていない | 2 | co-tokens.css 差分0 |

**合計: 30 + 10 + 20 + 30 + 10 = 100点**

---

## 6. 重大Claim（Showstopper）

いずれか1件でも発生したら**即座に不合格**。

| # | 事象 | 検知方法 |
|---|------|---------|
| C-1 | **sticky 重なり逆転**（sticky列がヘッダの上に出る、または通常セルが sticky 列の上に出る） | A-1 〜 A-4、D-1, D-2 |
| C-2 | **ヘッダがデータ行の下に隠れる**（縦スクロール時、ヘッダが不可視） | A-2、D-2 |
| C-3 | **交差セルが sticky列 or sticky行 の下に隠れる** | A-3 |
| C-4 | **モーダル / ドロップダウン / tooltip / toast が sticky に侵食される**（上位レイヤーが sticky 列の下に潜る） | D-5、上位 z=500/1000/1100/1200/2000 との比較 |
| C-5 | `calc(var(--z-sticky) + N)` がいずれかのブラウザで未評価（値が `auto` 扱い）になる | B-3、DevTools Computed |
| C-6 | 置換漏れ（sticky 対象範囲に数値 10/20/30 が残存） | E-4 |
| C-7 | 非対象 z-index（dropdown/modal/tooltip等）の値が意図せず変更された | E-5 |
| C-8 | `co-tokens.css` の `--z-sticky` が改変された | E-6 |
| C-9 | JSコンソールに新規エラーが発生 | DevTools Console |

---

## 7. 合格条件

- **70点以上** AND **重大Claim=0件**
- 70点未満または重大Claim>0 → SC にて修正方針策定 → TE 再実行

---

## 8. 実装時の注意（SC への申し送り）

1. **置換は `order-book.css` のみ**（`co-tokens.css` は触らない、新規トークン導入しない）
2. **3段階ルール（200 / 201 / 202）を崩さない**
   - 将来 sticky 列を増やす場合も `var(--z-sticky)` 固定、ヘッダは `+1`、交差は `+2` を厳守
3. **非対象 z-index には TODO コメントを付与**
   - 対象: L191 / L449 / L472 / L551 / L806 / L1118 / L1354
   - 文面例: `/* TODO M-C3+: co-tokens --z-dropdown / --z-overlay / --z-modal / --z-popover / --z-tooltip / --z-toast に統一予定 */`
4. **視覚回帰確認は実ブラウザで縦横スクロール両方を試す**
5. **他モックアップへの波及: `screen-layout.css` / `quick-access.css` 等の同名トークンは別フェーズ対象**
6. **Grep 確認項目（SCで実施）**
   - 置換後: `z-index: var(--z-sticky)` 9件、`calc(var(--z-sticky) + 1)` 1件、`calc(var(--z-sticky) + 2)` 1件
   - 置換前 sticky 対象範囲（L260-300）: `z-index:\s*(10|20|30);` 0件

---

## 9. 参考: Phase 間依存

- **上流**: M0（co-tokens.css トークン定義）、M-A1〜A3（OB のトークン参照基盤）、M-C1（OB その他スコープ）
- **下流**: M-C3+ で dropdown/modal/tooltip/toast の z-index をトークン化する際、本フェーズで追加した TODO コメントが起点となる
- **横断**: SL（screen-layout.css）の sticky z-index も同方針で別フェーズ対応（命名整合のため `var(--z-sticky)` を共通で使用）

---

_作成: Test Designer / Phase M-C2 TD v1 / 2026-04-20_
