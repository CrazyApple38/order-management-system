# Phase M-B3 TD v1 — OB/SL 数値入力の tabular-nums 確認と `.md-fi-input-number` 運用整合 テスト設計

> Role: Test Designer（TD） / Target: Sub-Phase **M-B3**
> Scope: `docs/mockup/co-forms.css` / `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` / `docs/order-book.html` / `docs/screen-layout.html`
> Upstream: Phase M0 + M-A + M-B1 + M-B2 完了

---

## 1. 目的（W1 修正含む）

### 1.1 主目的

1. **OB/SL の数値入力フィールドが新DS準拠で稼働しているか最終検証**
   - `.md-fi-input md-fi-input-number` クラスが付与済（M-B1で実施済）であることを再確認
   - `co-forms.css` L73-83 の `.md-fi-input-number`（width:80px / text-align:center / spinner非表示）が発火
   - body 側の `font-variant-numeric: tabular-nums`（co-tokens経由 → 各mockup CSS の body 定義 L163 / L34 / L176 / L48 など）により数字が等幅で描画される

2. **M-B1 残 Warning W1 の根治**
   - SL の人数入力（`#smCount` / `#slAddCount`）が **18px/700 に強調されない**問題を解消
   - 事前調査により、SL の実祖先は `.md-ob-edit-form`（OB と共通）であり、SL CSS L4195 の `.md-sp-edit-modal / .md-nav-modal` 祖先は**実HTMLに存在しない**ことが判明

3. **OB/SL 内の他の数字表示箇所が tabular-nums で等幅化されているか最終確認**
   - テーブル内件数・人数・金額・日付・時刻など、body 継承で tabular-nums が効く前提を保証
   - 等幅 monospace フォントを別途適用しているクラスが無いか棚卸

### 1.2 採用方針

- **案A: SL CSS のセレクタを実HTML祖先（`.md-ob-edit-form`）に合致させる** を採用
- 具体的には `screen-layout.css` L4195-4199 のセレクタを `.md-ob-edit-form .md-fi-input-number` へ置換
- これにより SL/OB で同一ルールが適用され、`order-book.css` L543-547 と**完全に同一**の挙動になる

### 1.3 非目標（スコープ外）

- OB テーブル内セル（`.md-ob-table-cell-*` 等）の monospace 切替・桁揃えロジック変更
- 金額フォーマッタ（`toLocaleString()` 等 JS 側）の変更
- 単価・税率・小計の自動計算機能
- 新たな数値入力フィールドの追加
- `.md-fi-input-number` の外観（width/text-align/spinner）の仕様変更

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 25 | 数値入力の見た目・サイズ・位置・中央揃え |
| ブラウザ互換（Browser） | B | 10 | Chrome/Edge/Firefox で spinner 非表示・tabular-nums |
| **タイポグラフィ（Typography）** | **C** | **20** | **tabular-nums による等幅・18px/700 の強調が効く** |
| 機能（Domain/Behavior） | D | 20 | number input の min/max・キー入力・increment/decrement |
| アクセシビリティ | E | 20 | Tab/矢印キー操作・type=number のセマンティクス |
| ガバナンス | G | 5 | コメント更新・命名整合 |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0**

---

## 3. 事前調査結果

### 3.1 OB/SL 数値入力フィールドの実祖先構造

**OB（`docs/order-book.html`）**

| 行 | input | 実祖先（直系） |
|----|-------|--------------|
| 140 | `#editCount`（人数、number） | `<div class="md-ob-edit-form">` → `<div class="md-ob-count-confidence-row">` → `<div class="md-fi-field">` → input |

**SL（`docs/screen-layout.html`）**

| 行 | input | 実祖先（直系） |
|----|-------|--------------|
| 765 | `#smCount`（現場詳細モーダル 人数、number） | `<div class="md-modal-body-card">` → `<div class="md-ob-edit-form">` → `<div class="md-ob-count-confidence-row">` → `<div class="md-fi-field">` → input |
| 1420 | `#slAddCount`（追加モーダル 人数、number） | `<div class="md-modal-body-card">` → `<div class="md-ob-edit-form">` → `<div class="md-ob-count-confidence-row">` → `<div class="md-fi-field">` → input |

→ **OB と SL の人数入力は祖先クラス `.md-ob-edit-form` を共有**。

### 3.2 現行 CSS ルール調査

| ファイル | 行 | セレクタ | 効果 | 発火状況 |
|---------|-----|---------|------|---------|
| co-forms.css | 73-83 | `.md-fi-input-number` | width:80px / text-align:center / spinner非表示 | **OB/SL 両方で発火**（共通トークンCSS） |
| order-book.css | 543-547 | `.md-ob-edit-form .md-fi-input-number` | font-size:18px / font-weight:700 | **OB のみ発火**（screen-layout.html は order-book.css を読込まない） |
| screen-layout.css | 4195-4199 | `.md-sp-edit-modal .md-fi-input-number, .md-nav-modal .md-fi-input-number` | font-size:18px / font-weight:700 | **SL でも発火せず**（祖先が実HTMLに無い） |

### 3.3 W1 の根本原因

- `screen-layout.html` のモーダル DOM に `md-sp-edit-modal` / `md-nav-modal` クラスが**一切存在しない**（Grep 0件、実HTML側）
- SL の CSS で書かれた強調ルールがデッドコードになっている
- 結果、`#smCount` / `#slAddCount` は `.md-fi-input-number` のベース定義（14px 程度、border・text-align-center）のみが適用され、OB と比較して見た目が**貧弱**
- **一方 OB 側**は order-book.css L543 の祖先セレクタ `.md-ob-edit-form` が実HTML（`#editCount` の祖先）と合致するため正常に18px/700で強調される

### 3.4 body 適用 tabular-nums の確認

| CSS | body 行 | `font-variant-numeric: tabular-nums` |
|-----|---------|--------------------------------------|
| order-book.css | L34 | **あり** |
| screen-layout.css | L163 | **あり** |
| quick-access.css | L48 | あり（スコープ外） |
| weekly-schedule.css | L176 | あり（スコープ外） |

→ OB/SL とも body に tabular-nums が適用済。孫要素は自動継承で等幅化される。`.md-fi-input-number` 側で別途 `font-variant-numeric` を再定義する必要は**無い**。

### 3.5 screen-layout.html が読込むCSS

```html
<link rel="stylesheet" href="mockup/co-tokens.css">
<link rel="stylesheet" href="mockup/co-forms.css">
<link rel="stylesheet" href="mockup/co-shared-badges.css">
<link rel="stylesheet" href="mockup/co-navbar.css?v=3">
<link rel="stylesheet" href="mockup/screen-layout.css?v=8">
```

→ **`order-book.css` を読込んでいない**。つまり SL の 18px/700 強調は screen-layout.css 側で自己完結する必要がある。

---

## 4. W1 修正方針（採用案 A）

### 4.1 修正対象

`docs/mockup/screen-layout.css` L4193-4199

### 4.2 Before

```css
/* M-B1: .md-ob-form-row* は新DS .md-fi-* 体系に移行済 */
/* SL 固有: 人数入力を18px/700に強調 */
.md-sp-edit-modal .md-fi-input-number,
.md-nav-modal .md-fi-input-number {
    font-size: 18px;
    font-weight: 700;
}
```

### 4.3 After

```css
/* M-B1/M-B3: .md-ob-form-row* は新DS .md-fi-* 体系に移行済 */
/* SL 固有: 人数入力を18px/700に強調（実祖先 .md-ob-edit-form に合致） */
/* M-B3(W1): 旧セレクタ .md-sp-edit-modal / .md-nav-modal は実HTML未使用のため
             .md-ob-edit-form へ修正。OB 側 order-book.css L543 と同一ルール。 */
.md-ob-edit-form .md-fi-input-number {
    font-size: 18px;
    font-weight: 700;
}
```

### 4.4 検討した案B（却下）

- **案B: SL HTML 側に `.md-fi-input-number-large` 等の修飾クラスを追加**
  - 新規クラス定義が増え、OB/SL で命名が乖離する
  - 修飾クラスを付ける対象がたった2つの input（`#smCount` / `#slAddCount`）のため、祖先セレクタで十分
  - **却下**: CSS の表現力で解決可能な案Aを優先

### 4.5 他モックアップへの波及評価

- `order-book.css` L543 に同名の `.md-ob-edit-form .md-fi-input-number` が既に存在するが、order-book.html からのみ有効（screen-layout.html は order-book.css を読込まない）
- screen-layout.html では screen-layout.css L4195 の修正後セレクタが `.md-ob-edit-form`（SL 内に存在）に合致し、SL 固有適用として閉じる
- **波及なし**

---

## 5. テストチェックリスト（18項目）

### A. 視覚回帰（25点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| A-1 | OB `#editCount` に `.md-fi-input.md-fi-input-number` が付与されている | 3 | classList に両方存在 |
| A-2 | SL `#smCount` に `.md-fi-input.md-fi-input-number` が付与されている | 3 | classList に両方存在 |
| A-3 | SL `#slAddCount` に `.md-fi-input.md-fi-input-number` が付与されている | 3 | classList に両方存在 |
| A-4 | OB/SL 共通で幅が 80px、text-align:center が効いている | 4 | computedStyle で確認 |
| A-5 | OB `#editCount` の font-size:18px / font-weight:700 が実ブラウザで発火 | 4 | DevTools で 18px / 700 |
| A-6 | **SL `#smCount` の font-size:18px / font-weight:700 が実ブラウザで発火（W1修正後）** | 4 | DevTools で 18px / 700 |
| A-7 | **SL `#slAddCount` の font-size:18px / font-weight:700 が実ブラウザで発火（W1修正後）** | 4 | DevTools で 18px / 700 |

### B. ブラウザ互換（10点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| B-1 | Chrome: spinner（スピンボタン）非表示 | 2.5 | number input に ▲▼ 表示なし |
| B-2 | Edge: spinner 非表示 | 2.5 | 同上 |
| B-3 | Firefox: `-moz-appearance: textfield` で spinner 非表示 | 2.5 | 同上 |
| B-4 | 全ブラウザで tabular-nums が有効（0-9 が等幅） | 2.5 | `111` と `999` の幅が同一 |

### C. タイポグラフィ（20点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| C-1 | body 継承で数字が等幅（tabular-nums）になる | 5 | `1111` と `9999` の幅差 < 1px |
| C-2 | OB テーブル内の件数・人数・金額セルが等幅 | 5 | body 継承確認 |
| C-3 | SL モーダル内の人数入力欄の桁が揃う（0〜9 すべて同幅） | 5 | `10` と `88` の入力幅が同一 |
| C-4 | 孫要素でわざわざ monospace 指定している箇所が無い | 5 | Grep で `monospace` の残存確認 → tabular-nums で代替可 |

### D. 機能動作（20点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| D-1 | OB `#editCount` の min=0 / max=99 が効く | 4 | 100入力で99にクランプ or reject |
| D-2 | SL `#smCount` / `#slAddCount` の min/max が効く | 4 | 同上 |
| D-3 | キーボード矢印キー（↑↓）で increment/decrement | 4 | 1ずつ変化 |
| D-4 | 負数・非数値入力時の挙動（type=number の仕様通り） | 4 | "abc" → 空値 or invalid |
| D-5 | フォーカス時の focus スタイル（co-forms.css ベース）が効く | 4 | border 色変化 |

### E. アクセシビリティ（20点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| E-1 | Tab キーで数値入力フィールドにフォーカス移動可能 | 4 | tab index 自然順 |
| E-2 | `<label>` と input が `for` または包含で結合されている | 4 | label クリックで focus |
| E-3 | type="number" のセマンティクス（スクリーンリーダで「数値入力」と読まれる） | 4 | NVDA/VoiceOver で確認 |
| E-4 | focus-visible の ring が OS ネイティブまたは co-forms 定義で描画 | 4 | 視覚確認 |
| E-5 | 18px/700 の強調でコントラスト比 WCAG AA 以上（text-primary 基準） | 4 | contrast ≥ 4.5:1 |

### G. ガバナンス（5点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| G-1 | screen-layout.css L4193-4199 の W1 修正コメントが明示されている | 2 | `M-B3(W1)` 等の注記 |
| G-2 | co-forms.css の `.md-fi-input-number` 定義が M-B3 で変更されていない（Single Source） | 2 | L73-83 不変 |
| G-3 | ds-migration-plan.md の M-B3 チェック欄更新 | 1 | 完了マーク |

**合計: 25 + 10 + 20 + 20 + 20 + 5 = 100点**

---

## 6. 重大Claim（Showstopper）

いずれか1件でも発生したら**即座に不合格**。

| # | 事象 | 検知方法 |
|---|------|---------|
| C-1 | 数値入力が機能しなくなる（クリック/入力/フォーカスできない） | D-1 〜 D-5 |
| C-2 | OB/SL の他の数字表示（テーブル・バッジ・日付など）が prop 変更で崩れる | C-2、視覚回帰 |
| C-3 | W1 修正により、意図しない他要素にも 18px/700 が適用される | F相当（Grep で `.md-ob-edit-form .md-fi-input-number` の影響範囲確認） |
| C-4 | body の tabular-nums が効かなくなる（等幅崩壊） | C-1, C-3 |
| C-5 | spinner（スピンボタン）がどこかのブラウザで復活 | B-1 〜 B-3 |
| C-6 | JSコンソールに新規エラーが発生 | DevTools Console |

---

## 7. 合格条件

- **70点以上** AND **重大Claim=0件**
- 70点未満または重大Claim>0 → SC にて修正方針策定 → TE 再実行

---

## 8. 実装時の注意（SC への申し送り）

1. **screen-layout.css L4195-4196 の書換のみで W1 解消**
   - HTMLには一切手を入れない（`md-sp-edit-modal` / `md-nav-modal` クラスは元々存在しないため追加も不要）
2. **OB 側の order-book.css L543 は一切変更しない**
   - 既に正しい祖先セレクタ `.md-ob-edit-form` を使っており、そのまま流用対象
3. **`.md-fi-input-number` の外観定義（co-forms.css L73-83）は変更しない**
   - width / text-align / spinner 非表示は全mockup共通の DS 正として維持
4. **tabular-nums は body 継承のみに依拠**
   - `.md-fi-input-number` 側で `font-variant-numeric` を再定義しない（二重管理回避）
5. **コメント更新**
   - screen-layout.css 修正箇所に「M-B3(W1): 旧セレクタは実HTML未使用のため .md-ob-edit-form へ修正」と明記
6. **Grep 確認項目（SCで実施）**
   - 修正後 CSS で `.md-ob-edit-form` を祖先とする他要素（特にテキスト系 input）で意図しない 18px/700 化がないこと
   - `.md-fi-input-number` が付与されている要素のみが対象であることを保証

---

## 9. 参考: Phase 間依存

- **上流**: M0（tabular-nums / spinner非表示）、M-A（トークン置換）、M-B1（`.md-fi-input-number` 付与）
- **下流**: M-B4 以降のモーダル・バッジ整備時、数値入力のサイズが既に DS 化されていることを前提にできる
- **横断**: QA（quick-access）モックアップで類似の数値入力が出現した場合、同じ祖先セレクタ `.md-ob-edit-form` を流用するか、`.md-fi-input-number` の専用 large modifier を用意するかは M-F 以降で検討

---

_作成: Test Designer / Phase M-B3 TD v1 / 2026-04-20_
