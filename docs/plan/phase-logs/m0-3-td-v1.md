# Test Design: M0-3 v1 — 4モックアップHTMLへの co-tokens.css リンク追加

- 作成日: 2026-04-18
- 設計者: Test Designer（TD）
- 対象サブフェーズ: **M0-3** — 4モックアップHTMLの `<head>` に `<link rel="stylesheet" href="mockup/co-tokens.css">` を**最前に挿入**する
- 参照資料:
  - ガバナンス: `docs/plan/ds-migration-governance.md`
  - 移行計画: `docs/plan/ds-migration-plan.md`
  - 新DS正: `docs/ui-components/styles-light.css` / `docs/ui-components/tokens.json`
  - M0-1 合格レポート: `docs/plan/phase-logs/m0-1-sc-v1.md`（98/100 合格）
  - M0-2 合格レポート: `docs/plan/phase-logs/m0-2-sc-v1.md`（97/100 合格）
  - M0-2 TD: `docs/plan/phase-logs/m0-2-td-v1.md`
- 書込対象（本サブフェーズで改変する）:
  - `docs/order-book.html`
  - `docs/weekly-schedule.html`
  - `docs/quick-access.html`
  - `docs/screen-layout.html`
- **改変禁止**（本サブフェーズでは触らない）:
  - `docs/mockup/co-tokens.css`（M0-1/M0-2 で確定済み）
  - `docs/mockup/co-navbar.css` / `co-shared-badges.css`
  - `docs/mockup/order-book.css` / `weekly-schedule.css` / `quick-access.css` / `screen-layout.css`
  - `docs/ui-components/styles-light.css` / `tokens.json`
  - 4モックアップHTMLの `<link>` 追加**以外の**要素（本文・スクリプト・メタタグ等）

---

## 1. 目的

M0-1/M0-2 で確定した `docs/mockup/co-tokens.css` を、**4モックアップHTMLから実際に読み込ませる**。後続の `co-navbar.css / co-shared-badges.css / <mockup>.css` が co-tokens.css の新DSトークンおよび legacy aliases を参照できる状態を作る。

### 到達点

- 4ファイル全てに `<link rel="stylesheet" href="mockup/co-tokens.css">` が `<head>` 内 stylesheet 群の**最前**に挿入される
- co-tokens.css の新DS正定義（`--bg-page: #E9F1F6` 等）が先に読まれ、**モックアップ側 :root の旧変数定義（同名）が後勝ちで上書き**する状態を成立させる
- legacy aliases は「モックアップ :root で未定義の変数をモックアップCSS本文から参照する場合」のフォールバックとして機能する
- **見た目は M0-2 合格時点から変化しない**（機能回帰ゼロ）

### スコープ外（本サブフェーズでは行わない）

- 各モックアップCSS（`order-book.css` 等）の変更（Phase M-A 以降）
- `body` への `palt` / `tabular-nums` 適用（Phase M0-4）
- `--text-tertiary / --text-disabled / --warning-text` 値衝突の統一（Phase M0-5）
- カテゴリ4色相分化・影値構造衝突の解消（Phase M-A）
- co-tokens.css / styles-light.css / tokens.json / 既存モックアップCSS の変更

---

## 2. 評価項目のウェイト（M0-3 固有の調整）

M0-3は「HTML4ファイルへの `<link>` 1行追加のみ」で極めて限定的な変更だが、**初めて co-tokens.css が実ブラウザで評価される**サブフェーズであり、順序ミス・パス誤り・HTMLシンタックス破損が直ちに見た目崩れ・404 につながる。そのため E（機能回帰）に最大ウェイトを置く。

| カテゴリ                           | 通常配点 | **M0-3 配点** | 理由                                                                                                                     |
|-----------------------------------|---------|--------------|-------------------------------------------------------------------------------------------------------------------------|
| A. DS準拠（リンク順序・パス形式）  | 30      | **20**       | 「最前挿入」「既存パス形式の踏襲」「キャッシュバスター方針の一貫性」が評価軸。エイリアス定義の評価は M0-2 で完了済みのため縮小 |
| B. カラーコーディネーション         | 20      | **10**       | リンク追加後も見た目変化ゼロが前提。新DS色が実際に解決されていることを DevTools 計算値で確認（付随検証）                    |
| C. タイポグラフィ・余白             | 15      | **0**        | 本サブフェーズでは対象外（M0-4 で実施）                                                                                   |
| D. コンポーネント一貫性             | 15      | **15**       | legacy aliases が :root 後勝ちにより上書きされる設計が機能していることを実ブラウザで確認                                  |
| E. 機能回帰（見た目不変 / 404ゼロ） | 10      | **40**       | **最重要**。4モックアップを実ブラウザで開いた際の見た目が M0-2 時点から変化ゼロ、DevTools Console 404 / パースエラーゼロ。Git diff で link 追加以外の差分ゼロ |
| F. アクセシビリティ                 | 5       | **5**        | CSS ロード失敗時の視認性劣化防止の観点のみ。`<link>` に `media` や `disabled` が誤って付いていないことを確認              |
| G. コード品質・保守性               | 5       | **10**       | `<link>` の href 形式・属性順序・インデント・既存 stylesheet 記述との一貫性                                              |
| **合計**                           | 100     | **100**      |                                                                                                                         |

### 合計値の根拠

- E=40: 見た目不変・404ゼロ・HTML無改変（link 追加以外）が M0-3 の本質。順序ミス1つで M0-2 の全エイリアス設計が機能しなくなる
- A=20: 順序制約（最前）と既存 href 形式（`mockup/co-tokens.css`）の踏襲
- D=15: 実ブラウザで legacy aliases 経由の解決が機能していること
- B=10: 色の実効値確認（DevTools Computed Value）
- G=10: HTML 4ファイルの記述スタイル一貫性
- F=5: `<link>` 属性の妥当性

---

## 3. 事前調査結果：各モックアップHTML `<head>` 内 `<link>` 実態

TD（本ドキュメント作成者）が実ファイルを読み、以下の状態を確認した（2026-04-18 時点）。

### 3.1 `docs/order-book.html`（L1-10）

```html
L1: <!DOCTYPE html>
L2: <html lang="ja">
L3: <head>
L4:     <meta charset="UTF-8">
L5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
L6:     <title>受注簿</title>
L7:     <link rel="stylesheet" href="mockup/co-shared-badges.css">
L8:     <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
L9:     <link rel="stylesheet" href="mockup/order-book.css">
L10: </head>
```

- `<link>` 件数: 3
- 順序: `co-shared-badges.css` → `co-navbar.css?v=3` → `order-book.css`
- パス形式: `mockup/xxx.css`（`./` 無し）
- キャッシュバスター: `co-navbar.css?v=3` のみ付与、他2件は無し

### 3.2 `docs/weekly-schedule.html`（L1-10）

```html
L1: <!DOCTYPE html>
L2: <html lang="ja">
L3: <head>
L4:     <meta charset="UTF-8">
L5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
L6:     <title>週間予定表 - 受注管理システム</title>
L7:     <link rel="stylesheet" href="mockup/co-shared-badges.css">
L8:     <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
L9:     <link rel="stylesheet" href="mockup/weekly-schedule.css">
L10: </head>
```

- `<link>` 件数: 3
- 順序: `co-shared-badges.css` → `co-navbar.css?v=3` → `weekly-schedule.css`
- パス形式: `mockup/xxx.css`
- キャッシュバスター: `co-navbar.css?v=3` のみ

### 3.3 `docs/quick-access.html`（L1-10）

```html
L1: <!DOCTYPE html>
L2: <html lang="ja">
L3: <head>
L4:     <meta charset="UTF-8">
L5:     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
L6:     <title>Quick Access — 受注クイック入力</title>
L7:     <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
L8:     <link rel="stylesheet" href="mockup/co-shared-badges.css">
L9:     <link rel="stylesheet" href="mockup/quick-access.css">
L10: </head>
```

- `<link>` 件数: 3
- 順序: `co-navbar.css?v=3` → `co-shared-badges.css` → `quick-access.css`
- **注**: OB/WS/SL と `co-navbar` / `co-shared-badges` の順序が逆転している
- パス形式: `mockup/xxx.css`
- キャッシュバスター: `co-navbar.css?v=3` のみ

### 3.4 `docs/screen-layout.html`（L1-10）

```html
L1: <!DOCTYPE html>
L2: <html lang="ja">
L3: <head>
L4:     <meta charset="UTF-8">
L5:     <meta name="viewport" content="width=device-width, initial-scale=1.0">
L6:     <title>業務管理計画書 - 画面レイアウト設計</title>
L7:     <link rel="stylesheet" href="mockup/co-shared-badges.css">
L8:     <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
L9:     <link rel="stylesheet" href="mockup/screen-layout.css?v=8">
L10: </head>
```

- `<link>` 件数: 3
- 順序: `co-shared-badges.css` → `co-navbar.css?v=3` → `screen-layout.css?v=8`
- パス形式: `mockup/xxx.css`
- キャッシュバスター: `co-navbar.css?v=3` と `screen-layout.css?v=8` の2件に付与

### 3.5 TD としての観察・IM への指針

- **パス形式は `mockup/xxx.css`（`./` 無し）で4ファイル一貫**。新規追加する co-tokens.css も同形式に揃えること。
- **キャッシュバスター方針の不統一**: OB/WS は共有CSSの1件のみ `?v=3`、SL は共有+専用の2件に付与、QA は共有の1件のみ。M0-3 では co-tokens.css は**新規追加であり既存キャッシュは存在しない**ため、`?v=1` 等の付与は任意（付けない方が既存 OB/WS/QA の専用CSS記述との一貫性が取れる）。**推奨: `?v=` を付けない**（付ける場合も統一方針をコメント記載の上で4ファイル同一バスター値とする）。
- **QA の順序逆転**: `co-navbar.css` が `co-shared-badges.css` より前。IM はこの既存順序を変更せず、co-tokens.css をさらにその前（全stylesheet の最前）に挿入する。既存順序の並び替えは M0-3 スコープ外。
- **挿入位置**: 各ファイルの `<title>` 直後、既存 `<link rel="stylesheet">` 群の**最前**（L7 の位置）。既存 L7 は L8 へ、L8 は L9 へ、L9 は L10 へ繰り下がり、`</head>` は L11 になる。
- **属性・インデント**: 既存 `<link>` と同じ 4スペースインデント、`rel="stylesheet" href="..."` の属性順序、ダブルクォート使用。

### 3.6 想定される IM 実装後の状態（例: order-book.html）

```html
L7:     <link rel="stylesheet" href="mockup/co-tokens.css">
L8:     <link rel="stylesheet" href="mockup/co-shared-badges.css">
L9:     <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
L10:     <link rel="stylesheet" href="mockup/order-book.css">
L11: </head>
```

---

## 4. テストチェックリスト（Test Executor 実施）

### A. DS準拠（順序制約・パス形式） — 20点

**A-1** 4モックアップHTML全てに `<link rel="stylesheet" href="mockup/co-tokens.css">` が追加されているか。
- 検証: `Grep pattern="co-tokens\.css" path="docs/" glob="*.html" output_mode="content" -n=true`
- 期待: 4件ヒット（各HTMLに1件ずつ）

**A-2** co-tokens.css の `<link>` が、各ファイルの `<head>` 内 stylesheet 群の**最前**に配置されているか（他の `<link rel="stylesheet">` より前の行番号）。
- 検証: 各HTMLの `<link rel="stylesheet">` 全件を行番号付きで抽出し、co-tokens.css 行が最小行番号であることを確認
- 期待: 4ファイル全てで co-tokens.css が最前

**A-3** パス形式が `mockup/co-tokens.css` であるか（`./mockup/...` や絶対パス・外部URL ではない）。
- 検証: `Grep pattern="co-tokens\.css" path="docs/" glob="*.html" output_mode="content"` で href 値を確認
- 期待: 4件全て `href="mockup/co-tokens.css"` または `href="mockup/co-tokens.css?v=X"` 形式

**A-4** キャッシュバスター（`?v=N`）方針が4ファイルで一貫しているか。
- 期待: 付けない方針（推奨）で4ファイル一致、または付ける場合は4ファイル同一の `?v=N` 値
- 不一致（OBだけ付けてWSは付けない等）は Warning

**A-5** `<link>` の属性順序が既存行と一貫しているか（`rel="stylesheet" href="..."` の順）。
- 検証: `Grep pattern="<link[^>]*co-tokens" path="docs/" glob="*.html" output_mode="content"`
- 期待: `<link rel="stylesheet" href="mockup/co-tokens.css">`

**A-6** 新規 `<link>` に不要属性（`media` / `disabled` / `integrity` 等）が付与されていないか。
- 期待: `rel` と `href` のみ

### B. カラーコーディネーション（実ブラウザ色解決） — 10点

**B-1** ブラウザで4モックアップを開き、DevTools Elements パネルで `<html>` 要素の Computed タブを確認。以下の変数が新DS値に解決されるか（legacy aliases が :root の未定義変数フォールバックとして機能していることの確認）:
- [ ] `--bg-page` → `rgb(233, 241, 246)`（= `#E9F1F6`）
- [ ] `--text-primary` → `rgb(0, 69, 84)`
- [ ] `--accent-primary` → `rgb(68, 166, 181)`
- [ ] `--elevation-3` → `0px 4px 12px rgba(0, 69, 84, 0.1)`

**B-2** モックアップ :root で再定義されている変数（`--base-page` 等）は**モックアップ側の値が後勝ち**で有効であることを Computed で確認:
- [ ] `--base-page` → `#E9F1F6`（OB :root L8 の定義値。co-tokens.css legacy aliases の `var(--bg-page)` が同値に解決される場合と区別が付かないが、見た目に変化がないことが重要）

**B-3** Coastal Palette 外の色が新たに表示されていないこと。M0-2 時点のスクリーンショットと比較して、明らかな色ズレ（例: ページ背景が `#E9F1F6` ではない色に変わった）がない。

### D. コンポーネント一貫性（legacy aliases 機能確認） — 15点

**D-1** モックアップCSS本文で参照されている `var(--shadow-sm) / var(--shadow-md) / var(--shadow-lg) / var(--shadow-medium) / var(--shadow-strong)` が、実ブラウザで **`0 Xpx Ypx rgba(0, 69, 84, Z)` 形式の有効な `box-shadow`** に解決されるか（`none` / 空文字になっていないこと）。
- 検証方法: DevTools で該当要素（例: card / modal）を選択し、Computed タブで `box-shadow` 値を確認
- 対象要素: モックアップ内で影が付いている card / modal / popover 要素を最低1つずつ

**D-2** モックアップCSS :root で未定義だが本文で参照されている変数（例: `--shadow-sm` が OB/WS/QA/SL の :root で未定義だが本文で `box-shadow: var(--shadow-sm)` が使われている場合）が、co-tokens.css の legacy aliases 経由で**正しく新DS影値に解決**されているか。
- 事前確認: M0-2 TD 3.5 節「4モックアップで未登場だが TD マッピング表に含まれる変数」より、`--shadow-sm / -md / -lg` はモックアップ `:root` で未定義。本文での参照有無を grep で確認:
  - `Grep pattern="var\(--shadow-(sm|md|lg)\)" path="docs/mockup/" glob="*.css" output_mode="content" -n=true`
- 参照がある場合: DevTools で解決値確認
- 参照がない場合: D-2 は N/A 扱い、D-1 のみで評価

**D-3** カテゴリ色（`--cat-bg-facility` 等）は WS/SL :root で旧同色定義が有効。M0-3 ではこれが変わらない（M-A で解消）ことを確認。Computed タブで `--cat-bg-facility` が `rgba(68, 166, 181, 0.12)`（旧同色）のままであり、co-tokens.css の 4色相分化値（`rgba(68, 166, 181, 0.14)`）に上書きされていないこと。

### E. 機能回帰（見た目不変・404ゼロ・HTML無改変） — 40点

**E-1** `git diff docs/order-book.html docs/weekly-schedule.html docs/quick-access.html docs/screen-layout.html` の差分が、各ファイルで **co-tokens.css の `<link>` 行の追加のみ**であること。
- 許容される差分: 1行追加（`+    <link rel="stylesheet" href="mockup/co-tokens.css">`）× 4ファイル
- 禁止される差分: 既存行の変更、他の `<link>` の順序入れ替え、`<title>` / `<meta>` 変更、本文（`<body>` 以降）変更
- **1ファイルでも link 追加以外の差分があれば重大Claim C-1**

**E-2** `git diff docs/mockup/co-tokens.css` の差分がゼロであること（本サブフェーズで co-tokens.css は改変禁止）。
- **差分が1行でもあれば重大Claim C-2**

**E-3** `git diff docs/mockup/co-navbar.css docs/mockup/co-shared-badges.css docs/mockup/order-book.css docs/mockup/weekly-schedule.css docs/mockup/quick-access.css docs/mockup/screen-layout.css` の差分がゼロであること。
- **1ファイルでも差分があれば重大Claim C-3**

**E-4** `git diff docs/ui-components/styles-light.css docs/ui-components/tokens.json` の差分がゼロであること。
- **差分があれば重大Claim C-4**

**E-5** 4モックアップを実ブラウザ（Chrome または Edge）で開いた際、DevTools Console にエラー（特に 404 Not Found）が出ないこと。
- 検証: 各HTMLをブラウザで開き、Console タブを確認
- 期待: `mockup/co-tokens.css` の 404 ゼロ、CSS パースエラー ゼロ
- **404 が1件でもあれば重大Claim C-5**
- **CSS パースエラーが出れば重大Claim C-6**

**E-6** 4モックアップの見た目が M0-2 合格時点（co-tokens.css リンク追加前）から**変化していない**こと。
- 検証方法A（推奨）: M0-2 時点と M0-3 実装後の同一箇所スクリーンショットを取得し、視覚比較
- 検証方法B（代替）: 主要要素（ページ背景・ヘッダ・サイドバー・カード・モーダル・テーブルヘッダ・ボタン）の Computed Value（`background-color` / `color` / `box-shadow` / `border`）を M0-2 時点の期待値と照合
- 対象画面: 各モックアップの主要画面（OB: 受注一覧、WS: 週間表、QA: ログイン+入力、SL: レイアウト一覧）
- **明らかな見た目変化（色・影・余白）があれば重大Claim C-7**

**E-7** HTMLシンタックスが壊れていないこと。
- 検証: W3C HTML validator（`https://validator.w3.org/`）もしくはブラウザ DevTools Elements パネルで `<head>` 構造が正常表示されること。`<link>` 行末の `>` 欠落・ダブルクォート不整合・余計な改行なし
- **HTMLパースエラーがあれば重大Claim C-8**

**E-8** 4モックアップで JavaScript 動作（co-navbar.js 自動挿入、モーダル開閉、タブ切替等）に影響が出ていないこと。Console に JS エラーが出ないこと。

### F. アクセシビリティ（リンク属性妥当性） — 5点

**F-1** 新規 `<link>` に `disabled` 属性が付いていないこと（付くとスタイルが適用されない）。

**F-2** `media` 属性が付いていないこと、または付ける場合は `media="all"`（省略時と同義）であること。`media="print"` 等の限定がないこと。

**F-3** CSS ロード失敗時（ネットワーク遮断など）でも、モックアップ自身の `:root` 定義とフォールバックで基本的な可読性が保たれる（これは既存設計依存で M0-3 固有の検証ではないが、Console 確認のついでに観察）。

### G. コード品質・保守性（HTML記述一貫性） — 10点

**G-1** 新規 `<link>` のインデントが 4スペース（既存行と同一）であること。タブ・2スペースでないこと。

**G-2** 新規 `<link>` の記述が1行で完結していること（改行なし、折り返しなし）。

**G-3** 4ファイル間で co-tokens.css の `<link>` 記述が**完全同一文字列**であること（キャッシュバスター含め）。
- 検証: 4ファイルから co-tokens.css の `<link>` 行を抽出し、文字列比較
- 期待: 4件全て一致

**G-4** co-tokens.css の `<link>` の後に、既存の他 stylesheet（co-shared-badges / co-navbar / 専用CSS）が**既存の順序のまま**続いていること。既存順序の並び替えがないこと（QA の `co-navbar → co-shared-badges` 順も変更禁止）。

**G-5** HTML末尾の空行・EOF 改行状態が元ファイルから変化していないこと。

**G-6** BOM（UTF-8 BOM）の有無が元ファイルから変化していないこと（エディタ設定で混入することがある）。

### その他（grep / 全体整合）

**H-1** co-tokens.css 以外の新規ファイル追加がないこと。
- 検証: `git status` で 4モックアップHTML以外に modified / new file がないこと

**H-2** `docs/index.html` / `docs/er-diagram.html` に co-tokens.css リンクが**誤って**追加されていないこと（対象4ファイルのみ）。
- 検証: `Grep pattern="co-tokens\.css" path="docs/" glob="*.html" output_mode="files_with_matches"`
- 期待: 4ファイルのみヒット（index.html / er-diagram.html は未ヒット）

**H-3** `docs/ui-components/*.html`（UIコンポーネント集）に co-tokens.css リンクが誤って追加されていないこと。
- 検証: `Grep pattern="co-tokens\.css" path="docs/ui-components/" glob="*.html" output_mode="files_with_matches"`
- 期待: 0件

---

## 5. 重大Claim判定基準

以下のいずれか1件でも該当すれば**総合点に関わらず不合格**:

**C-1** 4モックアップHTMLで co-tokens.css の `<link>` 1行追加**以外**の差分がある（E-1）

**C-2** co-tokens.css が改変されている（E-2）— M0-1/M0-2 で確定した Single Source of Truth が崩れる

**C-3** 4モックアップCSS（`order-book.css` 等）または共有CSS（`co-navbar.css` / `co-shared-badges.css`）が改変されている（E-3）

**C-4** `styles-light.css` / `tokens.json` が改変されている（E-4）

**C-5** ブラウザ Console に `mockup/co-tokens.css` の 404 Not Found エラーが出る（E-5）— パスミスの証拠

**C-6** ブラウザ Console に CSS パースエラーが出る（E-5）— HTML側の `<link>` 記述不正、または co-tokens.css 破損

**C-7** 4モックアップの見た目が M0-2 合格時点から変化している（E-6）— 順序ミスにより新DS値が上書きされるはずの場所で逆に上書きされず、モックアップ側 :root の旧値が新DS値に置き換わってしまうなど

**C-8** HTMLパースエラーで `<head>` 構造が壊れている（E-7）— `<link>` タグの閉じ忘れ・クォート不整合

**C-9** co-tokens.css の `<link>` が**最前でない位置**に挿入されている（A-2）— M0-2 の「co-tokens.css を先に読み、モックアップ :root で後勝ち上書き」設計が破綻する

**C-10** co-tokens.css の `<link>` が4ファイルのうち1ファイルでも欠落している（A-1）

**C-11** co-tokens.css 以外の他stylesheet `<link>` の既存順序が並び替えられている（G-4）— M0-3 スコープ外の変更

---

## 6. 合格条件

- **総合点 ≥ 70点**（A20+B10+D15+E40+F5+G10=100 のウェイトで採点）
- **重大Claim = 0件**

両方を同時に満たしたときのみ合格。1つでも欠ければ再実装（IM）に差し戻し。

---

## 7. Test Executor への実施メモ

### 検証手順（推奨順）

1. **Git diff 確認**（最優先）:
   ```
   git diff docs/order-book.html docs/weekly-schedule.html docs/quick-access.html docs/screen-layout.html
   git diff docs/mockup/
   git diff docs/ui-components/
   ```
   → E-1〜E-4, C-1〜C-4 を一括判定

2. **Grep で `<link>` 実態確認**:
   ```
   Grep pattern="co-tokens\\.css" path="docs/" glob="*.html" output_mode="content" -n=true
   ```
   → A-1, A-2, A-3, G-3, H-2 を判定

3. **4ファイルの `<head>` 目視**: 各ファイル L1-12 を Read で確認し、順序・インデント・属性記述を目視

4. **実ブラウザ検証**（E-5, E-6, E-7, E-8, B-1, D-1, D-3）:
   - XAMPP が起動していれば `http://localhost/order-management-system/docs/order-book.html` 等でアクセス
   - DevTools: Console（エラー確認）/ Network（404確認）/ Elements Computed（変数値確認）
   - 4モックアップ全てで実施

5. **視覚回帰**（E-6）:
   - 方法A: Playwright MCP でスクリーンショット取得し M0-2 時点と比較
   - 方法B: 主要要素の Computed Value を手動照合
   - M0-2 時点のスクリーンショットが未取得の場合、TE レポートに「目視確認のみ。明らかな変化なし」と記録

6. **報告ファイル**: `docs/plan/phase-logs/m0-3-te-v1.md`（TE用テンプレートに沿う）

### 実ブラウザ検証が不可能な場合の代替

XAMPP 起動不可・ブラウザアクセス不可の環境では、以下で代替する:
- E-5（404）: co-tokens.css ファイル存在確認 `ls docs/mockup/co-tokens.css`、HTMLの href パス検証
- E-6（見た目不変）: co-tokens.css 内容が M0-2 合格時点のまま（`git diff` ゼロ）かつモックアップCSS無改変なら、理論上見た目変化ゼロと判定可能（ただし「実ブラウザ未検証」として TE レポートに明記）
- B-1, D-1, D-3: 手計算で `var()` 連鎖解決を追跡

---

## 8. Implementer への実装指針（参考）

（TDスコープ外だが、TE/SC が IM成果物を評価する際の期待形）

### 4ファイル共通の変更内容

各ファイルの `<title>` 行の直後、既存 `<link rel="stylesheet">` 群の**最前**に以下1行を挿入:

```html
    <link rel="stylesheet" href="mockup/co-tokens.css">
```

- インデント: 4スペース
- 属性順序: `rel` → `href`
- キャッシュバスター: 付けない（推奨）
- 既存 `<link>` の順序・記述は**一切変更しない**

### 実装後の各ファイル L7-11 期待形

**order-book.html**:
```html
    <link rel="stylesheet" href="mockup/co-tokens.css">
    <link rel="stylesheet" href="mockup/co-shared-badges.css">
    <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
    <link rel="stylesheet" href="mockup/order-book.css">
```

**weekly-schedule.html**:
```html
    <link rel="stylesheet" href="mockup/co-tokens.css">
    <link rel="stylesheet" href="mockup/co-shared-badges.css">
    <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
    <link rel="stylesheet" href="mockup/weekly-schedule.css">
```

**quick-access.html**（既存 co-navbar と co-shared-badges の順序が OB/WS/SL と逆だが、M0-3 では並び替えない）:
```html
    <link rel="stylesheet" href="mockup/co-tokens.css">
    <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
    <link rel="stylesheet" href="mockup/co-shared-badges.css">
    <link rel="stylesheet" href="mockup/quick-access.css">
```

**screen-layout.html**:
```html
    <link rel="stylesheet" href="mockup/co-tokens.css">
    <link rel="stylesheet" href="mockup/co-shared-badges.css">
    <link rel="stylesheet" href="mockup/co-navbar.css?v=3">
    <link rel="stylesheet" href="mockup/screen-layout.css?v=8">
```

### 実装時の注意

- Edit tool で `<link rel="stylesheet" href="mockup/co-shared-badges.css">`（OB/WS/SL）または `<link rel="stylesheet" href="mockup/co-navbar.css?v=3">`（QA）を old_string とし、その直前行に co-tokens.css `<link>` を挿入する形で編集する
- BOM・改行コード（CRLF/LF）を元ファイルに合わせる
- 編集後、Read tool で再度 L1-12 を確認し、順序・インデントに問題がないことを IM 自身で検証してから TE に引き渡す

以上。
