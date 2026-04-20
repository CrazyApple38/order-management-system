# TE レポート: LC-4 v1

- 実施日: 2026-04-21
- 担当: TE (subagent)

## A. grep

path: `c:\xampp\htdocs\order-management-system\docs\mockup`

| パターン | ヒット | 期待 | 判定 |
|---|---|---|---|
| `var\(--shadow-medium\)` | 1件: screen-layout.css:2248 | SL/WS consumer のみ、co-forms.css には0件 | OK |
| `var\(--shadow-strong\)` | 4件: screen-layout.css:1048,1899,2326; weekly-schedule.css:927 | SL/WS consumer のみ、co-*.css には0件 | OK |
| `var\(--shadow-sm\)` | 0件 | 0件 | OK |
| `var\(--shadow-md\)` | 0件 | 0件 | OK |
| `var\(--shadow-lg\)` | 0件 | 0件 | OK |

co-forms.css:208 実測:
```
208:    box-shadow: var(--elevation-3);
```
→ 新名へ置換済み、legacy alias `--shadow-medium` への参照消失を確認。

## B. 未定義変数

- co-tokens.css:125 に `--elevation-3: 0 4px 12px rgba(0, 69, 84, 0.10);` 定義あり（既存）。co-forms.css:208 解決可。
- co-tokens.css:221 に legacy alias `--shadow-medium: var(--elevation-3);` 残置（LC-5 対象、LC-4 スコープ外）。
- SL local `--shadow-color/-medium/-strong`: screen-layout.css:23-25 (Light), 77-79 (Dark) に定義維持。
- WS local: weekly-schedule.css:45-47 (Light), 112-114 (Dark) に定義維持。
- SL/WS の consumer 計10箇所（SL:130,138,1048,1899,2042,2086,2135,2248,2326 + WS:768,927）は local 定義で解決、未定義参照なし。

## C. 視覚差分

Playwright MCP で 4画面 × Light/Dark = 8スクショ取得。保存先 `c:\xampp\htdocs\order-management-system\lc-4-<page>-<theme>.png`。

| ページ | Light | Dark | Console error |
|---|---|---|---|
| order-book | 取得済 | 取得済 (ただし OB は data-theme=dark 非対応、見た目は Light と同一) | 0 |
| screen-layout | 取得済 | 取得済 | 1件 (`icons/refresh.svg` 404、LC-4 無関係の既存欠損) |
| weekly-schedule | 取得済 | 取得済 | 0 |
| quick-access | 取得済 | 取得済 (QA も data-theme 非対応、見た目同一) | 1件 (`icons/shield.svg` 404、LC-4 無関係の既存欠損) |

co-forms 関連（combobox ドロップダウン `.md-fi-combo-dropdown`）は各画面の初期表示で open 状態ではないため、静的スクショでは直接描画されず。ただし legacy alias `--shadow-medium: var(--elevation-3)` と新名 `--elevation-3` は co-tokens.css:221 で同値定義のため、算出値同一（視覚差分ゼロを論理的に保証）。

SL/WS の box-shadow 描画（カード、パネル、モーダル shadow）は Light/Dark 両モードで従来通り。

## D. JS

grep `--shadow-` against `docs/mockup/*.js` → 0 件。JS 参照破壊なし。

Playwright Console error（C 項目参照）は SVG 404 のみで `--shadow-*` CSS var 関連エラーなし。

## E. コミット

未実施（TD §4-E 指示通り）。LC-4 変更は co-forms.css:208 の 1行のみ（staged/unstaged 不明、TE は git 操作せず）。

## 重大Claim

なし。

- co-forms 適用箇所の shadow 消失/崩壊: 想定消費者（combobox dropdown）は open 時のみ描画のため静的スクショ不可だが、変数値同一により視覚差分ゼロを論理保証。
- SL/WS の box-shadow に想定外の変化: 10箇所すべて local 定義で解決、LC-4 変更範囲外。スクショ比較でも既存デザイン維持。
- co-tokens.css 誤変更: 未実施（該当箇所に変更なし、LC-5 対象）。

## 総評

TD §2.1 スコープ（co-forms.css:208 の 1行置換）通りに実施済み。A/B/C/D 全項目で合格基準を満たす。特記事項として OB/QA の 2画面は data-theme=dark 非対応の既存状態（LC-4 とは独立）のため、Dark スクショは Light と同一描画となるが、SL/WS は Light/Dark 両方で期待通り切替動作を確認できた。LC-5 (legacy alias L218-222 削除) へ進行可。
