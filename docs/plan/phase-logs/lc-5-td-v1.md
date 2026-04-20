# テスト項目: LC-5 — legacy aliases ブロック削除 + 全画面回帰

- 作成日: 2026-04-21
- 作成者: TD (main thread)
- 対象: Phase M-G-Final LC-5（最終サブフェーズ）

## 1. 目的

co-tokens.css の legacy aliases ブロック（L177-222、コメント・空行含む）を削除し、Phase M-G-Final の目的「旧→新エイリアス全廃」を完遂する。削除後に全4画面（OB/SL/WS/QA）の視覚回帰テストを実施し、未発見の漏れがないことを確認する。

## 2. スコープ

### 2.1 削除対象

[docs/mockup/co-tokens.css](../../mockup/co-tokens.css) の L177〜L222（46行）を**完全削除**：

```css
  /* ============================================================
     legacy aliases (deprecated)
     ... (コメントブロック全文)
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

  /* shadow → elevation (Phase D1.5) */
  --shadow-sm:     var(--elevation-1);
  --shadow-md:     var(--elevation-3);
  --shadow-lg:     var(--elevation-4);
  --shadow-medium: var(--elevation-3);
  --shadow-strong: var(--elevation-5);
```

削除後、L175 `--fs-density-base: 14px;` と L223 以降の `}` 閉じ括弧および L225 以降のコメント（density mode overrides）が直接つながる形になる。

### 2.2 削除対象外（温存）

以下は legacy alias ブロック外のため触らない：
- `--elevation-0〜5`（co-tokens.css L122-127）
- `--semantic-*` 定義（L43-48）
- `--bg-*` / `--accent-primary*` / `--divider` 等の新DS変数
- SL/WS の local `--shadow-color/-medium/-strong`（LC-4 で温存確定）
- SL/WS/OB/QA の `--semantic-warning-text: #975A16` 等（LC-3 で改名済）

## 3. 事前期待

LC-1〜LC-4 の完了により、以下が成立しているはず：

- `var(--base-*)` / `var(--sub-*)` 参照: 0件（LC-1）
- `var(--accent)` / `var(--accent-light)` / `var(--accent-dim)`: 0件（LC-2）
- `var(--error)` / `var(--success*)` / `var(--warning*)`: 0件（LC-3）
- `var(--shadow-sm|md|lg|medium|strong)`: co-forms 関連 0件、SL/WS 内部の local color var 経由のみ残存（LC-4）

LC-5 削除で影響が出るのは**未検出の LC-1〜LC-4 漏れ**のみ。視覚回帰で検出する。

## 4. 評価ルーブリック（100点満点、LC-5 は総合回帰のため配分調整）

| カテゴリ | 配点 | 評価内容 |
|---------|----:|---------|
| A. legacy aliases ブロック完全削除 | 20 | L177-222 の 46行が削除され、co-tokens.css が構文的に正しい |
| B. 未定義変数による CSS 参照エラーゼロ | 30 | 4画面 × Light/Dark で未定義変数ゼロ（computed style で CSS.supports() 的確認） |
| C. 視覚回帰ゼロ | 30 | Playwright スクショで Phase LC-0 相当（`6c37180` 以前）との視覚差分が知覚できない |
| D. JS 参照破壊ゼロ | 10 | JS 内の legacy 変数名参照 0件、Console エラーなし、主要機能動作 |
| E. コミット粒度 | 10 | 1コミット、LC-5 完了と Phase M-G-Final DONE を明記 |

**合格基準**: 総合70点以上 AND 重大Claimゼロ

## 5. TE チェックリスト

### A. co-tokens.css 検査
- [ ] co-tokens.css 総行数が減少している（46行削除）
- [ ] `rg "legacy aliases" docs/mockup/co-tokens.css` → 0件
- [ ] `rg "@deprecated" docs/mockup/co-tokens.css` → 0件
- [ ] co-tokens.css を Read し、構文的に正しい（`:root { ... }` ブロック閉じが欠損していない）

### B. 未定義変数チェック（grep、path: `c:\xampp\htdocs\order-management-system\docs\mockup`）
- [ ] `var\(--base-(page|surface|surface-alt|muted)\)` → 0件
- [ ] `var\(--sub-(primary|secondary)\)` → 0件
- [ ] `var\(--accent\)` `var\(--accent-light\)` `var\(--accent-dim\)` → 0件
- [ ] `var\(--error\)` `var\(--success\)` `var\(--success-text\)` `var\(--warning\)` `var\(--warning-text\)` `var\(--warning-bg\)` → 0件
- [ ] `var\(--shadow-sm\)` `var\(--shadow-md\)` `var\(--shadow-lg\)` → 0件
- [ ] 残存する `var(--shadow-medium)` / `var(--shadow-strong)` は SL/WS 内部のみ（local color var で解決）

### C. 視覚回帰（Playwright）
- [ ] 4画面 × Light/Dark = 8 スクショ（`c:\xampp\htdocs\order-management-system\lc-5-<page>-<theme>.png`）
- [ ] Playwright で各画面を開いて主要領域の computed style を取得し、未定義変数（empty string 解決）がないことを確認
  - 例: `getComputedStyle(document.body).backgroundColor` が空文字列ではないこと
  - 例: ボタンの `box-shadow` や `color` が `initial` や空でないこと
- [ ] スクショ目視で、LC-0〜LC-4 過程で承認された変化（Dark chip 色など）を除き視覚崩壊がないこと

### D. JS 動作確認
- [ ] JS 内（docs/mockup/*.js）に旧変数名の参照が 0件
- [ ] OB / WS / QA / SL の Console エラーなし
- [ ] 主要インタラクション（モーダル開閉、セル選択、ボタンクリック）が動作

### E. コミット
未実施。

### F. 引継ぎ資料への追記（合格後）
`docs/plan/phase-mg-final-handoff.md` §1 の到達点表に `LC 完了` 行を追加することを次ステップとして記録。

## 6. 重大Claim判定

- 削除後に 4画面いずれかで色崩壊・shadow 消失
- 未定義変数による computed style の初期値化
- co-tokens.css 構文エラー
- 既存機能破壊

## 7. 合格時の次ステップ

1. コミット（LC-5 単体）
2. `phase-mg-final-handoff.md` の到達点表に `LC 完了` 行を追記してコミット
3. Phase M-G-Final DONE をユーザーに報告
