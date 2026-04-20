# M-G1 Test Design (TD) v1

サブフェーズ: **M-G1 — OB スコープにおける旧クラス・旧変数エイリアスの最終検証**

作成者: Test Designer (TD)
作成日: 2026-04-20
参照: `docs/plan/ds-migration-plan.md` / `docs/plan/ds-migration-governance.md` / `docs/plan/phase-logs/m-a2-td-v1.md` / `docs/plan/phase-logs/m-e1-td-v1.md` / `docs/plan/phase-logs/m-f-sc-v1.md`

---

## 1. 目的

Phase M0〜M-F が完了し、OB は新DS体系で動作している。M-G1 では **OB スコープに限定した最終検証** を実施する。

### 1.1 検証範囲（厳密）

1. **OB CSS 本文に旧変数参照が残存していないか** の再確認（M-A2 で実施済みの確認 + 直近フェーズでの取りこぼし検出）
2. **OB HTML / JS 内に「移行対象の旧クラス」が残存していないか** の確認
3. **OB CSS 内のデッドコード検出**（未使用になった旧クラス定義の洗い出し）

### 1.2 方針判断: **案B（検証のみ）**

- **案A**: 未使用CSSを削除（lintベース）
- **案B**: M-G1 は**検証のみ**（実際の削除は全画面移行後に一括）
- **採用: 案B**（リスク最小、削除は全画面マイグレーション後の final clean up phase）

### 1.3 残存許容クラス（OB固有・移行対象外）

以下は OB 固有の命名であり、M-G1 スコープでは**そのまま残存を許容**:

- `.md-ob-header` / `.md-ob-toolbar` / `.md-ob-filter-bar`
- `.md-ob-cal-info-meta` / `.md-ob-cal-meta-*` / `.md-ob-cal-badge-*` / `.md-ob-cal-edit-panel`
- `.md-ob-conf-tentative_high` / `.md-ob-conf-tentative_low`
- `.md-ob-tt-badge` / `.md-ob-individual-task`
- その他 `.md-ob-<OB固有名詞>` 系（cell-tooltip, dropdown, resizer 等）

### 1.4 co-tokens.css の legacy aliases — 削除しない

他画面（SL/WS/QA）がまだ旧変数（`--base-page` / `--sub-primary` / `--accent` / `--error` / `--shadow-*` 等）を参照しているため、**legacy aliases セクションは M-G1 では削除しない**。削除は全画面移行完了後の最終フェーズで行う。

### 1.5 変更禁止ファイル（前提）

- `docs/mockup/co-tokens.css`
- `docs/mockup/co-forms.css`
- `docs/mockup/co-buttons.css`
- `docs/mockup/co-shared-badges.css`
- `docs/mockup/co-modal.css` / `co-navbar.css` / `co-navbar.js`
- `docs/mockup/weekly-schedule.css` / `quick-access.css` / `screen-layout.css`
- 全 HTML / JS（特に `docs/order-book.html` / `docs/mockup/order-book.js`）

---

## 2. 配点

| 区分 | 配点 | 観点 |
|------|-----:|------|
| A. DS 準拠（旧変数参照 0件） | **30** | OB CSS に `var(--base-*)` / `var(--sub-*)` / `var(--accent)` / `var(--accent-light)` / `var(--accent-dim)` / `var(--error)` / `var(--success)` / `var(--warning)` / `var(--shadow-*)` 等の旧変数参照が残存していない |
| D. コンポーネント一貫性（OB 移行対象クラスの残存ゼロ） | 20 | OB HTML / JS / CSS に `.md-ob-btn*` / `.md-ob-modal*` / `.md-ob-grid*` / `.md-ob-cell*` / `.md-ob-form-row*` / `.md-ob-badge-*` の残存件数が「既知の M-E1 採用案C'' による意図的残存分のみ」 |
| E. 機能回帰ゼロ | **30** | 検証作業での CSS / HTML / JS への差分が「M-A2 置換漏れの修正」のみで、機能動作への影響ゼロ |
| G. コード品質・保守性 | 20 | デッドコード洗い出し、次フェーズ（SL/WS/QA）への引継ぎドキュメント品質 |
| **合計** | **100** | — |

**合格条件**: 総合 70点以上 AND 重大Claim = 0

---

## 3. 事前調査結果（検証ベースライン）

### 3.1 OB CSS 本文の旧変数参照（M-A2 以降の状態）

`Grep` で `docs/mockup/order-book.css` を走査。対象パターン: `var\(--base-page\)|var\(--base-surface\)|var\(--base-surface-alt\)|var\(--base-muted\)|var\(--sub-primary\)|var\(--sub-secondary\)|var\(--accent\)|var\(--accent-light\)|var\(--accent-dim\)|var\(--error\)|var\(--success\)|var\(--success-text\)|var\(--warning\)|var\(--warning-bg\)|var\(--shadow-sm\)|var\(--shadow-md\)|var\(--shadow-lg\)|var\(--shadow-medium\)|var\(--shadow-strong\)`

| 変数 | 残存件数 | 判定 |
|-----|---:|------|
| `var(--base-*)` | 0 | ✓ |
| `var(--sub-*)` | 0 | ✓ |
| `var(--accent-light)` / `var(--accent-dim)` | 0 | ✓ |
| **`var(--accent)` 単独** | **3** | ✗ **M-A2 置換漏れ** |
| `var(--error)` / `var(--success)` / `var(--success-text)` / `var(--warning)` / `var(--warning-bg)` | 0 | ✓ |
| `var(--shadow-*)` | 0 | ✓ |

**発見**: L649 / L1026 / L1161 の 3箇所で `var(--accent)` が残存。これは M-A2 の置換ルール R（`var(--accent)` → `var(--accent-primary)`）に該当するが、M-A2 TD の R1〜R13 にこのルールが含まれておらず（M-A2 TD は `var(--accent)` 単独を置換対象リストに入れていなかった）、結果として取りこぼしとなった。

legacy alias `--accent: var(--accent-primary);` が co-tokens.css L205 にあるため画面表示には影響なし（`#44A6B5` で正しく解決）。だが **「OB CSS 本文に旧変数参照ゼロ」の M-G1 合格条件からは外れる**ため、**M-G1 の IM で 3箇所を修正** する。

### 3.2 OB HTML / JS / CSS の旧クラス残存状況

| クラス接頭辞 | HTML (order-book.html) | JS (order-book.js) | CSS (order-book.css) | 移行対象? | 残存判定 |
|-------------|---:|---:|---:|:--:|:--:|
| `.md-ob-btn*` | 0 | 0 | 0 | ✓ | 完了 |
| `.md-ob-modal*` | 0 | 0 | 0 | ✓ | 完了 |
| `.md-ob-grid*` | 0 | 0 | 0 | ✓ | 完了 |
| `.md-ob-cell*` | 0 | 0 | 0 | ✓ | 完了 |
| `.md-ob-form-row*` | 0 | 0 | 0（※3件はコメント） | ✓ | 完了 |
| **`.md-ob-badge-*`** | **12** | **32** | 0（※1件はコメント） | ✓ | **意図的残存** |

**`.md-ob-badge-*` の残存について**: M-E1 採用案C''（ハイブリッド最小スコープ）の方針に基づき、HTML/JS は `.md-ob-badge-*` を使い続け、co-shared-badges.css 側で `.bt-*` エイリアスを並置する形で DS 準拠を達成済み。**物理リネーム（`.md-ob-badge-*` → `.bt-*`）は SL のバッジ移行完了後の M-G 最終フェーズ**（現 M-G1 よりさらに後）で実施する計画。

従って M-G1 では **`.md-ob-badge-*` 44件の残存は「意図的残存」として許容**。

### 3.3 `md-ob-conf-tentative_*` の扱い

OB JS L622 / L623 / L651 / L652 に `md-ob-conf-tentative_high` / `md-ob-conf-tentative_low` の動的クラス付与あり。これは M-C4 の方針で **OB 固有の信頼度モディファイア** として残存を許容済み（M-C4 SC 済）。M-G1 スコープでは対象外。

### 3.4 co-tokens.css legacy aliases の存在確認

`co-tokens.css` L177〜L223 に legacy aliases セクションが存在。内訳:

| カテゴリ | エイリアス名 | 件数 |
|---------|-------------|---:|
| base | `--base-page` / `--base-surface` / `--base-surface-alt` / `--base-muted` | 4 |
| sub | `--sub-primary` / `--sub-secondary` | 2 |
| accent | `--accent` / `--accent-light` / `--accent-dim` | 3 |
| semantic | `--error` / `--success` / `--success-text` / `--warning` / `--warning-text` / `--warning-bg` | 6 |
| shadow→elevation | `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-medium` / `--shadow-strong` | 5 |
| **合計** | | **20** |

### 3.5 他画面（SL/WS/QA）の旧変数依存状況

`docs/mockup/` 配下の CSS で旧変数 `var(--base-page|--sub-primary|--accent|--error|--shadow-*)` を参照しているファイル:

| ファイル | 参照件数 |
|---------|---:|
| `co-navbar.css` | 2 |
| `co-buttons.css` | 12 |
| `co-forms.css` | 14 |
| `co-shared-badges.css` | 10 |
| `weekly-schedule.css` | 38 |
| `quick-access.css` | 25 |
| `screen-layout.css` | 33 |
| `order-book.css` | 3（M-G1 で修正予定） |
| **合計** | **137** |

→ legacy aliases は **依然として 134件以上の参照** を支えている。**co-tokens.css の legacy aliases は M-G1 では絶対に削除しない**。

### 3.6 OB CSS 内の未使用旧クラス定義（デッドコード候補）

M-G1 スコープでは削除は行わないが、**洗い出し結果を TE に記録して M-G 最終フェーズへ引き継ぐ**。

OB CSS 内の `.md-ob-badge-*` 定義: 0件（co-shared-badges.css に集約済み、M-E1 で整理済）。
OB CSS 内の `.md-ob-btn*` / `.md-ob-modal*` / `.md-ob-grid*` / `.md-ob-cell*` / `.md-ob-form-row*` 定義: 0件（各フェーズで移行済）。

→ **M-G1 スコープ内には削除対象のデッドコードなし**。

---

## 4. チェックリスト

### A. DS 準拠（旧変数参照の駆逐）

- [ ] **T1** `Grep "var\(--base-page\)|var\(--base-surface\)|var\(--base-surface-alt\)|var\(--base-muted\)" docs/mockup/order-book.css` → **0件**
- [ ] **T2** `Grep "var\(--sub-primary\)|var\(--sub-secondary\)" docs/mockup/order-book.css` → **0件**
- [ ] **T3** `Grep "var\(--accent-light\)|var\(--accent-dim\)" docs/mockup/order-book.css` → **0件**
- [ ] **T4** `Grep "var\(--accent\)[,)]" docs/mockup/order-book.css` → **0件**（単独 `--accent` も除去済）
- [ ] **T5** `Grep "var\(--error\)[,)]|var\(--success\)[,)]|var\(--success-text\)|var\(--warning\)[,)]|var\(--warning-bg\)" docs/mockup/order-book.css` → **0件**
- [ ] **T6** `Grep "var\(--shadow-sm\)|var\(--shadow-md\)|var\(--shadow-lg\)|var\(--shadow-medium\)|var\(--shadow-strong\)" docs/mockup/order-book.css` → **0件**

### D. 移行対象クラスの残存検証

- [ ] **T7** `Grep "md-ob-btn" docs/order-book.html` → **0件**
- [ ] **T8** `Grep "md-ob-btn" docs/mockup/order-book.js` → **0件**
- [ ] **T9** `Grep "md-ob-btn" docs/mockup/order-book.css` → **0件**
- [ ] **T10** `Grep "md-ob-modal" docs/order-book.html` → **0件**
- [ ] **T11** `Grep "md-ob-modal" docs/mockup/order-book.js` → **0件**
- [ ] **T12** `Grep "md-ob-modal" docs/mockup/order-book.css` → **0件**
- [ ] **T13** `Grep "md-ob-grid" docs/order-book.html` → **0件**
- [ ] **T14** `Grep "md-ob-grid" docs/mockup/order-book.js` → **0件**
- [ ] **T15** `Grep "md-ob-grid" docs/mockup/order-book.css` → **0件**
- [ ] **T16** `Grep "md-ob-cell" docs/order-book.html` → **0件**
- [ ] **T17** `Grep "md-ob-cell" docs/mockup/order-book.js` → **0件**
- [ ] **T18** `Grep "md-ob-cell" docs/mockup/order-book.css` → **0件**
- [ ] **T19** `Grep "md-ob-form-row" docs/order-book.html` → **0件**
- [ ] **T20** `Grep "md-ob-form-row" docs/mockup/order-book.js` → **0件**
- [ ] **T21** `Grep "md-ob-form-row" docs/mockup/order-book.css` → 3件（全てコメント内、実定義・参照なし）
- [ ] **T22** `Grep "md-ob-badge-" docs/order-book.html` → **12件（意図的残存、M-E1 案C'' 方針）**
- [ ] **T23** `Grep "md-ob-badge-" docs/mockup/order-book.js` → **32件（意図的残存、同上）**
- [ ] **T24** `Grep "md-ob-badge-" docs/mockup/order-book.css` → 1件（コメント内のみ）

### E. 機能回帰ゼロ

- [ ] **T25** M-G1 IM による差分が `docs/mockup/order-book.css` のみ（`git diff --name-only` で確認）
- [ ] **T26** `var(--accent)` → `var(--accent-primary)` 置換後の解決値は `#44A6B5`（legacy alias でも同値）で画面変化ゼロ
- [ ] **T27** OB の主要インタラクション（モーダル開閉、ドラッグ、フィルタ、バッジ編集、カレンダー操作）が M-F 完了時点と同じく動作

### G. コード品質・保守性

- [ ] **T28** OB CSS 内に `.md-ob-btn*` / `.md-ob-modal*` / `.md-ob-grid*` / `.md-ob-cell*` / `.md-ob-form-row*` / `.md-ob-badge-*` の**CSS 定義**が 0件（コメントは除外）
- [ ] **T29** co-tokens.css の legacy aliases セクション（L177〜L223）に差分ゼロ
- [ ] **T30** 変更禁止ファイル（co-forms.css / co-buttons.css / co-shared-badges.css / co-modal.css / co-navbar.css / weekly-schedule.css / quick-access.css / screen-layout.css / 全 HTML / 全 JS）に差分ゼロ

---

## 5. 重大Claim（検出された場合は即 FAIL）

| # | Claim | 検査方法 |
|---|-------|---------|
| **C1** | **移行対象の旧クラス（`.md-ob-btn/-modal/-grid/-cell/-form-row`）が OB HTML / JS / CSS の実コードに残存** | T7〜T21（T21 はコメント内のみ許容） |
| **C2** | **M-A2 で定めた旧変数参照が残存**（`.md-ob-badge-*` と `.md-ob-conf-tentative_*` を除く旧変数） | T1〜T6 |
| **C3** | **co-tokens.css の legacy aliases を誤って削除または改変** | T29 |
| **C4** | **変更禁止ファイルに差分が発生** | T30 |
| **C5** | **OB の機能が破壊される**（モーダル開閉不能、ドラッグ動作不良、バッジ操作不能 等） | T27 |
| **C6** | **`.md-ob-badge-*` の物理リネームを M-G1 で実施してしまった**（M-G 最終フェーズの範疇を先食いしていないか） | T22〜T24（件数が M-F 完了時点より減少していないこと） |

---

## 6. 合格条件

- 全 30項目の検証に基づく総合点が **70点以上**
- 重大Claim（C1〜C6）が **0件**

両方を満たした場合のみ、M-G1 PASS と判定。

---

## 7. IM 作業指示

### 7.1 修正対象

`docs/mockup/order-book.css` 内の 3箇所の `var(--accent)` を `var(--accent-primary)` に置換する:

- L649: `.md-ob-tt-badge` の `color: var(--accent);` → `color: var(--accent-primary);`
- L1026: `.md-ob-cal-info-meta .md-ob-cal-meta-company` の `color: var(--accent);` → `color: var(--accent-primary);`
- L1161: `.md-ob-cal-badge-btn.active` の `border-color: var(--accent); color: var(--accent);` → `border-color: var(--accent-primary); color: var(--accent-primary);`

### 7.2 置換後の解決値

| 置換前 | 置換後 | 解決値 |
|-------|-------|--------|
| `var(--accent)` (legacy alias) | `var(--accent-primary)` | `#44A6B5`（両者同値） |

→ 見た目の変化ゼロ。

### 7.3 コメント更新

該当箇所周辺のコメント（L645-646 の `.md-ob-tt-badge` 説明）に「accent」の表記があっても、意味的に通じる範囲であれば変更不要。

---

## 8. 備考

1. **他画面（SL/WS/QA）の移行は別フェーズ**: M-G1 は OB スコープ限定。SL/WS/QA の旧変数置換・旧クラス移行は今後別サブフェーズで実施。
2. **最終 legacy aliases 削除フェーズ**: 全画面（SL/WS/QA + OB）の移行完了後に、co-tokens.css の legacy aliases 20件を一括削除する。これが真の「Phase M-G 最終フェーズ」。
3. **`.md-ob-badge-*` 物理リネーム**: M-E1 SC 引継ぎに従い、SL のバッジ移行完了後、OB + SL の HTML/JS 同時リネーム（OB 12+32 + SL 20+29 = 93件）を別フェーズで実施。
4. **M-G1 IM の副作用**: 3件の文字列置換のみ。見た目・機能への影響はゼロ（legacy alias と新DS変数は同じ解決値）。
