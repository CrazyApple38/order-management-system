# Phase M-C5 TD v1 — OB テーブルの密度モード対応（data-density 切替）

> Role: Test Designer（TD） / Target: Sub-Phase **M-C5**
> Scope: `docs/mockup/order-book.css`（密度トークン参照化 + compact/comfortable/spacious 差分定義）
> Upstream: M-C1（BEM命名）/ M-C2（z-index）/ M-C3（data-dow/shift）/ M-C4（Zebra/合計/空セル BEM 修飾子化）
> Downstream: M-D（ボタン・モーダル）/ M-F（印刷・A11y・密度連動再検証）/ M-G（旧エイリアス削除）
> Related Tokens: `co-tokens.css` L172-175（:root 既定）/ L230-246（`:root[data-density="..."]` 3段）

---

## 1. 目的

### 1.1 主目的（M-C5 の範囲）

OB テーブル（`.tbl-grid` / `.tbl-grid__cell` / `.tbl-grid__sticky--N` 等）のセル高さ・パディング・フォントサイズを、**`co-tokens.css` で定義済みの密度トークン（`--tbl-row-h` / `--space-row` / `--fs-density-base`）経由**に書き換える。
これにより、`<html data-density="compact|comfortable|spacious">` 属性の切替で、OB の行高・余白・文字サイズが一括連動する状態にする。

### 1.2 採用案（TD 決定）: **案B — 見た目不変＋密度切替機能のみ追加**

#### 採用理由（案A を却下し案B を採る根拠）

1. **既定現状が compact とほぼ一致**:
   - `.tbl-grid__cell { min-height: 28px; padding: 4px 6px; }`（L250, L257）
   - `.tbl-grid__sticky--0 { line-height: 28px; }`（L275）
   - `.tbl-grid { font-size: 12px; }`（L244）
   - → 行高 **28px** は `data-density="compact"` の `--tbl-row-h: 28px` と完全一致。`padding 4px` は `--space-row(compact)=4px` と一致
   - OB の既定をあえて comfortable(36px) に切り上げると、**現状画面が全面的に背高化**し、M-C1〜M-C4 で積み上げた視覚回帰テストが総崩れになる
2. **OB の本質は情報密度**:
   - 1ヶ月 31日 × 最大 40 現場 ≈ 1200 データセルを同時表示する画面
   - 行高 36px になると 1 画面あたりの表示行数が約 22% 減（8px×可視行数のスクロール増）
   - ユーザー運用要件として密度を落とす判断は取っていない → 既定は現状維持が安全
3. **OB の既定行高と DS 既定の乖離は ds-migration-plan L281 で明示認識済み**:
   - L281「M-F: 密度モード連動（行高40px固定 → `--tbl-row-h` 経由、既定 comfortable=36px に揃える是非を要判断）」
   - → **既定の 28px→36px 切り上げは M-F で判断する予定事項**。M-C5 の範囲に前倒しして決めるべきでない
4. **M-F で「OB は compact 既定にする」結論になっても、案B の実装（既定=現状相当、属性切替で spacious/comfortable へ拡張）はそのまま再利用可能**:
   - M-F で結論が「OB既定=comfortable(36px)」に振れた場合のみ、co-tokens.css 側の既定変更 or OB 側の override 1 箇所調整で済む
5. **案A のリスクと工数が案B より大きい**:
   - 案A: 既定行高 28→36px で視覚差分が大量発生 → 目視承認 + スクショ差分 + 関連スクリーンショット撮り直し
   - 案B: `var(--tbl-row-h, 28px)` 等のトークン参照に置換するだけ。既定は 28px 維持で視覚不変

#### 採用案のポイント

- **トークン参照化 + OB 独自既定のブリッジ**: `:root` の既定は `--tbl-row-h: 36px` だが、OB では `:root[data-density]` 未指定時は 28px 相当で動作させたい
- **解決手段**: OB 側に `.tbl-grid { --tbl-row-h-ob: var(--tbl-row-h, 36px); ... }` のローカル変数を導入せず、**CSS 値側で `var(--tbl-row-h, 28px)` フォールバックと直接参照の併用はしない**。代わりに、**OB に独自の密度マップ `.tbl-grid[data-density-scope="ob"]` などは導入せず、`:root` の密度定義をそのまま尊重**し、OB の既定表示は `data-density="compact"` を `<html>` に初期付与することで 28px を担保する
- **初期属性**: `docs/order-book.html` の `<html>` に `data-density="compact"` を追加する（または `<body data-density="compact">` — `co-tokens.css` 側セレクタ `:root[data-density="..."]` に合わせて `<html>` に付与が正）
- **M-C5 で追加する切替 UI は作らない**: 属性を付与する HTML 1 箇所と CSS トークン参照化のみ。UI（トグルボタン）は M-F スコープ

### 1.3 非目標（スコープ外）

- 密度切替 UI（トグル/ドロップダウン）実装 → M-F
- OB 既定行高を 28px→36px に引き上げる判断 → M-F
- `.tbl-grid__sticky--N` の left 座標（100/164/200/330/358/488/516/552px）の密度連動 → **スコープ外**（左固定列は列幅変動しないため）
- WS / QA / SL の密度対応 → 各スコープ
- フォント系トークン（`--fs-body / --fs-caption` 等）の density 連動 → `--fs-density-base` 一本で十分、個別 font-size への波及は M-F

---

## 2. 配点

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| 視覚回帰（Appearance） | A | 25 | `data-density` 未指定 or `compact` で現状と見た目完全不変（行高 28px / padding 4px 6px / font-size 12px） |
| ブラウザ互換（Browser） | B | 10 | Chrome / Edge / Firefox で `var()` のフォールバック挙動および `:root[data-density]` 属性セレクタが同一動作 |
| 機能（Domain/Behavior） | D | 25 | `<html data-density="compact\|comfortable\|spacious">` で行高・padding・font-size が正しい値へ切替わる（compact=28/4/13, comfortable=36/8/14, spacious=44/12/15） |
| **見た目不変（Equivalence）** | **E** | **25** | **案B の核心: 既定表示で M-C4 完了時点のスクリーンショットと pixel diff 差分が極小（< 100px²）** |
| ガバナンス（Governance） | G | 15 | 案B採用根拠 / OB既定=compact の理由 / M-F で既定引き上げ再判断の伏線 / co-tokens の既定 36px との乖離の明示 |
| **合計** | — | **100** | |

**合格条件: 70点以上 AND 重大Claim=0**

> 配点比は「A=25 / B=10 / D=25 / E=25 / G=15」。案B の中核価値が「見た目不変（E）」と「切替動作の正確性（D）」の二本柱なので両者を均等配点、視覚回帰（A）は E と重複するが既定表示の各要素（行高・padding・font-size）を個別に検証するため独立で確保。

---

## 3. 事前調査結果

### 3.1 `co-tokens.css` の密度トークン定義

| トークン | 既定（`:root`） | compact | comfortable | spacious | 定義行 |
|---------|-----------------|---------|-------------|----------|--------|
| `--tbl-row-h` | 36px | 28px | 36px | 44px | L173 / L231 / L237 / L243 |
| `--space-row` | 8px | 4px | 8px | 12px | L174 / L232 / L238 / L244 |
| `--fs-density-base` | 14px | 13px | 14px | 15px | L175 / L233 / L239 / L245 |

→ トークンは既に定義済み。**OB 側でトークン参照に書き換えるだけ**で連動する。

### 3.2 OB CSS の現状値（`docs/mockup/order-book.css`）

| # | 行 | セレクタ | 現状プロパティ | 対応トークン |
|---|----|---------|--------------|-------------|
| 1 | L244 | `.tbl-grid` | `font-size: 12px;` | — （※ 下記 §3.3 参照）|
| 2 | L250 | `.tbl-grid__cell` | `padding: 4px 6px;` | `--space-row`（縦軸 4px）/ 横軸 6px は固定維持 |
| 3 | L257 | `.tbl-grid__cell` | `min-height: 28px;` | `--tbl-row-h` |
| 4 | L266 | `.tbl-grid__cell.tbl-grid__header` | `font-size: 11px;` | 固定維持（ヘッダ専用サイズ） |
| 5 | L275 | `.tbl-grid__sticky--0` | `line-height: 28px;` | `--tbl-row-h` |
| 6 | L303 | `.tbl-grid__date-header` | `padding: 3px 2px;` | 固定維持（日付ヘッダ専用） |
| 7 | L316 | `.tbl-grid__date-cell` | `padding: 1px 2px;` | 固定維持（内容密集用の最小 padding） |
| 8 | L365 | `.tbl-grid__cell--total` | `font-size: 11px;` | 固定維持（合計セル専用） |
| 9 | L378 | `.tbl-grid__row--total` | `font-weight: 700; font-size: 11px;` | 固定維持 |

**`grid-template-rows` / `grid-auto-rows` は CSS 内に未定義**（`grid-template-columns` のみ JS 動的設定、行高は `.tbl-grid__cell` の `min-height` に依存）。→ **行高変更は `min-height` と `line-height` の 2 箇所で十分**。

### 3.3 font-size のスコープ

- `.tbl-grid { font-size: 12px; }`（L244）: テーブル全体の既定。DS の `--fs-density-base`（compact=13px / comfortable=14px / spacious=15px）と1px 差。
- 各セル個別は `.tbl-grid__day-num(13)`, `.tbl-grid__date-cell(13)`, `.tbl-grid__cell-count(13)`, `.tbl-grid__cell--total(11)`, `.tbl-grid__row--total(11)` 等、**個別に上書き済み**
- → `.tbl-grid { font-size: var(--fs-density-base); }` に置換すると既定 14px（compact指定時 13px）となり、本来の 12px から +1〜+2px 増える
- **判断**: 案B 既定不変の原則から、**`.tbl-grid` の font-size は現状の 12px 固定を維持**。`--fs-density-base` には連動させない
- 代わりに **`.tbl-grid__date-cell`（日付データセル本体、現状 13px）** のみを `var(--fs-density-base, 13px)` に連動させる
  - compact(13) / comfortable(14) / spacious(15) でメインデータ部だけ自然に拡大
  - ヘッダ・合計は固定（情報密度を守る）

### 3.4 padding の扱い

- `.tbl-grid__cell { padding: 4px 6px; }`: 縦 4px は compact 相当。comfortable=8px / spacious=12px への切替が自然
- 横 6px はセル内容の可読性と列幅のバランスで決めた固定値 → **横軸は固定維持**
- → `.tbl-grid__cell { padding: var(--space-row, 4px) 6px; }` に置換するのが最適

### 3.5 既定値の解決戦略（OB が 28px を既定とする方法）

**選択肢**:
- **Option-X**: `<html data-density="compact">` を OB HTML に初期付与
  - 利点: co-tokens.css の既定（36px）が OB に及ばず compact(28px) で解決
  - 欠点: `<html>` に属性付与が必要 → 1 箇所の HTML 変更
- **Option-Y**: CSS で `var(--tbl-row-h, 28px)` のフォールバックを使い、`<html data-density>` 未指定時は 28px、属性指定時は切替
  - 利点: HTML 変更不要
  - 欠点: co-tokens.css の既定 `--tbl-row-h: 36px` が :root で先に定義されているため、**`var(--tbl-row-h, 28px)` のフォールバックは発火しない**（変数値が "有効" とみなされ 36px が返る）→ 動作不成立
- **Option-Z**: OB 側で `.tbl-grid { --tbl-row-h: 28px; ... }` などローカル再定義
  - 利点: HTML 変更不要、:root の既定より OB スコープが勝つ
  - 欠点: `<html data-density="comfortable">` を付与しても `.tbl-grid` のローカル値が勝ち、**密度切替が効かなくなる**（案B の目的を達成できない）

→ **採用: Option-X**。`docs/order-book.html` の `<html>` タグに `data-density="compact"` を付与する 1 行変更。

### 3.6 co-tokens.css の既定 36px との乖離の扱い

- co-tokens.css L173（`:root { --tbl-row-h: 36px; }`）は DS 全体の既定
- OB は独自に `<html data-density="compact">` で 28px を指示
- → **co-tokens.css の側に変更は加えない**（他モックアップ WS/QA/SL に波及してはいけない）
- ds-migration-governance.md / ds-migration-plan.md への **M-C5 での OB 既定は compact** の記載が必要

### 3.7 影響波及の事前確認

| ファイル | 波及 | 根拠 |
|---------|------|------|
| `docs/order-book.html` | **有**（1箇所） | `<html>` に `data-density="compact"` 追加 |
| `docs/mockup/order-book.css` | **有**（3〜4箇所） | `.tbl-grid__cell` の padding / min-height / `.tbl-grid__sticky--0` の line-height / `.tbl-grid__date-cell` の font-size |
| `docs/mockup/order-book.js` | **無** | JS は密度値を扱わない |
| `docs/mockup/co-tokens.css` | **無** | 既定値は据え置き（DS グローバル契約を壊さない） |
| `weekly-schedule.*` / `quick-access.*` / `screen-layout.*` | **無** | 各モックアップ独自、OB 変更は波及しない |

### 3.8 Governance / Plan への記載提案（必須）

- **`docs/plan/ds-migration-governance.md` L93**: 「M-C5: 密度モード対応（`data-density`）」
  → **追記**: 「**OB の既定は `<html data-density="compact">` で compact(28px) を固定し、現状見た目を保全する。DS 既定の comfortable(36px) への引き上げは M-F（アクセシビリティ整備・密度モード対応）で横断判断する。**」
- **`docs/plan/ds-migration-plan.md` L249**: 「M-C: 密度モード対応」
  → **同様の訂正追記**。M-F L281「既定 comfortable=36px に揃える是非を要判断」との整合線を明示
- M-C5 IC（Implementation Coder）が phase-log の最後に上記 2 ファイルへの訂正追記を行う

---

## 4. 置換マッピング

### 4.1 CSS 置換表（`docs/mockup/order-book.css`）

| # | 行 | 旧 | 新 | 備考 |
|---|----|----|----|----|
| 1 | L250 | `padding: 4px 6px;` | `padding: var(--space-row) 6px;` | 縦軸のみ密度連動。既定compact時=4px 維持 |
| 2 | L257 | `min-height: 28px;` | `min-height: var(--tbl-row-h);` | 既定compact時=28px 維持 |
| 3 | L275 | `line-height: 28px;` | `line-height: var(--tbl-row-h);` | `.tbl-grid__sticky--0` のテキスト中央揃え基準 |
| 4 | L312 | `font-size: 13px;` | `font-size: var(--fs-density-base);` | `.tbl-grid__date-cell` の本文サイズ。既定compact時=13px 維持 |

> **注意**: L250 の padding は縦軸のみトークン参照に変える。横軸 6px を維持する理由は §3.4 参照（列幅固定のセル内側余白として機能）。

### 4.2 HTML 置換表（`docs/order-book.html`）

| # | 箇所 | 旧 | 新 |
|---|------|----|----|
| 1 | `<html>` タグ | `<html lang="ja">` | `<html lang="ja" data-density="compact">` |

> 既存のタグに `data-density="compact"` 属性を追加するのみ。他の属性（lang 等）は保持。

### 4.3 置換手順（推奨順）

1. **Step 1**: `docs/order-book.html` の `<html>` に `data-density="compact"` を追加
2. **Step 2**: `docs/mockup/order-book.css` L250 を `padding: var(--space-row) 6px;` に変更
3. **Step 3**: `docs/mockup/order-book.css` L257 を `min-height: var(--tbl-row-h);` に変更
4. **Step 4**: `docs/mockup/order-book.css` L275 を `line-height: var(--tbl-row-h);` に変更（`.tbl-grid__sticky--0` 1行定義の一部）
5. **Step 5**: `docs/mockup/order-book.css` L312 を `font-size: var(--fs-density-base);` に変更（`.tbl-grid__date-cell`）
6. **Step 6**: ブラウザで OB 起動 → 見た目が M-C4 完了時と完全一致することを目視確認（既定 compact）
7. **Step 7**: DevTools で `document.documentElement.setAttribute('data-density','comfortable')` → 行高 36px / padding 縦 8px / data-cell font 14px に連動することを確認
8. **Step 8**: 同様に `'spacious'` → 44px / 12px / 15px 連動確認
9. **Step 9**: Governance L93 / plan L249 への訂正追記コミット

---

## 5. テストチェックリスト（18項目）

> 凡例: A=視覚 / B=ブラウザ / D=機能 / E=置換完全性 / G=ガバナンス

### A. 視覚回帰（25点）— 既定 compact での見た目不変

- [ ] **A-1 (5)** `<html data-density="compact">` 状態（既定）で `.tbl-grid__cell` の computed `min-height` が `28px`
- [ ] **A-2 (4)** 同状態で `.tbl-grid__cell` の computed `padding` が `4px 6px`
- [ ] **A-3 (4)** 同状態で `.tbl-grid__sticky--0` の computed `line-height` が `28px`
- [ ] **A-4 (4)** 同状態で `.tbl-grid__date-cell` の computed `font-size` が `13px`
- [ ] **A-5 (4)** 同状態で `.tbl-grid` 全体の computed `font-size` は `12px` 維持（本フェーズで密度連動させない）
- [ ] **A-6 (4)** `.tbl-grid__cell.tbl-grid__header` の `font-size: 11px;` と `.tbl-grid__cell--total` の `font-size: 11px;` が維持（固定値スコープ）

### B. ブラウザ互換（10点）

- [ ] **B-1 (3)** Chrome 最新: `:root[data-density="comfortable"]` 属性セレクタが解決し、computed 値が 36px / 8px / 14px に切替
- [ ] **B-2 (3)** Edge 最新で同上
- [ ] **B-3 (2)** Firefox 最新で同上
- [ ] **B-4 (2)** `var(--tbl-row-h)` が各ブラウザで期待通り解決（DevTools の Computed タブで `min-height: 28px`（compact時） と表示）

### D. 機能（25点）— 密度切替の挙動

- [ ] **D-1 (5)** `data-density="compact"` で行高 28px / 縦 padding 4px / date-cell font 13px が適用
- [ ] **D-2 (5)** `data-density="comfortable"` で行高 36px / 縦 padding 8px / date-cell font 14px が適用
- [ ] **D-3 (5)** `data-density="spacious"` で行高 44px / 縦 padding 12px / date-cell font 15px が適用
- [ ] **D-4 (4)** `data-density` 属性を DevTools で動的に書き換えると、OB の全セルが即座に再レイアウト（ページリロード不要）
- [ ] **D-5 (3)** 固定列（`.tbl-grid__sticky--0`）の line-height が密度に連動し、テキストが縦中央に収まる
- [ ] **D-6 (3)** spacious 時にスクロール挙動が壊れない（sticky 列の left 座標は変化せずホライゾン崩れなし）

### E. 見た目不変（25点）— 案B の核心

- [ ] **E-1 (5)** 既定（compact）で M-C4 完了時のスクリーンショット（OB トップビュー）と pixel diff 差分 < 100px²
- [ ] **E-2 (5)** 同様に月切替後ビュー・合計行ビューでも差分 < 100px²
- [ ] **E-3 (4)** Zebra（偶数行）の背景ずれが発生していない（行高変更なし = zebra パターン変化なし）
- [ ] **E-4 (4)** 合計行の上罫線・背景色の表示位置が変化していない
- [ ] **E-5 (4)** `.tbl-grid__date-cell` 内の `.tbl-grid__cell-count` / `.tbl-grid__cell-subtask` / `.tbl-grid__cell-badge-text` の縦積みレイアウトが崩れない（font-size 13px → 13px で差分ゼロ）
- [ ] **E-6 (3)** `Grep "min-height:\s*28px" docs/mockup/order-book.css` が **L257 を含まず、他箇所に限定**（密度無関係の 20px / 56px 等は残存）

### G. ガバナンス（15点）

- [ ] **G-1 (3)** 案B採用（見た目不変優先・OB既定=compact）の根拠が phase-log に記載されている
- [ ] **G-2 (3)** `<html data-density="compact">` 初期付与の理由（§3.5 Option-X）が phase-log に記載されている
- [ ] **G-3 (2)** Governance L93 に「OB 既定は compact(28px)、comfortable への引き上げは M-F で再判断」と訂正追記されている
- [ ] **G-4 (2)** ds-migration-plan L249 も同様に訂正追記されている
- [ ] **G-5 (2)** `.tbl-grid` 全体の font-size を密度連動**させない**理由（§3.3）が phase-log に記載されている
- [ ] **G-6 (3)** co-tokens.css 側の既定 `--tbl-row-h: 36px` は据え置き（WS/QA/SL への波及回避）の旨と、OB 独自既定で compact を指示する構造が明記されている

---

## 6. 重大Claim（Critical Claims）

次のいずれかが発生した場合、点数に関わらず **合格不可（不合格）**。

| ID | Claim | 検証方法 | 重大度 |
|----|-------|---------|--------|
| **CC-1** | 既定表示（data-density=compact）で行高が 28px 以外になる | `.tbl-grid__cell` の computed `min-height` を DevTools で確認。28px であること | Critical |
| **CC-2** | 既定表示で縦 padding が 4px 以外になる | `.tbl-grid__cell` の computed `padding-top` / `padding-bottom` が各 4px | Critical |
| **CC-3** | `data-density="comfortable"` に切替えても行高・padding・font が変化しない（切替機能不成立） | DevTools で属性変更 → computed が 36px / 8px / 14px に即時切替 | Critical |
| **CC-4** | `co-tokens.css` を改変してしまった（他モックアップに波及） | `git diff docs/mockup/co-tokens.css` が空であること | Critical |
| **CC-5** | `<html data-density="compact">` が HTML に追加されていない | `docs/order-book.html` で `<html` 行に `data-density="compact"` が存在 | Critical |
| **CC-6** | トークン参照化箇所（L250 / L257 / L275 / L312）以外で見た目変化が発生 | Before/After スクショで差分が §5 E-1〜E-2 の 100px² を超える | Critical |
| **CC-7** | 固定列 sticky の left 座標が密度切替で破綻（sticky 列が重なる・ズレる） | spacious モードで `.tbl-grid__sticky--N` の位置を目視確認、重なりなし | High（Warning可） |
| **CC-8** | `.tbl-grid__date-cell` 内の内容が font-size 変化で折返し・はみ出し発生 | spacious(15px) モードで日付セル内容の表示崩れをチェック | High（Warning可） |

**合格条件: 70点以上 AND CC-1〜CC-6 いずれも未発生（CC-7・CC-8 は Warning 扱い可）**

---

## 7. 参考資料

- Tokens: `docs/mockup/co-tokens.css` L172-175（:root 既定）/ L230-246（`:root[data-density]` 3段）
- Governance: `docs/plan/ds-migration-governance.md` L93（M-C5 行、本TDで compact 既定維持の訂正提案）
- 計画: `docs/plan/ds-migration-plan.md` L249（M-C 密度）/ L281（M-F 密度連動）/ L285（WS既定高の判断事項）
- OB CSS: `docs/mockup/order-book.css` L241-246（`.tbl-grid`）, L249-259（`.tbl-grid__cell`）, L275（`.tbl-grid__sticky--0`）, L309-317（`.tbl-grid__date-cell`）
- OB HTML: `docs/order-book.html`（`<html>` タグ）
- 既往: `docs/plan/phase-logs/m-c4-td-v1.md`（M-C4 で BEM 修飾子化完了、本 M-C5 は命名を前提として継承）
