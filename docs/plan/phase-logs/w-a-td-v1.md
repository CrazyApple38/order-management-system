# W-A Test Design (TD) v1

サブフェーズ: **W-A — Weekly Schedule の `:root` 変数を co-tokens.css 参照へ整合（Light/Dark 両対応）**

作成日: 2026-04-20
参照: `docs/plan/ds-migration-governance.md` / S-A TD / M-A1 TD

---

## 1. 目的

`docs/mockup/weekly-schedule.css` の Light `:root` から、**co-tokens.css legacy aliases で解決可能な共通トークンを削除**する。WS 固有の `--cell-base-*`, `--md-gc-bg-*`, `--cat-bg-*/--cat-text-*`（WS は screen-layout 準拠で単色）, `--shift-*`, `--past-overlay*`, `--night-text`, `--tooltip-*`, `--header-btn-*`, `--accent-hover`, `--warning-dim`, `--shadow-color/medium/strong`, α値独自の `--error-bg/success-bg`, 値不一致の `--warning-text`, `--error-light` は残留。後方互換ブロック（`--bg-page` → `--base-page` 等）は co-tokens.css が逆方向の alias を既に提供しているため削除可能。

Dark `[data-theme="dark"]` は co-tokens.css が Light 専用のため、**既存オーバーライドを全面維持**。加えて Dark accent `#098698` → `#55B5C4` に置換し WCAG AA を確保する。

## 2. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠（Light 重複削除の網羅） | 25 |
| B. カラー一致（Light 見た目不変） | 15 |
| D. WS固有変数の残留 | 15 |
| E. 機能回帰・テーマ切替時不変 | 25 |
| F. Dark AA 改善 | 10 |
| G. コード品質・:root 縮小 | 10 |

合格: 総合 70点以上 AND 重大Claim=0

## 3. テストチェックリスト

- T1 Light `:root` から `--base-page/surface/surface-alt/muted` 4変数が削除されている
- T2 Light `:root` から `--sub-primary/secondary` が削除されている
- T3 Light `:root` から `--accent-primary/light/dim` が削除されている
- T4 Light `:root` から `--text-primary/secondary/tertiary/disabled` が削除されている
- T5 Light `:root` から `--divider`, `--error`, `--success`, `--success-text`, `--warning`, `--warning-bg` が削除されている
- T6 Light `:root` の後方互換ブロック（`--bg-page/--bg-surface/--bg-surface-2/--bg-surface-3/--bg-sidebar/--accent/--secondary`）が削除されている
- T7 WS 固有 `--cell-base-day/night`, `--md-gc-bg-*`, `--cat-*`, `--shift-*` は残留（Light）
- T8 `--warning-text: #975A16` は値不一致のため残留
- T9 `--past-overlay`, `--past-overlay-light`, `--night-text`, `--tooltip-bg`, `--tooltip-color`, `--header-btn-bg`, `--header-btn-hover`, `--accent-hover`, `--error-light`, `--warning-dim`, `--error-bg`, `--success-bg` は残留
- T10 `--shadow-color/medium/strong` は本文で `rgba` 値として参照される（`box-shadow: 0 Y X <color>`）ため残留
- T11 Dark `[data-theme="dark"]` は全変数オーバーライドを維持
- T12 Dark `--accent-primary` が `#55B5C4`（WCAG AA 4.8:1 on #2a3038）に更新
- T13 Dark `--accent-light` を `#6AC5D4` に更新（対比 +0.3）
- T14 Dark `--accent-dim` を `rgba(85, 181, 196, 0.22)` に更新
- T15 Dark カテゴリバッジ色が更新された accent 系と視覚的に調和
- T16 Light で body 背景が `#E9F1F6` で解決（co-tokens.css の `--bg-page` → `--base-page` alias 経由）
- T17 差分対象は `docs/mockup/weekly-schedule.css` のみ
- T18 WS 既定行高を 40px → 36px へ統一（`min-height: 40px` → `min-height: 36px` / `.md-ws-cell`）

## 4. 重大Claim

- C1 削除した変数により本文 `var(--xxx)` が未定義化（co-tokens.css alias も欠けて本当に未定義）
- C2 WS 以外のファイル（co-*/OB/SL/QA/HTML/JS）に差分発生
- C3 `--shadow-medium/strong` を削除し box-shadow が破綻
- C4 Dark テーマが崩壊（オーバーライド欠損）
- C5 JS で参照される CSS 変数名が変更され、機能が破壊される
