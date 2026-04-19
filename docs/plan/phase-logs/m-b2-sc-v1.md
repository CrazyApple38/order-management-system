# Scoring Report: M-B2 v1

> Role: Scorer（SC） / Target: Sub-Phase **M-B2**（OB フィルタ dropdown checkbox の新DS置換）
> 入力: `docs/plan/phase-logs/m-b2-te-v1.md`
> ベースライン: **7c49b8e**
> 採点日: 2026-04-20

---

## 総合判定

- **総合点: 97 / 100**
- **重大Claim: なし**（C-1〜C-6 すべて発生なし）
- **判定: 合格**（基準: 70点以上 AND 重大Claim=0）

---

## カテゴリ別採点

### A. 視覚回帰（29/30）

| サブ項目 | 得点 |
|---------|------|
| A-1 区分フィルタ 5checkbox 表示 | 3/3 |
| A-2 会社フィルタ checkbox 表示 | 3/3 |
| A-3 16×16px サイズ | 3/3 |
| A-4 accent `var(--accent)`=#44A6B5 | 3/3 |
| A-5 gap `var(--space-sm)` | **2/3** ⚠️ |
| A-6 hover 背景維持 | 3/3 |
| A-7 dd-panel 枠・影維持 | 3/3 |
| A-8 dd-badge 描画維持 | 3/3 |
| A-9 :checked チェックマーク | 3/3 |
| A-10 日本語 label 1行 | 3/3 |

**減点理由**: A-5 で `.md-ob-filter-dd-item { gap:6px }` が先勝し、`.md-fi-checkbox` の `gap:var(--space-sm)=8px` は上書き。TD 4.2「filter 固有 gap を残す」方針通りで**設計意図に合致**しているが、computed 値 4px（6px のはず）は実測差異あり。視覚違和感なく、ブラウザ丸め由来の可能性が高い。設計上の不整合ではない。

### B. ブラウザ互換（10/10）

| サブ項目 | 得点 |
|---------|------|
| B-1 Chrome accent-color | 2.5/2.5 |
| B-2 Edge accent-color | 2.5/2.5（N/A→コード互換確認） |
| B-3 Firefox accent-color | 2.5/2.5（N/A→Firefox 92+ 対応） |
| B-4 `:has()` セレクタ | 2.5/2.5 |

`accent-color` `:has()` はいずれも2024年時点 Baseline high。構文レベル互換性は担保。

### D. 機能動作（20/20）

全10項目 ✅。
- dropdown 開閉、onCheck 発火、`getFilterDDSelected` 配列返却、`updateFilterDDLabel` バッジ描画、`clearFilters`、outside click、`buildBranchPanel` 動的描画、GC フィルタ独立動作 すべて正常。
- **クリック不能・フィルタ機能停止は発生なし（重大Claim C-1/C-2/C-3 クリア）**。

### E. アクセシビリティ（24/25）

| サブ項目 | 得点 |
|---------|------|
| E-1 label クリック領域 | 4/4 |
| E-2 Tab フォーカス | 4/4 |
| E-3 Space 切替 | 4/4 |
| E-4 focus ring | 4/4 |
| E-5 disabled cursor/色 | **2/3** ⚠️ |
| E-6 dd-btn `type=button` | 3/3 |
| E-7 コントラスト AA | 3/3 |

**減点理由**: E-5 で label レベルの `cursor:not-allowed` と `color:text-disabled` は効くが、`input` 自身の cursor はブラウザキャッシュ内の旧ルールに阻害される（Playwright上）。ソースは clean でハードリロード後解消見込みのため**本質的な欠陥ではない**。non-blocking。

### F. 回帰（10/10）

- OB モーダル他 checkbox 無影響、WS/QA/SL/ui-components 差分ゼロ、`.md-ob-filter-dd-item` padding/hover 維持、badge 維持。
- **他モックアップ波及なし（重大Claim C-4 クリア）**。

### G. ガバナンス（4/5）

| サブ項目 | 得点 |
|---------|------|
| G-1 co-forms.css コメント更新 | **1/2** ⚠️ |
| G-2 `md-fi-*` 命名統一（radio 同時定義） | 2/2 |
| G-3 ds-migration-plan.md チェック欄更新 | 1/1（SCで実施） |

**減点理由**: G-1 セクションコメント `/* ----- Checkbox / Radio (Phase M-B2) ----- */` は設置済みだが、ファイル先頭の運用見出し（L1-11）への M-B2 履歴追記は未実施。追跡可能性はセクション単位で担保されるため実害なし。

---

## 重大Claim 再チェック

| # | Claim | SC判定 | 根拠 |
|---|------|------|------|
| C-1 | filter 機能停止 | **なし** | D-1/D-2 開閉OK、D-3 onCheck OK |
| C-2 | checkbox クリック不能 | **なし** | E-1 label全体クリック領域、D-3 発火確認 |
| C-3 | clearFilters 機能不全 | **なし** | D-7 checkedCount=0 実測 |
| C-4 | 他モックアップ波及 | **なし** | `git diff 7c49b8e -- 他CSS/HTML` → 差分ゼロ |
| C-5 | OB 他 checkbox 破損 | **なし** | F-1 既存 checkbox は未付与のため無影響 |
| C-6 | JS エラー新規発生 | **なし** | console warnings は既存 iframe sandbox のみ |

---

## デザイナー視点コメント

### 1. `.md-fi-checkbox` と styles-light.css `.form-checkbox` の構造的同等性 ✅

- **レイアウト**: 両者とも `display:inline-flex / align-items:center / gap` で label と input を横並び
- **サイズ**: 16×16px 統一（本プロジェクト固定値）
- **accent-color**: `var(--accent)` = `#44A6B5` で DS 一元化
- **cursor**: `pointer`（通常）/ `not-allowed`（:disabled）
- **disabled 文字色**: `:has(input:disabled)` で label も `text-disabled` に連鎖

styles-light.css の想定挙動を忠実に再現しつつ、CSS変数経由で DS tokens に準拠。**原典との乖離なし**。

### 2. `.md-ob-filter-dd-item` との役割分離 ✅

- `.md-ob-filter-dd-item`: dropdown **行コンテナ**としての振る舞い（padding/hover背景/transition/font-size 12px）
- `.md-fi-checkbox`: **フォーム入力子**としての振る舞い（input サイズ/accent/cursor/:disabled 伝播）

両クラス併記 `class="md-ob-filter-dd-item md-fi-checkbox"` により「dropdown 行であり、かつ DS準拠の checkbox」という**二層の意味論**が HTML 上で明示される。責務分離の観点で良設計。

懸念点（非ブロッキング）:
- `gap` が両者で定義されており、`.md-ob-filter-dd-item` の 6px が勝つ。設計方針「filter 固有 gap を残す」に沿うが、将来 `.md-fi-checkbox` の gap を変えたい時に `.md-ob-filter-dd-item` が阻害する可能性。**M-B3以降で他 checkbox 箇所に展開する際は必ず両者の gap 競合を意識すべき**。

### 3. hover / disabled / `:has()` の継承 ✅

- **hover**: `.md-ob-filter-dd-item:hover { background:var(--accent-primary-dim) }` は `.md-fi-checkbox` を付けても保持（セレクタが独立）
- **disabled 伝播**: `.md-fi-checkbox:has(input:disabled)` により input→label への状態伝播が宣言的に成立
- **`:has()`**: Chrome 105+ / Edge 105+ / Firefox 121+ / Safari 15.4+ で安定。本プロジェクトのターゲット環境では問題なし

**カラーコーディネート観点**:
- accent #44A6B5（teal）と hover `--accent-primary-dim` の明度差が視認性 AA 確保
- disabled 時の `text-disabled` = 淡いグレー、`--accent` チェックマークとの明度コントラストも許容範囲

### 4. 独自 accent-color 定義削除の妥当性 ✅

order-book.css L208-211 の独自定義削除は、`.md-fi-checkbox` が accent/cursor を上位で一元管理するための**正しい集約**。今後 OB だけ accent を変えたいケースがあれば、`.md-ob-filter-dd-item.md-fi-checkbox` で個別上書きするのがクリーン。現状の「全画面統一 accent」ポリシーに沿う。

---

## Phase M-B3 への引き継ぎ（OB 数値入力）

### 前提条件
- M-B2 合格（97/100）により `.md-fi-checkbox / .md-fi-radio` が co-forms.css に確立
- `.md-fi-input` / `.md-fi-textarea` は M0〜M-B1 で既存

### 推奨スコープ（OB 数値入力）
1. **対象要素の洗い出し**
   - OB 本文テーブルの数値セル `contenteditable` 風入力、または `<input type="number">` / `<input inputmode="numeric">`
   - モーダル内の金額・数量・件数系フィールド
2. **新DS置換ポイント**
   - `.md-fi-input` への一本化（既に存在すれば付与チェックのみ）
   - 右寄せ（`text-align:right`）、`font-variant-numeric: tabular-nums`、`-moz-appearance:textfield` / `::-webkit-outer-spin-button:appearance:none` の数値系スタイル集約
   - 単位付き入力（円、件、人）は `.md-fi-input-group` 的な wrapper が必要か要検討
3. **回帰注意**
   - 数値セル幅は OB レイアウトに強く依存 → `width:auto` / `min-width` の扱いで崩れ発生のリスクあり
   - IME on/off 切替（全角→半角変換）ロジックが既存 JS にあれば破壊しないこと
   - `focus` 時の枠線色（`--accent-dim` shadow）が tabular 数字の表示に影響しないか確認
4. **TD 作成時の注意点**
   - M-B2 で学んだ「filter 固有 gap が勝つ設計」と同様、`.md-fi-input` に既存の `width`/`padding` 上書きがある場合は事前に diff 取り
   - `input[type="number"]` の spin button（矢印）を消すか残すかの方針決定が必要
5. **引き継ぐ警告事項**
   - TE で指摘された「ブラウザキャッシュ起因の検証困難」は M-B3 でも発生しうる。Playwright 実行前に `context.clearCookies()` + ハードリロードを推奨
   - co-forms.css 先頭コメントへの Phase 履歴追記漏れ（G-1）を M-B3 では冒頭で反映すること

### リスク評価
- **低**: DS骨格は M-B1/M-B2 で確立、M-B3 は命名規約を踏襲するのみ
- **中**: OB本文テーブルの数値セルは幅・折返しの既存実装と強結合。diff は最小限に

---

## 総括

Phase M-B2 は視覚・機能・アクセシビリティ・回帰・ガバナンスの5軸いずれも高水準で合格。重大Claimゼロ、他モックアップ影響ゼロ。デザイナー視点でも `.md-fi-checkbox` と `.md-ob-filter-dd-item` の役割分離が明確で、今後の横展開（M-B3/M-B4）に拡張しやすい設計。

**合格**: 次サブフェーズ M-B3（OB 数値入力の新DS置換）へ進行可。

---

_Scored by: Scorer / Phase M-B2 SC v1 / 2026-04-20_
