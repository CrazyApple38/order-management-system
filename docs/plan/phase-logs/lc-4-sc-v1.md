# SC レポート: LC-4 v1

- 実施日: 2026-04-21
- 担当: SC (main thread)
- 対象: Phase M-G-Final LC-4（`--shadow-*` legacy alias の最小置換）

## スコア表

| カテゴリ | 配点 | 得点 | 根拠 |
|---------|----:|----:|------|
| A. 置換漏れゼロ | 30 | 30 | TE grep 5パターン全て期待通り。`var(--shadow-sm/md/lg)` 0件、`--shadow-medium` は SL:2248 のみ（SL local var で解決）、`--shadow-strong` 4件（全 SL/WS 内部）。co-forms.css:208 は `var(--elevation-3)` へ置換済み（TE §A 実測）。 |
| B. 未定義変数エラーゼロ | 25 | 25 | co-tokens.css:125 に `--elevation-3` 定義済（既存）。SL/WS local `--shadow-color/-medium/-strong` は Light(SL:23-25, WS:45-47) / Dark(SL:77-79, WS:112-114) 両方で定義維持。consumer 10箇所すべて解決可能（TE §B）。 |
| C. 視覚差分なし | 20 | 19 | スクショ8枚取得済、SC 抜粋確認（OB-Light, QA-Light）で shadow 含む描画に異常なし。QA ログインカードの shadow も正常描画。co-forms 経路の combobox dropdown は open 状態でないため静的比較不可だが、`--shadow-medium: var(--elevation-3)` の同値 alias 経由のため計算値同一が論理保証される（TE §C）。静的未検証分を -1。 |
| D. JS 破壊ゼロ | 15 | 15 | `docs/mockup/*.js` 内 `--shadow-` 参照 0件（TE §D）。Playwright Console の SVG 404 は LC-4 無関係の既存欠損で、CSS var 関連エラーなし。 |
| E. コミット粒度 | 10 | 10 | 未実施だが TD §4-E 指示通り（仮満点、handoff ルール準拠）。変更は 1行のみで粒度適正。 |
| **合計** | **100** | **99** | — |

## 重大Claim

**なし**。TD §5 で列挙された 3項目（co-forms shadow 消失/崩壊、SL/WS 想定外変化、co-tokens.css 誤変更）はいずれも発生なし。

## 合否判定

**合格**（99/100、合格基準 70点 AND 重大Claim 0件 の両方を充足）。

## 所見

- スコープが 1行置換と極小で、TE の論理保証（同値 alias のため計算値一致）と grep 検証で十分。視覚差分 -1 は combobox open 状態の静的未検証に対する形式的減点で、実害の疑いはなし。
- SL/WS 内部の local shadow color var は LC-4 対象外として温存されており、TD §2.2 / handoff §3.3 の方針と一貫。
- LC-5 での legacy alias L218-222 削除に向けた前提（consumer 0件化）は TD §2.3 の表通り達成。

## 次ステップ

1. co-forms.css の 1行変更をコミット（`refactor(ds-migration): Phase M-G-Final LC-4 co-forms box-shadow を新DS --elevation-3 へ`）。
2. LC-5 TD 作成へ進行可。
