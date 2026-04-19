# Test Design: M0-2 v1 — 旧→新 変数エイリアス定義

- 作成日: 2026-04-18
- 設計者: Test Designer（TD）
- 対象サブフェーズ: **M0-2** — 既存4モックアップCSSが使用している旧CSS変数名を、新DS変数名への単方向エイリアスとして `docs/mockup/co-tokens.css` に追加する
- 参照資料:
  - ガバナンス: `docs/plan/ds-migration-governance.md`
  - 移行計画: `docs/plan/ds-migration-plan.md`
  - M0-1 合格レポート: `docs/plan/phase-logs/m0-1-sc-v1.md` (98/100 合格)
  - 対象ファイル（書込）: `docs/mockup/co-tokens.css`
  - 既存モックアップ（調査対象、**本サブフェーズでは改変禁止**）:
    - `docs/mockup/order-book.css`
    - `docs/mockup/weekly-schedule.css`
    - `docs/mockup/quick-access.css`
    - `docs/mockup/screen-layout.css`

---

## 1. 目的

既存4モックアップCSSが `:root` ブロックで定義・参照している**旧CSS変数名**（`--base-page / --sub-primary / --shadow-sm` 等）を、新DS変数名（`--bg-page / --bg-sidebar / --elevation-*` 等）への**単方向エイリアス**として `co-tokens.css` に追加する。

この時点での到達点:

- 各モックアップCSSを**一切改変せず**に、`co-tokens.css` を先に読み込むだけで「モックアップ側の旧変数参照が、新DS値を指す」状態を作る。
- `:root` 内の旧変数定義（モックアップ側）と co-tokens.css 側のエイリアスが**値として完全一致**（同一色・同一影）していることを保証する。
- エイリアスには `@deprecated M-G で削除予定` 等のコメント注記を付け、**段階移行期間限定**であることを明示する。

### スコープ外（本サブフェーズでは行わない）

- 各モックアップCSS（`order-book.css` 等）への変更（Phase M-A 以降）
- HTMLへの `<link>` 追加（Phase M0-3）
- `body` への `palt` / `tabular-nums` 適用（Phase M0-4）
- `--text-tertiary / --text-disabled` のAA値化（既に M0-1 で co-tokens.css 側は D6.1 値。モックアップ側の旧値 `#6B9AA8 / #A0BCC5` は Phase M0-5 で更新）
- ダークテーマ対応（M0-2 は Light のみ）
- WS/SL 固有変数（`--cell-base-*` 等）の新DS変数への統廃合（Phase M-A 以降）

---

## 2. 評価項目のウェイト（M0-2 固有の調整）

M0-2は「エイリアス追加」のみで既存モックアップCSSに触れない。A（DS準拠）を主軸に、D/E 配点でエイリアス値が新DSに正確に解決されているか（色・影が新DS値になっていることを計算値で確認）を検証する。

| カテゴリ                           | 通常配点 | **M0-2 配点** | 理由                                                                                                                    |
|-----------------------------------|---------|--------------|------------------------------------------------------------------------------------------------------------------------|
| A. DS準拠（エイリアス命名・対応表） | 30      | **35**       | M0-2 は「エイリアス定義の正確さ」がほぼ全て。旧→新マッピングの完全性、循環参照なし、未定義参照なしを厳格に確認           |
| B. カラーコーディネーション         | 20      | **20**       | 旧色（`--base-page: #E9F1F6` 等）と新DS値が完全一致するかの値照合。Palette外色混入ゼロ                                  |
| C. タイポグラフィ・余白             | 15      | **0**        | 本サブフェーズでは対象外（M0-4 で実施）                                                                                  |
| D. コンポーネント一貫性             | 15      | **10**       | エイリアス経由で色・影トークンが新DSに解決されることを、CSS計算値相当で検証（grepで `--shadow-sm → var(--elevation-1)` 確認等） |
| E. 機能回帰（モックアップ無改変）    | 10      | **20**       | **モックアップCSSを一切改変していない**ことを diff で確認。改変があれば重大Claim。co-tokens.css のみを編集             |
| F. アクセシビリティ                 | 5       | **0**        | 本サブフェーズでは対象外                                                                                                |
| G. コード品質・保守性               | 5       | **15**       | `@deprecated` コメント、Phase ラベル、セクション位置、旧変数のグルーピング、削除予定マーカー、重複定義ゼロ              |
| **合計**                           | 100     | **100**      |                                                                                                                        |

---

## 3. 事前調査結果：各モックアップの :root で使われている旧変数一覧

### 3.1 order-book.css（L6〜L59）

| 行   | 旧変数                  | 旧値                                    | 新DS対応                          | マッピング方針                        |
|------|-------------------------|----------------------------------------|-----------------------------------|--------------------------------------|
| L8   | `--base-page`           | `#E9F1F6`                              | `--bg-page`                       | エイリアス追加                        |
| L9   | `--base-surface`        | `#FFFFFF`                              | `--bg-surface`                    | エイリアス追加                        |
| L10  | `--base-surface-alt`    | `#F0EDE9`                              | `--bg-surface-2`                  | エイリアス追加                        |
| L11  | `--base-muted`          | `#D3D0C8`                              | `--bg-surface-3`                  | エイリアス追加                        |
| L12  | `--base-grid`           | `#F5F5F5` **(OB固有)**                 | 新DSに無い                        | OB固有エイリアスとして `#F5F5F5` 直書き、コメントで「OB Grid背景。新DS統廃合は M-A で判断」記載 |
| L13  | `--base-grid-alt`       | `#F2F2F1` **(OB固有)**                 | 新DSに無い                        | 同上                                  |
| L14  | `--base-grid-total`     | `#F0F4F4` **(OB固有)**                 | 新DSに無い                        | 同上                                  |
| L17  | `--sub-primary`         | `#004554`                              | `--bg-sidebar`                    | エイリアス追加                        |
| L18  | `--sub-secondary`       | `#B2D5E2`                              | `--divider`                       | エイリアス追加                        |
| L21  | `--accent-primary`      | `#44A6B5`                              | `--accent-primary`                | 名前衝突（同名・同値）— 新DS側で定義済みのため重複定義回避。OB :root の定義がある限り影響なし |
| L22  | `--accent-light`        | `#5AB8C6`                              | `--accent-primary-light`          | エイリアス追加                        |
| L23  | `--accent-dim`          | `rgba(68, 166, 181, 0.12)`             | `--accent-primary-dim`            | エイリアス追加                        |
| L26  | `--text-primary`        | `#004554`                              | `--text-primary`                  | 同名・同値（新DSで定義済み）          |
| L27  | `--text-secondary`      | `#2A6B7A`                              | `--text-secondary`                | 同上                                  |
| L28  | `--text-tertiary`       | `#6B9AA8` ⚠                            | `--text-tertiary` (新:`#5A8896`)  | **値衝突**。M0-2 ではモックアップ側 :root の旧値がそのまま有効。M0-5 で統一。本サブフェーズで co-tokens.css 側で旧値に上書き戻してはいけない |
| L29  | `--text-disabled`       | `#A0BCC5` ⚠                            | `--text-disabled` (新:`#8BAEB9`)  | 同上。M0-5 で解決                     |
| L32-37 | `--day-sat / --day-sun / --day-sat-head / --day-sun-head / --day-sat-cal / --day-sun-cal` | OB固有色 | 新DSに無い | OB固有（曜日オーバーレイ）。M-A で `data-day` 属性化予定のため、M0-2 では触らない（OB :root 側の定義のまま） |
| L40  | `--divider`             | `#B2D5E2`                              | `--divider`                       | 同名・同値                            |
| L41  | `--error`               | `#DB577B`                              | `--semantic-error`                | エイリアス追加                        |
| L42  | `--error-bg`            | `rgba(219, 87, 123, 0.08)` **(OB固有 α)** | 新DSに無い（値 α が異なる） | OB固有αなので触らない。新DSで `--semantic-error-bg` 定義時に再検討 |
| L43  | `--night-text`          | `#DB577B` **(OB固有)**                 | `--semantic-error` と同値だが意味異なる | OB固有。触らない                   |
| L44  | `--success`             | `#38A169`                              | `--semantic-success`              | エイリアス追加                        |
| L45  | `--success-text`        | `#276749`                              | `--semantic-success-text`         | エイリアス追加                        |
| L46  | `--success-bg`          | `rgba(56, 161, 105, 0.1)`              | 新DSに `--semantic-success-bg` 無し | 新DSに変数無し。co-tokens.css に追加するか判断要（推奨: 新DS側には追加せず、旧変数のみをエイリアス化せず OB :root 側に残す） |
| L47  | `--warning`             | `#D69E2E`                              | `--semantic-warning`              | エイリアス追加                        |
| L48  | `--warning-text`        | `#975A16` ⚠                            | `--semantic-warning-text` (新:`#92400e`) | **値衝突**。M0-2 ではモックアップ側 :root の旧値が有効。co-tokens.css 側で旧値に戻してはいけない。Phase M-A 以降で統一 |
| L49  | `--warning-bg`          | `rgba(214, 158, 46, 0.1)`              | `--semantic-warning-bg`           | エイリアス追加（値一致）              |
| L52-58 | 後方互換変数群（既にOB側で定義済み）| 各種                                  | 新DS同名                         | OB側が `var(--base-page)` 等で自己参照する形のため、co-tokens.css 側との重複に注意。co-tokens.css 側の新DS正定義（`--bg-page: #E9F1F6`）が先に評価されるので上書きされない |

### 3.2 weekly-schedule.css（L7〜L89, Light のみ）

| 行   | 旧変数                          | 旧値                                    | 新DS対応                          | マッピング方針                        |
|------|---------------------------------|----------------------------------------|-----------------------------------|--------------------------------------|
| L9-12 | `--base-page / --base-surface / --base-surface-alt / --base-muted` | OBと同値     | `--bg-page` 系                  | エイリアス追加                        |
| L13  | `--cell-base-day`               | `#F7F5F2` **(WS固有)**                 | 新DSに無い                        | WS固有。M-A で `--bg-surface-2` 派生に再割当予定。M0-2 では WS :root 定義がそのまま有効なので触らない |
| L14  | `--cell-base-night`             | `#F0EDE9` **(WS固有、`--base-surface-alt` と同値)** | 同上 | 同上                              |
| L17-18 | `--sub-primary / --sub-secondary` | OBと同値                            | `--bg-sidebar / --divider`       | エイリアス追加                        |
| L21-23 | `--accent-primary / --accent-light / --accent-dim` | OBと同値                | `--accent-primary / -light / -dim` | エイリアス追加                       |
| L26-29 | `--text-*`                    | OBと同値（⚠旧値）                      | `--text-*`                        | 値衝突と同じ扱い（M0-5 で解決）      |
| L32  | `--divider`                     | `#B2D5E2`                              | `--divider`                       | 同名                                  |
| L34-36 | `--md-gc-bg-touo/nikkei/zennihon` | Light: 独自色                        | 新DSに無い                        | WS/SL固有。触らない                   |
| L39-46 | カテゴリ色（全て teal 同色）     | OBと不一致（WSはD5.2前の同色版）       | 新DS: 4色相分化                  | **重要**: WSの旧値は `rgba(68,166,181,0.12)` × 4。新DS `--cat-bg-*` は4色相分化。値衝突するが、**WS :root 側の旧同色定義がそのまま有効**（co-tokens.css 側の4色相分化値に上書きしない）。M-A で統一 |
| L48-51 | `--shift-bg-day/night / --shift-text-day/night` | 独自色                  | 新DSに同名が無い                  | SL/WS固有。触らない                   |
| L54-55 | `--accent-hover / --warning-dim` | 独自                                | 新DSに同名が無い                  | 触らない                              |
| L58-59 | `--past-overlay / --past-overlay-light` | 独自                            | 新DSに無い                        | 触らない                              |
| L61  | `--shadow-color`                | `rgba(0, 69, 84, 0.08)` **(WS固有)**   | 新DSに同名が無い                  | 触らない（WS固有）                    |
| L62  | `--shadow-medium`               | `rgba(0, 69, 84, 0.12)` **(WS固有)**   | `--elevation-3` 相当（値構造が異なる — 単色 rgba vs `0 4px 12px rgba()`） | **値構造衝突**。単純エイリアスではない。**M0-2 ではエイリアスを作らず、触らない**。Phase M-A で再設計 |
| L63  | `--shadow-strong`               | `rgba(0, 69, 84, 0.15)` **(WS固有)**   | 同上                              | 同上                                  |
| L65-74 | `--error / --success / --warning` 系 | OB とほぼ同じ                    | `--semantic-*`                    | エイリアス追加（値一致確認）          |
| L76-79 | `--tooltip-bg / --tooltip-color / --header-btn-bg / --header-btn-hover` | 独自 | 新DSに無い              | 触らない                              |
| L82-88 | 後方互換変数群（WS側で既に定義） | 各種                                  | 新DS同名                         | co-tokens.css 側が先に評価されるので衝突なし |

### 3.3 quick-access.css（L6〜L41）

| 行   | 旧変数                          | 旧値                   | 新DS対応                    | マッピング方針                |
|------|---------------------------------|-----------------------|----------------------------|------------------------------|
| L8-11 | `--base-*` 4個                 | OBと同値              | `--bg-*` 系                | エイリアス追加                |
| L14-15 | `--sub-primary / --sub-secondary` | OBと同値             | `--bg-sidebar / --divider` | エイリアス追加                |
| L18-20 | `--accent-primary / -light / -dim` | OBと同値            | `--accent-primary / -light / -dim` | エイリアス追加         |
| L23-26 | `--text-*`                    | OBと同値（⚠旧値）     | `--text-*`                 | 値衝突と同じ扱い（M0-5 で解決）|
| L29  | `--divider`                     | `#B2D5E2`             | `--divider`                | 同名                          |
| L30  | `--error`                       | `#DB577B`             | `--semantic-error`         | エイリアス追加                |
| L31  | `--night-text`                  | `#DB577B`             | QA固有                     | 触らない                      |
| L34-40 | 後方互換変数群                 | 各種                  | 新DS同名                   | 衝突なし                      |

### 3.4 screen-layout.css（L8〜L86, Light のみ）

| 行   | 旧変数                          | 旧値                                    | 新DS対応                          | マッピング方針                |
|------|---------------------------------|----------------------------------------|-----------------------------------|------------------------------|
| L11-15 | `--base-*` 4個                 | OBと同値                              | `--bg-*` 系                      | エイリアス追加                |
| L20-21 | `--sub-primary / --sub-secondary` | OBと同値                             | `--bg-sidebar / --divider`       | エイリアス追加                |
| L26-28 | `--accent-primary / -light / -dim` | OBと同値                           | `--accent-primary / -light / -dim` | エイリアス追加              |
| L31-34 | `--text-*`                    | OBと同値（⚠旧値）                      | `--text-*`                        | 値衝突（M0-5 で解決）         |
| L37  | `--divider`                     | `#B2D5E2`                              | `--divider`                       | 同名                          |
| L40-42 | `--md-gc-bg-touo/nikkei/zennihon` | Light: 独自色                        | 新DSに無い                        | 触らない                      |
| L44-52 | カテゴリ色（全て teal 同色、D5.2前の同色版） | OBと不一致                     | 新DS: 4色相分化                  | **WSと同じ値衝突**。SL :root の旧同色定義が有効。co-tokens.css 側の4色相分化値に上書きしない。M-A で統一 |
| L54-57 | `--shift-bg-day/night / --shift-text-day/night` | 独自色                  | 新DSに同名が無い                  | 触らない                      |
| L60-62 | `--shadow-color / --shadow-medium / --shadow-strong` | WSと同じ単色rgba          | `--elevation-*` とは値構造が異なる | **エイリアス作らず、触らない**（Phase M-A で再設計）|
| L63-72 | `--error / --success / --warning` 系 | OB とほぼ同じ                    | `--semantic-*`                    | エイリアス追加                |
| L73-76 | `--tooltip-* / --header-btn-*` | 独自                                  | 新DSに無い                        | 触らない                      |
| L79-85 | 後方互換変数群                 | 各種                                  | 新DS同名                         | 衝突なし                      |

### 3.5 4モックアップで未登場だが TD マッピング表に含まれる変数

TD 指定のマッピング表には以下があるが、4モックアップの `:root` には**未定義**（＝使われていない）もの:

- `--shadow-sm / --shadow-md / --shadow-lg` — モックアップ `:root` で定義は無い。ただし各モックアップCSS本文で `box-shadow: var(--shadow-sm)` 等として**参照されている可能性**がある
- co-navbar.css 等の共有CSSで定義されている可能性もある

→ TE チェックで「`--shadow-sm / -md / -lg` が4モックアップCSS本文もしくは共有CSSで参照されているか grep」を追加する。

---

## 4. テストチェックリスト（Test Executor 実施）

### A. DS準拠（エイリアス定義の正確さ） — 35点

**A-1** co-tokens.css に `/* ----- legacy aliases (deprecated) ----- */` セクション（または類似の明示的見出し）が追加されているか。grep パターン: `legacy|deprecated|alias`

**A-2** 以下の必須エイリアス17種すべてが co-tokens.css 内で `var(--新DS変数)` として定義されているか（grep で行番号取得）:
- [ ] `--base-page: var(--bg-page);`
- [ ] `--base-surface: var(--bg-surface);`
- [ ] `--base-surface-alt: var(--bg-surface-2);`
- [ ] `--base-muted: var(--bg-surface-3);`
- [ ] `--sub-primary: var(--bg-sidebar);`
- [ ] `--sub-secondary: var(--divider);`
- [ ] `--accent: var(--accent-primary);`（co-navbar.css 互換で既に参照あり）
- [ ] `--accent-light: var(--accent-primary-light);`
- [ ] `--accent-dim: var(--accent-primary-dim);`
- [ ] `--error: var(--semantic-error);`
- [ ] `--success: var(--semantic-success);`
- [ ] `--success-text: var(--semantic-success-text);`
- [ ] `--warning: var(--semantic-warning);`
- [ ] `--warning-text: var(--semantic-warning-text);`
- [ ] `--warning-bg: var(--semantic-warning-bg);`
- [ ] `--shadow-sm: var(--elevation-1);`
- [ ] `--shadow-md: var(--elevation-3);`
- [ ] `--shadow-lg: var(--elevation-4);`
- [ ] `--shadow-medium: var(--elevation-3);`
- [ ] `--shadow-strong: var(--elevation-5);`

**A-3** 各エイリアスの右辺が `var(--xxx)` の形式（値直書きではなく参照）か。値直書きは不正。

**A-4** エイリアス定義は `:root` ブロック内（既存の `:root` の末尾、`density mode overrides` より前）に配置されているか。

**A-5** co-tokens.css 内で、定義されていない変数を参照しているエイリアスがないか（未定義参照チェック）。grep で `var(--` を全抽出し、右辺の変数名がすべて co-tokens.css 内で定義済みであることを確認。

**A-6** 循環参照がないか。例: `--base-page: var(--bg-page); --bg-page: var(--base-page);` のような相互参照。

**A-7** 後方互換を意図した旧エイリアス（`--accent: var(--accent-primary)` 等、既存 M0-1 の下半分に書かれているもの）が**意図通り**この legacy aliases セクションに統合されているか、または別セクションに分離されているか。分離している場合はその方針がコメントで明示されているか。

**A-8** legacy aliases セクション内でも新DS変数（`--bg-page` 等）が**再定義されていない**か（再定義すると値が上書きされて壊れる）。

### B. カラーコーディネーション（値照合） — 20点

**B-1** 各旧変数の**実効値**（解決後の色）が、M0-1 で確定した新DS値と完全一致するか（CSS計算値相当）:
- [ ] `--base-page` → `#E9F1F6`（`--bg-page` の値）
- [ ] `--base-surface` → `#FFFFFF`
- [ ] `--base-surface-alt` → `#F0EDE9`
- [ ] `--base-muted` → `#D3D0C8`
- [ ] `--sub-primary` → `#004554`
- [ ] `--sub-secondary` → `#B2D5E2`
- [ ] `--accent-light` → `#5AB8C6`
- [ ] `--accent-dim` → `rgba(68, 166, 181, 0.12)`
- [ ] `--error` → `#DB577B`
- [ ] `--success` → `#38A169`
- [ ] `--success-text` → `#276749`
- [ ] `--warning` → `#D69E2E`
- [ ] `--warning-text` → `#92400e`（**注**: M0-1 の新DS値。モックアップ旧値 `#975A16` とは異なる — 意図的）
- [ ] `--warning-bg` → `rgba(214, 158, 46, 0.1)`

**B-2** `--shadow-sm/md/lg/medium/strong` が `--elevation-*` 経由で解決されたとき、`box-shadow` として有効な CSS 値（`0 Xpx Ypx rgba(...)`）であるか。`none` や空文字に解決されないこと。
- [ ] `--shadow-sm` → `0 1px 2px rgba(0, 69, 84, 0.06)`
- [ ] `--shadow-md` → `0 4px 12px rgba(0, 69, 84, 0.10)`
- [ ] `--shadow-lg` → `0 8px 24px rgba(0, 69, 84, 0.14)`
- [ ] `--shadow-medium` → `0 4px 12px rgba(0, 69, 84, 0.10)`
- [ ] `--shadow-strong` → `0 16px 48px rgba(0, 69, 84, 0.18)`

**B-3** Coastal Palette 外の色（エイリアス値として想定外の色）が混入していないか。

**B-4** `--warning-text` の値衝突について、co-tokens.css 側は M0-1 で確定の `#92400e`。モックアップ側 :root の旧値 `#975A16` はエイリアスにより上書きされる — これが意図通りか、コメントで言及されているか。

### D. コンポーネント一貫性（解決後の影・色） — 10点

**D-1** ブラウザで co-tokens.css のみを読み込んだ仮想ページで、`element.style.setProperty('background', 'var(--base-page)')` 相当の解決値が `rgb(233, 241, 246)` になるか。実ブラウザ DevTools もしくは node-css-calc による計算値照合を行うか、grep と手計算で代替可能。

**D-2** `--shadow-medium` が `--elevation-3` に解決されたとき、各モックアップCSSで `box-shadow: var(--shadow-medium)` を使っている箇所が**新DSの影レシピ**（`0 4px 12px rgba(0,69,84,0.10)`）になるか（視覚想定）。

**D-3** カテゴリ色（`--cat-bg-facility` 等）について、co-tokens.css の **新DS値（4色相分化）** と、WS/SL :root の**旧値（teal 同色）** が**衝突**する。co-tokens.css が先に読み込まれるため、モックアップ :root の同名定義が後勝ちで上書きする設計になっていること（＝M0-2 では見た目が変わらない）をコメントで明示しているか。

### E. 機能回帰（既存モックアップ無改変） — 20点

**E-1** `git diff` でモックアップCSS4ファイル（`order-book.css / weekly-schedule.css / quick-access.css / screen-layout.css`）が**一切変更されていない**こと。1行でも差分があれば**重大Claim**。

**E-2** `git diff` で co-navbar.css / co-shared-badges.css / co-tokens.css 以外の共有CSSが変更されていないこと。

**E-3** HTMLファイル（`order-book.html / weekly-schedule.html / quick-access.html / screen-layout.html`）が変更されていないこと（M0-3 で行う作業）。

**E-4** co-tokens.css の既存（M0-1 で確定）コンテンツ（L1〜L199相当）が**一切変更されていない**こと。追加のみが許される。diff を取って既存行の変更がゼロであることを確認。

**E-5** co-tokens.css 内の density mode overrides（`:root[data-density="..."]` ブロック）より前、または後ろのどちらに legacy aliases セクションを配置するかが論理的に整理されているか（推奨: density overrides より前、:root の末尾）。配置理由がコメントで説明されているか。

**E-6** モックアップHTMLを実ブラウザで開いたときの見た目が M0-1 合格時点から変化していないこと（本サブフェーズは見た目を変えない）。**注**: M0-3 でリンクを張る前なので、co-tokens.css はまだ4モックアップには参照されていない。このチェックは「co-tokens.css 自体が壊れたCSSになっていないか」の syntax validity チェックに置き換える。CSSパーサ（ブラウザDevTools / stylelint）でパースエラーなく読み込めることを確認。

### G. コード品質・保守性 — 15点

**G-1** legacy aliases セクションのヘッダコメントに「エイリアスは段階移行期間限定」「Phase M-G（旧クラス撤去）で削除予定」の趣旨が明記されているか。

**G-2** Phase ラベル（`@deprecated` や `/* Phase M0-2 — legacy */` 等）がセクションコメントに付与されているか。M0-1 SCレポートで指摘された「Phase ラベルの統一付与」の方針に沿っているか。

**G-3** エイリアスが用途グループ（base / sub / accent / semantic / shadow）ごとに**小見出し**で整理されているか。単なる縦並び列挙ではなく、視覚的に走査しやすい構造か。

**G-4** エイリアスごとに、対応する新DS変数名を示すインラインコメント（`/* -> --bg-page */` 等）があるか、あるいは右辺の `var(--bg-page)` が自己説明的であることで十分か。co-tokens.css の他セクションのコメントスタイルと整合しているか。

**G-5** OB/WS/SL/QA 固有の変数（`--base-grid / --cell-base-day / --shift-bg-*` など co-tokens.css に統合しないもの）について、co-tokens.css の legacy aliases セクションで**扱わない方針**を明示したコメントがあるか。「これらは各モックアップ :root で引き続き定義される。Phase M-A で個別対応」等。

**G-6** 重複定義ゼロ（同じエイリアスが2回書かれていない）。

**G-7** 2スペースインデント統一（M0-1 の規約踏襲）。

**G-8** TODO / FIXME コメントがあれば意図的なもので、Phase 番号と紐づいているか。

**G-9** M0-1 SCレポートの引き継ぎ事項に記載された「本ファイル末尾に `/* ----- legacy aliases (deprecated) ----- */` セクションを追加し、廃止予定マーカー併記」という方針が**そのまま実装されているか**。

**G-10** セクション見出しのフォーマット（`/* ----- section.name ----- */`）が M0-1 の既存セクションと一貫しているか。

### その他（grep / 全体整合）

**H-1** co-tokens.css に**モックアップCSSに無い変数のエイリアス**を作っていないか（過剰実装）。TDマッピング表にあるが 3.5 節で未登場だった `--shadow-sm/-md/-lg` については、共有CSSで使われているか grep で確認:
  - grep: `\-\-shadow\-sm|\-\-shadow\-md|\-\-shadow\-lg` を `docs/mockup/*.css` / `docs/ui-components/*.css` / `docs/*.html` で検索
  - 0件なら過剰実装（警告）、1件以上なら実装妥当

**H-2** co-tokens.css の行数が M0-1 時点（約200行）から**過剰増加**（例: +200行以上）していないか。適正規模は +30〜+60 行程度（エイリアス17〜20個 + コメント）。

**H-3** styles-light.css には本エイリアスが**追加されていない**こと（styles-light.css は DS Single Source of Truth で、legacy aliases は co-tokens.css 専用）。

---

## 5. 重大Claim判定基準

以下のいずれか1件でも該当すれば**総合点に関わらず不合格**:

**C-1** 既存モックアップCSS（`order-book.css / weekly-schedule.css / quick-access.css / screen-layout.css`）が変更されている（E-1）

**C-2** co-tokens.css の既存コンテンツ（M0-1 で確定した L1〜L199 相当）が変更されている（E-4）— 既存トークン定義が書き換わると新DS Single Source of Truth が崩れる

**C-3** エイリアスの右辺が誤った新DS変数を指している（例: `--error: var(--semantic-success)` のような取り違え）

**C-4** エイリアスが値直書き（例: `--error: #DB577B`）で、新DS変数への参照になっていない — 単一情報源が崩れる

**C-5** 循環参照が存在する（例: `--base-page: var(--bg-page); --bg-page: var(--base-page);`）

**C-6** 未定義変数を参照している（例: `--shadow-sm: var(--elevation-1)` だが `--elevation-1` が co-tokens.css で未定義、という状況）

**C-7** CSS シンタックスエラー（セミコロン抜け、括弧不整合、コメント未閉じ等）で co-tokens.css がブラウザでパースエラーとなる

**C-8** HTMLファイルもしくは styles-light.css / tokens.json に誤って legacy aliases を追加している

**C-9** Coastal Palette 外の色、絵文字・Unicode記号が混入している（全サブフェーズ共通）

---

## 6. 合格条件

- **総合点 ≥ 70点**（35+20+10+20+15=100 のウェイトで採点）
- **重大Claim = 0件**

両方を同時に満たしたときのみ合格。1つでも欠ければ再実装（IM）に差し戻し。

---

## 7. Test Executor への実施メモ

- 検証はすべて **grep + ファイル読み取り + git diff** で完結できる（ブラウザ動作確認は任意）
- 実効値の照合（B-1）は手計算でよい: `--base-page: var(--bg-page)` の `--bg-page` 定義を co-tokens.css L21 で確認 → `#E9F1F6` を確認、という手順
- 4モックアップCSS / HTMLに差分がないかは `git diff docs/mockup/*.css docs/*.html` 一発で確認
- co-tokens.css の syntax validity は `npx stylelint docs/mockup/co-tokens.css` または VSCode CSS parser で確認可能
- 報告ファイル: `docs/plan/phase-logs/m0-2-te-v1.md`（TE用テンプレートに沿う）

---

## 8. Implementer への実装指針（参考）

（TDスコープ外だが、TE/SC が IM成果物を評価する際の期待形）

```css
/* co-tokens.css 末尾（density overrides より前）に追加するイメージ */

  /* ============================================================
     legacy aliases (deprecated)
     Phase M0-2 — 段階移行期間限定の旧→新エイリアス
     @deprecated — Phase M-G（旧クラス撤去）で削除予定
     用途: 既存4モックアップCSS（order-book / weekly-schedule /
           quick-access / screen-layout）が参照している旧変数名を、
           モックアップ側を改変せずに新DS値へ解決するための単方向エイリアス。
     注意: モックアップ :root で同名定義がある場合は、モックアップ側の
           定義が後勝ちで上書きする。本エイリアスは co-tokens.css のみ
           読み込んだ状態、または :root で未定義の変数を参照した場合の
           フォールバック値として機能する。
     非対象: --base-grid* (OB固有) / --cell-base-* (WS固有) /
             --shift-bg-* (WS/SL固有) / --md-gc-bg-* (WS/SL固有) /
             --shadow-color/medium/strong の単色rgba版 (WS/SL固有、
             新DS elevation と値構造が異なる。Phase M-A で再設計)
     ============================================================ */

  /* base */
  --base-page:        var(--bg-page);
  --base-surface:     var(--bg-surface);
  --base-surface-alt: var(--bg-surface-2);
  --base-muted:       var(--bg-surface-3);

  /* sub */
  --sub-primary:   var(--bg-sidebar);
  --sub-secondary: var(--divider);

  /* accent */
  --accent:       var(--accent-primary);
  --accent-light: var(--accent-primary-light);
  --accent-dim:   var(--accent-primary-dim);

  /* semantic */
  --error:        var(--semantic-error);
  --success:      var(--semantic-success);
  --success-text: var(--semantic-success-text);
  --warning:      var(--semantic-warning);
  --warning-text: var(--semantic-warning-text);
  --warning-bg:   var(--semantic-warning-bg);

  /* shadow → elevation */
  --shadow-sm:     var(--elevation-1);
  --shadow-md:     var(--elevation-3);
  --shadow-lg:     var(--elevation-4);
  --shadow-medium: var(--elevation-3);
  --shadow-strong: var(--elevation-5);
```

以上。
