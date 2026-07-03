# 03. 画面別適用設計（リファクタリング設計書）

**最終更新**: 2026-07-03
**実施順序の SSOT**: `docs/plan/mockup-refactor-plan.md`（R-3a〜R-3e。本書は「各画面で何をどう変えるか」の設計正本）
**前提**: R-1（DS 基盤 = ds-tokens.css / ds-components.css / 本文書群）完了済み。
通知カードの共通コンポーネント化・カテゴリ/対象日改修は **R-2 と同時**（本書では設計のみ示す）。

**凍結ルール**: R-3 の該当フェーズ外での本番モックへの先行適用は行わない（2026-06-12 ユーザー指示）。

---

## 1. 共通ターゲット骨格

全画面を SL 層モックで確立した骨格に揃える（例外: QA モバイル）。

```
.app
├ .menubar（濃紺・右端 .menu-user）
├ .toolbar（フラット・主操作1〜2個 + seg フィルタ + .stat-strip）
└ .workspace（grid: 72px | 1fr | 288px | 58px）
   ├ .rail（左: 作業面切替 + ベル + .cn-card オーバーレイ）
   ├ .main > .main-card（中央: 画面の主役ビュー。.grid-frame / .tbl-frame で彫り込み）
   ├ .prop > .prop-card（右: 選択対象のプロパティ編集）
   └ .panel-rail（右端: 右パネルのモード切替）
```

画面別の「中央メイン」と「右プロパティ」の役割（design-refresh-plan §4.7 で確定）:

| 画面 | 中央メイン | 右プロパティ |
| --- | --- | --- |
| SL 業務管理計画書 | SL 中央表（7列 + 変更履歴/備考列） | 現場詳細 / 社員配置 / 車両・ETC / 変更履歴（panel-rail 切替） |
| OB 受注簿 | 受注行テーブル（`.dtable.dense` 基調） | 請求先・現場住所・地図URL・SL/WS 連携状況 |
| WS 週間予定表 | 週単位の配置ボード | 週セルの社員・車両・応援予約・SL 反映差分 |
| LA 休暇申請管理 | 月カレンダー | 申請詳細・承認/差戻し・SL 配置影響 |
| QA Quick Access | クイック入力カード（モバイル前提） | 前回情報・単価・地図・不足項目（デスクトップ時） |
| 経理（D・未着工） | 確認フロー + 請求行（方向性サンプル段階） | 差分根拠・承認・差戻し理由 |

**編集モデルの転換**: 黒オーバーレイ中央モーダル編集 → 右プロパティ編集へ段階移行。
モーダルに残すのは 印刷プレビュー / ソート設定 / カラー設定 / 一括操作 / 削除確認 のみ（D-01 規範）。

## 2. 共通適用手順（1画面 = 1サイクル = 1コミット）

1. **CSS 読替**: `co-tokens.css`（および旧 DS 依存の共通 CSS）を外し、`ds-tokens.css` → `ds-components.css` の順で読込。
   キャッシュバスター `?v=N` を更新。**旧 co-tokens.css と新 ds-tokens.css の同時読込は禁止**（同名別値トークンあり）
2. **骨格再構成**: §1 の共通骨格へ再配置（menubar / toolbar / rail / main-card / prop / panel-rail）
3. **コンポーネント置換**: 画面固有 CSS を ds-components.css のクラスへ置換（§3 対応表）。
   置換しきれない画面固有スタイルは「ds のトークンのみ参照する画面 CSS」として残す（直書き hex 禁止）
4. **通知組込（R-2 成果物）**: ベル → `.cn-card` スライド表示、項目クリック → 該当セルへスクロール + `.is-selected` + `.cn-flash`
5. **回帰確認**: cn:jump 着地（スポットライト）/ 「元に戻す・やっぱり反映」/ seed 整合 / 画面固有機能（§4）
6. **Playwright 検証**: コンソールエラー0・1440px 基準・`screenshots/` へ保存 → コミット

## 3. 旧→新 対応表

### 3.1 トークン対応（co-tokens.css → ds-tokens.css）

| 旧（Plaster UI） | 新（Calm Operations） | 注意 |
| --- | --- | --- |
| `--bg-page` #E9F1F6 | `--bg` #eef4f8（body はグラデキャンバス） | モーダルボディ面は #E9F1F6 を継続使用（D-01） |
| `--bg-surface` | `--panel` / 浮きカードレシピ | — |
| `--bg-sidebar` #004554 | `.rail` 濃紺内面グラデ / `--blue-dark` | ティール帯は全廃 |
| `--divider` | `--line` / `--soft-line` | — |
| `--text-primary` #004554 | `--ink` #172b3a | — |
| `--text-secondary` / `--text-tertiary` | `--muted` #5a6b7a | — |
| `--accent-primary` #44A6B5 (teal) | `--blue` #1f5fae | 主操作・選択・区分すべて青系へ |
| `--accent-secondary` #E07856 (テラコッタ) | 廃止。警告は `--alert-*` 専用 | 装飾用途の暖色は禁止 |
| `--semantic-warning` 系 | `--alert-text/bg/border`（Signal Orange） | — |
| `--semantic-error` #DB577B | 廃止。夜間=`--night-text` / 警告=`--alert-*` に分離 | ピンク系エラー色は使わない |
| `--semantic-success` 緑 | 原則廃止（正常は緑で主張しない）。在席ドットのみ緑 | — |
| `--cat-bg-*` / `--cat-text-*`（区分4色相） | 廃止。区分は青一色（`.tag` / `.category-badge`） | **色相分化は不採用** |
| `--radius-sm` 4px | `--radius-xs` 4px | **同名別値に注意**（新 `--radius-sm`=8px） |
| `--radius-md` 8px | `--radius-sm` 8px | 同上 |
| `--radius-lg` 12px / `--radius-xl` 16px | `--radius-md` 14px / `--radius-lg` 20px（近似） | 近似置換。見た目差はスクショで確認 |
| `--elevation-1..5` | 同名・**別値**（青灰 rgba 系） | 読替のみで自動適用 |
| `--fw-*` 400..800 | 400〜700 のみ（800 廃止。太字強調は 700 まで） | フォント読込も 400-700 |

### 3.2 新 DS に未定義のギャップ（R-3 実施時にユーザー判断が必要）

| 旧トークン | 内容 | 扱い案 |
| --- | --- | --- |
| `--day-sat/--day-sun` 系 | WS/OB の曜日別セル色 | 新 DS の意味色体系（青灰/夜間赤/警告橙）と整合する曜日色を要決定 |
| density（`--tbl-row-h` 3段切替） | compact/comfortable/spacious | 新 DS は `.dtable`/`.dtable.dense` の2段。3段切替の要否を要判断 |
| `--duration-*` / `--ease-*` / `--z-*` / `--modal-w-*` | モーション・z 層・モーダル幅 | 名前衝突なし。当面旧定義を移植して併用可（ds-tokens へ正式移設はユーザー判断） |
| `--chart-*` | グラフ配色 | 経理 D 着工時に新 DS 準拠で再定義 |

## 4. 画面別設計

順序（提案・調整可）: **R-3a SL → R-3b OB → R-3c WS → R-3d LA → R-3e QA**。

### R-3a SL `screen-layout.html` — 新 DS の基準画面

- プレビュー（design-refresh-sl-layer-mockup.html）で確立した中央表・右プロパティ・レールを**本番 SL へ移植**する位置づけ。骨格差分が最小の画面
- 中央表 7 列構成: 区分 / 契約先・現場名 / 集合 / 時間 / 人数 / 配置 / 車両・ETC（+ 変更履歴/備考列）。列は削らない（情報量維持が絶対条件）
- 夜間行: `.night-text` を行内の文字系要素へ。警告は `.warn-icon`/`.person-warn` に集約
- **着手前の前提**（mockup-refactor-plan §5): 右プロパティ4モードの情報粒度確認。所属カラーは淡パステル8色パレットで確定済み
- 固有注意: 配置 D&D・区分円 GC 色（belong 連動）・`smCategoryClassMap`/`smShiftClassMap` の命名維持

### R-3b OB `order-book.html`

- 中央: `.dtable.dense` 基調の高密度受注テーブル。罫線を増やさず余白で詰める。日付セルの淡色ベタ埋めを廃し、数値を `tabular-nums` で立てる
- タイトル帯+ナビ帯の濃色2段重ねを解消（濃色はメニューバー1段のみ）
- **固有機能の維持**: 行削除→復旧トグル（localStorage フラグ単一真実源 + `cn:action` ボタン機構 + グリッド増減時の cellData 再マップ）
- 通知: 日またぎ現場は対象日基準（R-2 の targetDate）

### R-3c WS `weekly-schedule.html`

- 中央: 週単位配置ボード。休み行・修理行・予約行・現場行の「色面だらけ」を面の濃淡+左端小ラベルへ整理（ピンク系注意色は警告オレンジ/情報青灰の体系へ吸収）
- **固有機能の維持**: schedule 発火 19 箇所（削除8+追加9+移動2 / N-6）を全維持
- `wsVehiclesData` / `wsSitesData` の共通ソース統一は別課題（mock-data-unification-plan 残件）— 本フェーズで混ぜない
- 通知: 週間=対象日範囲

### R-3d LA `leave-application.html`

- 中央: 月カレンダー。承認状態は意味色体系（承認待ち=情報青灰 / 要対応=警告橙 / 承認済み=ニュートラル）
- **固有機能の維持**: 画面別 target マップ（N-6。SL 用 `empName` 軸 + `slCnFocusLeaveEmployee` 着地）、approval 独立カテゴリ
- 右プロパティ: 申請詳細 + 承認/差戻し + SL 配置影響

### R-3e QA `quick-access.html`

- モバイル前提のため共通骨格の**例外**: レール/右プロパティは適用せず、カード型入力フローに ds コンポーネント（btn / input / seg / lite-card / toast）を適用
- 通知はトースト維持（レール通知カードは適用外）。QA 登録現場フィルタ維持

### 通知センター（プレビュー）/ admin-notify

- センター: 新 DS 準拠済み。R-4 でスレッド領域簡素化・日別軸=対象日化・配置サブタグフィルタ（実施順序は計画書）
- admin-notify: 表示確認のみ（4分類+サブタグ表示は R-2 に追従）

## 5. 全画面共通の技術的注意（SHARED-MEMORY 由来・違反禁止）

- script 読込順序を変えない（`co-mock-store.js` が `co-navbar.js` より先）
- N-5 のクロス画面遷移は `cnJump`（URL パラメータ・同タブ遷移・`history.replaceState` で除去）。`window.open(_blank)` に戻さない
- 通知ジャンプ着地の全画面スポットライト（`showFocusOverlay`）は変更しない
- seed・SelfNotify の `target` に固定文字列を書かず、実画面 DOM か `co-mock-store.js` の実値から動的取得
- 共通シード済み初期通知をページ側 `setItems(...)` で上書きしない
- `mock.oms.state.v1` の構造変更を伴う作業（R-2）は Codex と期間調整し、構造的変更の警告表へ追記

## 6. 完了基準（全画面共通）

- 主操作 / 現在位置 / 注意 / 通常情報が一目で区別できる（ボタンの主従・意味色）
- 罫線密度が下がり行グループの読み取りが上がる（縦罫線なし）
- 色の意味が 01 §3 の表で説明できる（説明できない色が残っていない）
- 既存の高密度業務操作・一覧性・既存機能（§4 固有機能）を損なわない
- 直書き hex が残っていない（ds-tokens のトークン参照のみ）
- Playwright: コンソールエラー0 + スクリーンショット保存 + 1画面1コミット
