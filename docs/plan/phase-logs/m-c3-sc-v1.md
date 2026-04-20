# Phase M-C3 SC v1 — スコア採点（デザイナー視点）

> Role: Scorer（SC） / Target: Sub-Phase **M-C3**
> TD 参照: `docs/plan/phase-logs/m-c3-td-v1.md`
> TE 参照: `docs/plan/phase-logs/m-c3-te-v1.md`

---

## 1. 採点

| 観点 | 略号 | 配点 | 実点 | 所見 |
|------|------|------|------|------|
| 視覚回帰（Appearance） | A | 25 | **25** | Playwright 実測で sat/sun/sat-head/sun-head の背景色・night の color + sticky--2 font-weight:700 が完全維持。モーダル内 4 セレクタも変換後も健在 |
| ブラウザ互換（Browser） | B | 10 | **10** | `[data-dow=""]` / `[data-shift=""]` は CSS2.1 Selectors Level 3 の標準機能。Chromium 系で実機確認済、Firefox も仕様上同等 |
| 機能（Domain） | D | 25 | **25** | 既存 `data-day`（日付数値）との衝突回避が `data-dow` 命名で実現。`[data-ri="0"][data-day="1"]` が依然として1件返り、`obCnHighlightCells` 系ロジック無傷 |
| 置換完全性（Equivalence） | E | 30 | **30** | CSS/JS の旧クラスゼロ、属性セレクタ件数一致（CSS 4/6、JS 4/3+）、`classList.toggle` ゼロ、HTML 静的側は無変更（M-C3 対象外） |
| ガバナンス（Governance） | G | 10 | **10** | `data-dow` / `data-shift` 命名の採用理由が TD §1.2 に明記（`data-day`衝突回避）。Governance L91 / plan L246 の訂正提案も記述済 |
| **合計** | — | **100** | **100** | |

---

## 2. 重大 Claim 再チェック

| ID | Claim | 再検証結果 |
|----|-------|-----------|
| CC-1 曜日色の消失・誤配置 | **Clear** | `satBg/sunBg` の RGB 値が `--day-sat` / `--day-sun` から合成された期待値と一致 |
| CC-2 夜シフト color/font-weight 不適用 | **Clear** | `.tbl-grid__cell[data-shift="night"] { color: var(--night-text); }`（L352）・`[data-shift="night"].tbl-grid__sticky--2 { font-weight: 700; }`（L355）が動作 |
| CC-3 既存 `data-day` 数値を利用した JS ロジック破綻 | **Clear** | `data-day` は日付数値専用に温存。曜日は独立の `data-dow` にしたため、L3685 `querySelectorAll('[data-ri=""][data-day=""]')` は従来通り動作（Playwright で1件返却確認） |
| CC-4 `data-day`/`data-dow` 混同 | **Clear** | `[data-day="sat/sun/night"]` 全件ゼロ（DOM クエリで0件） |
| CC-5 モーダル夜シフト装飾崩れ | **Clear** | 該当4セレクタ CSS L1167-1170 が `[data-shift="night"]` に移行済、JS L1819/L3095 でモーダル要素にも `data-shift` 属性が付与される |
| CC-6 他モックアップへの波及 | **Clear** | `git status` 実行では `docs/order-book.html` に M-C1 由来の既存差分があるが、M-C3 の対象 CSS/JS に閉じ込め。WS/QA/SL への波及ゼロ |
| CC-7 祝日の誤触（Warning 可） | **Clear** | `md-ob-holiday(-head)` が CSS/JS に計4件残留（スコープ外として据え置き） |

**重大 Claim（Critical）: 0 件**
**High / Warning: 0 件**

---

## 3. デザイナー視点コメント

### 3.1 セマンティック向上

- `class="tbl-grid__sat"` → `data-dow="sat"` へ移行したことで、**「土曜日である」という状態** が視覚用クラスではなくデータ属性として明示されるようになった
- 同様に「夜シフト」も `data-shift="night"` として「行の属性」として表現され、プレゼンテーション（クラス）とセマンティクス（属性）の分離が達成された
- CSS セレクタが `.tbl-grid__cell[data-dow="sat"]` のように自然言語に近い形になり、可読性が向上

### 3.2 `data-day` / `data-dow` の分離

- TD が指摘した通り、既存 `data-day="${d}"`（1〜31の日付数値）を曜日と同一属性に混ぜる案は**致命的衝突**を招く
- 本実装は `data-dow`（day-of-week）で明確に別次元の属性として分離しており、`querySelectorAll('[data-day="1"]')` の既存ロジックが温存されている
- 将来 M-C4/M-G で「2日」「5日」といった特定日付のハイライトを data 属性ベースに拡張する際にも、名前空間の衝突リスクなし

### 3.3 祝日（`md-ob-holiday-head`）のスコープ外扱い

- TD §1.3 で明記された通り、祝日は M-C3 対象外として `md-ob-holiday(-head)` クラスのまま保持
- CSS L345/L349 に `.md-ob-holiday { background-color: var(--day-sun) !important; }` / `.md-ob-holiday-head { ... }` が残り、JS L555/L615 でも `cls += ' md-ob-holiday-head'` パターンを維持
- この棲み分けは妥当：祝日は日付に依存する動的属性（`holidays[dateStr]` で判定）であり、曜日固定の sat/sun とは意味論が異なる
- M-C4 or M-G で検討する際、`data-dow="holiday"` ではなく `data-special="holiday"` のような別次元属性にするのが望ましい（`data-dow` の値域は曜日に限定したい）。これは後続フェーズのTDで議論

### 3.4 モーダル要素での `data-shift` 属性付与

- L1819 `editMeta.setAttribute('data-shift', 'night')` / L3095 `calMeta.setAttribute('data-shift', 'night')` はそれぞれ編集モーダル・カレンダーモーダルの **meta 領域**（会社名/業務/タグ表示）への属性付与
- CSS L1167-1170 の 4 セレクタと完全に対応しており、モーダル起動時に夜シフト用装飾が欠落するリスクなし
- `removeAttribute('data-shift')` で昼シフト切替時も確実に属性消去、モーダル再利用時の残留汚染なし

### 3.5 改善余地（任意・後続フェーズ向け）

- L586-590, L597-602, L685, L690 で `${shiftAttr}` を約12箇所に追記しているが、ヘルパー関数 `renderCell({cls, ri, shiftAttr, ...})` で一元化すると M-C4 のゼブラ/total 属性化時に DRY 化できる（任意・M-C4 スコープ）
- `[data-shift="night"]` は現状「夜シフト」のみだが、将来的に日勤/早朝/深夜等が追加される場合に `data-shift="day" | "night" | "early"` と値が拡張できる余地がある（良い設計）

---

## 4. 総合判定

- **総合点: 100 / 100**
- **重大 Claim: 0 件**
- **判定: 合格**（合格ラインは 70 点以上 AND 重大 Claim 0）

属性化完全移行（案 A'）の選定が正しく、`data-dow` / `data-shift` への分離により既存 `data-day` 数値ロジックを温存しつつ DS セマンティクス向上が達成されている。他モックアップへの波及なく、見た目・動作完全不変を確認。M-C4（zebra/total 汎用化）の前提条件を満たす。
