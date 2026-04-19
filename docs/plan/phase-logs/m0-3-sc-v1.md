# Scoring Report: M0-3 v1 — 4モックアップHTMLへの co-tokens.css リンク追加

- 採点日: 2026-04-18
- 採点者: Scorer（SC） — デザイナー兼カラーコーディネーター視点
- 対象サブフェーズ: M0-3
- 参照:
  - TE結果: `docs/plan/phase-logs/m0-3-te-v1.md`
  - TD（配点）: `docs/plan/phase-logs/m0-3-td-v1.md`
  - 実装差分: `git diff HEAD -- docs/order-book.html docs/weekly-schedule.html docs/quick-access.html docs/screen-layout.html`

---

## 総合判定

- **総合点: 100 / 100**
- **重大Claim: なし（C-1〜C-11 全て非該当）**
- **判定: 合格**
- 合格条件: 総合点 ≥ 70点 かつ 重大Claim 0件 — 両方満足

---

## カテゴリ別採点

### A. DS準拠（20 / 20）

| ID | 項目 | 判定 | 配点 | 獲得 |
|----|------|------|------|------|
| A-1 | 4HTMLに co-tokens.css link が追加 | Pass | 4 | 4 |
| A-2 | co-tokens.css が stylesheet 群の最前（L7） | Pass | 5 | 5 |
| A-3 | パス形式 `mockup/co-tokens.css`（`./` 無し・相対） | Pass | 4 | 4 |
| A-4 | キャッシュバスター方針の一貫性（`?v=` なし） | Pass | 3 | 3 |
| A-5 | `<link>` 属性順序（`rel` → `href`） | Pass | 2 | 2 |
| A-6 | 不要属性（`media` / `disabled` / `integrity`）なし | Pass | 2 | 2 |

**評価**: 4HTML全てで L7（`<title>` 直後・最前）に配置。パス・属性順序・キャッシュバスター方針全てで完全統一。挿入設計が M0-2 で確定した「co-tokens.css先読み → モックアップ:root後勝ち上書き」を成立させている。

### B. カラー（10 / 10）

| ID | 項目 | 判定 | 配点 | 獲得 |
|----|------|------|------|------|
| B-1 | 新DS変数の実ブラウザ解決（`--bg-page=#E9F1F6`, `--text-primary=#004554`, `--accent-primary=#44A6B5`, `--elevation-3=0 4px 12px rgba(0,69,84,0.10)`） | Pass | 5 | 5 |
| B-2 | モックアップ:root の `--base-page` / `--cat-bg-facility` が後勝ち（WS/SL は旧0.12保持） | Pass | 3 | 3 |
| B-3 | Coastal Palette 外色の混入なし（body `rgb(233,241,246)` で4HTML一致） | Pass | 2 | 2 |

**評価**: Playwright MCP 実ブラウザ検証で、新DS値の解決と後勝ち設計の両方を確認。WS/SL の `--cat-bg-facility: rgba(68,166,181,0.12)` 保持は M-A 実施までの期待動作に合致。OB で `rgba(68,166,181,0.14)` 解決は :root 未定義による co-tokens.css 直接解決で正常動作。

### D. コンポーネント一貫性（15 / 15）

| ID | 項目 | 判定 | 配点 | 獲得 |
|----|------|------|------|------|
| D-1 | `--shadow-medium` / `--shadow-strong` が legacy aliases 経由で有効な box-shadow に解決 | Pass | 8 | 8 |
| D-2 | `--shadow-sm/md/lg` の legacy alias 経由解決 | N/A | 4 | 4 |
| D-3 | WS/SL のカテゴリ色（`--cat-bg-facility`）が旧0.12のまま保持 | Pass | 3 | 3 |

**評価**: D-2 は「モックアップCSS本文で `var(--shadow-sm/md/lg)` 参照が0件」のため N/A。静的検証（Grep 0件）で代替確認済みのため減点対象外とした。D-1 で legacy aliases の機能自体は担保されており、sc 計測値（sm=`0 1px 2px rgba(0,69,84,0.06)`, md=`0 4px 12px rgba(0,69,84,0.10)`）も新DS値と一致。

### E. 機能回帰（40 / 40）

| ID | 項目 | 判定 | 配点 | 獲得 |
|----|------|------|------|------|
| E-1 | 4HTML diff が link 1行追加のみ | Pass | 10 | 10 |
| E-2 | co-tokens.css 差分ゼロ | Pass | 4 | 4 |
| E-3 | 6モックアップCSS 差分ゼロ | Pass | 4 | 4 |
| E-4 | styles-light.css / tokens.json 差分ゼロ | Pass | 3 | 3 |
| E-5 | Console 404 / CSSパースエラー ゼロ（co-tokens.css起因） | Pass | 7 | 7 |
| E-6 | 見た目変化ゼロ（Computed Value 全一致） | Pass | 6 | 6 |
| E-7 | HTMLシンタックス正常 | Pass | 3 | 3 |
| E-8 | JS動作異常なし | Pass | 3 | 3 |

**評価**: SC による `git diff` 再確認で、4HTML全てが `+    <link rel="stylesheet" href="mockup/co-tokens.css">` 1行追加のみ（他ファイルは空diff）。QA/SL の `icons/*.svg` 404 は HEAD コミット既存問題で M0-3 無関係。E-6 はスクリーンショット比較は未実施だが、Computed Value が全て M0-2 期待値と一致するため視覚変化ゼロと判定可能。

### F. アクセシビリティ（5 / 5）

| ID | 項目 | 判定 | 配点 | 獲得 |
|----|------|------|------|------|
| F-1 | `disabled` 属性なし | Pass | 2 | 2 |
| F-2 | `media` 属性なし | Pass | 2 | 2 |
| F-3 | CSS ロード失敗時のフォールバック可能 | Pass | 1 | 1 |

**評価**: 新規 `<link>` は `rel` と `href` のみのミニマル記述で、失敗時はモックアップ :root 旧変数でフォールバック可能な既存設計が維持されている。

### G. コード品質（10 / 10）

| ID | 項目 | 判定 | 配点 | 獲得 |
|----|------|------|------|------|
| G-1 | インデント 4スペース | Pass | 2 | 2 |
| G-2 | 1行完結（改行なし） | Pass | 1 | 1 |
| G-3 | 4HTMLで `<link>` 文字列完全同一 | Pass | 3 | 3 |
| G-4 | 既存 stylesheet 順序の入れ替えなし（QA の既存逆順保持含む） | Pass | 2 | 2 |
| G-5 | 末尾空行・EOF 改行変化なし | Pass | 1 | 1 |
| G-6 | BOM 有無の変化なし（SL の既存BOM保持） | Pass | 1 | 1 |

**評価**: 4HTMLで `<link rel="stylesheet" href="mockup/co-tokens.css">` 完全一致。QA の既存逆順（co-navbar → co-shared-badges）も変更せず、M0-3 スコープを厳守。

---

## 重大Claim再チェック（C-1〜C-11）

| Claim | 判定 | SC 再確認根拠 |
|-------|------|---------------|
| C-1（link 追加以外の差分） | **非該当** | SC `git diff` 実行で 4HTML 全て `@@ -4,6 +4,7 @@` 1行追加のみ確認 |
| C-2（co-tokens.css 改変） | **非該当** | SC `git diff HEAD -- docs/mockup/` 空出力 |
| C-3（モックアップCSS改変） | **非該当** | SC `git diff HEAD -- docs/mockup/` 空出力（co-tokens.css以外も含む） |
| C-4（styles-light / tokens.json 改変） | **非該当** | SC `git diff HEAD -- docs/ui-components/` 空出力 |
| C-5（co-tokens.css 404） | **非該当** | TE Playwright MCP で 4HTML 全て `mockup/co-tokens.css` → 200 OK |
| C-6（CSSパースエラー） | **非該当** | TE Console にCSSパースエラー 0件 |
| C-7（見た目変化） | **非該当** | TE Computed Value が M0-2 期待値と一致（`--bg-page`, `--text-primary`, `--accent-primary`, `--elevation-3`, `--cat-bg-facility`, `--shadow-medium`, body背景） |
| C-8（HTMLパースエラー） | **非該当** | SC が 4HTML L1-12 を Read で再確認、`<head>` 構造正常。Playwright で Page Title 取得成功 |
| C-9（最前以外の位置） | **非該当** | 4HTML 全て L7（最小行番号・最前）で SC 目視確認済 |
| C-10（1ファイルでも欠落） | **非該当** | SC Read で 4HTML 全てに L7 で追加済み確認 |
| C-11（既存順序の並び替え） | **非該当** | QA は L8=co-navbar, L9=co-shared-badges の既存逆順保持、OB/WS/SL は L8=co-shared-badges, L9=co-navbar の既存順序保持 |

**重大Claim: 0件**

---

## デザイナー視点コメント

### 1. co-tokens.css リンク形式の統一性（最重要観点）

4HTML全てで `<link rel="stylesheet" href="mockup/co-tokens.css">` が**完全同一文字列**で記述されている。これは単なるコード品質の話ではなく、将来 M0-4 以降で「co-tokens.css をキャッシュバスター付与で更新する」「`?v=2` に揃える」等の一括置換が grep-replace で確実に完遂できることを担保する。デザインシステム運用上、共通トークンCSSへの参照は**必ず4モックアップで1対1同期**させるべきであり、本実装はその規律を守っている。

### 2. 既存 stylesheet 順序との融合

OB/WS/SL は `co-shared-badges → co-navbar → 専用CSS` の順序、QA は `co-navbar → co-shared-badges → 専用CSS` の逆順という既存の非対称性を**そのまま保持**し、co-tokens.css だけを全ファイルで最前に統一挿入した。これにより：

- co-tokens.css（新DS正）が最優先で読まれ、legacy aliases が全ての後続CSSに対して有効となる
- モックアップ :root の既存定義（`--base-page`, `--cat-bg-facility` 等）は後勝ちで上書きされ、M0-2 で設計された「視覚変化ゼロ」原則が成立
- QA の既存逆順は M0-3 スコープ外のため意図的に触らず、Phase M-A 以降で別途判断できる状態を維持

**デザイナー観点での違和感**: なし。co-tokens.css を最前に置く設計は、CSS カスケード理論上も運用上も最適。

### 3. カラーコーディネーター観点の確認

Playwright MCP Computed Value 検証で、Coastal Palette の核心色である以下4値が4HTML全てで正しく解決されていることを SC として再確認：

- `--bg-page: #E9F1F6`（ページ背景のペールミスト）
- `--text-primary: #004554`（ディープシーグリーン、コントラスト担保）
- `--accent-primary: #44A6B5`（シーブリーズ・ティール、アクセント）
- `--elevation-3: 0 4px 12px rgba(0,69,84,0.10)`（カード/モーダル影のミドルレイヤー）

特に `--elevation-3` の rgba ベースが `#004554`（`rgb(0,69,84)`）由来であることが、影色がパレット調和を保つ重要な設計。M0-3 時点でこの影色が legacy aliases `--shadow-medium` 経由で旧値（0.12）に上書きされる現象（WS/SL）は M-A で解消予定のため、本フェーズでは想定内動作として許容。

### 4. 減点ゼロの理由

TDの配点を全て獲得。D-2 は N/A 扱いだが、テスト項目書上「本文参照がない場合は N/A」と明記されているため減点対象外。静的検証（Grep 0件）で実質的な代替が成立しており、デザイナー視点でも「モックアップCSSが `--shadow-sm/md/lg` を使っていないなら、実ブラウザ確認は不要」と判断。

---

## 次サブフェーズ（M0-4）への引き継ぎ事項

### M0-4 実施時の前提条件（M0-3 達成により成立）

1. **co-tokens.css が4HTMLで実読み込みされている**（200 OK確認済） — `body` への `font-feature-settings: "palt"` / `font-variant-numeric: tabular-nums` を co-tokens.css 側に追加しても、4モックアップ全てに即時反映される
2. **モックアップ :root の後勝ち設計が機能** — M0-4 で co-tokens.css に新規変数を追加してもモックアップ :root の既存定義は上書きされない。タイポグラフィ系変数（`--font-size-*` 等）の新規追加は安全
3. **Computed Value 検証手法が確立** — M0-4 でも Playwright MCP で `body` の `font-feature-settings` 実ブラウザ値（`"palt"` / `normal`）、`font-variant-numeric` 実ブラウザ値を確認する手法をそのまま適用可能

### M0-4 で注意すべき点

1. **palt 適用対象の絞り込み**: `body` 全体に `palt` を効かせると等幅が崩れる表組み（OB/WS のテーブル）があるため、`table, .mono, input[type="text"]` 等には `font-feature-settings: normal;` の打ち消しが必要。TD/IM で対象選定を明確化すること
2. **tabular-nums 適用対象**: 数値揃え（受注金額・日付・時刻）が必要な要素のみに限定。本文には不要
3. **M0-3 で確認された既存404（QA: `shield.svg`, SL: `refresh.svg`）** — M0-3 スコープ外と判定したが、放置すると M0-4 以降の Console ログに継続ノイズとして残る。別途 Phase M-B 等で対応を検討してもよい（ユーザー承認要）

### M0-5（変数衝突解消）への引き継ぎ

- `--text-tertiary` / `--text-disabled` / `--warning-text` の値衝突は本フェーズでは未解消（スコープ外）
- M0-5 で co-tokens.css の legacy aliases 定義を整理する際、本M0-3で成立した「co-tokens.css 先読み → モックアップ :root 後勝ち」順序を**維持したまま**衝突解消すること

### M-A（カテゴリ4色相分化・影構造統一）への引き継ぎ

- WS/SL の `--cat-bg-facility: rgba(68,166,181,0.12)` が :root で定義されているため、co-tokens.css の 4色相分化値（`rgba(68,166,181,0.14)`）が上書きされている状態。M-A 実施時には WS/SL :root の該当定義を削除する必要がある
- OB は :root 未定義のため co-tokens.css 値（0.14）が直接解決中。M-A で4色相分化を完成させる際、OB の視覚変化は最小限、WS/SL は :root 削除により co-tokens.css の新値が顕在化するため視覚差分が発生する可能性あり

---

## 結論

- **総合点 100/100、重大Claim 0件で合格**
- M0-3 は「4モックアップHTMLへの co-tokens.css 読み込み」という目的を、最小差分（link 1行追加×4）・最大規律（完全同一文字列・既存順序保持）で達成
- 後続 M0-4（`palt` / `tabular-nums` 適用）へ進行可能

以上。
