# M-A3 Test Execution（TE v1）— OB フォント/影/モーション 棚卸検証

担当: Test Executor (TE)
対象: `docs/mockup/order-book.css`（1870行）
TD参照: `docs/plan/phase-logs/m-a3-td-v1.md`
採用方針: **案1（保守的・調査重視）** — IMは実装変更なし、TD文書の棚卸が成果物

---

## 0. ベースライン確認

### 0-1. git状況
- 現在 HEAD: `b0b7bdb refactor(ds-migration): Phase M-A1 OB :root を co-tokens.css 参照に置換`
- Working copy に M-A2（未コミット）の token rename 差分あり
- `git diff HEAD -- docs/mockup/order-book.css` の内容:
  - `--base-page → --bg-page`
  - `--sub-primary → --bg-sidebar`
  - `--base-surface → --bg-surface`
  - `--accent-dim → --accent-primary-dim`
  - `--sub-secondary → --divider`
  - `--error → --semantic-error`
  - `--accent-light → --accent-primary-light`
- **フォント/影/モーション関連のプロパティ変更はゼロ** → M-A3 で OB CSS 本文の実装変更ゼロという宣言に整合

### 0-2. 事前 Grep 実測値（カウント）

| プロパティ | 実測件数 |
|------------|----------|
| font-family | 5（body var + inherit 3 + monospace 1） |
| font-size | 125（行単位カウント） |
| font-weight | 75 |
| line-height | 18 |
| box-shadow | 41 |
| transition | 52 |

---

## 1. チェックリスト検証結果（T1〜T18）

### T1 ✅ PASS — body の `font-family` が `var(--font-family-body)`
- `order-book.css:32` に `font-family: var(--font-family-body);` を確認
- M0-4 での適用がそのまま維持

### T2 ✅ PASS — body に `font-feature-settings: "palt" 1`
- `order-book.css:33` に定義あり
- 参考: `styles-light.css:181` にも定義（OB は body 継承のみで独自設定を保持）

### T3 ✅ PASS — body に `font-variant-numeric: tabular-nums`
- `order-book.css:34` に定義あり
- 参考: `styles-light.css:182` にも定義

### T4 ✅ PASS — OB `:root` で `--font-family-body` を再定義していない
- `order-book.css:6-27` の `:root` を確認。`--font-*` 系トークン定義なし
- 参照先 `co-tokens.css:81` が唯一の定義源

### T5 ✅ PASS — body 以外で font-family 具体名指定が限定的（5件のみ）
- 実測:
  - 行32: `var(--font-family-body)` (body)
  - 行552: `inherit`
  - 行810: `inherit`
  - 行891: `inherit`
  - 行1683: `monospace`
- TD棚卸（2-7）と完全一致（5件）

### T6 ✅ PASS — `monospace` 指定（行1683）が意図的であることが棚卸表 2-7 で記録済み
- TD v1 §2-7 に「タイムラインの時刻表示用・意図的」と明記
- §5（M-C/M-D 委譲）に「`monospace` 1件 の要否再評価」として登録済み

### T7 🔸 N/A — 実機目視検証項目（数値の等幅表示）
- 静的コード検証では判定不可（ブラウザ実行が必要）
- body に `tabular-nums` が設定されているため、実装上は有効

### T8 🔸 N/A — 実機目視検証項目（palt 詰め効果）
- 静的コード検証では判定不可（ブラウザ実行が必要）
- body に `font-feature-settings: "palt" 1` が設定されているため、実装上は有効

### T9 ❌ FAIL — font-size 棚卸件数が現在の Grep 結果と乖離（±2件以内の合格基準に不適合）

| 値 | TD棚卸 | 実測 | 差分 | 判定 |
|----|--------|------|------|------|
| 7px | 3 | 3 | 0 | ✅ |
| 8px | 1 | 1 | 0 | ✅ |
| 9px | 4 | 4 | 0 | ✅ |
| 10px | 11 | 14 | +3 | ⚠️ |
| 11px | 23 | 31 | **+8** | ❌ |
| 12px | 22 | 30 | **+8** | ❌ |
| 12.5px | 1 | 1 | 0 | ✅ |
| 13px | 15 | 22 | **+7** | ❌ |
| 14px | 7 | 9 | +2 | ✅ |
| 15px | 2 | 2 | 0 | ✅ |
| 16px | 2 | 2 | 0 | ✅ |
| 18px | 4 | 4 | 0 | ✅ |
| 19px | 2 | 2 | 0 | ✅ |

- **置換可能（11/13/14/16px）合計: TD 47件 → 実測 64件（Δ+17）**
- **DS外（7/8/9/10/12/12.5/15/18/19px）合計: TD 50件 → 実測 60件（Δ+10）**
- TD 文書の集計（DS置換候補 約67件）と実測が乖離しているが、TD は採用方針（案1：置換しない）のため実装には影響しない。**棚卸表の数値更新が必要**

### T10 ✅ PASS — font-weight 全件が DS 5段階に収まる

| 値 | TD棚卸 | 実測 | 判定 |
|----|--------|------|------|
| 400 | 4 | 6 | ⚠️（+2、許容内） |
| 500 | 14 | 17 | ⚠️（+3、許容外だが DS一致） |
| 600 | 36 | 38 | ✅ |
| 700 | 14 | 14 | ✅ |
| 800 | 0 | 0 | ✅ |

- **DS逸脱ゼロ**（100/300/900 など存在なし）→ 合格基準「逸脱ゼロ」を満たす
- 件数差（500: Δ+3）は棚卸表更新対象だが、T10 の合格基準は「5段階に収まるか」なので **PASS**

### T11 ✅ PASS — line-height で DS一致は `1.3` のみと確認

| 値 | TD棚卸 | 実測 | 判定 |
|----|--------|------|------|
| 1 | 9 | 10 | ⚠️（+1） |
| 1.1 | 1 | 1 | ✅ |
| 1.2 | 2 | 2 | ✅ |
| 1.3 | 2 | 2 | ✅ |
| 1.4 | 1 | 1 | ✅ |
| 1.6 | 1 | 1 | ✅ |
| 28px | 1 | 1 | ✅ |

- DS `--lh-tight=1.3` に一致するのは 2件のみ → TD 記述と一致 → **PASS**

### T12 ⚠️ WARNING — box-shadow 棚卸件数が TD見積（約35件）に対して実測41件（差分+6、棚卸表 2-4 の合計と近似だが項目別検証が粗い）
- TD 2-4 の小計: 1+2+1+1+1+1+1+8+6+1+2+8 = 33件 → 実測 41件（Δ+8）
- 主要カテゴリ（focus-ring 8、inset 6+、keyframes 8+）の網羅性は維持されているが、件数精度は低い
- 採用方針「M-A3 では置換しない」なので棚卸の質的網羅性は合格レベル → **WARNING**（棚卸表の精緻化推奨）

### T13 ✅ PASS — transition の 0.15s 支配現象が文書化されている
- TD §2-5 に「0.15s が支配的」と明記
- 実測値: 0.15s = 37件（TD棚卸 28件、Δ+9）、0.2s = 5件（TD一致）
- 件数差はあるが支配現象の文書化は OK → **PASS**

### T14 ✅ PASS — M-A3 の置換範囲を「棚卸のみ」と明記
- TD §1 採用方針で「軽微な置換のみ」「越権は避ける」と明記
- TD §6 合格条件で「コミット内容は棚卸結果の記録のみ」と明記

### T15 ✅ PASS — M-C / M-D への委譲リスト作成
- TD §5 に委譲項目リスト完備
  - M-C: DS外極小 font-size、line-height 1.2/1.4、monospace 要否
  - M-D: box-shadow 色混在解消、elevation バリエーション、transition 0.15s 統一、keyframe box-shadow 置換

### T16 🔸 N/A — M-A3 で CSS 機械置換コミットなし
- 採用方針「案1」により OB CSS 本文の変更ゼロ
- ビジュアル差分比較対象が存在しないため N/A

### T17 ✅ PASS — M-A1/M-A2 成果が退化していない
- OB `:root`（行6-27）に `--font-*` / `--fs-*` / `--fw-*` / `--lh-*` / `--duration-*` / `--elevation-*` 系の再定義ゼロ
- 本文は `var(--font-family-body)`, `var(--bg-page)`, `var(--text-primary)` 等 DS参照のみ
- M-A2 の色トークン名移行（`--base-page → --bg-page` 等）も維持
- 重大Claim C1〜C4 該当なし

### T18 ✅ PASS — `styles-light.css` の DS 定義値が棚卸時点と一致
- `styles-light.css:85-91`（Typography Scale）:
  - `--fs-caption: 11px` ✅
  - `--fs-sm: 13px` ✅
  - `--fs-base: 14px` ✅
  - `--fs-md: 16px` ✅
  - `--fs-lg: 20px` ✅
  - `--fs-xl: 26px` ✅
  - `--fs-2xl: 34px` ✅
  - **補足**: TD §2-1 で「DS 6段階（11/13/14/16/20/26/34）」と記載あるが実際は **7段階**（caption を含む）。値自体は一致、段階数表記のみ軽微な齟齬 → 棚卸表の表記修正推奨
- `styles-light.css:94-98`（Font weights）: 400/500/600/700/800 全て ✅
- `styles-light.css:71-73`（Line height）: 1.3/1.5/1.7 ✅
- `styles-light.css:104-108`（Duration）: 0/120/200/320/480ms ✅
- `styles-light.css:115-120`（Elevation）:
  - `--elevation-1: 0 1px 2px rgba(0,69,84,0.06)` — TD §2-4 で「`1px 2px`」と記載済み、一致
  - `--elevation-2〜5` 全て一致 ✅
- 重大Claim C5 該当なし

---

## 2. 重大 Claim 判定（0件必須）

| # | Claim | 判定 | 根拠 |
|---|-------|------|------|
| C1 | font-family 逆行退化 | ✅ 該当なし | 行32 で `var(--font-family-body)` 維持 |
| C2 | palt / tabular-nums 削除 | ✅ 該当なし | 行33-34 に設定存続 |
| C3 | 意図しない font-family 注入 | ✅ 該当なし | 具体名は `monospace`（1683）のみ、TD記録済み |
| C4 | OB `:root` 変数再定義 | ✅ 該当なし | OB `:root` に `--font-*` / `--fs-*` / `--fw-*` 等なし |
| C5 | DS 定義との乖離 | ✅ 該当なし | `styles-light.css` の DS 値は TD 記載と一致 |

**重大 Claim: 0件** → 合格条件「重大Claim 0件」を満たす

---

## 3. 推奨アクション（TD棚卸表の更新）

M-A3 の成果物としての TD 文書を次回更新する際、以下を反映すること（実装変更は不要）:

### 3-1. TD §2-1 font-size 集計表の件数更新
- 10px: 11 → **14**（+3）
- 11px: 23 → **31**（+8）
- 12px: 22 → **30**（+8）
- 13px: 15 → **22**（+7）
- 14px: 7 → **9**（+2）
- 置換可能合計: 約67 → **約82件**
- DS外合計: 約50 → **約60件**

### 3-2. TD §2-1 見出しの段階数表記修正
- 「DS 6段階（11/13/14/16/20/26/34）」→ **「DS 7段階（11/13/14/16/20/26/34、うち caption/sm/base/md/lg/xl/2xl）」**

### 3-3. TD §2-2 font-weight 集計表の件数更新
- 400: 4 → **6**（+2）
- 500: 14 → **17**（+3）
- 600: 36 → **38**（+2）
- 合計: 約68 → **約75件**

### 3-4. TD §2-3 line-height 集計表の件数更新
- `1`: 9 → **10**（+1）

### 3-5. TD §2-4 box-shadow 集計表の件数更新
- 合計見積を「約35件」→ **「約41件」** に修正（個別パターンの精緻化は M-D で）

### 3-6. TD §2-5 transition 集計表の件数更新
- 0.15s/150ms: 28 → **37**（+9）
- 0.1s/100ms: 7 → **9**（+2）
- 0.3s/300ms: 2 → **4**（+2）
- 0.35s/350ms: 1 → **0**（-1、現在ファイルから消失）

---

## 4. スコア試算（TD §1 配点に基づく）

| 区分 | 配点 | 獲得 | 根拠 |
|------|------|------|------|
| A 合意事実（body 継承・DS準拠） | 40 | **40** | T1-T6, T17, T18 全て PASS、重大Claim 0件 |
| G ガバナンス（棚卸完了・Phase委任） | 30 | **22** | T14-T15 満点、T9 件数乖離 / T12 件数精度粗 / T13 件数乖離で減点8 |
| E 見た目不変（置換しても差分ゼロ） | 30 | **30** | T7/T8/T16 は N/A だが M-A3 で CSS 変更なし＝差分ゼロ自明 |
| **合計** | **100** | **92** | **合格（70点以上 AND 重大Claim 0件）** |

---

## 5. 最終集計

- **Pass: 11**（T1, T2, T3, T4, T5, T6, T10, T11, T13, T14, T15, T17, T18 の 13項目）
  - 訂正: 13項目
- **Fail: 1**（T9 — font-size 棚卸件数の乖離が許容外）
- **Warning: 1**（T12 — box-shadow 件数精度が粗い）
- **N/A: 3**（T7, T8, T16 — 実機目視 or 変更なしのため判定不可）

**合計 18項目 = Pass 13 / Fail 1 / Warning 1 / N/A 3**

### 合否判定
- スコア: **92点**（≥70）
- 重大Claim: **0件**
- → **合格**（TD文書の件数更新を推奨アクションとして付記、実装変更不要）

---

以上。
