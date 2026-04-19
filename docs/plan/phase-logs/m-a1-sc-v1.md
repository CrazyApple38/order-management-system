# Scoring Report: M-A1 v1

採点者: Scorer (SC)
採点日: 2026-04-18
対象TE: `docs/plan/phase-logs/m-a1-te-v1.md`
対象実装: `docs/mockup/order-book.css`（:root L6〜L27）
参照TD: `docs/plan/phase-logs/m-a1-td-v1.md`

---

## 総合判定

- 総合点: **97 / 100**
- 重大Claim: **なし**（C1〜C7 全て未発生。C6 は基準画像未提供による Warning のみ）
- 判定: **合格**

合格条件チェック:
- 総合 97 ≥ 70 ✓
- 重大Claim 0件 ✓
→ **M-A1 PASS**

---

## カテゴリ別採点

### A. DS準拠（30 / 30）

- T1〜T7 全 Pass。分類A 26変数の削除が 100% 達成され、削除漏れ 0件
- `--base-*` / `--sub-*` / `--accent-*` / `--text-*` / `--divider` / `--error` / `--success*` / `--warning` / `--warning-bg` / 後方互換 6変数（`--bg-*` / `--accent`）/ `--secondary` まで完全削除
- T7 の `--secondary` 判断も「本文参照 0件 → 削除」で正しく運用（TD §3.3 の初期判定に一致）

### B. カラー（15 / 15）

- T8〜T9 Pass、`getComputedStyle` での実測値が期待値と完全一致
- 補足テーブル（主要11変数）全て期待値一致。Coastal Palette 外の混入なし
- body背景 `#E9F1F6`、アクセント `#44A6B5`、夜間テキスト `#DB577B` ほか規定通り

### D. コンポーネント一貫性（15 / 15）

- T10〜T14 Pass。分類B 13変数全て残留
- `--base-grid*` / `--day-*` / `--error-bg` / `--night-text` / `--success-bg` / `--warning-text` 全て位置・値正確
- T14 で残留変数の本文参照 43件（`--night-text` 13件含む）が CSS パースエラー 0件で解決

### E. 機能回帰・見た目不変（27 / 30）

- T16 / T18 / T19 Pass、T17 N/A（JS/HTML差分ゼロのためスコープ外）
- T15 のみ Warning（M0-5 基準スクショ未引継のため厳密画像diff未実施）。ただし getComputedStyle で主要24変数の解決値が期待通りで、論理的には見た目不変
- 厳密画像比較が実施されなかった点で -3 の減点

### G. コード品質・保守性（10 / 10）

- T20〜T22 Pass
- `:root` 54行 → **22行**（59%削減。目標 60%以下・32行以下を大幅達成）
- 配下定義が全滅した見出しコメント（Tier 1 / Tier 2 / Tier 3 / テキスト / ディバイダー・セマンティック / 後方互換）を全削除。残存3見出し（OB Grid背景 / 曜日オーバーレイ / OB固有α値・用途特殊）は各々配下に変数あり、整合性高

---

## デザイナー視点コメント（3-5行）

1. `:root` が **22行・13変数**まで圧縮され、冒頭コメント「OB固有トークン（co-tokens.css 未収載。Phase M-A で個別対応予定）」によって意図が明示されており、保守性が大幅向上
2. 残留変数の命名は `--base-grid-*` / `--day-*-cal` / `--night-text` / `--error-bg` / `--success-bg` / `--warning-text` いずれも **OB固有であることが識別可能**な語彙で、co-tokens 側の新DS階層（base / sub / accent / text / semantic）と責務が明確に分離している
3. `--warning-text: #975A16;` の値不一致が「`/* 値不一致のため残留。Phase M-A2 で整合検討 */`」という**明示コメント付き**で正しく残留。レビュー時に「なぜ削除されていないか」が一読で理解可能
4. 後方互換エイリアス（`--bg-page` / `--accent` など）が全滅した点は、旧命名への依存コードがないことの証明にもなっており、今後の命名統一がしやすい
5. `--night-text` と `--error` が同値（`#DB577B`）だが意図が異なる（時間帯表現 vs 状態表現）ため分離残留したのは妥当。次フェーズで `data-time="night"` 属性化を検討する布石として機能している

---

## Phase M-A2 への引き継ぎ事項

1. **`--warning-text` の値整合**: OB `#975A16` vs co-tokens semantic-warning-text `#92400e`。M-A2 で (a) co-tokens 値を OB に寄せる / (b) OB 値を co-tokens に寄せる / (c) OB 独自トークン（`--semantic-warning-text-ob` 等）として分離、のいずれかで決着必要
2. **`--secondary` の解決経路監視**: OB 本文では未参照となったが、`docs/ui-components/styles-light.css:20` に `--secondary: #B2D5E2;` が残存。styles-light.css のリネーム・削除時は co-tokens.css 側に alias 追加が必要（M-A2 以降の他モックアップCSS整理タスクで留意）
3. **M0-5 基準スクショの運用固定**: 今後の M-A2 以降の TE では、基準コミット時点の画像セットを `docs/plan/phase-logs/baseline/` 等に固定保存し、セッション跨ぎで厳密画像diffが実施可能な運用に切替推奨（TE §6-1 申し送り）
4. **`--night-text` の属性化検討**: 値が `--error` と同じだが意図が異なるため、後続フェーズで `[data-time="night"]` のような属性ベース指定に置換することで `--night-text` 変数自体の削減余地あり
5. **M-A2 スコープの優先順位**: 上記1 が最優先（値不一致の技術的負債）、2 は波及範囲の把握、3 は運用改善、4 は設計改善の順で取り組むことを推奨
