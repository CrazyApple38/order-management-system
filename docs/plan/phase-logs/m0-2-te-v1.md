# Test Execution: M0-2 v1 — TE レポート

- 実施日: 2026-04-20
- 実施者: Test Executor（TE）
- 対象サブフェーズ: M0-2 — 旧→新 変数エイリアス定義
- 検証対象: `docs/mockup/co-tokens.css`
- 参照テスト項目書: `docs/plan/phase-logs/m0-2-td-v1.md`

---

## 事前確認（モックアップ/HTML 無改変チェック）

| コマンド | 結果 | 判定 |
|---------|------|------|
| `git diff docs/mockup/order-book.css docs/mockup/weekly-schedule.css docs/mockup/quick-access.css docs/mockup/screen-layout.css` | 出力なし（差分ゼロ） | Pass |
| `git diff docs/order-book.html docs/weekly-schedule.html docs/quick-access.html docs/screen-layout.html` | 出力なし（差分ゼロ） | Pass |
| `git status --porcelain` | `?? docs/mockup/co-tokens.css`（新規未追跡）／他はプラン関連のみ | Pass |
| `git log --oneline -1 docs/mockup/co-tokens.css` | ログなし（未コミット／新規ファイル） | Pass — M0-1 で作成された新規ファイルに M0-2 変更を追記した状態 |

---

## A. DS準拠（エイリアス定義の正確さ） — 35点

### A-1 ✅ Pass
co-tokens.css L177-192 に `/* ============ legacy aliases (deprecated) ============ */` のブロックコメント有。`legacy` `deprecated` `Phase M0-2` `@deprecated` 全て明示。

### A-2 ✅ Pass（17種の必須エイリアス + 3種 = 計20種すべて定義）
grep 実測で 20/20 定義確認：
- L195 `--base-page: var(--bg-page);`
- L196 `--base-surface: var(--bg-surface);`
- L197 `--base-surface-alt: var(--bg-surface-2);`
- L198 `--base-muted: var(--bg-surface-3);`
- L201 `--sub-primary: var(--bg-sidebar);`
- L202 `--sub-secondary: var(--divider);`
- L205 `--accent: var(--accent-primary);`
- L206 `--accent-light: var(--accent-primary-light);`
- L207 `--accent-dim: var(--accent-primary-dim);`
- L210 `--error: var(--semantic-error);`
- L211 `--success: var(--semantic-success);`
- L212 `--success-text: var(--semantic-success-text);`
- L213 `--warning: var(--semantic-warning);`
- L214 `--warning-text: var(--semantic-warning-text);`
- L215 `--warning-bg: var(--semantic-warning-bg);`
- L218 `--shadow-sm: var(--elevation-1);`
- L219 `--shadow-md: var(--elevation-3);`
- L220 `--shadow-lg: var(--elevation-4);`
- L221 `--shadow-medium: var(--elevation-3);`
- L222 `--shadow-strong: var(--elevation-5);`

### A-3 ✅ Pass
全20エイリアスの右辺が `var(--xxx)` 形式。値直書きはゼロ（grep で `--(base|sub|accent|error|success|warning|shadow)[^:]*:\s+#` を検索 → 0件）。

### A-4 ✅ Pass
legacy aliases セクションは `:root { ... }` ブロック末尾（L177-222）で、`}` 終端（L223）、density overrides（L225-）より前に配置。

### A-5 ✅ Pass — 未定義参照なし
legacy aliases の右辺で参照される新DS変数はすべて L18-175 の :root 本体に定義済み：
- `--bg-page / --bg-surface / --bg-surface-2 / --bg-surface-3` → L21-24 定義
- `--bg-sidebar / --divider` → L25-26 定義
- `--accent-primary / --accent-primary-light / --accent-primary-dim` → L35-37 定義
- `--semantic-success / -text / --semantic-warning / -text / -bg / --semantic-error` → L43-48 定義
- `--elevation-1 / -3 / -4 / -5` → L123-127 定義

### A-6 ✅ Pass — 循環参照なし
`--bg-page` 等の新DS変数は固定値（`#E9F1F6` 等）定義で、旧エイリアスを参照していない。単方向（旧 → 新）のみ。

### A-7 ✅ Pass
M0-1 時点で下半分にあった後方互換エイリアス（`--accent: var(--accent-primary)` 等）はすべて legacy aliases セクション内に統合されている。別セクションに分離なし。

### A-8 ✅ Pass
legacy aliases セクション内（L194-222）で新DS変数の再定義なし。grep で `--bg-page:|--bg-surface:|--elevation-1:` 等を検索 → legacy section 内に再定義は存在しない。

---

## B. カラーコーディネーション（値照合） — 20点

### B-1 ✅ Pass — 全 14 項目で新DS解決値一致
| エイリアス | 解決経路 | 実効値 | 期待値 | 判定 |
|-----------|---------|-------|-------|------|
| `--base-page` | → `--bg-page` (L21) | `#E9F1F6` | `#E9F1F6` | ✅ |
| `--base-surface` | → `--bg-surface` (L22) | `#FFFFFF` | `#FFFFFF` | ✅ |
| `--base-surface-alt` | → `--bg-surface-2` (L23) | `#F0EDE9` | `#F0EDE9` | ✅ |
| `--base-muted` | → `--bg-surface-3` (L24) | `#D3D0C8` | `#D3D0C8` | ✅ |
| `--sub-primary` | → `--bg-sidebar` (L25) | `#004554` | `#004554` | ✅ |
| `--sub-secondary` | → `--divider` (L26) | `#B2D5E2` | `#B2D5E2` | ✅ |
| `--accent-light` | → `--accent-primary-light` (L36) | `#5AB8C6` | `#5AB8C6` | ✅ |
| `--accent-dim` | → `--accent-primary-dim` (L37) | `rgba(68, 166, 181, 0.12)` | 同 | ✅ |
| `--error` | → `--semantic-error` (L48) | `#DB577B` | `#DB577B` | ✅ |
| `--success` | → `--semantic-success` (L43) | `#38A169` | `#38A169` | ✅ |
| `--success-text` | → `--semantic-success-text` (L44) | `#276749` | `#276749` | ✅ |
| `--warning` | → `--semantic-warning` (L45) | `#D69E2E` | `#D69E2E` | ✅ |
| `--warning-text` | → `--semantic-warning-text` (L46) | `#92400e` | `#92400e` | ✅ |
| `--warning-bg` | → `--semantic-warning-bg` (L47) | `rgba(214, 158, 46, 0.1)` | 同 | ✅ |

### B-2 ✅ Pass — 5 shadow エイリアスが有効 box-shadow 値に解決
| エイリアス | 解決経路 | 実効値 | 期待値 | 判定 |
|-----------|---------|-------|-------|------|
| `--shadow-sm` | → `--elevation-1` (L123) | `0 1px 2px rgba(0, 69, 84, 0.06)` | 同 | ✅ |
| `--shadow-md` | → `--elevation-3` (L125) | `0 4px 12px rgba(0, 69, 84, 0.10)` | 同 | ✅ |
| `--shadow-lg` | → `--elevation-4` (L126) | `0 8px 24px rgba(0, 69, 84, 0.14)` | 同 | ✅ |
| `--shadow-medium` | → `--elevation-3` (L125) | `0 4px 12px rgba(0, 69, 84, 0.10)` | 同 | ✅ |
| `--shadow-strong` | → `--elevation-5` (L127) | `0 16px 48px rgba(0, 69, 84, 0.18)` | 同 | ✅ |

`none` や空文字への解決なし。全て有効な box-shadow 3-part 値。

### B-3 ✅ Pass
全エイリアスが Coastal Palette 内の新DS変数（`--bg-* / --accent-* / --semantic-* / --elevation-*`）を参照。Palette 外色の混入なし。

### B-4 ⚠ Warning
`--warning-text` の値衝突（co-tokens.css側 `#92400e` vs モックアップ :root 側 `#975A16`）について、co-tokens.css の legacy aliases コメント（L184-187）に「モックアップ :root 内で同名定義がある場合は、モックアップ側の定義が後勝ちで上書きする」という**一般原則**の記述はある。ただし `--warning-text` 個別の値衝突（M0-5 で解決予定）への具体的言及は**なし**。TD 3.1 表（L88）の「Phase M-A 以降で統一」方針には沿うが、利用者の誤解防止のためインラインコメント（例: `--warning-text: var(--semantic-warning-text); /* 値衝突: モックアップ :root の旧 #975A16 は後勝ちで有効。M0-5 で統一 */`）があると望ましい。機能的には Pass、保守性観点で Warning。

---

## D. コンポーネント一貫性 — 10点

### D-1 ✅ Pass
`--base-page` → `var(--bg-page)` → `#E9F1F6` = `rgb(233, 241, 246)`（手計算照合）。L21 で `--bg-page: #E9F1F6;` 定義確認済。

### D-2 ✅ Pass
`--shadow-medium` → `var(--elevation-3)` → `0 4px 12px rgba(0, 69, 84, 0.10)`（L125）。新DS影レシピに一致。ただし weekly-schedule.css L62 / screen-layout.css L61 で `--shadow-medium: rgba(0, 69, 84, 0.12)` と**後勝ち上書き**される（M0-3 でリンク後のふるまい）。co-tokens.css 側は単独では新DS値に解決される。M-A で統合予定。

### D-3 ✅ Pass
カテゴリ色の衝突（co-tokens.css L51-58 の4色相分化 vs WS/SL :root の teal 同色）についての記述は、legacy aliases セクションコメントの L184-187 に「モックアップ側の定義が後勝ちで上書きする」という一般原則として明示。TD 3.2 / 3.4 表の「M-A で統一」方針に沿う。カテゴリ色そのものはエイリアス対象外（`--cat-bg-*` はエイリアスされていない）。

---

## E. 機能回帰 — 20点

### E-1 ✅ Pass
`git diff docs/mockup/order-book.css docs/mockup/weekly-schedule.css docs/mockup/quick-access.css docs/mockup/screen-layout.css` → 出力ゼロ。4モックアップCSS無改変を確認。

### E-2 ✅ Pass
`git status` でモックアップCSS（co-navbar.css / co-shared-badges.css 等）に変更なし。co-tokens.css のみ新規追加。

### E-3 ✅ Pass
`git diff docs/order-book.html docs/weekly-schedule.html docs/quick-access.html docs/screen-layout.html` → 出力ゼロ。HTML無改変を確認。

### E-4 ✅ Pass
co-tokens.css は未追跡ファイル（git log なし）。TDが参照する「M0-1 で確定した L1〜L199」は本M0-2実装に含まれたまま。L1-175 の既存トークン定義セクション（color.base / text / accent / semantic / category / chart / typography / spacing / radius / elevation / motion / breakpoint / icon-size / z-index / modal-width / density）はすべて保持。legacy aliases セクション（L177-222）は `:root` 終了 `}` より前、density overrides より前に**追加のみ**。

### E-5 ✅ Pass
legacy aliases セクションは `:root { ... }` 内部の末尾（L177-222、`}` が L223）、`:root[data-density="..."]` オーバーライド（L230-246）より前に配置。L184-187 で「モックアップ :root 内で同名定義がある場合は、モックアップ側の定義が後勝ちで上書きする。co-tokens.css のみ読み込んだ状態では新DS値に解決される」と配置意図を明示。

### E-6 ✅ Pass — CSS syntax validity
co-tokens.css の構造チェック：
- `:root { ... }` 1件（L18 open / L223 close）、バランス取れている
- `:root[data-density=...]` 3件（compact / comfortable / spacious）それぞれ open/close 整合
- コメント `/* ... */` 未閉じなし（grep で `/*` と `*/` の対応を確認）
- 全CSS宣言 `--name: value;` 形式でセミコロン終端
- 行数 246（M0-1 時点から約 +47 行）

---

## G. コード品質・保守性 — 15点

### G-1 ✅ Pass
L179-180 に `Phase M0-2 — 段階移行期間限定の旧→新エイリアス` / `@deprecated — Phase M-G（旧クラス撤去）で削除予定` と明記。

### G-2 ✅ Pass
セクションコメントに `Phase M0-2` と `@deprecated` 両方付与。shadow サブグループにも `(Phase D1.5)` ラベル（L217）あり。M0-1 SC の指摘「Phase ラベルの統一付与」方針に沿う。

### G-3 ✅ Pass
`/* base */` `/* sub */` `/* accent */` `/* semantic */` `/* shadow → elevation (Phase D1.5) */` の5小見出しで用途グループ分け（L194 / L200 / L204 / L209 / L217）。視覚的に走査しやすい。

### G-4 ✅ Pass
右辺の `var(--bg-page)` 等が自己説明的で、新DS対応先が一目瞭然。co-tokens.css の他セクション（color.base / typography 等）のコメントスタイル（小見出しのみ、各変数にインラインコメントは D6.1 等特別な場合のみ）と整合。

### G-5 ✅ Pass
L188-191 に「非対象: `--base-grid*` (OB固有) / `--cell-base-*` (WS固有) / `--shift-bg-*` (WS/SL固有) / `--md-gc-bg-*` (WS/SL固有) / `--shadow-color` の単色rgba版 (WS/SL固有、新DS elevation と値構造が異なるため本エイリアスでは扱わない。Phase M-A で再設計)」と明示。

### G-6 ✅ Pass
legacy aliases セクション内の20エイリアスに重複なし。co-tokens.css 全体でも `:root` 本体内に重複なし。density overrides の `--tbl-row-h / --space-row / --fs-density-base` は異なる `:root[data-density=...]` セレクタに属するので重複ではない。

### G-7 ✅ Pass
2スペースインデント統一。`:root` 内の全宣言は先頭2スペース、ブロックコメント内部も2+3スペース（アスタリスクなし）。

### G-8 ✅ Pass
TODO / FIXME コメントなし（grep で0件）。Phase ラベルのみで管理。

### G-9 ✅ Pass
M0-1 SCレポート引き継ぎ事項「本ファイル末尾に `/* ----- legacy aliases (deprecated) ----- */` セクションを追加し、廃止予定マーカー併記」がそのまま実装（L177-192）。TD 8節の参考実装例（`/* ============` 形式）にも準拠。

### G-10 ⚠ Warning
セクション見出しフォーマットの整合性：
- M0-1 既存セクション: `/* ----- color.base ----- */`（5ダッシュ囲み、1行）
- M0-2 追加セクション: `/* ============================================================` ... `============================================================ */`（等号囲み、複数行ブロック）

TD L177 の参考実装例は `/* ============` 形式を指定しており、legacy aliases が他と比べて情報量が多い（@deprecated / 用途 / 注意 / 非対象）ため複数行ブロックが妥当。**TDの指定通り**だが、M0-1 既存の 5ダッシュ形式と**見た目の一貫性は厳密には取れていない**。機能・可読性ともに問題なく、TD指示準拠のため Pass 寄りだが表記バリエーションの差を Warning として記録。

---

## H. その他（grep / 全体整合）

### H-1 ✅ Pass
`--shadow-sm / -md / -lg` の使用状況 grep：
- `docs/mockup/*.css` → weekly-schedule.css / screen-layout.css で `--shadow-medium / --shadow-strong` 定義・参照あり
- `docs/ui-components/styles-light.css` L27-31 に `--shadow-sm / -md / -lg / -medium / -strong` エイリアス定義、本文で `box-shadow: var(--shadow-md/-lg/-medium/-strong)` を多数使用（L511 / L1267 / L2535 / L3127 等）
- `docs/ui-components/CHANGELOG.md` / `index-light.html` / `preview.html` でも言及

→ 共有CSS・モックアップCSS本文で参照されており、5つの shadow エイリアスはすべて**実装妥当**。過剰実装なし。

### H-2 ✅ Pass
co-tokens.css 行数 = 246 行。M0-1 時点の推定 199 行 + legacy aliases +47 行（コメント含む、エイリアス20個）。TD 想定（+30〜+60 行）内。過剰増加なし。

### H-3 ✅ Pass
`styles-light.css` の grep で `legacy` 0件。`--base-page / --sub-primary / --shadow-medium` の新規 legacy alias 追加なし（既存の `--shadow-*` エイリアスは M0-1 以前から存在）。
`tokens.json` の grep で `--base-page / --sub-primary / --shadow-sm / legacy / deprecated` すべて 0件。legacy aliases は co-tokens.css 専用で正しい。

---

## 6. 重大Claim 判定

| Claim | 内容 | 該当 |
|-------|------|------|
| C-1 | モックアップCSS改変 | ❌なし |
| C-2 | co-tokens.css 既存コンテンツ改変 | ❌なし |
| C-3 | エイリアス右辺取り違え | ❌なし |
| C-4 | エイリアス値直書き | ❌なし |
| C-5 | 循環参照 | ❌なし |
| C-6 | 未定義変数参照 | ❌なし |
| C-7 | CSS シンタックスエラー | ❌なし |
| C-8 | HTML / styles-light.css / tokens.json への誤追加 | ❌なし |
| C-9 | Coastal Palette 外の色・絵文字混入 | ❌なし |

重大Claim: **0件**

---

## 集計

- A（DS準拠 35点）: A-1〜A-8 すべて Pass → 35/35
- B（カラー 20点）: B-1〜B-3 Pass、B-4 Warning（機能的には Pass、保守性観点の提案） → 18/20
- D（コンポ 10点）: D-1〜D-3 すべて Pass → 10/10
- E（機能回帰 20点）: E-1〜E-6 すべて Pass → 20/20
- G（コード品質 15点）: G-1〜G-9 Pass、G-10 Warning（TD指示準拠だが既存セクションとの見た目差） → 14/15
- H（その他）: H-1〜H-3 すべて Pass（配点外）

**総合点: 97 / 100**

合格条件（総合点 ≥ 70 かつ 重大Claim = 0）を両方満たす → **合格**

---

## サマリ

- Pass: 31 項目（A-1〜A-8 / B-1〜B-3 / D-1〜D-3 / E-1〜E-6 / G-1〜G-9 / H-1〜H-3）
- Fail: 0 項目
- Warning: 2 項目（B-4、G-10）

### Warning の扱い
- **B-4**: `--warning-text` 値衝突にインラインコメントを追記すると保守性向上（M0-5 前の IM 誤操作防止）。必須ではない。
- **G-10**: セクション見出しフォーマットが既存と異なる（`/* ==== */` vs `/* ---- */`）。TDが指示した形式そのものなので IM 側の責任ではない。TD への改善提案として記録。

両 Warning とも機能影響ゼロ。合格判定に影響なし。
