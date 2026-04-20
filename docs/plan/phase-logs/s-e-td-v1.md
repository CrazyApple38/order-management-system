# S-E Test Design (TD) v1

サブフェーズ: **S-E — Screen Layout バッジの `.bt-*` 体系への対応**

作成日: 2026-04-20

## 1. 目的

SL の `.category-*` / `.shift-*` / `.contact-*` / `.continuous-badge*` / `.badge-*-tag` / `.employee-tag` / `.vehicle-list-tag` / `.etc-tag` について:

- **カテゴリ・シフト**: `data-category` / `data-shift` 属性を併設（S-C で既に実施済、Phase D5.2 の4色相分化も適用済）
- **contact / continuous / employee / vehicle / etc**: JS で多数参照されるため**クラス名 rename は不採用**。co-shared-badges.css の `.bt-*` 体系と意味等価であることをコメントで明示し、トークン値を co-tokens.css から解決する方針で維持

## 2. 方針

案B（並行運用）採用。SL の badge クラスは全て co-tokens.css のトークン値（`--cat-*`, `--shift-*`, `--warning-text`, `--error*`）で描画される状態をキープし、DS `.bt-*` 規約とは意味等価性をドキュメント化。

## 3. 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠（data-* 併設 + tokens 経由） | 25 |
| B. カラー（D5.2 4色相分化の反映） | 20 |
| D. バッジ一貫性 | 25 |
| E. 機能回帰 | 20 |
| G. 保守性 | 10 |

## 4. チェックリスト

- T1 S-C で `[data-category=*]`, `[data-shift=*]` が 4+2 セレクタ分併設されている
- T2 カテゴリ `facility/event/traffic/highway` のうち event/traffic/highway が D5.2 の独立色相で描画される（co-tokens.css 経由）
- T3 Dark テーマでもカテゴリ 4 色相分化が有効
- T4 `.continuous-badge` が `var(--warning-text)` で描画される
- T5 `.employee-tag` / `.vehicle-list-tag` / `.etc-tag` がトークン経由で描画され、ドラッグ動作は維持される（JS 側 classList 参照が破壊されない）
