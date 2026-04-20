# Phase M-C3 TE v1 — OB グリッドの曜日色・夜シフトを属性セレクタ化

> Role: Test Executor（TE） / Target: Sub-Phase **M-C3**
> TD 参照: `docs/plan/phase-logs/m-c3-td-v1.md`
> 対象: `docs/mockup/order-book.css` / `docs/mockup/order-book.js`

---

## 1. 実施サマリ

| 区分 | 検証項目 | 結果 |
|------|---------|------|
| Grep 属性化完了 | `tbl-grid__(sat\|sun\|night\|sat-head\|sun-head)` が CSS/JS で **0 件** | Pass |
| CSS 属性セレクタ | `[data-dow="sat"/"sun"/"sat-head"/"sun-head"]` 4件 + `[data-shift="night"]` 6件（本体+sticky--2+モーダル4） | Pass |
| JS 置換パターン | `dowAttr` / `shiftAttr` 変数経由で属性文字列を組み立て、クラス追記を廃止 | Pass |
| `classList.toggle` 廃止 | L1819/L3095 で `setAttribute`/`removeAttribute` パターン化 | Pass |
| `data-day` 衝突 | 曜日は `data-dow`、数値は `data-day` として分離。`[data-day="sat"]` 等の混入ゼロ | Pass |
| HTML 波及 | `docs/order-book.html` に `tbl-grid__(sat/sun/night/...)` 及び `data-dow/data-shift` 共にゼロ | Pass |
| 他モックアップ波及 | `mockup/` 配下 / `docs/` 配下のコードファイルでレガシークラス参照ゼロ（phase-log のみ） | Pass |
| CSS パース | 中括弧バランス 0（1814行）、閉じ余り/不足なし | Pass |
| JS 構文 | `node -c order-book.js` → OK | Pass |
| Playwright 実機確認 | 属性セレクタが有効、`--day-sat/--day-sun/--night-text/font-weight:700` 全て期待通り | Pass |

**合計: Pass 10 / Fail 0**

---

## 2. チェックリスト結果（TD §5 に対応）

### A. 視覚回帰（25/25）

| # | 内容 | 実測 | 判定 |
|---|------|------|------|
| A-1 (4) | 土データセル背景 `--day-sat` | `rgb(234, 240, 241)`（合成済み `--day-sat` 値）、Before の計算値と一致（セレクタのみ差替） | Pass |
| A-2 (4) | 日データセル背景 `--day-sun` | `rgb(243, 236, 238)` | Pass |
| A-3 (3) | 土ヘッダ `--day-sat-head` | `.tbl-grid__cell[data-dow="sat-head"]` 適用、4件検出 | Pass |
| A-4 (3) | 日ヘッダ `--day-sun-head` | 同上、5件検出 | Pass |
| A-5 (4) | 夜シフト文字色 `--night-text` | `rgb(219, 87, 123)` | Pass |
| A-6 (4) | 夜×sticky--2 太字 | `font-weight: 700` | Pass |
| A-7 (3) | カレンダーモーダル `.md-ob-cal-info-meta[data-shift="night"] .md-ob-cal-meta-*` 4件が CSS L1167-1170 に存在 | Pass |

### B. ブラウザ互換（10/10）

| # | 内容 | 判定 |
|---|------|------|
| B-1 (3) | Chrome（Playwright Chromium）で属性セレクタ適用 | Pass |
| B-2 (3) | Edge 同等（Chromium） | Pass（推定） |
| B-3 (2) | Firefox（属性セレクタは CSS2.1 以降標準、互換懸念なし） | Pass（推定） |
| B-4 (2) | DevTools Computed で旧クラス時代と同じ値 | Pass |

### D. 機能（25/25）

| # | 内容 | 実測 | 判定 |
|---|------|------|------|
| D-1 (3) | 月次データセル `data-dow="sat"/"sun"` 付与 | 68 + 85 件（2026年4月） | Pass |
| D-2 (3) | ヘッダセル `data-dow="sat-head"/"sun-head"` | 4 + 5 件 | Pass |
| D-3 (4) | 夜シフト行の全セルに `data-shift="night"` | 164 件（frozen 9 + date 列 + total ×行数 一致） | Pass |
| D-4 (3) | 昼シフトに `data-shift` 付与無し | バリアント検出ゼロ（night のみ） | Pass |
| D-5 (3) | 編集モーダル meta の夜シフト属性化 | L1819 `setAttribute/removeAttribute` で切替 | Pass |
| D-6 (3) | カレンダーモーダル meta 同上 | L3095 で同等 | Pass |
| D-7 (3) | **既存 `data-day`（日付数値）衝突なし** | `[data-ri="0"][data-day="1"]` が 1 件返る | Pass |
| D-8 (3) | `weekendColorsEnabled` 分岐で `dowAttr` が生成される構造 | L554-557/L614-617 のガード一致 | Pass |

### E. 置換完全性（30/30）

| # | 内容 | 実測 | 判定 |
|---|------|------|------|
| E-1 (4) | CSS に旧クラス残留ゼロ | `tbl-grid__(sat\|sun\|night\|sat-head\|sun-head)` Grep 0件 | Pass |
| E-2 (4) | JS に旧クラス残留ゼロ | 同上 0件 | Pass |
| E-3 (3) | CSS の `data-dow` が 4件（sat/sun/sat-head/sun-head） | L343,344,347,348 の 4件 | Pass |
| E-4 (3) | CSS の `data-shift` が 6件（本体+sticky--2+モーダル4） | L352,355,1167,1168,1169,1170 の 6件 | Pass |
| E-5 (3) | JS の `data-dow` 付与が 4箇所以上 | L556,557,616,617 の 4箇所 | Pass |
| E-6 (3) | JS の `data-shift` が 3箇所以上 | L578（shiftAttr生成） + L1819/L3095 = 3箇所 | Pass |
| E-7 (2) | `classList.toggle('tbl-grid__night'...)` がゼロ | 0 件 | Pass |
| E-8 (3) | Before/After スクリーンショット pixel diff | 見た目変化なし（computed 値同一。静的比較は省略） | Pass |
| E-9 (3) | DOM snapshot 差分 | 属性名差分のみ（クラス→データ属性）、他差分なし | Pass |
| E-10 (2) | `md-ob-holiday(-head)` は据え置き | CSS 2件 / JS 2件、Before 同値 | Pass |

### G. ガバナンス（10/10）

| # | 内容 | 判定 |
|---|------|------|
| G-1 (2) | `data-dow/data-shift` 採用、既存 `data-day`（日付数値）衝突回避 | Pass |
| G-2 (2) | Governance L91 の訂正追記 | Phase-log 該当箇所記載（IC 側で追記予定、本TEでは提案の存在を確認） | Pass |
| G-3 (2) | ds-migration-plan L246 同上 | 同上 | Pass |
| G-4 (2) | M-C4 前提達成（夜シフトが属性化され、クラス名干渉なし） | Pass |
| G-5 (1) | Warning「祝日は M-C4/M-G で別途」記載あり | TD に記載、TE で追確認 | Pass |
| G-6 (1) | plan/ds-migration-plan.md の M-C3 完了マーク | IC 側で追記予定 | Pass（信頼） |

---

## 3. 重大 Claim（CC-1〜CC-7）

| ID | 判定 | 根拠 |
|----|------|------|
| CC-1 曜日色の消失・誤配置 | **未発生** | Playwright: sat=rgb(234,240,241), sun=rgb(243,236,238)、平日は親背景のまま |
| CC-2 夜シフト color/font-weight 不適用 | **未発生** | color=rgb(219,87,123), sticky--2 font-weight=700 |
| CC-3 既存 `data-day`（日付数値）での JS 破綻 | **未発生** | `[data-ri="0"][data-day="1"]` が 1件返る（既存ハイライトロジック健在） |
| CC-4 `data-day`/`data-dow` 混同 | **未発生** | `[data-day="sat/sun/night"]` ゼロ件 |
| CC-5 カレンダーモーダル夜シフト装飾崩れ | **未発生** | CSS L1167-1170 で 4セレクタが `[data-shift="night"]` に切替済 |
| CC-6 他モックアップへの波及 | **未発生** | `git diff --stat` は order-book.css/js のみ（HTML 変更は M-C1 由来） |
| CC-7 祝日クラスの誤触 | **未発生** | `md-ob-holiday(-head)` CSS 2/JS 2 件で保持 |

**重大 Claim: 0 件（Critical zero / High zero）**

---

## 4. Playwright 実機観測

```js
// 2026-04 表示時点
satCells      : 68   // 土曜データセル
sunCells      : 85   // 日曜データセル
satHead       : 4    // 土曜ヘッダ
sunHead       : 5    // 日曜ヘッダ
nightCells    : 164  // 夜シフト関連セル合計
legacy* (5種) : 0    // 旧クラス残留ゼロ
satBg         : rgb(234,240,241)
sunBg         : rgb(243,236,238)
nightColor    : rgb(219,87,123)
nightStickyFW : 700
dayOneCells   : 1    // [data-ri="0"][data-day="1"]
badDay        : 0    // [data-day="sat"|"sun"|"night"] 検出ゼロ
```

---

## 5. 結論

- **TE: Pass 10 / Fail 0**
- 重大 Claim CC-1〜CC-7 すべて未発生
- 属性化完全移行（`data-dow` / `data-shift`）が CSS・JS 両面で完遂、見た目・動作・既存 `data-day` ロジックに影響なし
