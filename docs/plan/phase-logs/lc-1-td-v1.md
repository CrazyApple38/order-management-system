# テスト項目: LC-1 — `--base-*` / `--sub-*` 系の新変数置換

- 作成日: 2026-04-21
- 作成者: TD (main thread)
- 対象: Phase M-G-Final LC-1

## 1. 目的

旧エイリアス `--base-page / --base-surface / --base-surface-alt / --base-muted / --sub-primary / --sub-secondary` を新DS変数 `--bg-page / --bg-surface / --bg-surface-2 / --bg-surface-3 / --bg-sidebar / --divider` に完全置換する。

本サブフェーズ完了時点では co-tokens.css 内の legacy aliases ブロックは**保持**（LC-5で削除）。これにより、未検出の置換漏れがあっても当面は視覚破壊に至らない安全余地を残す。

## 2. スコープ

### 2.1 置換マッピング

| 旧 | 新 |
|---|---|
| `var(--base-page)` | `var(--bg-page)` |
| `var(--base-surface)` | `var(--bg-surface)` |
| `var(--base-surface-alt)` | `var(--bg-surface-2)` |
| `var(--base-muted)` | `var(--bg-surface-3)` |
| `var(--sub-primary)` | `var(--bg-sidebar)` |
| `var(--sub-secondary)` | `var(--divider)` |

### 2.2 対象ファイル（事前実測 284 件 / 7 ファイル）

| ファイル | 件数 |
|---------|----:|
| screen-layout.css | 103 |
| weekly-schedule.css | 103 |
| quick-access.css | 51 |
| co-shared-badges.css | 11 |
| co-navbar.css | 8 |
| co-tokens.css | 6（legacy aliases ブロック内、**置換対象外**） |
| weekly-schedule.js | 2 |

**co-tokens.css L195-202 は LC-5 で削除するため、LC-1では触らない。**

### 2.3 Dark テーマ [data-theme="dark"] ブロックの扱い

dark block が旧変数を定義している箇所（下記）を**新変数に書換える**。ユーザー決定「再定義も削除して新変数に統一」に基づく。

- [screen-layout.css:43-49](../../mockup/screen-layout.css#L43-L49): `--base-page/--base-surface/--base-surface-alt/--base-muted/--sub-primary/--sub-secondary` → `--bg-page/--bg-surface/--bg-surface-2/--bg-surface-3/--bg-sidebar/--divider`
- [weekly-schedule.css:66-74](../../mockup/weekly-schedule.css#L66-L74): 同上

また、dark block に既にある「逆エイリアス」行（`--bg-page: var(--base-page)` 等）は**削除**する：
- [screen-layout.css:97-101](../../mockup/screen-layout.css#L97-L101)
- [weekly-schedule.css:134-138](../../mockup/weekly-schedule.css#L134-L138)

### 2.4 `--secondary: var(--sub-secondary)` の扱い

`--secondary` は co-shared-badges.css 用の後方互換変数。本体（`--secondary`）は LC スコープ外のため、RHS のみ更新：
- [screen-layout.css:37](../../mockup/screen-layout.css#L37): `var(--sub-secondary)` → `var(--divider)`
- [screen-layout.css:103](../../mockup/screen-layout.css#L103): 同上
- [weekly-schedule.css:140](../../mockup/weekly-schedule.css#L140): 同上

## 3. 評価ルーブリック（LC専用、100点満点）

| カテゴリ | 配点 | 評価内容 |
|---------|----:|---------|
| A. 対象変数の置換漏れゼロ | 30 | co-tokens.css L195-202 を除き `var(--base-*)` / `var(--sub-*)` の参照が0件 |
| B. 未定義変数による CSS 参照エラーゼロ | 25 | 新変数 `--bg-*` / `--divider` が Light/Dark 両方で解決可能 |
| C. 視覚差分なし | 20 | Playwright スクショ比較で OB/SL/WS/QA の before/after 差分が知覚できない |
| D. JS 参照破壊ゼロ | 15 | weekly-schedule.js の該当2件も置換済み、機能動作に影響なし |
| E. コミット粒度・メッセージの適切性 | 10 | LC-1 の意図が伝わるコミットメッセージ、1コミットにまとまっている |

**合格基準**: 総合70点以上 AND 重大Claimゼロ

## 4. TE チェックリスト

### A. 置換漏れゼロ（grep検証）

- [ ] `rg "var\(--base-(page|surface|surface-alt|muted)\)" docs/mockup` → 0件（co-tokens.css L195-198 を除く）
- [ ] `rg "var\(--sub-(primary|secondary)\)" docs/mockup` → 0件（co-tokens.css L201-202 を除く）
- [ ] weekly-schedule.js の `--base-*` / `--sub-*` 参照が 0件

### B. 未定義変数チェック

- [ ] Light モードで co-tokens.css + 各モックアップCSS を読み込んだとき、新変数がすべて解決される（grep で `--bg-page` 等の定義存在を確認）
- [ ] Dark モード（`[data-theme="dark"]` 適用）で、新変数定義が揃っている（`--bg-page/--bg-surface/--bg-surface-2/--bg-surface-3/--bg-sidebar/--divider` が dark block に含まれる）
- [ ] dark block の「逆エイリアス」行（`--bg-page: var(--base-page)`）が削除されている

### C. 視覚差分（Playwright）

- [ ] OB/SL/WS/QA 4画面を `http://localhost/order-management-system/docs/<page>.html` で開く
- [ ] Light モードと Dark モード両方でスクショ取得
- [ ] 本タスク前の git HEAD（`6c37180`）との視覚差分が知覚できないこと

### D. JS 動作確認

- [ ] weekly-schedule.html を開いて DevTools Console にエラーが出ないこと
- [ ] 週送り・セル選択・現場モーダル等の主要操作が動作すること

### E. コミット

- [ ] 1コミットにまとまり、`refactor(ds-migration): Phase LC-1 ...` 形式のメッセージ

## 5. 重大Claim判定

以下は1件でもあれば不合格（スコア問わず）：

- 既存機能の破壊（モーダル開かない・クリック不能など）
- Light/Dark どちらかで色が明らかに変化した（alias 解決失敗による未定義）
- co-tokens.css L195-222 の legacy aliases ブロック自体を誤って削除した（LC-5 のスコープ）

## 6. 合格時の次ステップ

- コミット → LC-2 TD 作成へ
