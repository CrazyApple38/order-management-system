# Phase M-C2 SC v1 — OB テーブル sticky z-index トークン化 採点結果

> Role: Scorer（SC） / Phase: M-C2 / Date: 2026-04-20
> Input: `docs/plan/phase-logs/m-c2-te-v1.md` / TD: `m-c2-td-v1.md`
> Target: `docs/mockup/order-book.css`

---

## 1. 採点サマリ

| 観点 | 略号 | 配点 | 獲得 | 減点理由 |
|------|------|------|------|---------|
| 視覚回帰 | A | 30 | 30 | — |
| ブラウザ互換 | B | 10 | 10 | — |
| 機能動作 | D | 20 | 20 | — |
| 置換完全性 | E | 30 | 30 | — |
| ガバナンス | G | 10 | 4 | G-1 インラインコメント未付与 -3、G-2 非対象 TODO 未付与 -3 |
| **合計** | — | **100** | **94** | |

**合格条件（70点以上 AND 重大Claim 0）: 達成**
**判定: 合格**

---

## 2. 重大Claim 9項目 再確認

| # | 事象 | 結果 | 検証根拠 |
|---|------|------|---------|
| C-1 | sticky 重なり逆転 | 無 | 列200 < ヘッダ201 < 交差202 の階差正常 |
| C-2 | ヘッダがデータの下に隠れる | 無 | z=201 は通常セル auto より上位 |
| C-3 | 交差セルが下に隠れる | 無 | z=202 が両軸 sticky の最上位 |
| C-4 | 上位レイヤー侵食 | 無 | 202 < overlay 500 / modal 1000 / tooltip 1000 / toast 2500 |
| C-5 | `calc(var())` 未評価 | 無 | モダンブラウザ（Chrome/Edge/Firefox）全て対応 |
| C-6 | 置換漏れ | 無 | sticky対象範囲（L260-300）に 10/20/30 数値 0 件 |
| C-7 | 非対象 z-index 改変 | 無 | L191/449/472/551/806/1118/1354 全て値不変 |
| C-8 | `--z-sticky` 改変 | 無 | co-tokens.css L159 `--z-sticky: 200;` 維持・git diff 0 |
| C-9 | JS コンソール新規エラー | 無 | JS z-index 差分 0・CSSパースOK |

**重大Claim: 0 件** → 合格条件クリア

---

## 3. 観点別採点詳細

### A. 視覚回帰（30/30）

全8項目（A-1〜A-8）合格。
- 階差 10/20/30 → 200/201/202 は相対関係を保持、pixel-diff 意図外変化なし
- 背景指定（`--bg-surface-3` / `--base-grid`）は未変更、透過崩れなし

### B. ブラウザ互換（10/10）

- `calc(var(--z-sticky) + N)` は CSS Values Level 3 で主要3ブラウザ（Chrome/Edge/Firefox）サポート
- 計算値 200/201/202 が DevTools Computed に確定的に出力される構文

### D. 機能動作（20/20）

- `position: sticky` / `left` / `top` 値は未変更、粘着挙動不変
- pointer-events・cursor 指定も未変更でクリック可動作保持
- 上位レイヤー（overlay=500, modal=1000, tooltip=1000, toast=2500）が sticky の 202 を正しく覆う

### E. 置換完全性（30/30）

- 対象9+1+1=11宣言すべて置換済み
- Grep `z-index:\s*var\(--z-sticky\)` = 9（列）
- Grep `calc\(var\(--z-sticky\) \+ 1\)` = 1（ヘッダ）
- Grep `calc\(var\(--z-sticky\) \+ 2\)` = 1（交差）
- sticky対象範囲外残存（L1118 `.md-ob-cal-close`）は TD 1.3 非目標表で許容済み
- 非対象値・co-tokens.css ともに不変

### G. ガバナンス（4/10）

| 項目 | 配点 | 獲得 | コメント |
|------|------|------|---------|
| G-1 置換部にM-C2コメント | 3 | 0 | 実CSSにインラインコメント（例: `/* 201: sticky列(200)より上 */`）未付与 |
| G-2 非対象行 TODO コメント | 3 | 0 | L191/449/472/551/806/1354 に `TODO M-C3+` コメント未付与 |
| G-3 ds-migration-plan.md 更新 | 2 | 2 | SC完了時にチェック更新する運用（本ログで完了記録） |
| G-4 独自トークン増加なし | 2 | 2 | co-tokens.css 差分 0、`--z-sticky-head` 等の追加なし |

G-1/G-2 の減点は**後続 M-C3 着手時に巻き取り可能**と判断。合格条件（70点）は余裕をもって満たすため本フェーズは合格確定。

---

## 4. デザイナー視点評価

### 4.1 z-index 階層の論理性

置換後の階層は以下の通り昇順・役割別に整理されている:

```
通常セル     : auto (0)
sticky 列    : 200   ← --z-sticky
sticky ヘッダ : 201   ← +1（列より上）
sticky 交差  : 202   ← +2（両軸sticky の最上位）
suggest (50) / dropdown (200 / 600) — 未トークン化、M-C3 で整理
overlay      : 500
modal        : 1000
tooltip      : 1000
toast        : 2500
```

- **列 < ヘッダ < 交差** の自然な縦積みが `+1 / +2` で明示的
- 設計意図がコードから読み取れる（マジックナンバー撲滅）
- co-tokens.css のレイヤートークン体系（dropdown 100 / sticky 200 / overlay 900 / modal 1000 / toast 2000）と整合

### 4.2 トークン化によるメンテナビリティ

- sticky 層のベース値変更は `--z-sticky` の1箇所修正で11宣言に波及
- 将来 sticky ツールバー等を追加する場合も `calc(var(--z-sticky) + N)` パターンで拡張可能
- SL（screen-layout.css）・QA（quick-access.css）の sticky 同方針展開の足場が完成

### 4.3 改善余地（次フェーズへの申し送り）

1. **M-C3+**: L191/449/472/551/806/1118/1354 の未トークン化 z-index を co-tokens.css のレイヤーに整合
   - L449 `.md-ob-tooltip` 1000 → `var(--z-tooltip)` (1200)
   - L472 `.md-ob-modal-overlay` 500 → `var(--z-overlay)` (900)
   - L1354 `#obCnToastContainer` 2500 → `var(--z-toast)` (2000)
2. **今回未実施のコメント付与**は M-C3 着手時に一括対応（G-1/G-2）
3. **SL/QA 横展開**: 本フェーズの `+1/+2` パターンを SL/QA の sticky にも適用し、共通トークン `--z-sticky` で一貫性を担保

---

## 5. ds-migration-plan への反映

- Phase M-C2 を **完了マーク**
- 次フェーズ候補: M-C3（OB その他 z-index トークン化 + 置換部コメント巻き取り）/ M-D1（SL sticky z-index トークン化）

---

## 6. 最終判定

- **総合点: 94 / 100**
- **重大Claim: 0 件**
- **判定: 合格**

---

_Scorer / Phase M-C2 / 2026-04-20_
