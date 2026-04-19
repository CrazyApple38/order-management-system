# Test Design: M0-4 v1 — 4モックアップCSS body への font-family / palt / tabular-nums 適用

- 作成日: 2026-04-18
- 設計者: Test Designer（TD）
- 対象サブフェーズ: **M0-4** — 4モックアップCSS（`order-book.css` / `weekly-schedule.css` / `quick-access.css` / `screen-layout.css`）の `body { ... }` ブロックに対し、以下3項目を適用：
  1. `font-family` を `var(--font-family-body)` に置換
  2. `font-feature-settings: "palt" 1;` を追記
  3. `font-variant-numeric: tabular-nums;` を追記
- 参照資料:
  - ガバナンス: `docs/plan/ds-migration-governance.md`
  - 移行計画: `docs/plan/ds-migration-plan.md`
  - 新DS正: `docs/ui-components/styles-light.css` / `docs/ui-components/tokens.json`
  - 新DS本文実装参考: `docs/ui-components/styles.css` L149-163（body の font-family / feature / variant 確定実装）
  - M0-1 合格レポート: `docs/plan/phase-logs/m0-1-sc-v1.md`（98/100 合格）
  - M0-2 合格レポート: `docs/plan/phase-logs/m0-2-sc-v1.md`（97/100 合格）
  - M0-3 合格レポート: `docs/plan/phase-logs/m0-3-sc-v1.md`
- 書込対象（本サブフェーズで改変する）:
  - `docs/mockup/order-book.css`（body ブロック 1箇所）
  - `docs/mockup/weekly-schedule.css`（body ブロック 1箇所）
  - `docs/mockup/quick-access.css`（body ブロック 1箇所）
  - `docs/mockup/screen-layout.css`（body ブロック 1箇所）
- **改変禁止**（本サブフェーズでは触らない）:
  - `docs/mockup/co-tokens.css`（M0-1/M0-2 で確定済み）
  - `docs/mockup/co-navbar.css` / `co-shared-badges.css`
  - `docs/ui-components/styles-light.css` / `styles.css` / `tokens.json`
  - 4モックアップHTML（M0-3 で確定済み）
  - 各モックアップCSSの `body { ... }` ブロック**以外の**全セレクタ（`.md-ob-header`, `*`, `.container`, 以下数千行すべて）

---

## 1. 目的

### 1.1 採用方針: **案B**（既存4モックアップCSSの `body { ... }` 1ブロックを直接修正）

**採用根拠**:

1. **確実性（最重要）**: 案A（`co-base.css` 新設）は CSS カスケード順序に依存する。M0-3 の link 順序設計上、`co-tokens.css` → `co-shared-badges.css` / `co-navbar.css` → `<mockup>.css` の順で読み込まれるため、`co-base.css` を `co-tokens.css` 直後に挿入しても、**最後に読まれる `<mockup>.css` の `body { font-family: ... }` が後勝ちで上書きする**。結果、`palt` / `tabular-nums` は適用されるが `font-family` の DS 準拠が失敗する。
2. **最小変更スコープ**: 案B は各モックアップCSSの唯一の `body { ... }` ブロック（事前調査で4ファイル全てに1ブロックずつ存在することを確認済み）内の font-* プロパティのみを改変する。他のセレクタ（`.md-ob-header` / `.container` / `.qa-login-screen` / 3000行超のスタイル定義）は一切触らない。
3. **DS準拠の本質**: M0-4 の目的は「モックアップ全体を DS 準拠のフォント系で統一する」ことであり、モックアップ側の唯一の body font-family 定義を DS 変数参照に置き換えるのは、DS 移行の第一歩として正統。
4. **案A の再評価困難性**: 案A で上書き問題を回避するには `co-base.css` 内で `body { font-family: ... !important; }` を使うか、読み込み順序を `<mockup>.css` の後に移す必要があり、いずれも CSS 設計上の悪手（`!important` はトークン階層を破壊、順序変更はリセットCSSの役割を曖昧にする）。
5. **新DS本文実装との整合**: `docs/ui-components/styles.css` L149-163 では body に `font-family` / `font-feature-settings` / `font-variant-numeric` を同じブロックに宣言している。案B はこの本文実装と同一構造を4モックアップに移植することに相当する。

### 1.2 到達点

- 4モックアップCSS の `body { ... }` ブロック内に以下3行が存在する:
  ```css
  font-family: var(--font-family-body);
  font-feature-settings: "palt" 1;
  font-variant-numeric: tabular-nums;
  ```
- 既存の `font-family: 'Segoe UI', 'Yu Gothic UI', ...` 等のハードコード値は**除去**され、`var(--font-family-body)` への置換に置き換わっている
- 4モックアップを実ブラウザで開いた際に、数字（テーブル・受注番号・金額・時刻など）が**等幅**で表示される
- 和文の文字間がわずかに詰まって見える（`palt` 効果、特にカタカナ・句読点の前後で顕著）
- `body` 以外のセレクタ・プロパティは**一切変更されていない**（git diff で確認）

### 1.3 スコープ外（本サブフェーズでは行わない）

- `body` 以外のセレクタへの font-family 波及（後続 Phase）
- `--text-tertiary / --text-disabled / --warning-text` 値衝突の統一（Phase M0-5）
- カテゴリ4色相分化・影値構造衝突の解消（Phase M-A）
- `co-tokens.css` / `styles-light.css` / `tokens.json` / HTML / その他モックアップCSSブロックの変更
- `font-size` / `line-height` / `color` / `background` 等、`body` ブロック内の**他プロパティ**の変更（例: `order-book.css` L67 `font-size: 13px;` は維持、変更禁止）

---

## 2. 評価項目のウェイト（M0-4 固有の調整）

M0-4は「4CSSの body ブロック内 3プロパティ追加/置換」の狭い変更だが、**DS準拠の根幹である font-family 変数参照の正確性**、および **palt / tabular-nums の欠落防止**が評価の中心となる。指定通り C（タイポグラフィ）を最大ウェイトに置く。

| カテゴリ                                   | 通常配点 | **M0-4 配点** | 理由                                                                                                                                                                  |
|-------------------------------------------|---------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A. DS準拠（変数参照・tokens.json整合）       | 30      | **25**       | `var(--font-family-body)` の変数名・スペル正確性、tokens.json のフォントスタック順序との一致。変数名ミス（`--font-body` 等）は直ちに regression                                  |
| B. カラーコーディネーション                   | 20      | **5**        | 本サブフェーズでは色変更なし。`body { color / background }` 行が**無改変**で維持されていることの確認のみ                                                                       |
| C. タイポグラフィ（font-family/palt/tabular） | 15      | **40**       | **最重要**。3プロパティの存在・値の正確性、ハードコード除去、実ブラウザでの tabular-nums / palt 適用確認                                                                    |
| D. コンポーネント一貫性                      | 15      | **10**       | 4ファイル全てで同一の3行が宣言されている（プロパティ順序・記法も揃っているのが理想）。legacy aliases 経由で解決が機能していること                                                    |
| E. 機能回帰（body 以外 diff ゼロ・見た目不変） | 10      | **15**       | body ブロック**以外**への波及がゼロ、body ブロック内の **font-*以外のプロパティ**も無改変、4モックアップを実ブラウザで開いた際のレイアウト崩れ・コンソールエラーゼロ                      |
| F. アクセシビリティ                          | 5       | **0**        | 本変更範囲は可読性向上方向（数字等幅・和文詰め）で劣化リスクなし。評価対象外                                                                                              |
| G. コード品質・保守性                        | 5       | **5**        | インデント・記法・コメント有無が既存body行と一貫。プロパティ並び順（font-family → font-feature-settings → font-variant-numeric の順が推奨、`styles.css` L151-155 と同順）            |
| **合計**                                  | 100     | **100**      |                                                                                                                                                                     |

### 合計値の根拠

- **C=40**: M0-4 の本質はタイポグラフィ統一。3プロパティ全て正確に入っているか、tabular-nums がテーブルで効いているか、palt が和文で効いているかが最重要
- **A=25**: 変数参照のスペルミス（`--font-family-body` vs `--font-body` 等）は CSS 静的解析では検知されないため、grep による厳密一致確認が必須
- **E=15**: body 以外への波及（誤タイプ・別ブロック改変）は DS 移行の信頼性を根底から損なう。git diff で body ブロック内 3行の変化のみであることを厳密確認
- **D=10**: 4ファイル間の記述一貫性
- **B=5 / G=5**: 色は無改変確認のみ、コード品質は軽微
- **F=0**: 本サブフェーズはA11y評価対象外（別途 Phase で実施）

---

## 3. 事前調査結果：4モックアップCSS `body { ... }` ブロックの現状

TD（本ドキュメント作成者）が実ファイルを読み、以下を確認した（2026-04-18 時点）。

### 3.1 `docs/mockup/order-book.css` L63-72

```css
L63: body {
L64:     font-family: 'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif;
L65:     background: var(--base-page);
L66:     color: var(--text-primary);
L67:     font-size: 13px;
L68:     overflow: hidden;
L69:     height: 100vh;
L70:     display: flex;
L71:     flex-direction: column;
L72: }
```

- 旧 `font-family` 値: `'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif`
- 対象行: **L64**
- 追記位置案（推奨）: L64 を `font-family: var(--font-family-body);` に置換 → L65 に `font-feature-settings: "palt" 1;` 挿入 → L66 に `font-variant-numeric: tabular-nums;` 挿入（背景色以降は2行ずれる）
- 変更後の想定行範囲: L63-74（body ブロック全体が2行増）
- インデント: 4スペース

### 3.2 `docs/mockup/weekly-schedule.css` L173-179

```css
L173: body {
L174:     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif;
L175:     background: var(--base-page);
L176:     color: var(--text-primary);
L177:     font-size: 13px;
L178:     line-height: 1.4;
L179: }
```

- 旧 `font-family` 値: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif`
- 対象行: **L174**
- 追記位置案（推奨）: L174 を `font-family: var(--font-family-body);` に置換 → L175 に `font-feature-settings: "palt" 1;` 挿入 → L176 に `font-variant-numeric: tabular-nums;` 挿入
- 変更後の想定行範囲: L173-181（2行増）
- インデント: 4スペース
- **注**: 4ファイル中唯一、旧値に `'Noto Sans JP'` が含まれる。新DS変数値にも含まれるため、機能的には差分最小

### 3.3 `docs/mockup/quick-access.css` L45-52

```css
L45: body {
L46:     font-family: 'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif;
L47:     background: var(--base-page);
L48:     color: var(--text-primary);
L49:     font-size: 14px;
L50:     min-height: 100vh;
L51:     min-height: 100dvh;
L52: }
```

- 旧 `font-family` 値: `'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif`（OB と同一）
- 対象行: **L46**
- 追記位置案（推奨）: L46 を置換 → L47 に palt、L48 に tabular-nums 挿入
- 変更後の想定行範囲: L45-54（2行増）
- インデント: 4スペース
- **注**: `min-height: 100dvh;` は dvh ブラウザフォールバックで、L51 の重複宣言は意図的。この行は無改変で維持すること

### 3.4 `docs/mockup/screen-layout.css` L160-167

```css
L160: body {
L161:     font-family: 'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif;
L162:     background: var(--base-page);
L163:     min-height: 100vh;
L164:     margin: 0;
L165:     padding: 0;
L166:     color: var(--text-primary);
L167: }
```

- 旧 `font-family` 値: `'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif`（OB/QA と同一）
- 対象行: **L161**
- 追記位置案（推奨）: L161 を置換 → L162 に palt、L163 に tabular-nums 挿入
- 変更後の想定行範囲: L160-169（2行増）
- インデント: 4スペース
- **注**: L164 `margin: 0;` / L165 `padding: 0;` は `*` リセット後の body 個別宣言（冗長だが既存仕様）。無改変で維持

### 3.5 4ファイル横断観察

| 項目 | OB | WS | QA | SL |
|------|-----|-----|-----|-----|
| body 開始行 | L63 | L173 | L45 | L160 |
| 旧 font-family 行 | L64 | L174 | L46 | L161 |
| 旧 font-family 値 | A | B | A | A |
| インデント | 4sp | 4sp | 4sp | 4sp |
| font-feature-settings 既存 | ❌無し | ❌無し | ❌無し | ❌無し |
| font-variant-numeric 既存 | ❌無し | ❌無し | ❌無し | ❌無し |

- 旧値 A: `'Segoe UI', 'Yu Gothic UI', 'Meiryo', sans-serif`
- 旧値 B: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif`

**tokens.json / co-tokens.css の `--font-family-body` 値（参考）**:
```
'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Segoe UI', Roboto, sans-serif
```

旧値 A（OB/QA/SL）は `'Segoe UI'` を最優先としており Mac/Linux で劣る。旧値 B（WS）は `-apple-system` と `'Noto Sans JP'` を含むため新DS値に近い。**4ファイル全てが `var(--font-family-body)` 参照に置換されることで、フォント解決の統一と Inter/Noto Sans JP 優先が成立する**。

### 3.6 TD としての観察・IM への指針

- **プロパティ並び順の推奨**: `docs/ui-components/styles.css` L151-155 と同順（`font-family` → `font-feature-settings` → `font-variant-numeric`）で 3プロパティを連続配置する。既存 `background` / `color` / `font-size` 等の行はそのまま後続に残す
- **書き方の推奨**: 値のクォートはダブル（`"palt" 1`）で統一。シングルクォート（`'palt' 1`）でも機能するが、styles.css との字面一致を優先
- **コメント**: 不要。`styles.css` L150 `/* Phase D1.2: 和文フォント指定 */` のようなコメントを入れても可だが、M0-4 の最小変更原則に従い**コメント無し**を推奨
- **改行・空行**: `body {` の直後に3プロパティを連続して配置、その後は既存の行をそのまま（空行を挟まない）
- **行数増加**: 4ファイル全てで +2 行（`font-family` は置換なので増えない、`font-feature-settings` と `font-variant-numeric` の2行が純増）

### 3.7 想定される IM 実装後の状態（例: order-book.css）

```css
L63: body {
L64:     font-family: var(--font-family-body);
L65:     font-feature-settings: "palt" 1;
L66:     font-variant-numeric: tabular-nums;
L67:     background: var(--base-page);
L68:     color: var(--text-primary);
L69:     font-size: 13px;
L70:     overflow: hidden;
L71:     height: 100vh;
L72:     display: flex;
L73:     flex-direction: column;
L74: }
```

---

## 4. テストチェックリスト（Test Executor 実施）

### A. DS準拠（変数参照・tokens.json整合） — 25点

**A-1** 4モックアップCSS全ての `body { ... }` ブロック内に `font-family: var(--font-family-body);` が存在するか。
- 検証: `Grep pattern="font-family:\s*var\(--font-family-body\)" path="docs/mockup/" glob="*.css" output_mode="content" -n=true`
- 期待: 4件ヒット（OB/WS/QA/SL 各1件）。行番号はおおよそ OB=L64, WS=L174, QA=L46, SL=L161
- 配点: 8点

**A-2** 変数名が `--font-family-body` で正確か（タイポ検知）。`--font-body` / `--fontfamily-body` / `--font-family-base` 等の誤記がないこと。
- 検証: `Grep pattern="--font-(?!family-body|family-mono)" path="docs/mockup/order-book.css docs/mockup/weekly-schedule.css docs/mockup/quick-access.css docs/mockup/screen-layout.css" output_mode="content" -n=true`
- 期待: ヒットゼロ（`--font-family-body` と `--font-family-mono` 以外の `--font-*` 変数参照が新規追加されていない）
- 配点: 5点

**A-3** co-tokens.css に `--font-family-body` 変数が定義されていることを確認（既存定義の存在確認）。
- 検証: `Grep pattern="--font-family-body:" path="docs/mockup/co-tokens.css" output_mode="content" -n=true`
- 期待: 1件ヒット（L81付近）、値が `'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Segoe UI', Roboto, sans-serif`
- 配点: 3点

**A-4** co-tokens.css の `--font-family-body` 値が tokens.json の `typography.font-family.body.value` と完全一致するか。
- 検証: 両ファイルの該当行を Read し、スタック順序・クォート・カンマ・スペースまで文字列一致を確認
- 期待: 完全一致（M0-1 で合格済みのため通常は保持されている）
- 配点: 4点

**A-5** 旧ハードコードの `font-family` 値（`'Segoe UI', 'Yu Gothic UI', 'Meiryo'` / `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP'`）が4モックアップCSSの **body ブロック内から完全に除去**されているか。
- 検証: `Grep pattern="font-family:\s*'Segoe UI'" path="docs/mockup/" glob="*.css"` および `Grep pattern="font-family:\s*-apple-system" path="docs/mockup/" glob="*.css"`
- 期待: `body { ... }` ブロック内ではヒットゼロ（body 以外のセレクタ、例えば `.some-class { font-family: 'Segoe UI', ... }` がもし存在すればそれは許容）
- 配点: 5点

### B. カラーコーディネーション — 5点

**B-1** 各モックアップCSSの `body { ... }` ブロック内の `background` / `color` プロパティ値が無改変か。
- 検証: 4ファイルの body ブロックを Read し、以下を確認：
  - OB L65/L66 → 新 L67/L68: `background: var(--base-page);` / `color: var(--text-primary);`
  - WS L175/L176 → 新 L177/L178: 同上
  - QA L47/L48 → 新 L49/L50: 同上
  - SL L162/L166 → 新 L164/L168: `background: var(--base-page);` / `color: var(--text-primary);`
- 期待: 4ファイル全てで値・記法とも完全一致（行番号のみ2行ずれる）
- 配点: 5点

### C. タイポグラフィ（font-family / palt / tabular-nums） — 40点【最重要】

**C-1** 4モックアップCSS全ての `body { ... }` ブロック内に `font-feature-settings: "palt" 1;` が存在するか。
- 検証: `Grep pattern="font-feature-settings:\s*\"palt\"\s*1" path="docs/mockup/" glob="*.css" output_mode="content" -n=true`
- 期待: 4件ヒット（OB/WS/QA/SL 各1件）
- 配点: 12点

**C-2** 4モックアップCSS全ての `body { ... }` ブロック内に `font-variant-numeric: tabular-nums;` が存在するか。
- 検証: `Grep pattern="font-variant-numeric:\s*tabular-nums" path="docs/mockup/" glob="*.css" output_mode="content" -n=true`
- 期待: 4件ヒット
- 配点: 12点

**C-3** 各モックアップCSSで、**3プロパティが同一の `body { ... }` ブロック内に存在**するか（別セレクタに散逸していない）。
- 検証: 4ファイルの body ブロックを Read し、`font-family` / `font-feature-settings` / `font-variant-numeric` が3行連続（または少なくとも同ブロック内）にあることを目視確認
- 期待: 4ファイル全てで3プロパティが `body { ... }` の同一ブロック内に存在
- 配点: 4点

**C-4** プロパティ並び順が `font-family` → `font-feature-settings` → `font-variant-numeric` の順になっているか（推奨、styles.css L151-155 と一致）。
- 検証: 4ファイルの body ブロックを Read し順序確認
- 期待: 4ファイル全てでこの順。順序が異なっても機能は同じだが、一貫性の観点で減点対象
- 配点: 2点

**C-5** 各モックアップCSSで、body ブロック内の `font-size` / `line-height` / `height` / `overflow` / `min-height` / `display` / `flex-direction` / `margin` / `padding` 等の**既存プロパティが全て無改変**か。
- 検証: 4ファイルの body ブロックを Read し、事前調査（§3.1-3.4）に記載の全プロパティ値を突合
  - OB: `font-size: 13px;` / `overflow: hidden;` / `height: 100vh;` / `display: flex;` / `flex-direction: column;` 維持
  - WS: `font-size: 13px;` / `line-height: 1.4;` 維持
  - QA: `font-size: 14px;` / `min-height: 100vh;` / `min-height: 100dvh;` 維持（重複宣言も維持）
  - SL: `min-height: 100vh;` / `margin: 0;` / `padding: 0;` 維持
- 期待: 4ファイル全ての既存プロパティが1行も変更・削除されていない
- 配点: 4点

**C-6** 実ブラウザで4モックアップを開き、数字（テーブル行番号・金額・時刻・受注番号等）が tabular-nums により**等幅**で表示されるか。
- 検証: Playwright で各HTMLを開き、数字を含む要素の screenshot を撮影、目視で等幅確認。または `getComputedStyle(document.body).fontVariantNumeric === 'tabular-nums'` を評価
- 期待: 4ファイル全てで tabular-nums が適用されている
- 配点: 3点（実ブラウザ検証が困難な場合は C-2 のgrep結果で代替可）

**C-7** 実ブラウザで4モックアップを開き、和文の文字間が `palt` により詰まって表示されるか（特にカタカナ・句読点前後）。
- 検証: Playwright で各HTMLを開き、`getComputedStyle(document.body).fontFeatureSettings === '"palt" 1'` を評価
- 期待: 4ファイル全てで palt が適用されている
- 配点: 3点（実ブラウザ検証が困難な場合は C-1 のgrep結果で代替可）

### D. コンポーネント一貫性 — 10点

**D-1** 4ファイル間で、追加された3プロパティの**記法（クォート種別・スペース・大文字小文字）が完全一致**するか。
- 検証: 4ファイルの body ブロックから該当3行を抽出し文字列比較
- 期待: 4ファイルで3行とも完全同一文字列（インデントを除く）
- 配点: 4点

**D-2** 実ブラウザで `getComputedStyle(document.body).fontFamily` を評価した際、co-tokens.css の `--font-family-body` が解決されて `'Inter', -apple-system, ...` の展開値になっているか。
- 検証: Playwright または DevTools で4HTMLの body computed style を確認
- 期待: 4ファイル全てで `Inter` が先頭に来る展開済みフォントスタックが返る
- 配点: 4点（実ブラウザ検証困難時は A-1 で代替可）

**D-3** legacy aliases 経由での変数解決に失敗（`font-family: ;` 空値展開）がないこと。
- 検証: Playwright で各HTMLを開き、DevTools Console にCSSパースエラー・`invalid property value` 警告がゼロ
- 期待: 4ファイル全てでエラー・警告ゼロ
- 配点: 2点

### E. 機能回帰（body 以外 diff ゼロ・見た目不変） — 15点

**E-1** git diff により、4モックアップCSSの変更が**各ファイルの body ブロック内のみ**であること。
- 検証: `git diff docs/mockup/order-book.css docs/mockup/weekly-schedule.css docs/mockup/quick-access.css docs/mockup/screen-layout.css` を確認
- 期待:
  - 各ファイルで `body { ... }` ブロック内のみの変更
  - `-` 行: 各ファイル1行（旧 font-family 行）
  - `+` 行: 各ファイル3行（新 font-family + palt + tabular-nums）
  - 合計: -4行 / +12行（ネット +8行）
- 配点: 5点

**E-2** 4モックアップCSSの**body ブロック以外のセレクタ**（`.md-ob-header`, `.md-ws-container`, `.qa-login-screen`, `.container`, `*`, `:root` 等、数百〜数千行）が1行も変更されていないこと。
- 検証: git diff で body ブロック外の変更がゼロ
- 期待: body ブロック外の diff がゼロ
- 配点: 5点

**E-3** 4モックアップを実ブラウザで開き、レイアウト崩れ・コンソールエラーゼロ。M0-3 時点からの見た目変化は「フォント解決がDS統一系になる」「数字等幅化」「和文詰め」の3点に限定され、レイアウトシフト・色変化・配置ずれが発生していない。
- 検証: Playwright で M0-3 時点のスクリーンショット（M0-3 合格時点に撮影されていれば）と M0-4 実装後を比較、または目視確認
- 期待: レイアウト・配色・ボタン配置・テーブル列幅等に構造的変化なし
- 配点: 5点

### G. コード品質・保守性 — 5点

**G-1** 追加された3プロパティのインデントが既存 body ブロック行と一致（4スペース）。
- 検証: 4ファイルの body ブロックを Read しインデント確認
- 期待: 4ファイル全てで4スペース、タブ混入なし
- 配点: 2点

**G-2** 追加された3プロパティにセミコロン終端があるか（`;` 忘れによるCSS解釈エラー防止）。
- 検証: grep で各プロパティ末尾の `;` 確認
- 期待: 3プロパティ × 4ファイル = 12行全てセミコロン終端
- 配点: 2点

**G-3** 4ファイルで追加3行の記述スタイルが一貫（コメント有無・空行挿入有無）。
- 検証: 4ファイルの body ブロック先頭3行を横断比較
- 期待: 4ファイル同一スタイル（コメント無し推奨・空行無し推奨）
- 配点: 1点

---

## 5. 重大Claim（Blocker — 1件でも該当すれば不合格）

以下のいずれか1件でも該当した場合、総得点にかかわらず**不合格**とする。

**CR-1** `var(--font-family-body)` の**変数名ミス**（`--font-body`, `--fontfamily-body`, `--font-family-base`, `--font-family`, `--fontfamilybody` 等）が1ファイルでも存在する
- 影響: CSS変数が未定義扱いとなり、`font-family` が空値展開され、ブラウザデフォルトフォント（Times等）にフォールバック。DS準拠が全く成立しない
- 検知: A-1（hit数が4未満）または A-2（未知の `--font-*` 参照検出）

**CR-2** `font-feature-settings: "palt" 1;` が1ファイルでも**欠落**している
- 影響: 和文詰めが効かず、4モックアップ間でタイポグラフィ統一が破綻
- 検知: C-1（hit数が4未満）

**CR-3** `font-variant-numeric: tabular-nums;` が1ファイルでも**欠落**している
- 影響: テーブル数字の等幅化が効かず、金額・時刻・受注番号列の桁ずれ視認性が劣化
- 検知: C-2（hit数が4未満）

**CR-4** 4モックアップCSSの**body ブロック以外**に1行でも変更が波及している（IM の誤操作による意図しない改変）
- 影響: M0-4 スコープ逸脱、他セレクタへの影響が予測不能となり回帰テスト範囲が爆発
- 検知: E-2（body 外 diff 非ゼロ）

**CR-5** body ブロック内の **font-* 以外の既存プロパティ**（`background` / `color` / `font-size` / `line-height` / `height` / `overflow` / `min-height` / `display` / `flex-direction` / `margin` / `padding`）が1行でも変更・削除されている
- 影響: 本サブフェーズのスコープ逸脱、見た目変化リスク
- 検知: B-1, C-5, E-1

**CR-6** 旧ハードコード `font-family` 値（`'Segoe UI', 'Yu Gothic UI', 'Meiryo'` または `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP'`）が 4モックアップCSSの body ブロック内に**残留**している（置換忘れ、または3行追加の上に旧行も残っている）
- 影響: font-family 宣言重複、後勝ち優先で新DS値が上書きされる可能性
- 検知: A-5

**CR-7** co-tokens.css の `--font-family-body` 値が tokens.json の正本値と不一致
- 影響: DS単一正の原則が破綻。M0-1 合格条件の退行
- 検知: A-4

**CR-8** 4HTMLを実ブラウザで開いた際にCSSパースエラー・未定義変数エラーがDevTools Consoleに出力される
- 影響: CSS 部分的失効、レイアウト崩れリスク
- 検知: D-3

---

## 6. 合格条件

- **総得点: 70点以上 / 100点**（A=25 / B=5 / C=40 / D=10 / E=15 / G=5）
- **かつ 重大Claim（CR-1〜CR-8）: 0件**

いずれか欠けた場合は不合格、IM差戻し。差戻し時は TD が検出された重大Claim全てを再現手順付きで列挙し、IM が再実装→再評価サイクル。

---

## 7. Test Executor への申し送り事項

1. **C-6 / C-7 の実ブラウザ検証は推奨だが必須ではない**。Playwright 環境が整わない場合は grep（C-1 / C-2）結果とプロパティ記法一致（D-1）で代替評価可。ただし E-3（レイアウト崩れ確認）は可能な限り Playwright で実施し、最低1モックアップ（推奨: order-book.html — テーブル数字が多く tabular-nums 効果が顕著）のスクリーンショットを添付すること
2. **Grep コマンドは必ず glob フィルタで `*.css` に絞る**。`docs/ui-components/styles.css` や `preview.html` 等がヒットすると誤検知になる。`path="docs/mockup/"` の明示を推奨
3. **事前調査（§3）の行番号は M0-3 完了時点の値**。IM が変更を加えた後は body ブロックの行番号が2行ずつ後ろにずれる。Test Executor は実装後の実ファイルを Read し直して行番号を確認すること
4. **CR-4 / CR-5 の検知は git diff が最強**。`git diff --stat docs/mockup/*.css` でファイル別変更行数を確認し、各ファイル 4行（- 1行 / + 3行）に収まっていれば高確度で範囲内。変更行数が多い場合は詳細 diff で要精査
5. **body 以外の箇所で font-family ハードコード値が残っていても本サブフェーズでは減点しない**（スコープ外）。例: `.some-class { font-family: 'Segoe UI'; }` のようなセレクタは M0-4 では対象外、後続 Phase で処理する
6. **採用方針が案Bであることは本TDで確定済み**。IM が案Aを採用した痕跡（`co-base.css` の新規作成、4HTMLへの `<link>` 追加）がある場合は重大Claim扱いで即不合格とすること

---

以上。
