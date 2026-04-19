# M-A3 Test Design（TD v1）— OB フォント/影/モーション ハードコード棚卸

担当: Test Designer (TD)
対象: `docs/mockup/order-book.css`（1870行）
前提: Phase M0-4（body に `--font-family-body` + palt + tabular-nums）/ M-A1・M-A2（OB `:root` 13変数化、本文の新DS参照）完了

---

## 1. 目的と採用方針

### 目的
OB CSS 内のフォント（family / size / weight / line-height）、影（box-shadow）、モーション（transition / animation）のハードコード値を棚卸し、新DSトークン（`docs/ui-components/styles-light.css`）に置換可能なもの・DS外の例外・置換不可のものを仕分ける。M0-4 で body に設定した `font-family-body / palt / tabular-nums` が OB で正しく継承されていることを再確認する。

### 採用方針: 案1（保守的 / 調査重視）
**根拠:**
1. **置換件数が非常に多い**: font-size だけで約100件、transition で約45件、box-shadow で約30件。M-A3 単独で全置換すると diff が膨張し、見た目差分の切り分けが困難になる。
2. **DS外のサイズが多数残存**: OB は密度重視テーブル用途のため `7/8/9/10/12/15/18/19/12.5px` 等、DS 6段階（11/13/14/16/20/26/34）に載らない値が構造的に必要。これらは Phase M-C（テーブル密度）で方針を定める対象。
3. **M-A3 の本来の目的**: font-family 統合の検証（body 継承の確認）。網羅置換は越権。
4. **軽微な置換のみ M-A3 で実施**: DSに完全一致する値（font-weight の 400/500/600/700/800、font-size の 11/13/14/16/20 等）のうち、機械的置換でリスクが低いものに限定。

### 配点（案1）
| 区分 | 配点 |
|------|------|
| A 合意事実（body 継承・DS準拠） | 40 |
| G ガバナンス（棚卸完了・Phase委任） | 30 |
| E 見た目不変（置換しても差分ゼロ） | 30 |
| 合計 | 100 |

合格条件: **70点以上 AND 重大Claim=0**

---

## 2. 事前調査結果（棚卸表）

### 2-1. font-size 集計（全100件超）

| 値 | 件数 | DS対応 | 判定 |
|----|------|--------|------|
| 7px | 3 | ✕ | DS外・維持（category badge） |
| 8px | 1 | ✕ | DS外・維持（祝日名） |
| 9px | 4 | ✕ | DS外・維持（day-name 等） |
| 10px | 11 | ✕ | DS外・維持（極小バッジ） |
| 11px | 23 | ◯ `--fs-caption` | **置換候補** |
| 12px | 22 | ✕ | DS外・維持（本文密度） |
| 12.5px | 1 | ✕ | DS外・維持（タイムライン） |
| 13px | 15 | ◯ `--fs-sm` | **置換候補** |
| 14px | 7 | ◯ `--fs-base` | **置換候補** |
| 15px | 2 | ✕ | DS外・維持（modal header） |
| 16px | 2 | ◯ `--fs-md` | **置換候補** |
| 18px | 4 | ✕ | DS外・維持（header h1 / number input） |
| 19px | 2 | ✕ | DS外・維持（toast icon） |
| 20px | 0 | — | — |
| 26px | 0 | — | — |
| 34px | 0 | — | — |

**置換可能: 11/13/14/16px = 計 約67件**
**DS外（M-C判断）: 7/8/9/10/12/12.5/15/18/19px = 計 約50件**

### 2-2. font-weight 集計

| 値 | 件数 | DS対応 | 判定 |
|----|------|--------|------|
| 400 | 4 | ◯ `--fw-regular` | 置換候補 |
| 500 | 14 | ◯ `--fw-medium` | 置換候補 |
| 600 | 36 | ◯ `--fw-semibold` | 置換候補 |
| 700 | 14 | ◯ `--fw-bold` | 置換候補 |
| 800 | 0 | — | — |

**全件置換可能: 計 約68件**（最も機械置換で安全）

### 2-3. line-height 集計

| 値 | 件数 | DS対応 | 判定 |
|----|------|--------|------|
| 1 | 9 | ✕ | DS外・維持（アイコン中央揃え用） |
| 1.1 | 1 | ✕ | DS外・維持 |
| 1.2 | 2 | ✕ | DS外・維持（密度調整） |
| 1.3 | 2 | ◯ `--lh-tight` | 置換候補 |
| 1.4 | 1 | ✕ | DS外・維持 |
| 1.5 | 0 | — | — |
| 1.6 | 1 | ◯ 近似で保留 | 要判断（DS無し） |
| 1.7 | 0 | — | — |
| `28px`（行高px指定） | 1 | ✕ | 置換不可（セル高固定） |

**置換可能: 1.3 = 2件のみ**

### 2-4. box-shadow 集計（約35件）

| パターン | 件数 | DS対応 | 判定 |
|---------|------|--------|------|
| `0 1px 3px rgba(0,69,84,0.06)` | 1 | △ `--elevation-1`（値は `1px 2px`）| 近似置換・要検討 |
| `0 4px 16px rgba(0,0,0,0.12)` | 2 | △ `--elevation-3` 近似 | 色ブランド不一致で保留 |
| `0 4px 12px rgba(0,0,0,0.12)` | 1 | △ 同上 | 保留 |
| `0 8px 24px rgba(0,69,84,0.25)` | 1 | △ `--elevation-4`（0.14）| 透明度異なる・保留 |
| `0 8px 24px rgba(0,69,84,0.18)` | 1 | △ `--elevation-4` 近似 | 保留 |
| `0 10px 40px rgba(0,69,84,0.15)` | 1 | ✕ | DS外・維持 |
| `0 10px 40px rgba(0,0,0,0.15)` | 1 | ✕ | DS外・維持 |
| `0 0 0 2/3px var(--accent-primary-dim)` | 8 | ✕ | フォーカスリング（専用値） |
| `inset 0 0 0 Npx ...` | 6+ | ✕ | 内側枠線用途・維持 |
| `0 2px 8px rgba(68,166,181,0.3)` | 1 | ✕ | hover強調・維持 |
| `0 1px 4px / 2px 8px rgba(0,0,0,...)` | 2 | △ | 保留 |
| keyframes 内 `box-shadow` | 8+ | ✕ | アニメ専用・維持 |

**結論: box-shadow はブランド色 `rgba(0,69,84,*)` と汎用 `rgba(0,0,0,*)` が混在し、`--elevation-*` は前者ベース。色違いのものを機械置換すると見た目が変わる。M-A3 では置換しない。Phase M-D（影統合）で設計する。**

### 2-5. transition 集計（約45件）

| duration | 件数 | DS対応 | 判定 |
|----------|------|--------|------|
| `0.1s / 100ms` | 7 | ✕（DS最小=120ms）| 近似・維持 |
| `0.15s / 150ms` | 28 | ✕（DS無し、fast=120ms 近似）| 近似・維持 |
| `0.2s / 200ms` | 5 | ◯ `--duration-base` | **置換候補** |
| `0.25s / 250ms` | 1 | ✕ | DS外・維持 |
| `0.3s / 300ms` | 2 | ✕ | DS外・維持 |
| `0.35s / 350ms` | 1 | △ `--duration-slow`(320ms)近似 | 保留 |

**置換可能: 200ms = 5件のみ。0.15s が支配的だが DS と 30ms 差があるため M-D で統合方針を決める。**

### 2-6. animation 集計

| 値 | 件数 | 判定 |
|----|------|------|
| `0.3s ease-out` | 1 | DS外・維持 |
| `0.35s ease-out` | 1 | DS外・維持 |
| `1.2s ease-in-out` | 3 | DS外・維持（セル発光） |
| `1.5s ease` | 1 | DS外・維持 |

**置換不可（アニメ固有の長さ）**

### 2-7. font-family 調査

| 行 | 値 | 判定 |
|----|----|------|
| 32 (body) | `var(--font-family-body)` | ◯ M0-4 適用済 |
| 552 | `inherit` | ◯ 正常 |
| 810 | `inherit` | ◯ 正常 |
| 891 | `inherit` | ◯ 正常 |
| 1683 | `monospace` | ✕ タイムラインの時刻表示用・意図的 |

**`monospace` 固定は 1件のみ。`tabular-nums` が body で効くため、本来は不要の可能性あり。M-A3 では現状維持・M-C/M-D で再評価。**

### 2-8. 総括

| 区分 | 件数 |
|------|------|
| 置換可能（DS完全一致） | **約142件**（font-size 67 + font-weight 68 + line-height 2 + transition 5） |
| 要判断（近似 / DS無し） | **約50件**（shadow 大半、line-height 1.6、transition 0.35s 等） |
| DS外で維持必須 | **約80件**（極小サイズ、フォーカスリング、アニメ専用、monospace） |

---

## 3. テストチェックリスト（18項目）

| # | 区分 | 項目 | 確認方法 | 合格基準 |
|---|------|------|----------|----------|
| 1 | A | body の `font-family` が `var(--font-family-body)` である | order-book.css 行32 | 一致 |
| 2 | A | body / html に `font-feature-settings: "palt"` が設定されている | M0-4 commit / 実機DevTools | 設定あり |
| 3 | A | body / html に `font-variant-numeric: tabular-nums` が設定されている | 同上 | 設定あり |
| 4 | A | OB の `:root` で `--font-family-body` を**再定義していない** | order-book.css 頭部確認 | 再定義なし |
| 5 | A | OB 内で body 以外に `font-family: <具体名>` が注入されていないこと（`inherit` / `monospace` を除く） | Grep `font-family` | 5件のみ（body 1 / inherit 3 / monospace 1） |
| 6 | A | `monospace` 指定箇所（行1683 付近）が意図的なものであることをコメントで示す（または将来タスクに記録） | 棚卸表 2-7 | 記録済み |
| 7 | E | テーブル数値セルが**等幅表示**になっている（tabular-nums の body 継承） | 実機で受注簿テーブル確認 | 1/7/0/8 等の数字幅が同じ |
| 8 | E | 見出し・日本語部分で `palt` による詰めが効いている | 実機で行幅を M0-3 前後比較 | 詰まっている |
| 9 | G | font-size ハードコード棚卸（DS一致 / DS外）件数が本書と一致 | Grep 再実行 | ±2件以内 |
| 10 | G | font-weight 全件が DS の 5段階（400/500/600/700/800）に収まる | Grep `font-weight:` | 逸脱ゼロ |
| 11 | G | line-height ハードコード棚卸で DS一致は `1.3` のみと確認 | Grep `line-height:` | 一致 |
| 12 | G | box-shadow 独自値の棚卸表（2-4）が網羅されている | 再Grep | 件数一致 |
| 13 | G | transition の 0.15s 支配現象が文書化されている | 棚卸表 2-5 | あり |
| 14 | G | M-A3 で置換する範囲が「棚卸のみ」と明記されている | 本書・sc | 明記あり |
| 15 | G | M-C/M-D に委譲する項目リストが作成されている | 下記 §5 | あり |
| 16 | E | M-A3 で CSS に機械置換コミットを行った場合、ビジュアル差分ゼロを目視確認 | 実機 before/after | 差分なし |
| 17 | A | M-A1/M-A2 の成果（OB `:root` 13変数・本文の新DS参照）が退化していない | 再Grep | 退化なし |
| 18 | A | `docs/ui-components/styles-light.css` の `--fs-* / --fw-* / --lh-* / --duration-* / --elevation-*` の定義値が本書棚卸時点と一致 | 行71-120 | 一致 |

---

## 4. 重大 Claim（0件必須）

以下が1件でも発生したら **即不合格**：

| # | Claim | 内容 |
|---|-------|------|
| C1 | font-family 逆行退化 | body の `var(--font-family-body)` が `system-ui` 等のハードコードや旧 `--font-family` に戻っている |
| C2 | palt / tabular-nums 削除 | M0-4 で入れた `font-feature-settings` / `font-variant-numeric` が body/html から消えている |
| C3 | 意図しない font-family 注入 | body 以外に新規の `font-family: <具体名>` が混入（`inherit` / 既存の `monospace` 1件を除く） |
| C4 | OB `:root` 変数再定義 | M-A1 で削除した `--font-*` 系変数が OB 側で復活 |
| C5 | DS定義との乖離 | `--fs-caption=11px / --fs-sm=13px / --fs-base=14px / --fs-md=16px / --fs-lg=20px` の定義自体が書き換えられている |

---

## 5. Phase M-C / M-D への委譲リスト

M-A3 で扱わず、後続フェーズで決定する項目：

### M-C（テーブル密度統合）に委譲
- DS外の極小 font-size（7/8/9/10/12/12.5px）の扱い → 密度トークン `--density-xs/sm/md` の新設 or 例外許容
- line-height 1.2 / 1.4（セル高さ最適化用）の扱い
- `monospace` 1件 の要否再評価（tabular-nums が body で効くなら削除可能か）

### M-D（影・モーション統合）に委譲
- box-shadow の `rgba(0,69,84,*)` と `rgba(0,0,0,*)` の混在解消（ブランド色ベースへ統一）
- `--elevation-*` のバリエーション追加（透明度違い 0.18/0.25 等が本当に必要か）
- transition の 0.15s 支配を `--duration-fast`(120ms) へ統一するか、`--duration-150` を新設するか
- keyframe 内の `box-shadow` の `--elevation` 置換可否

---

## 6. 合格条件

- **スコア 70点以上 かつ 重大Claim 0件**
- 成果物: 本書（TD v1）+ Scorer（SC）+ Test Executor（TE）レポート
- M-A3 のコミット内容は**棚卸結果の記録のみ** or **極小範囲の機械置換のみ**に限定

---

以上。
