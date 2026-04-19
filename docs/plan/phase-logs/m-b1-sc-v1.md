# Scoring Report: M-B1 v1（最終）

担当: Score Compiler (SC)
採点日: 2026-04-20
採点対象:
- TE v2 結果: `docs/plan/phase-logs/m-b1-te-v2.md`（最終）
- TE v1 結果（初回Fail、参考）: `docs/plan/phase-logs/m-b1-te-v1.md`
- 実装:
  - `docs/mockup/co-forms.css`（新設、256行）
  - `docs/mockup/order-book.css`（.md-ob-form-row 系 CSS 定義削除）
  - `docs/mockup/screen-layout.css`（同上）
  - 4モックアップHTML（co-forms.css link 追加、OB/SL は md-fi-* クラス置換、SL L991 不正HTML修正）
- 配点表: `docs/plan/phase-logs/m-b1-td-v1.md` §1「配点（案B）」（A=30 / B=10 / D=25 / E=25 / F=5 / G=5、合計100、合格条件: 70点以上 AND 重大Claim=0）

---

## 総合判定

- **総合点: 96 / 100**
- **重大Claim: なし**（C1〜C10 すべて解消）
- **判定: 合格**（70点以上 AND 重大Claim=0 を満たす）

---

## カテゴリ別採点

### A. DS準拠（トークン・命名） — **30 / 30**

- TD項目 1〜11 すべて Pass（実測 11/11）
- 不正HTML追加観点（#31）も Pass（`class` 属性重複 0 件、v1 の SL L991 問題は修正確認済）
- `.md-ob-form-row*` の CSS 定義・HTML クラスともに完全撤去。`.md-fi-*` クラスが OB 6件 / SL 15件・ラベル 12件・textarea 3件・number入力 3件に過不足なく付与
- `.md-ob-company-field` / `.md-ob-task-field` は `.md-fi-field` と正しく併記
- **減点: 0**

### B. カラー / Coastal Palette — **10 / 10**

- TD項目 12〜15 すべて Pass（実測 4/4）
- 実機 focus 時 `border-color: #44A6B5` / `box-shadow: rgba(68,166,181,0.12) 0 0 0 3px` を確認
- ラベル色 `#5A8896` (= `--text-tertiary`) 確認、WCAG AA 準拠（Phase D6.1 値）
- `co-forms.css` 内のハードコード色は L70 の `rgba(219,87,123,0.12)` = `--semantic-error` の 12% 透過 1件のみ（エラーリング用、Palette 内 `#DB577B` 由来で整合）
- **減点: 0**

### D. コンポーネント一貫性 — **25 / 25**

- TD項目 16〜18 すべて Pass（実測 3/3）
- co-forms.css と styles-light.css（行 2336-2583）の該当定義が**セレクタ・宣言・値・コメント構造まで完全一致**を SC 側で再確認（差分は末尾の `.md-fi-error-msg` / `.md-fi-help` / `.md-fi-demo-grid` をモックアップ不要として意図的に除外のみ。同期方針も co-forms.css 冒頭コメントに明記）
- UI コンポーネント集 `#unified-form` と OB 編集モーダル・SL モーダルの見た目が完全一致（padding 8px 12px / font-size 13px / border-radius 4px / label 11px uppercase / letter-spacing 0.5px）
- `.md-fi-row > .md-fi-field { flex: 1 }` 実機動作確認、担当者 2 カラム均等配置 OK
- `.md-ob-count-confidence-row > .md-fi-field { flex-shrink: 0 }` 実機確認
- 注: W1（SL 人数入力 18px/700 強調）はラベル・入力・テキストエリア・ピッカー・サジェストの「表現の一貫性」というより、OB 強調スタイルの「スコープ設定漏れ」であり、機能回帰（E）側で減点
- **減点: 0**

### E. 機能回帰 — **21 / 25**

- TD項目 19〜25（7項目）: Pass 5 / N/A 1（#23 タイムピッカー、TD §5 で M-B1 対象外と委譲） / Warning 0 / 機能的 OK だが SL のみ強調セレクタ不発 1（W1）
- 基本機能（値保持・サジェスト・textarea・2カラム・フォーカスリング）はすべて実機確認済
- **W1 減点: -4**
  - `screen-layout.css` L4195-4199 の `.md-sp-edit-modal .md-fi-input-number, .md-nav-modal .md-fi-input-number { font-size: 18px; font-weight: 700 }` が、SL HTML には該当祖先クラスが存在しないため発火せず
  - TD §2-5「残存（意図的）」で 18px/700 装飾の維持を要件化していたため、SL 側での不発は要件不達
  - OB 側（`.md-ob-edit-form .md-fi-input-number`）は正しく発火しており部分充足のみ
  - 視覚的一貫性の毀損は軽微（機能は全体として成立）のため -4 に留める
- **合計: 25 - 4 = 21**

### F. アクセシビリティ — **5 / 5**

- TD項目 26〜27 すべて Pass（実測 2/2）
- label-input 暗黙ネスト関連付け維持、number スピナー非表示（`-moz-appearance: textfield` + `::-webkit-*-spin-button`）実機確認
- フォーカスリング（outline: none + 3px accent-dim box-shadow）正常動作
- **減点: 0**

### G. 保守性 — **5 / 5**

- TD項目 28〜30 すべて Pass（実測 3/3）
- 旧クラス参照 0件（OB/SL CSS のコメント 4件と `docs/plan/*` のみ）
- 移行コメント（OB CSS L542/786/875, SL CSS L4193）残存
- WS/QA CSS への波及なし
- co-forms.css 冒頭に参照元 / 同期方針 / 依存を明記しており保守性高い
- **減点: 0**

### 採点集計

| 区分 | 配点 | 得点 | 減点理由 |
|------|------|------|---------|
| A. DS準拠 | 30 | 30 | — |
| B. カラー | 10 | 10 | — |
| D. コンポーネント一貫性 | 25 | 25 | — |
| E. 機能回帰 | 25 | 21 | W1（SL 人数 18px/700 不発） |
| F. アクセシビリティ | 5 | 5 | — |
| G. 保守性 | 5 | 5 | — |
| **合計** | **100** | **96** | |

---

## 修正経緯（v1 → v2）の総評

初回 TE v1 では以下の 2 件の重大 Claim と 1 件の不正HTML を検出し **Fail** 判定だった:

1. **C5 / C6（レイアウト崩壊・フォーカスリング欠落）の根本原因**: 新DS `.md-fi-*` の CSS 定義が `docs/ui-components/styles-light.css` にしか存在せず、モックアップ4画面から参照されていなかった。`.md-ob-form-row` 系の CSS を削除済みだったため、編集モーダルが**ブラウザ既定スタイルにまで退行**していた（Playwright で計算済みスタイル `border: 2px inset rgb(118,118,118)` を確認）。
2. **不正HTML**: `screen-layout.html` L991 で `<input class="md-fi-input" ... class="sm-map-title-input">` と `class` 属性を 2 度記述しており、後者が parse error として無視される状態だった。

IM の修正コミットで:
- `docs/mockup/co-forms.css` を **styles-light.css の該当セクション（行 2336-2583）から直接抽出・複製して新設**。デザイナー視点で重要な点として、**セレクタ・宣言・値・インデント・コメント区切りが原典と完全一致**しており、冒頭に「styles-light.css を唯一の正とし、本ファイルを手動で同期する」旨を明記。将来の DS 変更時の同期漏れリスクも抑制されている。
- 4 HTML すべてに `<link rel="stylesheet" href="mockup/co-forms.css">` を追加（`co-tokens → co-forms` の依存順序は 4 HTML で遵守）。
- SL L991 は `class="sm-map-title-input"` 単独に変更（`md-fi-input` は意図的に外す判断、地図タイトル入力は独自スタイル優先のため妥当）。

TE v2 で全 Pass（28/30 + 追加1 = 29 Pass、0 Fail、2 Warning、1 N/A）となり、重大 Claim 0 件を達成。**v1 → v2 の修正は根本原因に正しく対処した模範的リカバリ**と評価できる。

---

## 残 Warning の扱い

### W1: SL 人数入力強調（18px/700）の不発 → E 区分で -4 点

- `screen-layout.css` 側の補助 rule が `.md-sp-edit-modal` / `.md-nav-modal` 祖先にスコープされているが、SL HTML の `siteModal` / `slAddModalOverlay` にはこれらクラスが存在しないため発火しない
- OB 側は `.md-ob-edit-form` スコープで正しく動作しており、DS 上の数値入力強調表現は定義されていること自体は確認できる
- **対応: Phase M-B3（数値入力 + tabular-nums）で SL 側のセレクタを `#siteModal .md-fi-input-number, #slAddModalOverlay .md-fi-input-number`（または `.md-ob-edit-form` に合わせた共通祖先クラスの付与）に修正予定**
- 本 Phase M-B1 の仕上げとしての緊急修正は不要（機能影響は「入力できるが視覚的に他入力と同サイズになる」程度で実害軽微）

### W2: QA の `<link>` 順序の微差 → 実害なし・加点影響なし

- QA: `co-tokens → co-forms → co-navbar → co-shared-badges → quick-access`
- 他 3 HTML: `co-tokens → co-forms → co-shared-badges → co-navbar → …`
- 必須条件「co-tokens → co-forms」は 4 HTML で遵守、co-navbar / co-shared-badges は互いに独立セレクタで cascade 衝突なし
- **対応: 次回 HTML 編集時に他 3 HTML と順序を揃える（任意、必須ではない）**

---

## 重大 Claim C1〜C10 再チェック

| # | Claim | v1 判定 | v2 判定 | SC 再確認 |
|---|-------|---------|---------|-----------|
| C1 | 入力不能 | ⚠️ 潜在 | ✅ 解消 | 実機 input/textarea 値保持確認、問題なし |
| C2 | 保存機能破壊 | 🔸 未確認 | ✅ 解消（推定） | JS 差分 0、DOM id 維持、論理的に破壊なし |
| C3 | サジェスト破壊 | ✅ OK | ✅ OK | `.md-ob-company-field` / `.md-ob-task-field` の `position: relative` 維持確認 |
| C4 | タイムピッカー破壊 | ✅ OK | ✅ OK | `.md-ob-time-input` 未変更、TD §5 で委譲済 |
| C5 | レイアウト崩壊 | ❌ 該当 | ✅ **解消** | `.md-fi-row` の flex レイアウト実機動作確認、担当者2カラム OK |
| C6 | フォーカスリング欠落 | ❌ 該当 | ✅ **解消** | 3px accent-dim box-shadow + accent border 実機確認 |
| C7 | 他モックアップ波及 | ✅ OK | ✅ OK | WS/QA HTML 差分は link 追加のみ、`.md-fi-*` クラス付与 0 件 |
| C8 | screen-layout 置き去り | ✅ OK | ✅ OK | SL も同等の CSS 削除・HTML 置換が完了 |
| C9 | Coastal Palette 外色混入 | ✅ OK | ✅ OK | ハードコード色は semantic-error 由来 1 件のみ、Palette 内 |
| C10 | 絵文字・Unicode記号代用 | ✅ OK | ✅ OK | 記号代用なし、select 矢印は SVG data URI |

**→ v2 時点で 10/10 解消。重大 Claim 0 件。**

---

## デザイナー視点コメント

- **co-forms.css の同期方針が模範的**。冒頭に「styles-light.css を唯一の正」と明記しており、DS の単一情報源（SSoT）原則がファイルの存在理由まで含めて文書化されている。抽出範囲が行 2336-2583 と明確で、将来の DS 更新時に差分を取れる構造になっている点が秀逸。
- **ラベル・入力・テキストエリア・コンボ・セレクト・タイムピッカーの一貫性は全要素で Coastal Palette に完全収斂**。11px uppercase / 0.5px letter-spacing / `#5A8896` というラベル表現はやや地味だが、日本語メインの UI では入力欄との視覚的主従関係が明瞭になり、フォーム全体の落ち着きに寄与している。
- **focus 表現の 3px accent-dim リングは Moonstone の 12% 透過で、背景の薄ベージュ系と十分なコントラストを保ちつつ主張が強すぎない**。現場管理画面の長時間利用を想定した疲労感の低い配色設計として優秀。
- W1 の SL 人数強調が不発な点は、デザイナー視点でも「OB と SL で人数という同じ意味要素が異なるサイズで描画される」という**一貫性上の不揃い**となるため、M-B3 では必ず是正すべき。優先度は中（機能は成立、視覚のみ）。

---

## Phase M-B2（フィルタ checkbox）への引き継ぎ事項

1. **co-forms.css のスコープ境界**: M-B2 の `.md-ob-filter-*` 系は `.md-fi-*` とは別系列（TD §2-5 に明記）。co-forms.css を侵食させず、新規に `co-filters.css`（または `co-checkbox.css`）を別ファイルとして切り出す方針推奨。
2. **styles-light.css 参照方針の継承**: co-forms.css と同じく「styles-light.css を唯一の正とし、本ファイルを手動で同期する」冒頭コメントを踏襲すること。
3. **4 HTML への link 追加パターン**: 今回「co-tokens → co-forms の依存順序」を必須としたのと同様、M-B2 でも `co-tokens → co-forms → co-filters`（または co-checkbox）の並びを全 HTML で統一する。QA の link 順序ねじれ（W2）はこの機会に他 3 HTML と揃えることを推奨。
4. **W1（SL 人数強調不発）の対応タイミング**: M-B2 で `screen-layout.css` を編集する際に同時に修正すると効率的（別コミットでも可）。セレクタは `#siteModal .md-fi-input-number, #slAddModalOverlay .md-fi-input-number` または `.md-ob-edit-form` 相当の共通祖先クラスを SL モーダルにも付与する方針。
5. **チェックリスト観点の追加**: 今回発覚した「CSS 定義は削除したが代替を供給していない」パターン（v1 Fail の根因）は、CSS リファクタ系フェーズ共通の落とし穴。TD の重大 Claim に**「CSS 定義削除後、代替クラスの CSS 定義が実機ブラウザから到達可能であること」**を常設条項として追加することを推奨。
6. **class 属性重複の静的チェック**: SL L991 のような `class="X" ... class="Y"` パターンは目視で見落とされやすいため、TE チェックリストに `grep -E 'class="[^"]*" [^>]*class="'` の機械検査を常設項目化することを推奨（今回の追加項目 #31 を恒久化）。

---

合格・Phase M-B1 完了。次フェーズ（M-B2 フィルタ checkbox）に進行可。
