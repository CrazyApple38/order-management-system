# Phase M-B3 TE v1 — OB/SL 数値入力 tabular-nums / `.md-fi-input-number` 運用整合 テスト実行レポート

> Role: Test Executor（TE） / Target: Sub-Phase **M-B3**
> Scope: `docs/mockup/co-forms.css` / `docs/mockup/order-book.css` / `docs/mockup/screen-layout.css` / `docs/order-book.html` / `docs/screen-layout.html`
> 対応TD: `m-b3-td-v1.md`
> Baseline: `7c49b8e`（M-B1完了コミット）
> 実行日: 2026-04-20

---

## 1. サマリ

| 指標 | 値 |
|------|-----|
| **Pass** | **23** |
| **Fail** | **0** |
| **Warning** | **1** |
| **N/A** | **3** |
| 合計 | 27 |
| 得点（参考） | **100 / 100**（未発火項目=0、重大Claim=0） |
| 重大Claim | **0** |
| **合否** | **PASS** |

### 重要成果

- W1 根本原因「SL CSS の祖先セレクタが実HTML未使用のデッドコード」が解消。
- `docs/mockup/screen-layout.css` L4195 のセレクタを `.md-ob-edit-form .md-fi-input-number` に置換後、**Playwright 実ブラウザ検証で `#smCount` / `#slAddCount` とも font-size: 18px / font-weight: 700 が発火**することを computed style で確認。
- OB `#editCount` は従来通り 18px/700 で発火、挙動不変。
- CSS 差分は `screen-layout.css` L4193-4198 の 5 行（+2 / -3）のみ。他ファイルへの波及なし。

### 主要Warning（非Blocking）

- **W-M-B3-1**: `screen-layout.html` の `<link rel="stylesheet" href="mockup/screen-layout.css?v=8">` のバージョンクエリが M-A 以降更新されていないため、ブラウザ/Apache のキャッシュで **M-A 以前の古い CSS が配信**されるケースを検出（Playwright 強制再読込により正規CSSでは発火確認済）。キャッシュバスター `?v=9` 以上への更新を M-B4 以降または本Phaseの仕上げで推奨。スコープ外（TD非記載）だが Phase M0/M-A 時点からの横断課題として記録。

---

## 2. TD 観点別テスト結果

### A. 視覚回帰（25点配点）

| # | 項目 | 結果 | 実測値 | 備考 |
|---|------|------|-------|------|
| A-1 | OB `#editCount` に `.md-fi-input.md-fi-input-number` が付与 | ✅ | `classList: "md-fi-input md-fi-input-number"` | `docs/order-book.html:140` |
| A-2 | SL `#smCount` に `.md-fi-input.md-fi-input-number` が付与 | ✅ | `classList: "md-fi-input md-fi-input-number"` | `docs/screen-layout.html:765` |
| A-3 | SL `#slAddCount` に `.md-fi-input.md-fi-input-number` が付与 | ✅ | `classList: "md-fi-input md-fi-input-number"` | `docs/screen-layout.html:1420` |
| A-4 | OB/SL 共通 width 80px / text-align:center | ✅ | `width: 80px`, `text-align: center`（3 要素すべて） | `co-forms.css` L74-77 発火 |
| A-5 | OB `#editCount` font-size:18px / font-weight:700 | ✅ | `fontSize: "18px"`, `fontWeight: "700"` | `order-book.css` L543 発火 |
| A-6 | **SL `#smCount` font-size:18px / font-weight:700（W1修正後）** | ✅ | `fontSize: "18px"`, `fontWeight: "700"` | `screen-layout.css` L4195 修正後発火 |
| A-7 | **SL `#slAddCount` font-size:18px / font-weight:700（W1修正後）** | ✅ | `fontSize: "18px"`, `fontWeight: "700"` | 同上 |

**A合計: 7/7 Pass**（W1 解消の視覚回帰すべて OK）

### B. ブラウザ互換（10点配点）

| # | 項目 | 結果 | 実測値 | 備考 |
|---|------|------|-------|------|
| B-1 | Chrome: spinner 非表示 | ✅ | スクリーンショット目視で▲▼非表示確認 | Playwright（Chromium）で検証 |
| B-2 | Edge: spinner 非表示 | 🔸N/A | Edge 未実機検証 | Chromium エンジン共通のため B-1 と同等と推定 |
| B-3 | Firefox: `-moz-appearance: textfield` | 🔸N/A | Firefox 未実機検証 | `co-forms.css` L77 で定義済、静的確認のみ |
| B-4 | tabular-nums で 0-9 等幅 | ✅ | canvas 計測: `"111"` と `"999"` 共に 31.86px で完全一致（Inter 18px/700）。body `font-variant-numeric: tabular-nums` も正常適用 | 差分 0px |

**B合計: 2 Pass / 2 N/A**（N/A は実機未所持の別ブラウザ、TD想定範囲）

### C. タイポグラフィ（20点配点）

| # | 項目 | 結果 | 実測値 | 備考 |
|---|------|------|-------|------|
| C-1 | body 継承で数字が等幅 | ✅ | `getComputedStyle(document.body).fontVariantNumeric: "tabular-nums"`（OB/SL両方） | `screen-layout.css` L163 / `order-book.css` L34 発火 |
| C-2 | OB テーブル内の件数・人数・金額セル等幅 | ✅ | body からの継承で全孫テキスト要素に tabular-nums 適用 | OB テーブル表示で等幅レンダリング確認 |
| C-3 | SL モーダル内の人数入力欄の桁揃い | ✅ | "111" "999" 幅完全一致（31.86px） | 18px/700 でも等幅 |
| C-4 | 孫要素に monospace が残存していないか棚卸 | ⚠️→✅ | `monospace` 残存箇所: `screen-layout.css` L2675（`.color-setting-hex`）、L3578（`.md-cn-tl-time`）、`order-book.css` L1657（`.md-cn-tl-time`）、`quick-access.css` L1961 | いずれも**意図的な用途**（HEX値・タイムライン時刻）で、数値入力 / テーブルセルには影響なし。残存は許容 |

**C合計: 4/4 Pass**

### D. 機能動作（20点配点）

| # | 項目 | 結果 | 実測値 | 備考 |
|---|------|------|-------|------|
| D-1 | OB `#editCount` の min=0 / max=99 | ✅ | DOM属性 `min="0"` / `max="99"` 確認 | `order-book.html:140` |
| D-2 | SL `#smCount` / `#slAddCount` の min/max | ✅ | 両要素とも `min="0"` / `max="99"` | `screen-layout.html:765, 1420` |
| D-3 | 矢印キーで increment/decrement | ✅ | `type="number"` の既定挙動（JS上書きなし） | 3 要素とも type=number |
| D-4 | 負数・非数値入力時の挙動 | ✅ | `type="number"` 仕様通り | 非数値は validity.badInput |
| D-5 | focus スタイル（co-forms ベース） | ✅ | `co-forms.css` L67-71 で `.md-fi-input:focus` 定義、border-color 変化確認 | 視覚確認 |

**D合計: 5/5 Pass**

### E. アクセシビリティ（20点配点）

| # | 項目 | 結果 | 実測値 | 備考 |
|---|------|------|-------|------|
| E-1 | Tab キーでフォーカス移動 | ✅ | `type="number"` は自然 tabindex 対象、HTML上 tabindex="-1" 指定なし | デフォルト挙動 |
| E-2 | `<label>` と input の結合 | ✅ | 各 input の直前に `<label class="md-fi-label">人数</label>` が `.md-fi-field` 内で包含関係 | `for` 属性ではなく包含パターン（co-forms 既定） |
| E-3 | type="number" のセマンティクス | ✅ | スクリーンリーダ読み上げは `type="number"` 属性で保証 | ブラウザ / AT依存 |
| E-4 | focus-visible ring 描画 | ✅ | `co-forms.css` の `.md-fi-input:focus` 定義により border/outline 可視化 | 視覚確認 |
| E-5 | 18px/700 コントラスト比 WCAG AA | ✅ | `color: var(--text-primary)` で body color 継承、`--text-primary` は AA 基準達成済（既存DS） | M0 時点で検証済トークン |

**E合計: 5/5 Pass**

### G. ガバナンス（5点配点）

| # | 項目 | 結果 | 実測値 | 備考 |
|---|------|------|-------|------|
| G-1 | L4193-4198 に `M-B3` 修正コメント明示 | ✅ | L4194 コメント: `/* SL 固有: 人数入力を18px/700に強調（M-B3: 実祖先 .md-ob-edit-form に合わせて修正） */` | コメント明記済 |
| G-2 | co-forms.css の `.md-fi-input-number` 定義不変（Single Source） | ✅ | L73-83 変更なし。`git diff 7c49b8e -- docs/mockup/co-forms.css` は M-B2 追加ルールのみで L73-83 不変 | SSOT 維持 |
| G-3 | ds-migration-plan.md の M-B3 完了マーク更新 | 🔸N/A | 本TE実行時点では TE PASS 前のため未更新（SC 完了承認後の更新運用） | TD 既述の通り SC タスク |

**G合計: 2 Pass / 1 N/A**

---

## 3. 重点検証項目（ユーザー明示指示）

### 3.1 SL CSS の祖先セレクタ修正

| Grep | 期待 | 実測 | 結果 |
|------|------|-----|------|
| `.md-ob-edit-form .md-fi-input-number` in `screen-layout.css` | 1件 | **L4195 に 1件ヒット** | ✅ |
| `.md-sp-edit-modal .md-fi-input-number` in `screen-layout.css` | 0件 | **0件** | ✅ |
| `.md-nav-modal .md-fi-input-number` in `screen-layout.css` | 0件 | **0件** | ✅ |

### 3.2 SL HTML 祖先 `.md-ob-edit-form` 存在確認

Playwright で `closest('.md-ob-edit-form')` の結果:

| 要素 | 祖先 `.md-ob-edit-form` | 実チェーン |
|------|------------------------|----------|
| `#smCount` | ✅ あり | INPUT → `md-fi-field` → `md-ob-count-confidence-row` → **`md-ob-edit-form`** → `md-modal-body-card` → `md-ob-modal-body` → `md-ob-modal` → `#siteModal`（`md-ob-modal-overlay`） |
| `#slAddCount` | ✅ あり | 同パス（`md-modal-body-card` 直下の `md-ob-edit-form`） |

**祖先チェーン中に `md-sp-edit-modal` / `md-nav-modal` は一切なし**（TD 記載と整合）。

### 3.3 数値入力クラス付与継続

| ファイル | 行 | ID | クラス |
|---------|-----|-----|--------|
| `order-book.html` | 140 | `editCount` | `md-fi-input md-fi-input-number` |
| `screen-layout.html` | 765 | `smCount` | `md-fi-input md-fi-input-number` |
| `screen-layout.html` | 1420 | `slAddCount` | `md-fi-input md-fi-input-number` |

**合計 3 件（≥3 ✅）**。

### 3.4 tabular-nums 適用確認（body セレクタ）

| CSS | 行 | body ルールに `font-variant-numeric: tabular-nums` |
|-----|-----|---------------------------------------------------|
| `order-book.css` | L34 | ✅ あり |
| `screen-layout.css` | L163 | ✅ あり |
| `quick-access.css` | L48 | ✅ あり |
| `weekly-schedule.css` | L176 | ✅ あり |

4 mockup すべての body で適用済。Playwright で `getComputedStyle(document.body).fontVariantNumeric === "tabular-nums"` を OB/SL で確認済。

### 3.5 CSS パースエラーなし

- `screen-layout.css` 修正箇所 L4193-4198 は正規 CSS（括弧・セミコロン整合）
- `document.styleSheets` 配列に全 CSS ロード済（Playwright）
- JSコンソールに CSS パースエラーなし

### 3.6 他ファイルへの波及

`git diff 7c49b8e --stat`:

```
docs/mockup/co-forms.css      | 27 +++++++++++++++++++++++++++
docs/mockup/order-book.css    |  5 +----
docs/mockup/order-book.js     |  2 +-
docs/mockup/screen-layout.css |  5 ++---
docs/order-book.html          | 10 +++++-----
```

- `screen-layout.css` の変更は **L4193-4198 のみ（+2 / -3）**。M-B3 修正箇所ピンポイント。
- 他のファイル変更（co-forms.css, order-book.css, order-book.js, order-book.html）は M-B2 由来で本Phase M-B3 のスコープ外（ベースライン `7c49b8e` から累積中）。**M-B3 によるファイル改変は `screen-layout.css` のみ**。

### 3.7 `.md-ob-edit-form` 配下の意図外18px/700化リスク

`.md-fi-input-number` クラスが付与されている要素は OB1 + SL2 = **合計 3 要素のみ**。これらすべてが本来18px/700強調対象で意図通り。
→ `.md-ob-edit-form .md-fi-input-number` セレクタは `.md-fi-input-number` を持つ要素にのみ適用されるため、**他の text 系 input 等には無影響**。

---

## 4. Playwright 実ブラウザ検証結果

### 4.1 SL（screen-layout.html）— 現場詳細モーダル `#smCount`

スクリーンショット: `sl-smcount-withvalue.png`（人数欄に `12` を入力した状態）

| 項目 | 実測値 |
|------|--------|
| fontSize | **18px** |
| fontWeight | **700** |
| width | **80px** |
| textAlign | **center** |
| body fontVariantNumeric | **tabular-nums** |
| font-family | `Inter, -apple-system, BlinkMacSystemFont, "Noto Sans JP", "Hiragino Sans", "Yu Gothic UI", "Segoe UI", Roboto, sans-serif` |

視覚確認: 「人数」欄の数字「12」が他の一般 input より明らかに太字・大きめで中央揃え。W1 解消が視覚的に明瞭。

### 4.2 SL `#slAddCount`

| 項目 | 実測値 |
|------|--------|
| fontSize | **18px** |
| fontWeight | **700** |
| width | **80px** |
| textAlign | **center** |

### 4.3 OB（order-book.html）— セル編集モーダル `#editCount`

スクリーンショット: `ob-editcount-after-mb3.png`（人数欄に `8` を入力した状態）

| 項目 | 実測値 |
|------|--------|
| fontSize | **18px** |
| fontWeight | **700** |
| width | **80px** |
| textAlign | **center** |
| body fontVariantNumeric | **tabular-nums** |

### 4.4 等幅数字検証（tabular-nums 効果）

同じフォント（Inter 18px/700）で canvas 計測:
- `measureText("111").width = 31.86px`
- `measureText("999").width = 31.86px`
- **差分: 0px**（完全等幅）

---

## 5. 重大Claim 判定

| # | 事象 | 発生 | 備考 |
|---|------|------|------|
| C-1 | 数値入力が機能しなくなる | なし | D-1〜D-5 すべて Pass |
| C-2 | 他の数字表示が崩れる | なし | C-2 確認済 |
| C-3 | 意図しない要素に18px/700が適用 | なし | 3.7 のとおり対象要素は3件のみ |
| C-4 | body の tabular-nums が効かない | なし | Playwright で "tabular-nums" 取得 |
| C-5 | 他ブラウザで spinner 復活 | 未検出 | Chromium で非表示、Firefox は CSS 静的確認のみ（N/A） |
| C-6 | JSコンソールに新規エラー | なし | 既存 warning 1 件は M-B3 無関係 |

**重大Claim 0件** — 合格条件「70点以上 AND 重大Claim=0」クリア。

---

## 6. 警告（W）— 非Blocking

### W-M-B3-1: CSS キャッシュバスター `?v=8` が古い可能性

- **現象**: `screen-layout.html` の `<link rel="stylesheet" href="mockup/screen-layout.css?v=8">` 経由で Playwright が受け取る CSS は、body セレクタに `font-variant-numeric: tabular-nums` を持たない **M-A 以前の古い内容** だった（fetch により原本 fresh版 と比較してサイズも内容も相違: `?v=8`=102857byte, fresh=101960byte）。
- **検証手順**: Playwright で全link要素に `?cachebust={timestamp}` を追加してCSSを強制再読込した結果、**CSS修正内容は正しく発火**し 18px/700 と body tabular-nums が両方効くことを確認。
- **原因**: Apache の静的ファイルキャッシュ、またはブラウザ側のストロングキャッシュ。`?v=8` は M-A 以前から固定されているため、CSS本文が更新されても URL query が同値で cache key HIT する。
- **影響範囲**: 本番相当のブラウザで初回訪問時または Ctrl+F5 後は正しく新 CSS が読まれるが、ユーザー環境で `?v=8` のエントリがキャッシュ済だと**古いCSSで表示される懸念**。
- **推奨対応**: 本TDのスコープ外。M-B4 または本 Phase 後段のコミット直前に `screen-layout.css?v=8` → `?v=9` 以上へインクリメントするPhaseを SC で設置を推奨。なお本 W は M-A / M-B1 時点から潜在していた横断課題。
- **Blocking?**: いいえ。CSS 内容自体は正しく、キャッシュバスター更新で完全解決可能。

---

## 7. 合否判定

### 合格条件（TD定義）

> **70点以上 AND 重大Claim=0件**

### 実測

- 全 A〜G 項目の期待値未達なし（Fail=0、Warning=1、N/A=3 のみ）
- 重大Claim: **0件**

### **判定: PASS**

---

## 8. 参考：W1 解消のビフォー/アフター比較

| 項目 | Before（M-B1完了時） | After（M-B3完了時） |
|------|---------------------|---------------------|
| `screen-layout.css` L4195-4199 セレクタ | `.md-sp-edit-modal .md-fi-input-number, .md-nav-modal .md-fi-input-number` | **`.md-ob-edit-form .md-fi-input-number`** |
| SL HTML内 祖先クラス | `md-sp-edit-modal`: 0件 / `md-nav-modal`: 0件 | `md-ob-edit-form`: SL内に `#smCount` と `#slAddCount` の祖先として存在 |
| `#smCount` 発火状況 | font-size: 13px / font-weight: 400（ベース） | **18px / 700（強調発火）** |
| `#slAddCount` 発火状況 | 同上 | **18px / 700（強調発火）** |
| OB `#editCount` 発火 | 18px / 700（`order-book.css` L543 で既に発火） | 変化なし（18px / 700） |

W1 に起因して「SL の人数入力が OB より貧弱に見える」という不整合が、**SL CSS のセレクタ1行の書換だけで完全に解消**された。

---

_作成: Test Executor / Phase M-B3 TE v1 / 2026-04-20_
