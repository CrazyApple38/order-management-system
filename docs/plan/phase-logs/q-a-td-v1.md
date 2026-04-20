# Q-A Test Design (TD) v1

サブフェーズ: **Q-A — Quick Access の `:root` 変数を co-tokens.css 参照へ整合**

作成日: 2026-04-20
参照: `docs/plan/ds-migration-governance.md` / W-A TD / M-A1 TD

---

## 1. 目的

`docs/mockup/quick-access.css` の `:root`（L6-41 + L1591-1597 の重複ブロック）から、co-tokens.css legacy aliases で解決可能な共通トークンを削除し、単一情報源化する。QA はモバイル寄りUIだが、DS既定 comfortable 密度に揃える。

- Light `:root` の `--base-page/surface/surface-alt/muted` / `--sub-primary/secondary` / `--accent-primary/light/dim` / `--text-primary/secondary/tertiary/disabled` / `--divider` / `--error` は co-tokens.css の同名定義 or legacy alias で解決できるので削除可能
- 後方互換ブロック（`--bg-page` → `--base-page` 等）は co-tokens.css が逆方向 alias を提供しているので削除可能
- 重複 `:root`（L1591-1597）の `--success` / `--success-text` / `--warning` / `--warning-text` / `--warning-bg` は co-tokens に整合させるが、値不一致の `--warning-text: #975A16`（co-tokens `#92400e`）と `--warning-bg: #FEFCBF`（co-tokens `rgba(214,158,46,0.1)`）は QA 独自の視覚差異を維持するため残留
- QA 固有の `--night-text: #DB577B` はクラス未参照でも他ファイル（co-navbar.js等）互換のため残留可
- 設計方針: 「削除で色が変わらないもののみ削除」

## 2. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠（重複削除の網羅） | 25 |
| B. カラー一致（見た目不変） | 20 |
| D. QA固有残留（`--warning-text` / `--warning-bg`） | 15 |
| E. 機能回帰（JS 互換性） | 25 |
| G. コード品質（:root 縮小・重複ブロック統合） | 15 |

合格: 総合 70点以上 AND 重大Claim=0

## 3. テストチェックリスト

- T1 `:root` から `--base-page/surface/surface-alt/muted` 4変数が削除されている（co-tokens alias が解決）
- T2 `:root` から `--sub-primary/secondary` が削除されている
- T3 `:root` から `--accent-primary/light/dim` が削除されている
- T4 `:root` から `--text-primary/secondary/tertiary/disabled` が削除されている
- T5 `:root` から `--divider`, `--error` が削除されている
- T6 `:root` から後方互換ブロック `--bg-page/--bg-surface/--bg-surface-2/--bg-surface-3/--bg-sidebar/--accent/--secondary` が削除されている
- T7 L1591-1597 の重複 `:root` ブロックのうち co-tokens 同値の `--success`, `--success-text`, `--warning` が削除されている
- T8 `--warning-text: #975A16`（値不一致）および `--warning-bg: #FEFCBF`（値不一致）は QA 固有で残留
- T9 `--night-text: #DB577B` は QA 固有で残留（co-tokens alias 未提供のため）
- T10 `:root` 本文 `var(--xxx)` 参照すべてが co-tokens.css の定義 or legacy alias で解決（未定義化ゼロ）
- T11 body 背景が `#E9F1F6` で解決される（`--base-page` → `--bg-page`）
- T12 アクセント色 `#44A6B5` が解決される（`--accent-primary` 同名直接定義）
- T13 差分は `docs/mockup/quick-access.css` のみ（HTML/JS/他CSS 未変更）
- T14 JS の querySelector（`qa-*` クラス群）への影響ゼロ

## 4. 重大Claim

- C1 削除した変数のうち co-tokens.css alias も欠けて本当に未定義化した（描画破綻）
- C2 値不一致の `--warning-text` / `--warning-bg` を誤削除し、通知カード・タイムラインの色が変化
- C3 QA 以外のファイル（co-*/OB/SL/WS/HTML/JS）に差分発生
- C4 JS が参照する class 名に影響し、機能破壊
