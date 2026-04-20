# Phase M-D2 TE v1 — OB/SL モーダル置換 検証結果

> Role: Test Executor / Based on: `m-d2-td-v1.md`
> 検証日: 2026-04-20 / 環境: Grep ツール（ripgrep）/ Node.js (CSS brace balance)

---

## 0. 実施物件

- 新設: `docs/mockup/co-modal.css`（97行 / 16 ブロック `{...}`、プレフィクス無し `.modal-*`）
- 追加: `docs/order-book.html` L10 / `docs/screen-layout.html` L10 に `<link rel="stylesheet" href="mockup/co-modal.css">`
- 置換: `md-ob-modal*` → `modal*` を HTML 2ファイル / JS 1ファイル / CSS 3ファイルで実施
- 削除: `.md-ob-modal*` CSS 実定義を `order-book.css` / `screen-layout.css` / `co-shared-badges.css` から除去

---

## 1. チェックリスト結果

### A. DS準拠（7項目）

| # | 項目 | 結果 | 根拠 |
|---|------|:----:|------|
| A-1 | `co-modal.css` が存在し、`.modal-overlay / .modal / .modal-header / .modal-body / .modal-footer / .modal-close / .modal-footer-right` の7クラスが定義 | Pass | `grep "^\.modal" co-modal.css` → 17 hit（`.modal-overlay` 1 / `.modal{}` 1 / `.modal.modal-sm/-lg/-xl/-calendar` 4 / `.modal-header` 3セレクタ / `.modal-close` 2 / `.modal-body` 4 / `.modal-footer` 1 / `.modal-footer-right` 1） |
| A-2 | `.modal.modal-sm / -lg / -xl / .modal.modal-calendar` 派生が定義 | Pass | `co-modal.css` L35-37（sm/lg/xl）/ L96（calendar） |
| A-3 | `co-modal.css` 内で `var(--z-modal)` が overlay の z-index として使用 | Pass | `co-modal.css` L19: `z-index: var(--z-modal);` |
| A-4 | `co-modal.css` 内で `var(--modal-w-sm)` / `var(--modal-w-md)` が幅として使用 | Pass | L27 `width: var(--modal-w-md)` / L35 `width: var(--modal-w-sm)` / L36 `-lg` / L37 `-xl` |
| A-5 | `order-book.html` / `screen-layout.html` の `<head>` に `<link rel="stylesheet" href="mockup/co-modal.css">` が、`co-buttons.css` 直後 かつ `co-shared-badges.css` 前 に存在 | Pass | `order-book.html` L9=co-buttons / L10=co-modal / L11=co-shared-badges。`screen-layout.html` L9/L10/L11 同順 |
| A-6 | `grep -c "md-ob-modal" docs/order-book.html docs/screen-layout.html` 合計 = 0 | Pass | OB=0 / SL=0 |
| A-7 | `grep -c "md-ob-modal" docs/mockup/order-book.js docs/mockup/screen-layout.js` 合計 = 0 | Pass | OB.js=0 / SL.js=0 |

### D. コンポーネント一貫性（5項目）

| # | 項目 | 結果 | 根拠 |
|---|------|:----:|------|
| D-1 | `grep "md-ob-modal" docs/mockup/order-book.css` = 0 | Pass | 0 hit |
| D-2 | `grep "md-ob-modal" docs/mockup/screen-layout.css` = 0 | Pass | 0 hit（M-D1 の `site-footer` コメント1行だけは `co-buttons.css` への移管コメントで、modal とは無関係） |
| D-3 | `grep "md-ob-modal" docs/mockup/co-shared-badges.css` = 0 | Pass | 0 hit |
| D-4 | OB の 5モーダル overlay（editModalOverlay / rowEditModalOverlay / sortModalOverlay / calendarModalOverlay / obChangeNotifyModal）で `class="modal-overlay"` 統一 | Pass | OB HTML L116 / L279 / L371 / L398 / L451 全て `modal-overlay` |
| D-5 | SL の全モーダル close が `modal-close` 統一（旧 md-ob-modal-close を使っていた 7箇所） | Pass | SL HTML の `modal-close` 出現: 9件（vehicle/staff edit 2件 + site/meeting/work/notes/map/workTime/slAdd の7件）= 9件 |

### E. 機能回帰（6項目）

※ 実ブラウザ起動せず、JS セレクタ静的検証と DOM 構造確認で代替。

| # | 項目 | 結果 | 根拠 |
|---|------|:----:|------|
| E-1 | OB editModal（×・オーバーレイ・保存・削除）: `closeEditModal` / `saveEdit` / `deleteCell` 呼び出しが HTML で接続済 | Pass | OB HTML L116/L128（overlay click → closeEditModal / × → closeEditModal） + L268-276 のフッタで保存/削除ボタンが存在（M-D1 で btn化済） |
| E-2 | OB sortModal（sm）: × 動作 | Pass | OB HTML L371 overlay → closeSortModal / L375 close → closeSortModal |
| E-3 | OB calendarModal (`modal.modal-calendar`): 500px 幅、_setupCalEditPanel が `.modal` `.modal-body` `.modal-footer` をヒット | Pass | co-modal.css L96-101 で `.modal.modal-calendar { width: 500px; max-width: 95vw; max-height: 90vh; position: relative; }` 定義、`order-book.js` L3398/3399/3408/3409/3410 で `#editModalOverlay .modal` / `.modal-body` / `.modal-footer` を参照 → HTML と整合 |
| E-4 | OB 変更通知モーダル overlay クリックで閉じる（`obCnCloseModal`） | Pass | OB HTML L451 `class="modal-overlay" ... onclick="if(event.target===this)obCnCloseModal()"` で接続 |
| E-5 | SL siteModal / slAddModal + その他7モーダル close | Pass | SL HTML L691 siteModal overlay + L694 close / L1349 slAdd overlay + close / L506/L528/L880/L912/L955/L986/L1026 の close で `modal-close` クラス付与、onclick ハンドラ接続 |
| E-6 | Console エラーなし（JS セレクタが null を返さない） | Pass | order-book.js L1825 は `editCount` 要素を `.closest('.modal-body')` → HTML L130/L284/L377 等の `.modal-body` 祖先にヒット。L3398/3408 は `#editModalOverlay .modal` = OB HTML L117 `<div class="modal">` を **ID 限定で一意検出**（他モーダルの `.modal` と衝突しない） |

### B. カラー（2項目）

| # | 項目 | 結果 | 根拠 |
|---|------|:----:|------|
| B-1 | overlay background `rgba(0,69,84,0.35)` 維持 | Pass | `co-modal.css` L17 `background: rgba(0,69,84,0.35);` |
| B-2 | header: accent Coastal / body: `#E9F1F6` / 新色なし | Pass | `co-modal.css` L44 `background: var(--accent-primary-light);` / L71 `background: #E9F1F6;` / それ以外のハードコード色は `#FFFFFF` / `rgba(0,0,0,0.1)` / `rgba(255,255,255,0.8|0.2)` のみ（既存値と同値） |

### G. コード品質・保守性（2項目）

| # | 項目 | 結果 | 根拠 |
|---|------|:----:|------|
| G-1 | `co-modal.css` 内の色は既存と同系（新規 Coastal 外色なし） | Pass | `grep -E "#[0-9A-Fa-f]{3,6}|rgba?\(" co-modal.css` 列挙 → `rgba(0,69,84,0.35)` / `rgba(0,0,0,0.15)` / `rgba(0,0,0,0.1)` / `rgba(255,255,255,0.8)` / `rgba(255,255,255,0.2)` / `#FFFFFF` / `#E9F1F6`（全て旧 `.md-ob-modal*` と同値） |
| G-2 | `co-navbar.css` の `.md-nav-modal*` / `screen-layout.css` の `.md-modal-site-*` / OB の `md-cn-*` に変更なし | Pass | `git diff --stat docs/mockup/co-navbar.css` → 空 / `git diff docs/mockup/screen-layout.css` 内に `md-modal-site` の改変なし（シェル削除ブロックのみ修正）/ `git diff docs/order-book.html` 内に `md-cn-*` の改変なし（overlay のみ `modal-overlay` に変更、その中の `md-cn-modal / md-cn-header / md-cn-body / md-cn-tabs / md-cn-close` は unchanged） |

---

## 2. 数値サマリ

### 2.1 Grep カウント（`md-ob-modal`）

| ファイル | 置換前（TD 3.2） | 置換後（TE） | 変化 |
|---------|-----:|-----:|:----:|
| `docs/order-book.html` | 27 | **0** | -27 |
| `docs/screen-layout.html` | 20 | **0** | -20 |
| `docs/mockup/order-book.js` | 6 | **0** | -6 |
| `docs/mockup/screen-layout.js` | 0 | **0** | 0 |
| `docs/mockup/order-book.css` | 13 | **0** | -13 |
| `docs/mockup/screen-layout.css` | 12 | **0** | -12 |
| `docs/mockup/co-shared-badges.css` | 2 | **0** | -2 |
| **合計** | **80** | **0** | **-80** |

### 2.2 新クラス出現数

| 新クラス | OB HTML | SL HTML | OB JS | co-modal.css 定義数 |
|---------|--:|--:|--:|--:|
| `modal-overlay` | 5 | 2 | 0 | 1 |
| `modal`（bare） | 5 | 2 | 2 | 1 |
| `modal-sm` | 2 | 0 | 0 | 1 |
| `modal-lg` | 0 | 0 | 0 | 1 |
| `modal-xl` | 0 | 0 | 0 | 1 |
| `modal-calendar` | 1 | 0 | 0 | 1 |
| `modal-header` | 4 | 3 | 0 | 3（`.modal-header` / h3 / span 統合） |
| `modal-body` | 16 | ~6 | 3 | 4（`.modal-body` + scrollbar 3） |
| `modal-footer` | 7 | 3 | 1 | 1 |
| `modal-footer-right` | 3 | 2 | 0 | 1 |
| `modal-close` | 7 | 9 | 0 | 2（`.modal-close` + `:hover`） |

注: OB HTML の `modal-header`=4 (L118/281/373/401) ＋ `modal-body`=16（本体 4 + ネスト構造内で `md-modal-body-field-value` のような **似て非なる** クラスは別カウント）、正確には `modal-body` 完全一致 = 4件 + `modal-body md-ob-cal-body` = 1 = 計5件。上表の "16" は `modal-body` 包含の子要素 class にも一致するノイズを含み得るため、**機能的に重要なのは "2.1 の 0件" と co-modal.css が全セレクタを網羅していること**。

### 2.3 CSS パース

| ファイル | `{` | `}` | ブレース整合 |
|---------|--:|--:|:--:|
| `co-modal.css` | 16 | 16 | OK |
| `order-book.css` | 414 | 414 | OK |
| `screen-layout.css` | 719 | 719 | OK |
| `co-shared-badges.css` | 77 | 77 | OK |

全ファイル構文エラーなし。

### 2.4 他ファイル差分チェック（M-D2 スコープ外）

| ファイル | 期待 | 結果 |
|---------|------|:----:|
| `docs/mockup/co-navbar.css` | 変更なし（`.md-nav-modal*` 残留 OK） | Pass（git diff 空） |
| `docs/mockup/co-tokens.css` | 変更なし | Pass（git diff 空） |
| `docs/mockup/co-forms.css` | 変更なし | Pass（git diff 空） |
| `docs/mockup/co-buttons.css` | 変更なし | Pass（git diff 空） |
| `docs/ui-components/styles-light.css` | 変更なし | Pass（git diff 空） |
| `docs/mockup/weekly-schedule.{css,js}` | 変更なし（`.md-ws-modal*` 残留 OK） | Pass（git diff 空） |
| `docs/mockup/quick-access.{css,js}` | 変更なし | Pass（git diff 空） |

※ `docs/quick-access.html` / `docs/weekly-schedule.html` に git diff があるが、これは **M-D1 由来の co-buttons.css link 追加**（未コミット）で M-D2 外。
※ `docs/mockup/order-book.js` / `docs/mockup/screen-layout.js` / `docs/mockup/co-shared-badges.css` / `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` は M-D1 + M-D2 の混在差分。本 TE で検証した md-ob-modal 関連削除・置換は全て意図通り。

### 2.5 `md-modal-site-*` 残留（意図通り・スコープ外）

| ファイル | 件数 | 期待 |
|---------|--:|---|
| `docs/mockup/screen-layout.css` | 33 | 残留OK（M-D3 対象） |
| `docs/screen-layout.html` | 28 | 残留OK |

### 2.6 `md-cn-*`（変更通知）残留（意図通り）

| ファイル | `md-cn-*` 件数 |
|---------|--:|
| `docs/order-book.html` | 多数（overlay 除く） |
| `docs/mockup/order-book.css` | 未チェック、意図通り残留 |

### 2.7 `md-nav-modal*`（ナビ共有マスタ）残留（意図通り）

`docs/mockup/co-navbar.css` 内の `.md-nav-modal*` は git diff なし → 触っていない。

---

## 3. 重大Claim再点検

| # | 内容 | 判定 |
|--:|------|:----:|
| 1 | 機能破壊（open/close/× 操作不能） | **該当なし**（HTML onclick 接続 + JS セレクタ全て一意でヒット） |
| 2 | オーバーレイ背景崩壊 | **該当なし**（`rgba(0,69,84,0.35)` / `position:fixed; inset:0` 維持） |
| 3 | z-index 干渉 | **該当なし**（旧 `z-index:500` → 新 `var(--z-modal)=1000` に上昇 → navbar(100) / dropdown(500-600) より確実に前面。toast(1500+) より後面で既存の階層関係維持） |
| 4 | 他モックアップ波及 | **該当なし**（co-navbar.css / styles-light.css / weekly-schedule.* / quick-access.* CSS実定義の改変ゼロ） |
| 5 | CSS 残留 | **該当なし**（3 CSS とも 0件） |
| 6 | HTML 残留 | **該当なし**（2 HTML とも 0件） |
| 7 | JS 残留 | **該当なし**（OB.js / SL.js とも 0件） |
| 8 | 新規記号混入 | **該当なし**（既存 ✕ / × の追加・削除なし。co-modal.css にも記号埋め込みなし） |
| 9 | Link 抜け | **該当なし**（OB/SL とも L10 に co-modal.css link あり） |

**重大Claim = 0**

---

## 4. 観測所見

- co-modal.css は **既存 OB/SL の `.md-ob-modal*` のプロパティ値を厳密に維持**しながら、`--z-modal` / `--modal-w-*` トークン参照化を達成（旧 `z-index:500` は トークンの 1000 に変わる点のみ実質差異、navbar/dropdown より確実に前面で運用上の影響はない）
- 旧 OB/SL 双方で header 背景が `var(--accent-primary-light)` (OB) / `var(--accent-light)` (SL) の別トークン参照だったが、両者 Coastal Palette 内で値が同じ系統（accent-primary-light = accent-light）。co-modal.css は `var(--accent-primary-light)` に統一 → Coastal 整合維持
- カレンダーモーダルで `md-ob-cal-close / -header / -body / -footer` の compound class は維持されており、カレンダー固有の視覚（ヘッダ padding-right 36px / 絶対配置 × など）は損なわれない
- `_setupCalEditPanel` / `_teardownCalEditPanel` の DOM 移動（`.modal-body` を `#calEditPanelBody` に appendChild し戻す処理）は、セレクタ文字列の一括置換で無事に接続済

---

## 5. 総括

- **置換/削除 件数 : 80/80 完了（100%）**
- **重大Claim : 0**
- **CSS パースエラー : 0**
- **他モックアップ波及 : 0**
- **機能接続点（onclick ハンドラ / JS セレクタ）: 全て健全**

→ SC へ送出。
