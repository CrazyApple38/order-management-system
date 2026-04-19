# Scoring Report: M-B3 v1

> Role: Scorer（SC） / Target: Sub-Phase **M-B3**
> 対応TE: `m-b3-te-v1.md`
> 対応TD: `m-b3-td-v1.md`
> 実装対象: `docs/mockup/screen-layout.css` L4193-4198（祖先セレクタを実構造 `.md-ob-edit-form` に修正）
> Baseline: `7c49b8e`（M-B1完了コミット）
> 採点日: 2026-04-20

---

## 総合判定

- **総合点: 100 / 100**
- **重大Claim: なし**
- **判定: 合格**

### 合格条件確認

| 条件 | 実測 | 判定 |
|------|------|------|
| 70点以上 | 100点 | ✅ |
| 重大Claim = 0件 | 0件 | ✅ |

---

## カテゴリ別採点

### A. 視覚回帰（25 / 25）

| # | 項目 | TE | 配点寄与 |
|---|------|----|---------|
| A-1 | OB `#editCount` クラス付与 | ✅ | 3.57 |
| A-2 | SL `#smCount` クラス付与 | ✅ | 3.57 |
| A-3 | SL `#slAddCount` クラス付与 | ✅ | 3.57 |
| A-4 | OB/SL 共通 width/text-align | ✅ | 3.57 |
| A-5 | OB `#editCount` 18px/700 発火 | ✅ | 3.57 |
| A-6 | **SL `#smCount` 18px/700 発火（W1修正後）** | ✅ | 3.58 |
| A-7 | **SL `#slAddCount` 18px/700 発火（W1修正後）** | ✅ | 3.57 |

Pass 7/7 → **25 / 25**

### B. ブラウザ互換（10 / 10）

| # | 項目 | TE | 備考 |
|---|------|----|------|
| B-1 | Chrome spinner 非表示 | ✅ | Playwright/Chromium 実測 |
| B-2 | Edge spinner 非表示 | 🔸N/A | 配点除外 |
| B-3 | Firefox `-moz-appearance: textfield` | 🔸N/A | 配点除外 |
| B-4 | tabular-nums 等幅 | ✅ | "111"/"999" 共に 31.86px |

Pass 2 / 発火2項目 → 10 × (2/2) = **10 / 10**
（N/A 2項目は実機未所持により配点対象外扱い）

### C. タイポグラフィ（20 / 20）

| # | 項目 | TE |
|---|------|----|
| C-1 | body 継承 tabular-nums | ✅ |
| C-2 | OB テーブル等幅 | ✅ |
| C-3 | SL モーダル桁揃い | ✅ |
| C-4 | 孫要素 monospace 棚卸（意図的用途のみ残存） | ⚠️→✅ |

Pass 4/4 → **20 / 20**

### D. 機能動作（20 / 20）

| # | 項目 | TE |
|---|------|----|
| D-1 | OB min/max 属性 | ✅ |
| D-2 | SL min/max 属性 | ✅ |
| D-3 | 矢印キー increment | ✅ |
| D-4 | 負数/非数値挙動 | ✅ |
| D-5 | focus スタイル | ✅ |

Pass 5/5 → **20 / 20**

### E. アクセシビリティ（20 / 20）

| # | 項目 | TE |
|---|------|----|
| E-1 | Tab フォーカス移動 | ✅ |
| E-2 | label 結合 | ✅ |
| E-3 | type="number" セマンティクス | ✅ |
| E-4 | focus-visible ring | ✅ |
| E-5 | 18px/700 WCAG AA コントラスト | ✅ |

Pass 5/5 → **20 / 20**

### G. ガバナンス（5 / 5）

| # | 項目 | TE |
|---|------|----|
| G-1 | L4193-4198 M-B3 修正コメント | ✅ |
| G-2 | co-forms.css SSOT 維持 | ✅ |
| G-3 | ds-migration-plan.md 完了マーク | 🔸N/A（SC 完了後運用） |

Pass 2 / 発火2項目 → 5 × (2/2) = **5 / 5**

### 合計

| カテゴリ | 得点 |
|---------|------|
| A 視覚回帰 | 25 / 25 |
| B ブラウザ互換 | 10 / 10 |
| C タイポグラフィ | 20 / 20 |
| D 機能動作 | 20 / 20 |
| E アクセシビリティ | 20 / 20 |
| G ガバナンス | 5 / 5 |
| **総合** | **100 / 100** |

---

## M-B1 Warning W1 の解消確認

### W1 の発生原因（再掲）

M-B1 完了時点、`screen-layout.css` L4195-4199 には以下のセレクタが定義されていた:

```css
.md-sp-edit-modal .md-fi-input-number,
.md-nav-modal .md-fi-input-number { font-size: 18px; font-weight: 700; }
```

しかし `screen-layout.html` 内に `.md-sp-edit-modal` / `.md-nav-modal` は **0件** で、`#smCount` / `#slAddCount` には 18px/700 が一切発火せず、OB の `#editCount` との視覚的不整合（SLだけ貧弱）が発生していた。

### M-B3 実装

```css
/* M-B1: .md-ob-form-row* は新DS .md-fi-* 体系に移行済 */
/* SL 固有: 人数入力を18px/700に強調（M-B3: 実祖先 .md-ob-edit-form に合わせて修正） */
.md-ob-edit-form .md-fi-input-number {
    font-size: 18px;
    font-weight: 700;
}
```

### 実測（Playwright）

| 要素 | fontSize | fontWeight | width | textAlign | 判定 |
|------|---------|-----------|-------|-----------|------|
| OB `#editCount` | 18px | 700 | 80px | center | ✅ 不変 |
| SL `#smCount` | **18px** | **700** | 80px | center | ✅ **W1 解消** |
| SL `#slAddCount` | **18px** | **700** | 80px | center | ✅ **W1 解消** |

**結論: W1 は完全解消**。OB/SL の人数入力強調が統一された。祖先チェーン分析（TE 3.2）でも `md-ob-edit-form` が両要素の実祖先として正しく存在することが確認されている。

---

## デザイナー視点コメント

### 1. 視覚的バランスの統一（重要フィールド強調）

「人数」は受注管理ドメインの**業務判断上の主要KPI**（応援要否・稼働人日計算の入力起点）。W1 解消前は OB 18px/700 / SL 13px/400 と、同じ意味論を持つフィールドで視覚重みが非対称だった。

M-B3 により `.md-fi-input-number` の 18px/700 強調が OB/SL 両モックアップで揃い、ユーザーがどちらの画面でも「人数欄は目立つ」という一貫した視覚言語を受け取れる。**モックアップ間の整合性ルール（CLAUDE.md Phase Gate Rules 3）に合致**。

### 2. tabular-nums による数字等幅表示

- 4 mockup すべての body に `font-variant-numeric: tabular-nums` が適用済（TE 3.4）。
- Inter 18px/700 において `"111"` / `"999"` が共に **31.86px**（差分 0px）で完全等幅。
- OB テーブルの件数・人数・金額セル、SL モーダルの人数入力の**桁揃いが視覚的に整然**とし、スプレッドシート的な可読性が確保された。

これは Excel 由来のドメイン（受注簿・業務管理計画書）において「数字列が縦に揃う」視覚体験を Web 側に忠実に移植する上で必須の選択であり、今回の Phase で DS 基盤に確定した意義は大きい。

### 3. 幅80px / center整列のファインチューニング

`width: 80px` は 2桁（0〜99）前提で設計されており、3桁入力時も tabular-nums のおかげで中央揃えが崩れない。`min=0 / max=99` の業務制約と整合しており、**視覚デザイン + HTML 制約 + 日本語業務実態**の3点セットで筋が通っている。

### 4. コントラスト / アクセシビリティ

18px/700 は WCAG AA の「Large Text」（18pt ≒ 24px 以上 または 14pt ≒ 18.66px 以上 + bold）基準をクリアする最小ラインで、`--text-primary` のコントラスト比（M0 検証済）と組み合わせて AA 達成。**老眼ユーザー・業務多忙時の素早い視認**にも配慮された選択。

### 5. 改善余地（任意・Phase M-C 以降）

- `.md-fi-input-number` のプレースホルダー色トークン化（今回スコープ外）
- focus 時の ring 太さが DS 統一トークンと合致しているかの棚卸（C-4 と同様の横断点検）

これらは Blocker ではなく、将来のブラッシュアップ候補。

---

## 重大Claim 再チェック

| # | 事象 | 判定 | 根拠 |
|---|------|------|------|
| C-1 | 数値入力が機能しなくなる | なし | D-1〜D-5 全Pass |
| C-2 | 他の数字表示が崩れる | なし | C-2 / 3.7 確認済 |
| C-3 | 意図しない要素に18px/700適用 | なし | `.md-fi-input-number` 付与対象 3要素のみ |
| C-4 | body の tabular-nums が効かない | なし | OB/SL で `"tabular-nums"` 取得 |
| C-5 | 他ブラウザで spinner 復活 | 未検出 | Chromium 非表示、Firefox CSS 静的確認のみ |
| C-6 | JSコンソールに新規エラー | なし | M-B3 由来エラーなし |
| C-7 | SSOT 破壊（`.md-fi-input-number` 再定義） | なし | `co-forms.css` L73-83 不変 |
| C-8 | 他ファイル波及 | なし | `screen-layout.css` +2/-3 ピンポイント |

**重大Claim: 0件** — 合格条件クリア。

---

## Phase M-C（OBテーブル）への引き継ぎ事項

### 1. キャッシュバスター `?v=8` → `?v=9+` 更新推奨（W-M-B3-1）

- **現状**: `screen-layout.html` / `order-book.html` / `quick-access.html` / `weekly-schedule.html` の `<link rel="stylesheet" href="...?v=8">` が M-A 以前から固定。
- **リスク**: Apache/ブラウザキャッシュで M-A 以前の古い CSS が配信され、`font-variant-numeric: tabular-nums` や M-B3 の 18px/700 が効かないユーザー環境が残る可能性。
- **M-B3 スコープ**: TD 非記載のため本Phaseでは非対応。Playwright で強制再読込による正規CSS発火は確認済。
- **推奨対応**: **M-C 冒頭または M-B4 コミット直前に `?v=9` 以上にインクリメント**。対象は全 mockup HTML の `<link>` タグ。
- **横断性**: M0 / M-A 時点からの潜在課題で、M-B3 固有ではない。DS マイグレーション全体の仕上げとして一括対応が合理的。

### 2. 数値入力の DS トークン化継続

- `.md-fi-input-number` の `width: 80px` / `text-align: center` は `co-forms.css` に Single Source として定義済。
- M-C の OB テーブル内に将来的に数値入力セルが追加される場合は、**同クラスを再利用**し、個別 px 指定を避けること。

### 3. `.md-ob-edit-form` スコープの周知

- OB セル編集モーダル / SL 現場詳細モーダル / SL 予定追加モーダル の **3箇所共通の編集フォーム祖先**として `.md-ob-edit-form` が機能している（TE 3.2 祖先チェーン参照）。
- M-C で OB テーブルの編集系UIを追加する場合は、この祖先スコープを活用することで CSS重複を防げる。

### 4. tabular-nums の body 継承パターンの横展開

- 4 mockup 全てで確定したパターンを、今後追加される新モックアップ（D 経理、E 休日申請）にも引き継ぐこと。
- `body { font-variant-numeric: tabular-nums; }` を **新規mockup のベースCSS テンプレート標準項目**として文書化推奨。

### 5. ガバナンス

- M-B3 完了承認後、`docs/plan/ds-migration-plan.md` の M-B3 完了マーク更新（G-3 N/A のフォロー）。
- Phase M-C 着手前に本SCレポートと TE レポートをユーザーに提示し、Phase 進行の明示的宣言を得ること（CLAUDE.md Phase Gate Rules 1）。

---

## 承認可否

**合格（PASS）**。M-B3 はスコープ通り SL 人数入力の18px/700強調を完全発火させ、W1 を解消した。重大Claim 0件、Fail 0件、CSS差分は `screen-layout.css` の +2/-3 のみという最小侵襲で目的達成。

Phase M-C（OBテーブル DS 移行）への進行準備完了。キャッシュバスター更新を次Phase冒頭タスクとして引き継ぐ。

---

_作成: Scorer / Phase M-B3 SC v1 / 2026-04-20_
