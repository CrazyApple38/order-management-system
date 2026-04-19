# M-B1 Test Execution レポート（TE v1）

担当: Test Executor (TE)
実行日: 2026-04-18
検証対象: `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` / `docs/order-book.html` / `docs/screen-layout.html`
ベースライン: `33183fd`（M-A2/M-A3 完了時点）
テスト項目書: `docs/plan/phase-logs/m-b1-td-v1.md`

---

## 0. サマリー

| 判定 | 件数 |
|------|------|
| Pass (✅)     | 16 |
| Fail (❌)     | 9  |
| Warning (⚠️) | 5  |
| N/A (🔸)      | 1  |
| **合計**      | **31**（TD30項目 + 追加観点「不正HTML」1項目） |

**重大 Claim**: C1 / C5 / C6 に該当（**新DS `.md-fi-*` のCSS定義が実機に供給されていない**ため、編集モーダルのフォームがブラウザ既定スタイルに退行）。

**合否**: **Fail**（重大 Claim 3件発生 → 合格条件「重大 Claim 0件」を満たさず）

---

## 1. 前提調査

- 作業ツリーの差分（ベースライン → HEAD + working tree）:
  ```
  docs/mockup/order-book.css    |  41 +++---------
  docs/mockup/screen-layout.css |  34 ++--------
  docs/order-book.html          |  70 ++++++++++----------
  docs/screen-layout.html       | 144 +++++++++++++++++++++---------------------
  ```
- JS (`order-book.js` / `screen-layout.js`) 差分: **0 行**（想定どおり）
- WS / QA (`weekly-schedule.*` / `quick-access.*`) 差分: **0 行**

---

## 2. チェックリスト結果（30項目）

### 2-A. CSS定義削除 / HTMLクラス置換

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 1 | A | `order-book.css` から `.md-ob-form-row` 関連 CSS 定義が完全に削除されている | ✅ | `grep \.md-ob-form-row docs/mockup/order-book.css` → 3件ヒット全てコメント（行542/786/875）。コード定義は0件。 |
| 2 | A | `screen-layout.css` から `.md-ob-form-row` 関連 CSS 定義が完全に削除されている | ✅ | 行4193 のコメント1件のみ。コード定義は0件。 |
| 3 | A | `order-book.html` から `md-ob-form-row` / `md-ob-form-row-half` クラスが消えている | ✅ | grep ヒット **0件** |
| 4 | A | `screen-layout.html` から `md-ob-form-row` / `md-ob-form-row-half` クラスが消えている | ✅ | grep ヒット **0件** |
| 5 | A | `order-book.html` の該当 `<label>` に `class="md-fi-label"` が付与されている | ✅ | `class="md-fi-label"` が 12 件（旧`.md-ob-form-row`由来のラベル全てをカバー、信頼度/フィルタ等の対象外は除外） |
| 6 | A | 該当 `<input type="text\|tel\|url">` に `class="md-fi-input"` が付与 | ⚠️ | OB 5箇所 / SL 15箇所に付与。**ただし `screen-layout.html` 996行の `<input type="url" id="smMapUrlInput">` にはクラス未付与**（sm-map-url-row 由来の要素で M-B1 対象外ラベルと同一ブロック、仕様上どちらが正しいか曖昧）。なお 991行の `<input type="text">` には付与されているが、T30（不正HTML）に該当する class属性重複を誘発 |
| 7 | A | 該当 `<input type="number">` に `class="md-fi-input md-fi-input-number"` が付与 | ✅ | OB: 1件（行139 `editCount`）、SL: 2件（行764 `smCount`、行1419 `slAddCount`）全件付与 |
| 8 | A | 該当 `<textarea>` に `class="md-fi-textarea"` が付与 | ✅ | OB: 1件（行260 `editRemarks`）、SL: 2件（行858 `smRemarks`、行1513 `slAddRemarks`）全件付与 |
| 9 | A | 旧 `.md-ob-form-row-half` が `.md-fi-row` に置換 | ✅ | OB: 4件（TD表と一致）、SL: 6件（TD表と一致）すべて置換済 |
| 10 | A | `.md-ob-company-field` / `.md-ob-task-field` が `.md-fi-field` と併記 | ✅ | `md-fi-field md-ob-company-field`: OB行327, SL行743/1397。`md-fi-field md-ob-task-field`: OB行333, SL行748/1403 |
| 11 | A | `screen-layout.html` が 3-9 と同じ置換を全件完了 | ✅ | 上記項目で個別検証済 |

### 2-B. カラー / Coastal Palette

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 12 | B | `.md-fi-input` の `:focus` リングが `--accent-dim` 表示 | ❌ | **実機確認（Playwright）で `.md-fi-*` スタイルが一切適用されていない**（2-F 参照）。focus リングも当然出ない。**重大Claim C6 に該当** |
| 13 | B | 選択時のボーダー色が `--accent` | ❌ | 同上。実機では `border: 2px inset rgb(118,118,118)`（ブラウザ既定）になっている |
| 14 | B | ラベル色が `--text-tertiary` (#5A8896) | ❌ | 実機では `color: rgb(0, 69, 84)` = `--text-primary`（body 継承）。ラベルは `.md-fi-label` スタイルを受けておらず `--text-tertiary` にならない |
| 15 | B | Coastal Palette 外の色が混入していない | ✅ | `git diff` で追加された色リテラル 0件（変数のみ）。Palette 整合は維持 |

### 2-C. コンポーネント一貫性

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 16 | D | UI コンポーネント集と OB 編集モーダルのフォーム見た目が同一 | ❌ | 実機では `.md-fi-*` CSS が読み込まれておらず、UI集と見た目が完全乖離（ブラウザ既定状態） |
| 17 | D | `.md-fi-row > .md-fi-field` に flex: 1 が効く | ❌ | `.md-fi-row` / `.md-fi-field` のCSSルール数 = 0。flex: 1 も効かない |
| 18 | D | `.md-ob-count-confidence-row > .md-fi-field { flex-shrink: 0 }` | ✅ | order-book.css 行580、screen-layout.css 行4303 に追加済み（CSS 定義自体は存在） |

### 2-D. 機能回帰（実機）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 19 | E | 人数入力で値が保持される | ⚠️ | DOM構造・id 維持で JS 動作は継続すると想定。ただし実機で編集モーダルを開く導線（データなし状態のためテーブル行0件）でモーダルを起動できず、手動エンドツーエンドは未確認 |
| 20 | E | 契約先名サジェストが表示される | ⚠️ | 同上（モーダル起動を実機で確認できず）。ただし `.md-ob-company-field` が `.md-fi-field` と併記されているため position: relative は維持されている（CSS側OK） |
| 21 | E | 業務名サジェスト | ⚠️ | 同上 |
| 22 | E | 備考 textarea 入力/改行/保存 | ⚠️ | DOM id 維持で JS 動作は継続想定 |
| 23 | E | タイムピッカー連動 | 🔸 | `.md-ob-time-input` は本フェーズ対象外（TD §5委譲）。 未変更 |
| 24 | E | 担当者 2カラム | ❌ | `.md-fi-row` CSS 定義が読み込まれていないため、**2カラム flex レイアウトが効かない**。実機では縦積みになる恐れ大。**重大Claim C5 に該当** |
| 25 | E | フォーカスリング | ❌ | 上記 #12 と同一原因で欠落。**重大Claim C6 に該当** |

### 2-E. アクセシビリティ

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 26 | F | `<label>` と `<input>` の関連付け | ✅ | 既存の暗黙ネスト（`<label>…</label><input>`）構造は維持。`for` 属性は元々未使用。変更による劣化なし |
| 27 | F | `.md-fi-input-number` で spin button 非表示 | ❌ | `.md-fi-input-number` の CSS ルールが読み込まれていないため、`-moz-appearance: textfield` は効かず、スピナーは表示されうる |

### 2-F. 保守性

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 28 | G | 他ファイルに `.md-ob-form-row*` 参照残り | ✅ | プロジェクト全体で `.md-ob-form-row` を含むのは `docs/mockup/order-book.css`（コメント3件）、`docs/mockup/screen-layout.css`（コメント1件）、`docs/plan/*`（記述のみ）。実コードの参照 0件 |
| 29 | G | 変更箇所にコメントが残されている | ✅ | OB CSS 行542/786/875、SL CSS 行4193 に M-B1 移行コメント記載 |
| 30 | G | WS/QA CSS に `.md-ob-form-row` が混入していない | ✅ | `weekly-schedule.css` / `quick-access.css` で grep ヒット 0件 |

### 追加項目（TD 指示「不正HTML無し」）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 31 | A | class 属性の重複（`class="X" ... class="Y"`）が 0件 | ❌ | **`docs/screen-layout.html` 991行で class属性が二重に指定されている**:<br>`<input type="text" class="md-fi-input" id="smMapLabelInput" class="sm-map-title-input" placeholder="地図タイトル">`<br>HTML仕様上、後者の `class` 属性は無視される（parse error扱い）。`sm-map-title-input` クラスが効かなくなる副作用あり |

---

## 3. 実機検証（Playwright）

`http://localhost/order-management-system/docs/order-book.html` にアクセスし、DOM / CSSの実状態を取得。

### 3-1. CSSルール集計

```js
// 実行結果
document.styleSheets:
  - mockup/co-tokens.css
  - mockup/co-shared-badges.css
  - mockup/co-navbar.css?v=3
  - mockup/order-book.css
セレクタに "md-fi-" を含む CSS ルール: 0件
```

### 3-2. 計算済みスタイル

- `.md-fi-label` のサンプル: `color: rgb(0,69,84)` / `font-size: 13px` / `font-weight: 400` / `text-transform: none`
  - 期待値（新DS）: `color: var(--text-tertiary)` (#5A8896) / `font-size: 11px` / `font-weight: 600` / `text-transform: uppercase`
  - → **一致せず**（ラベル専用スタイルが適用されていない、親要素のフォント設定を継承しているのみ）

- `.md-fi-input-number` のサンプル: `width: auto` / `text-align: start` / `padding: 0` / `border: 2px inset rgb(118,118,118)` / `border-radius: 0`
  - 期待値: `width: 80px` / `text-align: center` / `padding: var(--space-sm) var(--space-md)` / `border: 1px solid var(--divider)` / `border-radius: var(--radius-sm)`
  - → **一致せず**（ブラウザ既定のまま）

### 3-3. 根本原因

`docs/order-book.html` と `docs/screen-layout.html` が読み込んでいる CSS:

```html
<link rel="stylesheet" href="mockup/co-tokens.css">
<link rel="stylesheet" href="mockup/co-shared-badges.css">
<link rel="stylesheet" href="mockup/co-navbar.css?v=3">
<link rel="stylesheet" href="mockup/order-book.css">   <!-- or screen-layout.css -->
```

**新DS `.md-fi-*` 定義元は `docs/ui-components/styles-light.css`（行 2336-2605）に存在するのみで、上記 HTML からは参照されていない**。つまり、

- CSS 削除（`.md-ob-form-row` 独自定義）はされたが、
- 代替となる `.md-fi-*` 定義が供給されていないため、
- 編集モーダルのフォームは **ラベル文字が大きく、入力欄は角も境界線も無いブラウザ既定** の状態。

結果、TD §4 の重大 Claim のうち C1（入力フォームがデフォルト表示 = レイアウト崩壊）、C5（2カラム行が縦積みになる）、C6（フォーカスリング欠落）が発生している可能性が高い。

---

## 4. 重大 Claim 検証

| # | Claim | 判定 | 根拠 |
|---|-------|------|------|
| C1 | 入力不能 | ⚠️ 潜在 | 見た目は崩壊しているが、`<input>` 要素自体は正常な DOM。タイプ操作は可能と想定。ただし UI として識別困難なレベル |
| C2 | 保存機能破壊 | 🔸 未確認 | JS 差分ゼロ、id 維持のため論理的には維持されている。E2E 未実施 |
| C3 | サジェスト破壊 | ✅ OK | `.md-ob-company-field` / `.md-ob-task-field` が `.md-fi-field` と併記で残り、`position: relative` は `order-book.css`/`screen-layout.css` 側に維持されている |
| C4 | タイムピッカー連動破壊 | ✅ OK | `.md-ob-time-input` は未変更（TD §5委譲） |
| C5 | レイアウト崩壊 | ❌ **該当** | `.md-fi-row` の CSS ルールが適用されておらず、2カラム行（担当者氏名/電話、集合場所/時間等）のフレックス配置が効かない |
| C6 | フォーカスリング欠落 | ❌ **該当** | `.md-fi-input` の `:focus` 定義がロードされていない |
| C7 | 他モックアップ波及 | ✅ OK | WS/QA 差分ゼロ |
| C8 | screen-layout 置き去り | ✅ OK | screen-layout.css/.html ともに同じ置換が適用されている |
| C9 | Coastal Palette 外色混入 | ✅ OK | 色リテラル追加なし |
| C10 | 絵文字・Unicode記号代用 | ✅ OK | 記号代用なし |

**→ C5 / C6 が実機で発生。C1 は潜在リスク。重大 Claim 少なくとも 2件。**

---

## 5. 追加発見（IM への修正依頼事項）

1. **（最優先）新DS `.md-fi-*` の CSS 定義供給問題**
   - `docs/ui-components/styles-light.css` の `.md-fi-*` 定義（行 2336-2605）は OB/SL モックアップから参照されていない
   - 対応案のいずれか:
     - (A) `order-book.html` / `screen-layout.html` に `<link rel="stylesheet" href="ui-components/styles-light.css">` を追加
     - (B) `.md-fi-*` 定義を `docs/mockup/` 配下の共通CSS（例: `co-form-fields.css`）に複製し、上記 HTML で読み込む
     - (C) `order-book.css` / `screen-layout.css` にローカルコピーを追記
   - **この対応なしには M-B1 の目的（DSフォームへの移行）が実機で達成されない**

2. **不正HTMLの修正（screen-layout.html 991行）**
   ```html
   <!-- 現状 -->
   <input type="text" class="md-fi-input" id="smMapLabelInput" class="sm-map-title-input" placeholder="地図タイトル">
   <!-- 修正 -->
   <input type="text" class="md-fi-input sm-map-title-input" id="smMapLabelInput" placeholder="地図タイトル">
   ```

3. **screen-layout.html 996行の `<input type="url">` にクラス未付与**
   - `sm-map-url-row` 配下の URL 入力欄（タイトル行と対）。`md-fi-input` を付けるのが自然だが、本フェーズ対象か判断要

4. **人数フィールドの 18px/700 装飾が失われる点**（TD 2-3差分表で明示）について、補助CSS追加の対応が現状ソースに見当たらない（必要なら M-B3 で対応）

---

## 6. 最終判定

- **合格基準**: 重大 Claim 0件 AND スコア70点以上
- **結果**: 重大 Claim ≥ 2件（C5, C6）、かつ実機スタイルがブラウザ既定まで退行 → **Fail**
- **推奨アクション**: IM が §5-1 の修正（CSS供給）＋ §5-2 の不正HTML修正を適用した後、再度 TE を実施

---

TE レポートを m-b1-te-v1.md に保存しました。Pass 16/Fail 9/Warning 5/N/A 1
