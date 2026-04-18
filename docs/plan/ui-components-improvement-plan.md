# UIコンポーネント定義 整備計画

**最終更新**: 2026-04-18
**ステータス**: Phase U1〜U4 完了、U6 完了、U5（各モックアップ反映）未着手
**対象**: `docs/ui-components/` を正とし、各モックアップとの整合を段階的に取る

---

## 📌 新会話での継続手順

新しい会話ではまず本ファイルを読み、以下の順で状況を把握する:

1. 本ファイル §2（決定事項）と §5（完了基準）でどこまで終わったか確認
2. §7（次のアクション詳細）で次に取り組むフェーズを確認
3. 必要に応じて以下を参照:
   - UIコンポーネント集: [`docs/ui-components/index-light.html`](../ui-components/index-light.html)（サイドバー「Design Tokens」「Button（統一 .btn-*）」「Form（統一 .form-*）」「Feedback & Overlay」）
   - 統一クラスCSS: [`docs/ui-components/styles-light.css`](../ui-components/styles-light.css)（4138行目以降が Phase U1〜U4 追加分）
   - 要件定義連携: [`docs/01_要件定義.md`](../01_要件定義.md) §5.2 UIデザインシステム、§5.1.11・§5.3.6 使用UIコンポーネント
   - アイコン運用ルール: [`CLAUDE.md`](../../CLAUDE.md) 「アイコン運用ルール（厳守）」
4. ユーザーが「Phase U5-A」等を明示指定するまで作業着手はしない（承認ポイントⓓ）

---

## 1. 背景と現状診断

### 1.1 良好な部分（現状維持）
- Coastal Light カラーパレット（16色、`:root` 変数化済）
- タイポグラフィ10段階スケール
- Modal Design Pattern（[index-light.html:2110](../ui-components/index-light.html)）でヘッダー/ボディ/フッター/4サイズ確定
- Action Button 3種 × 4状態
- Text Input 4状態
- バッジ基本13種（区分/シフト/連絡/ステータス等）
- 共通CSS: `co-navbar.css`、`co-shared-badges.css` は機能している

### 1.2 曖昧・不足で実装ブレを招いている部分
| 問題 | 影響 |
|---|---|
| spacing/z-index/モーダル幅/トースト位置が変数化されていない | 3モックアップで 8/12/16/20/24px が inline style 散在 |
| ボタン Toolbar/Inline/Tab の状態バリエーション欠落 | `md-ob-btn` `qa-login-btn` 等 **独自クラス36種以上** が並走 |
| select/textarea/combobox の Error/Focus/Disabled 未定義 | focus shadow が 2px / 3px / 無指定でバラつき |
| バッジ用途分類軸が不明瞭（選択可否/数値/アクション付き） | `md-ob-badge-chip` `qa-badge-chip` `badge-child-tag` が重複存在 |
| Drawer/Popover/Tooltip/Alert/Skeleton/Empty State 未定義 | 必要時に各モックアップが独自実装 |
| フォーカスリング/ARIA/キーボード操作ポリシー未記載 | 実装差異が生まれる |
| 双方向フィードバックループ（要件定義⇔UIコンポーネント集）未構築 | 変更が片方向で流れず整合性が取れない |

---

## 2. 今回の決定事項（ユーザー確認済）

| 項目 | 決定 |
|---|---|
| 着手順序 | **Design Tokens整備を最優先** |
| 要件定義との関係 | **UIコンポーネント集を正**とし、要件定義の画面仕様はコンポーネント名を参照する形に統一 |
| 独自クラス（md-ob-btn / qa-login-btn 等） | **共通クラスに寄せて段階廃止**（.btn-primary 等を新設、各モックアップはラッパー/追加装飾のみ残す） |
| Tokens整備スコープ | **標準スコープ**（spacing / z-index / モーダル幅 / トースト位置 / line-height / フォーカスリング） |
| 既存モックアップへの反映 | **Tokens定義のみ先行、反映は段階的**（1画面ずつ別タスクで承認ポイント挟む） |
| ボタンサイズ基準 | **`.md-btn-primary` 互換**（`.btn-md` = padding 5px 10px / font-size 12px / radius 6px）。Design Tokens の spacing には乗らない中間値だが、既存UIとの互換性を優先した結果 |
| アイコン運用 | **`docs/assets/icons/` から必ず採用**、絵文字・Unicode記号禁止。色変更時はSVG形式、`<svg><symbol>` スプライト + `<use href="#ui-icon-xxx"/>` 参照方式 |
| メニュー(⋮)代替 | ライブラリに該当アイコン無し → **歯車（`im-00001-muryou-no-settei-haguruma.svg`）で代替**。必要時に自作SVG追加検討 |
| メタドキュメント配置 | プロジェクト固有ルール（アイコン運用等）は **CLAUDE.md** に記載。MEMORY.md のグローバルメモリには置かない |

---

## 3. 実施フェーズ

### Phase U1 — Design Tokens 標準スコープ定義 ★最優先
**対象**: `docs/ui-components/styles-light.css` の `:root` に追加

追加するトークン群:
```css
/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 48px;

/* z-index レイヤ */
--z-dropdown: 100;
--z-sticky: 200;
--z-overlay: 900;
--z-modal: 1000;
--z-popover: 1100;
--z-tooltip: 1200;
--z-toast: 2000;

/* モーダル幅 */
--modal-w-sm: 380px;
--modal-w-md: 480px;
--modal-w-lg: 600px;
--modal-w-xl: 800px;

/* トースト位置 */
--toast-offset-top: 20px;
--toast-offset-right: 20px;
--toast-offset-bottom: 20px;

/* 行高 */
--lh-tight: 1.3;
--lh-base: 1.5;
--lh-loose: 1.7;

/* フォーカスリング */
--focus-ring-width: 3px;
--focus-ring-color: var(--accent-dim);
--focus-ring: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
```

併せて `index-light.html` に「Design Tokens」セクションを追加し、値と用途を一覧表示する。

### Phase U2 — ボタン基準クラスの標準化
`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-ghost` / `.btn-sm` / `.btn-md` / `.btn-lg` / `.btn-icon` / `.btn-loading` を定義。Hover/Focus/Active/Disabled 4状態すべて。

### Phase U3 — フォーム要素の状態管理
`.form-input` / `.form-select` / `.form-textarea` / `.form-combobox` に Default/Hover/Focus/Error/Disabled/ReadOnly 6状態。`.form-label` / `.form-help` / `.form-error` も共通化。

### Phase U4 — 欠落コンポーネント追加
優先順で:
1. Alert / Banner 汎用（Info/Success/Warning/Error）
2. Tooltip
3. Popover
4. Empty State
5. Skeleton Loader
6. Confirm Dialog（Modal 特殊型）
7. Drawer
8. Pagination / Breadcrumb（必要発生時）

### Phase U5 — 各モックアップへの段階反映
画面ごとに別タスクとして承認を挟む:
- U5-A: 業務管理計画書（`screen-layout.{css,js}`）
- U5-B: 受注簿（`order-book.{css,js}`）
- U5-C: Quick Access（`quick-access.{css,js}`）
- U5-D: 週間予定表（`weekly-schedule.{css,js}`）

各画面で実施:
1. ハードコードされた余白値を `--space-*` に置換
2. `md-ob-btn` / `qa-login-btn` 等を `.btn-*` + 装飾ラッパーに置換
3. focus/error/disabled スタイルを共通化
4. 独自バッジクラスを `co-shared-badges.css` の定義に統合

### Phase U6 — フィードバックループ整備
- UIコンポーネント集と要件定義の相互参照ルールをドキュメント化
- 要件定義の画面仕様セクションに「使用UIコンポーネント」項目を追加
- UIコンポーネント変更時の影響範囲チェック手順

---

## 4. 対象ファイル

**主に編集**:
- `docs/ui-components/styles-light.css` — トークン追加、コンポーネント追加
- `docs/ui-components/index-light.html` — ドキュメント追加
- `docs/ui-components/script-light.js` — 必要時

**段階的に編集**:
- `docs/mockup/screen-layout.{css,js}`
- `docs/mockup/order-book.{css,js}`
- `docs/mockup/quick-access.{css,js}`
- `docs/mockup/weekly-schedule.{css,js}`
- `docs/mockup/co-shared-badges.css`
- `docs/mockup/co-navbar.css`

**ドキュメント更新**:
- `docs/01_要件定義.md` — 画面仕様セクションにUIコンポーネント参照追加（Phase U6）
- `CLAUDE.md` — Mockup Status / 整備状況の追記

---

## 5. 完了基準

- [x] Phase U1: 標準スコープの Tokens が `:root` に定義され、`index-light.html` にセクション化
- [x] Phase U2: `.btn-*` が 4状態 × 5バリアント × 3サイズ + 修飾子で定義され、サンプル表示
- [x] Phase U3: フォーム要素 4種 × 6状態が定義され、サンプル表示
- [x] Phase U4: Alert/Tooltip/Popover/Empty State/Skeleton/Confirm/Drawer が追加。併せてアイコンを docs/assets/icons/ の SVG スプライト化
- [ ] Phase U5: 4モックアップすべてで独自ボタン/フォームクラスが共通クラスに置換済み
- [x] Phase U6: 要件定義に「使用UIコンポーネント」欄追加（§5.1.11 / §5.3.6）、Source of Truth 宣言と変更フロー記載、CLAUDE.md にアイコン運用ルール記載

---

## 6. 承認ポイント

- ⓐ 本計画全体の承認 **✅ 承認済（2026-04-18）**
- ⓑ Phase U1 完了時（Tokens追加結果のレビュー） **✅ 承認済**
- ⓒ Phase U2〜U4 各完了時 **✅ U2/U3/U4 すべて承認済**
- ⓓ Phase U5-A/B/C/D 各画面の反映前 ← **次はここ**

各ポイントでユーザーが明示承認してから次へ進む。Phase Gate Rules に準拠。

---

## 7. 次のアクション詳細（Phase U5）

Phase U5 は各モックアップの独自クラスを新統一クラスに置換する作業。**画面ごとに別タスク**で承認ⓓを挟んで進める。

### 7.1 共通作業（全画面に適用）

1. **ハードコード数値をトークンに置換**:
   - `padding: 12px` → `padding: var(--space-md)` 等
   - `box-shadow: 0 0 0 3px var(--accent-dim)` → `box-shadow: var(--focus-ring)`
   - `z-index: 1000` → `z-index: var(--z-modal)` 等
2. **ボタン置換**:
   - `.md-ob-btn` / `.qa-login-btn` / `.sm-*` 独自ボタン → `.btn` + バリアント + サイズ + 必要に応じた装飾ラッパー
   - HTMLとJS両方のクラス参照箇所を更新
3. **フォーム要素置換**:
   - `.md-fi-input` / `.qa-input` / `.combobox-input` 等 → `.form-input` / `.form-combobox` 一式
   - エラー状態は `.is-error` + `aria-invalid="true"` へ
4. **アイコン置換**:
   - 絵文字・Unicode記号（×、✓、!、?、＋、★、▾、▴、📋 等）→ `<svg class="ui-icon"><use href="#ui-icon-xxx"/></svg>`
   - 各モックアップのHTMLに SVG スプライト定義を追加（あるいは外部化を検討）
5. **バッジ統合**:
   - 画面独自バッジクラス → `co-shared-badges.css` の共通定義を使用

### 7.2 画面別の優先作業

| フェーズ | 対象画面 | ファイル | 置換ボリュームの目安 | 特記事項 |
|---------|---------|---------|----------------------|---------|
| **U5-A** | 業務管理計画書 | `docs/screen-layout.html` + `docs/mockup/screen-layout.{js,css}` | 最大（3304行のCSS） | `sm-*` / `md-ob-*` / `md-sp-*` が多数。独自ボタン36種以上 |
| **U5-B** | 受注簿 | `docs/order-book.html` + `docs/mockup/order-book.{js,css}` | 大（1870行のCSS） | `md-ob-btn` / `md-ob-tb-btn` / `md-ob-cal-info-btn` |
| **U5-C** | Quick Access | `docs/quick-access.html` + `docs/mockup/quick-access.{js,css}` | 中（2039行のCSS） | `qa-` プリフィックスで独立実装が最も多い画面 |
| **U5-D** | 週間予定表 | `docs/weekly-schedule.html` + `docs/mockup/weekly-schedule.{js,css}` | 大（3304行のCSS） | 応援予約機能 (Phase A1〜A8) 完了直後。衝突注意 |

### 7.3 推奨着手順

- **C → B → A → D** を推奨:
  - C (Quick Access) は独立実装が多く、置換効果が大きく学習コストも低い
  - B (受注簿) で `md-ob-*` パターンを確立
  - A (業務管理計画書) で最大規模の置換を最後に
  - D (週間予定表) は応援予約機能の直後なので機能安定を待って最後

### 7.4 各画面の完了条件

- 独自クラス（`md-ob-btn`, `qa-login-btn`, `sm-*` 等）の新規使用がない
- `grep -n "padding: [0-9]" *.css` でハードコード余白がほぼゼロ（例外は legacy コメント付き）
- Playwrightで視覚的回帰テスト（スクリーンショット比較）：見た目が変わらないことを確認
- 計画書の完了基準（§5）の Phase U5 行をチェック

### 7.5 リスクと注意

- モックアップは運用中なので **機能退行は絶対に避ける**。CSS書き換えは視覚的には同じ結果になることを確認
- 一度に全クラスを置換せず、**1コンポーネント（ボタン→フォーム→アイコン）単位で差分確認**
- 各画面の JS にクラス名がハードコードされている箇所（`classList.add('md-ob-btn-primary')` 等）にも注意
- `co-shared-badges.css` と `co-navbar.css` は既に共通化されているので干渉に注意

---

## 8. 関連ドキュメント

- 要件定義: [`docs/01_要件定義.md`](../01_要件定義.md) §5.2 UIデザインシステム、§5.1.11・§5.3.6 使用UIコンポーネント
- プロジェクト全体ガイド: [`CLAUDE.md`](../../CLAUDE.md) 「アイコン運用ルール（厳守）」
- 開発手順: [`docs/00_開発手順書.md`](../00_開発手順書.md)
- UIコンポーネント集（ビジュアル）: [`docs/ui-components/index-light.html`](../ui-components/index-light.html)
- 週間予定表の応援予約作業（別進行）: [`docs/plan/ws-support-partner-plan.md`](ws-support-partner-plan.md)
