# TE レポート: LC-5 v1

- 実施日: 2026-04-21
- 担当: TE (subagent)

## A. co-tokens.css 検査

- 総行数: 199 行（TD 記載の削除前 245 行想定から 46 行減、整合）
- `rg "legacy aliases" docs/mockup/co-tokens.css` → 0 件
- `rg "@deprecated" docs/mockup/co-tokens.css` → 0 件
- Read 結果: `:root { ... }` ブロックは L18 開始 L176 で閉じ、構文的に正しい。L178 以降は `:root[data-density="..."]` の 3 セレクタ（compact/comfortable/spacious）が続き、ファイル末尾 L199 `}` で正常終端。閉じ括弧欠損なし。

## B. 未定義変数 grep 結果（path: `docs/mockup`）

| パターン | 件数 |
|---|---:|
| `var\(--base-(page\|surface\|surface-alt\|muted)\)` | 0 |
| `var\(--sub-(primary\|secondary)\)` | 0 |
| `var\(--accent\)` / `--accent-light` / `--accent-dim` | 0 |
| `var\(--error\)` / `--success\)` / `--success-text\)` / `--warning\)` / `--warning-text\)` / `--warning-bg\)` | 0 |
| `var\(--shadow-sm\)` / `--shadow-md\)` / `--shadow-lg\)` | 0 |
| `var\(--shadow-medium\)` / `--shadow-strong\)` / `--shadow-color\)` | 11（すべて `screen-layout.css` または `weekly-schedule.css` 内、TD §2.2 許容対象） |

許容対象の内訳:
- `weekly-schedule.css`: L768 `--shadow-color`, L927 `--shadow-strong`
- `screen-layout.css`: L130/138/2042/2086/2135 `--shadow-color`, L1048/1899/2326 `--shadow-strong`, L2248 `--shadow-medium`

## C. 視覚回帰（Playwright + computed style 実測）

スクショ 8 枚を `c:\xampp\htdocs\order-management-system\lc-5-<page>-<theme>.png` に保存。

各画面の computed style 実測（body.bg / body.color / header.bg）、全項目 `rgb(...)` 形式で空文字列なし:

| 画面 | theme | body.bg | body.color | header.bg |
|---|---|---|---|---|
| order-book | light | rgb(233,241,246) | rgb(0,69,84) | rgb(0,69,84) |
| order-book | dark | rgb(233,241,246) | rgb(0,69,84) | rgb(0,69,84) |
| screen-layout | light | rgb(233,241,246) | rgb(0,69,84) | rgb(233,241,246) |
| screen-layout | dark | rgb(26,30,34) | rgb(217,212,209) | rgb(26,30,34) |
| weekly-schedule | light | rgb(233,241,246) | rgb(0,69,84) | rgb(233,241,246) |
| weekly-schedule | dark | rgb(26,30,34) | rgb(217,212,209) | rgb(26,30,34) |
| quick-access | light | rgb(233,241,246) | rgb(0,69,84) | rgb(233,241,246) |
| quick-access | dark | rgb(233,241,246) | rgb(0,69,84) | rgb(233,241,246) |

注: OB / QA は Dark 適用時も Light と同値。これは両画面が dark テーマ定義を持たない既存仕様（LC 無関係）。SL / WS は Dark テーマ反映を確認。

Console error（LC 無関係 404 除く）:
- order-book: 0 件（warning 1 件のみ）
- screen-layout: 0 件（`icons/refresh.svg` 404 のみ、LC 無関係）
- weekly-schedule: 0 件
- quick-access: 0 件（`icons/shield.svg` 404 のみ、LC 無関係）

## D. JS 動作確認

- `docs/mockup/*.js` 内 grep `--base-page|--base-surface|--sub-primary|--accent[^-p]|--error[^-]|--success[^-]|--warning[^-]|--shadow-(sm|md|lg)` → 0 件
- 4 画面すべてで LC 関連 Console error なし（B/C 項参照）

## E. コミット

未実施（TD §5E の記載どおり）。

## 重大Claim

なし。
- co-tokens.css 構文エラー: 検出なし
- 未定義変数による computed style の初期値化: 検出なし（全項目 `rgb(...)` 解決）
- 色崩壊・shadow 消失: スクショ目視で検出なし
- 既存機能破壊: Console error ゼロ（LC 無関係 404 除く）

## 総評

TD §5 チェックリスト A〜D 全項目パス。legacy aliases ブロック削除後の全 4 画面 × Light/Dark = 8 パターンで、未定義変数・構文エラー・Console error・色崩壊いずれも未検出。許容対象外の legacy var 参照 0 件、許容対象（SL/WS local color var 経由の `--shadow-medium/strong/color`）11 件は TD §2.2 温存リストと完全一致。
