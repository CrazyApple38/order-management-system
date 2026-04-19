# M0-5 Test Execution (TE) v1

サブフェーズ: **M0-5 — 4モックアップ :root の `--text-tertiary` / `--text-disabled` を D6.1 値に更新**

作成者: Test Executor (TE)
参照: `docs/plan/phase-logs/m0-5-td-v1.md`

---

## 1. 実行サマリ

| 区分 | 結果 |
|------|------|
| 実行日時 | 2026-04-18 |
| Pass | **13** |
| Fail | **3** |
| Warning | **1** |
| 重大Claim | **C3 / C5 検出（2件）** |
| 合格判定 | **FAIL（重大Claim 0件 を満たさない）** |

---

## 2. 重要チェック（ユーザー指定 7項目）

| # | 項目 | 結果 | 証跡 |
|---|------|-----|------|
| 1 | 4ファイル全てで `--text-tertiary: #5A8896;` | ✅ Pass | OB:28 / WS:28 / QA:25 / SL:33 すべて `#5A8896` に置換済み |
| 2 | 4ファイル全てで `--text-disabled: #8BAEB9;` | ✅ Pass | OB:29 / WS:29 / QA:26 / SL:34 すべて `#8BAEB9` に置換済み |
| 3 | 旧値 `#6B9AA8` が 4モックアップCSS内で 0件（chart-seq-2 等除く） | ✅ Pass | `#6B9AA8` の残存は `co-tokens.css:31` のコメント文字列内と `co-tokens.css:71` の `--chart-seq-2`（別用途）のみ。4対象CSSには0件 |
| 4 | 旧値 `#A0BCC5` が 4モックアップCSS内で 0件 | ✅ Pass | `#A0BCC5` の残存は `co-tokens.css:32` のコメント文字列内のみ。4対象CSSには0件 |
| 5 | WS/SL の Dark ブロック `[data-theme="dark"]` 内の text-tertiary / text-disabled が変更されていない（`#8a8480` / `#5a5550` のまま） | ✅ Pass | `weekly-schedule.css:110-111` / `screen-layout.css:105-106` いずれも旧値を保持 |
| 6 | `git diff` で各ファイル：2行の値変更のみ | ❌ **Fail** | 4ファイルすべてで `body` セレクタの font-family 系 3プロパティにも変更が混入（詳細下記） |
| 7 | co-tokens.css / HTML / styles-light.css / tokens.json / co-navbar.css / co-shared-badges.css に差分ゼロ | ❌ **Fail** | 4つの HTML ファイル（order-book.html / quick-access.html / screen-layout.html / weekly-schedule.html）に `<link rel="stylesheet" href="mockup/co-tokens.css">` 追加の差分あり |

---

## 3. TD テストチェックリスト（17項目）判定

### A. 基本動作（値の置換確認）

| # | 項目 | 結果 |
|---|------|-----|
| T1 | order-book.css:28 が `--text-tertiary: #5A8896;` | ✅ Pass |
| T2 | order-book.css:29 が `--text-disabled: #8BAEB9;` | ✅ Pass |
| T3 | weekly-schedule.css:28 が `--text-tertiary: #5A8896;` | ✅ Pass |
| T4 | weekly-schedule.css:29 が `--text-disabled: #8BAEB9;` | ✅ Pass |
| T5 | quick-access.css:25 が `--text-tertiary: #5A8896;` | ✅ Pass |
| T6 | quick-access.css:26 が `--text-disabled: #8BAEB9;` | ✅ Pass |
| T7 | screen-layout.css:33 が `--text-tertiary: #5A8896;` | ✅ Pass |
| T8 | screen-layout.css:34 が `--text-disabled: #8BAEB9;` | ✅ Pass |

### B. カラーコーディネーション（D6.1 AA化値 厳密一致）

| # | 項目 | 結果 |
|---|------|-----|
| T9 | 4ファイルすべてで大文字表記 `#5A8896` / `#8BAEB9` に揃っている | ✅ Pass |
| T10 | 類似の誤タイプが混入していない | ✅ Pass |

### E. スコープ遵守

| # | 項目 | 結果 |
|---|------|-----|
| T11 | 4モックアップCSS 内に旧値 `#6B9AA8` / `#A0BCC5` が残存していない | ✅ Pass |
| T12 | Dark テーマ側の値（`#8a8480` / `#5a5550`）は変更されていない | ✅ Pass |
| T13 | 4ファイルの diff が :root 内 各2行のみ（計8行）で、他のセレクタ・プロパティには変更がない | ❌ **Fail**（重大Claim C3） |
| T14 | 変更対象外ファイル（HTML / JS / co-tokens.css / styles-light.css / tokens.json）に差分ゼロ | ❌ **Fail**（重大Claim C5） |

### G. ガバナンス遵守

| # | 項目 | 結果 |
|---|------|-----|
| T15 | 既存のインデント・セミコロン・書式を保存 | ✅ Pass（:root内 2行の書式は保存されている） |
| T16 | 周辺行のコメント・他トークン定義が無変更 | ✅ Pass（:root内の他行は無変更） |

### F. ドキュメント整合・目視確認

| # | 項目 | 結果 |
|---|------|-----|
| T17 | 実ブラウザで目視確認 | ⚠️ Warning（TE環境ではブラウザ目視未実施） |

---

## 4. 重大Claim 検出詳細

### C3: `:root` 以外の箇所にも変更が波及（FAIL）

4ファイルすべてで **`body` セレクタの font 関連 3プロパティ** にも変更が加わっている。

| ファイル | 行 | 変更内容 |
|---------|-----|---------|
| `order-book.css` | 63-66 | `font-family: 'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif;` → `font-family: var(--font-family-body);` + `font-feature-settings: "palt" 1;` + `font-variant-numeric: tabular-nums;` 追加 |
| `quick-access.css` | 45-48 | 同上（'Segoe UI', ... → var(--font-family-body) + feature-settings + variant-numeric） |
| `screen-layout.css` | 160-163 | 同上 |
| `weekly-schedule.css` | 173-176 | 同上（'apple-system, BlinkMacSystemFont, ...' → var(--font-family-body) + feature-settings + variant-numeric） |

→ M0-5 のスコープは ":root の 2トークンの値変更のみ"。body の font 系への変更は スコープ外 の追加リファクタで、TD C3 に該当。

### C5: HTML ファイルに差分あり（FAIL）

4つの HTML に **`co-tokens.css` への `<link>` 追加** が混入。

| ファイル | 追加内容 |
|---------|---------|
| `docs/order-book.html` | +5行目に `<link rel="stylesheet" href="mockup/co-tokens.css">` |
| `docs/quick-access.html` | +5行目に同上 |
| `docs/screen-layout.html` | +5行目に同上 |
| `docs/weekly-schedule.html` | +5行目に同上 |

→ TD T14 に明示的に「HTML に差分ゼロ」と記載されているため FAIL。TD C5 に該当。

### C1 / C2 / C4: 検出なし（PASS）

- C1: 4モックアップCSS内の `:root` 内に旧値 `#6B9AA8` / `#A0BCC5` は残存していない
- C2: 新値は `#5A8896` / `#8BAEB9` と完全一致（誤タイプなし）
- C4: Dark テーマ（WS:110-111 / SL:105-106）の `#8a8480` / `#5a5550` は保存されている

---

## 5. 参考: diff 抜粋

### 4モックアップCSS（共通パターン）

```diff
     /* テキスト */
     --text-primary:      #004554;
     --text-secondary:    #2A6B7A;
-    --text-tertiary:     #6B9AA8;
-    --text-disabled:     #A0BCC5;
+    --text-tertiary:     #5A8896;
+    --text-disabled:     #8BAEB9;
```

**上記までなら T1〜T16 すべて Pass の想定。しかし各ファイルとも body セレクタにも：**

```diff
 body {
-    font-family: 'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif;
+    font-family: var(--font-family-body);
+    font-feature-settings: "palt" 1;
+    font-variant-numeric: tabular-nums;
```

### 4 HTML（共通パターン）

```diff
     <title>…</title>
+    <link rel="stylesheet" href="mockup/co-tokens.css">
     <link rel="stylesheet" href="mockup/co-shared-badges.css">
```

### 対象外ファイルの差分ゼロ確認

- `docs/ui-components/styles-light.css` — 差分なし
- `docs/ui-components/tokens.json` — 差分なし
- `docs/mockup/co-navbar.css` — 差分なし
- `docs/mockup/co-shared-badges.css` — 差分なし
- `docs/mockup/co-tokens.css` — Untracked（既存コミットに対する差分は無いが、作業ツリーに新規追加されている。M0-5 の対象外だが M0-5 の成果物ではないので C5 には含めない扱い）

---

## 6. 配点計算

| 区分 | 配点 | 獲得 | 根拠 |
|------|------|------|------|
| A. 基本動作（T1〜T8） | 20 | 20 | 8項目すべて Pass |
| B. 色コーディネーション（T9〜T10） | 40 | 40 | 2項目すべて Pass |
| E. スコープ遵守（T11〜T14） | 25 | 12 | T11/T12 Pass・T13/T14 Fail（半分減点の 12/25 とした。ただし重大Claim 該当のため合否は重大Claim基準で決定） |
| G. ガバナンス遵守（T15〜T16） | 10 | 10 | 2項目 Pass |
| F. ドキュメント整合（T17） | 5 | 3 | 目視未実施のため Warning で部分点 |
| **合計** | **100** | **85** | — |

**点数ベース: 85/100（70点以上 OK）**
**重大Claim: C3・C5 検出 → 合格条件「重大Claim=0」に違反**

---

## 7. 最終判定

| 判定軸 | 結果 |
|--------|------|
| 点数条件（70点以上） | ✅ 85/100 |
| 重大Claim 0件 | ❌ C3・C5 検出 |
| **総合判定** | **FAIL** |

### 推奨アクション（QA/Implementer 向け）

1. **HTML 4ファイルの `<link co-tokens.css>` 追加を revert**（M0-5 のスコープ外）
2. **4モックアップCSS の body セレクタ font-family 系変更を revert**（M0-5 のスコープ外）
3. :root 内 `--text-tertiary` / `--text-disabled` の 8行のみが diff となる状態に戻したうえで、再度 TE を実施
4. HTML への co-tokens.css リンク追加・body font トークン化は 別サブフェーズ として TD → 実装 → TE を踏む

---

## 8. 備考

- M0-5 の値置換自体（T1〜T12, T15, T16）は正しく実施されており、値の観点では Phase D6.1 準拠化は達成済み。
- スコープ逸脱は「リファクタを先取りした」と思われる変更だが、ガバナンス上は別フェーズ化が必須。
- Untracked な `docs/mockup/co-tokens.css` は本フェーズの変更ではなく、先行フェーズで作成済みのファイルと推定される（差分判定の対象外）。
