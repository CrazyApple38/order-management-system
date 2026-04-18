# UI Components Changelog

受注管理システムのUIコンポーネント集・デザインシステムの変更履歴。semver 方針: MAJOR（破壊的変更）/ MINOR（純追加）/ PATCH（バグ修正・微調整）。

---

## [1.2.0] — 2026-04-18

Phase D1〜D10（デザイン洗練化・拡充改修計画）を段階的に実施。

### Added（純追加）

#### Phase D1 — 基盤トークン・バンドル
- **Typography Scale**（7段階）: `--fs-caption` (11px) / `--fs-sm` (13px) / `--fs-base` (14px) / `--fs-md` (16px) / `--fs-lg` (20px) / `--fs-xl` (26px) / `--fs-2xl` (34px)
- **Font Weights**: `--fw-regular` 〜 `--fw-black`
- **和文フォント**: `'Inter', 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI'` を body に追加 + `font-feature-settings: "palt" 1` + `font-variant-numeric: tabular-nums`
- **Spacing**: `--space-2xs` (2px) を追加
- **Motion**: `--duration-instant/fast/base/slow/slower` + `--ease-out/in/in-out/spring`
- **Elevation**: 6段階（`--elevation-0` 〜 `--elevation-5`）
- **Breakpoints**: `--bp-sm/md/lg/xl/2xl`
- **Icon Size Scale**: `--icon-xs/sm/md/lg/xl/2xl`
- **`@media (prefers-reduced-motion: reduce)`**: 全アニメーション自動短縮

#### Phase D2 — テーブル・デザインシステム
- `.tbl` ベース + 12規約（sticky-head / sticky-col / zebra / hover / aria-selected / is-editing / tbl-cell--num/--date/--text / sortable / row--total / cell--empty / footer）
- `.tbl-wrap` ラッパー（横スクロール対応）
- `.tbl-footer` + `.tbl-pagination`
- 密度モード: `.tbl--compact/--comfortable/--spacious`

#### Phase D3 — 密度モード（Density）
- `:root[data-density="compact|comfortable|spacious"]` 属性による一括切替
- `--row-height` / `--space-row` / `--fs-density-base` トークン
- Table / Button / Form の高さ・パディング・フォント連動

#### Phase D4 — 印刷スタイル（Print CSS）
- `@media print` 一式 — A4 縦既定 + `body.print-landscape` で A4 横
- ユーティリティ: `.no-print / .print-only / .print-only-inline / .page-break / .page-break-before / .page-break-after / .avoid-break / .print-include / .no-print-url`
- テーブルヘッダ継続表示、集計行強調、sticky 解除、外部リンクURL自動付記
- フォーム要素の下線化、バッジの枠線識別化

#### Phase D5 — 配色バランス改善
- **第2アクセント**: `--accent-2` (#E07856) / `--accent-2-light` / `--accent-2-dim`
- **カテゴリ色4色相分化**: `--cat-bg-facility/event/traffic/highway` + `--cat-text-*` ペア
- **Chart Palette**:
  - カテゴリカル（6系統）: `--chart-1` 〜 `--chart-6`
  - Sequential（5段階）: `--chart-seq-0` 〜 `--chart-seq-4`
  - Diverging（±）: `--chart-diverge-neg/neutral/pos`

#### Phase D7 — フォーム・バリデーション・パターン
- `.form-input.is-success/.is-warning` 状態
- `.form-success` / `.form-warning`（アイコン付きメッセージ）
- `.form-counter`（文字数カウンタ、is-warning/is-error で段階色変化）
- `.form-error-summary` + `.form-error-summary-title`（フォーム先頭サマリー）
- `.form-error-tooltip`（テーブル内編集用吹き出し）
- `.form-live-region` / `.sr-only`（aria-live / スクリーンリーダー専用）

#### Phase D8 — キーボード・ショートカット体系
- `.kbd` / `.kbd-combo` / `.kbd-sep`（キーボードキー表示）
- `.shortcut-help` / `.shortcut-help-section` / `.shortcut-help-row`（一覧モーダル用）

#### Phase D9 — アクセシビリティ
- `.sr-only`（D7 と共有）
- `.skip-link`（Tab キー初回でフォーカス時に表示）
- 監査チェックリスト 10項目を UI コンポーネント集に掲載

#### Phase D10 — マイクロコピー・ガイド
- 敬語レベル・動詞使い分け・エラー定型・空状態トーンを文書化

### Changed（仕様変更）

#### Phase D6 — コントラスト改善・2テーマ整合
- `--text-tertiary`: `#6B9AA8` → `#5A8896`（3.1:1 → 4.6:1、WCAG AA 準拠）
- `--text-disabled`: `#A0BCC5` → `#8BAEB9`
- ダーク `--accent`: `#098698` → `#55B5C4`（ライト HSL と色相・彩度一致）
- body の `font-size: 14px` / `line-height: 1.5` → `var(--fs-base)` / `var(--lh-base)` トークン参照化

### Deprecated（非推奨）

- `--shadow-sm` / `--shadow-md` / `--shadow-lg` — `--elevation-1` / `--elevation-3` / `--elevation-4` への互換エイリアスとして維持するが、新規利用は非推奨。
- `--shadow-medium` / `--shadow-strong` — `--elevation-3` / `--elevation-5` エイリアス。

### Migration（移行方法）

```css
/* 旧 */
box-shadow: var(--shadow-md);
font-size: 14px;
padding: 12px 16px;

/* 新 */
box-shadow: var(--elevation-3);
font-size: var(--fs-base);
padding: var(--space-md) var(--space-lg);
```

---

## [1.1.0] — 2026-04-17 以前

Phase U1〜U6（UIコンポーネント定義整備）。詳細は Git 履歴を参照:
- `60cdfa8` feat: UIコンポーネント定義整備 Phase U1〜U4・U6 を実施

### Added
- Design Tokens（`--space-*` / `--z-*` / `--modal-w-*` / `--focus-ring` / `--lh-*`）
- `.btn-*` 統一ボタンシステム（variant × size × modifier）
- `.form-*` 統一フォーム
- Badge / Tag / Alert / Tooltip / Popover / Empty State / Skeleton / Confirm Dialog / Drawer
- Modal Design Pattern
- アイコンライブラリ運用ルール（`docs/assets/icons/`）

---

## semver 方針

| バージョン区分 | 条件 | 例 |
|---|---|---|
| **MAJOR** (x.0.0) | 破壊的変更（クラス名変更、トークン削除、既存レイアウト崩壊） | `.btn-primary` 削除、`--space-md` の値変更 |
| **MINOR** (0.x.0) | 純追加（新トークン、新コンポーネント、新ユーティリティ） | Phase D1〜D12 |
| **PATCH** (0.0.x) | バグ修正、マイクロ調整（視覚的影響が軽微） | コントラスト微調整、タイポ修正 |

## 変更フロー

1. 計画書に Phase を起票（`docs/plan/design-refinement-plan.md` 等）
2. プレビュー作成（`docs/ui-components/preview.html`）してユーザー承認
3. 実装 → UI コンポーネント集に反映
4. 本 CHANGELOG に追記（Phase ID を必ず記載）
5. `MEMORY.md` または関連メモリーに変更点を要約

## 関連ドキュメント

- 改修計画: [docs/plan/design-refinement-plan.md](../plan/design-refinement-plan.md)
- UI 整備計画: [docs/plan/ui-components-improvement-plan.md](../plan/ui-components-improvement-plan.md)
- アイコン運用: [CLAUDE.md](../../CLAUDE.md)
