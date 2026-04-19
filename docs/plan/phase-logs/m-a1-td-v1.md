# M-A1 Test Design (TD) v1

サブフェーズ: **M-A1 — Order Book の `:root` 変数を `co-tokens.css` 参照に置換**

作成者: Test Designer (TD)
作成日: 2026-04-18
参照: `docs/plan/ds-migration-governance.md` / `docs/plan/ds-migration-plan.md` / `docs/ui-components/styles-light.css` / `docs/mockup/co-tokens.css`

---

## 1. 目的

`docs/mockup/order-book.css` の `:root` ブロック（L6〜L59）から、**`co-tokens.css` と同名・同値で重複定義されている旧変数を削除**する。削除後、該当変数は `co-tokens.css`（新DS定義 + legacy alias）側の値で解決される。

**コア原則**:

- 削除対象は「co-tokens.css と値が**完全一致**する変数のみ」
- 値が不一致のもの（例: `--warning-text: #975A16` vs co-tokens `#92400e`）は **削除しない**（M-A2 以降で整合調整）
- OB固有の変数（`--base-grid*` / `--day-*` / `--night-text` / `--error-bg` / `--success-bg`）は **残留**
- OB CSS 本文（`:root` 外）の `var(--xxx)` 参照は一切書き換えない（参照解決先が `co-tokens.css` に移るだけで、見た目は不変）

**スコープ限定**:

- `docs/mockup/order-book.css` のみ変更。他3モックアップCSS・`co-tokens.css` ・`styles-light.css` ・`tokens.json` ・HTML・JS は一切触らない
- M0-5 コミット時点の見た目から**変化ゼロ**が必須

---

## 2. 配点（M-A1 特化ウェイト）

| 区分 | 配点 | 観点 |
|------|------|------|
| A. DS準拠（重複 `:root` 変数の削除徹底） | **30** | 削除可能変数が0件残っていること、削除後の `:root` が簡潔になっていること |
| B. カラー（見た目一致） | 15 | 解決後の値が M0-5 時点と一致。Coastal Palette 外の混入なし |
| D. コンポーネント一貫性（OB固有変数の残留） | 15 | `--base-grid*` / `--day-*` など OB固有変数が正しく残留 |
| E. 機能回帰・見た目不変 | **30** | OB 実ブラウザで M0-5 コミット時点と視覚差分ゼロ。本文 `var(--xxx)` 参照が破れない |
| G. コード品質・保守性 | 10 | :root 行数削減、コメント整理、冗長定義の排除 |
| **合計** | **100** | — |

**合格条件**: 総合 70点以上 AND 重大Claim = 0

※ B/C/F 系配点は M-A1 の性質（見た目不変が目的・新トークン導入は無し）上、縮小。代わりに E（見た目一致）に 30 を配分。

---

## 3. 事前調査結果

### 3.1 OB `:root` ブロック（L6〜L59）全変数の分類

`docs/mockup/order-book.css` の `:root` ブロックに定義されている全 31 変数を、co-tokens.css との値比較で分類。

#### 分類A: 削除可能（co-tokens.css と値完全一致、同名 or legacy alias で解決可能）

| 行 | 変数 | OB値 | co-tokens.css の解決先 | 一致 |
|---|------|------|----------------------|------|
| 8 | `--base-page` | `#E9F1F6` | `--base-page: var(--bg-page)` → `#E9F1F6` | ○ |
| 9 | `--base-surface` | `#FFFFFF` | `--base-surface: var(--bg-surface)` → `#FFFFFF` | ○ |
| 10 | `--base-surface-alt` | `#F0EDE9` | `--base-surface-alt: var(--bg-surface-2)` → `#F0EDE9` | ○ |
| 11 | `--base-muted` | `#D3D0C8` | `--base-muted: var(--bg-surface-3)` → `#D3D0C8` | ○ |
| 17 | `--sub-primary` | `#004554` | `--sub-primary: var(--bg-sidebar)` → `#004554` | ○ |
| 18 | `--sub-secondary` | `#B2D5E2` | `--sub-secondary: var(--divider)` → `#B2D5E2` | ○ |
| 21 | `--accent-primary` | `#44A6B5` | `--accent-primary: #44A6B5`（新DS同名） | ○ |
| 22 | `--accent-light` | `#5AB8C6` | `--accent-light: var(--accent-primary-light)` → `#5AB8C6` | ○ |
| 23 | `--accent-dim` | `rgba(68, 166, 181, 0.12)` | `--accent-dim: var(--accent-primary-dim)` → 同値 | ○ |
| 26 | `--text-primary` | `#004554` | `--text-primary: #004554`（新DS同名） | ○ |
| 27 | `--text-secondary` | `#2A6B7A` | `--text-secondary: #2A6B7A`（新DS同名） | ○ |
| 28 | `--text-tertiary` | `#5A8896` | `--text-tertiary: #5A8896`（M0-5 適用済） | ○ |
| 29 | `--text-disabled` | `#8BAEB9` | `--text-disabled: #8BAEB9`（M0-5 適用済） | ○ |
| 40 | `--divider` | `#B2D5E2` | `--divider: #B2D5E2`（新DS同名） | ○ |
| 41 | `--error` | `#DB577B` | `--error: var(--semantic-error)` → `#DB577B` | ○ |
| 44 | `--success` | `#38A169` | `--success: var(--semantic-success)` → `#38A169` | ○ |
| 45 | `--success-text` | `#276749` | `--success-text: var(--semantic-success-text)` → `#276749` | ○ |
| 47 | `--warning` | `#D69E2E` | `--warning: var(--semantic-warning)` → `#D69E2E` | ○ |
| 49 | `--warning-bg` | `rgba(214, 158, 46, 0.1)` | `--warning-bg: var(--semantic-warning-bg)` → 同値 | ○ |
| 52 | `--bg-page` (後方互換) | `var(--base-page)` | co-tokens で新DS同名定義あり（`#E9F1F6`） | ○（冗長） |
| 53 | `--bg-surface` (後方互換) | `var(--base-surface)` | co-tokens: `#FFFFFF` | ○（冗長） |
| 54 | `--bg-surface-2` (後方互換) | `var(--base-surface-alt)` | co-tokens: `#F0EDE9` | ○（冗長） |
| 55 | `--bg-surface-3` (後方互換) | `var(--base-muted)` | co-tokens: `#D3D0C8` | ○（冗長） |
| 56 | `--bg-sidebar` (後方互換) | `var(--sub-primary)` | co-tokens: `#004554` | ○（冗長） |
| 57 | `--accent` (後方互換) | `var(--accent-primary)` | co-tokens: `var(--accent-primary)` → `#44A6B5` | ○（冗長） |
| 58 | `--secondary` (後方互換) | `var(--sub-secondary)` | co-tokens には `--secondary` 同名定義**無**（但し alias に同名無しのため、削除すると `--secondary` 未定義化） | **△** |

**分類A 合計: 26 変数（L52〜58 の後方互換変数のうち `--secondary` は co-tokens.css に無いので要検討 → 3.3 参照）**

#### 分類B: 残す（OB固有・値不一致・用途特殊）

| 行 | 変数 | 値 | 残留理由 |
|---|------|------|--------|
| 12 | `--base-grid` | `#F5F5F5` | OB固有（テーブル背景）、co-tokens.css に同名無し |
| 13 | `--base-grid-alt` | `#F2F2F1` | OB固有（ゼブラ背景）、co-tokens.css に同名無し |
| 14 | `--base-grid-total` | `#F0F4F4` | OB固有（合計行背景）、co-tokens.css に同名無し |
| 32 | `--day-sat` | `#EAF0F1` | OB固有（土曜オーバーレイ）、co-tokens.css に同名無し |
| 33 | `--day-sun` | `#F3ECEE` | OB固有（日曜オーバーレイ）、co-tokens.css に同名無し |
| 34 | `--day-sat-head` | `#BECAC5` | OB固有（曜日ヘッダ）、co-tokens.css に同名無し |
| 35 | `--day-sun-head` | `#D4BEBD` | OB固有、同上 |
| 36 | `--day-sat-cal` | `rgba(68, 166, 181, 0.06)` | OB固有、同上 |
| 37 | `--day-sun-cal` | `rgba(220, 120, 120, 0.06)` | OB固有、同上 |
| 42 | `--error-bg` | `rgba(219, 87, 123, 0.08)` | OB固有（α値独自）、co-tokens.css に同名無し |
| 43 | `--night-text` | `#DB577B` | OB固有（夜間テキスト、値は --error と同じだが用途が別） |
| 46 | `--success-bg` | `rgba(56, 161, 105, 0.1)` | OB固有、co-tokens.css に同名無し |
| 48 | **`--warning-text`** | `#975A16` | **値不一致**（co-tokens: `#92400e`）。削除すると見た目が変化するため残留。M-A2 以降で整合検討 |

**分類B 合計: 13 変数（OB固有9件 + α値独自2件 + 値不一致1件 + `--secondary` 判断要1件）**

### 3.2 OB CSS 本文（`:root` 外）の `var(--xxx)` 参照分布

削除候補変数の本文参照数を調査（全て `co-tokens.css` で解決可能と確認）:

| 変数 | 本文参照箇所（概算） | 解決先 |
|------|---------------------|--------|
| `--base-page` / `--base-surface` / `--base-surface-alt` / `--base-muted` 系 | 複数 | co-tokens alias |
| `--sub-primary` / `--sub-secondary` | 複数 | co-tokens alias |
| `--accent-primary` / `--accent-light` / `--accent-dim` | 複数 | co-tokens 新DS / alias |
| `--text-primary` / `--text-secondary` / `--text-tertiary` / `--text-disabled` | 複数 | co-tokens 新DS |
| `--divider` / `--error` / `--success` / `--success-text` / `--warning` / `--warning-bg` | 多数 | co-tokens 新DS / alias |
| **分類A対象の var() 参照合計** | **293件** | すべて co-tokens.css で解決可能 |

OB固有変数の本文参照:

| 変数 | 本文参照箇所 |
|------|------------|
| `--base-grid*` / `--day-*` / `--night-text` / `--error-bg` / `--success-bg` 等 | 計 38件（残留するので参照は破れない） |
| `--night-text` のみ | 13件 |

### 3.3 `--secondary`（後方互換、L58）の扱い

- OB L58: `--secondary: var(--sub-secondary);`
- co-tokens.css 内に `--secondary` という名前は**存在しない**（legacy alias にも未定義）
- OB 本文で `var(--secondary)` の参照があるか確認 → 後述の T12 で grep 検証し、参照が 0件なら安全に削除可（分類A扱い）、参照が 1件以上なら残留（分類B扱い）
- **初期判定**: 参照 0件想定 → **分類A（削除可）**。IM は grep で再確認のうえ削除判断

### 3.4 削除後の期待 `:root` 行数

- 削除前: `:root` ブロック L6〜L59 = **54行**（コメント・空行含む）
- 削除対象: 26変数（分類A） + 関連コメント削減 → 見出しコメント（`/* Tier 1 */` 等）の再整理
- 削除後（目安）: `:root` ブロック 約 **20行**（13変数 + 最小コメント）
- **行数削減率**: 元の 60% 以下（34行以上削減）

### 3.5 M0 成果物との差分境界

M-A1 では以下に差分が発生してはならない:

- `docs/mockup/co-tokens.css`
- `docs/mockup/order-book.html` / `weekly-schedule.html` / `quick-access.html` / `screen-layout.html`
- `docs/mockup/weekly-schedule.css` / `quick-access.css` / `screen-layout.css`
- `docs/ui-components/styles-light.css` / `tokens.json`
- 全ての JS ファイル

---

## 4. テストチェックリスト（25項目）

### A. DS準拠（分類A削除の網羅性）

- [ ] **T1** `order-book.css` の `:root` ブロック内に `--base-page`, `--base-surface`, `--base-surface-alt`, `--base-muted` の**定義行が存在しない**（`grep -n "^\s*--base-page:" order-book.css` の結果が 0件）
- [ ] **T2** `:root` 内に `--sub-primary`, `--sub-secondary` の定義行が存在しない
- [ ] **T3** `:root` 内に `--accent-primary`, `--accent-light`, `--accent-dim` の定義行が存在しない
- [ ] **T4** `:root` 内に `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled` の定義行が存在しない
- [ ] **T5** `:root` 内に `--divider`, `--error`, `--success`, `--success-text`, `--warning`, `--warning-bg` の定義行が存在しない
- [ ] **T6** `:root` 内の「後方互換」コメント配下のうち、co-tokens.css で解決可能な `--bg-page`, `--bg-surface`, `--bg-surface-2`, `--bg-surface-3`, `--bg-sidebar`, `--accent` が削除されている
- [ ] **T7** `--secondary` について、OB 本文で `var(--secondary)` が 0件であることを `grep` で確認した上で、`:root` から削除されている（参照が 1件以上の場合は残留）

### B. カラー（値一致）

- [ ] **T8** 削除後、OB 実ブラウザで描画される body 背景が `#E9F1F6`（`--base-page` 解決値）のままであること（DevTools で `getComputedStyle(document.body).backgroundColor` を確認）
- [ ] **T9** 削除後、アクセント色が `#44A6B5` のままであること（適当なアクセント要素を DevTools で確認）

### D. OB固有変数の残留

- [ ] **T10** `:root` 内に `--base-grid`, `--base-grid-alt`, `--base-grid-total` の定義が**残っている**
- [ ] **T11** `:root` 内に `--day-sat`, `--day-sun`, `--day-sat-head`, `--day-sun-head`, `--day-sat-cal`, `--day-sun-cal` の定義が残っている
- [ ] **T12** `:root` 内に `--error-bg`, `--night-text`, `--success-bg` の定義が残っている
- [ ] **T13** `:root` 内に `--warning-text: #975A16;`（値不一致のため残留）が残っている
- [ ] **T14** OB 本文内の `var(--base-grid)` / `var(--base-grid-alt)` / `var(--base-grid-total)` / `var(--day-*)` / `var(--error-bg)` / `var(--success-bg)` / `var(--night-text)` / `var(--warning-text)` 参照が引き続き正しく解決される（CSS パースエラーなし）

### E. 機能回帰・見た目不変

- [ ] **T15** `order-book.html` を実ブラウザで開き、**M0-5 コミット（95acce5）時点のスクリーンショットと目視比較して差分ゼロ**（ヘッダ・サイドバー・テーブル・曜日色・合計行・モーダル・バッジ・ボタン全て）
- [ ] **T16** OB 本文で `var(--xxx)` の `xxx` が未定義（= undefined）になっているケースが 0 件（DevTools Console に CSS 関連のエラー・警告が出ていないこと）
- [ ] **T17** OB の主要インタラクション（行選択・編集モーダル・フィルタ・モーダル開閉・ドラッグ&ドロップ）が全て動作する
- [ ] **T18** 曜日オーバーレイ（土曜・日曜）の背景色が `--day-sat` / `--day-sun` で塗られている
- [ ] **T19** 夜間行のテキスト色が `--night-text`（`#DB577B`）で描画されている

### G. コード品質・保守性

- [ ] **T20** 削除後の `:root` ブロックが元の L6〜L59（54行）から **約60%以下**（概ね 32行以下）に縮小されている
- [ ] **T21** 削除後の `:root` に「Tier 1 Base」「Tier 2 Sub」「Tier 3 Accent」「テキスト」といった見出しコメントのうち、配下定義が全滅した見出しは削除または統合されている（空セクション残留なし）
- [ ] **T22** 「後方互換」コメントブロック（L51〜58）は、残留変数が 0 or 1件になった場合に整理されている（誤解を招く記述の除去）

### F. ドキュメント整合（他ファイル非波及）

- [ ] **T23** `git diff` の対象ファイルが **`docs/mockup/order-book.css` 1 ファイルのみ**
- [ ] **T24** `co-tokens.css` / `styles-light.css` / `tokens.json` / 他3モックアップCSS (`weekly-schedule.css` / `quick-access.css` / `screen-layout.css`) / 全HTMLファイル / 全JSファイル に差分ゼロ
- [ ] **T25** `docs/plan/phase-logs/m-a1-*.md` 以外の docs/ ファイルに差分ゼロ

---

## 5. 重大Claim（検出された場合は即 FAIL）

| # | Claim | 検査方法 |
|---|-------|---------|
| **C1** | **値不一致の変数を誤って削除し、OB の見た目が変化**（特に `--warning-text: #975A16`、`--night-text: #DB577B` を分類A扱いにした） | T13 / T15 / T19 |
| **C2** | **OB固有変数を誤って削除し、CSS参照が破れた**（`--base-grid*` / `--day-*` / `--error-bg` / `--success-bg` のいずれか） | T10〜T12, T14, T18 |
| **C3** | **`co-tokens.css` を改変した**（M-A1 は `co-tokens.css` を一切触らない） | T24 |
| **C4** | **他モックアップCSS (`weekly-schedule.css` / `quick-access.css` / `screen-layout.css`) に差分発生** | T24 |
| **C5** | **HTML / JS / `styles-light.css` / `tokens.json` に差分発生** | T24 / T25 |
| **C6** | **実ブラウザで OB の見た目が M0-5 コミット時点から変化**（T15 で差分検出） | T15 |
| **C7** | **OB 本文の `var(--xxx)` 参照が未定義になり、CSSパースエラー or 初期値フォールバックが発生** | T16 |

---

## 6. 合格条件

- 全25項目の検証に基づく総合点が **70点以上**
- 重大Claim（C1〜C7）が **0件**

両方を満たした場合のみ、M-A1 PASS と判定。IM は本TDを基に実装後、TE → SC のレビューへ。

---

## 7. 備考・実装ヒント

1. **削除順序の推奨**:
   a. OB 本文の `var(--secondary)` 参照を grep で確認（0件 → 分類A、1件以上 → 分類B）
   b. 分類A の定義行（20数行）を :root から削除
   c. 空になった見出しコメントを削除または統合
   d. 実ブラウザで OB を開き、M0-5 時点との目視比較（差分ゼロを確認）
   e. grep で削除漏れ・誤削除がないかを再確認
2. **残留対象の `--warning-text` は、将来 M-A2 で値整合を検討**（`#975A16` → `#92400e` への移行、または OB 独自値として `--semantic-warning-text-ob` のような命名で分離）
3. **`--night-text` は `--error` と値が同じ**（`#DB577B`）だが、意味（夜間表現）が異なるため OB 独自トークンとして残す。後続フェーズで `data-time="night"` 属性化の検討対象
4. **後方互換コメントブロック（L51）は、ほぼ全滅する前提**で、必要なら「OB固有の後方互換用エイリアス（該当なし）」に書き換え、または全削除
5. M0-5 コミット（95acce5）時点の OB スクリーンショットを TE が取得済みであることを前提とする。未取得の場合は M-A1 実装前に取得必須
