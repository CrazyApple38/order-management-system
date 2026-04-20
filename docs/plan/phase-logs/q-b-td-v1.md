# Q-B Test Design (TD) v1

サブフェーズ: **Q-B — QA フォーム要素を co-forms.css `.md-fi-*` と視覚整合**

作成日: 2026-04-20

## 目的

QA のフォーム要素（`.qa-login-field input`, `.qa-add-client-input`, `.qa-count-inline-input`, `.qa-time-hour/-min`, `.qa-cal-edit-field input/select/textarea`, `.qa-map-url-row input`, `.qa-modal-field input`, `.qa-sub-label/-value`, `.qa-reliability-chip`, `.qa-badge-chip`, `.qa-modal-chip`）を co-forms.css `.md-fi-*` と視覚・挙動面で整合させる。

JS は `.qa-*` クラスを前提に多数の querySelector を持つため **クラス名は保全し**、CSS 側で DS 準拠のフォーカスリング（`box-shadow: 0 0 0 3px var(--accent-dim)`）、hover 時のアクセント枠、placeholder 色、transition 時定数を統一的に適用する。

QA は comfortable 密度既定（DS既定と同じ）。カテゴリ色分化は適用対象外。

## 配点

| 区分 | 配点 |
|------|-----:|
| A. DS準拠（フォーカスリング / hover / placeholder / transition 統一） | 30 |
| B. 視覚一致 | 20 |
| E. 機能回帰（JS 非破壊） | 30 |
| G. コード品質 | 20 |

合格: 70点以上 AND 重大Claim=0

## テスト項目

- T1 `.qa-login-field input` に `.md-fi-input` 同等の focus ring（`0 0 0 3px var(--accent-dim)`）が適用される
- T2 `.qa-add-client-input` / `.qa-count-inline-input` / `.qa-time-hour` / `.qa-time-min` / `.qa-sub-label` / `.qa-sub-value` / `.qa-map-url-row input` / `.qa-modal-field input` / `.qa-cal-edit-field input/select/textarea` の focus ring が統一（`0 0 0 3px var(--accent-dim)`）
- T3 上記入力要素の hover で `border-color: var(--accent-primary)`（md-fi-input 等価）
- T4 placeholder の色が `var(--text-disabled)` に統一
- T5 transition が `border-color var(--duration-fast)` に統一
- T6 `.qa-reliability-chip` / `.qa-badge-chip` / `.qa-modal-chip` の active 時スタイルが `var(--accent-primary)` 塗り + `#fff`
- T7 JS の querySelector 参照（`.qa-reliability-chip`, `.qa-badge-chip`, `.qa-modal-chip`, `.qa-time-hour`, `.qa-time-min`, `.qa-sub-label`, `.qa-sub-value`, `.qa-map-label` 等）が全て有効
- T8 co-forms.css / co-tokens.css 未変更
- T9 HTML の class 名未変更
- T10 JS の class 名参照未変更

## 重大Claim

- C1 JS の class 参照が破れ機能破壊
- C2 co-forms.css / co-tokens.css / 他ファイルに差分発生
- C3 フォーカスリングが過剰に大きく既存レイアウトを崩す
