# M-A2 Test Design (TD) v1

サブフェーズ: **M-A2 — Order Book CSS 本文の旧変数参照を新DS変数に置換**

作成者: Test Designer (TD)
作成日: 2026-04-18
参照: `docs/plan/ds-migration-governance.md` / `docs/plan/ds-migration-plan.md` / `docs/ui-components/styles-light.css` / `docs/mockup/co-tokens.css` / `docs/plan/phase-logs/m-a1-td-v1.md`

---

## 1. 目的

`docs/mockup/order-book.css` の **本文（L28 以降）に残存する「旧変数名による `var(--xxx)` 参照」を、新DS変数名（co-tokens.css の新DS一次定義）へ一括置換**する。

これにより OB CSS 本文は「legacy alias 経由の暗黙解決」に依存しなくなり、co-tokens.css 側の legacy alias セクションを将来削除しても OB 単独で整合が取れる状態になる。

**コア原則**:

- 置換は「旧変数名 → 新DS変数名」への**1対1の文字列置換**で実施
- 置換後の `var(--xxx)` が解決する**色値は M-A1 完了時点と完全に一致**（見た目不変が絶対条件）
- OB固有変数（`--base-grid*` / `--day-*` / `--error-bg` / `--night-text` / `--success-bg` / `--warning-text`）への参照は**一切書き換えない**
- 新DS同名の変数（`--accent-primary` / `--text-primary` / `--text-secondary` / `--text-tertiary` / `--text-disabled` / `--divider`）は参照のまま放置（置換不要）
- `co-tokens.css` / 他3モックアップCSS / `styles-light.css` / HTML / JS / `tokens.json` は一切触らない

**スコープ限定**:

- 変更対象は `docs/mockup/order-book.css` 1ファイルのみ
- M-A1 完了コミット（b0b7bdb）時点の見た目から**変化ゼロ**が必須

---

## 2. 配点（M-A2 特化ウェイト）

| 区分 | 配点 | 観点 |
|------|------|------|
| A. DS準拠（旧変数参照の駆逐） | **30** | 置換対象の旧変数参照が 0件、新DS変数への置換が完全 |
| B. カラー（見た目一致） | 15 | 置換後の解決値が M-A1 時点と完全一致。Coastal Palette 外の混入なし |
| D. コンポーネント一貫性（OB固有変数・残留参照の保全） | 15 | `--base-grid*` / `--day-*` / `--warning-text` / `--night-text` / `--error-bg` / `--success-bg` の参照は変化ゼロ |
| E. 機能回帰・見た目不変 | **30** | OB 実ブラウザで M-A1 時点と視覚差分ゼロ。CSS パースエラーゼロ。JS（`order-book.js`）への影響ゼロ |
| G. コード品質・保守性 | 10 | 置換一貫性、コメントや近傍コードの不整合の解消 |
| **合計** | **100** | — |

**合格条件**: 総合 70点以上 AND 重大Claim = 0

※ M-A1 と同配分。見た目不変を最重視（E=30）。新DS導入は無く、あくまで参照名の書き換えであるため B/C/F 系は縮小。

---

## 3. 事前調査結果

### 3.1 OB CSS 本文（L28以降）の旧変数参照カウント（置換対象）

`docs/mockup/order-book.css` を `Grep` で計測。`:root`（L6〜L27）外の参照数を対象とする（:root は M-A1 で OB固有13変数のみに整理済み）。

| 旧変数名 | 参照数 | 新DS変数名（置換先） | 解決値 | 分類 |
|---------|-------|---------------------|--------|------|
| `var(--base-page)` | **2** | `var(--bg-page)` | `#E9F1F6` | 置換 |
| `var(--base-surface)` | **19** | `var(--bg-surface)` | `#FFFFFF` | 置換 |
| `var(--base-surface-alt)` | **10** | `var(--bg-surface-2)` | `#F0EDE9` | 置換 |
| `var(--base-muted)` | **5** | `var(--bg-surface-3)` | `#D3D0C8` | 置換 |
| `var(--sub-primary)` | **1** | `var(--bg-sidebar)` | `#004554` | 置換 |
| `var(--sub-secondary)` | **6** | `var(--divider)` | `#B2D5E2` | 置換 |
| `var(--accent-light)` | **3** | `var(--accent-primary-light)` | `#5AB8C6` | 置換 |
| `var(--accent-dim)` | **26** | `var(--accent-primary-dim)` | `rgba(68,166,181,0.12)` | 置換 |
| `var(--error)` ※単独 | **16** | `var(--semantic-error)` | `#DB577B` | 置換 |
| `var(--success)` ※単独 | **2** | `var(--semantic-success)` | `#38A169` | 置換 |
| `var(--success-text)` | **1** | `var(--semantic-success-text)` | `#276749` | 置換 |
| `var(--warning)` ※単独 | **2** | `var(--semantic-warning)` | `#D69E2E` | 置換 |
| `var(--warning-bg)` | **1** | `var(--semantic-warning-bg)` | `rgba(214,158,46,0.1)` | 置換 |
| **置換対象 合計** | **94件** | — | — | — |

※「単独」= `--error-bg` / `--success-bg` / `--warning-text` / `--warning-bg` を含まない純粋な `var(--error)` / `var(--success)` / `var(--warning)` の参照。grep 結果の個別行を検分して確定。

### 3.2 OB CSS 本文の参照のうち「置換対象外」（変更禁止）

| 変数名 | 参照数 | 扱い |
|-------|-------|------|
| `var(--accent-primary)` | 74 | 新DS同名のため**そのまま**（置換不要） |
| `var(--text-primary)` | 24 | 新DS同名（M-A1 で整合確認済）。**そのまま** |
| `var(--text-secondary)` | 22 | 新DS同名。**そのまま** |
| `var(--text-tertiary)` | 25 | 新DS同名。**そのまま** |
| `var(--text-disabled)` | 14 | 新DS同名。**そのまま** |
| `var(--divider)` | 50 | 新DS同名。**そのまま** |
| `var(--base-grid*)` | 14 | OB固有（co-tokens 未収載）。**そのまま** |
| `var(--day-*)` | 9 | OB固有。**そのまま** |
| `var(--error-bg)` | 2 | OB固有（α値独自）。**そのまま** |
| `var(--night-text)` | 13 | OB固有。**そのまま** |
| `var(--success-bg)` | 0 | 定義はあるが本文参照ゼロ（M-A3 以降で削除検討）。**そのまま** |
| `var(--warning-text)` | 5 | OB 側 `:root` で `#975A16` にオーバーライド中（値不一致・M-A1 残留）。**そのまま** |

### 3.3 shadow系（`--shadow-*`）の扱い

- `Grep var\(--shadow-` の結果: **0件**（OB CSS 本文では `var(--shadow-*)` を一切使っていない）
- 従って M-A2 のスコープでは shadow 系の置換判断は**不要**
- `--elevation-*` への置換方針は OB では**該当なし**として、将来 WS/QA のフェーズで再評価する

### 3.4 置換対象外の近接キーワード（誤置換防止の警戒ライン）

以下の部分文字列は、単純な `var(--error)` 置換で誤ヒットさせてはならない:

- `var(--error-bg)` — `--error-bg` はそのまま残す。`var(--error)` を `var(--semantic-error)` に置換する際、正規表現は**語境界つき**で `var\(--error\)` を指定すること
- `var(--success-bg)` / `var(--success-text)` — `var(--success)` 置換と衝突注意。置換先は:
  - `var(--success)` → `var(--semantic-success)`
  - `var(--success-text)` → `var(--semantic-success-text)`（別ルール）
  - `var(--success-bg)` → **そのまま**
- `var(--warning-bg)` / `var(--warning-text)` — `var(--warning)` 置換と衝突注意。置換先は:
  - `var(--warning)` → `var(--semantic-warning)`
  - `var(--warning-bg)` → `var(--semantic-warning-bg)`（別ルール）
  - `var(--warning-text)` → **そのまま**
- `var(--accent-primary-light)` / `var(--accent-primary-dim)` / `var(--accent-primary-*)` — 置換後の新DS変数名と干渉しないか grep で事後確認
- `var(--base-grid)` / `var(--base-grid-alt)` / `var(--base-grid-total)` — `var(--base-*)` 置換系で誤ヒットさせない

### 3.5 M-A1 成果物との差分境界

M-A2 では以下に差分が発生してはならない:

- `docs/mockup/co-tokens.css`
- `docs/mockup/order-book.html` / `weekly-schedule.html` / `quick-access.html` / `screen-layout.html`
- `docs/mockup/weekly-schedule.css` / `quick-access.css` / `screen-layout.css`
- `docs/ui-components/styles-light.css` / `tokens.json`
- すべての JS ファイル（特に `docs/mockup/order-book.js`）
- OB CSS の `:root` ブロック（L6〜L27 = M-A1 で確定した OB固有13変数のみ）

---

## 4. 置換マッピング（TD 最終確定）

### 4.1 置換ルール表（13ルール）

| # | 置換前（grep で検索する正規表現） | 置換後 | 想定件数 |
|---|----------------------------------|--------|---------|
| R1 | `var\(--base-page\)` | `var(--bg-page)` | 2 |
| R2 | `var\(--base-surface\)`（**単独**） | `var(--bg-surface)` | 19 |
| R3 | `var\(--base-surface-alt\)` | `var(--bg-surface-2)` | 10 |
| R4 | `var\(--base-muted\)` | `var(--bg-surface-3)` | 5 |
| R5 | `var\(--sub-primary\)` | `var(--bg-sidebar)` | 1 |
| R6 | `var\(--sub-secondary\)` | `var(--divider)` | 6 |
| R7 | `var\(--accent-light\)` | `var(--accent-primary-light)` | 3 |
| R8 | `var\(--accent-dim\)` | `var(--accent-primary-dim)` | 26 |
| R9 | `var\(--error\)`（単独、`-bg` 等を含まない） | `var(--semantic-error)` | 16 |
| R10 | `var\(--success\)`（単独、`-text` / `-bg` を含まない） | `var(--semantic-success)` | 2 |
| R11 | `var\(--success-text\)` | `var(--semantic-success-text)` | 1 |
| R12 | `var\(--warning\)`（単独、`-text` / `-bg` を含まない） | `var(--semantic-warning)` | 2 |
| R13 | `var\(--warning-bg\)` | `var(--semantic-warning-bg)` | 1 |
| | **合計** | | **94** |

### 4.2 置換順序の推奨

**長い文字列から短い文字列の順に置換する**（部分一致の誤爆防止）:

1. `var(--base-surface-alt)` → `var(--bg-surface-2)` （R3 を R2 より先に）
2. `var(--success-text)` → `var(--semantic-success-text)` （R11 を R10 より先に）
3. `var(--warning-bg)` → `var(--semantic-warning-bg)` （R13 を R12 より先に）
4. `var(--accent-dim)` / `var(--accent-light)` （R7/R8）
5. `var(--base-surface)` → `var(--bg-surface)` （R2、R3 後）
6. `var(--base-page)` / `var(--base-muted)` （R1/R4）
7. `var(--sub-primary)` / `var(--sub-secondary)` （R5/R6）
8. `var(--error)` / `var(--success)` / `var(--warning)` 単独（R9/R10/R12、最後）

**推奨実装手段**: エディタの「正規表現で完全一致置換」を用い、各ルールを**個別に**適用する。ひとつのルールで置換件数が想定と一致することを逐次確認。

### 4.3 コメント・視覚物の周辺確認

以下の近傍コードに、旧変数名を示唆するコメントが残っていないか確認し、必要なら併せて更新する:

- `/* accent-light を使用 */` 等のコメント文字列（存在すれば `/* accent-primary-light を使用 */` に）
- 過去のコミットで残っているブロックコメント内の旧変数名

ただし、コメント内の旧変数名を機械的に全置換するのは避け、**意味が通じる範囲で個別判断**する（legacy alias が co-tokens.css に残っているので、「旧名のほうが一般的」な記述ならそのまま残してよい）。

---

## 5. テストチェックリスト（27項目）

### A. DS準拠（旧変数参照の駆逐・新変数への完全置換）

- [ ] **T1** `Grep "var\(--base-page\)"` の結果が **0件**
- [ ] **T2** `Grep "var\(--base-surface\)"` の結果が `var(--base-surface-alt)` を除いて **0件**（検索は `var\(--base-surface\)[,)]` 等で確認、または文字列一致で）
- [ ] **T3** `Grep "var\(--base-surface-alt\)"` の結果が **0件**
- [ ] **T4** `Grep "var\(--base-muted\)"` の結果が **0件**
- [ ] **T5** `Grep "var\(--sub-primary\)"` の結果が **0件**
- [ ] **T6** `Grep "var\(--sub-secondary\)"` の結果が **0件**
- [ ] **T7** `Grep "var\(--accent-light\)"` の結果が **0件**
- [ ] **T8** `Grep "var\(--accent-dim\)"` の結果が **0件**
- [ ] **T9** `Grep "var\(--error\)[,)]"` の結果が **0件**（`var(--error-bg)` は残留のため除外）
- [ ] **T10** `Grep "var\(--success\)[,)]"` の結果が **0件**（`var(--success-bg)` は残留のため除外）
- [ ] **T11** `Grep "var\(--success-text\)"` の結果が **0件**
- [ ] **T12** `Grep "var\(--warning\)[,)]"` の結果が **0件**（`var(--warning-bg)` / `var(--warning-text)` は残留のため除外）
- [ ] **T13** `Grep "var\(--warning-bg\)"` の結果が **0件**
- [ ] **T14** 新DS変数への置換後の参照数が想定どおり（`Grep "var\(--bg-page\)"` = 2、`var(--bg-surface)` = 19、`var(--bg-surface-2)` = 10、`var(--bg-surface-3)` = 5、`var(--bg-sidebar)` = 1、`var(--accent-primary-light)` = 既存3 + 追加3、`var(--accent-primary-dim)` = 既存0 + 追加26、`var(--semantic-error)` = 16、`var(--semantic-success)` = 2、`var(--semantic-success-text)` = 1、`var(--semantic-warning)` = 2、`var(--semantic-warning-bg)` = 1）
- [ ] **T15** `Grep "var\(--divider\)"` の結果が M-A1 時点の 50件 + R6 による追加 6件 = **56件**（`var(--sub-secondary)` が全て `var(--divider)` に置換された）

### B. カラー（値一致）

- [ ] **T16** DevTools で OB body の背景色が `#E9F1F6` のまま（`getComputedStyle(document.body).backgroundColor` で検証）
- [ ] **T17** DevTools で `.md-ob-header` の背景色が `#004554`（`--bg-sidebar` 解決値）のまま
- [ ] **T18** DevTools でエラー表現箇所（`.md-ob-btn-danger` 等）の `color` が `#DB577B`（`--semantic-error` 解決値）のまま
- [ ] **T19** DevTools で `--accent-primary-dim` 依存要素（ホバー背景等）が `rgba(68,166,181,0.12)` のまま

### D. OB固有変数・残留変数の保全

- [ ] **T20** `Grep "var\(--base-grid\)|var\(--base-grid-alt\)|var\(--base-grid-total\)"` の件数が M-A1 時点と**完全一致**（14件）
- [ ] **T21** `Grep "var\(--day-"` の件数が M-A1 時点と**完全一致**（9件）
- [ ] **T22** `Grep "var\(--error-bg\)"` の件数 = 2、`Grep "var\(--night-text\)"` = 13、`Grep "var\(--warning-text\)"` = 5 のまま（いずれも M-A1 時点と一致）
- [ ] **T23** `Grep "var\(--accent-primary\)"` の件数が M-A1 時点と**完全一致**（74件、ただし `var(--accent-primary-light)` / `var(--accent-primary-dim)` はカウント除外）
- [ ] **T24** `Grep "var\(--text-primary\)|var\(--text-secondary\)|var\(--text-tertiary\)|var\(--text-disabled\)"` の件数が M-A1 時点と**完全一致**（24 + 22 + 25 + 14 = 85件）

### E. 機能回帰・見た目不変

- [ ] **T25** `order-book.html` を実ブラウザで開き、**M-A1 完了コミット（b0b7bdb）時点のスクリーンショットと目視比較して差分ゼロ**（ヘッダ・サイドバー・テーブル・曜日オーバーレイ・合計行・モーダル・バッジ・ボタン・エラー表示・警告表示・成功表示 全て）
- [ ] **T26** DevTools Console に CSS 未定義変数によるエラー・警告が **0件**（特に `var(--bg-*)` / `var(--semantic-*)` / `var(--accent-primary-*)` / `var(--divider)` がすべて co-tokens.css 経由で解決される）
- [ ] **T27** OB の主要インタラクション（行選択・編集モーダル開閉・フィルタ・タブ切替・ドラッグ&ドロップ・日付選択・現場詳細モーダル等）が全て M-A1 時点と同じく動作する
- [ ] **T28** `docs/mockup/order-book.js`（および OB が読み込む全 JS）への **差分ゼロ**（`git diff -- docs/mockup/order-book.js` が空）
- [ ] **T29** OB CSS の `:root` ブロック（L6〜L27）が M-A1 時点と**完全一致**（OB固有13変数のみ、値もコメントも変化なし）

### F. ドキュメント整合（他ファイル非波及）

- [ ] **T30** `git diff` の対象ファイルが **`docs/mockup/order-book.css` 1 ファイルのみ**（phase-logs 以外）
- [ ] **T31** `co-tokens.css` / `styles-light.css` / `tokens.json` / 他3モックアップCSS (`weekly-schedule.css` / `quick-access.css` / `screen-layout.css`) / 全HTMLファイル / 全JSファイル に**差分ゼロ**

### G. コード品質・保守性

- [ ] **T32** 置換後、近傍コメントに「旧変数名」が残っていて紛らわしい箇所がないか目視確認（意味が通じなくなっているコメントがあれば更新）
- [ ] **T33** 置換後の CSS が prettier 等のフォーマッタ基準で整っている（行の折り返し・インデントが M-A1 時点と整合）

---

## 6. 重大Claim（検出された場合は即 FAIL）

| # | Claim | 検査方法 |
|---|-------|---------|
| **C1** | **置換漏れ**: 旧変数（`--base-page` / `--base-surface` / `--base-surface-alt` / `--base-muted` / `--sub-primary` / `--sub-secondary` / `--accent-light` / `--accent-dim` / `--error` / `--success` / `--success-text` / `--warning` / `--warning-bg`）のいずれかの参照が 1件でも残存 | T1〜T13 |
| **C2** | **誤置換**: 新DS変数への置換先が間違っている（例: `--accent-dim` を `--accent-primary-light` に置換してしまった等） | T14, T16〜T19 |
| **C3** | **OB固有変数を誤って書き換えた**: `var(--base-grid*)` / `var(--day-*)` / `var(--error-bg)` / `var(--night-text)` / `var(--success-bg)` / `var(--warning-text)` の参照数が M-A1 時点から変化 | T20〜T22 |
| **C4** | **残留対象変数を誤って書き換えた**: `var(--accent-primary)` / `var(--text-primary/secondary/tertiary/disabled)` / `var(--divider)` の参照数が想定外の変化（`--sub-secondary` → `--divider` 置換による +6 以外の増減） | T15, T23, T24 |
| **C5** | **shadow系を誤って触った**: `var(--shadow-*)` / `var(--elevation-*)` が OB CSS 本文に新規出現（M-A2 スコープ外のはず、本文参照は 0件が正） | `Grep "var\(--shadow-\|var\(--elevation-"` の結果が 0件 |
| **C6** | **`:root` を触った**: M-A1 で確定した OB固有13変数の `:root` ブロックに差分発生 | T29 |
| **C7** | **`co-tokens.css` を改変した**: M-A2 は `co-tokens.css` を一切触らない | T31 |
| **C8** | **他モックアップCSS / HTML / JS / `styles-light.css` / `tokens.json` に差分発生** | T28, T30, T31 |
| **C9** | **実ブラウザで OB の見た目が M-A1 時点から変化** | T25 |
| **C10** | **CSS 未定義変数エラーが発生**（特に `--bg-*` / `--semantic-*` / `--accent-primary-light` / `--accent-primary-dim` が co-tokens.css で解決されないケース） | T26 |

---

## 7. 合格条件

- 全 33項目の検証に基づく総合点が **70点以上**
- 重大Claim（C1〜C10）が **0件**

両方を満たした場合のみ、M-A2 PASS と判定。IM は本TDを基に実装後、TE → SC のレビューへ。

---

## 8. 備考・実装ヒント

1. **置換は一括ではなく、ルール単位で**: R1〜R13 を 1ルールずつ適用し、各ルールの置換件数が想定と一致することを逐次確認。一括 sed / 正規表現で実行すると `var(--success)` が `var(--success-bg)` に誤ヒットする危険がある
2. **推奨の実装順序**: 「4.2 置換順序の推奨」の通り、**長い変数名から短い変数名へ**の順で進める
3. **shadow 系は OB にはない**: OB CSS には `var(--shadow-*)` の参照が 0件のため、M-A2 では shadow/elevation の議論は該当なし。WS/QA フェーズで再検討
4. **`--warning-text` / `--night-text` / `--error-bg` / `--success-bg` / `--base-grid*` / `--day-*` は絶対に触らない**（OB固有・値不一致のため M-A1 で残留が確定済み）
5. **`--accent-primary` / `--text-primary` / `--text-secondary` / `--text-tertiary` / `--text-disabled` / `--divider` は置換不要**（新DS同名）
6. **JS の影響はゼロが前提**: OB の JS はクラス名セレクタと DOM 属性で動作しており、CSS 変数名には非依存。念のため T28 で `git diff` ゼロを確認
7. **M-A1 完了コミット（b0b7bdb）時点の OB スクリーンショットが TE 側に取得済みであること**が前提。未取得の場合は M-A2 実装前に取得必須
8. **co-tokens.css の legacy alias は M-A2 では削除しない**: 他のモックアップ（WS/QA/SL）がまだ legacy alias に依存しているため。alias 削除は全モックアップ M-A* 完了後の M-B フェーズ以降で実施
