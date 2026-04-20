# Phase M-D1 SC v1 — OB/SL ボタン置換 採点結果

> Role: Scorer / Based on: `m-d1-te-v1.md`
> 採点日: 2026-04-20 / 配点: A=25 / B=10 / D=25 / E=25 / C=10 / F=5（合計 100）

---

## 1. 重大Claim 判定（1件でも該当 → 不合格）

| # | 内容 | 判定 |
|--:|------|:----:|
| 1 | 機能破壊（save/cancel/delete ハンドラ未配線） | **該当なし** |
| 2 | CSS 残留（`.md-ob-btn*` が3 CSS に残存） | **該当なし**（全0件） |
| 3 | HTML 残留 | **該当なし**（OB/SL 各0件） |
| 4 | JS 残留 | **該当なし**（OB/SL 各0件） |
| 5 | 新規記号混入 | **該当なし**（× 17=17, ✕ 11=11） |
| 6 | Coastal 外色混入 | **該当なし**（`#fff` / `#0a9db0` のみ） |
| 7 | コントラスト破綻 | **該当なし**（styles-light と同値のためAA維持） |
| 8 | `<link>` 抜け | **該当なし**（4 HTML 全て L9 に挿入） |

**重大Claim = 0**

---

## 2. 観点別採点

### A. DS準拠（トークン・命名）— 25点

- `co-buttons.css` 本体は `styles-light.css` L2712-2870 と **完全同値**（プロパティ値・セレクタ名・宣言順まで一致）
- `.btn` / `.btn-primary/-secondary/-danger/-ghost/-outline` / `.btn-sm/-md/-lg` / `.btn-icon` / `.btn-full` / `.btn-loading` + `@keyframes btn-spin` / `.btn-group/-split/-right` を完全転記
- 補完ユーティリティ 2 種は `--accent` / `--error` / `rgba(219,87,123,...)` / `--accent-dim` のみ使用、DS 変数参照で完結
- 密度連動ルール（`[data-density="compact"/"spacious"] .btn`）も同梱
- OB 17件 / SL 34件すべて `.btn + .btn-{variant} + .btn-{size}` 体系へ移行済み
- 旧 `.md-ob-btn*` 残留は HTML/JS/CSS 全て **0件**

**配点 25 / 25**

### B. カラーコーディネーション — 10点

- `.btn-primary` bg 実測 `rgb(68, 166, 181)` = `--accent`。hover/active も意味色維持
- `.btn-danger` は `rgba(219, 87, 123, 0.08)` / `.3` / `--error` で Coastal 既定の error 系
- `.btn-ghost:hover` は `--accent-dim` + `--accent`
- Coastal 外のハードコード追加なし

**配点 10 / 10**

### D. コンポーネント一貫性 — 25点

- OB 編集モーダル / 行編集モーダル / ソートモーダル / カレンダーモーダル / 変更通知モーダル のフッターが全て `btn btn-primary/-secondary/-danger` に統一
- SL 7 種以上のモーダル（site/meeting/work/notes/map/sort/slAdd/changeNotify）で save=`btn-primary` cancel=`btn-secondary` が一貫
- 補助ボタン（`+追加`・`×削除`・`プレビュー`・`✕`・`+ 作業内容追加`）も `.btn btn-sm` + variant/icon の一貫適用
- D-1 〜 D-5 全項目 Pass

**配点 25 / 25**

### E. 機能回帰（バグゼロ）— 25点

- E-1 編集モーダル save/cancel/delete — 例外なく実行
- E-2 業務詳細 `+追加` 2回で +2、`×` クリックで -1 — DOM ハンドラ健全
- E-3 地図 `プレビュー` → iframe 表示、`✕` (clearMapPreview) — OK
- E-4 `addChildBadge()` — 例外なし
- E-5 SL `smDeleteSite()` — 例外なし
- E-6 SL 各モーダルの保存/キャンセルボタン全て `.btn-primary` / `.btn-secondary` で検出・クリック可能
- E-7 slAdd モーダルの btn-primary/secondary 構造確認
- Console error 発生は M-D1 非関連の既存 404 のみ

**配点 25 / 25**

### C. カラー・タイポ・余白 — 10点

- `.btn` 既定の padding/font-size は styles-light と完全同値
- 視覚的に旧 `.md-ob-btn*` から大きく崩れる箇所なし（`btn-sm` 採用箇所は補助ボタンのみで既存より僅かに小さくなるが許容範囲）
- `font-weight: 600` / `line-height: var(--lh-tight)` 維持

**配点 10 / 10**

### F. アクセシビリティ — 5点

- `:focus-visible` で `--focus-ring` が出る（CSS 定義確認）
- `disabled` 属性付きボタンで `opacity: 0.4` / `cursor: not-allowed` / `pointer-events: none` 効く
- 新規 "×" / "✕" / "+" 記号追加なし（既存をそのまま温存）

**配点 5 / 5**

---

## 3. 補足所見（デザイナー視点）

- 補完ユーティリティ `.btn-ghost--pill-dashed` は `add-chip` / `add-badge` の「破線ピル」見た目を最小コードで再現。BEM 記法の `--` で variant ではなく modifier である点が適切
- `.btn-ghost--danger-hover` は hover で danger 色に切り替える軽量セマンティクス。`.btn-danger` との色差分を保ちつつ、静止時は ghost のため視覚的ノイズが少ない
- 地図プレビューの `×`（`clearMapPreview`）が `btn-ghost`（not danger-hover）である一方、削除系 `×`（`removeSubTaskEntry` 等）が `btn-ghost--danger-hover` で差別化されている点も妥当
- `co-buttons.css` の密度連動ルールまで同梱しているため、将来 `data-density` 切替 UI が入っても OB/SL で即適用可能

---

## 4. 総合スコア

| 観点 | 配点 | 獲得 |
|------|----:|----:|
| A DS準拠 | 25 | 25 |
| B カラー | 10 | 10 |
| D 一貫性 | 25 | 25 |
| E 機能回帰 | 25 | 25 |
| C タイポ・余白 | 10 | 10 |
| F A11y | 5 | 5 |
| **合計** | **100** | **100** |

**重大Claim: 0 / 合格ライン 70 点**

---

## 5. 判定

**合格（Pass）**

→ Phase M-D2（モーダル `.md-ob-modal*` → `.modal-*`）へ進行可。
