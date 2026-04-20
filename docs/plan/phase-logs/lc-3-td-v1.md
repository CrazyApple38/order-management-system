# テスト項目: LC-3 — `--error / --success* / --warning*` の新DS変数置換

- 作成日: 2026-04-21
- 作成者: TD (main thread)
- 対象: Phase M-G-Final LC-3

## 1. 目的

旧エイリアス `--error / --success / --success-text / --warning / --warning-text / --warning-bg` を新DS `--semantic-*` に完全置換する。

**特例**: Light/Dark の各モックアップ `:root` に存在する意図的な値上書き（例: SL/WS/OB/QA の `--warning-text: #975A16`）はユーザー判断「LHSを新変数に改名して上書き保存（推奨）」に従い、**LHS のみ新名に改名し値は維持**する。

co-tokens.css L210-215 の legacy aliases は LC-5 で削除するため保持。

## 2. スコープ

### 2.1 置換マッピング（consumer 参照）

| 旧 | 新 |
|---|---|
| `var(--error)` | `var(--semantic-error)` |
| `var(--success)` | `var(--semantic-success)` |
| `var(--success-text)` | `var(--semantic-success-text)` |
| `var(--warning)` | `var(--semantic-warning)` |
| `var(--warning-text)` | `var(--semantic-warning-text)` |
| `var(--warning-bg)` | `var(--semantic-warning-bg)` |

**厳密一致注意**: `var\(--error\)` は `var(--error-light)` / `var(--error-bg)` にマッチさせない。同様に `var\(--success\)` は `-text` `-bg` 付き変数と別物。末尾 `)` 込みの完全一致で置換。

### 2.2 対象ファイル（consumer 参照、事前実測 136 件）

| ファイル | 件数 |
|---------|----:|
| weekly-schedule.css | 51 |
| screen-layout.css | 54 |
| quick-access.css | 17 |
| co-shared-badges.css | 5 |
| order-book.css | 5 |
| co-forms.css | 2 |
| co-buttons.css | 2 |

### 2.3 LHS 改名（上書き保存、値維持）

**Light :root**:
- [screen-layout.css:29](../../mockup/screen-layout.css#L29): `--warning-text: #975A16` → `--semantic-warning-text: #975A16`
- [weekly-schedule.css:53](../../mockup/weekly-schedule.css#L53): `--warning-text: #975A16` → `--semantic-warning-text: #975A16`
- [order-book.css:26](../../mockup/order-book.css#L26): `--warning-text: #975A16` → `--semantic-warning-text: #975A16`
- [quick-access.css:1751](../../mockup/quick-access.css#L1751): `--warning-text: #975A16` → `--semantic-warning-text: #975A16`
- [quick-access.css:1752](../../mockup/quick-access.css#L1752): `--warning-bg: #FEFCBF` → `--semantic-warning-bg: #FEFCBF`

**Dark :root**:
- [screen-layout.css:80-88](../../mockup/screen-layout.css#L80-L88): `--error / --success / --success-text / --warning / --warning-text / --warning-bg` を `--semantic-*` に改名（値維持）
- [weekly-schedule.css:116-124](../../mockup/weekly-schedule.css#L116-L124): 同様

### 2.4 範囲外（触らない）

以下は LC-3 マッピング非対象のため一切変更しない：

- `--error-light`, `--error-bg`, `--success-bg` — 独自のα値・階調
- `--night-text`, `--tooltip-*`, `--header-btn-*` — 別目的
- `--shadow-*` — LC-4 スコープ
- `--secondary` — LC 全体でスコープ外

## 3. 評価ルーブリック（LC専用、100点満点）

| カテゴリ | 配点 | 評価内容 |
|---------|----:|---------|
| A. 対象変数の置換漏れゼロ | 30 | `var(--error/success/success-text/warning/warning-text/warning-bg)` が co-tokens.css L210-215 以外 0件 |
| B. 未定義変数による CSS 参照エラーゼロ | 25 | 新変数 6種が Light/Dark で解決可能、上書き値が維持されている |
| C. 視覚差分なし | 20 | Playwright スクショで OB/SL/WS/QA の警告/エラー/成功系表示に崩壊なし |
| D. JS 参照破壊ゼロ | 15 | JS 参照 0件（確認要）、Console エラーなし |
| E. コミット粒度・メッセージの適切性 | 10 | 1コミット、LC-3 の意図伝達 |

**合格基準**: 総合70点以上 AND 重大Claimゼロ

## 4. TE チェックリスト

### A. 置換漏れゼロ（grep、path: docs/mockup）
- [ ] `var\(--error\)` → 0件（co-tokens L210 は LHS のため grep ヒットしない）
- [ ] `var\(--success\)` → 0件
- [ ] `var\(--success-text\)` → 0件
- [ ] `var\(--warning\)` → 0件
- [ ] `var\(--warning-text\)` → 0件
- [ ] `var\(--warning-bg\)` → 0件

### B. LHS 改名確認
- [ ] SL/WS/OB/QA の Light `:root` で `--warning-text: #975A16` の LHS が `--semantic-warning-text: #975A16` に改名されている
- [ ] QA の `--warning-bg: #FEFCBF` の LHS が `--semantic-warning-bg: #FEFCBF` に改名
- [ ] SL:80-88, WS:116-124 の Dark block で Dark用上書き値が `--semantic-*` に改名されている
- [ ] grep `^\s*--(error|success|success-text|warning|warning-text|warning-bg)\s*:` → co-tokens.css L210-215 の 6件のみ

### C. 視覚差分（Playwright）
- [ ] 4画面 × Light/Dark = 8 スクショ（`c:\xampp\htdocs\order-management-system\lc-3-<page>-<theme>.png`）
- [ ] 通知カード・警告バナー・エラーバッジ・成功メッセージの色が適切（白化・崩壊なし）
- [ ] QA の通知カードで `--semantic-warning-bg` (#FEFCBF) が効いている

### D. JS 動作確認
- [ ] JS ファイルに `--error/--success/--warning` 参照が 0件（grep）
- [ ] OB / WS の Console エラーなし

### E. コミット
未実施として記載。

## 5. 重大Claim判定

- 警告/エラー/成功 表示の色崩壊（未定義変数による白化）
- 上書き値が失われ co-tokens.css の値に置換されてしまう（QA の #FEFCBF が消えるなど）
- co-tokens.css L210-215 の誤削除

## 6. 合格時の次ステップ

- コミット → LC-4 TD 作成へ
