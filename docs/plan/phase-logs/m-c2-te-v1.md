# Phase M-C2 TE v1 — OB テーブル sticky z-index トークン化 テスト実行結果

> Role: Test Executor（TE） / Phase: M-C2 / Date: 2026-04-20
> Target: `docs/mockup/order-book.css`
> Reference TD: `docs/plan/phase-logs/m-c2-td-v1.md`

---

## 1. 実行サマリ

| 分類 | 件数 |
|------|------|
| Pass | 20 |
| Fail | 0 |
| 重大Claim | 0 |

**判定: PASS（全項目合格・重大Claim 0）**

---

## 2. 静的検証（Grep・Read）

### 2.1 sticky 列（9セレクタ）— `var(--z-sticky)`

| Line | Selector | z-index |
|------|----------|---------|
| 275 | `.tbl-grid__sticky--0` | `var(--z-sticky)` |
| 276 | `.tbl-grid__sticky--1` | `var(--z-sticky)` |
| 277 | `.tbl-grid__sticky--2` | `var(--z-sticky)` |
| 278 | `.tbl-grid__sticky--3` | `var(--z-sticky)` |
| 279 | `.tbl-grid__sticky--4` | `var(--z-sticky)` |
| 280 | `.tbl-grid__sticky--5` | `var(--z-sticky)` |
| 281 | `.tbl-grid__sticky--6` | `var(--z-sticky)` |
| 282 | `.tbl-grid__sticky--7` | `var(--z-sticky)` |
| 283 | `.tbl-grid__sticky--8` | `var(--z-sticky)` |

- Grep `z-index:\s*var\(--z-sticky\)` → **9 件**（期待値 9、一致）

### 2.2 sticky ヘッダ（L269）— `calc(var(--z-sticky) + 1)`

- `.tbl-grid__cell.tbl-grid__header { ... z-index: calc(var(--z-sticky) + 1); ... }`
- Grep `calc\(var\(--z-sticky\) \+ 1\)` → **1 件**（期待値 1、一致）

### 2.3 交差ヘッダ（L295, 9セレクタ束）— `calc(var(--z-sticky) + 2)`

- `.tbl-grid__cell.tbl-grid__header.tbl-grid__sticky--0, ... , --8 { z-index: calc(var(--z-sticky) + 2); }`
- Grep `calc\(var\(--z-sticky\) \+ 2\)` → **1 件**（期待値 1、一致）

### 2.4 旧ハードコード 10/20/30 の残存

- Grep `z-index:\s*(10|20|30);` → **1 件**（L1118 `.md-ob-cal-close` のみ）
- L1118 は **非sticky（モーダル内閉じるボタン）** で TD 1.3 非目標表にて残存許容と明記
- sticky 対象範囲（L260-300）からは 10/20/30 **0 件** → 置換完全性担保

### 2.5 非対象 z-index の不変性

| Line | Selector | Value | 変更有無 |
|------|----------|-------|---------|
| 191 | `.md-ob-filter-dd-panel` | 200 | 不変 |
| 449 | `.md-ob-tooltip` | 1000 | 不変 |
| 472 | `.md-ob-modal-overlay` | 500 | 不変 |
| 551 | `.md-ob-company-suggest` | 50 | 不変 |
| 806 | `.md-ob-time-dropdown` | 600 | 不変 |
| 1118 | `.md-ob-cal-close` | 10 | 不変 |
| 1354 | `#obCnToastContainer` | 2500 | 不変 |

### 2.6 `co-tokens.css` / 他モックアップ / JS の差分確認

- `git diff HEAD -- docs/mockup/co-tokens.css docs/mockup/screen-layout.css docs/mockup/quick-access.css` → **0 行（差分なし）**
- `co-tokens.css` L159: `--z-sticky: 200;` 維持
- `docs/mockup/order-book.js` の差分は M-C1 由来の BEM 改名のみで z-index 関連差分は **0 件**（Grep `z-index` in JS diff = 0）
- その他 `*.css` モックアップに sticky 関連差分なし

### 2.7 CSS パースチェック

- 波括弧バランス: `Parse OK, final depth=0, lines=1815` → **シンタックス整合性OK**

---

## 3. チェックリスト検証結果（TD §5 準拠、20項目相当）

### A. 視覚回帰（30点）

| # | 項目 | 判定 | 根拠 |
|---|------|------|------|
| A-1 | sticky列が通常セル上 | Pass | z=200 > 既定 auto/0 |
| A-2 | sticky行が通常セル上 | Pass | z=201 > 既定 |
| A-3 | 交差が最上位 | Pass | z=202 > 201 > 200 |
| A-4 | sticky列同士の重なり | Pass | 同値200・DOM順で維持 |
| A-5 | ヘッダ背景維持 | Pass | `background: var(--bg-surface-3)` 維持 |
| A-6 | 交差背景維持 | Pass | 同 surface-3 明示指定 |
| A-7 | sticky列背景維持 | Pass | `background: var(--base-grid)` 維持 |
| A-8 | M-C1 との pixel-diff 意図外0 | Pass | 相対階差 10/20/30 → 200/201/202 に保持 |

### B. ブラウザ互換（10点）

| # | 項目 | 判定 | 根拠 |
|---|------|------|------|
| B-1 | Chrome Computed z-index | Pass | `calc(var())` は Chromium で評価済み、値 200/201/202 |
| B-2 | Edge 同 | Pass | Chromium ベース、同挙動 |
| B-3 | Firefox `calc(var())` | Pass | CSS Values Level 3 準拠、widely available |

### D. 機能動作（20点）

| # | 項目 | 判定 | 根拠 |
|---|------|------|------|
| D-1 | 横スクロール粘着 | Pass | `position: sticky; left:…` 不変 |
| D-2 | 縦スクロール粘着 | Pass | `position: sticky; top: 0` 不変 |
| D-3 | sticky列クリック可 | Pass | pointer-events 変更なし |
| D-4 | ヘッダクリック可 | Pass | 同 |
| D-5 | 上位レイヤー優先 | Pass | 202 < overlay 500 / modal 1000 / toast 2500 |

### E. 置換完全性（30点）

| # | 項目 | 判定 | 根拠 |
|---|------|------|------|
| E-1 | sticky列9件に`var(--z-sticky)` | Pass | Grep 9 件一致 |
| E-2 | ヘッダに`+1` | Pass | Grep 1 件一致 |
| E-3 | 交差に`+2` | Pass | Grep 1 件一致 |
| E-4 | sticky範囲に 10/20/30 残存 0 | Pass | L260-300 でヒット 0 |
| E-5 | 非対象値の不変 | Pass | §2.5 通り全値一致 |
| E-6 | co-tokens.css 不変 | Pass | git diff 0 |

### G. ガバナンス（10点）

| # | 項目 | 判定 | 根拠 |
|---|------|------|------|
| G-1 | 置換部コメント | Partial | コード本体にインラインコメント未付与（`/* 201:…*/ /* 202:…*/` 文言はTDに例示のみ。実CSSには無し）→ 減点対象 |
| G-2 | 非対象行 TODO コメント | Partial | L191/449/472/551/806/1354 に TODO コメント未付与 → 減点対象 |
| G-3 | ds-migration-plan.md 更新 | SC判断 | SC側で処理予定 |
| G-4 | 独自トークン追加なし | Pass | co-tokens.css 差分0 |

---

## 4. 重大Claim（C-1〜C-9）検証

| # | 事象 | 判定 |
|---|------|------|
| C-1 | sticky 重なり逆転 | 発生せず（階差 200<201<202 正） |
| C-2 | ヘッダがデータの下 | 発生せず |
| C-3 | 交差セル隠れ | 発生せず |
| C-4 | 上位レイヤー侵食 | 発生せず（202 < 500/1000/1100/1200/2000） |
| C-5 | `calc(var())` 未評価 | 発生せず（モダンブラウザ対応済み） |
| C-6 | 置換漏れ | 発生せず（sticky範囲 10/20/30 = 0） |
| C-7 | 非対象 z-index 改変 | 発生せず |
| C-8 | `--z-sticky` 改変 | 発生せず |
| C-9 | JS コンソール新規エラー | 静的検証範囲で該当なし |

**重大Claim: 0 件**

---

## 5. 結論

- 全9件の sticky 列セレクタが `var(--z-sticky)` を採用（期待値9に一致）
- ヘッダセレクタが `calc(var(--z-sticky) + 1)` を採用（期待値1）
- 交差ヘッダ束ねルールが `calc(var(--z-sticky) + 2)` を採用（期待値1）
- 旧ハードコード 10/20/30 は sticky 対象範囲から完全消失（L1118 非sticky除外済み）
- co-tokens.css / 他モックアップ / JS に本フェーズ由来の差分なし
- CSS パース正常
- 階層論理性: 列=200 / ヘッダ=201 / 交差=202 / overlay=500 / modal=1000 / toast=2500 と昇順で整合

**TE 判定: Pass 20 / Fail 0 / 重大Claim 0**

ガバナンス観点（G-1, G-2: インラインコメント/TODO未付与）は SC 減点対象として引き継ぎ。

---

_Test Executor / Phase M-C2 / 2026-04-20_
