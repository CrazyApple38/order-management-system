# テスト項目: LC-4 — `--shadow-*` 系 legacy alias の最小置換

- 作成日: 2026-04-21
- 作成者: TD (main thread)
- 対象: Phase M-G-Final LC-4

## 1. 目的

co-tokens.css L218-222 の legacy alias (`--shadow-sm/md/lg/medium/strong` → `--elevation-*`) のうち、**consumer が実際に alias 経由で解決している箇所のみ**を新DS `--elevation-*` に置換する。

**重要判断（事前調査・ユーザー承認済）**: SL/WS の `var(--shadow-medium)` / `var(--shadow-strong)` / `var(--shadow-color)` は box-shadow の**色引数**として使用されており、legacy alias の「完全 shadow タプル」とは意味が異なる。これらは SL/WS 自身の `:root` で color 値として再定義されているため、legacy alias を経由しない。よってこれらは本 LC スコープ外とする（handoff §3.3 温存方針と整合）。

## 2. スコープ

### 2.1 置換対象（consumer、事前実測1件）

| 箇所 | 旧 | 新 | 理由 |
|------|---|---|-----|
| [co-forms.css:208](../../mockup/co-forms.css#L208) | `box-shadow: var(--shadow-medium);` | `box-shadow: var(--elevation-3);` | 完全 shadow タプルとして使用、legacy alias (`--shadow-medium: var(--elevation-3)`) 経由で解決中 |

### 2.2 置換対象外（永続残置）

以下は LC-4 非対象。LC-5 で co-tokens.css の legacy aliases 削除後も**残り続ける**ことを前提。

**SL/WS local color 変数**（box-shadow の色引数用）:
- [screen-layout.css:23-25](../../mockup/screen-layout.css#L23-L25) (Light :root): `--shadow-color/-medium/-strong`
- [screen-layout.css:77-79](../../mockup/screen-layout.css#L77-L79) (Dark): 同上
- [weekly-schedule.css:45-47](../../mockup/weekly-schedule.css#L45-L47) (Light :root): 同上
- [weekly-schedule.css:112-114](../../mockup/weekly-schedule.css#L112-L114) (Dark): 同上

**これらを consume する consumer 5件**（すべて SL/WS 内部、local 変数で解決）:
- WS:768 `text-shadow... var(--shadow-color)`  ← 厳密には `--shadow-color` は LC-4 マッピング外
- WS:927 `box-shadow: 0 4px 12px var(--shadow-strong);`
- SL:130 `text-shadow: 0 1px 4px var(--shadow-color);`
- SL:138, 2042, 2086, 2135 `box-shadow: 0 2px 8px var(--shadow-color);`
- SL:1048 `box-shadow: 0 4px 16px var(--shadow-strong);`
- SL:1899 `box-shadow: 0 10px 40px var(--shadow-strong);`
- SL:2248 `box-shadow: 0 4px 12px var(--shadow-medium);`
- SL:2326 `box-shadow: 0 10px 60px var(--shadow-strong);`

**注**: `--shadow-color` は legacy alias に含まれないが（co-tokens.css 非定義）、SL/WS 内で完結する local var なので LC-4 の影響はない。

### 2.3 LC-5 での安全性担保

LC-4 完了時点で、legacy alias L218-222 の consumer は**なし**となる：

| Legacy alias | Consumer |
|--------------|----------|
| `--shadow-sm: var(--elevation-1)` | 0 件（元から使用なし） |
| `--shadow-md: var(--elevation-3)` | 0 件 |
| `--shadow-lg: var(--elevation-4)` | 0 件 |
| `--shadow-medium: var(--elevation-3)` | 0 件（co-forms:208 を LC-4 で migrate） |
| `--shadow-strong: var(--elevation-5)` | 0 件（SL/WS consumer は local color var で解決、alias 経由ではない） |

→ LC-5 で L218-222 を削除しても consumer 影響ゼロ。

## 3. 評価ルーブリック（100点満点、LC専用）

| カテゴリ | 配点 | 評価内容 |
|---------|----:|---------|
| A. 対象変数の置換漏れゼロ | 30 | co-forms.css:208 が `var(--elevation-3)` に置換済み、`var(--shadow-sm/md/lg)` 参照は元から0件 |
| B. 未定義変数による CSS 参照エラーゼロ | 25 | co-forms.css:208 が新名で解決可能、SL/WS 内部の local shadow var は影響なし |
| C. 視覚差分なし | 20 | co-forms.css 適用箇所（ドロップダウンメニューなど）の shadow 外観が変わらない |
| D. JS 参照破壊ゼロ | 15 | JS 参照なし（確認要） |
| E. コミット粒度 | 10 | 小規模変更、1コミット、意図伝達 |

**合格基準**: 総合70点以上 AND 重大Claimゼロ

## 4. TE チェックリスト

### A. 置換漏れゼロ
- [ ] `rg "var\(--shadow-medium\)"` with path docs/mockup → **SL/WS consumer 5件のみ** (co-forms.css から消えていること)
- [ ] `rg "var\(--shadow-strong\)"` → SL/WS consumer のみ
- [ ] `rg "var\(--shadow-sm\)"` → 0件
- [ ] `rg "var\(--shadow-md\)"` → 0件
- [ ] `rg "var\(--shadow-lg\)"` → 0件
- [ ] co-forms.css:208 が `box-shadow: var(--elevation-3);` に置換済み

### B. 未定義変数チェック
- [ ] co-tokens.css に `--elevation-3` が定義されている（既存）
- [ ] SL/WS の local `--shadow-color/-medium/-strong` は Light/Dark 両方で定義維持

### C. 視覚差分（Playwright）
- [ ] 4画面 × Light/Dark = 8 スクショ（`c:\xampp\htdocs\order-management-system\lc-4-<page>-<theme>.png`）
- [ ] co-forms 使用箇所（ドロップダウン、ツールチップ等）の shadow に視覚変化がないか確認
- [ ] SL/WS の他の box-shadow に変化がないこと

### D. JS 動作確認
- [ ] JS 内に `--shadow-*` 参照が 0件（grep）
- [ ] Console エラーなし

### E. コミット
未実施。

## 5. 重大Claim判定

- co-forms 適用箇所の shadow が消える／崩壊
- SL/WS の box-shadow に想定外の変化
- co-tokens.css 誤変更

## 6. 合格時の次ステップ

- コミット → LC-5 TD 作成へ
