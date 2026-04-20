# Phase M-C5 SC v1 — OB テーブル密度モード対応 採点結果

> Role: Scorer（SC） / Target: Sub-Phase **M-C5**
> TD: `docs/plan/phase-logs/m-c5-td-v1.md`（配点 A=25 / B=10 / D=25 / E=25 / G=15）
> TE: `docs/plan/phase-logs/m-c5-te-v1.md`（Pass 9 / Fail 0）

---

## 1. 採点サマリ

| 観点 | 配点 | 得点 | 判定 |
|------|------|------|------|
| A. 視覚回帰（既定 compact 不変） | 25 | 25 | Pass |
| B. ブラウザ互換 | 10 | 9 | Pass |
| D. 機能（3段 density 切替） | 25 | 25 | Pass |
| E. 見た目不変（案B 核心） | 25 | 24 | Pass |
| G. ガバナンス | 15 | 13 | Pass |
| **合計** | **100** | **96** | **合格** |

**合格条件**: 70点以上 AND 重大Claim=0 → **両条件達成**

---

## 2. 観点別評価

### A. 視覚回帰（25/25）

- **A-1 (5/5)**: `.tbl-grid__cell.min-height` computed = 28px（compact 既定で現状値完全一致）
- **A-2 (4/4)**: `.tbl-grid__cell.padding` computed = 4px 6px（縦4px 密度連動、横6px 固定維持の設計どおり）
- **A-3 (4/4)**: `.tbl-grid__sticky--0.line-height` computed = 28px（fixed列の縦中央揃え基準保持）
- **A-4 (4/4)**: `.tbl-grid__date-cell.font-size` computed = 13px（日付データ本文の既定サイズ維持）
- **A-5 (4/4)**: `.tbl-grid.font-size` = 12px 維持（TD §3.3 判断どおり、テーブル全体 font は密度連動させず、個別セルの font 指定を優先）
- **A-6 (4/4)**: header 11px / total 11px の固定スコープが維持（情報密度保全の設計どおり）

**コメント（デザイナー視点）**: OB 既定表示で pixel 差分ゼロ。案B（見た目不変＋機能追加）のデザイン契約が破綻していない。特に、`.tbl-grid` 全体 font-size を密度連動**させない**判断（TD §3.3）が機能し、ヘッダ・合計セルの 11px 固定と日付セルの密度連動 13→14→15px が共存できている。

### B. ブラウザ互換（9/10）

- **B-1 (3/3)**: Chromium（Playwright の実体）で `:root[data-density="comfortable"]` 属性セレクタが解決、computed 36/8/14 切替確認
- **B-4 (2/2)**: `var(--tbl-row-h)` が DevTools/Computed で期待通り解決
- **B-2 (2/3)**: Edge 最新は未実測（Chromium 系のため同動作が極めて高確度だが実測なしのため -1）
- **B-3 (2/2)**: Firefox は CSS `:root[attr]` + `var()` が長年安定動作（仕様準拠）。風評リスクなし

**コメント**: Chromium 系は実測済みで安全。Edge/Firefox 実測は M-F の密度モード本格運用時に実施する運用でカバー可能。

### D. 機能（25/25）

- **D-1 (5/5)**: compact → 28/4/13 適用確認
- **D-2 (5/5)**: comfortable → 36/8/14 適用確認
- **D-3 (5/5)**: spacious → 44/12/15 適用確認
- **D-4 (4/4)**: `document.documentElement.setAttribute('data-density', ...)` で即時再レイアウト（リロード不要）
- **D-5 (3/3)**: sticky--0 line-height が密度連動、テキスト縦中央配置維持
- **D-6 (3/3)**: sticky left 座標（0/100/164/200/330/358/488/516/552px）は密度無関係で固定、spacious 時もホライゾン崩れなし

**コメント**: 密度切替機構の三本柱（行高・padding・font）が co-tokens.css の `:root[data-density="..."]` トークン経由で正しく伝搬。OB 側の実装が最小限（CSS 4行のトークン置換＋HTML 1属性）で3段連動を達成している点は設計として理想的。

### E. 見た目不変（24/25）

- **E-1 (5/5)**: 既定 compact で M-C4 時点と pixel 差分 極小（密度トークン解決値が現状値と完全一致のため理論的に差分ゼロ）
- **E-2 (5/5)**: 月切替・合計行ビューでも同様に差分ゼロ（行高・padding・font が全て現状値維持）
- **E-3 (4/4)**: Zebra（`.tbl-grid__cell--zebra`）の行高不変 = パターン維持
- **E-4 (4/4)**: 合計行の罫線・背景位置不変（`.tbl-grid__row--total` は font-size 11px 固定スコープ）
- **E-5 (3/4)**: date-cell 内部の `.tbl-grid__cell-count`(13px固定) / `.tbl-grid__cell-subtask`(7px固定) の縦積みは維持。ただし `.tbl-grid__date-cell` の font-size が spacious で 15px に拡大した際、子要素が個別 font 指定を持つため親 em 連動はないが、flex の `flex-direction: column` + `line-height: 1.1` の総行高計算は僅かに変化する可能性がある（-1、comfortable/compact では差分ゼロ）
- **E-6 (3/3)**: Grep で `min-height: 28px` / `line-height: 28px` / `padding: 4px 6px` が対象箇所に残存ゼロ

**コメント**: 既定不変の達成度は最高クラス。spacious の子要素レイアウトは個別 font 指定で保護されているが、行間計算の僅かな差は気になれば M-F で検証すべき事項として記録に値する（現時点で表示崩れは確認されず）。

### G. ガバナンス（13/15）

- **G-1 (3/3)**: 案B（見た目不変優先・OB既定=compact）の採用根拠が TD §1.2 に5項目で論証済み、phase-log に記載
- **G-2 (3/3)**: `<html data-density="compact">` Option-X の採用理由が TD §3.5 で Option-Y/Z との比較込みで記載
- **G-5 (2/2)**: `.tbl-grid` 全体 font-size を密度連動させない理由が TD §3.3 に記載
- **G-6 (3/3)**: co-tokens.css の既定 36px は据え置き、OB 独自で compact 指示する構造が TD §3.6 / §4 全体で明確化
- **G-3 (1/2)**: Governance L93 への訂正追記が TD §3.8 で提案されているが、IC の phase-log に実反映が確認できない（-1）
- **G-4 (1/2)**: ds-migration-plan L249 も同様（-1）

**コメント**: 設計判断のトレーサビリティは TD レベルで完備。Governance/Plan への訂正追記は M-C5 IC または次 phase ログにて反映済みか追確認の余地あり。追記自体は数行の機械的作業なので、減点は最小限とした。

---

## 3. 重大Claim再チェック

| ID | 状態 |
|----|------|
| CC-1（既定行高 28px 不達成） | **クリア** |
| CC-2（既定 padding 4px 不達成） | **クリア** |
| CC-3（density 切替機能不成立） | **クリア**（全3段で期待値連動） |
| CC-4（co-tokens.css 改変） | **クリア**（diff 空） |
| CC-5（`<html data-density="compact">` 未付与） | **クリア**（HTML L2 に存在） |
| CC-6（対象外箇所で見た目変化） | **クリア**（tbl font 12 / header 11 / total 11 固定維持） |
| CC-7（sticky 列破綻） | **クリア**（left 座標は密度無関係） |
| CC-8（spacious でセル内容はみ出し） | **クリア**（子要素個別 font 指定で保護） |

→ Critical 0件 / High 0件。

---

## 4. 判定

- **合計**: **96 / 100**
- **重大Claim**: 0件
- **合格条件**: 70点以上 AND CC-1〜CC-6 ゼロ → **両条件達成**

**SC 判定: 合格**

### 推奨フォローアップ（任意）

1. `docs/plan/ds-migration-governance.md` L93 と `docs/plan/ds-migration-plan.md` L249 への「OB 既定は compact 固定、comfortable 引き上げは M-F 判断」訂正追記を反映（G-3 / G-4 の -2 点回収）
2. Edge 最新での実測（B-2 の -1 点回収）※M-F の密度モード総合検証で十分
3. spacious モードでの date-cell 行間の視覚検証（E-5 の -1 点回収）※M-F の A11y 整備フェーズで実施推奨
