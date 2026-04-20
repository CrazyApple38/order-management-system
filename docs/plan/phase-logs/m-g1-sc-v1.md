# Phase M-G1 SC v1 — OB 旧クラス・旧変数エイリアス最終検証 採点

> Role: Scorer（SC）/ 対象 TD: `m-g1-td-v1.md` / 対象 TE: `m-g1-te-v1.md` / 対象 IM: `docs/mockup/order-book.css`（3件の `var(--accent)` → `var(--accent-primary)` 置換）
> 採点方針: TE v1 の実測結果を TD 配点ルーブリックに照合し、M-G1 を評価

---

## 1. 配点別採点

配点: A=30 / D=20 / E=30 / G=20

### A. DS 準拠（旧変数参照の駆逐）— 30点

- `var(--base-*)` / `var(--sub-*)` / `var(--accent-light)` / `var(--accent-dim)` 残存: **0件**（TE T1-T3 PASS）
- `var(--accent)` 単独残存: **0件**（M-A2 置換漏れ 3件を IM で修正済、TE T4 PASS）
- `var(--error)` / `var(--success)` / `var(--success-text)` / `var(--warning)` / `var(--warning-bg)` 残存: **0件**（TE T5 PASS）
- `var(--shadow-*)` 残存: **0件**（TE T6 PASS）
- **OB CSS 本文の新DS変数移行は 100% 完了**
- 素点: **30/30**

### D. コンポーネント一貫性（移行対象クラス残存検証）— 20点

- `.md-ob-btn*` 残存: HTML 0 / JS 0 / CSS 0 — **完全移行**
- `.md-ob-modal*` 残存: HTML 0 / JS 0 / CSS 0 — **完全移行**
- `.md-ob-grid*` 残存: HTML 0 / JS 0 / CSS 0 — **完全移行**
- `.md-ob-cell*` 残存: HTML 0 / JS 0 / CSS 0 — **完全移行**
- `.md-ob-form-row*` 残存: HTML 0 / JS 0 / CSS 3件（コメントのみ） — **完全移行**
- `.md-ob-badge-*` 残存: HTML 12 / JS 32 / CSS 1件（コメント） — **意図的残存**（M-E1 案C'' 方針、物理リネームは M-G 最終フェーズ）
- 6サブカテゴリ中 5カテゴリで完全移行、1カテゴリは意図的残存で方針整合
- 素点: **20/20**

### E. 機能回帰ゼロ — 30点

- 差分ファイル: M-G1 由来は `docs/mockup/order-book.css` のみ（TE T25 PASS）
- `var(--accent)` と `var(--accent-primary)` の解決値同値（`#44A6B5`、co-tokens.css L205 で保証）→ 画面変化ゼロ
- JS / HTML への差分: M-G1 由来 0件
- 既存 M-F 完了時点から見た目の変化: **0**
- 機能動作への影響: **0**（CSS 変数の別名化のみ）
- 素点: **30/30**

### G. コード品質・保守性 — 20点

- OB CSS 内の移行対象クラス CSS 定義: 0件（T28 PASS）
- co-tokens.css legacy aliases 保全: 差分ゼロ（T29 PASS）
- 変更禁止ファイル差分ゼロ（T30 PASS）
- 次フェーズ引継ぎドキュメント: TD § 8 に明記（SL/WS/QA 移行・`.md-ob-badge-*` 物理リネーム・legacy aliases 最終削除の 3タスク）
- 素点: **20/20**

---

## 2. 重大Claim 判定

| # | Claim | 判定 |
|---|-------|------|
| C1 | 移行対象の旧クラスが OB 実コードに残存 | **該当なし**（`.md-ob-badge-*` は M-E1 SC で承認済みの意図的残存） |
| C2 | M-A2 で定めた旧変数参照が残存 | **該当なし**（IM で 3件を修正） |
| C3 | co-tokens.css legacy aliases を誤削除・改変 | **該当なし** |
| C4 | 変更禁止ファイルに差分発生 | **該当なし** |
| C5 | OB 機能破壊 | **該当なし** |
| C6 | `.md-ob-badge-*` 物理リネームの先食い | **該当なし** |

→ **重大Claim = 0**

---

## 3. 統合評価

| 区分 | 配点 | 素点 |
|------|----:|-----:|
| A. DS 準拠 | 30 | **30** |
| D. コンポーネント一貫性 | 20 | **20** |
| E. 機能回帰ゼロ | 30 | **30** |
| G. コード品質 | 20 | **20** |
| **合計** | **100** | **100** |

### 総合点: **100/100**
### 重大Claim: **0**
### 判定: **合格**

---

## 4. OB 新DS完全準拠の宣言

### 4.1 条件付き完全準拠

以下の条件下で **OB は新DS体系に完全準拠している** ことを宣言する:

1. **co-tokens.css の legacy aliases は残存**（他画面 SL/WS/QA が依存中）。OB CSS 本文は legacy alias を**一切経由せず**、新DS一次定義名のみを参照する。
2. **`.md-ob-badge-*` クラス残存**: HTML 12 + JS 32 + CSS 1（コメント）= **45件の意図的残存**。co-shared-badges.css 側で同値の `.bt-*` エイリアスを並置して DS 準拠を達成（M-E1 採用案C''）。
3. **OB 固有クラス群は残存**: `.md-ob-header` / `-toolbar` / `-filter-bar` / `-cal-*` / `-conf-tentative_*` / `-tt-badge` 等、OB 独自命名は継続使用（DS 準拠の範疇外、意図的）。

### 4.2 準拠度サマリ

| 項目 | 状態 |
|-----|------|
| トークン（変数）層 | **100% 新DS 一次定義参照**（OB CSS 本文） |
| カラーパレット | 100% Coastal Palette |
| タイポグラフィ | 100% トークン参照（M-A3 完了） |
| レイアウト・グリッド | 100% `.tbl-grid` BEM（M-C 完了） |
| フォーム | 100% `.md-fi-*` 体系（M-B1 完了） |
| モーダル | 100% 新DS モーダル体系（M-D2 完了） |
| バッジ・チップ | 値 100% DS 準拠、物理クラス名 `.md-ob-badge-*` 残存（M-E1 案C''） |
| a11y | 100%（M-F1 完了、skip-link / ARIA / role 完備） |
| 印刷CSS | 100%（M-F2 完了、A4 縦帳票最適化） |

---

## 5. 次フェーズ引継ぎ事項

### 5.1 SL（screen-layout）移行への引継ぎ

1. **SL の旧変数参照**: 33件（`var(--base-page)` / `var(--accent)` / `var(--error)` / `var(--shadow-*)` 等）→ SL の M-A2 相当フェーズで置換
2. **SL の `.md-ob-badge-*` 残存**: 20件（HTML） + 29件（JS）→ OB の物理リネームと同時に実施
3. **SL 固有変数**（`--cell-base-*` / `--shift-bg-*` 等）: WS と共有、legacy aliases 対象外

### 5.2 WS（weekly-schedule）移行への引継ぎ

1. **WS の旧変数参照**: 38件（旧変数依存最大）→ WS の M-A 相当フェーズで最初に置換
2. WS 固有変数: SL と共有

### 5.3 QA（quick-access）移行への引継ぎ

1. **QA の旧変数参照**: 25件 → QA の M-A 相当フェーズで置換
2. QA は OB の子画面的な位置付けだが、旧変数参照は独立

### 5.4 Phase M-G 最終フェーズ（全画面完了後）

1. **co-tokens.css legacy aliases 20件を一括削除**（base×4 + sub×2 + accent×3 + semantic×6 + shadow×5）
2. **`.md-ob-badge-*` 物理リネーム**: OB (12+32) + SL (20+29) = **93件** を一括置換 → `.bt-chip / .bt-chip-child / .bt-cell-tag / .bt-cell-child / .bt-cell-grandchild / .bt-info-badge-* / .bt-cal-badge / .bt-tooltip-badge*`
3. **co-shared-badges.css Section 4 の `.md-ob-badge-*` 定義削除**
4. **機能回帰テスト**: 全モーダル × バッジ操作（ドラッグ、削除、undo、選択）一式

### 5.5 co-tokens.css 変更禁止の継続

M-G1 時点では **co-tokens.css の legacy aliases セクションは絶対に削除しない**。他画面（SL/WS/QA）が 134件以上の参照で依存中。削除は § 5.4 の最終フェーズでのみ実施。

---

## 6. 最終判定

**Phase M-G1 合格（100/100、重大Claim = 0）**

- OB スコープでの旧クラス・旧変数エイリアスの検証は完了
- OB は条件付きで新DS完全準拠を達成（co-tokens.css legacy aliases 残存・`.md-ob-badge-*` 意図的残存の 2条件下）
- 次フェーズ: SL / WS / QA の個別移行へ進行可能

---

## 7. 備考

### 7.1 M-A2 置換漏れ（3件）の検出と修正について

M-A2 TD v1 の R1〜R13 は `var(--accent)` 単独の置換ルールを含んでおらず、L649 / L1026 / L1161 の 3件が取りこぼされていた。M-G1 で検出・修正したことで、**OB CSS 本文の旧変数参照は完全にゼロ**を達成。

- M-A2 の本来の想定: `--accent` は「`--accent-primary` の別名として legacy alias で解決」→ 置換不要と判断された可能性
- M-G1 の判断: **OB CSS 本文は legacy alias を経由せず、co-tokens.css の新DS一次定義を直接参照すべき**（SL/WS/QA は legacy alias 経由のまま、後続フェーズで同様に置換）

### 7.2 IM の最小スコープ性

本 M-G1 の IM は 3行の CSS 置換のみ（`var(--accent)` → `var(--accent-primary)` × 3）。解決値同値のため見た目・機能への影響ゼロ。検証主体のフェーズとして最小の副作用で最大の検証成果を達成。
