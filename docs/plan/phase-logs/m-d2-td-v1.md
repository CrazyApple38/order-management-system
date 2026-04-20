# Phase M-D2 TD v1 — OB/SL モーダル `.md-ob-modal*` を新DS `.modal-*` に置換

> Role: Test Designer（TD） / Target: Sub-Phase **M-D2**
> Scope: `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` / `docs/mockup/co-shared-badges.css` / `docs/order-book.html` / `docs/screen-layout.html` / `docs/mockup/order-book.js` / **新規** `docs/mockup/co-modal.css`
> Upstream: M0 / M-A / M-B / M-C / M-D1（ボタン置換完了）
> Downstream: M-D3（`md-modal-site-*` / `md-cn-modal*` / `md-nav-modal*` 等の残モーダル）/ M-E（バッジ）/ M-F（A11y・印刷）/ M-G（旧エイリアス削除）
> New DS Reference: `docs/ui-components/styles-light.css` L1262-1305（`.ob-modal-overlay / .ob-modal / .ob-modal-header / .ob-modal-body / .ob-modal-footer / .ob-modal-close / .ob-modal.ob-modal-calendar`）

---

## 1. 目的

### 1.1 主目的（M-D2 の範囲）

OB / SL（2画面）で使われている旧モーダルシェル `.md-ob-modal-overlay / .md-ob-modal / .md-ob-modal-header / .md-ob-modal-body / .md-ob-modal-footer / .md-ob-modal-close / .md-ob-modal-sm / .md-ob-modal-footer-right / .md-ob-modal-calendar` を、**新DS `.modal-*` 体系（`co-modal.css` に集約）**へ統合する。M-D1 で達成したボタン統合と同じく、`co-*.css` 共有レイヤを1段階育てる。

### 1.2 採用案（TD 決定）: **案A — `co-modal.css` を新設して `.modal-*` を定義 + OB/SL 側で置換**

#### 案A / 案B / 案C の比較

| 観点 | 案A（採用） | 案B（エイリアス併走） | 案C（OB/SL 個別新設） |
|------|-------------|------------------------|------------------------|
| 完全DS準拠 | ○ 新クラスに統一 | △ 旧クラスが残り M-G で再作業必須 | △ 2画面個別 |
| 保守性 | ○ 1箇所に集約 | × セレクタ二重化 | × 重複コード |
| 規模 | 中（新設1 + 置換 80件） | 小（CSSのみ） | 大 |
| 他画面（WS/QA）再利用 | ○ そのまま使える | × | × |
| M-D1 との運用一貫性 | ○ 同方針 | × ばらつく | × |

#### 採用理由

1. **M-D1 採用の方針（`co-buttons.css` 新設 → 完全DS準拠）と統一**。ガバナンス上のサブフェーズ間一貫性が保てる。
2. **`styles-light.css` を OB/SL は直接 link しない**。OB/SL は `co-tokens.css / co-forms.css / co-buttons.css / co-shared-badges.css / co-navbar.css / 個別CSS` のみ link しているため、モーダル共通定義を持ち出す共有CSSが必須。既存の `co-buttons.css / co-forms.css` にモーダルシェルを混ぜると責務が破綻する → `co-modal.css` を新設。
3. **M-G（旧エイリアス削除）で再作業が発生しない**: 案B は今回は差分小だが、M-G 時に再置換コストが発生。M-D3（SL の `.md-modal-site-*` / 変更通知 `.md-cn-*` / 共有マスタ `.md-nav-modal*`）が今後続くため、ここで土台 `co-modal.css` を確定させておくと順次流し込める。
4. **将来の WS/QA 統合**: Phase W-D / Q-D で WS・QA のモーダルも同 `co-modal.css` を link するだけで `.modal-*` に移行可能。

#### 命名の重要な判断: **ユーザー指示「新DS `.modal-*`」と UI components 集の実在定義のズレ**

- ユーザー指示では **`.modal / .modal-overlay / .modal-header / .modal-body / .modal-footer` を含むセクション**（styles-light.css 内）を参照せよと指定されているが、`styles-light.css` 実ファイルには該当する 5点セット（`.modal{}` `.modal-header{}` `.modal-body{}` `.modal-footer{}`）は **存在しない**。
- 実在するのは L1262-1305 の `.ob-modal-overlay / .ob-modal / .ob-modal-header / .ob-modal-body / .ob-modal-footer / .ob-modal-close / .ob-modal.ob-modal-calendar` の **`ob-modal-*` プレフィクス版**（`from order-book.css` コメント付き。つまり旧 OB から UI components 集に移された移行暫定版）。
- これに加え L818-1140 にかけて `.modal-overlay / .modal-content / .modal-row / .modal-section / .modal-site-*` といった **別系統（デモ/インプットモーダル用）**も存在。
- **ガバナンス「命名整合性ルール」**: 用語・名付けに判断が必要な点。本来はユーザー確認だが、本タスクは「一気通貫で実施」指示であり、かつユーザー指示内にトークン `--modal-w-*` / `--z-modal` を併記していることから、**プレフィクス無しの `.modal-*` 名前空間を新DS規範として採択する意図**が明白。
- **採択命名**: `co-modal.css` 内で **`.modal-overlay / .modal / .modal-header / .modal-body / .modal-footer / .modal-close / .modal-footer-right / .modal.modal-sm / .modal.modal-calendar`** として定義。`.ob-modal-*` のプレフィクスを外し、styles-light.css L1262-1305 の値をそのまま持ち込む。
- `styles-light.css` 側の `.ob-modal-*` 定義は本フェーズでは **触らない**（UI components 集側は別ガバナンス）。将来 M-G（旧エイリアス削除）で styles-light.css 側も `.modal-*` に正準化予定。

#### スコープ境界（M-D2 で **やる / やらない**）

- **やる**:
  - `docs/mockup/co-modal.css` 新設（styles-light.css L1262-1305 の `.ob-modal-*` を **プレフィクス無し `.modal-*`** に再命名してそのまま転記 + co-tokens.css の `--modal-w-sm/md/lg/xl` と `--z-modal` で変数参照化）
  - OB/SL の2つの HTML で `co-modal.css` を link（`co-buttons.css` と `co-shared-badges.css` の間、または `co-buttons.css` 直後）
  - OB/SL HTML の `md-ob-modal*` クラスを `modal*` に置換（OB 27件 + SL 20件 = 47件）
  - OB `order-book.js` の `md-ob-modal*` 文字列を `modal*` に置換（5件）
  - OB `order-book.css` から `.md-ob-modal*` 定義ブロック（L471-540, L1038）を削除
  - SL `screen-layout.css` から `.md-ob-modal*` 定義ブロック（L4100-4143）を削除
  - `co-shared-badges.css` の `.md-ob-modal-close` 定義（L339-344）を削除（co-modal.css に移管）
- **やらない**:
  - `.md-modal-site-*`（SL 現場詳細モーダル, CSS 33件 / HTML 28件）→ **M-D3 別サブフェーズ**（SL 固有の compound、共通シェルと層が違う）
  - `.md-cn-*`（obChangeNotifyModal の中身, 変更通知）→ M-D3 別サブフェーズ。ただし**外側 overlay の `md-ob-modal-overlay` クラスだけは M-D2 で置換対象**
  - `.md-nav-modal*`（co-navbar.css 共有マスタ）→ 別サブフェーズ（ユーザー明示指示で触らない）
  - `.md-ob-cal-header / -body / -footer / -close / -footer-btn` 等の `cal-` 系 compound → カレンダー機能固有。**M-D2 では `.md-ob-modal-*` 部分だけ置換**し、`md-ob-cal-*` 部分は維持（別フェーズで見直し）
  - WS/QA の `md-ws-modal*` / `qa-modal*` 置換 → Phase W-D / Q-D
  - モーダル内コンテンツのリニューアル（`md-modal-body-field` / `md-modal-body-card` / `md-modal-section-bar` 等、M-B で導入された新BEMクラスはそのまま維持）
- **曖昧だった点の判断**:
  - `md-ob-modal-calendar`（OB カレンダー固有の幅・寸法調整）→ `.modal.modal-calendar` に改名して `co-modal.css` 末尾に配置。既存の `md-ob-cal-*`（カレンダー画面固有）と二重にクラス付与される
  - `md-ob-modal-close md-ob-cal-close`（カレンダーの close）→ HTML は `modal-close md-ob-cal-close` に。`md-ob-cal-close` は絶対配置ルール（`position:absolute; top:6px; right:6px`）だけなので temarea 違反なし
  - `md-ob-modal-footer md-ob-cal-footer` → `modal-footer md-ob-cal-footer`
  - OB の change-notify オーバーレイ（L450 `md-ob-modal-overlay` のみ使用、中身は `md-cn-*`）→ overlay だけ `modal-overlay` に置換（中身は M-D3）

### 1.3 非目標

- 視覚的な見た目の積極的変更（M-D2 は "クラス置換によるDS準拠化"。padding・color・z-index の値は可能な限り現状維持）
- `.md-modal-site-*` / `.md-cn-*` / `.md-nav-modal*` の置換（M-D3）
- モーダル幅トークン `--modal-w-sm/md/lg/xl` の全面活用（co-modal.css 内部で `.modal-sm` = `var(--modal-w-sm)`、既定 `.modal` = `var(--modal-w-md)` など自然に取り込む）
- A11y 属性（`role="dialog"` / `aria-modal` / `aria-labelledby`）の追加 → M-F

---

## 2. 配点（合計 100点）

ガバナンス既定 + ユーザー指示に沿って: **A=25 / B=10 / D=25 / E=25 / G=15**（C/F は本フェーズでは配点外）。合計 100点。

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| **DS準拠（トークン・命名）** | A | **25** | `co-modal.css` が styles-light.css L1262-1305 と同値（プレフィクスを `.ob-modal-*` → `.modal-*` に変更した上で、プロパティ値は一致）。`--z-modal` / `--modal-w-*` トークン参照。残留 `md-ob-modal*` が対象ファイルで 0件 |
| **カラーコーディネーション** | B | **10** | overlay の `rgba(0,69,84,0.35)` / header の `#5AB8C6 or var(--accent-primary-light)` / body の `#E9F1F6` が Coastal Palette 整合で維持。新色混入なし |
| **コンポーネント一貫性** | D | **25** | OB 5モーダル + SL 7モーダル + SL 追加モーダルのフッタ・ヘッダ構造が `.modal-header / .modal-body / .modal-footer` で一貫。`.modal-sm` / `.modal-calendar` の派生適用が統一 |
| **機能回帰（バグゼロ）** | E | **25** | 全モーダルで開閉動作（`display:none` トグル）、×ボタン、オーバーレイクリックで閉じる動作、z-index が他要素の上に来る、body scroll lock 等が動作。JS が `.md-ob-modal*` を `querySelector` している5箇所が新クラスで検出できる |
| **コード品質・保守性** | G | **15** | `co-modal.css` が単一ソースで、OB/SL CSS 側は `.md-ob-modal*` 実定義 0。co-tokens.css 変数のみ参照。重複・ハードコード最小化 |

**重大Claim（Critical）**: 1件でも該当 → 不合格
- **機能破壊**: モーダル開閉不能（×ボタンクリック／オーバーレイクリック／`closeXxxModal()` が機能しない）、`_setupCalEditPanel()` が `querySelector` 失敗で機能停止
- **オーバーレイ背景崩壊**: overlay の `rgba(0,69,84,0.35)` 半透明背景が消失、`position:fixed; inset:0` が効かず配置崩れ
- **z-index 干渉**: `--z-modal: 1000` がナビバー・ドロップダウン・トーストに対して正しく前面に来ない（既存 navbar z-index は 100, ドロップダウンは 600 想定）
- **他モックアップ波及**: `co-navbar.css` の `.md-nav-modal*` / SL の `.md-modal-site-*` / OB の `.md-cn-*` に **実定義変更** が入っている（grep で変更なしを検証）
- **CSS残留**: `.md-ob-modal*` が `order-book.css / screen-layout.css / co-shared-badges.css` のいずれかに **実定義として残っている**
- **HTML残留**: `order-book.html / screen-layout.html` で `class="md-ob-modal*"` が残っている
- **JS残留**: `order-book.js` の `querySelector('.md-ob-modal*')` が残っている（5箇所）
- **新規記号混入**: `✕` / `×` / `+` 等の Unicode 記号が **新たに追加**（既存 HTML の `✕` テキスト（close ボタン内）は温存）

---

## 3. 事前調査結果

### 3.1 CSS 実定義の所在（M-D2 で削除対象）

| ファイル | クラス | 行 | 備考 |
|---------|--------|-----|-----|
| `order-book.css` | `.md-ob-modal-overlay` | 471-475 | position:fixed; inset:0; rgba overlay; z-index:500 |
| `order-book.css` | `.md-ob-modal` | 477-483 | 基本コンテナ。width:480px / radius:12px / shadow |
| `order-book.css` | `.md-ob-modal.md-ob-modal-sm` | 484 | width:380px |
| `order-book.css` | `.md-ob-modal-header` (+ h3) | 485-494 | header 14px/24px accent-primary-light bg |
| `order-book.css` | `.md-ob-modal-body` (+ scrollbar) | 496-503 | padding 20px/24px bg #E9F1F6 flex-col gap:16px |
| `order-book.css` | `.md-ob-modal-footer` (+ -right) | 533-540 | footer flex space-between padding 14px/20px |
| `order-book.css` | `.md-ob-modal-calendar` | 1038 | カレンダー幅 500px max-width 95vw |
| `screen-layout.css` | `.md-ob-modal-overlay` | 4100-4105 | 同上（OB と同値） |
| `screen-layout.css` | `.md-ob-modal` | 4106-4112 | 同上 |
| `screen-layout.css` | `.md-ob-modal.md-ob-modal-sm` | 4113 | width:380px |
| `screen-layout.css` | `.md-ob-modal-header` (+ span) | 4114-4123 | header accent-light bg |
| `screen-layout.css` | `.md-ob-modal-body` (+ scrollbar) | 4124-4131 | |
| `screen-layout.css` | `.md-ob-modal-footer` (+ -right) | 4138-4143 | |
| `co-shared-badges.css` | `.md-ob-modal-close` (+ :hover) | 339-344 | close ボタン rgba(255,255,255,0.8) |

### 3.2 HTML / JS 参照件数（M-D2 置換対象）

| ファイル | `md-ob-modal*` 参照数 | 主な内訳 |
|---------|-----:|---|
| `docs/order-book.html` | **27件** | overlay 5 / modal 5 / modal-sm 2 / modal-calendar 1 / header 5 / body 4 / footer 5 / close 6 / footer-right 3 |
| `docs/screen-layout.html` | **20件** | overlay 2 / modal 2 / header 2 / body 2 / footer 2 / close 7 / footer-right 2 / sub 1 |
| `docs/mockup/order-book.js` | **6件** | `querySelector('.md-ob-modal')` 2 / `.md-ob-modal-body` 3 / `.md-ob-modal-footer` 1（`_setupCalEditPanel` / `_teardownCalEditPanel` / `editCount` 周辺） |
| `docs/mockup/screen-layout.js` | **0件** | SL は JS 側で md-ob-modal を querySelector していない |
| **HTML+JS 合計** | **53件** | |

**CSS 実定義（削除対象）**:
| ファイル | 件数 |
|---------|---:|
| `order-book.css` | 13件 |
| `screen-layout.css` | 12件 |
| `co-shared-badges.css` | 2件 |
| **CSS 合計** | **27件** |

**総合計**（置換＋削除）: **80件**

### 3.3 新DS 参照元（styles-light.css L1262-1305 から移植するプロパティ）

```
.ob-modal-overlay → .modal-overlay
  display: flex; align-items: center; justify-content: center;
  (※ styles-light 側は position:fixed; inset:0; background; z-index が別所で付く想定のようだが、
     OB/SL 実装では overlay 自体に position:fixed/inset/rgba/z-index を付けている。
     co-modal.css 側は OB/SL の実装値を採用: rgba(0,69,84,0.35), z-index:var(--z-modal))

.ob-modal → .modal
  background: var(--bg-surface); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-strong);
  width: var(--modal-w-md); max-height: 90vh;  (固定 480px → トークン)
  display: flex; flex-direction: column;
  overflow: hidden; border: 1px solid var(--divider);

.ob-modal-header → .modal-header
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-lg) var(--space-lg);  (注: 14px 24px は styles-light と OB/SL で微差)
  background: #5AB8C6; color: #FFFFFF;  (OB/SL の var(--accent-primary-light) / var(--accent-light) とは Coastal 内同系統)
  border-bottom: 1px solid rgba(0,0,0,0.1);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;

.ob-modal-header h3 → .modal-header h3
  font-size: var(--fs-sm); font-weight: var(--fw-semibold); margin: 0; color: #FFFFFF;

.ob-modal-close → .modal-close
  background: none; border: none;
  color: var(--text-tertiary); font-size: var(--fs-lg);
  cursor: pointer; padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-sm);
.ob-modal-close:hover → 同
  background: var(--accent-dim); color: var(--accent);
.ob-modal-header .ob-modal-close → .modal-header .modal-close (ヘッダ内で白系コントラスト)
  color: rgba(255,255,255,0.8);
.modal-header .modal-close:hover
  background: rgba(255,255,255,0.2); color: #FFFFFF;

.ob-modal-body → .modal-body
  padding: var(--space-lg); overflow-y: auto; flex: 1;
  (※ OB/SL の実装: padding 20px 24px, bg #E9F1F6, gap:16px flex-col)
  → co-modal.css では styles-light 側の「中身色 transparent / padding var(--space-lg)」を既定にし、
    body の内側 gap や #E9F1F6 背景は OB/SL の各画面CSS（個別 .md-ob-xxx-body ではなく .modal-body の
    **実際に体感される** 背景）として **co-modal.css 内** で OB/SL と同値を採用する
    （両画面で同値のため、共通化が妥当）

.ob-modal-footer → .modal-footer
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--divider);
  background: var(--bg-surface-2);

.ob-modal-footer-right → .modal-footer-right
  display: flex; gap: var(--space-sm);

.ob-modal.ob-modal-calendar → .modal.modal-calendar
  width: 500px; max-width: 95vw; max-height: none; overflow: visible; position: relative;
.ob-modal.ob-modal-calendar > .ob-modal-body → .modal.modal-calendar > .modal-body
  overflow: visible; flex: none;

.ob-modal.ob-modal-sm → .modal.modal-sm
  width: var(--modal-w-sm);
```

### 3.4 トークン参照（co-tokens.css で既定義）

- `--z-modal: 1000`（L161）
- `--modal-w-sm: 380px / -md: 480px / -lg: 600px / -xl: 800px`（L167-170）
- `--bg-surface / --bg-surface-2 / --divider / --accent / --accent-dim / --accent-primary / --accent-primary-light / --accent-light / --text-primary / --text-secondary / --text-tertiary / --space-*` は既定義

### 3.5 ファイル link 順（採用後）

```html
<!-- order-book.html / screen-layout.html 共通 -->
<link rel="stylesheet" href="mockup/co-tokens.css">
<link rel="stylesheet" href="mockup/co-forms.css">
<link rel="stylesheet" href="mockup/co-buttons.css">
<link rel="stylesheet" href="mockup/co-modal.css">       <!-- 新規 / M-D2 -->
<link rel="stylesheet" href="mockup/co-shared-badges.css">
<link rel="stylesheet" href="mockup/co-navbar.css?v=3">
<link rel="stylesheet" href="mockup/order-book.css">     <!-- or screen-layout.css -->
```

順序理由: `co-modal.css` は `co-tokens.css` の変数に依存、`co-buttons.css` と独立（フッタの `.btn-*` は別セレクタなので順序非依存）、`co-shared-badges.css` の `.md-ob-modal-close` 定義を **削除** することで衝突回避、`co-navbar.css` の `.md-nav-modal*` は別命名空間のため干渉なし。画面個別CSSが最後なので上書き余地を残す。

---

## 4. 置換マッピング

### 4.1 クラス名置換対応表（HTML / JS 用）

| 旧クラス（複合含む） | 新クラス | 出現ファイル |
|--------------------|----------|-------------|
| `md-ob-modal-overlay` | `modal-overlay` | OB HTML 5 / SL HTML 2 |
| `md-ob-modal` | `modal` | OB HTML 5 / SL HTML 2 / OB JS 2 |
| `md-ob-modal md-ob-modal-sm` | `modal modal-sm` | OB HTML 2 |
| `md-ob-modal md-ob-modal-calendar` | `modal modal-calendar` | OB HTML 1 |
| `md-ob-modal-header` | `modal-header` | OB HTML 5 / SL HTML 2 |
| `md-ob-modal-header md-ob-cal-header` | `modal-header md-ob-cal-header` | OB HTML 1 |
| `md-ob-modal-body` | `modal-body` | OB HTML 4 / SL HTML 2 / OB JS 3 |
| `md-ob-modal-body md-ob-cal-body` | `modal-body md-ob-cal-body` | OB HTML 1 |
| `md-ob-modal-footer` | `modal-footer` | OB HTML 5 / SL HTML 2 / OB JS 1 |
| `md-ob-modal-footer md-ob-cal-footer` | `modal-footer md-ob-cal-footer` | OB HTML 1 |
| `md-ob-modal-footer-right` | `modal-footer-right` | OB HTML 3 / SL HTML 2 |
| `md-ob-modal-close` | `modal-close` | OB HTML 6 / SL HTML 7 |
| `md-ob-modal-close md-ob-cal-close` | `modal-close md-ob-cal-close` | OB HTML 1 |

### 4.2 co-modal.css 新設内容（骨子）

```css
/* co-modal.css — モーダル共通プリミティブ (M-D2)
   Upstream: docs/ui-components/styles-light.css L1262-1305
   Tokens: co-tokens.css の --z-modal / --modal-w-sm/md/lg/xl */

.modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,69,84,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: var(--z-modal);
}
.modal {
    background: var(--bg-surface); border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,69,84,0.15);
    width: var(--modal-w-md); max-height: 90vh;
    display: flex; flex-direction: column;
    overflow: hidden; border: 1px solid var(--divider);
}
.modal.modal-sm { width: var(--modal-w-sm); }
.modal.modal-lg { width: var(--modal-w-lg); }
.modal.modal-xl { width: var(--modal-w-xl); }

.modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px;
    background: var(--accent-primary-light);
    color: #FFFFFF;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    border-radius: 12px 12px 0 0;
    flex-wrap: wrap; gap: 6px;
    position: relative;
}
.modal-header h3,
.modal-header span {
    font-size: 15px; font-weight: 600; color: #FFFFFF; margin: 0;
}

.modal-close {
    background: none; border: none;
    color: rgba(255,255,255,0.8); font-size: 18px;
    cursor: pointer; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: rgba(255,255,255,0.2); color: #FFFFFF; }

.modal-body {
    padding: 20px 24px; overflow-y: auto; flex: 1;
    background: #E9F1F6;
    display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: var(--divider) transparent;
}
.modal-body::-webkit-scrollbar { width: 5px; }
.modal-body::-webkit-scrollbar-thumb { background: var(--divider); border-radius: 3px; }
.modal-body::-webkit-scrollbar-track { background: transparent; }

.modal-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 20px; border-top: 1px solid var(--divider);
    background: var(--bg-surface-2);
}
.modal-footer-right { display: flex; gap: 10px; }

.modal.modal-calendar {
    width: 500px; max-width: 95vw; max-height: 90vh;
    position: relative;
}
```

設計ポイント:
- overlay の `z-index` が `--z-modal (1000)` になる（旧は 500）。既存 navbar (`z-index:100`) / dropdown (`:500-600`) / toast（通常 1500+）との関係は、navbar/dropdown より前 = 正常、toast より後 = 正常（モーダル上にトーストが出る既存挙動を維持）
- 旧の `background: var(--bg-surface)` は OB/SL で同値（`--bg-surface` 定義）、ヘッダ背景は OB = `var(--accent-primary-light)` / SL = `var(--accent-light)` でトークン名は違うが **値は同じ Coastal アクセント**。co-modal.css では `var(--accent-primary-light)` を採用（co-tokens.css で定義済であることを前提）
- ヘッダ h3 / span の font-size 15px は styles-light (`var(--fs-sm)` = 14px) と 1px ズレるが、**OB/SL の既存値（15px）を優先して現状維持**。M-D2 のスコープは "機能回帰" で、font-size 1px の積極改変は非目標

### 4.3 JS 側置換（order-book.js）

| 行 | 現状 | 置換後 |
|---:|------|-------|
| 1825 | `.closest('.md-ob-modal-body')` | `.closest('.modal-body')` |
| 3398 | `document.querySelector('#editModalOverlay .md-ob-modal')` | `document.querySelector('#editModalOverlay .modal')` |
| 3399 | `editModal.querySelector('.md-ob-modal-body')` | `editModal.querySelector('.modal-body')` |
| 3408 | `document.querySelector('#editModalOverlay .md-ob-modal')` | `document.querySelector('#editModalOverlay .modal')` |
| 3409 | `panelBody.querySelector('.md-ob-modal-body')` | `panelBody.querySelector('.modal-body')` |
| 3410 | `editModal.querySelector('.md-ob-modal-footer')` | `editModal.querySelector('.modal-footer')` |

**注意**: `.modal` 単独セレクタは汎用すぎる可能性があるため、`#editModalOverlay .modal` のようにIDスコープで限定しているのは健全。`screen-layout.js` には md-ob-modal 参照なし。

### 4.4 CSS 削除対象

| ファイル | 削除行範囲 | 行数 |
|---------|------------|---:|
| `order-book.css` | 470-540（モーダル定義ブロック全体 `========== モーダル ==========`）| 71 |
| `order-book.css` | 1037-1041（カレンダー幅ルール `.md-ob-modal-calendar`）| 5 |
| `screen-layout.css` | 4097-4143（新規追加モーダル定義）| 47 |
| `co-shared-badges.css` | 333-344（`5. md-ob: モーダル閉じるボタン` セクション）| 12 |

※ コメントブロック `/* ========== モーダル ========== */` 等は **痕跡として残す**（再学習時の参照に有用）、実CSS宣言のみ削除。

### 4.5 不触ファイル（grep で変更なしを検証）

- `docs/mockup/co-navbar.css`（`.md-nav-modal*` 残留OK）
- `docs/mockup/screen-layout.css` の `.md-modal-site-*` セクション（L2891-3110 等）
- `docs/order-book.html` の `md-cn-*` クラス（変更通知モーダル中身）
- `docs/mockup/co-tokens.css / co-forms.css / co-buttons.css`（トークン/フォーム/ボタン）
- `docs/ui-components/styles-light.css`（UI components 集本体）

---

## 5. Test Executor 向けチェックリスト（22項目）

### A. DS準拠（7項目）

- [ ] **A-1** `docs/mockup/co-modal.css` が存在し、`.modal-overlay / .modal / .modal-header / .modal-body / .modal-footer / .modal-close / .modal-footer-right` の7クラスが定義されている（各 `^\.modal`系 で最低7件）
- [ ] **A-2** `.modal.modal-sm / .modal.modal-lg / .modal.modal-xl / .modal.modal-calendar` の派生が定義されている
- [ ] **A-3** `co-modal.css` 内で `var(--z-modal)` が overlay の z-index として使用されている
- [ ] **A-4** `co-modal.css` 内で `var(--modal-w-sm)` / `var(--modal-w-md)` が幅として使用されている
- [ ] **A-5** `order-book.html` / `screen-layout.html` の `<head>` に `<link rel="stylesheet" href="mockup/co-modal.css">` が、`co-buttons.css` の直後 かつ `co-shared-badges.css` の前 に存在
- [ ] **A-6** `grep -c "md-ob-modal" docs/order-book.html docs/screen-layout.html` の合計 = **0**
- [ ] **A-7** `grep -c "md-ob-modal" docs/mockup/order-book.js docs/mockup/screen-layout.js` の合計 = **0**

### D. コンポーネント一貫性（5項目）

- [ ] **D-1** `grep "md-ob-modal" docs/mockup/order-book.css` の count = **0**（モーダル実定義ブロック削除済）
- [ ] **D-2** `grep "md-ob-modal" docs/mockup/screen-layout.css` の count = **0**
- [ ] **D-3** `grep "md-ob-modal" docs/mockup/co-shared-badges.css` の count = **0**（`.md-ob-modal-close` 定義削除済）
- [ ] **D-4** OB の全モーダル（editModal / rowEditModal / sortModal / calendarModal / obChangeNotifyModal）の overlay で `class="modal-overlay"` が統一
- [ ] **D-5** SL の全モーダル（siteModal / slAddModalOverlay / その他ヘッダのみ置換されるmeetingModal/workModal/notesModal/mapModal/workTimeModal の close）で `modal-close` が統一

### E. 機能回帰（6項目）

- [ ] **E-1** OB: セルダブルクリック → 編集モーダル表示、× で閉じる / オーバーレイクリックで閉じる / 保存 / 削除 が動作
- [ ] **E-2** OB: ソートモーダル（sm版）が表示され、× で閉じる
- [ ] **E-3** OB: カレンダーモーダル（`modal-calendar`）が表示、幅が約500pxで中身が見切れない。`_setupCalEditPanel` / `_teardownCalEditPanel` で `editModal.querySelector('.modal')` / `.modal-body` / `.modal-footer` がヒットし、Console エラーが出ない
- [ ] **E-4** OB: 変更通知モーダル（`obChangeNotifyModal` の overlay だけ `.modal-overlay`）が表示され、外側クリックで閉じる（`md-cn-*` 中身は従来動作のまま）
- [ ] **E-5** SL: siteModal（`md-ob-modal-overlay` だった外側）の開閉、slAddModal の追加/キャンセル、その他モーダル（meeting/work/notes/map/workTime）の close ボタン（`modal-close` に変わっている）クリックで閉じる
- [ ] **E-6** Console に M-D2 起因のエラーが出ない（`Cannot read properties of null` などの querySelector 失敗がない）

### B. カラー（2項目）

- [ ] **B-1** overlay の background が `rgba(0,69,84,0.35)` のまま維持（Chrome DevTools Computed で確認）
- [ ] **B-2** header の background が Coastal Palette 内の accent（`#5AB8C6` or `var(--accent-primary-light)` の評価値）、body が `#E9F1F6`。新色混入なし（青/赤/緑の外部色なし）

### G. コード品質・保守性（2項目）

- [ ] **G-1** `co-modal.css` 内に co-tokens.css 変数以外のハードコード色は `rgba(0,69,84,0.35)` / `rgba(0,0,0,0.1)` / `rgba(255,255,255,0.8|0.2)` / `#5AB8C6 (via var)` / `#E9F1F6` / `#FFFFFF` のみ（既存と同一）
- [ ] **G-2** `co-navbar.css` の `.md-nav-modal*`、`screen-layout.css` の `.md-modal-site-*` `md-cn-*` に **diff なし**（grep で件数不変、`git diff co-navbar.css` が空）

---

## 6. 重大Claim判定基準

以下 **1件でも該当 → 総合点に関わらず不合格**:

1. **機能破壊**: 任意のモーダルが「開かない / 閉じない / ×が効かない / オーバーレイクリックで閉じない」。`_setupCalEditPanel()` で `querySelector` が null を返し例外
2. **オーバーレイ背景崩壊**: overlay の半透明 rgba 背景が消失 / 白 or 透明化 / position:fixed が効かない
3. **z-index 干渉**: モーダルが navbar やドロップダウンの後ろに隠れる / トーストより前に来てしまう
4. **他モックアップ波及**: `co-navbar.css` / `co-tokens.css` / `co-forms.css` / `co-buttons.css` / `co-shared-badges.css`（モーダル close 以外）/ `screen-layout.css` の `.md-modal-site-*` / OB の `.md-cn-*` のいずれかに **実定義変更** が入っている
5. **CSS残留**: `md-ob-modal` が `order-book.css / screen-layout.css / co-shared-badges.css` のいずれかに実定義として残っている
6. **HTML残留**: `order-book.html / screen-layout.html` で `md-ob-modal` が残っている
7. **JS残留**: `order-book.js` の `querySelector / closest` で `md-ob-modal` が残っている
8. **新規記号混入**: `✕ / × / + / ✓` 等の Unicode 記号が新たに追加（既存 ✕ は温存可）
9. **Link 抜け**: OB または SL のどちらかで `co-modal.css` の `<link>` が未追加

---

## 7. 合格条件

**総合点 ≥ 70 / 100 かつ 重大Claim = 0**

- 合格 → Phase M-D3 或いは M-E へ進行可
- 不合格 → SC 指摘を TD が取り込み、M-D2 IM 再実装へ差し戻し（上限 5 反復）

---

## 8. 付録: Agent 向け運用指示

### 8.1 IM 向け

1. **co-modal.css 新設を最初に**（delete 前に add。HTML/JS 側の新クラス付与完了を保証）
2. `<link>` 追加を次に（OB/SL の 2 HTML）
3. HTML の `md-ob-modal*` → `modal*` 置換（複合クラスは旧順を維持: `modal-close md-ob-cal-close` 等）
4. JS の `querySelector` / `closest` / `.md-ob-modal*` 文字列を置換
5. CSS 実定義を削除（OB: `order-book.css` L471-540 + L1038 / SL: `screen-layout.css` L4097-4143 / shared: `co-shared-badges.css` L333-344）
6. 視覚確認なしで CSS 削除すると大崩壊するので、**削除の直前** に HTML 置換が全て完了していることを `grep -c md-ob-modal docs/order-book.html` = 0 で確認

### 8.2 TE 向け

1. 本チェックリスト 22 項目を順に実施
2. grep カウントは本環境の Grep ツール `output_mode:"count"` で取得
3. 機能回帰はブラウザ相当のチェック（DOM 構造目視 + JS 構文確認）で代替（実ブラウザ起動は不要だが、可能ならplaywright経由で開閉確認）
4. 結果は `docs/plan/phase-logs/m-d2-te-v1.md` に保存

### 8.3 SC 向け

1. TE v1 レポートを読み、配点 A=25 / B=10 / D=25 / E=25 / G=15 で採点
2. 重大Claim 発生時は総合点を付けた上で「重大Claim: 不合格」と明記
3. 結果は `docs/plan/phase-logs/m-d2-sc-v1.md` に保存
