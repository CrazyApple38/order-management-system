# Phase M-D1 TD v1 — OB/SL ボタン `.md-ob-btn-*` を新DS `.btn-*` に置換

> Role: Test Designer（TD） / Target: Sub-Phase **M-D1**
> Scope: `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` / `docs/mockup/co-shared-badges.css` / `docs/order-book.html` / `docs/screen-layout.html` / `docs/mockup/order-book.js` / `docs/mockup/screen-layout.js` / **新規** `docs/mockup/co-buttons.css`
> Upstream: M0（co-tokens.css）/ M-A（OB変数移行）/ M-B（OB フォーム）/ M-C（OB テーブル BEM/density）
> Downstream: M-D2（モーダル）/ M-E（バッジ）/ M-F（A11y/印刷）/ M-G（旧エイリアス削除）
> New DS Reference: `docs/ui-components/styles-light.css` L2712-2870（`.btn / .btn-primary / -secondary / -danger / -ghost / -outline / .btn-sm/-md/-lg / .btn-icon / .btn-group / -split / -right`）

---

## 1. 目的

### 1.1 主目的（M-D1 の範囲）

OB / SL（2画面）で使われている旧ボタンクラス `.md-ob-btn*`（Primary / Secondary / Danger / Add-Sub / Remove-Sub / Map-Preview / Map-Clear / Add-Chip / Add-Site / Delete-Site / Add-Badge / Add-GC 等）を、**新DS `.btn + .btn-{variant} + .btn-{size}` 体系**に統合する。

### 1.2 採用案（TD 決定）: **案A — `co-buttons.css` を新設して新DSボタンを共有化 + OB/SL 側で置換**

#### 案A / 案B / 案C の比較

| 観点 | 案A（採用） | 案B（エイリアス併走） | 案C（OB/SL 個別新設） |
|------|-------------|------------------------|------------------------|
| 完全DS準拠 | ○ 新クラスに統一 | △ 旧クラスが残り M-G で再作業必須 | △ 2画面個別定義 |
| 保守性 | ○ 1箇所に集約 | × セレクタ二重化 | × 重複コード |
| 規模 | 中（新設1 + 置換 80件前後） | 小（CSSのみ） | 大 |
| 他画面（WS/QA）再利用 | ○ そのまま使える | × | × |

#### 採用理由

1. **M-G（旧エイリアス削除）で再作業が発生しない**: 案B は現フェーズでは変更小だが、M-G で再度 HTML/JS の置換が必要になり、M-D2（モーダル）・M-E（バッジ）が同時進行する段階で回帰が増える。
2. **`styles-light.css` 本体は UIコンポーネント集専用**: OB/SL が直接 `styles-light.css` を link していないため（co-tokens.css / co-forms.css / co-shared-badges.css 経由）、新DSのボタン定義を持ち出す共通CSSが必要。既存の `co-forms.css` は "フォーム要素" に限定すべきで、ボタンを混ぜない方が保守的に健全。
3. **将来の WS / QA 展開で共通化できる**: `.md-ws-modal-btn*` / `.qa-modal-btn*` も同じ `co-buttons.css` を link して `.btn-*` に置換すれば統一可能（それらは Phase W-D / Q-D の別スコープ）。

#### スコープ境界（M-D1 で **やる / やらない**）

- **やる**:
  - `docs/mockup/co-buttons.css` 新設（`.btn` / variant / size / icon / group を `styles-light.css` L2712-2870 から忠実に転記）
  - OB/SL の2つの HTML で `co-buttons.css` を link（`co-forms.css` の直後）
  - OB/SL の `.md-ob-btn-primary|-secondary|-danger` → `.btn .btn-{variant}`（サイズは既定 = 相当する `.btn-sm`）
  - OB/SL の `.md-ob-btn-add-sub` / `-remove-sub` / `-map-preview` / `-map-clear` / `-add-chip` / `-add-site` / `-delete-site` / `-add-badge` / `-add-gc` を **新DSの `.btn` + variant/size/icon で代替**（後述マッピング参照）
  - OB/SL の `.md-ob-btn*` CSS 定義ブロックを削除
  - JS 側の `querySelector / setAttribute / innerHTML` で `md-ob-btn-*` を出力している箇所を新クラスへ置換
- **やらない**:
  - Weekly Schedule / Quick Access の `.md-ws-modal-btn*` / `.qa-modal-btn*` 置換 → Phase W-D / Q-D
  - `.md-tb-btn*`（ツールバーボタン）→ 別サブフェーズ
  - モーダルのフッター構造変更（`.btn-group` / `.btn-group-split` 導入は M-D2 で検討）
  - `.btn-loading` / `.btn-full` の機能導入（M-F 以降）
  - ドキュメント（`ds-migration-plan.md` 等）の `md-ob-btn*` 参照書き換え
- **曖昧だった点の判断**:
  - `.md-ob-btn-map-clear` は **絶対配置の「✕」アイコンボタン** → `.btn .btn-icon .btn-sm .btn-ghost` へ統合。位置指定（`position:absolute; top/right`）だけ残して保持
  - `.md-ob-btn-add-badge` / `-add-chip` / `-add-gc` は **破線ピル型の追加ボタン** で、Coastal Palette 内のテキスト/ボーダーのみ。`.btn .btn-sm .btn-ghost` に寄せつつ、**破線ボーダーの見た目が必要** → `.btn-ghost` に加えて局所的な装飾（`border-style: dashed; border-radius: 14px;`）を `co-buttons.css` 末尾の小粒ユーティリティ `.btn-ghost--pill-dashed` として追加する（新設、DS補完）
  - `.md-ob-btn-remove-sub` / 一部 `×` ボタンは **テキスト "×"** を使っている → **絵文字/記号代替は禁止**（CLAUDE.md の重大ルール）なので、**M-D1 では既存の "×" テキスト表示を維持する旨 TE に確認させる**（M-F でアイコンライブラリ `im-11911-hosoi-batsu.svg` への置換を予定）
    - 注: 現時点で "×" / "✕" / "+" がテキストで埋め込まれているのは M-F の既知課題であり、M-D1 のスコープでは 1) 既存のテキスト記号を改変しない、2) 新DSの `.btn .btn-icon` に移行する際も textContent はそのまま温存する。**TE は "新たに記号を増やしていないか" のみを点検**

### 1.3 非目標

- 視覚的な見た目の積極的な変更（M-D1 は "クラス置換によるDS準拠化"。ピクセル単位の見た目は極力現状維持）
- A11y 属性（`aria-label` / `aria-disabled`）の大量追加 → M-F
- 印刷CSS / Focus visible デザイン調整 → M-F

---

## 2. 配点（合計 100点）

ガバナンス既定の配点を本フェーズ向けに微調整。**M-D1 はボタン置換 = コンポーネント一貫性・DS準拠・機能回帰が主** のため、A / D / E を厚めに。

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| **DS準拠（トークン・命名）** | A | **25** | `.btn / .btn-{variant}/{size}/icon` の規約通りの適用。`co-buttons.css` が `styles-light.css` L2712-2870 と完全同値。残留 `.md-ob-btn*` がゼロ |
| **カラーコーディネーション** | B | **10** | Coastal Palette 整合（`--accent` / `--error` / `rgba(219,87,123,...)`）、hover/active 色の意味色統一 |
| **コンポーネント一貫性** | D | **25** | OB/SL の全モーダルフッタで Cancel/Save/Danger が `.btn .btn-secondary/-primary/-danger` に統一。補助ボタンも `.btn-ghost` / `.btn-icon` ルールに沿う |
| **機能回帰（バグゼロ）** | E | **25** | 全モーダルで「キャンセル・保存・削除」が動作、業務詳細 +追加 / ×削除、配置先 +／削除、地図プレビュー/Clear、並び替え +／-、作業内容 +追加、`smDeleteSite()` 等 JS が再接続できている |
| **カラー・タイポ・余白** | C | **10** | `.btn-sm` 既定で font/size/padding が小さすぎないか（既存が 12px font, 5px 10px padding → `.btn-sm` 3px 8px / 11px caption ではなく `.btn`(md) の 12px, `var(--space-xs) var(--space-sm)` に寄せる判断をTEに確認させる） |
| **アクセシビリティ** | F | **10** | `:focus-visible` で `--focus-ring` が出る、`disabled` 属性で opacity 0.4 / pointer-events none / cursor not-allowed。既存の "×" テキスト記号は維持（削除も追加もしない） |
| **コード品質・保守性** | G | **5** | `co-buttons.css` が単一ソース、OB/SL 側は変数参照のみで重複なし、JS の出力文字列内も一貫 |

**重大Claim（Critical）**: 1件でも該当すれば不合格
- 保存/キャンセル/削除ボタンがクリックできない / `onclick` ハンドラが未配線
- モーダルフッタの視覚レイアウトが崩壊（ボタン配置・段落れ）
- 絵文字/Unicode記号が **新規に追加**された（既存 "×" "✕" "+" は据え置きで可）
- Coastal Palette 外の色（青系・緑系・赤系で `--error` 以外の独自値）が混入
- コントラスト比が AA 未達（`.btn-secondary` の `--text-secondary` on `--bg-surface-2`、`.btn-danger` on `rgba(219,87,123,0.08)`）
- `.md-ob-btn*` が **CSS 実定義として残っている**（`co-shared-badges.css` / `order-book.css` / `screen-layout.css` のいずれか）

---

## 3. 事前調査結果

### 3.1 CSS 定義の所在（M-D1 で削除/置換対象）

| ファイル | クラス | 行 | 備考 |
|---------|--------|-----|-----|
| `order-book.css` | `.md-ob-btn-add-sub` | 609-617 | 業務詳細 `+追加` ボタン（アクセントDim背景/境界） |
| `order-book.css` | `.md-ob-btn-remove-sub` | 647-657 | サブタスク `×` ボタン（色=disabled→hover時 danger） |
| `order-book.css` | `.md-ob-btn-map-preview` | 755-764 | 地図プレビュー起動（accent-dim バッジ風） |
| `order-book.css` | `.md-ob-btn-map-clear` | 773-784 | 地図プレビュー内のクリア × ボタン（絶対配置） |
| `order-book.css` | `.md-ob-btn` / `.md-ob-btn-primary` / `-secondary` / `-danger` | 839-850 | モーダル共通ボタン |
| `order-book.css` | `.md-ob-btn-add-chip` | 1005-1015 | チップ追加（破線ピル型） |
| `order-book.css` | `.md-ob-btn-add-site` | 1078-1086 | 配置先タブ追加 |
| `order-book.css` | `.md-ob-btn-delete-site` | 1087-1095 | 配置先タブ削除（danger系） |
| `screen-layout.css` | `.md-ob-btn*` 本体 | 3839-3848 | `.md-ob-btn-primary/-secondary/-danger` |
| `screen-layout.css` | `.md-ob-btn-add-chip` | 3865-3875 | |
| `screen-layout.css` | `.md-ob-btn-add-sub` | 3901-3909 | |
| `screen-layout.css` | `.md-ob-btn-remove-sub` | 3941-3951 | |
| `screen-layout.css` | `.md-ob-btn-map-preview` | 4345-4354 | |
| `screen-layout.css` | `.md-ob-btn-map-clear` | 4363-4374 | |
| `screen-layout.css` | `.md-modal-site-footer button.md-ob-btn-danger` | 3003-3008 | 複合セレクタ（site-footer 限定上書き） |
| `co-shared-badges.css` | `.md-ob-btn-add-badge` | 184-194 | 作業内容 `+追加` 破線ピル |
| `co-shared-badges.css` | `.md-ob-btn-add-gc` | 310 | Grandchild 追加ボタン（小粒寸法override） |

### 3.2 HTML / JS 参照件数（M-D1 置換対象）

| ファイル | `md-ob-btn*` 参照数 | 内訳（主要）|
|---------|-----:|-----|
| `docs/order-book.html` | **17件** | `-primary` 4 / `-secondary` 4 / `-danger` 2 / `-add-sub` 3 / `-remove-sub` 1 / `-map-preview` 1 / `-map-clear` 1 / `-add-badge` 1 |
| `docs/screen-layout.html` | **34件** | `-primary` 11 / `-secondary` 12 / `-danger` 4 / `-add-sub` 4 / `-add-badge` 2 / ほか  |
| `docs/mockup/order-book.js` | **11件** | テンプレ文字列内 `-remove-sub`（4） / `-map-preview`（1） / `-map-clear`（1） / `-add-badge -add-gc`（1）など |
| `docs/mockup/screen-layout.js` | **11件** | テンプレ文字列内 `-remove-sub`（4） / `-map-preview`（1） / `-map-clear`（1） / `-add-badge -add-gc`（2）など |
| **合計（HTML + JS）** | **73件** | |

HTML+JS+CSS 全体で `md-ob-btn` の出現は **136件**。計画・ログ等の非対象ファイル（`docs/plan/**`, `docs/01_要件定義.md`, `docs/ui-components/**`）は残留して良い（過去フェーズの記録保全）。

### 3.3 新DS `.btn` が OB/SL で解決可能か

- OB/SL は `styles-light.css` を直接 link **していない**（`co-tokens.css` / `co-forms.css` / `co-shared-badges.css` / `co-navbar.css` / 画面個別CSS）
- `co-forms.css` はフォーム系トークン/プリミティブで、**ボタンクラスは未収載**（Grep で `\.btn\b` は 0件）
- → **新規 `co-buttons.css` 作成が必須**（案A の根拠）

### 3.4 ファイル link 順（採用後）

```html
<!-- order-book.html / screen-layout.html 共通 -->
<link rel="stylesheet" href="mockup/co-tokens.css">
<link rel="stylesheet" href="mockup/co-forms.css">
<link rel="stylesheet" href="mockup/co-buttons.css">   <!-- 新規 / M-D1 -->
<link rel="stylesheet" href="mockup/co-shared-badges.css">
<link rel="stylesheet" href="mockup/co-navbar.css?v=3">
<link rel="stylesheet" href="mockup/order-book.css">   <!-- または screen-layout.css -->
```

順序理由: `co-buttons.css` は `co-tokens.css` の変数に依存、`co-forms.css` と独立、`co-shared-badges.css` より前に置くことで `.md-ob-btn-add-badge` 置換後の見た目が shared-badges の上書きを受けにくい。

---

## 4. 置換マッピング

### 4.1 主要3種（モーダル共通）

| 旧クラス | 新クラス（HTML） | 備考 |
|---------|----------------|------|
| `md-ob-btn md-ob-btn-primary` | `btn btn-primary` | サイズは `.btn`（= md 既定）。既存の `padding:5px 10px; font:12px/600; radius:6px` は `.btn` の `var(--space-xs) var(--space-sm)` / `var(--fs-sm)` / `var(--radius-sm)` とほぼ同等 |
| `md-ob-btn md-ob-btn-secondary` | `btn btn-secondary` | |
| `md-ob-btn md-ob-btn-danger` | `btn btn-danger` | |

### 4.2 補助ボタン

| 旧クラス | 新クラス（HTML） | 既存CSSの残留（co-buttons.css 補完ユーティリティ）|
|---------|----------------|---|
| `md-ob-btn-add-sub` | `btn btn-sm btn-outline` | なし（`.btn-outline` の accent 枠＋accent-dim hover が既存とほぼ一致） |
| `md-ob-btn-remove-sub` | `btn btn-sm btn-icon btn-ghost` + `data-variant="danger-hover"` | hover 時 danger 色は `.btn-ghost:hover` を override する補完クラス `.btn-ghost--danger-hover`（任意、TE 目視判定） |
| `md-ob-btn-map-preview` | `btn btn-sm btn-outline` | `.btn-outline` で accent 枠+accent-dim 背景を表現 |
| `md-ob-btn-map-clear` | `btn btn-sm btn-icon btn-ghost` | 絶対配置 (`position:absolute; top:4px; right:4px; width:22px; height:22px;`) は OB/SL の親側スタイル（`.md-ob-map-preview`）に残す |
| `md-ob-btn-add-chip` | `btn btn-sm btn-ghost` + 補完 `.btn-ghost--pill-dashed` | 破線 radius 14px の見た目は補完ユーティリティで実現 |
| `md-ob-btn-add-site` | `btn btn-sm btn-ghost` | placement-tabs と同じ色運用 |
| `md-ob-btn-delete-site` | `btn btn-sm btn-danger` | 既存 border/background/color が `.btn-danger` と完全一致 |
| `md-ob-btn-add-badge` (co-shared-badges.css) | `btn btn-sm btn-ghost` + `.btn-ghost--pill-dashed` | ピル型 radius 12px。`-add-chip` と統合 |
| `md-ob-btn-add-gc` (co-shared-badges.css) | `btn btn-sm btn-ghost` + `.btn-ghost--pill-dashed` + 追加 `font-size:11px; padding:2px 8px; border-radius:10px;` を `co-shared-badges.css` 側に特化override（Grandchild 専用）| 小粒寸法は BEM 配下で維持 |

### 4.3 `co-buttons.css` の新設内容（概略）

1. `styles-light.css` L2712-2870 の `.btn / .btn-primary / -secondary / -danger / -ghost / -outline / .btn-sm / -md / -lg / .btn-icon / .btn-full / .btn-loading / .btn-group / -split / -right` を **完全転記**
2. 補完ユーティリティ（M-D1 スコープで追加して良いもの）:
   - `.btn-ghost--pill-dashed`: `border-style: dashed; border-radius: 14px;`（破線ピル型）
   - `.btn-ghost--danger-hover`: hover で `color: var(--error); border-color: rgba(219,87,123,0.3); background: rgba(219,87,123,0.06);`
3. `[data-density="compact"] .btn.btn-sm` / `.btn-lg` のデンシティ連動ルール（`styles-light.css` L3931 以降）も同梱

### 4.4 JS 側置換の方針

| ファイル | 対象行 | 置換内容 |
|---------|-------|---------|
| `order-book.js` | L952, 976, 992, 1173, 1556, 1560, 1564, 1577, 1622, 1626, 1630 | テンプレート文字列内の `class="md-ob-btn-*"` を新DS表記に置換 |
| `screen-layout.js` | L4321, 4341, 4354, 4441, 5503, 5515, 5676, 5950, 5954, 5958, 5971 | 同上 |

`querySelector('.md-ob-btn-remove-sub')` のようなセレクタは、新クラスのいずれか1つで一意に検索できるようにする（`.btn-icon.btn-ghost--danger-hover` 等）。**TE には「DOM 検索が壊れていないか」を E 観点で回帰テストさせる**。

---

## 5. Test Executor に実施させるチェックリスト（25項目）

### A. DS準拠（8項目）

- [ ] **A-1** `docs/mockup/co-buttons.css` が存在し、`.btn / .btn-primary / -secondary / -danger / -ghost / -outline` が定義されている（`grep "^.btn" co-buttons.css` で少なくとも6種類）
- [ ] **A-2** `co-buttons.css` の `.btn-primary` / `-secondary` / `-danger` / `-ghost` / `-outline` のプロパティ値が、`docs/ui-components/styles-light.css` L2742-2784 と **完全一致**（TE は両方を並べて diff 相当で確認）
- [ ] **A-3** `.btn-sm` / `.btn-md` / `.btn-lg` が定義されている（L2787-2808 の値と一致）
- [ ] **A-4** `.btn-icon` / `.btn-group` / `.btn-group-split` / `.btn-group-right` が定義されている（L2811-2870）
- [ ] **A-5** `order-book.html` / `screen-layout.html` の `<head>` に `<link rel="stylesheet" href="mockup/co-buttons.css">` が、`co-tokens.css` と `co-shared-badges.css` の間に存在
- [ ] **A-6** `grep -c "md-ob-btn" docs/order-book.html` = **0** （計画文書を除き残留なし）
- [ ] **A-7** `grep -c "md-ob-btn" docs/screen-layout.html` = **0**
- [ ] **A-8** `grep -c "md-ob-btn" docs/mockup/order-book.js docs/mockup/screen-layout.js` = **0**（テンプレート文字列含む）

### D. コンポーネント一貫性（5項目）

- [ ] **D-1** `grep "md-ob-btn" docs/mockup/order-book.css` = **0**（CSS 実定義残留ゼロ）
- [ ] **D-2** `grep "md-ob-btn" docs/mockup/screen-layout.css` = **0**（`.md-modal-site-footer button.md-ob-btn-danger` の複合セレクタも削除 or `.btn-danger` 化済み）
- [ ] **D-3** `grep "md-ob-btn" docs/mockup/co-shared-badges.css` = **0**（`-add-badge` / `-add-gc` が置換済み）
- [ ] **D-4** OB `order-book.html` 267行 / 269-270 / 361-362 / 389-390 / 436-439 の全モーダルフッタで、`.btn .btn-primary/-secondary/-danger` が揃っている（クラス列挙が旧と混在していない）
- [ ] **D-5** SL `screen-layout.html` の計 34 件の `md-ob-btn*` 参照が全て新DS クラスに置換され、各モーダルフッタ（現場/会合/作業/備考/地図/勤務時間/ソート/変更通知 等）でクラス構成が一貫

### E. 機能回帰（7項目）

- [ ] **E-1** OB: セルダブルクリック → 編集モーダル → **キャンセル / 保存 / 削除** がすべて動作（`closeEditModal() / saveEdit() / deleteCell()` が実行される）
- [ ] **E-2** OB: 業務詳細 **`+ 追加`** を3回押下 → エントリが3件増える / **`×`** を押下 → 対応するエントリが削除（`addSubTaskEntry() / removeSubTaskEntry()` が動作）
- [ ] **E-3** OB: 地図 **`プレビュー`** → iframe 表示 / **`✕`**（map-clear）→ プレビュー非表示（`previewMap(this) / clearMapPreview(this)` が動作）
- [ ] **E-4** OB: 作業内容 **`+ 作業内容追加`**（add-badge）→ 子バッジが追加、さらに **`+ 追加`**（add-gc）→ 孫バッジが追加
- [ ] **E-5** SL: 現場モーダル（siteModal）→ 保存 / キャンセル / **削除**（`smDeleteSite()`）が動作
- [ ] **E-6** SL: 会合 / 作業 / 備考 / 地図 / 勤務時間 / 並び替え / 変更通知 の各モーダルで **Cancel / Save**（存在するもののみ）が全て動作
- [ ] **E-7** SL: 追加モーダル（slAdd*）の **追加 / キャンセル** 動作、業務詳細 `+ 追加` / `×` 動作

### B. カラー（2項目）

- [ ] **B-1** `.btn-primary` の背景 = `var(--accent)`、hover = `var(--accent-light)`、active = `#0a9db0`。Chrome DevTools で計算値が表示されること
- [ ] **B-2** `.btn-danger` の背景 = `rgba(219, 87, 123, 0.08)`、border = `rgba(219, 87, 123, 0.3)`、color = `var(--error)`。Coastal 外の色（`#DB577B` 直書きが HTML/JS に新規混入していないか確認）

### C. タイポ・余白（1項目）

- [ ] **C-1** 主要3ボタン（`.btn-primary/-secondary/-danger`）の視覚サイズが移行前後で概ね維持（padding が数pxずれる程度は許容。`font-weight: 600` 維持、`line-height` が潰れていない）

### F. アクセシビリティ（1項目）

- [ ] **F-1** 任意の `.btn` を Tab フォーカス → `:focus-visible` で `--focus-ring` の外枠が表示される。`disabled` 属性付きボタン（例: `rowEditSaveBtn` の無効化 / `md-ob-cal-footer-btn disabled`）で `opacity: 0.4` / `cursor: not-allowed` が効く

### G. 保守性（1項目）

- [ ] **G-1** `co-buttons.css` 内に、`co-tokens.css` 側の変数（`--accent / --accent-light / --accent-dim / --error / --bg-surface-2 / --bg-surface-3 / --text-primary / --text-secondary / --space-xs / --space-sm / --space-lg / --fs-sm / --fs-caption / --fw-semibold / --lh-tight / --radius-sm / --radius-md / --focus-ring / --duration-fast`）以外の **独自CSS変数やハードコード数値の混入がない**（`rgba(219,87,123,...)` は DS 内既知、`#0a9db0` は styles-light 由来のため許容）

---

## 6. 重大Claim判定基準

以下 **1件でも該当 → 総合点に関わらず不合格**:

1. **機能破壊**: 保存 / キャンセル / 削除 / 追加 / 削除×ボタンのいずれかで `onclick` が発火しない、エラーが出る、モーダルが閉じない
2. **CSS残留**: `.md-ob-btn*` が `co-shared-badges.css` / `order-book.css` / `screen-layout.css` のいずれかに **実定義として残っている**（コメント文字列内は可）
3. **HTML残留**: `order-book.html` / `screen-layout.html` で `class="md-ob-btn..."` が残っている
4. **JS残留**: `order-book.js` / `screen-layout.js` のテンプレ文字列 / `querySelector` / `setAttribute` で `md-ob-btn` が残っている
5. **新規記号混入**: `×` / `✕` / `+` / `✓` 等の Unicode 記号が **新たに追加** されている（既存の "×" / "+" を maintain するのは可）
6. **Coastal 外色混入**: `co-buttons.css` に Coastal Palette 外の色（青/緑/赤で `--error` 以外の独自値、`#ff0000` / `#0088cc` 等）がある
7. **コントラスト破綻**: `.btn-secondary` / `.btn-ghost` の文字色が背景色に対して AA 未達（Chrome DevTools Contrast ratio ≥ 4.5:1）
8. **Link 抜け**: OB または SL のどちらかで `<link rel="stylesheet" href="mockup/co-buttons.css">` が未追加 → 全ボタンが無スタイル化

---

## 7. 合格条件

**総合点 ≥ 70 / 100 かつ 重大Claim = 0**

- 合格 → Phase M-D2（モーダル `.md-ob-modal*` → `.modal-*`）へ進む
- 不合格 → SC の指摘を TD が取り込み、M-D1 IM 再実装へ差し戻し。反復上限 5 回（ガバナンス §2）

---

## 8. 付録: Agent 向け運用指示

### 8.1 IM（Implementer）向け

1. まず `co-buttons.css` を新設し `styles-light.css` L2712-2870 を忠実転記（変数名は co-tokens.css 名称に合わせる）
2. OB/SL HTML の `<head>` に `<link>` を 1行追加（順序: tokens → forms → **buttons** → shared-badges → navbar → 個別）
3. CSS を置換する前に HTML/JS を先に置換する（CSS定義を消すと視覚崩壊するため、HTML/JS 側の新クラス付与完了を優先）
4. OB/SL の CSS 定義ブロック（table §3.1 記載行）を削除、`co-shared-badges.css` の 2 クラスも削除
5. `.md-ob-btn-add-gc` の独自寸法（`font-size: 11px; padding: 2px 8px; border-radius: 10px;`）は、`co-shared-badges.css` 内の **Grandchild バッジ専用 CSS**（例: `.md-ob-gc-add-btn`）として別名で残す or HTML で `style="..."` インライン（非推奨） → **推奨: `.btn.btn-sm.btn-ghost--pill-dashed.md-ob-gc-add`（BEM 末端で特化）**

### 8.2 TE（Test Executor）向け

1. 本チェックリスト 25 項目を順に実施
2. **観測のみ記録**。主観評価（"きれい" 等）を入れない
3. grep 件数は `rg --count-matches` または本環境の Grep ツール `output_mode:"count"` で取得
4. 機能回帰は `docs/order-book.html` / `docs/screen-layout.html` を直接ブラウザで開き、Console エラーと DOM 変化で判断
5. 結果は `docs/plan/phase-logs/m-d1-te-v1.md` に保存

### 8.3 SC（Scorer）向け

1. TE v1 レポートを読み、配点 A=25/B=10/D=25/E=25/C=10/F=10/G=5 で採点
2. 重大Claim 発生時は総合点を付けた上で「重大Claim: 不合格」と明記
3. 結果は `docs/plan/phase-logs/m-d1-sc-v1.md` に保存
