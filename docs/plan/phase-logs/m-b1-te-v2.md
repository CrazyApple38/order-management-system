# M-B1 Test Execution レポート（TE v2）— 修正反映後の再検証

担当: Test Executor (TE)
実行日: 2026-04-20
検証対象:
- `docs/mockup/co-forms.css`（新設 / 256行）
- `docs/mockup/order-book.css`（.md-ob-form-row 系定義削除・補助CSS追加済）
- `docs/mockup/screen-layout.css`（同上）
- `docs/order-book.html`（link追加 + クラス置換済）
- `docs/weekly-schedule.html`（link追加のみ）
- `docs/quick-access.html`（link追加のみ）
- `docs/screen-layout.html`（link追加 + クラス置換 + L991 修正済）

ベースライン: M-B1 v1 実装 + 修正コミット
テスト項目書: `docs/plan/phase-logs/m-b1-td-v1.md`
前提: v1 で検出した重大Claim 2件（C5「.md-fi-* CSS 定義が供給されていない」/ C6「フォーカスリング欠落」）および不正HTML 1件（SL L991 class属性重複）の修正反映後の再検証。

---

## 0. サマリー

| 判定 | 件数 |
|------|------|
| Pass (✅)     | 28 |
| Fail (❌)     | 0  |
| Warning (⚠️) | 2  |
| N/A (🔸)      | 1  |
| **合計**      | **31**（TD30項目 + 追加観点「不正HTML」1項目） |

**重大 Claim**: **C1〜C10 すべて解消。0件。**

**合否**: **Pass**（重大 Claim 0件 かつ スコア 70 点以上見込み）

**注意点（⚠️）**:
- W1. SL の人数入力（`#smCount` / `#slAddCount`）の 18px/700 強調が SL CSS 側で `.md-sp-edit-modal .md-fi-input-number` / `.md-nav-modal .md-fi-input-number` にスコープされているが、SL HTML 内にこれら祖先クラスが存在しない → SL では人数強調が発火しない。軽微だが TD T19/T27 の機能的要件との乖離あり。OB 側（`.md-ob-edit-form` スコープ）は実機で 18px/700 が正しく適用されている。
- W2. QA の `<link>` 順序が `co-tokens → co-forms → co-navbar → co-shared-badges → quick-access` で、他 3 HTML の順序（`co-tokens → co-forms → co-shared-badges → co-navbar → ...`）とわずかに異なる。必須条件「co-tokens → co-forms の順序」は全 4 HTML で満たされているため機能影響なし。命名整合性として揃えるのが望ましい（軽微）。

---

## 1. 前提調査

### 1-1. 対象ファイル存在確認

| ファイル | サイズ | 日時 |
|---------|-------|-----|
| `docs/mockup/co-forms.css` | 7,383 B | 2026-04-20 06:49（新設） |
| `docs/mockup/co-tokens.css` | 8,964 B | 2026-04-18 |
| `docs/mockup/order-book.css` | 60,028 B | 2026-04-20 06:35 |
| `docs/mockup/screen-layout.css` | 105,115 B | 2026-04-20 06:35 |

### 1-2. co-forms.css 定義内容（必須9クラス）

| クラス | 存在 | 備考 |
|-------|------|------|
| `.md-fi-label` | ✅ L14-22 | font-size:var(--fs-caption) / color:var(--text-tertiary) / text-transform:uppercase |
| `.md-fi-field` | ✅ L25-29 | display:flex / flex-direction:column / gap:var(--space-xs) |
| `.md-fi-row` | ✅ L30-35 | display:flex / gap:var(--space-md) / align-items:flex-end / `>.md-fi-field{flex:1}` |
| `.md-fi-input` | ✅ L38-71 | hover/focus/placeholder/disabled/error variant 網羅 |
| `.md-fi-input-number` | ✅ L74-83 | width:80px / text-align:center / -moz-appearance:textfield / webkit spinner除去 |
| `.md-fi-textarea` | ✅ L86-111 | resize:vertical / min-height:60px |
| `.md-fi-time` | ✅ L114-148 | タイムピッカー（wrap + icon 付帯） |
| `.md-fi-select` | ✅ L229-256 | appearance:none + SVG矢印背景 |
| `.md-fi-combo` | ✅ L151-226 | combo input/toggle/clear/dropdown/option 一式 |

---

## 2. チェックリスト結果（30項目 + 追加1項目）

### 2-A. CSS定義削除 / HTMLクラス置換

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 1 | A | `order-book.css` から `.md-ob-form-row` 関連 CSS 定義が完全に削除 | ✅ | grep ヒット 3 件、全てコメント（L542/786/875）。コード定義 0 件。 |
| 2 | A | `screen-layout.css` から `.md-ob-form-row` 関連 CSS 定義が完全に削除 | ✅ | L4193 コメント 1 件のみ。コード定義 0 件。 |
| 3 | A | `order-book.html` から `md-ob-form-row` / `md-ob-form-row-half` が消えている | ✅ | grep 0 件。 |
| 4 | A | `screen-layout.html` から同上 | ✅ | grep 0 件。 |
| 5 | A | `order-book.html` のラベルに `md-fi-label` 付与 | ✅ | OB HTML 内 `md-fi-label` 計 12 件、該当ラベル全てをカバー。 |
| 6 | A | 該当 `<input type="text\|tel\|url">` に `md-fi-input` 付与 | ✅ | OB 6 件 / SL 15 件付与（SL の `#smMapLabelInput` からは意図的に除去済）。 |
| 7 | A | 該当 `<input type="number">` に `md-fi-input md-fi-input-number` 付与 | ✅ | OB: `editCount` / SL: `smCount`, `slAddCount` 全件付与。 |
| 8 | A | 該当 `<textarea>` に `md-fi-textarea` 付与 | ✅ | OB: `editRemarks` / SL: `smRemarks`, `slAddRemarks` 全件付与。 |
| 9 | A | 旧 `.md-ob-form-row-half` が `.md-fi-row` に置換 | ✅ | OB 4 件 / SL 6 件置換、grep で旧クラス 0 件。 |
| 10 | A | `.md-ob-company-field` / `.md-ob-task-field` が `.md-fi-field` と併記 | ✅ | OB: `md-fi-field md-ob-company-field` L328, `md-fi-field md-ob-task-field` L334。SL: L744/749/1398/1404。 |
| 11 | A | `screen-layout.html` も 3-9 と同じ置換が全件完了 | ✅ | 個別に検証済。 |

### 2-B. カラー / Coastal Palette

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 12 | B | `.md-fi-input` の `:focus` リングが `--accent-dim` 表示 | ✅ | 実機 Playwright で `boxShadow: rgba(68, 166, 181, 0.12) 0px 0px 0px 3px` を確認（`#44A6B5` の 12% 透過）。 |
| 13 | B | 選択時のボーダー色が `--accent` (`#44A6B5`) | ✅ | 実機で focus 時 `borderColor: rgb(68, 166, 181)` を確認。 |
| 14 | B | ラベル色が `--text-tertiary` (`#5A8896`) | ✅ | 実機で `color: rgb(90, 136, 150)` = `#5A8896`。Phase D6.1 の WCAG AA（4.6:1）値。 |
| 15 | B | Coastal Palette 外の色が混入していない | ✅ | `co-forms.css` 内のハードコード色は L70 の `rgba(219,87,123,0.12)` = `--semantic-error` (`#DB577B`) の 12% 透過 1 件のみ（エラーリング用、Palette 内）。他は全て `var(--*)` 参照。 |

### 2-C. コンポーネント一貫性

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 16 | D | UI コンポーネント集と OB 編集モーダルのフォーム見た目が同一 | ✅ | 実機で padding `8px 12px` / font-size `13px` / border-radius `4px` / label 11px uppercase など UI 集 `.md-fi-*` と同値。 |
| 17 | D | `.md-fi-row > .md-fi-field` に `flex: 1` が効く | ✅ | `co-forms.css` L35 に定義。実機で 2 カラム行（担当者氏名/電話等）が均等幅で表示される。 |
| 18 | D | `.md-ob-count-confidence-row > .md-fi-field { flex-shrink: 0 }` | ✅ | OB CSS L580 / SL CSS L4303 に定義、実機で `flex-shrink: 0` 確認。 |

### 2-D. 機能回帰（実機 Playwright）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 19 | E | 人数入力で値が保持される | ✅ | 実機で `editCount.value='5'` → 値保持確認。**OB は 18px/700 強調が適用**（`.md-ob-edit-form .md-fi-input-number` で発火）。ただし SL では祖先クラス不在で 18px/700 が発火せず（W1 参照） |
| 20 | E | 契約先名サジェスト（`#rowEditCompany`） | ✅ | `.md-fi-field md-ob-company-field` の `position: relative` 維持（実機で `relative` 確認）。JS 側 `obCompanySuggest()` 呼び出し導線維持。 |
| 21 | E | 業務名サジェスト（`#rowEditTask`） | ✅ | 同上。`.md-ob-task-field` `position: relative` 維持。 |
| 22 | E | 備考 textarea 入力/保存 | ✅ | 実機で `editRemarks.value='TEST_REMARK_VALUE'` → 値保持確認。 |
| 23 | E | タイムピッカー連動 | 🔸 | `.md-ob-time-input` は TD §5 で本フェーズ対象外と委譲済み。未変更。 |
| 24 | E | 担当者 2 カラム（氏名 / 連絡先） | ✅ | 実機で `.md-fi-row` の `display: flex / flex-direction: row / gap: 12px / align-items: flex-end` を確認。担当者氏名と連絡先が横並び表示。 |
| 25 | E | フォーカスリング | ✅ | 実機で `boxShadow: rgba(68,166,181,0.12) 0px 0px 0px 3px` / `outline: none` を確認。 |

### 2-E. アクセシビリティ

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 26 | F | `<label>` と `<input>` の関連付け | ✅ | 暗黙ネスト構造（`<div class="md-fi-field"><label…><input…></div>`）で維持。変更による劣化なし。 |
| 27 | F | `.md-fi-input-number` で spin button 非表示 | ✅ | `co-forms.css` L77-83 で `-moz-appearance: textfield` + `::-webkit-*-spin-button { appearance: none }`。実機で `editCount` width 80px で正常描画。 |

### 2-F. 保守性

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 28 | G | 他ファイルに `.md-ob-form-row*` 参照残り | ✅ | 実コード参照 0 件（OB/SL CSS のコメント 4 件、`docs/plan/*` 記述のみ）。 |
| 29 | G | 変更箇所にコメント残存 | ✅ | OB CSS L542/786/875、SL CSS L4193 に M-B1 移行コメント記載。 |
| 30 | G | WS/QA CSS に `.md-ob-form-row` が混入していない | ✅ | `weekly-schedule.css` / `quick-access.css` grep ヒット 0 件。 |

### 追加項目（TD 指示「不正HTML無し」）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|------|------|------|------|
| 31 | A | class 属性の重複（`class="X" ... class="Y"`）が 0 件 | ✅ | `grep -cE 'class="[^"]*" [^>]*class="'` で 4 HTML すべて 0 件。SL L991 は `class="sm-map-title-input"` のみ、`md-fi-input` は除去済。 |

---

## 3. 実機検証（Playwright）

### 3-1. 環境
- URL: `http://localhost/order-management-system/docs/{order-book,screen-layout,weekly-schedule,quick-access}.html`
- XAMPP Apache/2.4.58 / PHP 8.2.12
- キャッシュバスト: 各 `<link>` に `?v=<timestamp>` を付与して強制再フェッチ

### 3-2. CSSリンク順序確認

| HTML | 順序 |
|------|------|
| `docs/order-book.html` L7-11 | co-tokens → **co-forms** → co-shared-badges → co-navbar → order-book |
| `docs/screen-layout.html` L7-? | co-tokens → **co-forms** → co-shared-badges → co-navbar → screen-layout |
| `docs/weekly-schedule.html` L7-? | co-tokens → **co-forms** → co-shared-badges → co-navbar → weekly-schedule |
| `docs/quick-access.html` L7-? | co-tokens → **co-forms** → co-navbar → co-shared-badges → quick-access（W2） |

いずれも `co-tokens.css → co-forms.css` の順序は保たれており、トークン → フォーム部品定義の依存関係は正しく解決される。

### 3-3. OB 編集モーダル実測値（`editModalOverlay`）

| 要素 | プロパティ | 実機値 | 期待値 | 判定 |
|------|-----------|-------|-------|------|
| `.md-fi-label` | font-size | `11px` | `11px` (--fs-caption) | ✅ |
|  | font-weight | `600` | `600` (--fw-semibold) | ✅ |
|  | color | `rgb(90,136,150)` = `#5A8896` | `--text-tertiary` | ✅ |
|  | text-transform | `uppercase` | `uppercase` | ✅ |
|  | letter-spacing | `0.5px` | `0.5px` | ✅ |
| `.md-fi-input` (`#editSupervisor`) | font-size | `13px` | `13px` (--fs-sm) | ✅ |
|  | padding | `8px 12px` | `--space-sm --space-md` | ✅ |
|  | border-radius | `4px` | `--radius-sm` | ✅ |
|  | border | `1px solid rgb(178,213,226)` | `1px solid var(--divider)` | ✅ |
|  | :focus border-color | `rgb(68,166,181)` | `--accent` (`#44A6B5`) | ✅ |
|  | :focus box-shadow | `rgba(68,166,181,0.12) 0px 0px 0px 3px` | `0 0 0 3px var(--accent-dim)` | ✅ |
| `.md-fi-input-number` (`#editCount`) | font-size | `18px` | `18px`（OB 強調） | ✅ |
|  | font-weight | `700` | `700`（OB 強調） | ✅ |
|  | width | `80px` | `80px` | ✅ |
|  | text-align | `center` | `center` | ✅ |
| `.md-fi-textarea` (`#editRemarks`) | font-size | `13px` | `13px` | ✅ |
|  | resize | `vertical` | `vertical` | ✅ |
|  | min-height | `60px` | `60px` | ✅ |
| `.md-fi-field` | display/direction/gap | `flex column 4px` | `flex column var(--space-xs)` | ✅ |
| `.md-fi-row` | display/direction/gap/align | `flex row 12px flex-end` | `flex 0 var(--space-md) flex-end` | ✅ |
| `.md-ob-count-confidence-row > .md-fi-field` | flex-shrink | `0` | `0` | ✅ |

CSS 変数解決:
- `--text-tertiary: #5A8896`（co-tokens.css のみ。OB CSS の旧 `:root` は削除済） ✅
- `--accent: #44A6B5`（co-tokens.css エイリアス） ✅
- `--accent-dim: rgba(68,166,181,0.12)`（同上） ✅

### 3-4. OB 行編集モーダル（`rowEditModalOverlay`）

- `#rowEditCompany` の親 `.md-fi-field.md-ob-company-field` の `position: relative` ✅
- `#rowEditTask` の親 `.md-fi-field.md-ob-task-field` の `position: relative` ✅
- input font-size 13px ✅

### 3-5. SL モーダル実測値

| モーダル | fields | labels | inputs | textareas | rows |
|---------|--------|--------|--------|-----------|------|
| `siteModal` | 10 | 11 | 6 | 1 | — |
| `slAddModalOverlay` | 10 | 11 | 6 | 1 | 3 |

- 第1 `.md-fi-input` font-size `13px` / padding `8px 12px` / border-radius `4px` ✅
- 第1 `.md-fi-label` color `rgb(90,136,150)` / font-size `11px` / text-transform `uppercase` ✅
- `#smMapLabelInput` (SL L992) の `classList: ["sm-map-title-input"]` のみ（md-fi-input 非付与）✅ — v1 の不正HTML修正確認。

### 3-6. WS / QA 波及チェック

| HTML | co-forms link | `.md-fi-label` | `.md-fi-input` | `.md-fi-field` |
|------|---------------|---------------|---------------|---------------|
| `weekly-schedule.html` | ✅ L8 | 0 | 0 | 0 |
| `quick-access.html` | ✅ L8 | 0 | 0 | 0 |

WS/QA HTML には `.md-fi-*` クラス付与なし（link 追加のみ）。見た目も SS 比較で既存レイアウトを維持。✅

### 3-7. SL slAddModal ビジュアル確認

Playwright スクリーンショットで確認:
- ラベル（「契約先名」「業務名」「人数」「信頼度」等）が薄い teal (#5A8896) / uppercase / 11px で描画
- input が白背景・1px divider border・4px 角丸・padding 適切
- textarea resizable / min-height 有効
- 2カラム行（`.md-fi-row`）で均等フレックス配置

ブラウザ既定スタイルへの退行は解消済（v1 の根本原因修正確認）。

---

## 4. 重大 Claim 検証

| # | Claim | 判定 | 根拠 |
|---|-------|------|------|
| C1 | 入力不能 | ✅ 解消 | 実機で input / textarea への値入力・保持を確認。 |
| C2 | 保存機能破壊 | ✅ 解消（推定） | JS 差分ゼロ / DOM id 維持。論理的に保存機能は維持。 |
| C3 | サジェスト破壊 | ✅ OK | `.md-ob-company-field` / `.md-ob-task-field` の `position: relative` を実機で確認。 |
| C4 | タイムピッカー破壊 | ✅ OK | `.md-ob-time-input` 未変更（TD §5 委譲）。 |
| C5 | レイアウト崩壊 | ✅ **解消** | `.md-fi-row` の flex レイアウトが実機で正常動作。担当者 2 カラム OK。 |
| C6 | フォーカスリング欠落 | ✅ **解消** | `:focus` 時に accent 色 border + accent-dim 3px box-shadow 確認。 |
| C7 | 他モックアップ波及 | ✅ OK | WS/QA は link 追加のみの差分。md-fi-* クラス 0 件。 |
| C8 | screen-layout 置き去り | ✅ OK | SL 側も同等の置換・CSS 定義削除が完了。 |
| C9 | Coastal Palette 外色混入 | ✅ OK | `co-forms.css` 内ハードコード色は semantic-error 由来 1 件のみ。 |
| C10 | 絵文字・Unicode記号代用 | ✅ OK | 記号代用なし（`.md-fi-select` の矢印は SVG data URI）。 |

**→ 重大 Claim 0 件。**

---

## 5. 軽微な懸念事項（Warning 詳細）

### W1. SL の人数入力 18px/700 強調が発火しない

**現象:** `screen-layout.css` L4195-4199 で `.md-sp-edit-modal .md-fi-input-number, .md-nav-modal .md-fi-input-number { font-size: 18px; font-weight: 700 }` が定義されているが、SL HTML 内に `.md-sp-edit-modal` / `.md-nav-modal` という祖先クラスが存在しない（`siteModal` / `slAddModalOverlay` の構造）→ SL では人数入力が 13px/400 のまま。

**影響:** 軽微（機能は動く、視覚的強調が OB と SL で不揃いになる）。

**推奨修正:** SL CSS を `.md-ob-edit-form .md-fi-input-number` にスコープ変更（OB と同一セレクタ）、または SL のモーダル DOM 構造に合わせたセレクタ（例: `#siteModal .md-fi-input-number, #slAddModalOverlay .md-fi-input-number`）に変更。

### W2. QA の `<link>` 順序の不統一（機能影響なし）

**現象:** `quick-access.html` の link 順序: `co-tokens → co-forms → co-navbar → co-shared-badges → quick-access`。他 3 HTML は `co-tokens → co-forms → co-shared-badges → co-navbar → ...`。

**影響:** 機能影響なし（co-* 同士で依存はなく、後勝ちで問題が起きる CSS セレクタも現状なし）。

**推奨修正:** 命名整合性のため他 3 HTML と同じ順序に揃える（必須ではない）。

---

## 6. 最終判定

- **合格基準**: 重大 Claim 0 件 AND スコア 70 点以上
- **結果**:
  - 重大 Claim **0 件**
  - 30 項目中: Pass 28 / Fail 0 / Warning 2（うち 1 は SL 人数強調セレクタ不備、もう 1 は link 順序の軽微な不揃い） / N/A 1（タイムピッカー委譲）
  - 追加項目（不正HTML）: Pass 1（class 属性重複 0 件）
- **合否: Pass**

---

## 7. SC（Score Compiler）への申し送り

1. **配点に基づくスコア試算（参考）**:
   - A. DS準拠（トークン・命名）30 点 → ほぼ満点
   - B. カラー 10 点 → 満点
   - D. コンポーネント一貫性 25 点 → 満点（SL 人数強調未発火は E 区分で減点、D は UI 集との見た目一致 OK）
   - E. 機能回帰 25 点 → W1 により -2〜-3 点（軽減点）
   - F. アクセシビリティ 5 点 → 満点
   - G. 保守性 5 点 → 満点
   - **概算: 95〜97 点**
2. **改善推奨事項**: W1 の SL 人数入力強調セレクタ修正は M-B1 の仕上げとして適用するか、M-B3（数値入力 + tabular-nums）で対応するかの判断を要する。
3. **Phase M-B1 目的達成**: 完了（OB / SL の `.md-ob-form-row*` → 新DS `.md-fi-*` 体系への移行が実機で確認された）。

---

TE v2 レポートを m-b1-te-v2.md に保存しました。Pass 28/Fail 0/Warning 2/N/A 1
