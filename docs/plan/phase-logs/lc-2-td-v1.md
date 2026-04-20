# テスト項目: LC-2 — `--accent / --accent-light / --accent-dim` の新DS変数置換

- 作成日: 2026-04-21
- 作成者: TD (main thread)
- 対象: Phase M-G-Final LC-2

## 1. 目的

旧エイリアス `--accent / --accent-light / --accent-dim` を新DS `--accent-primary / --accent-primary-light / --accent-primary-dim` に完全置換する。

co-tokens.css L205-207 の legacy aliases は LC-5 で削除するため本サブフェーズでは保持。

## 2. スコープ

### 2.1 置換マッピング

| 旧 | 新 |
|---|---|
| `var(--accent)` | `var(--accent-primary)` |
| `var(--accent-light)` | `var(--accent-primary-light)` |
| `var(--accent-dim)` | `var(--accent-primary-dim)` |

**正規表現注意**: `var\(--accent\)` は `var(--accent-primary)` にマッチしない（末尾括弧が厳密一致のため）。同様に `var\(--accent-light\)` と `var\(--accent-primary-light\)` も区別される。

### 2.2 対象ファイル（事前実測 159 件 / 7 ファイル）

| ファイル | 件数 |
|---------|----:|
| quick-access.css | 50 |
| screen-layout.css | 33 |
| weekly-schedule.css | 33 |
| co-forms.css | 18 |
| co-buttons.css | 13 |
| co-shared-badges.css | 11 |
| co-navbar.css | 1 |
| co-tokens.css | 3（legacy aliases、**置換対象外**） |

JS 参照は 0件（grep確認済）。

### 2.3 Dark テーマブロックの書換え

SL と WS の dark block には旧変数名での定義が残っているため新変数名に改名：

- [screen-layout.css:51-52](../../mockup/screen-layout.css#L51-L52): `--accent-light` / `--accent-dim` を `--accent-primary-light` / `--accent-primary-dim` に改名（値は維持）
  - 備考: L50 の `--accent-primary: #098698` はすでに新名
- [weekly-schedule.css:76-77](../../mockup/weekly-schedule.css#L76-L77): 同様に改名
  - 備考: L75 の `--accent-primary: #55B5C4` はすでに新名

### 2.4 逆エイリアスの削除

- [screen-layout.css:96](../../mockup/screen-layout.css#L96): `--accent: var(--accent-primary);` 行削除
- [weekly-schedule.css:133](../../mockup/weekly-schedule.css#L133): 同削除

### 2.5 値の一貫性（重要: LC-1 知見）

LC-1 では Dark の `--sub-secondary (#AEC0C2)` ≠ `--divider (#4a5259)` の値不一致があった。LC-2 では下記を確認済み：

- Dark の `--accent-primary` と `--accent-light` / `--accent-dim` は、それぞれ `--accent-primary-light` / `--accent-primary-dim` として同じ Accent 系統の整合値で運用されているため**値の衝突なし**

## 3. 評価ルーブリック（LC専用、100点満点）

| カテゴリ | 配点 | 評価内容 |
|---------|----:|---------|
| A. 対象変数の置換漏れゼロ | 30 | `var(--accent)` / `var(--accent-light)` / `var(--accent-dim)` が co-tokens.css L205-207 以外 0件 |
| B. 未定義変数による CSS 参照エラーゼロ | 25 | 新変数 3種が Light/Dark 両方で解決可能 |
| C. 視覚差分なし | 20 | Playwright スクショで OB/SL/WS/QA の視覚崩壊なし |
| D. JS 参照破壊ゼロ | 15 | JS 参照が 0件のため対応不要（grep 確認済） |
| E. コミット粒度・メッセージの適切性 | 10 | 1コミットにまとまり、LC-2 の意図が伝わる |

**合格基準**: 総合70点以上 AND 重大Claimゼロ

## 4. TE チェックリスト

### A. 置換漏れゼロ（grep検証）

- [ ] `rg "var\(--accent\)" docs/mockup` → co-tokens.css L205 のみ
- [ ] `rg "var\(--accent-light\)" docs/mockup` → co-tokens.css L206 のみ
- [ ] `rg "var\(--accent-dim\)" docs/mockup` → co-tokens.css L207 のみ

### B. 未定義変数チェック

- [ ] co-tokens.css に `--accent-primary / --accent-primary-light / --accent-primary-dim` が定義されている（既存）
- [ ] Dark block (SL/WS) で新変数3種が定義されている
- [ ] dark block に旧変数名 (`--accent-light: ...` など) が残っていない
- [ ] 逆エイリアス `--accent: var(--accent-primary)` が SL/WS から削除されている

### C. 視覚差分（Playwright）

- [ ] 4画面 × Light/Dark = 8 スクショ取得（`c:\tmp\lc-2-*.png`）
- [ ] ボタン・リンク・アクセント系の色崩壊がないこと
- [ ] LC-1 の記録と比較し、アクセント色部分に想定外の色変化がないこと

### D. JS 動作確認

- [ ] OB / WS の Console エラーなし

### E. コミット

- [ ] 1コミット、メッセージ規約準拠

## 5. 重大Claim判定

以下は1件でもあれば不合格：

- アクセント系色が Light/Dark で崩壊（未定義/白化）
- co-tokens.css legacy aliases ブロック本体の誤削除
- ボタン・フォーム focus ring・チップ active 状態などの視覚崩壊

## 6. 合格時の次ステップ

- コミット → LC-3 TD 作成へ
