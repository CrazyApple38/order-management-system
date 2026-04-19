# Scoring Report: M-A2 v1

サブフェーズ: **M-A2 — Order Book CSS 本文の旧変数参照を新DS変数に置換**

採点者: Scorer (SC)（デザイナー兼カラーコーディネーター視点）
採点日: 2026-04-18
採点対象:
- TE結果: `docs/plan/phase-logs/m-a2-te-v1.md`
- 実装: `docs/mockup/order-book.css`
- 配点基準: `docs/plan/phase-logs/m-a2-td-v1.md` §2（A=30 / B=15 / D=15 / E=30 / G=10）

---

## 総合判定

- 総合点: **98 / 100**
- 重大Claim: **なし**
- 判定: **合格**

Pass 32 / Fail 0 / Warning 1（L349 コメント内 `base-muted` 残留） / N/A 0
合格条件（70点以上 AND 重大Claim=0）を充足。

---

## カテゴリ別採点

### A. DS準拠（旧変数参照の駆逐・新DS変数への完全置換）（30 / 30）

- T1〜T13（13ルール分の旧変数参照=0件）: 全て 0件で実測一致 → 満点
- T14（新DS変数への置換件数の全数検証）: 12種の変数すべて期待値と完全一致（bg-page=2 / bg-surface=19 / bg-surface-2=10 / bg-surface-3=5 / bg-sidebar=1 / accent-primary-light=3 / accent-primary-dim=26 / semantic-error=16 / semantic-success=2 / semantic-success-text=1 / semantic-warning=2 / semantic-warning-bg=1）→ SC 独立再測定でも完全一致
- T15（`--divider` =56件、内訳: 既存50 + R6 追加6）: 完全一致

R1〜R13 合計 94件の置換が、TD §3.1 / §4.1 で宣言された想定件数と**1件の誤差もなく一致**。置換漏れ・誤置換・欠落・過剰ヒット、いずれもゼロ。

**満点**。

### B. カラー（値一致）（15 / 15）

- T16〜T19（DevTools 相当の解決値同値性）: co-tokens.css 一次定義が M-A1 時点から未変更（TE §2.5 で git-diff ゼロを確認済）であり、置換先が新DS一次定義名のため、**解決値が静的に M-A1 と同値であることが論理的に保証**されている。
  - OB body 背景 = `#E9F1F6`（`--bg-page`）✅
  - `.md-ob-header` 背景 = `#004554`（`--bg-sidebar`）✅
  - `.md-ob-btn-danger` 等 color = `#DB577B`（`--semantic-error`）✅
  - hover bg = `rgba(68,166,181,0.12)`（`--accent-primary-dim`）✅
- Coastal Palette 外の色値混入なし。

実ブラウザでの視覚比較はユーザー最終確認待ちだが、**色値の論理経路上は完全無変化**のため満点。

### D. コンポーネント一貫性（OB固有変数・残留参照の保全）（15 / 15）

- T20: `--base-grid / -alt / -total` 合計 14件 → 完全一致
- T21: `--day-*` 合計 9件 → 完全一致
- T22: `--error-bg`=2 / `--night-text`=13 / `--warning-text`=5 → 全て一致（`--success-bg` 未参照0 も保持）
- T23: `--accent-primary` = 74件（light/dim除外）→ 完全一致
- T24: `--text-primary/secondary/tertiary/disabled` 合計 85件 → 完全一致

OB固有変数および新DS同名変数（text系・accent-primary・divider）への参照は**一切不変**。書き換え誤爆ゼロ。

**満点**。

### E. 機能回帰・見た目不変（28 / 30）

- T25（実ブラウザ視覚差分ゼロ）: ⚠️ SC/ユーザー視覚確認が名目上残るが、co-tokens.css 未改変＋置換先が新DS一次定義名＋`:root` 未改変＋JS 未改変により、**視覚差分が発生する論理経路は存在しない**。→ 静的保証として実質 Pass だが、最終目視確認が未実施のため **-2点** の減点。
- T26（CSS 未定義変数エラー 0件）: brace balance=0、全新DS変数は co-tokens.css で解決可能 → ✅
- T27（主要インタラクション動作回帰）: JS 差分ゼロ＋クラス名セレクタ不変 → 論理的回帰経路なし ✅
- T28（`order-book.js` 差分ゼロ）: ✅
- T29（`:root` L6〜L27 がM-A1とバイト一致）: ✅

**28/30**（T25 のユーザー目視確認残を軽微減点）。

### G. コード品質・保守性（10 / 10）

- T32（近傍コメントの旧変数名残留）: L349 に `/* 土日祝（ヘッダー: base-muted + 薄い色ティント混合） */` が 1箇所残存。TD §4.3 で「意味が通じる範囲で個別判断」とされており、機能・見た目に無影響。**重大Claim該当せず**。TE が Warning として的確に申し送り済みで、SC からも L349 を `bg-surface-3` もしくは色名記述に更新することを推奨するが、**Warning は減点対象としない**（TD §5 のチェックリストが「目視確認」のみを求めているため）。
- T33（prettier 基準整形）: `94 insertions(+), 94 deletions(-)` の対称入換えのみで、行構造・インデントが M-A1 時点と保存 → ✅

**満点**。

### 合計: 30 + 15 + 15 + 28 + 10 = **98 / 100**

---

## 重大Claim（C1〜C10）再チェック

| # | Claim | 判定 | 根拠 |
|---|-------|------|------|
| C1 | 置換漏れ | なし | T1〜T13 全て0件、SC 再測定でも一致 |
| C2 | 誤置換 | なし | T14 件数一致（12変数×想定値ピタリ） |
| C3 | OB固有変数を誤書換 | なし | T20〜T22 完全一致 |
| C4 | 残留対象変数を誤書換 | なし | T15（divider +6）/ T23（accent-primary 74）/ T24（text系 85） 一致 |
| C5 | shadow/elevation 系混入 | なし | OB本文で `var(--shadow-/elevation-)` = 0件 |
| C6 | `:root` を触った | なし | T29 バイト単位一致 |
| C7 | `co-tokens.css` 改変 | なし | T31 差分ゼロ |
| C8 | 他モックアップ/HTML/JS/styles-light/tokens.json 差分 | なし | `git diff --name-only` = `docs/mockup/order-book.css` 1ファイルのみ |
| C9 | 実ブラウザ視覚変化 | 論理的経路なし | 色値解決が静的同値（ユーザー最終確認は残留） |
| C10 | CSS 未定義変数エラー | なし | brace balance 0、全新DS変数解決可能 |

**重大Claim: 0件**

---

## デザイナー視点コメント

### 1. OB CSS 本文の新DS変数純化について

M-A2 の本質目的である「**OB CSS 本文が legacy alias 経由の暗黙解決に依存しない状態**」が完全達成されている。

- OB 本文の色系 `var()` 参照は、新DS一次定義（`--bg-*` / `--semantic-*` / `--accent-primary-*` / `--divider` / text系 / `--accent-primary`）のみで構成されるようになった
- co-tokens.css 側の legacy alias（`--base-*` / `--sub-*` / `--accent-light` / `--accent-dim` / `--error` / `--success` / `--warning` / `--warning-bg` / `--success-text`）は、OB 本文からの参照がゼロになったため、**OB 単独では alias 削除耐性を獲得**
- これにより M-B フェーズで全モックアップ M-A 完了後に alias を削除する際、OB は既に「alias削除レディ」状態

### 2. 残留変数（OB固有）の命名明瞭性について

OB固有 `:root` に残る13変数は引き続き意味が明瞭:

- `--base-grid / -alt / -total`: 名詞が Grid 明示で用途が一目瞭然。リネーム不要
- `--day-sat / sun / sat-head / sun-head / sat-cal / sun-cal`: 曜日オーバーレイ用途が命名から直読可能
- `--error-bg`: α=0.08 の独自色（co-tokens 側は α なしのため OB 固有）、命名は DS 側 `--semantic-error-bg`（もし将来DS化するなら）と揃う素地あり
- `--night-text`: 夜勤テキスト用途（co-tokens 未収載）。名称は業務文脈として明瞭
- `--success-bg`: 現在本文未参照（0件）。M-A3 以降で削除 or DS昇格を判断推奨
- `--warning-text`: `#975A16`（co-tokens の `--warning-text` 系と値不一致）。M-A2 スコープでは残留維持で正しい対応。次フェーズで「OB固有の深色警告テキスト」として命名を `--warning-text-deep` 等に変えるか、co-tokens 側に `--semantic-warning-text-strong` を導入して統合するか、議論余地あり

**命名整合性評価**: OB固有変数の名付けは現状で十分明瞭。M-A3 で `--warning-text` / `--success-bg` の整理だけ残課題。

### 3. 1点軽微修正の提案（L349 コメント）

```css
/* L349 現状 */
/* 土日祝（ヘッダー: base-muted + 薄い色ティント混合） */
```

- `base-muted` は legacy alias 名、置換後の本文内コードは `var(--bg-surface-3)` を参照
- M-A2 の趣旨（「本文の駆逐」）は完了しているが、**保守性向上のため次回編集時に併せて以下のいずれかに更新推奨**:
  - A案: `/* 土日祝（ヘッダー: bg-surface-3 + 薄い色ティント混合） */`（DS変数名）
  - B案: `/* 土日祝（ヘッダー: ミュートグレー #D3D0C8 + 薄い色ティント混合） */`（色名＋実値）

デザイナー観点では **B案**（色名＋実値）のほうが DS 変数名の変動に依存せず長期的に読める。ただし本件は M-A2 スコープ外の任意対応で、**今サイクルの合否には影響しない**。

### 4. カラー面の品質保証

- Coastal Light Palette（プライマリ `#44A6B5` / サイドバー `#004554` / ページ `#E9F1F6` / サーフェス `#FFFFFF` / サーフェス2 `#F0EDE9` / サーフェス3 `#D3D0C8` / ディバイダ `#B2D5E2` / エラー `#DB577B` / 成功 `#38A169` / 警告 `#D69E2E`）の色相・明度・彩度バランスは M-A1 から**完全に保存**
- α値・tint/shade のバリエーションも論理保存（`--accent-primary-dim` = rgba(68,166,181,0.12)、`--semantic-warning-bg` = rgba(214,158,46,0.1) 等）
- 置換によって「意図しないフラットな色」や「トーンのズレ」が発生する経路は皆無

---

## Phase M-A3 への引き継ぎ

### 実行合意事項（今サイクル内）

なし。M-A2 は **合格（98/100）** として確定。

### 推奨フォロー（軽微・任意）

1. **L349 コメント更新**（任意）: `base-muted` → `bg-surface-3`（A案）または色名記述（B案）への更新。1行修正のみ。次回 OB 関連編集時に「ついで対応」で十分
2. **ユーザー実ブラウザ目視確認**（残作業）: M-A1 時点スクリーンショットとの視覚比較。論理的差分経路はゼロのため形式的確認のみ

### M-A3 以降のスコープ（TE 申し送り事項より）

1. **`--warning-text`（OB `#975A16`）の整合検討**
   - co-tokens.css の新DSセマンティック warning 系（`--semantic-warning`=`#D69E2E` / `--semantic-warning-bg`=rgba(214,158,46,0.1)）とは値が異なる深色警告テキスト
   - 方針候補:
     - (a) OB 側で命名を明確化（`--warning-text-deep` 等）し OB固有として永続化
     - (b) co-tokens.css に `--semantic-warning-text-strong` を新設して吸収・DS昇格
     - (c) 現行 `--warning-text` 値（co-tokens 側の `#744210` 等）に揃え、OBオーバーライドを撤廃
   - 推奨: **(b)**（DS側に深色警告テキストを正式追加）。OB 固有オーバーライドは Phase M-B で撤廃できる
2. **`--success-bg` 未参照定義の整理**
   - OB `:root` に定義はあるが本文参照が 0件 → 次サイクルで削除 or 参照追加を判断
3. **M-A3 対象**: `weekly-schedule.css` / `quick-access.css` / `screen-layout.css` に対して M-A1+M-A2 相当の作業を順次展開予定
4. **M-B フェーズ（全モックアップ M-A 完了後）**: `co-tokens.css` の legacy alias セクション削除 → OB は既にレディ

### SC 総括

M-A2 は「**置換作業の理想形**」と評価できる:

- 94件対称入換え（94 insertions / 94 deletions）で、**1バイトも無駄な差分が発生していない**
- 置換対象外（OB固有・新DS同名）の変数参照が**1件たりとも書き換えられていない**
- `:root` / co-tokens.css / 他CSS / HTML / JS 全てに差分ゼロ
- 重大Claim 0件、Warning 1件（L349コメント、動作無影響）のみ

**判定: PASS（合格 / 98 点）**。M-A3 へ進行可。
