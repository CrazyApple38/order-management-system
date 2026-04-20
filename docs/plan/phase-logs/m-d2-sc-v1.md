# Phase M-D2 SC v1 — OB/SL モーダル置換 採点結果

> Role: Scorer / Based on: `m-d2-te-v1.md`
> 採点日: 2026-04-20 / 配点: **A=25 / B=10 / D=25 / E=25 / G=15**（合計 100）
> 合格条件: 総合点 ≥ 70 AND 重大Claim = 0

---

## 1. 重大Claim 判定（1件でも該当 → 不合格）

| # | 内容 | 判定 |
|--:|------|:----:|
| 1 | 機能破壊（open/close/× が効かない、`_setupCalEditPanel` 例外） | **該当なし** |
| 2 | オーバーレイ背景崩壊（rgba 消失・position:fixed 破綻） | **該当なし** |
| 3 | z-index 干渉（navbar/dropdown/toast 階層破綻） | **該当なし** |
| 4 | 他モックアップ波及（co-navbar / styles-light / WS / QA CSS 改変） | **該当なし** |
| 5 | CSS 残留（3 CSS に `.md-ob-modal*` 実定義） | **該当なし**（全 0） |
| 6 | HTML 残留（2 HTML に `md-ob-modal`） | **該当なし**（全 0） |
| 7 | JS 残留（OB/SL JS に `md-ob-modal`） | **該当なし**（全 0） |
| 8 | 新規記号混入（✕/×/+/✓） | **該当なし**（既存 ✕ 温存） |
| 9 | Link 抜け（OB/SL で co-modal.css `<link>` 未追加） | **該当なし**（両 HTML L10 追加済） |

**重大Claim = 0**

---

## 2. 観点別採点

### A. DS準拠（トークン・命名）— 25点

- `co-modal.css` は styles-light.css L1262-1305 の `.ob-modal-*` 定義を **プレフィクス撤去版 `.modal-*`** として忠実に転記。プロパティ値は OB/SL 実装の既存値（`background`, `padding`, `border-radius`, `box-shadow` 等）を温存
- `--z-modal` / `--modal-w-sm/md/lg/xl` のトークン参照を overlay / modal 幅で採用。将来 `--modal-w-lg` `-xl` の派生（`.modal.modal-lg / -xl`）も同梱し、WS/QA 展開時に即利用可
- 7 クラス（`.modal-overlay / .modal / .modal-header / .modal-body / .modal-footer / .modal-close / .modal-footer-right`）+ 4 サイズ派生 + calendar 派生 = 合計 **12セレクタ** を単一 CSS に集約
- 旧 `md-ob-modal*` 残留は HTML / JS / 3 CSS で **全 0件**（合計 80件削除）
- `<link>` 順序（tokens → forms → buttons → **modal** → shared-badges → navbar → 個別）も TD 指定通り

**配点 25 / 25**

### B. カラーコーディネーション — 10点

- overlay: `rgba(0,69,84,0.35)` = Coastal Palette 既定（accent-primary に準じた深緑半透明）
- header: `var(--accent-primary-light)` = #5AB8C6（Coastal アクセント light）
- body: `#E9F1F6`（Coastal 淡シアン系、OB/SL で共通）
- close ボタン: `rgba(255,255,255,0.8 / 0.2)`（ヘッダ前提の白コントラスト）
- Coastal 外色（青/緑/赤で `--error` 以外）の混入なし。既存値の完全保持

**配点 10 / 10**

### D. コンポーネント一貫性 — 25点

- OB 5モーダル（editModal / rowEditModal / sortModal / calendarModal / obChangeNotifyModal）で overlay/shell クラスが `modal-*` に統一
- SL 9モーダル（vehicle/staffEdit 2 + site/slAdd 2 + meeting/work/notes/map/workTime 5、SL では元から close の md-ob-modal-close を共用していた箇所）で `.modal-close` 統一
- compound クラス（`modal-header md-ob-cal-header` / `modal-body md-ob-cal-body` / `modal-footer md-ob-cal-footer` / `modal-close md-ob-cal-close`）は旧の位置関係を維持 → カレンダー固有の overrides が温存
- サイズ派生 `.modal-sm`（2件 OB）/ `.modal-calendar`（1件 OB）も一貫

**配点 25 / 25**

### E. 機能回帰（バグゼロ）— 25点

- OB editModal の × / オーバーレイクリック / 保存 / 削除 / `_setupCalEditPanel` / `_teardownCalEditPanel` — HTML onclick 接続 + JS セレクタ（`#editModalOverlay .modal` / `.modal-body` / `.modal-footer`）全て一意ヒット
- OB ソートモーダル、カレンダーモーダルの開閉、変更通知モーダルの外側クリッククローズ — 接続健全
- SL siteModal / slAddModal / meetingModal / workModal / notesModal / mapModal / workTimeModal の close ボタン — `modal-close` 付与 + onclick `closeXxxModal()` 接続
- JS セレクタ `.modal` は `#editModalOverlay` ID 限定スコープで一意化済、誤検出リスクなし
- CSS パースエラー 0（全 4 ファイルでブレース整合）

**配点 25 / 25**

### G. コード品質・保守性 — 15点

- `co-modal.css` が **単一ソース**、3 CSS（order-book / screen-layout / co-shared-badges）からシェル定義を完全に抜き取り、重複ゼロ
- トークン参照（`--z-modal` / `--modal-w-*` / `--bg-surface` / `--bg-surface-2` / `--divider` / `--accent-primary-light`）のみ使用。co-tokens.css 外の独自変数定義なし
- ハードコード色は `rgba(0,69,84,0.35)` / `rgba(0,0,0,0.1)` / `rgba(255,255,255,0.8|0.2)` / `#FFFFFF` / `#E9F1F6` に限定、いずれも旧実装と値が同一
- 不触ファイル（co-navbar.css / co-tokens.css / co-forms.css / co-buttons.css / styles-light.css / WS / QA 系）の git diff が空 → スコープ境界厳守
- 削除ブロックには移管先コメント（`M-D2: ... は co-modal.css の .modal-* に移管`）を残しており、再学習者への導線が明示

**配点 15 / 15**

---

## 3. 補足所見（デザイナー視点）

- モーダルシェルを `co-modal.css` 単体に切り出したことで、**M-D1（co-buttons）と並ぶ共通レイヤ成長パターン**が確立。今後 `co-modal.css` に `.modal-header-accent`（OB/SL で揺れていた header bg 色）や `.modal-body--compact` 等のバリアント追加が段階的に行える土台ができた
- 旧 z-index 500 → `--z-modal: 1000` への移行は、"トースト (1500+) より後、navbar (100) / dropdown (500-600) より前" という正しい階層を設計通りに戻す変更。機能的に後退するリスクゼロ
- `md-ob-cal-*` の compound class を温存した判断は、カレンダー固有の UI（絶対配置 × / ヘッダ padding-right / calendar body の overflow:visible）を壊さず、M-D2 のスコープ "シェル命名空間統合" に留める正しい境界設計
- `md-modal-site-*`（SL 現場詳細モーダル）/ `md-cn-*`（OB 変更通知）/ `md-nav-modal*`（共有マスタ）を触らず別フェーズ（M-D3）に送る方針は、1サブフェーズで過大な変更を避ける観点から適切
- `co-modal.css` 内の派生（`.modal-sm / -lg / -xl`）は現 M-D2 では `.modal-sm` のみ実使用だが、トークン `--modal-w-lg / -xl` の早期具体化によって WS / QA 移行で即座に `.modal-lg`（現場ポップアップ 600px）などが使える

---

## 4. 総合スコア

| 観点 | 配点 | 獲得 |
|------|----:|----:|
| A DS準拠（トークン・命名） | 25 | **25** |
| B カラーコーディネーション | 10 | **10** |
| D コンポーネント一貫性 | 25 | **25** |
| E 機能回帰（バグゼロ） | 25 | **25** |
| G コード品質・保守性 | 15 | **15** |
| **合計** | **100** | **100** |

**重大Claim: 0 / 合格ライン 70 点**

---

## 5. 判定

**合格（Pass）**

→ Phase M-D3（`.md-modal-site-*` / `.md-cn-*` / `.md-nav-modal*` 置換）または Phase M-E（バッジ体系）へ進行可。

---

## 6. ユーザー向けメモ

- ユーザー指示では「新DS `.modal / .modal-overlay / .modal-header / .modal-body / .modal-footer` を含むセクション」を参照せよとあったが、実ファイル `docs/ui-components/styles-light.css` には **プレフィクス `.modal-*` の5点セットは未定義**。実在するのは `.ob-modal-*`（L1262-1305）と `.modal-overlay / .modal-content / .modal-row / .modal-section / .modal-site-*` の別系統だった
- 指示内のトークン併記（`--modal-w-*` / `--z-modal`）と「プレフィクス無し `.modal-*` 名前空間」を採択する意図を尊重し、TD 段階で **`co-modal.css` にプレフィクス撤去版 `.modal-*` を新定義**として起こす判断を採択
- 将来 Phase M-G（旧エイリアス削除フェーズ）で styles-light.css 側の `.ob-modal-*` も `.modal-*` 正準化 → UI components 集と co-modal.css の命名が一致する状態に揃える予定
