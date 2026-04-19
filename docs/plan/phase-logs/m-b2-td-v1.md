# Phase M-B2 TD v1 — OB フィルタ dropdown checkbox の新DS置換 テスト設計

> Role: Test Designer（TD） / Target: Sub-Phase **M-B2**
> Scope: `docs/mockup/order-book.css` / `docs/order-book.html` / `docs/mockup/order-book.js` / `docs/mockup/co-forms.css`
> Upstream: Phase M0 + M-A + M-B1 完了（コミット 7c49b8e）

---

## 1. 目的（採用案と根拠）

### 採用案: **案B（新規定義を co-forms.css に追加 + OB filter 構造を新DS準拠に置換）**

### 根拠

事前調査の結果、以下の前提条件が確定した。

1. **新DS正（`styles-light.css`）には `.md-fi-checkbox` が未定義**。DS 側の checkbox 正は `.form-checkbox`（行 3152-3177）で命名体系が `md-fi-*` 系と異なる。
2. **co-forms.css にも checkbox は収載されていない**（行1-50、Phase M0 成果物の抽出対象外）。
3. **OB filter dropdown の checkbox は OB 固有 UI**（WS/QA/SL には存在せず、他モックアップへの波及リスクは低い）。
4. ただし OB filter の checkbox と、今後 Phase M-D（モーダル）/ M-E（バッジ）/ M-F（会計設定）などで必要になる汎用 checkbox は**同一 DS 実体**であるべき。案C（OB 内独自 CSS で閉じる）だと DS 二重管理になる。

→ **styles-light.css 側の命名規約（`.form-checkbox`）を採用せず、`md-fi-*` 名前空間との整合性を優先**し、co-forms.css に **`.md-fi-checkbox`** を新規定義する。これは Phase M-B1 で合意済みの DS 命名方針（OB 系は `md-fi-*` を見る）を継続するもの。**styles-light.css 側にも `.md-fi-checkbox` エイリアスを追加するか否かは SC が判断**（本TDでは co-forms.css のみでの新規定義を許容する）。

### 非目標（スコープ外）

- `.md-ob-filter-dd-item` 自体は**フィルタ固有のドロップダウン行レイアウト**であり、そのまま残す（hover 背景・padding・gap 等の機能要件）
- `.md-ob-filter-dd-badge` / `.md-ob-filter-dd-btn` / `.md-ob-filter-dd-arrow` / `.md-ob-filter-dd-panel` など filter 構造体は M-B2 では置換しない（M-E「バッジ」で別途再検討）
- `.form-checkbox`（styles-light.css）自体のリネーム／削除は行わない

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 30 | checkbox ビジュアル（枠・チェック色・サイズ）／ filter dd 全体の見た目維持 |
| ブラウザ互換（Browser） | B | 10 | Chrome / Edge / Firefox で accent-color 等が一致 |
| 機能（Domain/Behavior） | D | 20 | filter 開閉・全選択解除・applyFilters 動作・ラベル更新 |
| アクセシビリティ（E） | E | 25 | キーボード操作・focus ring・aria 属性・label 結合（**やや重視**） |
| 回帰（Regression） | F | 10 | 他モックアップ・OB モーダル内他の checkbox 利用箇所への波及なし |
| ガバナンス（G） | G | 5 | co-forms.css 先頭コメント更新・命名整合性 |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0**

---

## 3. 事前調査結果

### 3.1 `.md-fi-checkbox` の有無

| 調査対象 | 結果 |
|----------|------|
| `docs/ui-components/styles-light.css` | **未定義**（Grep 0件） |
| `docs/mockup/co-forms.css` | **未定義**（Grep 0件） |
| 類似クラス | `.form-checkbox` @ styles-light.css L3152-3177 のみ |

### 3.2 styles-light.css の `.form-checkbox` 定義（行 3152-3177）

```css
.form-checkbox, .form-radio {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    font-size: var(--fs-sm);
    color: var(--text-primary);
    -webkit-user-select: none;
    user-select: none;
}
.form-checkbox input[type="checkbox"],
.form-radio input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
    cursor: pointer;
}
.form-checkbox input:disabled,
.form-radio input:disabled { cursor: not-allowed; }
.form-checkbox:has(input:disabled),
.form-radio:has(input:disabled) {
    color: var(--text-disabled);
    cursor: not-allowed;
}
```

→ **移植素材としてはこれが唯一の正。`md-fi-checkbox` への改名は形式的**。

### 3.3 OB filter の現状構造（行番号付き）

**CSS: `docs/mockup/order-book.css`**

| 行 | 定義 | 役割 |
|----|------|------|
| 152-154 | `.md-ob-filter-dd` | 位置基準（relative） |
| 155-166 | `.md-ob-filter-dd-btn` | トリガーボタン |
| 167-171 | `.md-ob-filter-dd-btn:hover` / `.open` | hover/open 時の枠 |
| 172-180 | `.md-ob-filter-dd-arrow` | ▼ アイコン |
| 181-196 | `.md-ob-filter-dd-panel` | 展開パネル（z-index:200） |
| **197-204** | **`.md-ob-filter-dd-item`** | **checkbox 行（display:flex, padding, gap）** |
| 205-207 | `.md-ob-filter-dd-item:hover` | hover 背景 |
| **208-211** | **`.md-ob-filter-dd-item input[type="checkbox"]`** | **accent-color のみ定義**（置換対象） |
| 212-224 | `.md-ob-filter-dd-badge` | 選択数バッジ（M-E で扱う） |
| 225-229 | `.md-ob-filter-clear` | クリアボタン |

**HTML: `docs/order-book.html`**

| 行 | 内容 |
|----|------|
| 55-77 | `#filterBar` 全体（display:none; で初期非表示） |
| 57-63 | 会社フィルタ dd（checkbox は JS 動的生成） |
| 65-77 | 区分フィルタ dd |
| **71-75** | **静的 checkbox 5件**（施設/イベント/高速/交通/応援交通） |

**JS: `docs/mockup/order-book.js`**

| 行 | 関数/処理 | 内容 |
|----|-----------|------|
| 719-724 | `getFilterDDSelected(panelId)` | `:checked` を収集 |
| 727-734 | `updateFilterDDLabel` | badge + 選択値をラベル表示 |
| 737-743 | `toggleFilterDD(ddId)` | 他 dd を閉じる＋open トグル |
| 760-770 | `buildBranchPanel()` | `sampleRows` から会社 dd を動的生成 |
| **768** | **動的 checkbox 1件**（`<label class="md-ob-filter-dd-item"><input type="checkbox" …>`） |
| 772-778 | outside click で close |
| 819-829 | `clearFilters()` | 全 checkbox 解除 |

**checkbox 生成箇所: 静的5件 + 動的1件（動的は可変数） = CSSセレクタで一括適用可**

### 3.4 他モックアップでの類似機能

| Mockup | filter-dd 系 | checkbox |
|--------|--------------|----------|
| WS（week-schedule） | なし | — |
| QA（quick-access） | なし | — |
| SL（screen-layout） | なし | — |
| OB モーダル内（e.g. CN モーダル） | 確認要（本TDスコープ外・重大Claimに記録） |

→ **filter-dd checkbox は OB 固有**。波及リスクはモックアップ横断では低い。ただし OB 内の別モーダル（変更通知・印刷ダイアログ等）で checkbox がある場合は既存のままで、M-B2 では触らない方針とする（スコープ厳守）。

---

## 4. 置換マッピング表

### 4.1 新規追加（co-forms.css）

```css
/* ----- Checkbox / Radio ----- */
.md-fi-checkbox,
.md-fi-radio {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    font-size: var(--fs-sm);
    color: var(--text-primary);
    -webkit-user-select: none;
    user-select: none;
}
.md-fi-checkbox input[type="checkbox"],
.md-fi-radio input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
    cursor: pointer;
}
.md-fi-checkbox input:disabled,
.md-fi-radio input:disabled { cursor: not-allowed; }
.md-fi-checkbox:has(input:disabled),
.md-fi-radio:has(input:disabled) {
    color: var(--text-disabled);
    cursor: not-allowed;
}
```

### 4.2 OB 側置換

| # | ファイル | 行 | 現状 | 置換後 |
|---|---------|-----|------|--------|
| 1 | order-book.css | 208-211 | `.md-ob-filter-dd-item input[type="checkbox"] { accent-color: var(--accent-primary); cursor: pointer; }` | **削除**（`.md-fi-checkbox` 側が担当） |
| 2 | order-book.css | 197-204 | `.md-ob-filter-dd-item { display:flex; align-items:center; gap:6px; padding:6px 12px; font-size:12px; color:var(--text-primary); cursor:pointer; transition:background .1s; }` | **padding/gap/font-size は filter固有として残す**（DS の `gap:var(--space-sm)` は上書き） |
| 3 | order-book.html | 71-75 | `<label class="md-ob-filter-dd-item"><input type="checkbox" …>` | `<label class="md-ob-filter-dd-item md-fi-checkbox"><input type="checkbox" …>` |
| 4 | order-book.js | 768 | `'<label class="md-ob-filter-dd-item"><input type="checkbox" …>'` | `'<label class="md-ob-filter-dd-item md-fi-checkbox"><input type="checkbox" …>'` |

### 4.3 役割分離の明示

| クラス | 責務 |
|-------|------|
| `.md-ob-filter-dd-item`（filter 固有） | dropdown 内の行レイアウト（padding, hover 背景色, full-width 1行表示） |
| `.md-fi-checkbox`（DS） | checkbox ビジュアル（サイズ 16×16、accent-color、disabled 状態、gap） |

両者を同一 `<label>` に並べることで、filter の独自レイアウトを維持しつつ、checkbox ビジュアルを DS に委譲する。

---

## 5. テストチェックリスト（25項目）

### A. 視覚回帰（30点 = 各3点 × 10項目）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| A-1 | 区分フィルタ dd を開いたとき、5つの checkbox が表示される | 3 | visible |
| A-2 | 会社フィルタ dd を開いたとき、sampleRows 由来の checkbox が表示される | 3 | ≥1件 |
| A-3 | checkbox サイズが 16×16px | 3 | 16×16 |
| A-4 | checkbox の accent 色が `var(--accent)` | 3 | tokens.css の accent 系色 |
| A-5 | checkbox と label 文字の gap が `var(--space-sm)` | 3 | 6-8px |
| A-6 | filter dd-item の hover 背景が維持（accent-primary-dim） | 3 | 薄色背景 |
| A-7 | filter dd-panel の枠・影が維持 | 3 | before と同じ |
| A-8 | filter dd-badge の見た目維持（選択時） | 3 | 変化なし |
| A-9 | checkbox:checked 時のチェックマーク描画 | 3 | OS ネイティブ |
| A-10 | 日本語 label の折り返し挙動維持 | 3 | 1行表示 |

### B. ブラウザ互換（10点 = 各2.5点 × 4項目）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| B-1 | Chrome: `accent-color` 適用 | 2.5 | OK |
| B-2 | Edge: `accent-color` 適用 | 2.5 | OK |
| B-3 | Firefox: `accent-color` 適用 | 2.5 | OK |
| B-4 | `:has()` セレクタによる disabled 伝播 | 2.5 | Safari 15.4+/Chrome 105+ OK |

### D. 機能動作（20点 = 各2点 × 10項目）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| D-1 | `toggleBranchDD` で会社フィルタ開閉 | 2 | open クラス切替 |
| D-2 | `toggleCategoryDD` で区分フィルタ開閉 | 2 | open クラス切替 |
| D-3 | checkbox クリックで `onCategoryCheck` / `onBranchCheck` 発火 | 2 | applyFilters 呼出 |
| D-4 | `getFilterDDSelected` が `:checked` を配列で返す | 2 | ["施設","高速"] 等 |
| D-5 | `updateFilterDDLabel` が選択数バッジ＋値を表示 | 2 | "[2] 施設, 高速" |
| D-6 | 複数選択後 `isFiltered` で絞込みされる | 2 | 該当行のみ描画 |
| D-7 | `clearFilters` で全 checkbox が解除される | 2 | :checked=0 |
| D-8 | outside click で全 dd が閉じる | 2 | open 解除 |
| D-9 | 会社フィルタ dd が `buildBranchPanel` で動的再描画 | 2 | sampleRows 反映 |
| D-10 | GCフィルタ（mdNavGcIsCompanyVisible）と排他なく動作 | 2 | 両方適用 |

### E. アクセシビリティ（25点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| E-1 | `<label>` で `<input>` を包含しクリック領域が label 全体 | 4 | label クリックで toggle |
| E-2 | Tab キーで checkbox にフォーカス移動可能 | 4 | tab index 自然順 |
| E-3 | Space キーで checkbox の on/off 切替 | 4 | `:checked` 反転 |
| E-4 | focus ring が OS ネイティブで描画される（focus-visible） | 4 | 視覚確認 |
| E-5 | disabled 状態で `cursor: not-allowed` と色 dim | 3 | `.md-fi-checkbox:has(input:disabled)` 発動 |
| E-6 | dd-btn が `type="button"` で誤送信を防ぐ | 3 | OK（現状 HTML 既に設定） |
| E-7 | label 文字の色コントラストが text-primary で WCAG AA 以上 | 3 | tokens.css 仕様 |

### F. 回帰（10点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| F-1 | OB モーダル内（CN/印刷 etc.）既存 checkbox に影響なし（セレクタ競合） | 3 | `.md-fi-checkbox` が未付与の既存箇所は不変 |
| F-2 | WS/QA/SL モックアップが影響を受けない | 3 | co-forms.css 変更のみで他モックアップのビジュアル不変 |
| F-3 | `.md-ob-filter-dd-item` の padding/hover が保たれる | 2 | 変化なし |
| F-4 | `.md-ob-filter-dd-badge` の表示が保たれる | 2 | 変化なし |

### G. ガバナンス（5点）

| # | 項目 | 配点 | 期待値 |
|---|------|------|--------|
| G-1 | co-forms.css 先頭コメントに「Checkbox / Radio セクション追加（M-B2）」を追記 | 2 | コメント更新 |
| G-2 | 命名が `md-fi-*` 名前空間で統一（ラジオも同時定義） | 2 | `.md-fi-checkbox` + `.md-fi-radio` |
| G-3 | ds-migration-plan.md の M-B2 チェック欄を更新 | 1 | 完了マーク |

**合計: 30 + 10 + 20 + 25 + 10 + 5 = 100点**

---

## 6. 重大Claim（Showstopper）

いずれか1件でも発生したら**即座に不合格**。

| # | 事象 | 検知方法 |
|---|------|---------|
| C-1 | filter dropdown が開かない／閉じない（機能停止） | D-1, D-2 |
| C-2 | checkbox がクリックしても on/off 切替しない | D-3, E-1 |
| C-3 | `clearFilters` が機能せず選択が残留する | D-7 |
| C-4 | 他モックアップ（WS/QA/SL）のビジュアルに差分が発生 | F-2（diff 目視） |
| C-5 | OB モーダル（CN/印刷）内の既存 checkbox が壊れる（セレクタ競合） | F-1 |
| C-6 | JS コンソールに新規エラーが出る | DevTools Console |

---

## 7. 合格条件

- **70点以上** AND **重大Claim=0件**
- 70点未満または重大Claim>0 → SC にて修正方針策定 → TE 再実行

---

## 8. 実装時の注意（SC への申し送り）

1. **co-forms.css の追加位置**: 既存の `.md-fi-select` / `.md-fi-combo` ブロックの直後（末尾コメントブロック直前）を推奨
2. **`.md-fi-radio` も同時定義**: 将来の単一選択フィルタに備え、DS 正と同じく checkbox/radio を一括定義しておく（追加コスト低）
3. **`.md-ob-filter-dd-item input[type="checkbox"]` の削除**: accent-color は `.md-fi-checkbox` 側が担当するため、OB 側の重複定義は削除する。**削除忘れはスタイル優先度の予期せぬ挙動を招く**ため要注意
4. **HTML/JS の class 付与順**: `class="md-ob-filter-dd-item md-fi-checkbox"` の順（filter 固有 → DS の順）。逆順でもカスケード結果は同じだが、役割の視認性を優先
5. **styles-light.css 側の対応**: 本 Phase では**触らない**（M-B2 は mockup 側のみ）。DS 正へのエイリアス追加は M-E 以降の議論とする
6. **Phase M-E（バッジ）との関係**: `.md-ob-filter-dd-badge` は M-B2 では触らない。M-E で `.md-ba-*` 系へ移行予定

---

_作成: Test Designer / Phase M-B2 TD v1 / 2026-04-20_
