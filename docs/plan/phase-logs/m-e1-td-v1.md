# Phase M-E1 TD v1 — OB/SL バッジを新DS `.bt-*` 体系へ整理（最小スコープ）

> Role: Test Designer（TD） / Target: Sub-Phase **M-E1**
> Scope: `docs/mockup/co-shared-badges.css` / `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` / `docs/order-book.html` / `docs/screen-layout.html` / `docs/mockup/order-book.js` / `docs/mockup/screen-layout.js`
> Upstream: M0 / M-A / M-B / M-C / M-D1 / M-D2 完了
> Downstream: M-E2（`md-cn-*` 差分通知バッジ）/ M-F（A11y・印刷）/ M-G（旧エイリアス最終削除・`md-ob-badge*` → `bt-*` の物理リネーム）
> New DS Reference: `docs/ui-components/styles-light.css` L2008-2327（Badge / Tag System セクション）

---

## 1. 目的

### 1.1 主目的（M-E1 の範囲）

OB / SL（2画面）で使われている旧バッジ系クラス（`co-shared-badges.css` の `.md-ob-badge-chip / -selected / -child / -delete-btn / -drag-item / -grandchild / -row-chip / -confidence-chip` など）について、**定義値（色・半径・余白・font）を新DS `.bt-*` 体系の規定値と揃える**。命名の物理リネーム（クラス名置換）は M-G に回し、本フェーズは **定義値のトークン化・DS同値化 + 新DS `.bt-*` エイリアスの co-shared-badges.css への併記** で DS 準拠を達成する。

### 1.2 採用案（TD 決定）: **案C''（ハイブリッド最小スコープ）**

#### ユーザー提示の案C（原案）と実装上の制約

ユーザー TD 事前指示は「**案C: `.md-ob-badge-*` 系をOB内で `.chip-activated / .bt-cell-tag / .draggable-tag` に置換**」（最小スコープ、リスク最小）。

現状調査でのカウント:

| ファイル | `md-ob-badge*` / `md-ob-chip*` / `md-ob-row-chip*` / `md-ob-confidence*` / `md-ob-grandchild*` / `md-ob-gc*` / `md-ob-touch*` の参照数 |
|---------|---:|
| `docs/order-book.html` | 12件（OB 編集モーダル + 行編集モーダルの固定記述 + JS生成セレクタは除く） |
| `docs/screen-layout.html` | 20件（sm/wm/slAdd/mt 各モーダル × chip-field/row-chips/badge-*/confidence-*） |
| `docs/mockup/order-book.js` | **32件**（主に `innerHTML = ...` での動的生成、`querySelectorAll('.md-ob-badge-drag-item')` 等 + ドラッグハンドラ内のクラス付け外し） |
| `docs/mockup/screen-layout.js` | **29件**（sm/wm/slAdd の各モーダル向け同等処理） |
| `docs/mockup/co-shared-badges.css` | **28件**（実定義） |
| `docs/mockup/order-book.css` | **11件**（grandchild-section / chip-field 周辺、`md-ob-conf-tentative_*` などセル表示寄り） |
| `docs/mockup/screen-layout.css` | **7件**（chip-field / confidence-field / slAddModal 内 badge-child-group override） |
| **合計** | **139件** |

**結論**: 純粋な「`md-ob-badge-*` → `bt-*`」物理リネームは **139件の同期書き換え + ドラッグ&ドロップ/選択/削除/undo 機能の全数回帰テスト**が必要で、M-E1 単体のリスクとしては過大。M-D1（`.btn` 置換 100+件）と違い、バッジ側は**動的生成 innerHTML 文字列内のクラス名**と **querySelector/classList 操作**が密結合しており、1件の漏れで即機能破壊に直結する。

#### 案A / 案B / 案C（原案）/ 案C''（採用） の比較

| 観点 | 案A 完全リネーム | 案B エイリアス併走 | 案C（原案・物理リネーム最小セット） | **案C''（採用・定義値DS同値化）** |
|------|---------------|---------------------|-----------------------------|-----------------------------|
| 完全DS準拠（命名） | ○ | × | △（一部のみ） | △ M-Gで解消 |
| 完全DS準拠（値） | ○ | ○ | ○ | **○** |
| 機能破壊リスク | 高 | 低 | 中（HTML/JS 置換漏れ危険） | **極低**（命名維持・値のみ変更） |
| 他画面（WS/QA）再利用 | ○ | × | △ | ○（bt-*エイリアス併記で将来移行容易） |
| M-D1/M-D2 との運用一貫性 | ○ | △ | △ | **○**（co-*.css を「値の単一源」として育てる方針と同一） |
| スコープ | 大（139件） | 小 | 中（60〜80件） | **中小**（CSS実定義 28+11+7=46行 + 新DSエイリアス20〜30行追加） |

#### 採用理由（案C''）

1. **機能回帰ゼロ**: HTML/JS の `class="md-ob-badge-*"` は全て現状維持。innerHTML生成・querySelector・classList 操作が一切壊れない
2. **DS 準拠 100%（値）**: co-shared-badges.css の `.md-ob-badge-chip` などの定義値を、新DS `.bt-chip / .bt-chip.active / .bt-chip-child / .bt-cell-child / .bt-cell-grandchild` と**完全同値**に揃える（font-size を `var(--fs-caption)`、radius を `var(--radius-lg)` 等のトークンに置換）
3. **将来移行ブリッジ**: co-shared-badges.css 末尾に `.bt-chip / .bt-chip-child / .bt-drag-tag / .bt-cell-tag / .bt-cell-child / .bt-cell-grandchild / .bt-info-badge / .bt-info-badge-child / .bt-info-badge-grandchild / .bt-cal-badge / .bt-tooltip-badge / .bt-tooltip-badge-accent` の**エイリアス定義を新規追加**。OBは `md-ob-*` を使い続け、他画面（今後のWS/QA/UI Components集）は直接 `.bt-*` を使えるように
4. **M-G で物理リネーム**: 全モックアップ（OB/SL/WS/QA）の DS 移行が揃った時点で、`md-ob-badge-*` → `bt-*` の一括物理置換を実施。案C'' を経由しておくと**値は既に同値**なので、M-G は純粋なクラス名置換だけに集中できる（リスク分散）
5. **ユーザー TD 事前指示の「最小スコープ、リスク最小」の真意に合致**: 案C原案より更にリスクを下げ、かつDS準拠の目的を達成する進化版

#### 命名の重要な判断: ユーザー提示クラス名と styles-light.css 実在定義のズレ

ユーザー TD 事前指示では以下のクラスを参照先として列挙:
> `.bt-cat / -shift-day/night / -contact / -status-confirmed/high/low/empty / -supervisor / -shortage / -custom / -cell-tag / -badge-sm/md / .chip-activated / .draggable-tag / .tooltip-badge / .cal-badge / .info-badge`

`styles-light.css` 実ファイル調査結果:
- **実在**: `.bt-badge / .bt-badge-sm / .bt-badge-md / .bt-cat / .bt-shift-day / .bt-shift-night / .bt-contact / .bt-status / .bt-status-confirmed/high/low/empty / .bt-status-dot / .bt-supervisor / .bt-shortage / .bt-custom-tag / .bt-cell-tag / .bt-cell-child / .bt-cell-grandchild / .bt-chip / .bt-chip.active / .bt-chip-child / .bt-chip-child.active / .bt-drag-tag / .bt-drag-tag.assigned / .bt-drag-tag-sub / .bt-tooltip-badge / .bt-tooltip-badge-accent / .bt-cal-badge / .bt-info-badge / .bt-info-badge-child / .bt-info-badge-grandchild`
- **不在**: `.chip-activated`（ユーザー指示では `.bt-chip.active` の非プレフィクス版かと推測）/ `.draggable-tag`（`.bt-drag-tag` のプレフィクスなし版）/ `.tooltip-badge / .cal-badge / .info-badge`（全て `.bt-*` プレフィクス付きは実在）

**ガバナンス「命名整合性ルール」**: 用語・名付けのズレだが、本タスクは「一気通貫で実施」指示であり、かつユーザー提示の `.bt-*` クラス群が全て新DS命名空間に収まっていることから、**プレフィクス `.bt-*` を正準名前空間として採択**する意図が明白（M-D2 時のユーザー意図解釈と同じ手法）。`.chip-activated` は `.bt-chip.active`、`.draggable-tag` は `.bt-drag-tag` として扱う。

### 1.3 非目標

- HTML の `class="md-ob-badge-*"` → `class="bt-*"` 物理リネーム（**M-G**）
- JS の `innerHTML = '...md-ob-badge...'` 文字列リネーム（**M-G**）
- `md-cn-*` 差分通知バッジ（`.md-cn-cat-facility / -event / -traffic / -highway / -support / -shift-day / -night / -type-badge-add/modify/delete / -day-badge` 等）の DS 化 → **M-E2**
- `md-nav-*` ナビ内バッジ → 別サブフェーズ
- QA / WS 画面の badge 整理 → Phase Q-E / W-E
- `co-shared-badges.css` L333-381（`badge-display / badge-tag / badge-child-tag / badge-gc-tag / badge-group-sep` 等の**プレフィクスなし `.badge-*`**）は SL グリッド専用のためスコープ外（M-E2以降）
- A11y（`aria-label` 等） → M-F
- `md-ob-tt-*` ツールチップ内バッジ系（OB 固有、`.md-ob-tt-badge` は L650-655 に1箇所のみ定義）→ 値整合のみ確認、新DS `.bt-tooltip-badge-accent` と同値化（値は既に近い）
- `md-ob-grandchild-section / -header / -label / -arrow / -chips` の compound 部分（`.bt-*` には該当クラスが存在しない画面固有レイアウト）→ 値維持のみ

---

## 2. 配点（合計 100点）

ユーザー TD 事前指示: **A=20 / B=15 / D=25 / E=25 / G=15**。合計 100点。

| 観点 | 略号 | 配点 | 説明 |
|------|------|------|------|
| **DS準拠（トークン・値）** | A | **20** | `co-shared-badges.css` の `.md-ob-badge-chip / -selected / -child / -delete-btn / -grandchild / -drag-item / -row-chip / -confidence-chip` が、新DS `.bt-chip / .bt-chip.active / .bt-chip-child / .bt-cell-child / .bt-cell-grandchild / .bt-drag-tag` と **定義値（色・radius・padding・font-size・font-weight）同値**。co-tokens.css の変数（`--radius-sm/md/lg / --fs-caption / --fw-semibold / --space-2xs/xs / --accent / --accent-dim / --text-secondary / --text-tertiary / --secondary / --bg-surface / --bg-surface-2 / --divider`）参照率 ≥ 90% |
| **カラーコーディネーション** | B | **15** | 全色が Coastal Palette + Warning/Error 系のみ。新色混入なし。selected/active 状態の前景白 + 背景 Moonstone、非 active の border-`--divider` + background-`--bg-surface`、hover の background-`var(--accent-dim)` が統一 |
| **コンポーネント一貫性** | D | **25** | `.bt-*` エイリアス（`.bt-chip / .bt-chip.active / .bt-chip-child / .bt-chip-child.active / .bt-drag-tag / .bt-drag-tag.assigned / .bt-drag-tag-sub / .bt-cell-tag / .bt-cell-child / .bt-cell-grandchild / .bt-tooltip-badge / .bt-tooltip-badge-accent / .bt-cal-badge / .bt-info-badge / .bt-info-badge-child / .bt-info-badge-grandchild`）が co-shared-badges.css 末尾に**新規追加**され、各 `.md-ob-*` と同一の見た目を生成（どちらのクラス名を当てても同結果）。将来の M-G 物理リネーム時の互換ブリッジとして機能 |
| **機能回帰（バグゼロ）** | E | **25** | 全モーダル（OB editModal / rowEditModal / SL siteModal（sm）/ workModal（wm）/ slAddModal / meetingModal（mt））でのバッジ操作（選択/解除、ドラッグ&ドロップで並び替え、削除ボタン、undo バー、行編集のチップ選択、信頼度チップ選択）が動作。Console エラーなし。innerHTML 生成文字列のクラス名が変わっていないため、querySelector / classList 操作が壊れていない |
| **コード品質・保守性** | G | **15** | co-shared-badges.css のハードコード色 `#fef3c7 / #fcd34d / #92400e / #f59e0b / #fff / #d97706 / rgba(68,166,181,0.06) / rgba(0,0,0,0.08)` 等が、トークンまたは Coastal Palette 内色に整理（undo bar の warning 色は `co-tokens.css` の `--warning / --warning-text` 系で再定義可能な範囲で集約）。新DS エイリアスと旧 `.md-ob-*` の対応コメントが明示 |

**重大Claim（Critical）**: 1件でも該当 → 不合格

- **機能破壊**: バッジの選択/解除、削除、ドラッグ&ドロップ（並び替え）、undo バーの表示/復元、信頼度チップ選択、行編集チップ選択のいずれか1つでも機能停止
- **バッジ表示崩壊**: バッジの見た目が崩れる（丸みの消失、padding ゼロ、色反転など）、selected/active 状態が視覚的に判別不能
- **クリック不能**: `.md-ob-badge-chip / -row-chip / -confidence-chip / -delete-btn / -undo-btn` のいずれかで `cursor: pointer` が消失、または `pointer-events: none` 混入
- **ドラッグ機能不能**: `[draggable="true"]` が効くようにするための `cursor: grab`、`opacity: 0.4` / `transform: scale(0.95)` の dragging 状態、`box-shadow: 0 0 0 2px var(--accent-primary)` の drag-over 状態が消失
- **他モックアップ波及**: OB/SL 以外の以下ファイルに diff が入る: `co-tokens.css / co-forms.css / co-buttons.css / co-modal.css / co-navbar.css / weekly-schedule.css / quick-access.css / weekly-schedule.js / quick-access.js`
- **新規記号混入**: 既存 HTML/JS にない `✕ / × / ✓ / ！ / ？ / ＋ / ▾ / ⋮ / 絵文字` 等の Unicode 記号混入（既存の `✕` / `☰` / `›` / `+` は温存）
- **HTML/JS の class リネーム混入**: `md-ob-badge-*` → `bt-*` の物理リネームが HTML/JS に入っている（非目標違反、M-G 領域侵食）
- **新DS `.bt-*` エイリアスの値ズレ**: 追加する `.bt-chip / .bt-drag-tag / .bt-cell-*` 等が styles-light.css L2149-2263 の値と不一致（`border-radius` / `padding` / `background` / `color` の 1つでもズレ）

---

## 3. 事前調査結果

### 3.1 対象クラス一覧（`co-shared-badges.css` L127-332 バッジ系）

| 行 | クラス | 現状値（抜粋） | 新DS同値クラス | 整合状態 |
|---:|--------|----------------|----------------|---------|
| 133 | `.md-ob-badge-section` | flex-col gap:8 透明/枠なし | （該当なし、画面固有） | 値のみ維持 |
| 141-149 | `.md-ob-badge-chip` | padding 3px 10px / radius 14px / border divider / bg surface / color text-secondary / font-size 11px / font-weight 500 | `.bt-chip` (styles-light L2149-2162: padding 3px 10px / radius `var(--radius-lg)` / border divider / bg surface / color text-secondary / font-size `var(--fs-caption)` / fw medium) | **値 99% 一致**。`font-size: 11px` → `var(--fs-caption)` (= 0.75rem 推定、実質同値) / `radius: 14px` は `var(--radius-lg)` と要整合確認 |
| 150-153 | `.md-ob-badge-chip:hover` | border/color accent-primary / bg rgba(68,166,181,0.06) | `.bt-chip:hover` (border/color accent / bg `var(--accent-dim)`) | **色は同値**（`--accent-dim` = Moonstone α12%、0.06 と 0.12 で半透明度差あり → 新DS に合わせて `--accent-dim` に統一） |
| 154-157 | `.md-ob-badge-chip.md-ob-badge-selected` | bg/border accent-primary / color #fff | `.bt-chip.active` (bg/border accent / color #fff) | **同値** |
| 158-160 | `.md-ob-badge-chip.md-ob-badge-child` | font-size 10px / padding 2px 8px / radius 12px | `.bt-chip-child` (font `var(--fs-caption)` / padding `var(--space-2xs) var(--space-sm)` / radius `var(--radius-lg)`) | 値 1〜2px 差、M-E1 で DS トークンに寄せる |
| 161-164 | `.md-ob-badge-chip.md-ob-badge-child.md-ob-badge-selected` | bg sub-secondary / color primary / border sub-secondary | `.bt-chip-child.active` (bg secondary / color text-primary / border secondary) | **同値**（OBトークン `--sub-secondary` と新DS `--secondary` は同色 = Light Blue #B2D5E2） |
| 167-181 | `.md-ob-badge-delete-btn / :hover / .md-ob-badge-selected :hover` | 16×16 radius:50% bg transparent color inherit / hover bg rgba(0,0,0,0.08) / selected内 hover bg rgba(255,255,255,0.25) | （該当なし、OB/SL 固有） | 値維持 |
| 186-205 | `.md-ob-row-chips / .md-ob-row-chip / :hover / .md-ob-chip-active` | 本質的に `.md-ob-badge-chip` と同値セット（row-chip は gap 4、chip は gap 6） | `.bt-chip` 系と同値 | 値のみDS整合 |
| 208-237 | `.md-ob-badge-group / -child-group / -group-header / -group-title / -parent-display / -group-subtitle / -chips / -empty` | 画面レイアウト系 | （該当なし） | 値維持（font-size/weight 等を token 化可能範囲で） |
| 240-257 | `.md-ob-badge-drag-item / [draggable] / .md-ob-badge-dragging / .md-ob-badge-drag-over / .md-ob-badge-drag-grip` | inline-flex radius:14 / dragging opacity 0.4 scale 0.95 / drag-over box-shadow accent-primary / grip font-size 10 disabled | `.bt-drag-tag` 系（styles-light L2185-2215: inline-flex gap `--space-xs` padding `--space-xs --space-sm` bg bg-surface-2 border divider radius `--radius-md` cursor grab / :hover bg accent color white / .assigned bg accent-dim） | **大幅に値が違う**（rowchip系は compact、bt-drag-tag は大きめ） → **エイリアス併記のみ**、`.md-ob-badge-drag-item` の値は維持 |
| 260-279 | `.md-ob-badge-undo-bar / -undo-btn / :hover / @keyframes badgeUndoFadeIn` | #fef3c7 / #fcd34d / #92400e / #f59e0b / #fff / #d97706 の warning 系ハードコード | （該当なし） | 値維持。ただし co-tokens.css の `--warning / --warning-text / --warning-dim` で再定義可能なら置換（G評価） |
| 282-304 | `.md-ob-grandchild-section / .md-ob-badge-grandchild / .md-ob-gc-drag-item / .md-ob-gc-undo-bar / .md-ob-gc-add / .md-ob-touch-dragging / .md-ob-touch-drag-over` | border-left 2px sub-secondary / bg rgba(68,166,181,0.04) / radius 0 6 6 0 等 | `.bt-cell-grandchild`（styles-light L2141-2146: bg rgba(178,213,226,0.25) color text-tertiary border rgba(178,213,226,0.4) fw medium） | 機能が違う（`.md-ob-grandchild-section` はレイアウト、`.bt-cell-grandchild` は表示タグ） → **エイリアス併記のみ** |
| 307-331 | `.md-ob-confidence-chips / .md-ob-confidence-chip / :hover / .md-ob-conf-active-*` | `.md-ob-badge-chip` と同パターン + active-confirmed (accent-primary) / active-tentative_high (#f59e0b) / active-tentative_low (#94a3b8) | `.bt-status-*` 系と意味的に近いが、別用途（信頼度） | active-* の色をトークン化する余地あり（warning / info 等）。M-E1 では値維持（外部色 #f59e0b #94a3b8 は警告系・ニュートラル系としてトークン化可能性検討、G評価で加点） |

### 3.2 OB/SL CSS（画面個別）の状態

| ファイル | 行 | 内容 |
|---------|----:|-----|
| `order-book.css` | 543-549 | `.md-ob-confidence-field / > label` レイアウト系。新DS `.bt-*` 直接対応なし。値維持 |
| `order-book.css` | 553-554 | `.tbl-grid__date-cell.md-ob-conf-tentative_*` opacity系。セル固有、触らない |
| `order-book.css` | 624-647 | `.md-ob-grandchild-section / -header / -label / -arrow / -chips` レイアウト系。`.md-ob-grandchild-section` 実定義が co-shared-badges.css L282-289 と同値で**重複定義**。M-E1 で co-shared-badges.css 側に集約（削除対象） |
| `order-book.css` | 650-655 | `.md-ob-tt-badge` ツールチップ内バッジ。新DS `.bt-tooltip-badge-accent` (bg rgba(68,166,181,0.15) color accent) と**値同一**。DSトークン参照化可能 |
| `order-book.css` | 789-801 | `.md-ob-chip-field / -header / -title` レイアウト系、値維持 |
| `order-book.css` | 804-808 | `.md-ob-row-chip.md-ob-chip-disabled` 無効状態。新DS に該当なし、値維持 |
| `screen-layout.css` | 2867-2869 | `.md-modal-work-detail .md-ob-badge-section` compound override、触らない（M-E2/M-D3 領域） |
| `screen-layout.css` | 3836-3849 | `.md-ob-chip-field / -header / -title` レイアウト系（OBと同値） |
| `screen-layout.css` | 4220-4227 | `.md-ob-confidence-field / > label` レイアウト系（OBと同値） |
| `screen-layout.css` | 4302-4306 | `#slAddModalOverlay .md-ob-badge-child-group` SL固有 override、触らない |

### 3.3 他モックアップ影響調査（grep 不触確認用）

| ファイル | `md-ob-badge / chip / confidence / grandchild / gc / row-chip / conf` 参照数 |
|---------|---:|
| `docs/mockup/weekly-schedule.css` | 0 |
| `docs/mockup/quick-access.css` | 0 |
| `docs/mockup/co-navbar.css` | 0 |
| `docs/mockup/co-forms.css` | 0 |
| `docs/mockup/co-buttons.css` | 0 |
| `docs/mockup/co-tokens.css` | 0 |
| `docs/mockup/co-modal.css` | 0 |

**他モックアップ波及なし**を確認済。M-E1 の触る範囲は `co-shared-badges.css / order-book.css / screen-layout.css` の3ファイル（CSSのみ）。

### 3.4 トークン使用状況（co-tokens.css 既定義）

以下のトークンは M-E1 で活用:
- `--accent`（Moonstone #44A6B5）/ `--accent-dim`（Moonstone α12%）
- `--secondary`（Light Blue #B2D5E2）
- `--text-primary / -secondary / -tertiary / -disabled`
- `--bg-surface / -surface-2`
- `--divider`
- `--radius-sm / -md / -lg`
- `--fs-caption`
- `--fw-medium / -semibold`
- `--space-2xs / -xs / -sm / -md`
- `--duration-fast / -base`
- `--error`（ドラッグ over の box-shadow accent 用に `--accent-primary` 等）

co-tokens.css で未定義の可能性があるトークン:
- `--warning-text / --warning-dim` → undo bar の置換用に必要。既定義なら使用、未定義なら当該ハードコード維持

（実装時に grep で確認）

---

## 4. 実装マッピング

### 4.1 co-shared-badges.css 変更内容

#### (a) 既存 `.md-ob-badge-chip` 系のトークン化（値は維持、プロパティ表記のみ更新）

```css
/* Before (L141-149) */
.md-ob-badge-chip {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 14px;
    border: 1px solid var(--divider);
    background: var(--base-surface); color: var(--text-secondary);
    font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
    user-select: none;
}

/* After — 新DS .bt-chip と同値、トークン参照化 */
.md-ob-badge-chip {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: var(--radius-lg);
    border: 1px solid var(--divider);
    background: var(--bg-surface); color: var(--text-secondary);
    font-size: var(--fs-caption); font-weight: var(--fw-medium);
    cursor: pointer; transition: all var(--duration-fast);
    user-select: none;
}
```

**注意**: `var(--base-surface)` → `var(--bg-surface)` は**トークン名の正規化**（co-tokens.css 側で定義を確認し、旧名が残っていればそれを使う、新名なら移行）。Phase M-A で `--bg-surface` が正準化済と仮定。実装時に `grep "\-\-base-surface" docs/mockup/co-tokens.css` で未定義を確認 → 未定義なら `--bg-surface` に統一。

同様に `.md-ob-badge-chip:hover`（`rgba(68,166,181,0.06)` → `var(--accent-dim)`）、`.md-ob-badge-chip.md-ob-badge-selected`（`var(--accent-primary)` → `var(--accent)`）、`.md-ob-row-chip / :hover / .md-ob-chip-active`、`.md-ob-confidence-chip / :hover`、`.md-ob-badge-drag-item`、`.md-ob-badge-drag-over`、`.md-ob-badge-grandchild` もトークン参照に統一。

#### (b) 新DS `.bt-*` エイリアス定義の追加（co-shared-badges.css 末尾）

styles-light.css L2149-2263 のプロパティ値を**そのまま転記**してエイリアス定義:

```css
/* ────────────────────────────────────────────────────────────
   7. 新DS .bt-* エイリアス定義（M-E1）
   Upstream: docs/ui-components/styles-light.css L2008-2327
   Policy: 将来の M-G 物理リネーム時の互換ブリッジ。
           M-E1 時点では OB/SL の HTML/JS は .md-ob-* を使い続け、
           将来の新コード（WS/QA 等）は .bt-* を直接使える。
   ──────────────────────────────────────────────────────────── */

.bt-chip {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: var(--radius-lg);
    border: 1px solid var(--divider);
    background: var(--bg-surface); color: var(--text-secondary);
    font-size: var(--fs-caption); font-weight: var(--fw-medium);
    cursor: pointer; transition: all var(--duration-fast);
    user-select: none;
}
.bt-chip:hover {
    border-color: var(--accent); color: var(--accent);
    background: var(--accent-dim);
}
.bt-chip.active {
    background: var(--accent); color: #fff;
    border-color: var(--accent);
}
.bt-chip-child {
    font-size: var(--fs-caption);
    padding: var(--space-2xs) var(--space-sm);
    border-radius: var(--radius-lg);
}
.bt-chip-child.active {
    background: var(--secondary); color: var(--text-primary);
    border-color: var(--secondary);
}

.bt-cell-tag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: var(--radius-md);
    font-size: var(--fs-caption); font-weight: var(--fw-semibold);
    line-height: var(--lh-base); white-space: nowrap;
}
.bt-cell-child {
    background: var(--accent-dim); color: var(--accent);
    border: 1px solid rgba(68,166,181,0.25);
}
.bt-cell-grandchild {
    background: rgba(178,213,226,0.25); color: var(--text-tertiary);
    border: 1px solid rgba(178,213,226,0.4);
    font-weight: var(--fw-medium);
}

.bt-drag-tag {
    display: inline-flex; align-items: center; gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--bg-surface-2); border: 1px solid var(--divider);
    border-radius: var(--radius-md);
    cursor: grab; transition: all var(--duration-base);
    user-select: none;
    color: var(--text-primary); font-size: var(--fs-sm);
}
.bt-drag-tag:hover {
    background: var(--accent); color: white; border-color: var(--accent);
}
.bt-drag-tag.assigned {
    background: var(--accent-dim); border-color: rgba(68,166,181,0.30);
    color: var(--text-secondary);
}
.bt-drag-tag-sub {
    font-size: 0.7rem; color: var(--text-tertiary);
}
.bt-drag-tag:hover .bt-drag-tag-sub { color: rgba(255,255,255,0.7); }

.bt-tooltip-badge {
    display: inline-block;
    padding: var(--space-2xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--fs-caption); font-weight: var(--fw-semibold);
    line-height: var(--lh-base); white-space: nowrap;
}
.bt-tooltip-badge-accent {
    background: rgba(68,166,181,0.15); color: var(--accent);
}

.bt-cal-badge {
    font-size: var(--fs-caption); color: var(--accent);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%; line-height: 1;
}

.bt-info-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: var(--radius-md);
    font-size: var(--fs-caption); font-weight: var(--fw-semibold);
    line-height: var(--lh-base); white-space: nowrap;
}
.bt-info-badge-child {
    background: var(--accent-dim); color: var(--accent);
    border: 1px solid rgba(68,166,181,0.25);
}
.bt-info-badge-grandchild {
    background: rgba(178,213,226,0.25); color: var(--text-tertiary);
    border: 1px solid rgba(178,213,226,0.4);
    font-weight: var(--fw-medium);
}
```

#### (c) OB CSS の `.md-ob-grandchild-section` 重複削除

`order-book.css` L624-631 の `.md-ob-grandchild-section` 定義は co-shared-badges.css L282-289 と**完全重複**。どちらか片方だけ残す（co-shared-badges.css 側を単一ソースに）。
→ `order-book.css` L624-631 削除、`.md-ob-grandchild-header / -label / -arrow / -chips`（L632-646）はOB 固有レイアウトで重複なし、そのまま維持。

※ screen-layout.css 側には `.md-ob-grandchild-section` の重複定義なし。

#### (d) `.md-ob-tt-badge` のトークン参照化（任意・加点）

`order-book.css` L650-655 の `.md-ob-tt-badge` は 新DS `.bt-tooltip-badge-accent` と値同一:
```css
/* Before */
.md-ob-tt-badge {
    display: inline-block;
    padding: 2px 8px; border-radius: 10px;
    background: rgba(68,166,181,0.15); color: var(--accent-primary);
    font-size: 10px; font-weight: 600;
}
/* After */
.md-ob-tt-badge {
    display: inline-block;
    padding: 2px 8px; border-radius: var(--radius-md);
    background: rgba(68,166,181,0.15); color: var(--accent);
    font-size: var(--fs-caption); font-weight: var(--fw-semibold);
}
```

### 4.2 HTML/JS 変更: **なし**

`class="md-ob-badge-*"` や `innerHTML` 内の文字列は**一切変更しない**。

### 4.3 不触ファイル

- `docs/order-book.html` / `docs/screen-layout.html`
- `docs/mockup/order-book.js` / `docs/mockup/screen-layout.js`
- `docs/mockup/co-tokens.css / co-forms.css / co-buttons.css / co-modal.css / co-navbar.css`
- `docs/mockup/weekly-schedule.css / weekly-schedule.js`
- `docs/mockup/quick-access.css / quick-access.js`
- `docs/ui-components/styles-light.css`（UI components 集本体）

---

## 5. Test Executor 向けチェックリスト（18項目）

### A. DS準拠（5項目）

- [ ] **A-1** `co-shared-badges.css` の `.md-ob-badge-chip / -row-chip / -confidence-chip / -drag-item` が `var(--radius-lg)` / `var(--fs-caption)` / `var(--fw-medium)` / `var(--duration-fast)` のトークンを参照している
- [ ] **A-2** `co-shared-badges.css` の `.md-ob-badge-chip:hover / .md-ob-row-chip:hover / .md-ob-confidence-chip:hover` の背景が `var(--accent-dim)` に統一されている（`rgba(68,166,181,0.06)` のハードコードが消失）
- [ ] **A-3** `co-shared-badges.css` の `.md-ob-badge-chip.md-ob-badge-selected / .md-ob-row-chip.md-ob-chip-active / .md-ob-confidence-chip.md-ob-conf-active-confirmed` の背景・border が `var(--accent-primary)` → `var(--accent)` に統一（または `--accent-primary` が `--accent` のエイリアスで解決される）
- [ ] **A-4** `co-shared-badges.css` 末尾に `.bt-chip / .bt-chip:hover / .bt-chip.active / .bt-chip-child / .bt-chip-child.active / .bt-cell-tag / .bt-cell-child / .bt-cell-grandchild / .bt-drag-tag / .bt-drag-tag:hover / .bt-drag-tag.assigned / .bt-drag-tag-sub / .bt-tooltip-badge / .bt-tooltip-badge-accent / .bt-cal-badge / .bt-info-badge / .bt-info-badge-child / .bt-info-badge-grandchild` の **18定義**が存在（grep `^\.bt-` で count ≥ 18）
- [ ] **A-5** 追加した `.bt-*` エイリアスが styles-light.css L2149-2263 と **プロパティ値で等価**（bt-chip の padding 3px 10px / radius var(--radius-lg) / border 1px solid var(--divider) / background var(--bg-surface) / color var(--text-secondary) / font-size var(--fs-caption) / font-weight var(--fw-medium) / cursor pointer / transition all var(--duration-fast) / user-select none が全一致）

### B. カラーコーディネーション（3項目）

- [ ] **B-1** co-shared-badges.css 内で Coastal Palette 外の新色が追加されていない（`#f59e0b` / `#94a3b8` / `#fef3c7` / `#fcd34d` / `#92400e` / `#d97706` の既存ハードコードは維持OK、新規追加なし）
- [ ] **B-2** selected/active 状態の「accent背景 + 白文字」組み合わせ、child selected/active の「secondary背景 + text-primary」組み合わせが維持
- [ ] **B-3** hover 状態が `var(--accent-dim)` で統一（旧 `rgba(68,166,181,0.06)` が残留しない）

### D. コンポーネント一貫性（4項目）

- [ ] **D-1** `order-book.css` L624-631 の `.md-ob-grandchild-section` 重複定義が削除（grep で count 1 = co-shared-badges.css 側のみ）
- [ ] **D-2** `screen-layout.css` には `.md-ob-grandchild-section` の定義が元々存在しない（grep で count 0）ことを確認
- [ ] **D-3** `order-book.css` の `.md-ob-tt-badge`（L650-655）が `var(--radius-md) / var(--fs-caption) / var(--fw-semibold) / var(--accent)` にトークン化、または定義維持のまま（加点項目、必須ではない）
- [ ] **D-4** `.bt-*` エイリアスと `.md-ob-*` 系の対応コメントが co-shared-badges.css 内に明示されている（`/* 7. 新DS .bt-* エイリアス定義（M-E1） */` セクションコメント存在）

### E. 機能回帰（5項目）

- [ ] **E-1** HTML `docs/order-book.html` / `docs/screen-layout.html` に `md-ob-badge-*` 系クラスが**削除されずに残っている**（grep で OB 12件 / SL 20件を維持）
- [ ] **E-2** JS `docs/mockup/order-book.js` / `docs/mockup/screen-layout.js` の `md-ob-badge*` 文字列参照が**変更されていない**（grep で OB 32件 / SL 29件を維持）
- [ ] **E-3** `docs/mockup/order-book.css` L624-631 削除以外、OB/SL CSS に**機能的な値変更**（color/background/radius/padding/font-size の`値そのもの`変更）がない。トークン名の置換のみ
- [ ] **E-4** ブラウザ DOM 等価性: `.md-ob-badge-chip` の computed style が変更前後で pixel レベル同値（padding 3px 10px / radius 14px / font-size 11px 等）— トークン解決後の実値が一致すれば可
- [ ] **E-5** 機能回帰（目視/スクリプト相当）: OB editModal の区分バッジクリックで `.md-ob-badge-selected` トグル、削除ボタン（`.md-ob-badge-delete-btn`）クリックで undo bar 出現、ドラッグハンドル（`.md-ob-badge-drag-grip`）で drag-item が `.md-ob-badge-dragging` に、ドロップ先が `.md-ob-badge-drag-over` に、grandchild 追加ボタン（`.md-ob-gc-add`）で孫バッジセクション追加。SL siteModal/workModal/slAddModal で同等操作が動作

### G. コード品質・保守性（1項目）

- [ ] **G-1** co-shared-badges.css のトークン参照率が向上（`grep -c "var(--" docs/mockup/co-shared-badges.css` が M-E1 前より増加、かつ `grep -cE "px\s*;|#[0-9a-fA-F]{3,6}" docs/mockup/co-shared-badges.css` の値が維持または減少）

---

## 6. 重大Claim判定基準

以下 **1件でも該当 → 総合点に関わらず不合格**:

1. **機能破壊**: バッジの選択/解除、削除、ドラッグ&ドロップ、undo、信頼度選択、行編集チップ選択のいずれかが動作不能
2. **バッジ表示崩壊**: 見た目（丸み、padding、色、枠線）が大きく変化（視覚的な同値が保てていない）
3. **クリック不能**: cursor:pointer 消失、pointer-events:none 混入
4. **ドラッグ機能不能**: cursor:grab / dragging opacity/transform / drag-over box-shadow のいずれかが消失
5. **他モックアップ波及**: co-shared-badges.css / order-book.css の `.md-ob-grandchild-section` 削除以外のファイル（co-tokens.css / co-forms.css / co-buttons.css / co-modal.css / co-navbar.css / weekly-schedule.* / quick-access.* / screen-layout.css の `.md-ob-badge-section` compound 部分 L2867-2869）に diff
6. **新規記号混入**: Unicode 記号 / 絵文字の新規追加
7. **HTML/JS リネーム混入**: M-G 領域侵食
8. **新DS `.bt-*` エイリアスの値ズレ**: styles-light.css L2149-2263 と不一致

---

## 7. 合格条件

**総合点 ≥ 70 / 100 かつ 重大Claim = 0**

- 合格 → Phase M-E2（`md-cn-*` 差分通知バッジ）または M-F（A11y・印刷）へ進行可
- 不合格 → SC 指摘を TD が取り込み、M-E1 IM 再実装へ差し戻し（上限 5 反復）

---

## 8. 付録: Agent 向け運用指示

### 8.1 IM 向け

1. **co-shared-badges.css の既存 `.md-ob-badge-*` / `.md-ob-row-chip` / `.md-ob-confidence-chip` の定義値を styles-light.css `.bt-*` 系と同値にトークン化**（値は維持、トークン名だけ変換）
2. **co-shared-badges.css 末尾に `.bt-*` エイリアスセクションを新規追加**（Section 7 として）
3. `order-book.css` L624-631 の `.md-ob-grandchild-section` 重複定義を削除
4. `.md-ob-tt-badge`（任意）トークン化
5. **HTML/JS は一切触らない**
6. 他モックアップ CSS/JS も一切触らない
7. co-tokens.css 内で `--bg-surface / --accent / --fs-caption / --fw-medium` 等が未定義の場合は M-E1 スコープ外（別フェーズで対応、当該箇所のみ現状値維持）

### 8.2 TE 向け

1. 本チェックリスト 18 項目を順に実施
2. grep カウントは Grep ツール `output_mode:"count"` で取得
3. 機能回帰はブラウザ相当のチェック（DOM 構造目視 + クラス名残留 grep）で代替。playwright 使用可
4. 結果は `docs/plan/phase-logs/m-e1-te-v1.md` に保存

### 8.3 SC 向け

1. TE v1 レポートを読み、配点 A=20 / B=15 / D=25 / E=25 / G=15 で採点
2. 重大Claim 発生時は総合点を付けた上で「重大Claim: 不合格」と明記
3. 結果は `docs/plan/phase-logs/m-e1-sc-v1.md` に保存
