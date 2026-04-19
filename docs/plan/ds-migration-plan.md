# 新デザインシステム移行計画書（DS Migration Plan）

- 作成日: 2026-04-18
- 正となるDS: `docs/ui-components/index-light.html` + `styles-light.css` + `tokens.json`（Phase D1〜D13、v1.2.0）
- 対象: `docs/mockup/` 配下の全モックアップ（order-book / weekly-schedule / quick-access / screen-layout）および共有 `co-*.css`
- 目的: 色・フォント・スペーシング・角丸・影・フォーム・テーブル・コンポーネントを新DSに完全準拠させ、4画面で表記揺れを排除する

---

## Part 1 — 新デザインシステムで適用すべき内容

### 1.1 デザイントークン（CSS変数の Single Source of Truth）

#### A. カラー（Coastal Palette）

| 旧変数（mockup側）                | 新DS変数                       | 値         | 用途                                   |
|----------------------------------|-------------------------------|-----------|---------------------------------------|
| `--base-page`                    | `--bg-page`                   | `#E9F1F6` | ページ背景                            |
| `--base-surface`                 | `--bg-surface`                | `#FFFFFF` | カード・モーダル・入力欄              |
| `--base-surface-alt`             | `--bg-surface-2`              | `#F0EDE9` | 補助背景（フォーム帯・サブカード）    |
| `--base-muted`                   | `--bg-surface-3`              | `#D3D0C8` | 合計行・強調背景                      |
| `--sub-primary`                  | `--bg-sidebar`                | `#004554` | サイドバー・モーダルヘッダ            |
| `--sub-secondary`                | `--divider`                   | `#B2D5E2` | 罫線・区切り                          |
| `--accent-primary`               | `--accent-primary`            | `#44A6B5` | プライマリアクション                  |
| `--accent-light`                 | `--accent-primary-light`      | `#5AB8C6` | ホバー・ハイライト                    |
| `--accent-dim`                   | `--accent-primary-dim`        | `rgba(68,166,181,.12)` | セル選択・Row Hover      |
| —                                | `--accent-secondary`          | `#E07856` | **第2アクセント（新規・D5.1）**       |
| —                                | `--accent-secondary-light`    | `#EA9980` |                                       |
| —                                | `--accent-secondary-dim`      | `rgba(224,120,86,.12)` | 編集中行（is-editing）    |
| `--text-primary`                 | `--text-primary`              | `#004554` | 本文                                  |
| `--text-secondary`               | `--text-secondary`            | `#2A6B7A` | 補足                                  |
| `--text-tertiary` ⚠              | `--text-tertiary`             | `#5A8896` | **D6.1でAA準拠化（#6B9AA8→#5A8896）**|
| `--text-disabled` ⚠              | `--text-disabled`             | `#8BAEB9` | **旧 #A0BCC5 → #8BAEB9**             |
| `--success`                      | `--semantic-success`          | `#38A169` |                                       |
| `--warning`                      | `--semantic-warning`          | `#D69E2E` |                                       |
| `--error`                        | `--semantic-error`            | `#DB577B` |                                       |

**カテゴリ色（D5.2 — 4色相に分化、従前は全て同色）**
- `--cat-bg-facility` / `--cat-text-facility`: teal系（#1c4d54）
- `--cat-bg-event` / `--cat-text-event`: blue-violet系（#2d3e7a）
- `--cat-bg-traffic` / `--cat-text-traffic`: warm brown系（#5a3f25）
- `--cat-bg-highway` / `--cat-text-highway`: sage green系（#1f4e31）

**Chart Palette（D5.3）**: Categorical 6色 / Sequential 5段 / Diverging ±中立

#### B. タイポグラフィ（D1.1〜D1.2）

- `--font-family-body`: `'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Segoe UI', Roboto, sans-serif`
- `--font-family-mono`: `'SF Mono', Consolas, Menlo, monospace`
- **font-feature-settings**: `"palt" 1`（和文詰め）
- **font-variant-numeric**: `tabular-nums`（数字等幅 — テーブル必須）
- サイズ7段階: `--fs-caption(11px) / --fs-sm(13px) / --fs-base(14px) / --fs-md(16px) / --fs-lg(20px) / --fs-xl(26px) / --fs-2xl(34px)`
- Weight: 400/500/600/700/800
- Line-height: `--lh-tight(1.3) / --lh-base(1.5) / --lh-loose(1.7)`

#### C. スペーシング / 角丸 / 影 / モーション

- Space: `--space-2xs(2px) / xs(4) / sm(8) / md(12) / lg(16) / xl(24) / 2xl(32) / 3xl(48)`
- Radius: `--radius-sm(4) / md(8) / lg(12) / xl(16)`
- Elevation: `--elevation-0〜5`（旧 `--shadow-sm/md/lg` は互換エイリアスで残置）
- Motion: `--duration-fast(120ms) / base(200) / slow(320)`、`--easing-out / in / in-out / spring`
- Breakpoints: `--bp-sm(640) / md(768) / lg(1024) / xl(1280) / 2xl(1536)`
- Icon size: `--icon-xs(12) ... --icon-2xl(32)`
- Z-index: `--z-dropdown(100) / sticky(200) / overlay(900) / modal(1000) / popover(1100) / tooltip(1200) / toast(2000)`
- Modal width: `--modal-sm(380) / md(480) / lg(600) / xl(800)`

#### D. 密度モード（D3）

`:root[data-density="compact|comfortable|spacious"]` 属性で一括切替。
- compact: 行高28px / `--fs-density-base: 13px`
- comfortable（既定）: 36px / 14px
- spacious: 44px / 15px

テーブル・フォーム・ボタンの高さ・パディング・フォントサイズは `--tbl-row-h / --fs-density-base` 等の密度トークン経由で参照すること。

---

### 1.2 コンポーネント適用ルール

#### A. ボタン（`.btn-*` へ統一）

| 役割         | クラス                                          |
|-------------|------------------------------------------------|
| プライマリ   | `.btn .btn-primary`                            |
| セカンダリ   | `.btn .btn-secondary`                          |
| 危険         | `.btn .btn-danger`                             |
| ゴースト     | `.btn .btn-ghost`                              |
| アウトライン | `.btn .btn-outline`                            |
| サイズ       | `.btn-sm(32px) / .btn-md(40px、既定) / .btn-lg(48px)` |
| アイコンのみ | `.btn-icon`（正方形）                          |
| ローディング | `.btn-loading`                                 |
| 全幅         | `.btn-full`                                    |
| グループ     | `.btn-group / .btn-group-split`                |

**置換対象**: `.md-ob-btn*` / `.md-ws-modal-btn*` / `.qa-modal-btn*` / `.qa-login-btn` / `.toolbar button` / `.theme-toggle-btn` → すべて `.btn-*`

#### B. フォーム（`.md-fi-*` / `.form-*`）

| 要素              | クラス                                             |
|------------------|---------------------------------------------------|
| フィールドコンテナ | `.md-fi-field`（flex column）                     |
| 行レイアウト      | `.md-fi-row`（flex row）                          |
| ラベル            | `.md-fi-label` または `.form-label`（`::after "必須"` で必須マーカー）|
| テキスト          | `.md-fi-input`                                    |
| 数値              | `.md-fi-number`                                   |
| テキストエリア    | `.md-fi-textarea`                                 |
| 時刻              | `.md-fi-time`                                     |
| セレクト          | `.md-fi-select`                                   |
| コンボボックス    | `.md-fi-combo`（`script-light.js` の Combobox 連携）|
| チェック/ラジオ   | `.md-fi-checkbox` / `.md-fi-radio`                |
| スイッチ          | `.md-fi-switch`                                   |
| ヘルプ            | `.form-help`                                      |
| 状態              | `.is-error` / `.is-warning` / `.is-success`（`aria-invalid` 併用）|
| エラーメッセージ  | `.form-error` / `.form-warning` / `.form-success`（アイコン付き）|
| 文字数カウンタ    | `.form-counter`                                   |
| サマリ            | `.form-error-summary`                             |
| テーブル内編集    | `.form-error-tooltip`                             |
| ライブリージョン  | `.form-live-region` + `.sr-only`                  |

**置換対象**: `.md-ob-form-row` / `.qa-login-field` / `.count-inline-input` / 独自 `input[type]` のベタ記述 → 上記へ

#### C. テーブル（`.tbl-*` へ統一 — Phase D2の12規約）

| 役割               | クラス                                          |
|-------------------|------------------------------------------------|
| 基本              | `.tbl`                                         |
| Sticky ヘッダ      | `.tbl--sticky-head`                            |
| Sticky 列         | `.tbl--sticky-col`                             |
| Zebra            | `.tbl--zebra`                                  |
| Hover            | `.tbl tbody tr:hover`（自動、accent-dim）      |
| 選択行            | `tr[aria-selected="true"]`                     |
| 編集中行          | `tr.is-editing`（secondary-dim）               |
| セル型            | `.tbl-cell--num / --date / --text`             |
| ソート            | `.tbl-sortable`                                |
| 合計行            | `.row--total`                                  |
| 空セル            | `.cell--empty`                                 |
| フッタ/ページング  | `.tbl-footer / .tbl-pagination`                |

**CSS Grid運用の扱い**: 受注簿・週間予定表は `<table>` ではなくCSS Gridで組まれている。**見た目・振る舞いを `.tbl-*` の規約に揃える**ため、以下の方針で対応する。
- カラム名を `--tbl-row-h`・`--tbl-cell-pad` 等の密度トークンに準拠させる
- sticky の z-index は `--z-sticky(200)` を使用（現状 10/20/30 を撤廃）
- Zebra は `.md-ob-even-row` → `.tbl--zebra` の nth-child で自動化
- 選択・Hover・編集の色はトークン経由で `.tbl` と同等にする
- クラス命名は `.tbl-grid / .tbl-grid__cell / .tbl-grid__sticky` のBEM拡張として規約化

#### D. モーダル（`.modal-*` へ統一）

| 役割       | クラス                                     |
|-----------|-------------------------------------------|
| オーバーレイ | `.modal-overlay`（z: `--z-modal(1000)`） |
| コンテナ    | `.modal` / `.modal-content`              |
| ヘッダ      | `.modal-header`                          |
| ボディ      | `.modal-body`                            |
| フッタ      | `.modal-footer`（ボタン右寄せ）          |
| 幅         | `--modal-sm/md/lg/xl` で制御             |
| 種別       | カード型優先（フラット型は統一性損失のため極力使わない）|

**置換対象**: `.md-ob-modal*` / `.md-ws-modal*` / `.qa-modal*` / `.md-nav-modal*` → `.modal-*`
（`co-navbar.css` の `.md-nav-modal*` は共通マスタモーダルとしての役割を残しつつ、内部スタイルは `.modal-*` に委譲する）

#### E. バッジ / タグ（`.bt-*` へ統一 — 13規約）

| 旧                                    | 新                                          |
|--------------------------------------|--------------------------------------------|
| `.md-cn-cat-facility/event/...`      | `.bt-cat`（+ `data-cat="facility"` 等で色分化）|
| `.md-cn-shift-day/night`             | `.bt-shift-day` / `.bt-shift-night`        |
| `.md-cn-type-badge-add/modify/delete`| `.bt-status-confirmed/high/low/empty` 相当 or 別 `.bt-diff` として新設 |
| `.md-ob-badge-chip`                  | `.chip-activated`（モーダル内選択チップ）  |
| `.md-ob-badge-drag-item`             | `.draggable-tag`                           |
| `.badge-tag / .badge-child-tag`      | `.bt-cell-tag`                             |
| `.badge-gc-tag`                      | `.bt-custom`（カスタムカラー）             |
| `.continuous-badge*`                 | `.info-badge`                              |
| `.md-cn-badge`（通知カウント）        | `.bt-status-dot` + `.bt-shortage` パターン or 新規 `.bt-notification` |

**サイズ**: `.bt-badge-sm / -md` の2段。絵文字・Unicode記号は禁止、`docs/assets/icons/` のSVGスプライトを使用。

#### F. その他のコンポーネント（追加活用）

| コンポーネント     | クラス                      | 新規適用先                              |
|------------------|----------------------------|---------------------------------------|
| トースト          | `.toast`                   | 変更通知・保存完了                     |
| アラート/バナー    | `.alert-info/warning/error`| コンフリクトバナー                     |
| ツールチップ       | `.tooltip`                 | ヘッダのヘルプ / バッジ詳細            |
| ポップオーバー     | `.popover`                 | 行追加・インライン編集                 |
| 空状態            | `.empty-state`             | 検索0件・未登録                        |
| スケルトン         | `.skeleton`                | ロード中表示                           |
| 確認ダイアログ     | `.confirm-dialog`          | 削除・保存確認                         |
| ドロワー          | `.drawer`                  | 週間予定表のサイドパネル               |
| キーボード表示     | `.kbd / .kbd-combo`        | ショートカットヘルプ                   |

---

### 1.3 アクセシビリティ・印刷・運用規約（D4/D6/D9/D10）

- **コントラスト**: 新トークンでWCAG AA（4.5:1以上）。色のみで情報を伝えない（アイコン併用）
- **`aria-*`**: `aria-invalid / aria-selected / aria-expanded / aria-live` を必須
- **スクリーンリーダー**: `.sr-only` / `.skip-link`
- **印刷**: `.no-print / .print-only / .page-break / .avoid-break`。sticky は印刷時解除
- **モーション縮減**: `@media (prefers-reduced-motion: reduce)` 対応済（触らない）
- **マイクロコピー**: 敬語は「〜します」調、エラーは定型「〜できません。◯◯を確認してください」

---

## Part 2 — モックアップ別 リファクタリング計画

### 2.0 共通方針

#### M0. CSS変数の一元化（全モックアップ共通・先行着手）
- 現状: 4モックアップで `:root` が重複定義（OB 39 / WS 118 / QA 29 / SL 106）
- 対応: `docs/mockup/co-tokens.css` を新設し、`styles-light.css` と同値の変数を単一定義。各モックアップから `<link>` で先頭参照
- 互換性: 旧名（`--base-page` 等）は `@supports` 別ブロックで **一時エイリアス** を残し、段階移行中は両方参照可能にする
- 完了条件: 各 `:root` から重複定義を削除、`--shadow-*` → `--elevation-*` エイリアスに統一

#### M1. 共有コンポーネントの更新
- `co-navbar.css`: `.md-nav-btn*` / `.md-nav-modal*` の内部を `.btn-*` / `.modal-*` へ委譲。色・角丸・影はトークン経由に
- `co-shared-badges.css`: `.md-cn-*` / `.md-ob-badge-*` / `.badge-*` を `.bt-*` 13規約へ**順次エイリアス→置換**。旧クラスは1リリース猶予後に削除

#### M2. 段階的ロールアウト（フェーズ分け）
1. **Phase M-A**: トークン統合（M0）+ 色・フォント・スペーシングの変数置換
2. **Phase M-B**: フォーム（`.md-fi-*` / `.form-*`）
3. **Phase M-C**: テーブル（`.tbl-*` 規約 + Grid拡張）
4. **Phase M-D**: ボタン・モーダル
5. **Phase M-E**: バッジ・チップ・通知
6. **Phase M-F**: アクセシビリティ整備・印刷・密度モード対応
7. **Phase M-G**: 旧クラス撤去・CHANGELOG記載

各フェーズはモックアップ1画面ごとに小PR化し、プレビュー確認 → 次画面へ。

---

### 2.1 受注簿（Order Book）リファクタ計画

**対象**: `docs/order-book.html` / `docs/mockup/order-book.css` (1870行) / `order-book.js` (4454行)

| Phase | 作業                                                                                          | 優先度 |
|-------|---------------------------------------------------------------------------------------------|-------|
| M-A   | `:root` から 39変数を co-tokens.css へ移譲。`--base-*` → `--bg-*` 等へ置換（一括置換＋エイリアス）| ★★★  |
| M-A   | `--text-tertiary: #6B9AA8` → `#5A8896`（D6.1 AA準拠）、`--text-disabled: #A0BCC5` → `#8BAEB9` | ★★★  |
| M-A   | `--shadow-*` → `--elevation-*` へ統一                                                         | ★★   |
| M-A   | フォントファミリに `'Noto Sans JP' / 'Hiragino Sans' / 'Yu Gothic UI'` 追加 + `palt` / `tabular-nums` | ★★★  |
| M-B   | `.md-ob-form-row` の label/input構造を `.md-fi-field + .md-fi-label + .md-fi-input` に置換     | ★★   |
| M-B   | フィルタドロップダウンのcheckboxを `.md-fi-checkbox` へ                                         | ★★   |
| M-B   | 数値入力（人数・金額）を `.md-fi-number` + `tabular-nums` 強制                                  | ★★   |
| M-C   | `.md-ob-grid*` を `.tbl-grid` 規約へリネーム（BEM拡張として規約化）                              | ★★★  |
| M-C   | sticky z-index (10/20/30) → `--z-sticky(200)` + sticky-col 用の派生変数に                      | ★★★  |
| M-C   | `.md-ob-sat/.md-ob-sun/.md-ob-night` を `data-day="sat/sun"` 属性セレクタへ切替                 | ★    |
| M-C   | `.md-ob-even-row` → `.tbl--zebra` の `:nth-child(even)` 自動化                                 | ★★   |
| M-C   | 合計行 → `.row--total`、空セル → `.cell--empty`                                                 | ★    |
| M-C   | 密度モード対応: `data-density` 属性でセル高さ・フォントを切替                                   | ★★   |
| M-D   | `.md-ob-btn-primary/secondary/danger` → `.btn-primary/.btn-secondary/.btn-danger`（HTMLも置換） | ★★★  |
| M-D   | `.md-ob-modal*` → `.modal-*` 統一、ヘッダ色は `--bg-sidebar`、幅は `--modal-md`                 | ★★★  |
| M-E   | `.md-ob-badge-chip/-selected/-child/-delete-btn` → `.chip-activated / .bt-cell-tag / .draggable-tag` | ★★   |
| M-F   | `aria-invalid / aria-selected / aria-live` 追加、`.sr-only` で状態アナウンス                    | ★★   |
| M-F   | 印刷CSS: `.no-print` をツールバーに、sticky を印刷時解除                                         | ★    |
| M-G   | 旧クラス（`.md-ob-*` の置換済み分）と旧変数エイリアスを削除                                      | ★★   |

**影響するJS**: `order-book.js` — クラス名を参照している箇所（`classList.add('md-ob-btn')` 等）のgrep→置換が必要。既存挙動は壊さない。

---

### 2.2 週間予定表（Weekly Schedule）リファクタ計画

**対象**: `docs/weekly-schedule.html` / `docs/mockup/weekly-schedule.css` (3304行) / `weekly-schedule.js` (5022行)

WSは**最もトークン数が多く（118）・ダークテーマが既に実装されている**ため、ダーク対応との整合を最優先で確認する。

| Phase | 作業                                                                                          | 優先度 |
|-------|---------------------------------------------------------------------------------------------|-------|
| M-A   | `:root` 118変数を co-tokens.css へ移譲。Light/Dark両テーマ定義を `index.html`（dark）の `styles.css` に合わせて統一 | ★★★  |
| M-A   | セル背景 `--cell-base-day/night` は `--bg-surface-2` と `--accent-primary-dim` 等の組み合わせに解消。独自トークン減らす | ★★   |
| M-A   | Dark時の `--accent-primary: #098698` → D6.2に合わせ `#55B5C4`（色相一致）                       | ★★★  |
| M-A   | `--shadow-medium / --shadow-strong` → `--elevation-3/5`                                       | ★★   |
| M-B   | スケジュール編集のJSインラインフォームを `.md-fi-*` で書き直し（input生成関数を共通化）            | ★★   |
| M-C   | `.md-ws-grid` を `.tbl-grid` 規約へ                                                            | ★★★  |
| M-C   | 2段 sticky ヘッダ（date + shift）の z-index を `--z-sticky` 派生で規約化                        | ★★★  |
| M-C   | `.md-ws-sat-col/.sun-col/.holiday/.night-col` を `data-day` / `data-shift="night"` 属性化       | ★★   |
| M-D   | `.md-ws-modal*` → `.modal-*`、`.md-ws-modal-btn-primary/secondary` → `.btn-*`                  | ★★★  |
| M-D   | サイドパネル（`.md-ws-sidebar`）は `.drawer` を検討（アニメ・z-index 統一）                     | ★★   |
| M-E   | アサインバッジ → `.bt-cell-tag` / `.draggable-tag`、監督ドット → `.bt-supervisor`、不足 → `.bt-shortage` | ★★   |
| M-F   | Dark時コントラスト再検証（D6の値で置換後、サンプル画面の色をチェック）                           | ★★★  |
| M-F   | 密度モード連動（行高40px固定 → `--tbl-row-h` 経由、既定 comfortable=36px に揃える是非を要判断）   | ★★   |
| M-G   | 旧クラス削除                                                                                   | ★★   |

**要確認ポイント（ユーザー判断）**:
- WSの既定セル高（40px）を新DS既定（comfortable=36px）に合わせるか、WSだけ `data-density="spacious"(44px)` を規定とするか

---

### 2.3 クイックアクセス（Quick Access）リファクタ計画

**対象**: `docs/quick-access.html` / `docs/mockup/quick-access.css` (2039行) / `quick-access.js` (2530行)

QAは**モバイル寄りのカードUI**で、テーブルを持たない。フォーム・チップ・モーダル中心。

| Phase | 作業                                                                                          | 優先度 |
|-------|---------------------------------------------------------------------------------------------|-------|
| M-A   | `:root` 29変数を co-tokens.css へ。残存 `--text-tertiary/disabled` をD6値に                    | ★★★  |
| M-A   | フォント共通化（QAは `-apple-system` 主体 → 新DSのスタックへ）                                  | ★★   |
| M-B   | `.qa-login-field` / `.qa-add-client-input` → `.md-fi-field + .md-fi-input`                     | ★★★  |
| M-B   | `.qa-cal-*` カレンダー入力: `.md-fi-*` と `.tbl-grid`（日付グリッド）の併用へ                   | ★★   |
| M-B   | `.qa-reliability-chips / .qa-confidence-chip` → `.chip-activated` + `data-status=*`             | ★★   |
| M-B   | `.qa-count-inline-input` → `.md-fi-number`                                                     | ★★   |
| M-C   | （テーブルなし）— スキップ                                                                      | —    |
| M-D   | `.qa-login-btn / .qa-add-client-submit / .qa-modal-btn-save/cancel` → `.btn-primary/.btn-secondary` | ★★★  |
| M-D   | `.qa-modal*` → `.modal-*`。モバイル幅では `--modal-sm(380)` を既定に                             | ★★★  |
| M-E   | `.qa-client-card` → `.bt-*` と組み合わせた card パターンへ。通知バッジ `.md-cn-badge` → `.bt-notification` | ★★   |
| M-F   | タッチターゲット最小44px、`:focus` リングを `.btn / .md-fi-*` の既定に任せる                    | ★★   |
| M-F   | 空状態 `.empty-state` を未登録リストに適用                                                      | ★★   |
| M-G   | 旧クラス削除                                                                                   | ★★   |

**要確認ポイント**:
- QAはスマホ運用が主。`data-density="compact"` を既定にするか（既定 comfortable のままで良いか）

---

### 2.4 画面レイアウト（Screen Layout）リファクタ計画

**対象**: `docs/screen-layout.html` (1531行) / `docs/mockup/screen-layout.css` (4423行) / `screen-layout.js` (6463行)

SLは**最大規模**かつ `<table>`+CSS Grid混在、ダークテーマあり。カテゴリ色が現状「全て同色」で D5.2 分化に未追従。

| Phase | 作業                                                                                          | 優先度 |
|-------|---------------------------------------------------------------------------------------------|-------|
| M-A   | `:root` 106変数を co-tokens.css へ移譲。Light/Dark両対応                                       | ★★★  |
| M-A   | **D5.2カテゴリ4色相分化を反映**: `--cat-bg-facility/event/traffic/highway` をteal/blue-violet/brown/green に分ける | ★★★  |
| M-A   | `--shift-bg-day/night` を `--bg-surface-2` と `--bg-sidebar` 系のdim色に再割当                 | ★★   |
| M-A   | Dark時 `--accent-primary: #098698` → `#55B5C4`                                                 | ★★★  |
| M-B   | インライン count入力 → `.md-fi-number`                                                          | ★★   |
| M-B   | カラーピッカー（`.color-setting-picker`）を `.md-fi-*` 規約にラップ                              | ★    |
| M-C   | `.grid-table / .grid-table th/td` → `.tbl .tbl--sticky-head` 12規約に置換（`<table>` はそのまま） | ★★★  |
| M-C   | `.col-*` 列クラスは維持しつつ、セル型を `.tbl-cell--num/--date/--text` で上書き                 | ★★   |
| M-C   | 選択行 `.selected` → `tr[aria-selected="true"]`、`.highlight-flash` は `--accent-secondary-dim` に揃える | ★★   |
| M-C   | カテゴリ・シフトの行着色は `data-category/data-shift` 属性化                                    | ★★   |
| M-D   | `.toolbar button / .theme-toggle-btn` → `.btn-*`                                                | ★★★  |
| M-D   | `.md-nav-modal*` の内部を `.modal-*` に委譲（共有ゆえ慎重に）                                   | ★★   |
| M-D   | `.md-sp-*`（サイドパネル・縦タブ）→ `.drawer` + 縦書きtabのカスタム（`writing-mode: vertical-rl` は保持）| ★★   |
| M-E   | `.category-*` / `.contact-*` / `.continuous-badge*` / `.badge-display` → `.bt-cat(data-cat=*) / .bt-contact / .info-badge / .bt-cell-tag` | ★★★  |
| M-E   | `.employee-tag`（ドラッグ可能） → `.draggable-tag`                                               | ★★   |
| M-F   | Dark対応の色検証（D5.2のカテゴリ色分化がDarkでも破綻しないか）                                   | ★★★  |
| M-F   | 縦タブ `.md-sp-vtab` に `aria-selected`、キーボード操作（←/→）対応                              | ★★   |
| M-F   | 印刷: サイドパネル `.no-print`、テーブルヘッダ継続                                               | ★★   |
| M-G   | 旧クラス削除                                                                                   | ★★   |

**要確認ポイント**:
- カテゴリ4色相分化は、既存データの印象（teal一色の落ち着き）と比べて**大きな見た目変化**となる。先にサンプル差分を見せて承認をもらう

---

### 2.5 共有CSS（co-*.css）リファクタ計画

| ファイル                  | 作業                                                                             |
|--------------------------|---------------------------------------------------------------------------------|
| `co-tokens.css`（新設）   | 全モックアップのトークンを集約。`styles-light.css` の `:root` と同値で同期      |
| `co-navbar.css`          | `.md-nav-btn*` / `.md-nav-modal*` → `.btn-*` / `.modal-*` へ委譲。`.md-cn-*` の通知系は `.bt-notification` + `.toast` に再編 |
| `co-shared-badges.css`   | `.md-cn-*` / `.md-ob-badge-*` / `.badge-*` を `.bt-*` 13規約へ順次置換。旧クラスは `@deprecated` コメント付きで残置 → 最終削除|

---

## Part 3 — 進め方・完了条件・リスク

### 3.1 進め方
- モックアップ **1画面 × 1フェーズ = 1PR** を基本単位に小刻み化
- 各PR前に index-light.html のコンポーネント表と目視比較。スクリーンショットを PR に貼る
- 既存の `feedback_modal_card_type.md`（カード型優先）・アイコン運用ルールを厳守

### 3.2 完了条件（Definition of Done）
- [ ] `:root` のCSS変数が4画面で co-tokens.css を参照（重複ゼロ）
- [ ] 旧カラー名（`--base-*` 等）の使用ゼロ（grep結果）
- [ ] `.md-ob-btn* / .md-ws-modal-btn* / .qa-modal-btn*` のクラス参照ゼロ
- [ ] テーブルが `.tbl-*` 12規約に準拠（sticky・zebra・合計行・セル型）
- [ ] フォームが `.md-fi-*` / `.form-*` に準拠（状態・バリデーション含む）
- [ ] モーダルが `.modal-*` に統一
- [ ] バッジが `.bt-*` 13規約に準拠
- [ ] 密度モード（`data-density`）切替がテーブルで動作
- [ ] ダークテーマ（WS/SL）でコントラストAA通過
- [ ] 印刷プレビューでsticky解除・ヘッダ継続
- [ ] `aria-invalid/selected/expanded/live` 追加、`.sr-only` 有効
- [ ] 絵文字・Unicode記号での代用ゼロ（アイコンライブラリ使用）

### 3.3 主要リスク
| リスク                                                  | 対策                                                                 |
|--------------------------------------------------------|--------------------------------------------------------------------|
| JS側でクラス名参照多数（*.js 約18,000行） — 置換漏れ     | grepテーブル作成→小刻み置換→動作確認。旧クラスは一時エイリアスで両対応 |
| ダークテーマ（WS/SL）色再定義で見た目崩壊                | D6値でPoC → 承認後に本番置換                                         |
| カテゴリ色4色相分化（SL）で既存バッジの印象が大きく変化 | 先行サンプル画面で承認                                               |
| `.md-ob-grid` の sticky z-index 見直しで重なり不整合     | 変更前に z-index マップを作成、一括統一                               |
| 密度モード導入でWS（40px）の既定変化                    | WSだけ spacious を既定にするか要判断                                  |

### 3.4 ユーザー確認が必要な判断事項（着手前）
1. カテゴリ色の4色相分化を適用するか（Screen Layoutの見た目が変化）
2. WSの既定行高（40px）を comfortable(36px) / spacious(44px) どちらに寄せるか
3. QAの既定密度を compact にするか comfortable のままにするか
4. 旧クラスの互換エイリアス期間（Phase M-G での削除タイミング）
5. リファクタ作業の着手順（推奨: 共通基盤 M0 → Order Book → Screen Layout → Weekly Schedule → Quick Access）
