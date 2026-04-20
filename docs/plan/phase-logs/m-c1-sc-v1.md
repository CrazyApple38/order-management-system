# Scoring Report: M-C1 v1

> Role: Scorer（SC） / Target: Sub-Phase **M-C1**
> TE: `docs/plan/phase-logs/m-c1-te-v1.md`
> Target: OB CSS Grid `.md-ob-grid*` → `.tbl-grid` BEM リネーム
> Baseline: `da190e2` (M-B2/M-B3完了)

---

## 総合判定

- **総合点: 93 / 100**
- **重大Claim: なし**（CC-1〜CC-5 全未発生、CC-6 は TD §6 想定通りの Warning）
- **判定: 合格**（PASS / 閾値 70点）

---

## カテゴリ別採点

### A. 視覚回帰・クラス命名（30/30）

| # | テスト | 結果 | 得点 |
|----|------|------|------|
| A-1 | グリッド全体カラム幅（childCount=779） | Pass | 満点 |
| A-2 | sticky 9列 left 位置（0/200/552px） | Pass | 満点 |
| A-3 | sticky--8 border-right | Pass | 満点 |
| A-4 | `.tbl-grid__cell.tbl-grid__header` 定義 | Pass | 満点 |
| A-5 | `.tbl-grid__sat-head/sun-head` | Pass | 満点 |
| A-6 | `.tbl-grid__sat/sun` | Pass | 満点 |
| A-7 | `.tbl-grid__night.tbl-grid__sticky--2` font-weight:700 | Pass | 満点 |
| A-8 | `.tbl-grid__even-row` | Pass | 満点 |
| A-9 | `.tbl-grid__total-row / grand-total` | Pass | 満点 |

→ **9/9 Pass → 30/30**

### B. ブラウザ互換（3/10）

| # | テスト | 結果 | 配点 |
|----|------|------|------|
| B-1 | Chrome (Chromium) 実機描画 | Pass | 3/3 |
| B-2 | Edge 実機描画 | N/A | 0/2 |
| B-3 | Firefox 実機描画 | N/A | 0/3 |
| B-4 | DevTools Computed一致 | N/A | 0/2 |

→ **Chromium のみ実施 → 3/10**（環境制約による N/A。減点理由は環境都合で品質リスクではない）

### D. 機能回帰（20/20）

| # | テスト | 結果 |
|----|------|------|
| D-1〜D-8 | 月切替 / 行追加 / カレンダー / clickable / site-entry / data-day querySelector / classList.toggle | 全Pass |

→ **8/8 Pass → 20/20**
JS テンプレート文字列 `tbl-grid__sticky--${i}` (L541) も動的生成で新名統一済み。

### E. 見た目不変・置換完全性（30/30 / 最重要）

| # | 検証 | 結果 |
|----|------|------|
| E-1〜E-7 | 旧名 `md-ob-grid / cell / frozen / sat / sun / night / even-row / total-*` 等 CSS/JS/HTML 全 0件 | Pass |
| E-8〜E-9 | ページヘッダ `md-ob-header / -left / -right / -center` 保全 | Pass |
| E-10 | 実機 Before/After 779セル全て新クラスで描画 | Pass |
| E-11 | 月切替後もクラス名維持（firstChild = tbl-grid__cell tbl-grid__header tbl-grid__sticky--0） | Pass |
| E-12 | conf-tentative_* 親 `.md-ob-*` 置換済・子修飾子は M-C4 予定通り残存 | Pass |
| E-13 | コンソールエラー 0件 | Pass |
| E-14 | OB 3ファイル以外未変更 | Pass |

→ **14/14 Pass → 30/30**（CC-4/CC-5 完全クリア）

### G. ガバナンス（10/10）

| # | 観点 | 結果 |
|----|------|------|
| G-1 | BEM（Block__Element--Modifier）準拠 | Pass |
| G-2 | Governance L144 規約整合 | Pass |
| G-3 | M-C2 (sticky z-index) 前提 | Pass |
| G-4 | M-C3 (data-day属性化) 前提 | Pass |
| G-5 | phase-log 記載 | Pass |
| G-6 | ds-migration-plan.md 更新（実装コミット時残作業） | ⚠ TE範囲外 |

→ **6/6 Pass → 10/10**（G-6 は実装コミット時の残務であり、TE採点外）

### 合計

**A(30) + B(3) + D(20) + E(30) + G(10) = 93 / 100**

---

## デザイナー視点コメント

### 1. BEM 命名の整合（非常に良好）

- `tbl-grid` を **Block**、`__wrapper / __scroll / __cell / __header / __date-cell / __day-num / __cell-count / __site-entry / __row-add-btn / __cal-open-btn` を **Element**、`--0..--8 / --tentative-high` を **Modifier** として厳格に分離できている。
- 従来の `md-ob-grid-wrapper` / `md-ob-frozen-0` のような **ハイフン区切りだけの曖昧命名が解消**。今後 `.tbl-grid` テーブル系を WS/QA/SL/経理画面で横展開する際の共通基盤として再利用可能。
- `tbl-grid__sat / __sun / __night / __sat-head / __sun-head` は曜日・時間帯 **状態** を表す Modifier として `.tbl-grid__cell` と複合適用する構造になっており、CSS 特異度も適正（単独クラス2段）。

### 2. ページヘッダ `md-ob-header` の棲み分け（明確）

- ヘッダ系（`md-ob-header / -left / -right / -center / -month-nav`）は **画面レイアウト要素** であり、今回リネーム対象の **グリッド要素** ではない。TE E-8/E-9 で保全を確認済み。
- CSS L45-62・HTML L16-32 で引き続き `md-ob-*` を維持しているため、**「グリッド = `tbl-grid`、画面ヘッダ = `md-ob-header`」** の役割分離が明快。後続フェーズで `md-ob-header` を `ob-header` / `page-header` に整理する場合もこの境界を保てる。

### 3. JS テンプレート文字列の統一（良好）

- `order-book.js` L541 `tbl-grid__sticky--${i}` のように **動的クラス生成も新命名に揃っている**。静的な CSS 側だけでなくランタイム側の整合も取れており、M-C2 以降で `--z-sticky` を注入する際にも `.tbl-grid__sticky--{n}` 一括セレクタで制御できる。
- `querySelectorAll('.tbl-grid__cell[data-ri="0"][data-day="1"]')`（JS L3685）が既に `data-day` を前提とした書式になっているため、**M-C3 (data-day属性化) のベースも M-C1 時点で下地完成**。

### 4. M-C2 以降の前提条件（満たされている）

| 後続フェーズ | 前提 | M-C1 時点での達成度 |
|----|----|----|
| **M-C2** sticky z-index 統一（`--z-sticky`） | `.tbl-grid__sticky--{0..8}` で一括セレクタ可能 | ✅ 37件 `__sticky--` 定義 |
| **M-C3** data-day 属性化 | `.tbl-grid__sat / __sun / __sat-head / __sun-head` をセレクタ単位で識別 | ✅ 曜日クラスが独立 |
| **M-C4** conf-tentative Modifier統合 | 親セレクタ `.tbl-grid__date-cell / __site-entry` が新名で準備済み | ✅ 子 opacity制御は残存・移行準備完了 |

### 5. 惜しい点

- **B カテゴリの環境制約（-7点）**: Chromium 以外の実機検証が未実施。見た目は CSS Grid + sticky の標準機能のみでブラウザ差異は出にくいが、Edge/Firefox での sticky 計算誤差の可能性はゼロではない。M-C2 実装コミット後に Edge で一度 smoke test を走らせることを推奨。
- **G-6（ds-migration-plan.md 更新）**: 実装コミット時に忘れず反映すること。

---

## Phase M-C2 への引き継ぎ事項

### 前提条件（達成済）

1. ✅ `.tbl-grid__sticky--{0..8}` 形式で 9列のsticky要素を **BEM Modifier 単位で一括制御可能**
2. ✅ `order-book.css` L283 で `sticky--8` に `border-right: 2px solid var(--divider)` が集約済
3. ✅ 動的クラス生成（JS L541）も新命名で統一

### M-C2 実装推奨ステップ

1. **z-index トークンの追加**
   - `docs/mockup/co-tokens.css` に `--z-sticky-body: 10; --z-sticky-header: 20;` 等を定義（既存 token 体系に合わせて命名）
2. **`order-book.css` の sticky z-index 置換**
   - `.tbl-grid__cell.tbl-grid__sticky--{0..8}` の `z-index` を `var(--z-sticky-body)` に集約
   - `.tbl-grid__header.tbl-grid__sticky--{0..8}` の z-index を `var(--z-sticky-header)` に集約（ヘッダが本文 sticky より上位）
3. **検証観点**
   - 月切替時に header sticky がスクロール本文より前面に出ること
   - `.tbl-grid__night` の `font-weight: 700` と z-index の共存（A-7 回帰確認）

### M-C3 への波及

- M-C1 で `.tbl-grid__sat / __sun / __sat-head / __sun-head` が独立セレクタとして確立したため、M-C3 では HTML 側に `data-day="sat|sun|weekday"` を追加しつつ **CSS 側は `[data-day="sat"]` ベースの属性セレクタへ段階的に移行** できる。M-C1 のクラス名は後方互換として残すことで、M-C3 の段階ロールアウトが容易。

### 残 Warning（M-C4 で解消）

- `.tbl-grid__date-cell.md-ob-conf-tentative_high` / `_low` は **意図的残存**。M-C4 で `.tbl-grid__site-entry--tentative-high / --tentative-low` 等に Modifier 昇格させる。

### 未実施カテゴリの補完推奨

- **B-2 (Edge)** を M-C2 コミット時に軽量 smoke test で消化
- **G-6 (ds-migration-plan.md)** を M-C1 実装コミット直前に更新

---

## 総括

OB の CSS Grid 命名規約を **Block__Element--Modifier** の BEM 形式へ統一する目的を **過不足なく達成**。ページヘッダ（画面レイアウト要素）との境界も明確に保たれ、JS テンプレート文字列・動的クラス生成まで新命名に揃っている。

重大Claim 5項目は全て未発生、E（置換完全性）/A（視覚回帰）/D（機能回帰）/G（ガバナンス）は満点。B のみ Chromium 単一実機による N/A 減点で 93/100 となったが、これは環境制約であり品質リスクではない。

**M-C2（sticky z-index `--z-sticky` 化）の実装基盤は完全に整っている。**
