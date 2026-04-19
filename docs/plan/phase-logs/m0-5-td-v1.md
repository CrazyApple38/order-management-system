# M0-5 Test Design (TD) v1

サブフェーズ: **M0-5 — 4モックアップ :root の `--text-tertiary` / `--text-disabled` を D6.1 値に更新**

作成者: Test Designer (TD)
参照: `docs/plan/ds-migration-governance.md` / `docs/plan/ds-migration-plan.md` / `docs/ui-components/styles-light.css`

---

## 1. 目的

4モックアップCSS（`order-book.css` / `weekly-schedule.css` / `quick-access.css` / `screen-layout.css`）の `:root` ブロックで定義されている `--text-tertiary` と `--text-disabled` の値を、旧値（`#6B9AA8` / `#A0BCC5`、WCAG AA 未達）から D6.1 値（`#5A8896` / `#8BAEB9`、AA 準拠）に更新する。これにより `co-tokens.css` の値と完全一致し、DS 移行における値衝突（同名トークンの複数値）を解消する。

**スコープ限定**:

- Light テーマ（`:root` ブロック）のみ。
- Dark テーマ（`[data-theme="dark"]` ブロック）は本フェーズでは触らない（後続フェーズで対応）。
- HTML / JS / co-tokens.css / styles-light.css / tokens.json は変更しない。

---

## 2. 配点

| 区分 | 配点 | 観点 |
|------|------|------|
| A. 基本動作（値が正しく置換されたか） | 20 |  4ファイルの :root に新値が書き込まれていること |
| B. 色コーディネーション / D6.1 AA化値の厳密一致 | **40** | `#5A8896` / `#8BAEB9` と一字一句一致、大文字小文字含む |
| E. スコープ遵守（影響範囲） | 25 | :root 2行のみの変更、Dark側・他ファイル非波及 |
| G. ガバナンス遵守 | 10 | 既存コメント / 書式の保存、命名整合性 |
| F. ドキュメント整合 | 5 | co-tokens.css 側コメント・governance 記載と符合 |
| **合計** | **100** | — |

**合格条件**: 70点以上 AND 重大Claim=0

---

## 3. 事前調査結果

### 3.1 4モックアップCSS の旧値定義行

| ファイル | トークン | 行番号 | 現行値 | D6.1 目標値 |
|---------|---------|-------|-------|-----------|
| `docs/mockup/order-book.css` | `--text-tertiary` | **28** | `#6B9AA8` | `#5A8896` |
| `docs/mockup/order-book.css` | `--text-disabled` | **29** | `#A0BCC5` | `#8BAEB9` |
| `docs/mockup/weekly-schedule.css` | `--text-tertiary` | **28** | `#6B9AA8` | `#5A8896` |
| `docs/mockup/weekly-schedule.css` | `--text-disabled` | **29** | `#A0BCC5` | `#8BAEB9` |
| `docs/mockup/quick-access.css` | `--text-tertiary` | **25** | `#6B9AA8` | `#5A8896` |
| `docs/mockup/quick-access.css` | `--text-disabled` | **26** | `#A0BCC5` | `#8BAEB9` |
| `docs/mockup/screen-layout.css` | `--text-tertiary` | **33** | `#6B9AA8` | `#5A8896` |
| `docs/mockup/screen-layout.css` | `--text-disabled` | **34** | `#A0BCC5` | `#8BAEB9` |

合計: 8行の置換（4ファイル × 2行）。

### 3.2 Dark テーマ側の同名トークン（触らない）

| ファイル | トークン | 行番号 | 現行値（Dark） |
|---------|---------|-------|---------------|
| `weekly-schedule.css` | `--text-tertiary` | 110 | `#8a8480` |
| `weekly-schedule.css` | `--text-disabled` | 111 | `#5a5550` |
| `screen-layout.css` | `--text-tertiary` | 105 | `#8a8480` |
| `screen-layout.css` | `--text-disabled` | 106 | `#5a5550` |

→ Light の旧値（`#6B9AA8` / `#A0BCC5`）とは値が異なるため、M0-5 の :root 行置換では誤波及しない。**変更対象外**。

### 3.3 co-tokens.css 側（既に D6.1 値で定義済み、触らない）

- `co-tokens.css:31` `--text-tertiary: #5A8896;` （D6.1）
- `co-tokens.css:32` `--text-disabled: #8BAEB9;` （D6.1）
- `co-tokens.css:71` `--chart-seq-2: #6B9AA8;` （別トークン、用途は連続値ヒートマップ。旧 tertiary と値が偶然一致する点に注意）

### 3.4 `#6B9AA8` / `#A0BCC5` の他出現箇所（モックアップCSS内）

4モックアップCSS内で `#6B9AA8` / `#A0BCC5` が出現するのは **:root 内の 8行のみ**（上記3.1）。`chart-seq-2` は `co-tokens.css` のみに存在し、4モックアップCSS内には定義されていない。→ 他箇所への波及懸念は無い。

---

## 4. テストチェックリスト（17項目）

### A. 基本動作（値の置換確認）

- [ ] **T1** `order-book.css:28` が `--text-tertiary: #5A8896;` になっている（旧 `#6B9AA8` から置換済み）
- [ ] **T2** `order-book.css:29` が `--text-disabled: #8BAEB9;` になっている（旧 `#A0BCC5` から置換済み）
- [ ] **T3** `weekly-schedule.css:28` が `--text-tertiary: #5A8896;` になっている
- [ ] **T4** `weekly-schedule.css:29` が `--text-disabled: #8BAEB9;` になっている
- [ ] **T5** `quick-access.css:25` が `--text-tertiary: #5A8896;` になっている
- [ ] **T6** `quick-access.css:26` が `--text-disabled: #8BAEB9;` になっている
- [ ] **T7** `screen-layout.css:33` が `--text-tertiary: #5A8896;` になっている
- [ ] **T8** `screen-layout.css:34` が `--text-disabled: #8BAEB9;` になっている

### B. カラーコーディネーション（D6.1 AA化値 厳密一致）

- [ ] **T9** 4ファイルすべてで新値が **大文字表記** `#5A8896` / `#8BAEB9` に揃っている（`#5a8896` などの小文字混在なし）
- [ ] **T10** 類似の誤タイプ（`#5B8897` / `#8CAEB9` / `#5A8886` など）が混入していない

### E. スコープ遵守

- [ ] **T11** 4モックアップCSS 内に旧値 `#6B9AA8` / `#A0BCC5` が **1箇所も残存していない**（大文字小文字問わず grep で0件）
- [ ] **T12** Dark テーマ側（`weekly-schedule.css:110-111` / `screen-layout.css:105-106`）の値（`#8a8480` / `#5a5550`）は **変更されていない**
- [ ] **T13** 4ファイルの diff が **:root 内 各2行のみ**（計8行）で、他のセレクタ・プロパティには変更がない
- [ ] **T14** 変更対象外ファイル（HTML / JS / `co-tokens.css` / `styles-light.css` / `tokens.json`）に差分ゼロ

### G. ガバナンス遵守

- [ ] **T15** 既存のインデント（スペース数）・セミコロン・書式を保存（`--text-tertiary:     #5A8896;` のように既存のスペーシングを維持）
- [ ] **T16** 周辺行のコメント・他トークン定義が無変更

### F. ドキュメント整合・目視確認

- [ ] **T17** 実ブラウザで 4モックアップを開き、tertiary（補助テキスト）と disabled（無効化テキスト）の視認性が向上していることを目視確認（可能なら）。破綻（読めなくなる / コントラスト過剰）がないこと

---

## 5. 重大Claim（検出された場合は即 FAIL）

| # | Claim | 検査方法 |
|---|-------|---------|
| **C1** | 旧値 `#6B9AA8` / `#A0BCC5` が 4モックアップCSS内の `--text-tertiary` / `--text-disabled` 定義行に残存している | 該当8行の grep |
| **C2** | 新値ではなく誤った値に置換されている（例: `#5B8897` / `#8CAEB9` / 他の類似色） | 新値との文字列完全一致チェック |
| **C3** | :root 以外の箇所（他セレクタの color / background 宣言など）に影響が出ている | `git diff` の変更行が :root 内 8行に限定されること |
| **C4** | Dark テーマ側（`[data-theme="dark"]` ブロック）の値が誤って変更されている（WS/SL の該当ブロック） | Dark ブロック内の `#8a8480` / `#5a5550` が保存されていること |
| **C5** | `co-tokens.css` / `styles-light.css` / `tokens.json` / HTML / JS に差分が発生している | `git diff` で対象ファイル以外の変更が無いこと |

---

## 6. 合格条件

- 全17項目中 **70点以上**（配点ベース）
- 重大Claim（C1〜C5）が **0件**

両方を満たした場合のみ、M0-5 PASS と判定。Implementer は本TDを基に実装後、自己検証 → QAレビューへ。

---

## 7. 備考

- `co-tokens.css:71` の `--chart-seq-2: #6B9AA8;` は本フェーズの変更対象外（別トークン）。M0-5 の変更後、モックアップCSS内には `#6B9AA8` が一切残らないが、`co-tokens.css` 内には `chart-seq-2` として残存する。これは意図された状態。
- Dark テーマの `--text-tertiary` / `--text-disabled` は後続サブフェーズでコントラスト再検証のうえ別途対応する。
