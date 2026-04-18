# デザイン洗練化・拡充 改修計画（Design Refinement & Expansion Plan）

**最終更新**: 2026-04-18
**ステータス**: 計画策定済、Phase D1 未着手
**対象**: `docs/ui-components/` + `docs/mockup/`（weekly-schedule / order-book / quick-access / screen-layout）
**関連計画**: [ui-components-improvement-plan.md](./ui-components-improvement-plan.md)（Tokens基礎整備・先行完了済）

---

## 📌 新会話での継続手順

新しい会話ではまず本ファイルを読み、以下の順で状況を把握する:

1. §2（決定事項）と §5（フェーズ進捗）で現在位置を確認
2. §6（次のアクション）で次に取り組むフェーズを確認
3. 必要に応じて以下を参照:
   - 先行計画: [ui-components-improvement-plan.md](./ui-components-improvement-plan.md) §2（確定済トークン）
   - UIコンポーネント集: [`docs/ui-components/index-light.html`](../ui-components/index-light.html) / [`styles-light.css`](../ui-components/styles-light.css)
   - モックアップ: [`docs/mockup/`](../mockup/)
   - アイコン運用ルール: [`CLAUDE.md`](../../CLAUDE.md)
4. ユーザーが「Phase D1」等を明示指定するまで作業着手はしない（承認ポイント必須）

---

## 1. 背景と現状診断

### 1.1 本計画の出発点
ユーザーから**デザイナー／カラーコーディネーター視点での率直評価**を求められ、以下3軸で評価を実施。

#### 評価A：配色・ブランド評価（2026-04-18 実施）
| 項目 | 現状スコア | 主要課題 |
|---|---|---|
| 設計一貫性 | 88 | Tier 1/2/3（60-30-10）トークン化は優秀 |
| 配色バランス | 62 | **ティール一極依存** |
| 識別性 | 55 | **カテゴリ4種を全て同一 teal** |
| タイポグラフィ | 45 | **和文フォント指定なし** |
| モダン性 | 65 | 2020年水準SaaS |
| アクセシビリティ | 70 | WCAG AA 未達箇所あり |
| ブランド独自性 | 50 | 記憶に残りにくい |
| **総合** | **62** | — |

#### 評価B：タイポグラフィ・余白評価（2026-04-18 実施）
```
font-size 実使用: 11種類（6/9/10/11/12/13/14/15/16/20/28px）— スケール破綻
padding  実使用: 30種類超（1,2,3,5,6,7,9,10,13,14px が横行）— グリッド崩壊
line-height:     1.3-1.5（和文には 1.3 は窮屈）
```

#### 評価C：デザインシステム網羅性評価（2026-04-18 実施）
既存整備済：カラー／スペーシング／z-index／モーダル幅／フォーカスリング／バッジ／アイコン運用
**欠落領域（14項目）**：本計画 Phase D1〜D12 で段階的に整備する。

### 1.2 現状維持すべき良好な部分
- Tier 1/2/3（60-30-10）の設計思想明文化
- `--space-*` `--z-*` `--modal-w-*` `--radius-*` トークン定義済（Phase U1）
- アイコンライブラリ運用ルール（絵文字禁止・SVGスプライト方式）
- セマンティックカラー分離（success / warning / error）
- Modal Design Pattern 確定
- Button / Form / Alert / Tooltip / Popover / Empty / Skeleton / Confirm / Drawer 定義済（Phase U2-U4）

---

## 2. 決定事項（ユーザー確認済 2026-04-18）

| 項目 | 決定 |
|---|---|
| 計画ファイル | **新規ファイル作成**（本ファイル） |
| 改修スコープ | **UIコンポーネント集 + モックアップ全て** |
| 重点項目 | ①タイポグラフィ再設計　②余白トークン強制適用　③配色バランス改善　④コントラスト改善・2テーマ整合　**+ 欠落14項目の段階整備** |
| ロールアウト | **段階的**（Phase毎に承認ポイント挟む） |
| 優先順位 | **業務システム観点で最重要項目を前倒し**（テーブル・印刷・密度モード） |

---

## 3. 改修目標値（ビフォーアフター）

| 指標 | 現状 | 目標 | 改善幅 |
|---|---|---|---|
| フォントサイズ種類 | 11種類 | 7種類 | -4 |
| 最小フォントサイズ | 6px | 11px | +5px |
| Padding パターン数 | 30種類超 | 7種類（`--space-*`） | -23 |
| 和文フォント指定 | なし | Noto Sans JP / Hiragino | 新規 |
| ジャンプ率（H2/本文） | 1.14 | 1.43 | メリハリ向上 |
| カテゴリ識別色相 | 1色 | 4色相 | +3 |
| text-tertiary コントラスト | 3.1:1 | 4.5:1以上 | AA準拠 |
| モーション・トークン | なし | duration 5段階 × easing 4種 | 新規 |
| Elevation 段階 | 3 | 6 | +3 |
| ブレイクポイント | なし | 5段階 | 新規 |
| テーブル共通規約 | なし | 12項目定義 | 新規 |
| 印刷スタイル | なし | `@media print` 一式 | 新規 |
| 密度モード | なし | 3モード切替 | 新規 |
| キーボードショートカット体系 | 未整備 | 一覧化 | 新規 |
| ブランド統一性スコア | 62 | 85 | +23 |

---

## 4. 実施フェーズ（優先度順）

> **優先度の根拠**：
> - 🔴 **基盤**: 後続全Phaseの前提となるトークン（軽量・純追加・最優先で整備）
> - 🔴 **業務必須**: 業務システム特有の必須機能（テーブル・印刷・密度）
> - 🟠 **品質**: UXと保守性を上げる拡張
> - 🟡 **運用基盤**: 長期運用のための仕組み
> - 🟢 **反映作業**: トークンが揃った後の適用作業

---

### 🔴 Tier 1：基盤トークン拡充（最優先・純追加）

### Phase D1 — 基盤トークン・バンドル整備 ★最優先

後続すべての前提となるトークン群を**一括で追加**する。個別Phaseに分けず、純追加で低リスクのため一気に整備する。

**対象**: `docs/ui-components/styles-light.css` / `styles.css` の `:root`

#### D1.1 タイポグラフィ・スケール（7段階）
```css
--fs-caption: 11px;   /* 補助情報・ミニバッジ（最小値・底上げ後）*/
--fs-sm:      13px;   /* セカンダリ本文 */
--fs-base:    14px;   /* 本文標準 */
--fs-md:      16px;   /* 強調本文・カード見出し */
--fs-lg:      20px;   /* セクション見出し */
--fs-xl:      26px;   /* ページ見出し */
--fs-2xl:     34px;   /* ヒーロー・大型数値 */

--fw-regular: 400;  --fw-medium: 500;
--fw-semibold: 600; --fw-bold: 700; --fw-black: 800;

/* 既存 --lh-tight/base/loose は維持 */
```

#### D1.2 和文フォント指定
```css
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont,
                 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI',
                 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "palt" 1;
    font-variant-numeric: tabular-nums;
}
```

#### D1.3 Spacing 追加
```css
/* 既存（維持）: --space-xs〜3xl */
--space-2xs: 2px;  /* バッジ内縦padding専用の微小値 */
```

#### D1.4 モーション・トークン（新規）
```css
--duration-instant: 0ms;
--duration-fast:    120ms;
--duration-base:    200ms;
--duration-slow:    320ms;
--duration-slower:  480ms;

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in:     cubic-bezier(0.7, 0, 0.84, 0);
--ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

#### D1.5 Elevation System（新規・既存shadowを置換）
```css
--elevation-0: none;
--elevation-1: 0 1px 2px rgba(0,69,84,0.06);
--elevation-2: 0 2px 4px rgba(0,69,84,0.08);
--elevation-3: 0 4px 12px rgba(0,69,84,0.10);
--elevation-4: 0 8px 24px rgba(0,69,84,0.14);
--elevation-5: 0 16px 48px rgba(0,69,84,0.18);
```
旧 `--shadow-sm/md/lg` は `--elevation-1/3/4` にエイリアス維持して互換性確保。

#### D1.6 ブレイクポイント（新規）
```css
--bp-sm:  640px;   /* スマホ横 */
--bp-md:  768px;   /* タブレット縦 */
--bp-lg:  1024px;  /* タブレット横・小型PC */
--bp-xl:  1280px;  /* デスクトップ */
--bp-2xl: 1536px;  /* 大画面 */
```

#### D1.7 アイコンサイズ・スケール（新規）
```css
--icon-xs:  12px;  /* バッジ内 */
--icon-sm:  14px;  /* インライン本文 */
--icon-md:  16px;  /* 標準・ボタン */
--icon-lg:  20px;  /* セクション見出し */
--icon-xl:  24px;  /* ヘッダー・大ボタン */
--icon-2xl: 32px;  /* ヒーロー・空状態 */
```

**完了基準**
- [ ] 全トークン追加（ライト・ダーク両テーマ）
- [ ] UIコンポーネント集「Design Tokens」に7セクション表示
- [ ] `@media (prefers-reduced-motion)` の動作確認
- [ ] 旧shadow → elevation の互換エイリアス動作確認

**影響範囲**: CSSトークン追加のみ、既存実装には影響しない（エイリアスで互換）

**所要時間目安**: 4-6時間

---

### 🔴 Tier 2：業務システム必須機能

### Phase D2 — テーブル・デザインシステム整備 ★業務最優先

受注簿・業務管理計画書の**中心UI**。共通規約なしで個別実装が進むと後で整合が取れなくなる。

**対象**: `docs/ui-components/styles-light.css` / `index-light.html` に `.tbl-*` クラス体系を新設

#### D2.1 テーブル基本規約（12項目）
1. **ベース** `.tbl` — 枠線・行高・フォント統一
2. **Sticky Header** `.tbl--sticky-head`
3. **Sticky Column** `.tbl--sticky-col`（左端列固定）
4. **Zebra Stripe** `.tbl--zebra`（偶数行背景 `--base-surface-alt`）
5. **行ホバー** `.tbl tr:hover`
6. **行選択** `.tbl tr[aria-selected="true"]`
7. **行編集中** `.tbl tr.is-editing`
8. **セルアライメント** `.tbl-cell--num`（右寄せ・`tabular-nums`）/ `.tbl-cell--date`（等幅）/ `.tbl-cell--text`（左寄せ・既定）
9. **Sort / Filter** アイコン配置（`.tbl-th--sortable`）
10. **集計行** `.tbl-row--total`（太字・背景色変更）
11. **空セル表記** `.tbl-cell--empty::before { content: "—"; }` で統一（`—` 採用）
12. **無限スクロール / ページング** 切替パターン

#### D2.2 密度対応（Phase D4と連動）
```css
.tbl--compact     { --tbl-row-h: 28px; --tbl-cell-pad: var(--space-xs) var(--space-sm); }
.tbl--comfortable { --tbl-row-h: 36px; --tbl-cell-pad: var(--space-sm) var(--space-md); }  /* 既定 */
.tbl--spacious    { --tbl-row-h: 44px; --tbl-cell-pad: var(--space-md) var(--space-lg); }
```

**完了基準**
- [ ] `.tbl-*` クラス12項目定義
- [ ] UIコンポーネント集に「Table」セクション追加
- [ ] 密度3モードのサンプル表示

**所要時間目安**: 8-12時間

---

### Phase D3 — 密度モード（Density）

業務システム定番。設定画面で切替可能にする前提でトークン化する。

**対象**: `styles-light.css` の `:root` + `data-density` 属性での切替

```css
:root[data-density="compact"] {
    --row-height: 28px;
    --space-row: var(--space-xs);
    --fs-density-base: 13px;
}
:root[data-density="comfortable"] { /* 既定 */
    --row-height: 36px;
    --space-row: var(--space-sm);
    --fs-density-base: 14px;
}
:root[data-density="spacious"] {
    --row-height: 44px;
    --space-row: var(--space-md);
    --fs-density-base: 15px;
}
```

**完了基準**
- [ ] `data-density` 属性での切替動作確認
- [ ] テーブル・ボタン・フォーム入力の高さが連動
- [ ] UIコンポーネント集に切替デモ追加

**所要時間目安**: 6-8時間

---

### Phase D4 — 印刷スタイル（Print CSS）

Excelからの移行案件で**必ず発生する帳票印刷要件**への基盤整備。

**対象**: `styles-light.css` 末尾 or 別ファイル `print.css`

```css
@media print {
    /* ページ設定 */
    @page {
        size: A4;
        margin: 15mm 10mm;
    }
    @page :first { margin-top: 20mm; }

    /* 印刷非表示 */
    .sidebar, .appbar, .toolbar, .no-print { display: none !important; }
    .main { margin-left: 0; padding: 0; max-width: 100%; }

    /* 配色：白黒最適化 */
    * { color: #000 !important; background: transparent !important; }
    .tbl { border: 1px solid #000; }

    /* ページブレイク */
    .tbl tr        { page-break-inside: avoid; }
    h1, h2, h3     { page-break-after: avoid; }
    .page-break    { page-break-before: always; }

    /* リンクURL表示 */
    a[href]::after { content: " (" attr(href) ")"; font-size: 10pt; }
}
```

**完了基準**
- [ ] A4縦/横の両方を検証
- [ ] 主要ブラウザ（Chrome / Edge）の印刷プレビュー確認
- [ ] ページブレイク動作確認

**所要時間目安**: 4-6時間

---

### 🟠 Tier 3：配色・視覚拡張

### Phase D5 — 配色バランス改善（第2アクセント・カテゴリ分化）

**対象**: `styles-light.css` / `styles.css` / `weekly-schedule.css` / `order-book.css`

#### D5.1 第2アクセント導入
```css
--accent-2:        #E07856;  /* テラコッタ・重要トグル用 */
--accent-2-light:  #EA9980;
--accent-2-dim:    rgba(224, 120, 86, 0.12);
```
用途：「重要だが破壊的ではない」強調。`--error` とは色相30°以上分離。

#### D5.2 カテゴリ色4色相分化
```css
--cat-bg-facility: rgba(68, 166, 181, 0.14);   --cat-text-facility: #1c4d54;  /* teal */
--cat-bg-event:    rgba(122, 140, 196, 0.14);  --cat-text-event:    #2d3e7a;  /* blue-violet */
--cat-bg-traffic:  rgba(180, 135, 100, 0.14);  --cat-text-traffic:  #5a3f25;  /* warm brown */
--cat-bg-highway:  rgba(98, 158, 120, 0.14);   --cat-text-highway:  #1f4e31;  /* sage green */
```

#### D5.3 データ可視化パレット
```css
/* カテゴリカル（色覚多様性対応）*/
--chart-1: #44A6B5;  --chart-2: #E07856;  --chart-3: #7A8CC4;
--chart-4: #629E78;  --chart-5: #B48764;  --chart-6: #B8607A;

/* 連続値（ヒートマップ用）*/
--chart-seq-0: #E9F1F6;  --chart-seq-1: #B2D5E2;  --chart-seq-2: #6B9AA8;
--chart-seq-3: #2A6B7A;  --chart-seq-4: #004554;

/* 差分（±表示用）*/
--chart-diverge-neg: #DB577B;  --chart-diverge-neutral: #D3D0C8;  --chart-diverge-pos: #38A169;
```

**完了基準**
- [ ] 第2アクセント・カテゴリ・データ可視化トークン追加
- [ ] UIコンポーネント集に「Secondary Accent」「Category Colors」「Chart Palette」セクション追加

**所要時間目安**: 4-6時間

---

### Phase D6 — コントラスト改善・2テーマ整合

**対象**: `styles-light.css` / `styles.css`

#### D6.1 WCAG AA 準拠修正
```css
--text-tertiary: #5A8896;  /* 約4.6:1（旧 #6B9AA8 → 3.1:1 AA未達）*/
--text-disabled: #8BAEB9;  /* 無効化は 3:1 で許容 */
```

#### D6.2 2テーマのアクセント統一
```css
/* HSL空間で色相・彩度を揃え、明度のみ反転 */
/* ライト: hsl(187, 46%, 50%) = #44A6B5（維持）*/
/* ダーク: hsl(187, 46%, 55%) = #55B5C4 */
```

#### D6.3 テーマ命名方針の決定
- A. 「Plaster Dark」等のSaaS系中立名に変更（現状配色維持）
- B. 絵画由来配色に本格リブランド（別計画で検討）

**完了基準**
- [ ] WCAG AA 監査（axe DevTools等）でエラーゼロ
- [ ] ダークテーマ accent 明度統一
- [ ] テーマ命名方針決定

**所要時間目安**: 3-4時間

---

### 🟠 Tier 4：UX品質向上

### Phase D7 — フォーム・バリデーション・パターン

**対象**: `styles-light.css` + UIコンポーネント集ガイド

#### D7.1 検証タイミング規約
- **onBlur**: 必須入力、フォーマット検証
- **onChange**: リアルタイムフィードバック（文字数カウンタ等）
- **onSubmit**: 複合検証、サーバー検証

#### D7.2 エラー表示位置
- **インライン下**: 単一フィールドのエラー（既定）
- **サマリー**: フォーム先頭、複数エラー集約時
- **ツールチップ**: テーブル内編集等のスペース制約時

#### D7.3 マイクロコピー規約
| 種類 | テンプレート | 例 |
|---|---|---|
| 必須 | 「{項目名}を入力してください」 | 「氏名を入力してください」 |
| フォーマット | 「{項目名}は{形式}で入力してください」 | 「電話番号はハイフンなしで入力してください」 |
| 範囲 | 「{項目名}は{下限}〜{上限}で入力してください」 | 「年齢は0〜120で入力してください」 |
| サーバー | 「この{項目名}は既に使用されています」 | — |

#### D7.4 成功フィードバック
- `aria-live="polite"` 領域でスクリーンリーダー通知
- 視覚的には success カラーのインライン表示

**完了基準**
- [ ] 検証タイミング規約ドキュメント化
- [ ] エラーメッセージ・テンプレート一覧化
- [ ] UIコンポーネント集にフォーム検証デモ追加

**所要時間目安**: 6-8時間

---

### Phase D8 — キーボード・ショートカット体系

業務効率を上げる決め手。一覧化して UIコンポーネント集に掲載する。

#### D8.1 グローバル
| キー | アクション |
|---|---|
| `Ctrl+K` | コマンドパレット・検索 |
| `?` | ショートカット一覧表示 |
| `Esc` | モーダル・ポップオーバー閉じる |
| `Ctrl+S` | 保存 |
| `Ctrl+Enter` | フォーム送信 |

#### D8.2 テーブル
| キー | アクション |
|---|---|
| `↑↓←→` | セル移動 |
| `F2` | セル編集開始 |
| `Enter` | 編集確定・次行 |
| `Tab` | 次セル |
| `Space` | 行選択トグル |
| `Ctrl+A` | 全行選択 |

#### D8.3 モーダル
| キー | アクション |
|---|---|
| `Tab` / `Shift+Tab` | フォーカス巡回（トラップ） |
| `Esc` | キャンセル |
| `Ctrl+Enter` | 確定 |

**完了基準**
- [ ] ショートカット一覧をUIコンポーネント集に掲載
- [ ] `?` でショートカット一覧モーダル表示実装
- [ ] フォーカストラップ動作確認

**所要時間目安**: 6-8時間

---

### Phase D9 — アクセシビリティ監査チェックリスト

#### D9.1 ユーティリティ定義
```css
.sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
}
.skip-link { position: absolute; top: -40px; }
.skip-link:focus { top: 0; }
```

#### D9.2 監査チェックリスト（10項目）
1. カラーコントラスト WCAG AA（4.5:1 / 大文字3:1）
2. 色以外での情報伝達（エラーはアイコン+色+文言）
3. フォーカス可視（`--focus-ring` 全要素適用）
4. フォーカストラップ（モーダル）
5. `aria-label` / `aria-labelledby` 付与
6. `aria-live` 領域（トースト・フォーム検証）
7. セマンティックHTML（`<button>` `<nav>` `<main>`）
8. キーボード単独で全機能操作可能
9. スクリーンリーダー読み上げ確認（NVDA / VoiceOver）
10. `prefers-reduced-motion` 対応（Phase D1で実施済）

**完了基準**
- [ ] `.sr-only` / スキップリンクユーティリティ追加
- [ ] 10項目監査チェックリスト・ドキュメント化
- [ ] axe DevTools監査でエラーゼロ

**所要時間目安**: 4-6時間

---

### Phase D10 — マイクロコピー・ガイド（Voice & Tone）

文言統一によるブランド一貫性の向上。

#### D10.1 敬語レベル統一方針
- **既定**: 丁寧語（「〜します」「〜してください」）
- **エラー**: 状態描写 +（必要に応じ）対処（「〜できませんでした。再度お試しください」）
- **確認**: 疑問形（「〜しますか？」）

#### D10.2 動詞使い分け
| 動詞 | 用途 | 対義 |
|---|---|---|
| 保存 | 既存データの更新 | 破棄 |
| 登録 | 新規データの作成 | 取消 |
| 送信 | サーバーへ反映 | キャンセル |
| 更新 | データ再取得 | — |
| 削除 | データ消去 | 復元 |

#### D10.3 エラーメッセージ定型
- **原因 → 対処** の順
- 否定形より肯定形（「空欄にできません」→「値を入力してください」）
- 主語は省略可、目的語は明示

#### D10.4 空状態のトーン
- **業務系**（既定）: 「データがありません」
- **初回体験**: 「まだデータが登録されていません。[登録する]から開始できます」

**完了基準**
- [ ] 敬語・動詞・エラー・空状態のガイド・ドキュメント化
- [ ] 既存モックアップ文言の整合性チェックリスト作成

**所要時間目安**: 6-8時間

---

### 🟡 Tier 5：運用基盤

### Phase D11 — コンポーネント・バージョニング / 変更ログ

UIコンポーネント集の長期保守性を担保する。

#### D11.1 `CHANGELOG.md` を `docs/ui-components/` に新設
```markdown
# Changelog

## [1.2.0] - 2026-04-18
### Added
- 第2アクセントカラー（#E07856）
- データ可視化パレット
### Changed
- text-tertiary を #6B9AA8 → #5A8896 に変更（AA準拠）
### Deprecated
- --shadow-sm/md/lg（--elevation-* を推奨）
### Migration
- `box-shadow: var(--shadow-md)` → `box-shadow: var(--elevation-3)`
```

#### D11.2 semver方針
- **MAJOR**: 破壊的変更（クラス名変更、トークン削除）
- **MINOR**: 純追加（新トークン、新コンポーネント）
- **PATCH**: バグ修正、マイクロ調整

**完了基準**
- [ ] `docs/ui-components/CHANGELOG.md` 新設
- [ ] 過去のPhase U1-U6, D1-D10 を遡及記載
- [ ] 新規変更時のフロー文書化

**所要時間目安**: 2-3時間

---

### Phase D12 — W3C Design Tokens JSON化

Figma連携や他プラットフォーム展開の布石。

**対象**: `docs/ui-components/tokens.json`（新設）

```json
{
  "color": {
    "accent": { "value": "#44A6B5", "type": "color" },
    "accent-2": { "value": "#E07856", "type": "color" }
  },
  "spacing": {
    "md": { "value": "12px", "type": "dimension" }
  },
  "typography": {
    "base": { "value": "14px", "type": "dimension" }
  }
}
```

**完了基準**
- [ ] 全トークンをJSON化
- [ ] CSSとの同期方針文書化（手動 or スクリプト生成）

**所要時間目安**: 4時間

---

### 🟢 Tier 6：反映作業

### Phase D13 — UIコンポーネント集への反映

Phase D1-D12 で整備した全トークン・規約を UIコンポーネント集に反映する。

**対象**: `docs/ui-components/index-light.html` / `styles-light.css` / `index-dark.html` / `styles.css`

#### D13.1 CSS 置換作業
- すべての raw `font-size: Xpx` を `var(--fs-*)` に置換
- すべての raw `padding: Xpx Ypx` を `var(--space-*)` の組み合わせに置換
- すべての raw `line-height: X` を `var(--lh-*)` に置換
- すべての raw `box-shadow` を `var(--elevation-*)` に置換
- すべての raw `transition-duration` を `var(--duration-*)` に置換

#### D13.2 ギャラリー更新
- Typography（7段階）
- Spacing（7段階）
- Motion（duration × easing デモ）
- Elevation（6段階）
- Breakpoint（参照のみ）
- Icon Size（6段階）
- Color（第2アクセント・カテゴリ・Chart）
- Table（12規約）
- Density（3モード切替）
- Print（プレビューリンク）
- Form Validation
- Keyboard Shortcuts
- A11y

**完了基準**
- [ ] `styles-light.css` `styles.css` の raw値ゼロ（grep で検証）
- [ ] 両テーマで表示崩れなし
- [ ] ブラウザ目視確認（Chrome / Edge / Firefox）

**所要時間目安**: 8-12時間

---

### Phase D14 — モックアップへの段階反映（1画面ずつ）

各画面を個別 Phase として扱い、**画面毎に承認ポイントを挟む**。

#### Phase D14-A — weekly-schedule（週間予定表）
- **対象**: `docs/mockup/weekly-schedule.css` / `weekly-schedule.js`
- **作業量目安**: 中〜大
- **リスク**: セル表示密度が高く、フォント底上げで折返し発生懸念

#### Phase D14-B — order-book（受注簿）
- **対象**: `docs/mockup/order-book.css` / `order-book.js`
- **作業量目安**: 大
- **リスク**: テーブル列幅調整の連動発生

#### Phase D14-C — quick-access（Quick Access）
- **対象**: `docs/mockup/quick-access.css` / `quick-access.js`
- **作業量目安**: 小〜中

#### Phase D14-D — screen-layout（スクリーンレイアウト）
- **対象**: `docs/mockup/screen-layout.css` / `co-navbar.css` / `co-shared-badges.css`
- **作業量目安**: 中

**各 D14-X 共通の完了基準**
- [ ] raw `font-size` `padding` `line-height` `box-shadow` `transition-duration` の撲滅
- [ ] 9px/10px フォントの 11px 以上への底上げ
- [ ] カテゴリ色の4色相適用（該当画面のみ）
- [ ] テーブル規約 `.tbl-*` への置換
- [ ] ブラウザ目視・過去画面との差分レビュー

---

## 5. フェーズ進捗サマリー

| Tier | Phase | 内容 | 所要時間 | ステータス |
|---|---|---|---|---|
| 🔴基盤 | D1 | 基盤トークン・バンドル（Typo/Motion/Elevation/BP/Icon-size） | 4-6h | 未着手 |
| 🔴業務 | D2 | テーブル・デザインシステム | 8-12h | 未着手 |
| 🔴業務 | D3 | 密度モード | 6-8h | 未着手 |
| 🔴業務 | D4 | 印刷スタイル | 4-6h | 未着手 |
| 🟠品質 | D5 | 配色バランス改善（第2アクセント・カテゴリ・Chart） | 4-6h | 未着手 |
| 🟠品質 | D6 | コントラスト改善・2テーマ整合 | 3-4h | 未着手 |
| 🟠品質 | D7 | フォーム・バリデーション・パターン | 6-8h | 未着手 |
| 🟠品質 | D8 | キーボード・ショートカット体系 | 6-8h | 未着手 |
| 🟠品質 | D9 | アクセシビリティ監査チェックリスト | 4-6h | 未着手 |
| 🟠品質 | D10 | マイクロコピー・ガイド | 6-8h | 未着手 |
| 🟡運用 | D11 | コンポーネント・バージョニング | 2-3h | 未着手 |
| 🟡運用 | D12 | W3C Design Tokens JSON化 | 4h | 未着手 |
| 🟢反映 | D13 | UIコンポーネント集への反映 | 8-12h | 未着手 |
| 🟢反映 | D14-A | weekly-schedule 反映 | 中〜大 | 未着手 |
| 🟢反映 | D14-B | order-book 反映 | 大 | 未着手 |
| 🟢反映 | D14-C | quick-access 反映 | 小〜中 | 未着手 |
| 🟢反映 | D14-D | screen-layout 反映 | 中 | 未着手 |

**総所要時間目安**: 約65-95時間（Phase D14除く）

---

## 6. 次のアクション

### 直近の推奨着手
**Phase D1（基盤トークン・バンドル）** から開始

理由:
- 後続全 Phase の前提（先に定義しないとD2以降で作業できない）
- 既存CSS/HTMLへの影響がなく純追加でリスク最小
- 所要時間 4-6時間で完了

### ユーザー承認ポイント
各 Phase 完了後に**明示的な「OK」または修正指示**が必須。Phase Gate Rules に準拠。

### スキップ判断可能な Phase
予算・期間に制約がある場合、以下はスキップ or 後回し可能：
- Phase D10（マイクロコピー）: 開発者レビューで代替可
- Phase D11（バージョニング）: 運用開始後に整備可
- Phase D12（JSON化）: Figma連携する段階で整備可

ただし Phase D1-D9 は **本番運用前に整備推奨**。

---

## 7. リスクと代替案

| リスク | 影響 | 代替案 |
|---|---|---|
| Phase D1 のトークン数が多すぎる | 中 | 必要時はD1.1-D1.7で分割、承認を細かく挟む |
| テーブル規約（D2）と既存実装の衝突 | 中 | 新クラス `.tbl-*` を追加、既存クラスは段階廃止 |
| 密度モード（D3）導入で UI が壊れる | 中 | `data-density="comfortable"` を既定固定、切替は Phase D13 以降 |
| 印刷スタイル（D4）のブラウザ差異 | 中 | Chrome を優先検証、Firefox/Edge は二次 |
| カテゴリ色4色相化で「カラフルすぎる」 | 低 | 彩度14%の淡色前提、レビューで調整 |
| Luca Davincci リネーム（D6）の決定先送り | 低 | Phase D6内で命名方針のみ決定 |
| raw値置換の見落とし（D13/D14） | 中 | `grep -E "font-size:\s*[0-9]+px\|padding:\s*[0-9]+px"` で残存検出 |
| キーボードショートカット（D8）の既存実装との衝突 | 中 | ブラウザ既定（Ctrl+S等）は preventDefault 必要、段階的に有効化 |

---

## 8. 関連ドキュメント

- 先行計画: [ui-components-improvement-plan.md](./ui-components-improvement-plan.md)（基礎トークン整備）
- 要件定義: [01_要件定義.md](../01_要件定義.md) §5.2 UIデザインシステム
- 既存UIコンポーネント集: [ui-components/index-light.html](../ui-components/index-light.html)
- アイコン運用ルール: [CLAUDE.md](../../CLAUDE.md)

---

## 9. 改修後の期待効果

| 観点 | 期待される変化 |
|---|---|
| 可読性 | 9-10px撲滅 + 和文フォント追加で長時間利用疲労軽減 |
| 識別性 | カテゴリ色分化で一覧時の情報判別速度向上 |
| 統一感 | raw値撲滅でCSS変更の影響範囲予測可能 |
| ブランド性 | 第2アクセント導入で「記憶に残るSaaS」に昇格 |
| 業務効率 | キーボードショートカット + 密度切替で熟練ユーザーの生産性向上 |
| 帳票対応 | 印刷スタイル整備でExcel移行ユーザーの違和感解消 |
| 保守性 | バージョニング + CHANGELOG で変更履歴追跡可能 |
| アクセシビリティ | WCAG AA 準拠 + モーション対応で法的リスク低減 |
| 拡張性 | Design Tokens JSON化で将来のFigma連携・他プラットフォーム展開可能 |
