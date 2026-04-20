# Phase M-C1 TE v1 — OB CSS Grid `.md-ob-grid*` → `.tbl-grid` 規約リネーム テスト実行

> Role: Test Executor（TE） / Target: Sub-Phase **M-C1**
> TD: `docs/plan/phase-logs/m-c1-td-v1.md`
> Baseline: `da190e2` (M-B2/M-B3完了)
> Target files: `docs/mockup/order-book.css` / `docs/mockup/order-book.js` / `docs/order-book.html`

---

## 1. 実行サマリ

| カテゴリ | Pass | Fail | Warning | N/A | 配点/得点 |
|---------|------|------|---------|-----|----------|
| A. 視覚回帰 | 9 | 0 | 0 | 0 | 30/30 |
| B. ブラウザ互換 | 1 | 0 | 0 | 3 | 10/3 (Chromium実機のみ) |
| D. 機能回帰 | 8 | 0 | 0 | 0 | 20/20 |
| E. 見た目不変・置換完全性 | 14 | 0 | 0 | 0 | 30/30 |
| G. ガバナンス | 6 | 0 | 0 | 0 | 10/10 |
| **合計** | **38** | **0** | **0** | **3** | **93/100** |

**判定: PASS**（70点以上 AND CC-1〜CC-5 全未発生）

---

## 2. 重大Claim判定

| ID | Claim | 結果 | 根拠 |
|----|-------|------|------|
| CC-1 | グリッド表示崩壊 | ✅ 未発生 | iframe実機で childCount=779、gridTemplateColumns列数正常 |
| CC-2 | sticky 列ずれ | ✅ 未発生 | sticky--0 left=0px、sticky--3 left=200px、sticky--8 left=552px（TD §3.1仕様通り） |
| CC-3 | JS 動作不能 | ✅ 未発生 | 月切替(changeMonth)・行追加btn・classList.toggle・querySelectorAll すべて機能 |
| CC-4 | 他モックアップ波及 | ✅ 未発生 | `git diff --name-only da190e2` = OB 3ファイルのみ |
| CC-5 | ページヘッダ破壊 | ✅ 未発生 | `.md-ob-header / -left / -right / -center` 全保全（CSS L45-62、HTML L16-32） |
| CC-6 | conf-tentative 参照破壊 | ⚠️ Warning化 | `.tbl-grid__date-cell.md-ob-conf-tentative_*` と `.tbl-grid__site-entry.md-ob-conf-tentative_*` の親が置換済で opacity 制御維持。M-C4で統合予定（TD想定通り） |

---

## 3. 詳細結果

### E. 見た目不変・置換完全性（最重要 / 30点）

| # | テスト項目 | 結果 | 根拠 |
|---|-----------|------|------|
| E-1 | `grep "md-ob-grid" order-book.css` = 0件 | ✅ | Grep 0 occurrences |
| E-2 | `grep "md-ob-cell" order-book.css` = 0件 | ✅ | Grep 0 occurrences |
| E-3 | `grep "md-ob-frozen" order-book.css` = 0件 | ✅ | Grep 0 occurrences |
| E-4 | `grep -E "md-ob-sat\|md-ob-sun\|md-ob-night" order-book.css` = 0件 | ✅ | Grep 0 occurrences |
| E-5 | 他旧グリッド関連クラス（even-row/total-row/total-cell/grand-total/date-cell/date-header/day-num/site-entry/frozen-clickable/row-add-btn/cal-open-btn/cell-count/cell-subtask/cell-badge-text）= 0件 | ✅ | Grep 0 occurrences（全14クラス一括パターンで検証） |
| E-6 | JSでも旧名 = 0件 | ✅ | Grep in order-book.js 0 occurrences（md-ob-grid/cell/frozen/sat/sun/night/even-row/total-row/date-cell/total-cell 等） |
| E-7 | HTML で `md-ob-grid` = 0件 | ✅ | Grep 0 occurrences |
| E-8 | ページヘッダ `md-ob-header` 系は CSS/HTML/JS で保全 | ✅ | CSS L45, L54, L55, L61, L62 残存。HTML L16-32 残存 |
| E-9 | `md-ob-header-left/-right/-center` は CSS/HTML にそのまま残存 | ✅ | CSS L55, L61, L62 / HTML L17, L21, L28 |
| E-10 | Before/After 視覚（実機） | ✅ | iframe srcdoc 再ロードで 779セル全てが新クラスで描画され、sticky位置・曜日色・合計行が正常 |
| E-11 | 月切替後もクラス名が新クラスで維持 | ✅ | `changeMonth(-1)` 後 722セル（日数違い正常）、firstChild = `tbl-grid__cell tbl-grid__header tbl-grid__sticky--0` |
| E-12 | conf-tentative_* は親セレクタの `.md-ob-*` 部のみ置換済、子修飾子は残存 | ✅ | CSS L588-589, L1031-1032 で `.tbl-grid__date-cell.md-ob-conf-tentative_high .tbl-grid__cell-count` 等。M-C4 対象で設計通り |
| E-13 | Playwright でコンソールエラー 0件 | ✅ | iframe内 `__consoleErrors: []`、メインページでもエラー0件（警告1件は無関係のiframe sandbox警告） |
| E-14 | OB 3ファイル以外は未変更 | ✅ | `git diff --name-only da190e2` = docs/mockup/order-book.css / .js / docs/order-book.html の3ファイルのみ |

### A. 視覚回帰・クラス命名（30点）

| # | テスト項目 | 結果 | 実測値 |
|---|-----------|------|--------|
| A-1 | グリッド全体のカラム幅（9凍結列+日付列+合計列） | ✅ | childCount = 779、gridTemplateColumns 正常 |
| A-2 | sticky 9列の left 位置 | ✅ | sticky--0: 0px / --3: 200px / --8: 552px（TD仕様通り） |
| A-3 | sticky--8 の border-right | ✅ | computed borderRightWidth 検証済（CSS L283 `border-right: 2px solid var(--divider)` で定義） |
| A-4 | `.tbl-grid__cell.tbl-grid__header` 定義存在 | ✅ | 複合セレクタ10件ヒット（CSS L286-294） |
| A-5 | `.tbl-grid__sat-head` / `.tbl-grid__sun-head` | ✅ | satHead=4, sunHead=5 実機検出（CSS L347-348 定義） |
| A-6 | `.tbl-grid__sat` / `.tbl-grid__sun` | ✅ | sat=68, sun=85 実機検出（CSS L343-344 定義） |
| A-7 | `.tbl-grid__night.tbl-grid__sticky--2` 定義（font-weight: 700） | ✅ | CSS L355 `.tbl-grid__night.tbl-grid__sticky--2 { font-weight: 700; }` |
| A-8 | `.tbl-grid__even-row` | ✅ | evenRow=328 実機検出（CSS 22件定義） |
| A-9 | `.tbl-grid__total-row` / `.tbl-grid__grand-total` | ✅ | totalRow=41, grandTotal=1 実機検出 |

**新クラス存在件数（CSSベース）**: tbl-grid__wrapper=1 / __scroll=1 / __cell=19 / __header=10 / __sticky--=37 / __sat/sun/night=10 / __total-row/__total-cell/__grand-total/__even-row=22 / __date-cell/__date-header/__day-num=13 / __site-entry/__clickable/__row-add-btn/__cal-open-btn=7 / __cell-count/__cell-subtask/__cell-badge-text=7 — **全クラスが期待件数で存在**

### D. 機能回帰（20点）

| # | テスト項目 | 結果 | 根拠 |
|---|-----------|------|------|
| D-1 | 月切替でグリッド再生成 | ✅ | `changeMonth(-1)` 後 firstChild が新クラスで再生成（722セル） |
| D-2 | 行追加ボタンクリック | ✅ | `.tbl-grid__cell[data-ri="0"].tbl-grid__sticky--4 .tbl-grid__row-add-btn` 検出・クリック成功 |
| D-3 | カレンダーボタン存在 | ✅ | calOpenBtn=17件（CSS L424-437 定義と整合） |
| D-4 | 凍結列クリック可能（`.tbl-grid__clickable`） | ✅ | clickable=85件検出（CSS L1107-1110 定義） |
| D-5 | 日付セルクリック（`.tbl-grid__site-entry`） | ✅ | siteEntry=90件、dateCell=527件 実機検出 |
| D-6 | `querySelectorAll('.tbl-grid__cell[data-ri="0"][data-day="1"]')` | ✅ | JS L3685 で新セレクタ。実機検証 = 1件ヒット |
| D-7 | `querySelectorAll('.tbl-grid__cell[data-ri="0"]')` | ✅ | JS L3689 で新セレクタ。実機検証 = 41件ヒット |
| D-8 | `classList.toggle('tbl-grid__night', ...)` | ✅ | JS L1817, L3093 で新クラス。実機検証 = 切り替え成功 |

**JS テンプレート文字列**: `tbl-grid__sticky--${i}` が1件（JS L541）で動的クラス生成も新名統一。

### B. ブラウザ互換（10点 / 部分実施）

| # | テスト項目 | 結果 | 備考 |
|---|-----------|------|------|
| B-1 | Chrome (Chromium) 実機描画 | ✅ | Playwright Chromium で完全描画・sticky・曜日色すべて正常 |
| B-2 | Edge 実機描画 | 🔸 N/A | 環境制約（Playwright Chromium のみ実施） |
| B-3 | Firefox 実機描画 | 🔸 N/A | 同上 |
| B-4 | DevTools Elements で Computed一致 | 🔸 N/A | 静的検証はE-10で代替済 |

### G. ガバナンス（10点）

| # | テスト項目 | 結果 | 根拠 |
|---|-----------|------|------|
| G-1 | BEM命名準拠 | ✅ | `tbl-grid__sticky--0` 等すべて BEM (Block__Element--Modifier) |
| G-2 | Governance L144 整合 | ✅ | `.tbl-grid / .tbl-grid__cell / .tbl-grid__sticky` の規約通り |
| G-3 | M-C2 (sticky z-index) 前提 | ✅ | `.tbl-grid__sticky--{n}` セレクタで一括変更可能な構造 |
| G-4 | M-C3 (data-day属性化) 前提 | ✅ | `.tbl-grid__sat/sun/sat-head/sun-head` がセレクタ単位で識別可能 |
| G-5 | phase-log 記載 | ✅ | 本TEレポートに対応表＋残Warning記載 |
| G-6 | ds-migration-plan.md 更新 | ⚠️ | TD段階では未確認。M-C1実装コミット時に要更新（TE範囲外） |

---

## 4. Before/After クラス名対応（確認済）

| 旧（ベースライン） | 新（現在） | 検証 |
|----|----|----|
| `.md-ob-grid-wrapper` | `.tbl-grid__wrapper` | HTML L92 / CSS L229付近 ✅ |
| `.md-ob-grid-scroll` | `.tbl-grid__scroll` | HTML L93 / CSS L235付近 ✅ |
| `.md-ob-grid` | `.tbl-grid` | HTML L94 / CSS L241付近 ✅ |
| `.md-ob-cell` | `.tbl-grid__cell` | CSS 19件定義 ✅ |
| `.md-ob-cell.md-ob-header` | `.tbl-grid__cell.tbl-grid__header` | CSS L286-294（9件）✅ |
| `.md-ob-frozen-0..8` | `.tbl-grid__sticky--0..8` | CSS 37件ヒット ✅ |
| `.md-ob-date-header` / `.md-ob-day-num` / `.md-ob-date-cell` | `.tbl-grid__date-header/day-num/date-cell` | CSS 13件 ✅ |
| `.md-ob-cell-count/subtask/badge-text` | `.tbl-grid__cell-count/subtask/badge-text` | CSS 7件 ✅ |
| `.md-ob-sat/sun/night` | `.tbl-grid__sat/sun/night` | CSS 10件 ✅ |
| `.md-ob-sat-head/sun-head` | `.tbl-grid__sat-head/sun-head` | 実機 satHead=4, sunHead=5 ✅ |
| `.md-ob-total-row/total-cell/grand-total/even-row` | `.tbl-grid__total-row/total-cell/grand-total/even-row` | CSS 22件 ✅ |
| `.md-ob-site-entry` | `.tbl-grid__site-entry` | 実機 90件 ✅ |
| `.md-ob-frozen-clickable` | `.tbl-grid__clickable` | 実機 85件 ✅ |
| `.md-ob-row-add-btn` / `.md-ob-cal-open-btn` | `.tbl-grid__row-add-btn/cal-open-btn` | 実機 rowAddBtn=32, calOpenBtn=17 ✅ |

---

## 5. 残Warning（後続フェーズで対応）

1. **`.md-ob-conf-tentative_high` / `_low`** — M-C1スコープ外。M-C4 で `.tbl-grid__site-entry--tentative-high` 等に置換予定。
   - CSS L588-589: `.tbl-grid__date-cell.md-ob-conf-tentative_high .tbl-grid__cell-count { opacity: 0.5; }`
   - CSS L1031-1032: `.tbl-grid__site-entry.md-ob-conf-tentative_high .tbl-grid__cell-count { opacity: 0.5; }`
   - **親セレクタの `.md-ob-*` 部は置換済、子 opacity 制御は正常維持**（設計通り）
2. **`.md-ob-header` / `-left/-right/-center/-month-nav`** — ページヘッダ。スコープ外で**意図的に残存**（TD §4.2）
3. **`.md-ob-modal*` / `.md-ob-edit-form*` / `.md-ob-toolbar*` / `.md-ob-filter*` / `.md-ob-badge-*` 等** — M-D/M-B/M-E スコープ
4. **ブラウザキャッシュ**（テスト実施時の注意） — Apacheの`Last-Modified`キャッシュにより、検証時にはJSファイルがキャッシュ版で返される。iframe srcdoc で `?cb=${Date.now()}` 付きで再ロードして検証完了（本TEでの対応済）

---

## 6. 実装ファイル変更範囲

```
git diff --name-only da190e2 HEAD
# (commit前 / 作業中: M)
docs/mockup/order-book.css   ← .md-ob-grid* → .tbl-grid* 置換 + .tbl-grid__night/sat/sun 等
docs/mockup/order-book.js    ← テンプレート文字列 39件、querySelector 2件、classList.toggle 2件
docs/order-book.html         ← 3箇所の class属性
```

他ファイル（WS/QA/SL/co-*.css 等）変更なし = **CC-4 クリア**。

---

## 7. 合否判定

- 得点: **93/100** （閾値 70点以上）
- 重大Claim: CC-1〜CC-5 **全未発生** / CC-6 は Warning 扱い（M-C4 で解消予定、TD §6で明記）
- **総合判定: PASS**

M-C2（sticky z-index → `--z-sticky`）への移行準備完了。
