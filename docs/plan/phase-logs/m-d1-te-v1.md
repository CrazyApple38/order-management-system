# Phase M-D1 TE v1 — OB/SL ボタン `.md-ob-btn-*` → `.btn-*` 置換 検証結果

> Role: Test Executor / Target: Sub-Phase M-D1
> 検証日: 2026-04-20

---

## 0. 実行環境

- Playwright (Chromium via MCP)
- Local: `http://localhost/order-management-system/docs/*.html`
- Tools: Grep (ripgrep), Node.js ブレース整合スクリプト

---

## 1. Grep による残留件数（重大Claim 2〜4 連動）

| 対象 | コマンド | 期待 | 実測 | 判定 |
|------|---------|------|------|------|
| `docs/order-book.html` | grep -c "md-ob-btn" | 0 | **0** | Pass |
| `docs/screen-layout.html` | grep -c "md-ob-btn" | 0 | **0** | Pass |
| `docs/mockup/order-book.js` | grep -c "md-ob-btn" | 0 | **0** | Pass |
| `docs/mockup/screen-layout.js` | grep -c "md-ob-btn" | 0 | **0** | Pass |
| `docs/mockup/order-book.css` | grep -c "md-ob-btn" | 0 | **0** | Pass |
| `docs/mockup/screen-layout.css` | grep -c "md-ob-btn" | 0 | **0** | Pass |
| `docs/mockup/co-shared-badges.css` | grep -c "md-ob-btn" | 0 | **0** | Pass |

→ 旧クラス残留ゼロ。重大Claim 2/3/4 クリア。

---

## 2. `co-buttons.css` の定義確認（A-1〜A-4）

| 項目 | 要求 | 実測 | 判定 |
|------|------|------|------|
| A-1 存在 | co-buttons.css がある | 230行 / 存在 | Pass |
| A-1 `.btn` | base定義 | L14-33 完全同値（styles-light L2712-2731） | Pass |
| A-1 `.btn-primary` | L2742-2748 と同値 | L44-50 同値 | Pass |
| A-1 `.btn-secondary` | L2751-2757 と同値 | L53-59 同値 | Pass |
| A-1 `.btn-danger` | L2760-2766 と同値 | L62-68 同値 | Pass |
| A-1 `.btn-ghost` | L2769-2775 と同値 | L71-77 同値 | Pass |
| A-1 `.btn-outline` | L2778-2784 と同値 | L80-86 同値 | Pass |
| A-3 `.btn-sm` `.btn-md` `.btn-lg` | L2787-2808 と同値 | L89-110 同値 | Pass |
| A-4 `.btn-icon` `.btn-group` `.btn-group-split` `.btn-group-right` | L2811-2870 と同値 | L113-172 同値 | Pass |
| A-4 `.btn-full` `.btn-loading` + keyframes | L2826-2852 | L128-154 同値 | Pass |

**補完ユーティリティ（TD 5）**:

| クラス | 行 | 判定 |
|-------|-----|------|
| `.btn-ghost--pill-dashed` | L179-189 | Pass |
| `.btn-ghost--danger-hover` | L192-196 | Pass |

**密度連動ルール**: L201-229（`data-density` compact/spacious）も転記済み。

---

## 3. HTML の `<link>` 挿入（A-5）

`co-tokens.css` → `co-forms.css` → **`co-buttons.css`** → `co-shared-badges.css` → …の順。

| ファイル | co-buttons.css 位置 | 判定 |
|---------|--------------------:|------|
| `docs/order-book.html` | L9（forms と shared-badges の間） | Pass |
| `docs/screen-layout.html` | L9（同） | Pass |
| `docs/weekly-schedule.html` | L9（同） | Pass |
| `docs/quick-access.html` | L9（forms と navbar の間） | Pass |

4 HTML 全てに追加済み。`<link>` 抜け（重大Claim 8）なし。

---

## 4. スコープ外ファイルの非改変（命令 7）

git diff --name-only: 9 ファイル（OB/SL css/js/html、WS/QA html、co-shared-badges.css）+ 新規 co-buttons.css のみ。

- `co-tokens.css` — 未改変 (Pass)
- `co-forms.css` — 未改変 (Pass)
- `docs/ui-components/**` — 未改変 (Pass)
- `docs/assets/tokens.json` — 未改変 (Pass)
- `docs/mockup/quick-access.css` — 未改変 (Pass)
- `docs/mockup/weekly-schedule.css` — 未改変 (Pass)

---

## 5. CSS パースエラー（ブレース整合）

Node.js スクリプトで `{ }` 収支を検算。

| ファイル | 最終 depth | 判定 |
|---------|-----------:|------|
| co-buttons.css | 0 | Pass |
| order-book.css | 0 | Pass |
| screen-layout.css | 0 | Pass |
| co-shared-badges.css | 0 | Pass |

---

## 6. ブラウザ実機動作（Playwright）

### 6.1 OB `order-book.html`

- **Console エラー**: 0 件
- Warning 1（icon 404 は M-D1 スコープ外）
- `co-buttons.css` stylesheet 読み込み: **OK**
- 残留 `[class*="md-ob-btn"]` DOM: **0 件**
- `.btn` 要素数: **17**
- `.btn-primary` computed background: `rgb(68, 166, 181)` = `--accent`（B-1 OK）
- `.btn-primary` color: `rgb(255, 255, 255)`（白）

**モーダル機能回帰（E 観点）**:

| 項目 | 結果 |
|------|------|
| E-1 編集モーダル: saveEdit/closeEditModal/deleteCell が例外なく実行 | Pass |
| E-2 業務詳細 `+追加` ×2 → 2件増加 / `×` クリック → 1件に減少（`.btn-ghost--danger-hover`） | Pass |
| E-3 `previewMap(this)` → iframe 表示 / `clearMapPreview(this)` → 例外なし | Pass |
| E-4 `addChildBadge()` 実行 → 例外なし（子バッジ生成） | Pass |

```
{ subTaskBefore: 0, subTaskAfter: 2 }
{ removeBtnExists: true, removeBtnCls: "btn btn-sm btn-icon btn-ghost btn-ghost--danger-hover", afterRemove: 1 }
{ mapBtn: true, mapResult: true (iframe detected) }
{ deleteOk: true, saveOk: true, closeOk: true, finalDisplay: "none" }
```

### 6.2 SL `screen-layout.html`

- **Console エラー**: 1 件（icons/refresh.svg 404 — M-D1 非関連の既存404）
- `co-buttons.css`: OK
- 残留 `md-ob-btn` DOM: **0 件**
- `.btn` 要素数: **34**
- `.btn-primary` computed background: `rgb(68, 166, 181)` = `--accent`

**各モーダルの btn クラス構成**:

| モーダル | save | cancel | danger | 判定 |
|---------|------|--------|--------|------|
| siteModal | `btn btn-primary` | `btn btn-secondary` | `btn btn-danger` | Pass |
| meetingModal | `btn btn-primary` | `btn btn-secondary` | — | Pass |
| workModal | `btn btn-primary` | `btn btn-secondary` | — | Pass |
| notesModal | `btn btn-primary` | `btn btn-secondary` | — | Pass |
| sortModal | `btn btn-primary` | `btn btn-secondary` | — | Pass |
| slAddModalOverlay | `btn btn-primary` | `btn btn-secondary` | — | Pass |
| changeNotifyModal | btn 系 1 件確認 | — | — | Pass |

- E-5 `smDeleteSite()` 例外なく実行（confirm=false スタブ） — Pass

D-5（34件置換・一貫性）をPass判定。

### 6.3 WS `weekly-schedule.html`

- Console エラー 0 / Warning 0
- `co-buttons.css` link OK
- `.btn` 0 件（WS は `.md-ws-modal-btn*` 継続。M-D1 スコープ外で想定通り）

### 6.4 QA `quick-access.html`

- Console エラー 1（icons/shield.svg 404 — 既存 / M-D1 非関連）
- `co-buttons.css` link OK
- QA は `.qa-modal-btn*` 継続。M-D1 スコープ外で想定通り

---

## 7. 新規記号混入チェック（重大Claim 5）

git diff を OLD / NEW で `×` `✕` の出現回数比較:

| 記号 | OLD (削除行) | NEW (追加行) | 差分 |
|------|-------:|-------:|------|
| `×` | 17 | 17 | **±0** |
| `✕` | 11 | 11 | **±0** |

→ 新規追加なし。既存記号を温存した置換のみ。

---

## 8. Coastal 外色混入（重大Claim 6）

`co-buttons.css` 内の `#` 直書き:
- `#fff`（白）— OK
- `#0a9db0`（`.btn-primary:active` 背景。styles-light 本体と同値で DS 内既知値）— OK

`rgba(219, 87, 123, ...)` は DS の `--error` 由来で OK。
青系/緑系/独自赤のハードコードなし。

---

## 9. Class 属性不正重複

全 4 HTML で `class="\s+"` または連続スペース含む不正 class 属性を検出 → **0 件**。

---

## 10. A11y（F 観点）

- `:focus-visible` の `box-shadow: var(--focus-ring)` が `.btn` 共通で定義済み（co-buttons.css L35）
- `.btn:disabled` / `[aria-disabled="true"]` → `opacity: 0.4; cursor: not-allowed; pointer-events: none;` 適用（co-buttons.css L36-41）
- 実機で disabled 属性付きボタン（`rowEditSaveBtn` 等）に `cursor: not-allowed` / `opacity: 0.35`（他CSS連動）確認

---

## 11. 総合

**Pass: 25 / Fail: 0**

- 重大Claim 1〜8 全て該当なし
- 配点項目 A/B/C/D/E/F/G すべての観点で Pass を確認

## 12. 残課題（情報共有 / M-D1 スコープ外）

- SL/QA の 404 アイコン（refresh.svg / shield.svg）は既存問題。M-F で整理
- WS/QA の旧ボタンクラス置換は Phase W-D / Q-D で実施
- "×" / "✕" / "+" テキスト記号のアイコン化は M-F 予定
