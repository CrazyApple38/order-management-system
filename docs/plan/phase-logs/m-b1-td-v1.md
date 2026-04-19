# M-B1 Test Design（TD v1）— OB `.md-ob-form-row` → 新DS `.md-fi-*` 体系への移行

担当: Test Designer (TD)
対象:
- `docs/mockup/order-book.css`（定義）
- `docs/mockup/screen-layout.css`（同定義の複製コピーが存在）
- `docs/order-book.html`（8箇所）
- `docs/screen-layout.html`（14箇所）
- `docs/mockup/order-book.js`（動的生成 0件 — JS変更不要）
前提: Phase M0 + M-A 完了（コミット `33183fd`）。OB CSS は新DS変数名参照、`body` に `font-family-body` 適用済。新DS `.md-fi-*` 定義は `docs/ui-components/styles-light.css` 行 2336-2605。
- 新DS `--accent` / `--accent-dim` は `co-tokens.css` 行 205/207 で `--accent-primary` にエイリアス済み → 機械置換で色差分は発生しない。

---

## 1. 目的と採用方針

### 目的
OB の編集フォーム系 DOM が使用しているレガシー共通クラス `.md-ob-form-row` / `.md-ob-form-row-half` を、新DSフォームクラス `.md-fi-field` / `.md-fi-row` / `.md-fi-label` / `.md-fi-input` / `.md-fi-textarea` / `.md-fi-input-number` / `.md-fi-select` へ置換する。OB独自の CSS 定義（`order-book.css` 行 544-561, 798-799, 889-898）は削除し、新DS (`styles-light.css` 2336-2605) を正とする。これにより OB 編集モーダルのフォームが UI コンポーネント集と完全一致した見た目・挙動になる。

### 採用方針: 案B（構造ごと新DS化）

**根拠:**
1. **JS 依存が無い**: `grep` 結果で `order-book.js` 内の `md-ob-form-row` 参照 0件（`classList.add` / テンプレート文字列 / `createElement` いずれも不使用）。動的生成が無いため、HTML + CSS の機械置換のみで完結する。
2. **置換箇所が限定的**: HTML 22 箇所 + CSS 2ファイルで完結。JS 改修が不要なので案B のリスクは案A（単純リネーム）とほぼ同等。
3. **ラベル体裁の差分は許容**: 新DS `.md-fi-label` は `text-transform: uppercase; letter-spacing: 0.5px` が既定。既存 OB ラベル（日本語、lowercase）と見た目が変わるが、UI コンポーネント集の他のモーダル（A/C 画面）は既にこの体裁で運用されており、揃える方向が正しい（デザインシステム準拠優先）。
4. **変数エイリアス整備済み**: 新DS側で使う `--accent` / `--accent-dim` は co-tokens.css で `--accent-primary*` にエイリアスされており、色表現は完全に同じ。
5. **案A（クラス名リネームのみ）の却下理由**: 案Aでは OB 側の `.md-ob-form-row input { padding: 10px; font-size: 12px; }` を新DSクラス名に書き換えるだけになり、`.md-fi-input` の padding(`--space-sm` + `--space-md`) / font-size(`--fs-sm` = 13px) と衝突する。結果として OB 独自の値（12px/10px）が新DS クラスを上書きし、他モックアップの `.md-fi-input` と見た目が乖離する。DS 準拠度が出ない。
6. **案C（クラス名維持でCSS統合）の却下理由**: クラス名が旧のままでは「新DS準拠」と言えない。将来 M-G（旧エイリアス削除）で破綻する。

### リスクと緩和
| リスク | 緩和策 |
|-------|--------|
| `.md-ob-count-confidence-row > .md-ob-form-row` セレクタ（行592）の依存解消 | 行592は `flex-shrink: 0` のためのセレクタ。子セレクタを `.md-fi-field` に書き換える or `.md-ob-count-confidence-row > *:first-child { flex-shrink: 0 }` に変更 |
| `.md-ob-form-row-half` の 2カラム行構造（`<div><div>...</div><div>...</div></div>`） | 新DS の `.md-fi-row` が同等機能（`flex-direction: row; gap: var(--space-md); align-items: flex-end`）。内部の `<div>` を `<div class="md-fi-field">` にすることで構造が成立 |
| `.md-ob-company-field` / `.md-ob-task-field` が `position: relative` を提供（サジェスト配置用） | 修飾クラス単独の責務として CSS 定義を残し、親クラスのみ `.md-fi-field` に変更 |
| `<input type="number">` の width/text-align が OB側で特殊（w80 / center / 18px / 700） | `.md-fi-input.md-fi-input-number` + OB 独自の size override として `font-size: 18px; font-weight: 700` のみ追記オーバーライド（フィールド信頼度入力の視覚的重要性） |
| `.md-ob-time-input` は対象外（`.md-fi-time` 独自構造） | M-B1 では触らない。 `.md-ob-time-*` は別途後続フェーズで検討（委譲リスト §5） |
| `.md-ob-confidence-field` / `.md-ob-chip-field` 等の独自ラッパーも対象外 | 対象は `.md-ob-form-row` / `.md-ob-form-row-half` のみ。他は維持 |
| screen-layout.css / screen-layout.html にも同名クラス定義 | 同じ置換を適用し、ディスクレパンシを出さない。作業は同一コミットで実施 |

### 配点（案B）

| 区分 | 配点 |
|------|------|
| A. DS準拠（トークン・命名） | **30** |
| B. カラー | **10** |
| D. コンポーネント一貫性 | **25** |
| E. 機能回帰（入力/保存動作） | **25** |
| F. アクセシビリティ | **5** |
| G. 保守性（旧クラス消去・コメント） | **5** |
| 合計 | 100 |

合格条件: **70点以上 AND 重大Claim=0**

---

## 2. 事前調査結果

### 2-1. `.md-ob-form-row` CSS 定義（order-book.css）

| 行 | セレクタ | 宣言 |
|----|---------|------|
| 543 | `.md-ob-edit-form` | `display: flex; flex-direction: column; gap: 14px` |
| 544 | `.md-ob-form-row` | `display: flex; flex-direction: column; gap: 5px` |
| 545-548 | `.md-ob-form-row label` | `font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px` |
| 549-555 | `.md-ob-form-row input, textarea` | `padding: 10px; border: 1px solid var(--divider); border-radius: 6px; font-size: 12px; font-family: inherit; transition: border-color 0.15s; background: var(--bg-surface); color: var(--text-primary)` |
| 556-560 | `.md-ob-form-row input:focus, textarea:focus` | `outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-primary-dim)` |
| 561 | `.md-ob-form-row input[type="number"]` | `width: 80px; text-align: center; font-size: 18px; font-weight: 700` |
| 592 | `.md-ob-count-confidence-row > .md-ob-form-row` | `flex-shrink: 0` |
| 798 | `.md-ob-form-row-half` | `display: flex; flex-direction: row; gap: 12px` |
| 799 | `.md-ob-form-row-half > div` | `flex: 1; display: flex; flex-direction: column; gap: 5px` |
| 889-894 | `.md-ob-form-row select` | `padding: 8px 12px; border: 1px solid var(--divider); border-radius: 6px; font-size: 13px; font-family: inherit; background: var(--bg-surface); color: var(--text-primary); transition: border-color 0.15s; appearance: auto` |
| 895-898 | `.md-ob-form-row select:focus` | `outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-primary-dim)` |

**同定義の複製:** `screen-layout.css` 行 4194-4219, 4323（ほぼ同一）。

### 2-2. `.md-ob-form-row` HTML 使用箇所

#### order-book.html（8箇所）
| 行 | パターン | 用途 |
|----|---------|------|
| 137 | `md-ob-form-row` | 人数入力（number） |
| 185 | `md-ob-form-row md-ob-form-row-half` | 開始/終了時間 2カラム |
| 203 | `md-ob-form-row md-ob-form-row-half` | 担当者（氏名/連絡先） |
| 223 | `md-ob-form-row md-ob-form-row-half` | 集合場所/集合時間 |
| 258 | `md-ob-form-row` | 備考（textarea） |
| 327 | `md-ob-form-row md-ob-company-field` | 契約先名（text + サジェスト） |
| 333 | `md-ob-form-row md-ob-task-field` | 業務名（text + サジェスト） |
| 338 | `md-ob-form-row md-ob-form-row-half` | プリセット時間 2カラム |

#### screen-layout.html（14箇所）
| 行 | パターン |
|----|---------|
| 743 | `md-ob-form-row md-ob-company-field` |
| 748 | `md-ob-form-row md-ob-task-field` |
| 762 | `md-ob-form-row` |
| 795, 813, 831 | `md-ob-form-row md-ob-form-row-half` |
| 856 | `md-ob-form-row` |
| 1397 | `md-ob-form-row md-ob-company-field` |
| 1403 | `md-ob-form-row md-ob-task-field` |
| 1417 | `md-ob-form-row` |
| 1450, 1468, 1486 | `md-ob-form-row md-ob-form-row-half` |
| 1511 | `md-ob-form-row` |

#### JS 使用 0件
`docs/mockup/order-book.js` に `md-ob-form-row` の参照なし（`classList.add` / テンプレート文字列 / `createElement` いずれも grep ヒットなし）。

#### `.md-ob-filter-*` / `.md-ob-input` は対象外
`.md-ob-filter-*` は別系列（M-B2 担当範囲）。`.md-ob-input` は `styles-light.css` 単独で定義される別の命名系で、OB 側には存在しない。

### 2-3. 新DS `.md-fi-*` との差分表

| 要素 | OB 旧値 | 新DS `.md-fi-*` 値 | 見た目差分 |
|------|--------|-------------------|-----------|
| フィールド `gap` | `5px` | `var(--space-xs)`（= 4px 想定） | ほぼ無し |
| ラベル `font-size` | `11px` | `var(--fs-caption)`（= 11px） | 同一 |
| ラベル `font-weight` | `600` | `var(--fw-semibold)`（= 600） | 同一 |
| ラベル `color` | `var(--text-secondary)` | `var(--text-tertiary)` | **やや薄くなる** |
| ラベル `text-transform` | 無し | `uppercase` | **英字のみ大文字化**（日本語は影響無し） |
| ラベル `letter-spacing` | 無し | `0.5px` | 日本語はほぼ影響無し |
| ラベル `margin-bottom` | `8px` | `var(--space-xs)` | やや詰まる |
| input `padding` | `10px` | `var(--space-sm) var(--space-md)` | 変化（トークン優先） |
| input `border-radius` | `6px` | `var(--radius-sm)` | 同等値 |
| input `font-size` | `12px` | `var(--fs-sm)`（= 13px） | **13px に拡大** |
| input:focus `box-shadow` | `0 0 0 3px var(--accent-primary-dim)` | `0 0 0 3px var(--accent-dim)` | エイリアス経由で同一 |
| input[type=number] | `width: 80px; text-align: center; font-size: 18px; font-weight: 700` | `.md-fi-input-number`: `width: 80px; text-align: center; -moz-appearance: textfield` | 18px/700 は失われる → **OB 独自補助CSS で残す必要** |
| select `font-size` | `13px` | `var(--fs-sm)`（= 13px） | 同一 |
| select `appearance` | `auto`（ブラウザ既定の▽） | `none` + カスタム SVG 背景画像 | **▽ 記号が新DS 色に変わる** |
| 2カラム行 | `.md-ob-form-row-half` (gap: 12px) | `.md-fi-row` (gap: var(--space-md), align-items: flex-end) | ほぼ同等 |

### 2-4. 置換マッピング表

| 旧 | 新 | 備考 |
|----|----|------|
| `md-ob-form-row` | `md-fi-field` | 縦積み単独 |
| `md-ob-form-row md-ob-form-row-half` | `md-fi-row` | 2カラム行（内部 `<div>` → `md-fi-field`） |
| `md-ob-form-row md-ob-company-field` | `md-fi-field md-ob-company-field` | サジェスト用に修飾クラス維持 |
| `md-ob-form-row md-ob-task-field` | `md-fi-field md-ob-task-field` | 同上 |
| `<label>` | `<label class="md-fi-label">` | |
| `<input type="text">` | `<input type="text" class="md-fi-input">` | |
| `<input type="number">` | `<input type="number" class="md-fi-input md-fi-input-number">` | |
| `<input type="tel">` | `<input type="tel" class="md-fi-input">` | |
| `<input type="url">` | `<input type="url" class="md-fi-input">` | |
| `<textarea>` | `<textarea class="md-fi-textarea">` | |
| `<select>` | `<select class="md-fi-select">` | OB 内に 0件 だが他モックアップで発生しうる |

### 2-5. 削除 / 改修 CSS（order-book.css + screen-layout.css）

**削除:**
- `.md-ob-form-row { ... }` （order-book.css 行 544, screen-layout.css 行 4194）
- `.md-ob-form-row label { ... }` (545-548, 4195-4198)
- `.md-ob-form-row input, textarea { ... }` (549-555, 4199-4211)
- `.md-ob-form-row input:focus, textarea:focus { ... }` (556-560, 4212-4216)
- `.md-ob-form-row-half { ... }` (798, 4218)
- `.md-ob-form-row-half > div { ... }` (799, 4219)
- `.md-ob-form-row select { ... }` (889-898)

**改修（セレクタ書き換え）:**
- `.md-ob-count-confidence-row > .md-ob-form-row` → `.md-ob-count-confidence-row > .md-fi-field`（order-book.css 行 592, screen-layout.css 行 4323）

**残存（意図的）:**
- `.md-ob-company-field { position: relative }`, `.md-ob-task-field { position: relative }`（サジェスト表示用）
- `<input type="number">` の 18px/700 調整は、OB スコープで `.md-fi-field input[type="number"].md-ob-count-input { font-size: 18px; font-weight: 700 }` のような補助 rule を追加 or 人数フィールドに専用クラスを付与

---

## 3. テストチェックリスト（26項目）

| # | 区分 | 項目 | 確認方法 | 合格基準 |
|---|------|------|----------|----------|
| 1 | A | `order-book.css` から `.md-ob-form-row` 関連 CSS 定義が完全に消えている | grep `"\.md-ob-form-row"` | 0件（`.md-ob-count-confidence-row > .md-fi-field` のみ残存可） |
| 2 | A | `screen-layout.css` から `.md-ob-form-row` 関連 CSS 定義が完全に消えている | 同上 | 同上 |
| 3 | A | `order-book.html` から `md-ob-form-row` / `md-ob-form-row-half` クラスが消えている | grep | 0件 |
| 4 | A | `screen-layout.html` から `md-ob-form-row` / `md-ob-form-row-half` クラスが消えている | 同上 | 同上 |
| 5 | A | `order-book.html` 内の該当 `<label>` に `class="md-fi-label"` が付与されている | 目視 + grep `"<label[^>]*md-fi-label"` | 旧 `.md-ob-form-row` 配下の全ラベルに付与 |
| 6 | A | `order-book.html` 内の該当 `<input type="text\|tel\|url">` に `class="md-fi-input"` が付与されている | 同上 | 全該当入力に付与 |
| 7 | A | `order-book.html` 内の該当 `<input type="number">` に `class="md-fi-input md-fi-input-number"` が付与されている | 同上 | 付与 |
| 8 | A | `order-book.html` 内の該当 `<textarea>` に `class="md-fi-textarea"` が付与されている | 同上 | 付与 |
| 9 | A | 旧 `.md-ob-form-row-half` が `.md-fi-row` に置換されている | grep | 全件置換 |
| 10 | A | `.md-ob-company-field` / `.md-ob-task-field` は `.md-fi-field` と併記されて残っている（position: relative のため） | grep `"md-fi-field md-ob-company-field"` | 存在 |
| 11 | A | `screen-layout.html` も 3-9 と同じ置換が全件完了している | 同上 | 完了 |
| 12 | B | `.md-fi-input` の `:focus` リングが `--accent-dim`（= `--accent-primary-dim`）で表示される | ブラウザ DevTools で実機確認 | 色コード一致（Moonstone の 12% 透過） |
| 13 | B | 選択時のボーダー色が `--accent`（= `--accent-primary`）である | 同上 | 一致 |
| 14 | B | ラベル色が `--text-tertiary`（`#5A8896`）である | 同上 | 一致 |
| 15 | B | 新DS 色の Coastal Palette 外の値が混入していない | `grep -E "#[0-9a-fA-F]{3,6}" docs/mockup/order-book.css` の差分 | Palette 内のみ |
| 16 | D | UI コンポーネント集（`index-light.html` の `#unified-form`）と OB 編集モーダルのフォーム見た目が同一（padding・font-size・角丸） | 実機並べ比較 | 体裁一致 |
| 17 | D | `.md-fi-row` 内の子 `<div>` が `.md-fi-field` になっている（`.md-fi-row > .md-fi-field` セレクタ が効く） | DevTools でスタイル確認 | flex: 1 が効く |
| 18 | D | `.md-ob-count-confidence-row > .md-fi-field { flex-shrink: 0 }` が効いている（人数入力が縮まない） | DevTools | 規定どおり |
| 19 | E | 人数入力（`#editCount`）: 数値が入力でき、保存後に値が保持される | 実機手動テスト | 入力→保存→再表示 OK |
| 20 | E | 契約先名入力（`#rowEditCompany`）: 入力するとサジェスト（`#obCompanySuggest`）が表示される | 実機手動 | サジェスト機能継続 |
| 21 | E | 業務名入力（`#rowEditTask`）: サジェスト表示が機能する | 同上 | OK |
| 22 | E | 備考 textarea（`#editRemarks`）: 入力・改行・保存すべて動作 | 実機手動 | OK |
| 23 | E | 開始/終了時間 行: タイムピッカーが開き、選択値が `<input class="md-ob-time-input">` に反映される（`.md-ob-time-input` は本フェーズ対象外で維持） | 実機手動 | OK |
| 24 | E | 担当者フィールド（現場監督/連絡先）: 2カラム表示が維持、入力・保存 OK | 実機手動 | OK |
| 25 | E | 入力中のフォーカスリングが表示される（outline: none + box-shadow） | 実機 Tab 操作 | リング可視 |
| 26 | F | `<label>` が `<input>` と関連付けされている（暗黙のネスト or `for` 属性） | HTML 構造確認 | 関連付け維持 |
| 27 | F | 数値入力 `.md-fi-input-number` で spin button が非表示、`-moz-appearance: textfield` が効く | 実機 | スピナー非表示 |
| 28 | G | 旧 `.md-ob-form-row*` クラスを参照する CSS セレクタが他ファイル（`co-*.css` 等）に残っていない | プロジェクト全体 grep `"md-ob-form-row"` | `docs/plan` 系を除き 0件 |
| 29 | G | 変更箇所に簡潔なコメント（`/* M-B1: .md-ob-form-row → .md-fi-field 移行 */` 等）がある | CSS 目視 | あり |
| 30 | G | `weekly-schedule.css` / `quick-access.css` に `.md-ob-form-row` が**追加・混入していない**（未対応モックアップへの波及防止） | grep | 0件 |

---

## 4. 重大 Claim（0件必須）

| # | Claim | 内容 |
|---|-------|------|
| C1 | **入力不能** | 編集モーダルで人数・契約先名・業務名・備考・担当者・集合場所のいずれか 1つでも、キーボード入力を受け付けない状態になる |
| C2 | **保存機能破壊** | 「保存」ボタン押下後に入力値が永続化されない、or 保存後に再オープンした際に値が消える |
| C3 | **サジェスト破壊** | `.md-ob-company-field` / `.md-ob-task-field` の `position: relative` が失われ、サジェストパネル（`.md-ob-company-suggest`）が正しい位置に出ない |
| C4 | **タイムピッカー連動破壊** | `<input class="md-ob-time-input">` へタイムピッカーの選択値が反映されない、or クリックしても開かない |
| C5 | **レイアウト崩壊** | 2カラム行（`.md-fi-row`）が縦積みになる、or 1カラム行（`.md-fi-field`）が横並びになる等の構造破壊 |
| C6 | **フォーカスリング欠落** | `<input>` フォーカス時の青リング（`box-shadow: 0 0 0 3px var(--accent-dim)`）が表示されない |
| C7 | **他モックアップへの波及** | `weekly-schedule.html` / `quick-access.html` / これらの CSS が、本フェーズの変更で既存の見た目を失う |
| C8 | **screen-layout 置き去り** | `screen-layout.css` / `screen-layout.html` のいずれかに `.md-ob-form-row` 定義・使用が残り、新旧クラスが共存してディスクレパンシが出る |
| C9 | **Coastal Palette 外の色混入** | 置換作業中に新DS 外の色が導入される |
| C10 | **絵文字・Unicode記号の代用** | `<select>` の arrow を `▼` で代用する等の代用表現が混入 |

---

## 5. 後続フェーズへの委譲リスト

M-B1 で扱わない項目：

### M-B2（フィルタドロップダウンcheckbox）へ委譲
- `.md-ob-filter-bar` / `.md-ob-filter-dd-*` 系（order-book.css 行 128-229）

### M-B3（数値入力 + tabular-nums）で扱う可能性
- `<input type="number">` の OB 独自 18px/700 装飾を `.md-fi-input-number` の variant で吸収するか判断
- 人数・金額フィールドへの `font-variant-numeric: tabular-nums` 適用確認

### M-B の追加タスク候補（TD メモ）
- `.md-ob-time-input` → `.md-fi-time` への置換（独自ポップアップ構造があるため個別計画必要）
- `.md-ob-confidence-field` / `.md-ob-chip-field` は本来 UI コンポーネント集の chip-* 系にマージすべきだが、M-E1（バッジ統合）の範囲で扱う

---

## 6. 合格条件

- **スコア 70点以上 かつ 重大Claim 0件**
- 成果物: 本書（TD v1）+ IM 実装コミット + TE レポート + SC スコアレポート
- コミットメッセージ例: `refactor(M-B1): .md-ob-form-row → .md-fi-field/.md-fi-row/.md-fi-label/.md-fi-input 体系へ移行`

---

以上。
