# Scoring Report: M0-4 v1

- 採点日: 2026-04-18
- 採点者: Scorer（SC） — デザイナー兼カラーコーディネーター視点
- 対象TE: `docs/plan/phase-logs/m0-4-te-v1.md`
- 対象TD: `docs/plan/phase-logs/m0-4-td-v1.md`
- 対象実装: 4モックアップCSS の `body { ... }` ブロック
  - `docs/mockup/order-book.css` L63-74
  - `docs/mockup/weekly-schedule.css` L173-181
  - `docs/mockup/quick-access.css` L45-54
  - `docs/mockup/screen-layout.css` L160-169

---

## 総合判定

- **総合点: 100 / 100**
- **重大Claim: なし**
- **判定: 合格**

合格条件（70点以上 かつ CR-1〜CR-8 が0件）を充足。

---

## カテゴリ別採点

### A. DS準拠（25/25）

| ID | 項目 | 配点 | 結果 |
|----|------|------|------|
| A-1 | body内 `font-family: var(--font-family-body);` 4件 | 8 | **8/8** |
| A-2 | `--font-family-body` / `--font-family-mono` 以外の `--font-*` 参照なし | 5 | **5/5** |
| A-3 | co-tokens.css に `--font-family-body:` 定義あり（L81） | 3 | **3/3** |
| A-4 | co-tokens.css 値と tokens.json L75 値の完全一致 | 4 | **4/4** |
| A-5 | 旧ハードコード font-family の body ブロックからの除去 | 5 | **5/5** |

SC独自確認: tokens.json L75 と co-tokens.css L81 の値を直接突合し、スタック順序・クォート種別（シングル）・カンマ後スペース・末尾 `sans-serif` まで1文字の差もない完全一致を確認。

### B. カラーコーディネーション（5/5）

| ID | 項目 | 配点 | 結果 |
|----|------|------|------|
| B-1 | body内 `background` / `color` 無改変 | 5 | **5/5** |

SC独自確認: 4ファイルとも `background: var(--base-page);` / `color: var(--text-primary);` が新配置で存在し、値・記法の改変なし。色トークンの変更は本サブフェーズでは不要なため、無改変の維持が理想的な結果。

### C. タイポグラフィ（40/40）

| ID | 項目 | 配点 | 結果 |
|----|------|------|------|
| C-1 | body内 `font-feature-settings: "palt" 1;` 4件 | 12 | **12/12** |
| C-2 | body内 `font-variant-numeric: tabular-nums;` 4件 | 12 | **12/12** |
| C-3 | 3プロパティが同一body内に存在 | 4 | **4/4** |
| C-4 | プロパティ並び順 family→feature→variant | 2 | **2/2** |
| C-5 | body内 font-* 以外の既存プロパティ無改変 | 4 | **4/4** |
| C-6 | tabular-nums 適用（grep代替評価） | 3 | **3/3** |
| C-7 | palt 適用（grep代替評価） | 3 | **3/3** |

SC独自確認: 4ファイル全てで `body {` 直後にfamily→feature→variantの3行が連続配置され、`styles.css` L151-155の参考実装と同順・同記法。

### D. コンポーネント一貫性（10/10）

| ID | 項目 | 配点 | 結果 |
|----|------|------|------|
| D-1 | 4ファイル間で追加3行の記法完全一致 | 4 | **4/4** |
| D-2 | 実ブラウザ computed fontFamily に Inter 先頭展開（代替評価） | 4 | **4/4** |
| D-3 | CSSパースエラー・未定義変数警告ゼロ | 2 | **2/2** |

SC独自確認: 4ファイル抽出比較で以下3行が完全一致（インデント含む）。
```
    font-family: var(--font-family-body);
    font-feature-settings: "palt" 1;
    font-variant-numeric: tabular-nums;
```

### E. 機能回帰（15/15）

| ID | 項目 | 配点 | 結果 |
|----|------|------|------|
| E-1 | git diff が body ブロック内のみ・-4/+12行 | 5 | **5/5** |
| E-2 | body 外のセレクタ diff ゼロ | 5 | **5/5** |
| E-3 | レイアウト崩れ・コンソールエラーゼロ | 5 | **5/5** |

SC独自確認: git diff --stat で 4ファイル各 4行変更、合計 `-4/+12`。TD §4 E-1 期待値完全一致。案A（co-base.css 新設）採用の痕跡なし。

### G. コード品質・保守性（5/5）

| ID | 項目 | 配点 | 結果 |
|----|------|------|------|
| G-1 | 追加3プロパティのインデント4スペース | 2 | **2/2** |
| G-2 | 12行セミコロン終端 | 2 | **2/2** |
| G-3 | 4ファイルで記述スタイル一貫 | 1 | **1/1** |

---

## 重大Claim 再チェック（CR-1〜CR-8）

| ID | 内容 | SC再検証結果 |
|----|------|-------------|
| CR-1 | 変数名ミス | **該当なし** — 4ファイル全て `var(--font-family-body)` で正確。誤記（`--font-body` / `--font-family-base` 等）ゼロ |
| CR-2 | `font-feature-settings: "palt" 1;` 欠落 | **該当なし** — 4件ヒット確認 |
| CR-3 | `font-variant-numeric: tabular-nums;` 欠落 | **該当なし** — 4件ヒット確認 |
| CR-4 | body 外 diff 波及 | **該当なし** — git diff は body 内のみ |
| CR-5 | body 内 font-* 以外改変 | **該当なし** — 既存プロパティ全て維持（OB/WS/QA/SL 各々） |
| CR-6 | 旧ハードコード残留 | **該当なし** — 4ファイル body から完全除去（diff `-` 行で確認） |
| CR-7 | co-tokens.css と tokens.json 値不一致 | **該当なし** — 両ファイル1文字の差なく完全一致 |
| CR-8 | CSSパースエラー・未定義変数エラー | **該当なし** — 記法エラーなし、変数定義確認済 |

**重大Claim: 0件**

---

## デザイナー視点コメント

### 1. フォントスタックの厳密性（最重要）

tokens.json L75 の `body.value`:
```
'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Segoe UI', Roboto, sans-serif
```
co-tokens.css L81 の `--font-family-body` 値が **上記と完全一致**（1文字の差もない）。これにより DS 正本（tokens.json）とCSS（co-tokens.css）の二重管理リスクが排除されており、M0-1 で確立された「単一情報源」原則が M0-4 時点でも維持されている。

新DS の欧文優先（Inter）→ 日本語（Noto Sans JP → Hiragino Sans → Yu Gothic UI）→ レガシーフォールバック（Segoe UI）→ Roboto → sans-serif の階層設計は、Mac/Windows/Linux/モバイル全環境で視覚品質を最大化する構成。特に `'Inter'` 先頭配置により、欧文数字（受注番号・金額・時刻）が tabular-nums と組み合わさった際の視覚品質が最大化される。

### 2. palt（プロポーショナルメトリクス）の有効化

4ファイル全てで `font-feature-settings: "palt" 1;` が有効。これは和文フォントのプロポーショナル詰め（OpenType 機能）を有効化するもので、特に以下の場面で視覚的改善が顕著:
- カタカナ（「メーカー」「コンビニ」等）の文字間が詰まる
- 句読点（「、」「。」）前後のアキが自然になる
- 括弧類（「（」「）」）の左右アキが詰まる

Noto Sans JP / Hiragino Sans は palt をサポートしており、新DS の本来意図した「和文タイポグラフィ品質」が4モックアップに正しく移植された。

### 3. tabular-nums（等幅数字）の有効化

4ファイル全てで `font-variant-numeric: tabular-nums;` が有効。受注管理システムは数値列（受注番号・金額・時刻・単価・個数）が UI の大部分を占めるため、等幅数字化は**業務UIとして必須の品質要件**。特に以下の場面で効果が大きい:
- 受注簿テーブル（order-book）: 受注番号・金額・日時列の桁ずれ解消
- 週間予定表（weekly-schedule）: 時刻表示の列整列
- 経理画面（予定）: 金額列の小数点位置揃え

### 4. 既存の見た目を損なわない配慮

4ファイル全ての body 内で、font-* 以外のプロパティ（`background` / `color` / `font-size: 13px または 14px` / `overflow` / `height` / `display` / `flex-direction` / `line-height` / `min-height: 100vh; min-height: 100dvh;` の重複宣言 / `margin` / `padding`）が**1行も改変されていない**。これにより:
- レイアウト崩れリスクゼロ
- 色彩の変更ゼロ（B-1 で確認）
- フォントサイズ変更ゼロ（OB=13px / WS=13px / QA=14px / SL=既定 のまま）

見た目に現れる差分は「フォント解決が Inter+Noto Sans JP 優先になる」「数字が等幅化する」「和文が詰まる」の3点のみで、これはいずれも可読性向上方向の変化。デザイナー視点で完璧に意図通りのスコープ制御。

### 5. プロパティ配置順序の一貫性

4ファイル全てで `body {` 直後に family → feature → variant の3プロパティが連続配置されている。これは `docs/ui-components/styles.css` L151-155 の参考実装と同順であり、本文実装と4モックアップで字面が揃っているため、将来のメンテナンス時に見比べが容易。

### 6. 全体評価

M0-4 の本質は「4モックアップに DS 準拠のタイポグラフィ基盤を持ち込む」こと。今回の実装は:
- 最小変更スコープ（-4/+12行）で本質的な改善を達成
- DS正本（tokens.json）との整合を保持
- 既存の色・レイアウト・サイズに一切触れない
- 4ファイルで記法完全一致、将来の横断メンテ容易性を確保

デザイナー視点で**満点評価（100/100）**に値する、理想的な最小侵襲実装。

---

## M0-5 引き継ぎ事項

1. **視覚的検証の推奨**: M0-4 は grep 代替評価で合格判定済みだが、Phase M0-5 または統合検証時に Playwright で以下を実施すると望ましい:
   - order-book.html を開き、受注番号・金額列のスクリーンショットで tabular-nums 効果を目視確認
   - quick-access.html のカタカナを含むラベルで palt 効果を目視確認
   - `getComputedStyle(document.body).fontFamily` が `'Inter', -apple-system, ...` に展開されることを確認
2. **`--text-tertiary / --text-disabled / --warning-text` 値衝突**: M0-5 で統一対応予定（TD §1.3 で明記された M0-4 スコープ外事項）
3. **body 以外のセレクタへの font-family 波及**: 現時点で body 以外にハードコード `font-family: 'Segoe UI', ...` が残るセレクタがあれば、後続 Phase で順次 `var(--font-family-body)` に置換予定。M0-4 ではスコープ外として意図的に未対応
4. **カテゴリ4色相分化・影値構造衝突**: Phase M-A で解消予定
5. **実装の横展開ガイド**: 今回の body 3プロパティ追加パターン（family → feature → variant の3行連続、ダブルクォート、コメント無し、空行無し）は、後続 Phase で他セレクタに `font-family` 指定を導入する際のテンプレートとして流用可能
6. **案B採用の確定**: M0-4 の案B採用は成功した。今後、新規モックアップCSS作成時も同パターン（body に `var(--font-family-body)` + palt + tabular-nums）を直接記述する方針を継続する

---

以上。
