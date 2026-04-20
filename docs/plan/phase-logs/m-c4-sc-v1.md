# Phase M-C4 SC v1 — OB グリッドの Zebra / 合計行 / 空セル BEM 修飾子化 採点

> Role: System Critic（SC） / Target: Sub-Phase **M-C4**
> 対応 TD/TE: `m-c4-td-v1.md` / `m-c4-te-v1.md`

---

## 1. 配点と採点

| 観点 | 略号 | 配点 | 得点 | 説明 |
|------|------|------|------|------|
| Appearance | A | 25 | **25** | Zebra / 合計行 / 総合計 / 空セル位置、すべて computed 値で前後不変を確認 |
| Browser | B | 10 | **10** | Chromium（Playwright）で BEM 修飾子セレクタ適用を computed 値で確認。Edge/Firefox は標準 CSS セレクタ仕様上同一結果（BEM はベンダ依存なし） |
| Domain/Behavior | D | 20 | **20** | 偶数判定（`!isHidden && visibleRowIndex % 2===1`）継続、空セル 3 種（データ/行合計/合計行日別）すべて条件式が正しく付与、合計行 9 + daysInMonth + 1 の子数維持 |
| Equivalence | E | 30 | **30** | 旧クラス 4 種 CSS/JS/DOM ともに 0 件、新クラス 5 種が期待箇所に存在、`.tbl-grid__cell--empty` placeholder で視覚不変、CSS brace balance=0、JS syntax OK、Playwright DOM スナップショットで旧クラス完全不在 |
| Governance | G | 15 | **13** | BEM 修飾子採用根拠と Grid→Table 延期方針、空セル装飾スコープ外の明記は TD 側で完備。phase-log（TE/SC）でも一貫。`ds-migration-governance.md` L92 / `ds-migration-plan.md` L247-248 への訂正追記コミットは未確認（Governance 遡及修正が IC 最終ステップに残存）→ **-2** |
| **合計** | — | **100** | **98** | |

**判定: 合格**（70 点以上 かつ 重大 Claim 0 件）

---

## 2. 設計批評

### 2.1 命名整合性 — BEM 修飾子化

TD が選定した「案A: BEM 修飾子化（親クラスは `.tbl-grid__cell` 維持）」は、以下の理由で妥当:

1. **DS との意味ベクトル整合**: `.tbl-grid__row--zebra` は DS の `.tbl--zebra` と同じ意味論（zebra-striping の修飾）を持ちつつ、OB の CSS Grid flat 構造を壊さない
2. **機械置換性**: M-G で Grid→Table 化を検討する際、`__row--zebra` → `tr.tbl--zebra ~ tr:nth-child(even) > td` のように修飾語ベースでマッピング可能
3. **既存 JS ロジックとの非互換性回避**: `:nth-child(even)` の自動化を OB で無理に導入すると、ヘッダ／frozen／合計行が DOM flat に混在するため実現困難。現状の `visibleRowIndex % 2 === 1` 判定（非表示行を除外）を温存するのは正しい選択

### 2.2 空セル下地の価値

`.tbl-grid__cell--empty` は M-C4 では placeholder のみだが、以下 3 点で**将来価値**が高い:

- **装飾昇格の低コスト化**: M-G で `::before { content: "—" }` や `color: var(--text-disabled)` を追加するだけで、全 OB セルが一括で DS と同じ「空欄ダッシュ」表現に昇格
- **アクセシビリティ伏線**: 空状態を DOM マーカーで明示することで、将来スクリーンリーダー向けに `aria-label="データなし"` 等を仕込む際の起点になる
- **条件判定の冗長除去**: 現状 JS 3 箇所で `count === 0` / `rowTotalMax === 0` / `dailyTotalsMax[d] === 0` を評価しているが、これらをクラスに昇華することで CSS 側で「空セルのみ非表示」「空セルのみクリック不可」等の宣言的制御が可能になる

185 個もの空セル DOM へのクラス付与は些細だが、DS 統合の**下地**として十分に投資対効果あり。

### 2.3 重大 Claim 再チェック

TE §3 の Claim 判定を SC 視点で再検証:

| ID | 再検証観点 | SC 確認 |
|----|-----------|--------|
| CC-1 | zebra が月切替で再計算されるか | JS L583 `visibleRowIndex++` は `renderGrid()` 毎に 0 リセットされる前提。L542-543 の関数頭で `visibleRowIndex=0`（該当変数の初期化）を確認 → 月切替再計算の仕組み維持 | OK |
| CC-2 | 合計行 border-top が CSS Grid の行またぎで機能するか | `.tbl-grid__row--total` は個別セル単位で付与。各セルに上罫線が乗るため「隙間のない合計行帯」として見える。Playwright で確認済 | OK |
| CC-3 | sticky 複合セレクタ 9 件の優先順位 | specificity は旧 `.tbl-grid__total-row.tbl-grid__sticky--N`（0,0,2,0）と新 `.tbl-grid__row--total.tbl-grid__sticky--N`（0,0,2,0）で**完全同値**。優先順位逆転なし | OK |
| CC-4 | Grep 完全性 | `\b`付 word-boundary も一致（ハイフン終端は `-row` / `-total` / `-cell` の次が空白または `{` で途切れる）、TE の生 Grep で 0 件確認 | OK |
| CC-5 | `.tbl-grid__cell--empty` の意図せぬ継承 | placeholder `{ /* ... */ }` は空ルール。CSS parser で無視に近い扱い（セレクタだけ存在、ルールセット空）。computed `content=normal` 確認 | OK |
| CC-6 | Git diff スコープ | `order-book.css / .js / .html` の 3 ファイル。HTML は M-C1 由来の既往変更で M-C4 範囲外、CSS/JS は本フェーズ対象。波及ゼロ | OK |
| CC-7 | DS クラス誤移植 | `tbl--zebra / tbl-row--total / tbl-cell--empty` は OB css/js に 0 件 | OK |
| CC-8 | 空セル判定の 3 箇所網羅 | データセル（L613）／行合計（L691）／合計行日別（L711）すべて実装確認 | OK |

**重大 Claim CC-1〜CC-6: すべて未発生。CC-7/CC-8: すべて未発生。**

### 2.4 減点項目の詳細（G: -2）

TD §3.7 で **必須** とされた Governance 遡及修正（`ds-migration-governance.md` L92 / `ds-migration-plan.md` L247-248 の訂正追記）は、M-C4 IC（Implementation Coder）の最終タスクとして指定されているが、TE 時点で当該ファイルの `git diff` に含まれていないため**未実施**。

→ IC サイドで M-C4 完了コミット前に補う必要あり。G を -2 点（15 → 13）。

ただしこれは **Critical ではなく Governance 運用レベルの漏れ**であり、CC 判定には影響しない。

---

## 3. 最終判定

**SC 総合点: 98 / 100**

**判定: 合格**（70 点以上 ∧ CC-1〜CC-6 未発生）

**推奨フォロー**: M-C4 IC は commit 前に `docs/plan/ds-migration-governance.md` L92 と `docs/plan/ds-migration-plan.md` L247-248 の訂正追記を実施し、phase-log に記録すること。
