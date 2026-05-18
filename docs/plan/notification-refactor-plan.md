# 変更通知システム リファクタリング — 統合計画書

**最終更新**: 2026-05-16
**ステータス**: Phase N-2.2（通知基盤本実装）完了 / Phase N-3（SL応援統合）未着手
**対象**: 全モックアップ（OB / SL / WS / LA / QA）+ 共通ナビバー
**起点**: 社内モックアップレビュー（2026-05-14）

このドキュメントは「変更通知システムの再設計＋付随するSL応援統合＋グループ間応援の受注自動生成」を、会話を跨いで継続するためのもの。新会話ではまず本ファイルを読み、未着手のフェーズから作業を再開すること。

---

## 1. 背景・目的

### 1.1 社内レビューで上がった要望
- 各モックアップの変更内容を **画面別の独立した変更通知モーダル** にし、共通ツールバーに常時並べて表示
- 開いていない画面（他のモックアップ）の変更状況がすべて分かるようにしたい
- SL/WS の変更通知が現状「OBで変更された内容」を通知する仕様 → **各画面が自領域の変更を発信する仕様** へ
- SL では社員/車両/応援/応援予約 の配置変更を通知してほしい

### 1.2 既存通知アーキテクチャの限界
- 共通ナビバーに「変更通知（全画面共通）」ベル1個 → マスタ更新・休暇申請承認待ち等の横断系のみ
- 各画面（OB/SL/WS/QA/LA）に画面固有ベル → 行単位の変更
- → 「他画面で何が起きているか」を一望できる構造になっていない
- → 通知の責務が「閲覧者軸」と「発信元軸」で曖昧に混在

### 1.3 リファクタの3層構造
本リファクタは以下3層を含む。依存関係があるため Phase 分割で順次実装する。

| 層 | テーマ | 内容 |
|----|--------|------|
| ① | 変更通知システム再設計 | ナビバーにテーマ別ベル横並び。責務モデル変更 |
| ② | SLへの応援機能統合 | WSの応援/応援予約データを SL が引き継ぎ |
| ③ | グループ間応援の受注自動生成 | 他GC社員配置で受注行を自動生成・完全ロック表示 |

---

## 2. 会話で確定した仕様（Q番号付き）

| Q | 論点 | 決定 |
|---|------|------|
| Q1 | 計画書構造 | 新規統合計画書 `docs/plan/notification-refactor-plan.md` を作成。既存 ws-support-partner 等とは依存関係を明記 |
| Q2 | ナビバーのベル配置 | **画面別ベルを横並びで複数配置** |
| Q3 | 既存「画面横断通知」の扱い | テーマ別に独立ベル化（休暇申請 / 車両スケジュール / マスタ更新 などをそれぞれ独立ベル） |
| Q4 | SLの「配置変更」検知範囲 | 社員 / 車両 / 応援 / 応援予約（追加・削除・変更）すべて |
| Q5 | SL応援機能の現状 | SLには応援が未実装。本リファクタで同時実装。WSとデータ密接のため、WSの応援/応援予約データを SL が引き継ぐ |
| Q6 | グループ間応援時の受注自動生成 | 他GCの社員を現場に配置 → 契約先=配置先現場の契約先、現場名=社員所属GC側の現場相当 で受注行を自動生成 |
| Q7 | 自動生成行の編集ロック | **完全ロック**（クリック不可・黒透過オーバーレイ・セル編集不可・SL側削除で自動同期削除） |
| Q8 | 発信元軸 vs 閲覧者軸の矛盾解決 | 通知データに `affects[]` を持たせる + 文脈ジャンプ方式（パターンA） |
| Q9 | フラッシュ不可時のクリック挙動 | **詳細をインライン展開のみ表示。画面遷移は明示ボタンによる任意操作** |
| Q10 | 計画書内の組み込み位置 | クロス画面フラッシュ設計は独立章として追加 |
| Q11 | ベル並び順・ラベル・アイコン | Phase N-1（UIモック先行）で確定。本計画書策定時点では未確定 |

---

## 3. 全体設計方針

### 3.1 通知の責務モデル
**原則**: 各画面は自領域の変更のみを発信する。

| 発信元 | 通知対象 |
|--------|---------|
| OB | 受注の追加 / 変更 / 削除 |
| SL | 社員 / 車両 / 応援 / 応援予約 の配置変更 |
| WS | 週間予定 / 応援予約 / 休バッジ の変更 |
| LA | 休暇申請の追加 / 承認 / 却下 |
| 横断系（マスタ更新 / 車両スケジュール / 休暇承認待ち 等） | テーマ別に独立ベル化 |

### 3.2 ベルの分類軸
**発信元軸**（誰が変更したか）でベルを分類する。並びイメージ:

```
[OB🔔3] [SL🔔1] [WS] [LA🔔2] │ [休暇申請🔔1] [車両スケ] [マスタ🔔1]
```

ご要望「他画面の変更状況を一望できる」を満たす。

### 3.3 クロス画面フラッシュの矛盾と解決
「発信元軸」分類だけでは、SL作業中のユーザーが OB変更の波及を SL上で確認できない。
→ 通知データに `affects[]` を持たせ、クリック時の **文脈ジャンプ** で吸収（§6で詳述）。

### 3.4 既存計画との関係（要点）
- `ws-support-partner-plan.md` Phase A5 以降と本計画 Phase N-3 はスコープ重複あり → 本計画優先
- `leave-application-plan.md` の LA画面ベル設計は本計画に従う
- `leave-vehicle-schedule-plan.md` の車両スケジュール変更通知は独立ベル化

### 3.5 通知ログの保存ポリシー
通知ログは肥大化を避けるため、以下のポリシーで運用する。

**スコープの明確化**
- 本計画は **フィードログ**（通知ベルに表示する操作履歴）のみを対象とする
- **監査ログ**（法的・運用監査のための恒久的記録）は別系統で扱う（本計画スコープ外）
- 「自動生成受注行」のようなビジネスデータ本体は別テーブルで永続保存（受注テーブル本体）

**保存期間ルール**

| ステータス | 経過期間 | 扱い |
|----------|---------|------|
| 未読 | 期限なし | アクティブテーブルに保持 |
| 既読 | 〜30日 | アクティブテーブルに保持（履歴タブで表示） |
| 既読 | 30日経過 | アーカイブテーブルへ移動（参照は可能だが通常表示外） |
| 既読 | 1年経過 | 削除 or 圧縮保存（運用判断） |

**データ量試算**
- 通知1件 ≒ 400バイト（拡張 affects/target 含む）
- 1日平均 約270件発生（社員50人規模を想定）
- 年間累積 約40MB → 10年で約400MB（PostgreSQL として全く問題ない規模）

**DB設計要件**（Phase N-2 で具体化）
- 複合インデックス: `(source, created_at)` / `(user_id, read, created_at)`
- アーカイブ移動はバッチ処理（日次 cron）
- 詳細は `docs/03_データベース設計.md` で確定

---

## 4. Phase 構成（依存順）

```
N-1:   UIモック先行 — ベル並び・パネル設計の確定
        ↓
N-2.1: 統合プレビュー（27スロットのアイコン確定）
        ↓
N-2.2: 通知基盤本実装（co-navbar / co-notify-panel 改修・7ベル横並び）
        ↓
N-2.3: 旧画面ベル撤去 + OB/WS/LA 自領域発信化
        ↓
N-2.4: 通知タイプ分類の細分化（業務行/セル等の粒度設計・アイコン拡充）
        ↓
N-3:   SLへの応援機能統合 + SL 自領域発信化（同時実施）
        ↓
N-4:   グループ間応援の受注自動生成（完全ロック行）
        ↓
N-5:   クロス画面フラッシュ実装（affects/target 配線）
        ↓
N-6:   結合テスト・既存計画との整合性確認
```

各 Phase は独立コミット可能な単位とし、**ユーザーレビューを経て次に進む**（Phase Gate Rules 準拠）。

### Phase N-1: UIモック先行
- 共通ナビバーに置く全ベルの並び順・ラベル・アイコンを確定（モック比較レビュー）
- パネル内レイアウト（タブ/フィルタ/履歴の有無）を統一化
- 自動生成行のオーバーレイ色値も併せて確定
- アイコンは `docs/assets/icons/` から採用（CLAUDE.md「アイコン運用ルール」遵守）

### Phase N-2: 変更通知システム基盤実装
N-2.1〜N-2.3 の3サブフェーズで段階実装。

#### N-2.1: 統合プレビュー（完了）

- `docs/preview/notify-compare.html` に 27スロット選定 UI を追加（詳細は §13）

#### N-2.2: 通知基盤本実装（完了）

- `co-navbar.js` の `mdNavCnAnchor` を「ベルコンテナ」に拡張
- ベル定義テーブル（`coNotifyBells = [{ id, label, icon, scope }]`）導入
- `co-notify-panel.js` を「複数アンカー対応 + P3 ハイブリッドパネル」化
- 既読・件数バッジをベル単位で独立管理
- API群（`setItems` / `addItem` / `removeItem` / `setHistory` / `updateBadge` 等）公開（§14）

#### N-2.3: 旧画面ベル撤去 + OB/WS/LA 自領域発信化（未着手）

- 4画面（OB/SL/WS/LA）のHTMLから旧 `cn-anchor` ブロックと旧トースト DOM を削除
- 旧ベル関連JS群（`obCnOpenModal` / `openChangeNotifyModal` 等）を撤去
- 行単位ベル機能（`md-ob-row-bell` / `cnOpenModalForRow`）も撤去（ユーザー判断、2026-05-18）
- 旧トーストは単純削除（必要になれば後追いで新システムに移植、ユーザー判断 2026-05-18）
- 各画面のCRUD操作箇所に `window.coNotifyPanel.addItem(bellId, item)` を埋め込んで自領域発信化
- 既存デモ通知を新ベルへ移植（OB→bell-ob, WS→bell-ws, LA→bell-la）
- SL の自領域発信化は N-3 と同時実施（SL応援が未実装のため）
- quick-access のモバイル独自ベル（`qa-cn-anchor`）は今回スコープ外（ユーザー判断 2026-05-18）
- 詳細は §15

### Phase N-3: SL応援機能統合 + SL自領域発信化

- WSの応援バッジ・応援予約データ構造を SL に移植
- SLサイドバーに応援セクション追加
- WS ⇔ SL のデータ同期モデル定義（単一情報源は WS、§7.2 参照）
- 同時に SL の自領域発信化（社員/車両/応援/応援予約 の配置変更を発信）

### Phase N-4: グループ間応援の受注自動生成
- 配置イベント検知ロジック（GC跨ぎ判定）
- 自動生成行のデータ構造（`isAutoGenerated: true`, `sourceSiteId`）
- 完全ロックUIの実装（黒透過オーバーレイ + `pointer-events: none`）
- 同期削除ロジック
- 経理画面D（グループ間請求）への波及確認

### Phase N-5: クロス画面フラッシュ実装
- 通知データへの `affects[]` / `target` 追加
- `cn:jump` イベントの拡張（§6.5 参照）
- 文脈判定ロジック（現在画面が affects に含まれるか）
- フラッシュ不可時のインライン詳細展開
- 「○○画面で開く ↗」明示ボタン（新タブで遷移）

### Phase N-6: 結合テスト・整合性確認
- 既存 ws-support-partner-plan / leave-application-plan との整合性チェック
- 通知イベント網羅マトリクス検証
- レビュー後に Phase 2.5（モックアップ検証）の対象として登録

---

## 5. ベル設計詳細

### 5.0 確定アイコン定義（Phase N-1 完了）
ベル7個 + アイテムタイプ20個 のアイコン割り当ては **`docs/preview/notify-icons-selected.json`** で確定済み（2026-05-14）。

- 選定ツール: `docs/preview/notify-compare.html` の [アイコン選定] モード
- 共通基盤: `docs/mockup/co-icon-picker.{js,css}`（汎用アイコンピッカー、他モックアップにも流用可）
- Phase N-2 着手時、`co-navbar.js` のベル定義テーブルおよび `co-notify-panel.js` の通知アイテムアイコン解決ロジックにこのJSONを反映する

### 5.1 確定ベル一覧（Phase N-1 完了 / 2026-05-15 確定）

並び順は **業務頻度順（案A）** を採用。「受注 → 計画 → 配置 → 申請」の業務フローと一致し、OBを情報設計の起点とする思想に整合。

表示は **アイコンのみ + ホバーツールチップ**、画面別と横断系を **縦仕切り** で区切る。

| 表示順 | カテゴリ | ベルID | 通知対象 | 発火元画面 |
|--------|----------|--------|----------|------------|
| 1 | 画面別 | OB | 受注の追加/変更/削除 | order-book |
| 2 | 画面別 | SL | 社員/車両/応援/応援予約 の配置変更 | screen-layout |
| 3 | 画面別 | WS | 週間予定・応援予約・休バッジ変更 | weekly-schedule |
| 4 | 画面別 | LA | 休暇申請の追加/承認/却下 | leave-application |
| 5 | 横断 | 休暇申請承認待ち | DCP承認待ち件数 | leave-application (status=pending) |
| 6 | 横断 | 車両スケジュール | 車両スケ変更 | leave-application (車両モード) |
| 7 | 横断 | マスタ更新 | 各種マスタ追加/変更 | マスタ管理画面 |

縦仕切りは **表示順4（LA）と 5（休暇申請承認待ち）の間** に配置。

選定経緯: `docs/preview/notify-compare.html` の [ベル並び] モードで A/B/C/D 4案を比較。案A（業務頻度順）採用。

### 5.2 ベル単位の独立性

- 既読・件数バッジは **ベルごとに独立**
- 「すべて既読」ボタンは各ベルのパネル内に配置
- 全ベル一括既読は本計画スコープ外（要望があれば後追加検討）

### 5.3 UI幅対策（Phase N-1 確定方針）

- **アイコンのみ表示モード** を採用（ホバーでツールチップ）。これでベル7個でも幅圧迫は問題なし
- 動的折り畳み・重要度別優先表示は本計画スコープ外（必要になれば後追加）

### 5.4 パネル統一仕様（Phase N-1 完了 / 2026-05-15 確定）

採用: **ハイブリッド（案P3）**。「最新」タブはシンプル、「履歴」タブのみフィルタ＋軸別ピッカー付与。通常運用＝最新タブ、遡及調査＝履歴タブで使い分けを明確化。

| 部位 | 仕様 |
| ---- | ---- |
| パネル幅 | 約 320px（既存 `.cn-panel` 準拠） |
| ヘッダー | タイトル「{ベル名}の変更通知」+ 右側「すべて既読」ボタン |
| タブ | 「最新」 / 「履歴」の2タブ |
| 最新タブ | 日付グループ（今日 / 昨日 / N日前）+ アコーディオン展開可能アイテム。フィルタなし |
| 履歴タブ | 種別フィルタチップ（すべて / 追加 / 変更 / 削除 等）+ 軸別ピッカー（契約先/現場/操作者）+ 既存 `cn-body--history` レイアウト |
| アイテム | 左アイコン（種別色 + 種別シンボル）+ 中央テキスト（main/sub）+ 右シェブロン（差分ありのみ） |
| 動作 | 追加/削除はクリックで直接ジャンプ。変更はアコーディオン展開で差分表示 |

選定経緯: `docs/preview/notify-compare.html` の [パネルレイアウト] モードで P1（After方向）/ P2（History方向）/ P3（ハイブリッド）を比較。P3採用。

---

## 6. クロス画面フラッシュ設計 ★独立章

### 6.1 問題定義
ベルを「発信元軸」で分類すると、変更が複数画面に波及するケースで以下の矛盾が生じる:

| 変更発生元 | 波及先 | 現状の挙動 | 素朴なリファクタ後の挙動 |
|----------|--------|----------|----------------------|
| マスタ更新（現場名変更） | OB / SL / WS 全行 | 各画面で該当行フラッシュ | マスタ更新ベルのみ |
| OB受注の現場/日付変更 | SL / WS 該当日 | SLでフラッシュ | OBベルのみ |
| SL配置変更（グループ間応援発生） | OBに自動行追加 | — | SLベルのみ |
| WS応援予約追加 | SLにも応援表示 | — | WSベルのみ |

→ SL作業中のユーザーが、自分の画面に影響する変更を見逃す。

### 6.2 解決方針（パターンA採用）
通知データに **波及先リスト `affects[]`** と **画面別ターゲット `target`** を持たせる。

```js
// 通知データ構造（拡張後）
{
  id: 'cn-...',
  source: 'OB',                  // 発信元画面（どのベルに入るか）
  type: 'change',                // add | change | delete
  affects: ['OB', 'SL', 'WS'],   // 波及する画面のリスト
  target: {                      // 各画面でのフラッシュ対象
    OB:  { axis: 'orderId',  value: 'O-2026-0123' },
    SL:  { axis: 'siteCode', value: 'S-042' },
    WS:  { axis: 'siteCode', value: 'S-042' }
  },
  title: '...',
  desc:  '...',
  time:  '...'
}
```

### 6.3 文脈ジャンプロジック
通知アイテムクリック時:

```
1. 現在画面 (currentPage) を取得
2. currentPage が affects に含まれるか？
   - Yes → その場で target[currentPage] を使ってフラッシュ
           （画面遷移なし、パネルは閉じる）
   - No  → アコーディオン展開でインライン詳細表示のみ
           （勝手に画面遷移しない）
3. 詳細表示内の「○○画面で開く ↗」ボタン押下時:
   - 該当画面を新タブで開き、target を URLパラメータで渡してフラッシュ起動
```

### 6.4 フラッシュ不可時の振る舞い（確定仕様）
- **作業中の画面が勝手に切り替わらないこと** を最優先
- アコーディオン展開で詳細テキスト（誰が何を変えたか）を表示
- 「○○画面で開く ↗」ボタンを明示的に配置（任意操作）
- 新タブ遷移なら現在作業が失われない

### 6.5 `cn:jump` イベントの拡張仕様

```js
// 現状
item.dispatchEvent(new CustomEvent('cn:jump', {
  bubbles: true,
  detail: { item }
}));

// 拡張後
item.dispatchEvent(new CustomEvent('cn:jump', {
  bubbles: true,
  detail: {
    item,
    source: 'OB',
    target: { axis: 'orderId', value: 'O-...' },
    inContext: true   // 現在画面で処理する場合 true / 別画面遷移なら false
  }
}));
```

各画面のリスナーは `inContext === true` の場合のみフラッシュ起動する。

---

## 7. SL応援統合 詳細

### 7.1 現状
- SL（screen-layout）には応援機能未実装
- WS（weekly-schedule）には応援バッジ・応援予約行が実装済（ws-support-partner-plan Phase A1〜A4 完了 + A10〜A15 完了）

### 7.2 統合方針
WSが先行実装した応援データ構造を **単一情報源（SSOT）** とし、SLはそれを参照・操作する。
- データ実体: WS の `supportPartners` / `supportReservations`
- SL は同データに対する別ビュー
- どちらで変更しても同じデータが更新される

### 7.3 SL UIへの組み込み
- SLサイドバーに応援セクション追加（WSと同様のバッジレイアウト）
- SLカレンダーセルに応援バッジを配置可能（D&D / 編集）
- SLでの配置変更は WSにも即時反映

### 7.4 ws-support-partner-plan との関係
- Phase A5（協力業者マスタ管理）以降は本計画 Phase N-3 と統合
- ws計画書側にも本計画への参照リンクを追記する（Phase N-3 着手時）

### 7.5 未確定事項（Phase N-3着手時に詰める）
- WS側の応援予約モーダルを SLでも使うか、SL専用UIを作るか
- バッジのD&Dスコープ（SLとWSを跨いだD&Dは可能か）
- SLにおける応援バッジの視覚仕様（WSの「応援バッジ統合化」と同等か）

---

## 8. グループ間応援 受注自動生成 詳細

### 8.1 トリガー条件
- SL（または WS）で社員を現場に配置
- かつ「**社員所属GC ≠ 現場の契約先GC**」
- 例: 東央警備の現場に Nikkeiホールディングス社員を配置 → トリガー発火

### 8.2 自動生成される受注行の仕様

| 項目 | 値 |
|------|---|
| 契約先（クライアント） | 配置先現場の契約先GC（例: 東央警備） |
| 現場名 | 配置社員所属GC側の現場相当（詳細ロジックは Phase N-4 で確定） |
| 日付 | 配置日 |
| 配置社員 | 該当社員 |
| isAutoGenerated | `true`（編集ロックフラグ） |
| sourceSiteId | 元現場ID（同期削除用） |
| sourceEmployeeId | 元配置の社員ID |

### 8.3 完全ロックUI仕様（Phase N-1 完了 / 2026-05-15 確定）

オーバーレイ案は **斜線パターン（案OL-D）** を採用。文字の可読性を最優先しつつ「無効・編集不可」のメタファが直感的に伝わる。

- 行全体に **斜線パターンオーバーレイ** を被せる（ロックアイコン列は除外）

  ```css
  background:
      repeating-linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.08) 0,
          rgba(0, 0, 0, 0.08) 6px,
          transparent 6px,
          transparent 12px
      ),
      rgba(255, 255, 255, 0.30);
  ```

- `pointer-events: none` でクリック不可
- セル編集モーダルは開かない
- ホバー時カーソルは `not-allowed`
- 視覚的に「自動生成・編集不可」と一目で分かるスタイル
- 行頭にロックアイコン表示（仮: `stationery/im-11244-kagi-no-toji-ta-jou.svg`、正式選定は Phase N-4）

選定経緯: `docs/preview/notify-compare.html` の [自動生成行] モードで OL-A〜OL-D 4案を比較。OL-D採用。

注意: PDFエクスポート・印刷では斜線パターンの再現性が低いことがあるため、経理画面D 実装時に印刷用CSSで代替表現（罫線、フッター注記等）を検討する。

### 8.4 同期削除ルール
- SL側の対応する配置が削除されたら、自動生成行も自動削除
- 自動生成行を直接削除する操作は不可（編集ロック）
- 同期は配置イベント駆動（配置追加 → 自動行追加、配置削除 → 自動行削除）

### 8.5 経理画面D（グループ間請求）への波及
- 自動生成された受注行は経理画面D の「グループ間請求対象」として集計対象になる
- 経理画面D は未着手のため、本計画では **データフラグ（`isAutoGenerated`, `sourceSiteId`）を残すまで** をスコープとする
- 経理画面D 実装時に集計ロジックを接続

### 8.6 未確定事項（Phase N-4着手時に詰める）
- 現場名フィールドの自動決定ロジック（双方向に対応する現場マスタの登録が必要？）
- 同社員が複数日連続配置された場合の自動行のまとめ方
- 単価・金額の自動計算ルール（マスタ参照 / 固定値 / 後日経理画面D で入力）
- 削除時のロールバック動作（自動行削除が SL側に逆波及しない保証）

---

## 9. 既存計画との関係

| 既存計画 | 関係 | 対応 |
|---------|------|------|
| ws-support-partner-plan.md | Phase A5 以降と Phase N-3 がスコープ重複 | 本計画優先・ws計画書側に参照リンク追記 |
| leave-application-plan.md | LA画面ベル設計を本計画に追従 | LA計画書側に本計画へのリンク追記 |
| leave-vehicle-schedule-plan.md | 車両スケジュール変更通知を独立ベル化 | 車両計画書側に本計画へのリンク追記 |
| ui-components-improvement-plan.md | co-notify-panel の見た目改修と連動 | Phase N-1 でUI調整を統合検討 |
| ds-migration-plan.md | 完了済。本計画の新UIは新DS準拠で作成 | — |

---

## 10. 影響ファイル一覧

### 共通基盤
- `docs/mockup/co-navbar.js` — ベル多重化・ベル定義テーブル導入
- `docs/mockup/co-navbar.css` — ベル横並びレイアウト
- `docs/mockup/co-notify-panel.js` — 複数アンカー対応・affects/target 拡張
- `docs/mockup/co-notify-panel.css` — 自動生成行オーバーレイ・パネル微調整
- `docs/mockup/co-modal.css` — 必要に応じて

### 画面別
- `docs/order-book.html` + `docs/mockup/order-book.{js,css}` — 自領域発信化・自動生成行レンダラー
- `docs/screen-layout.html` + `docs/mockup/screen-layout.{js,css}` — 応援統合・配置変更検知・自動生成トリガー
- `docs/weekly-schedule.html` + `docs/mockup/weekly-schedule.{js,css}` — 自領域発信化・SLとのデータ同期
- `docs/leave-application.html` + `docs/mockup/leave-application.{js,css}` — 自領域発信化・車両モード分離
- `docs/quick-access.html` + `docs/mockup/quick-access.{js,css}` — ベル統合確認

### ドキュメント
- `docs/plan/ws-support-partner-plan.md` — 本計画への参照追記
- `docs/plan/leave-application-plan.md` — 本計画への参照追記
- `docs/plan/leave-vehicle-schedule-plan.md` — 本計画への参照追記
- `docs/01_要件定義.md` — 通知システム要件の更新
- `docs/03_データベース設計.md` — 通知テーブル・自動生成受注フラグの設計

---

## 11. リスク・未確定事項

### リスク
| 項目 | リスク内容 | 対策 |
|------|----------|------|
| データ同期 | SL/WS の応援データが二重管理になる可能性 | WSを単一情報源にする（§7.2） |
| 自動生成ループ | 自動行追加 → さらに自動生成 が連鎖する可能性 | `isAutoGenerated` 行は配置イベントを発火しない |
| UI幅圧迫 | ベル7個程度を横並びすると幅が足りない | アイコンのみ表示 or 動的折り畳み（Phase N-1） |
| 既読の二重定義 | クロス画面フラッシュで「OB側で既読化したがSL側で未読」 | パターンA採用により単一通知（複数ベルにミラーリングしない）→ 既読は単一状態 |
| 経理画面D 未着手 | 自動生成行の経理側仕様が未確定 | データフラグだけ確定し、集計ロジックは経理画面D 実装時に接続 |
| データ量肥大 | 通知ログが恒久蓄積されると履歴タブ性能・バックアップ容量が悪化 | §3.5 保存ポリシー（既読+30日アーカイブ / 1年で削除）と複合インデックスで対策 |

### 未確定事項（Phase 着手前に詰める）
- ベル並び順・ラベル・アイコン（Phase N-1）
- パネル内のレイアウト統一仕様（Phase N-1）
- 自動生成行のオーバーレイ色値（Phase N-1）
- WS⇔SL のD&Dスコープ（Phase N-3）
- 自動生成行の現場名決定ロジック詳細（Phase N-4）
- 自動生成行の単価・金額決定ルール（Phase N-4 〜 経理画面D 実装時）

---

## 12. Phase 進行履歴

| Phase | 状態 | 開始日 | 完了日 | 備考 |
|-------|------|--------|--------|------|
| N-0 構想 | 完了 | 2026-05-14 | 2026-05-14 | 本計画書策定 |
| N-1 UIモック | 完了 | 2026-05-14 | 2026-05-15 | アイコン定義確定（`docs/preview/notify-icons-selected.json`）／ベル並び順確定（案A 業務頻度順）／パネル統一仕様確定（案P3 ハイブリッド）／自動生成行オーバーレイ確定（案OL-D 斜線パターン）。残課題: ロックアイコン正式選定は N-4 で実施 |
| N-2.1 統合プレビュー | 完了 | 2026-05-15 | 2026-05-16 | `docs/preview/notify-compare.html` に「N-2 統合」モード追加。7ベル+専用P3パネル+クロス画面ヒント+履歴タブ（縦タブ/軸別ピッカー）+ アイコン編集トグル+IconPicker連動。実画面を見ながら27スロット（ベル7+共通4+パネル別16）を全件再選定し `notify-icons-selected.json` を確定。詳細は §13 参照 |
| N-2.2 通知基盤本実装 | 完了 | 2026-05-16 | 2026-05-16 | `co-navbar.{js,css}` + `co-notify-panel.{js,css}` 改修。7ベル横並び+P3ハイブリッドパネル+アコーディオン+クロス画面ヒント+履歴タブ完全実装。詳細は §14 参照 |
| N-2.3 旧ベル撤去+OB発信化 | 進行中（OB完了） | 2026-05-18 | — | OB の旧 `cn-anchor` / 行ベル / トースト / コンフリクトバナー / デモシーケンス撤去完了 (commit 2405df7)。「すべて既読」後の addItem 再描画で is-unread が復活するバグも修正 (commit d32afa1)。WS/LA は N-2.4 完了後に着手 |
| N-2.4 通知タイプ分類細分化 | 未着手 | — | — | 全画面で「業務行追加」と「セル人数追加」など趣旨の異なる操作が同一タイプにまとめられている問題に対応。type/slot/アイコン/表示テンプレートを再設計。詳細は §16 |
| N-3 SL応援統合+SL発信化 | 未着手 | — | — | ws-support-partner と統合、SL自領域発信化を同時実施 |
| N-4 自動受注生成 | 未着手 | — | — | — |
| N-5 クロスフラッシュ | 未着手 | — | — | — |
| N-6 結合テスト | 未着手 | — | — | — |

---

## 13. Phase N-2.1 統合プレビュー 完了サマリ（2026-05-16）

### 13.1 成果物
- **N-2 統合モード** を `docs/preview/notify-compare.html` に追加（モードボタン「N-2 統合」）
  - 7ベル横並び（縦仕切りで画面別/横断を分離）
  - ベルクリック → 専用 P3 ハイブリッドパネル切替（同時1パネルのみ表示）
  - 最新タブ（日付グループ + アコーディオン）/ 履歴タブ（縦タブ + 軸別ピッカー + フィルタチップ）
  - パネル別バッジ件数表示 / 「すべて既読」でバッジ0化
  - クロス画面ヒント: アコーディオン展開時に「現在画面で開く」または「他画面で開く ↗」表示。現在画面セレクタで判定切替
  - アイコン編集トグル: ON時に各ベル/アイテムに ✎ オーバーレイ。クリックで IconPicker 起動

### 13.2 アイコン選定値（2026-05-16 確定）
`docs/preview/notify-icons-selected.json` に確定値。27スロット全件:

- ベル7個: bell-ob / bell-sl / bell-ws / bell-la / bell-pending / bell-vehicle / bell-master
- 共通タイプ4個（SL/WSで参照）: type-employee / type-vehicle / type-support / type-reservation
- パネル別タイプ16個:
  - OB: type-ob-add / modify / delete
  - SL: type-sl-auto
  - WS: type-ws-schedule-change / leave-reflect
  - LA: type-la-new / approve / reject
  - 承認待ち: type-pending-wait
  - 車両: type-vehicle-add / modify / delete
  - マスタ: type-master-add / modify / delete

### 13.3 ストレージ仕様
- localStorage キー: `notifyIconSelections.v1`（既存アイコン選定モードと共有）
- フラット構造: `{ [slotKey]: "category/file.svg", ... }`
- N-2 編集モードでもアイコン選定モードでも双方向に反映
- 「📋 JSON出力」ボタンでクリップボードコピー可能（既存）

### 13.4 N-2.2（本実装）への引き継ぎ要点
1. **対象ファイル**
   - `docs/mockup/co-navbar.js` の `mdNavCnAnchor` を「ベルコンテナ」に拡張
   - `docs/mockup/co-navbar.css` のベル横並びレイアウト
   - `docs/mockup/co-notify-panel.js` を複数アンカー対応 + P3 ハイブリッドパネル化
   - `docs/mockup/co-notify-panel.css` のアイテム種別アイコンサポート
2. **ベル定義テーブル**: `coNotifyBells = [{ id, label, icon, scope }]` を導入。N-2 プレビューの並び（OB/SL/WS/LA│承認/車両/マスタ）と一致させる
3. **アイコン解決ロジック**: `notify-icons-selected.json` を読み込んで slot key → ファイルパスの解決を実装（プレビュー JS の `SLOT_DEFAULT` 相当）
4. **既存ベル**: 現状の `mdNavCnAnchor`（単一ベル + マスタ更新/休暇申請承認待ち混在）を完全リプレース（N-2.1 設計レビュー時に確認済み）
5. **各画面JSの発信ロジック改修**: OB/SL/WS/LA 各画面のJSを「自領域のみ発信」に絞る作業は N-2.2 のサブタスクとして実施
6. **既読バッジ独立管理**: ベル単位の未読カウントと「すべて既読」ボタン

### 13.5 N-2.1 で確認した未解決の論点
- 編集トグル後の永続化: 現状は localStorage のみ。本実装時にサーバー側で個人設定として保存するか要検討（アカウント管理画面の予定と関連）
- 「カスタムテキスト」スロットがない既存アイコンライブラリ依存。新規アイコンが必要になったら `scripts/download-icons.js` で追加DL

### 13.6 関連ファイル一覧
- 計画書: `docs/plan/notification-refactor-plan.md`（本ファイル）
- プレビュー: `docs/preview/notify-compare.{html,css,js}`
- アイコン確定値: `docs/preview/notify-icons-selected.json`
- アイコンライブラリ: `docs/assets/icons/`（27カテゴリ）
- 既存アイコンピッカー: `docs/mockup/co-icon-picker.{js,css}`

---

## 14. Phase N-2.2 通知基盤本実装 完了サマリ（2026-05-18）

### 14.1 成果物（全画面共通ナビバーに反映）
- **7ベル横並び**: `coNotifyBells` 定義テーブルで OB→SL→WS→LA│Pending→Vehicle→Master を生成。縦仕切りで画面別/横断を分離
- **P3 ハイブリッドパネル**: 最新タブ（日付グループ + アコーディオン）/ 履歴タブ（縦サブタブ + フィルタチップ + 軸別ピッカー）
- **アコーディオン展開**: `expand` または `affects` を持つアイテムで右シェブロン表示 → クリックで `cn-expand` 展開。サマリ + クロス画面ヒント表示
- **クロス画面ヒント** (`cn-cross-hint`): 現在画面（`location.pathname` 判定）が `affects` に含まれる場合は緑「現在画面で開く」、含まれない場合は「○○ で開く ↗」ボタン（alert モック / 実遷移は N-5）
- **履歴タブ**: 縦サブタブで「業務軸 ↔ アカウント軸」切替、軸グループ単位アコーディオン、フィルタチップ（すべて/追加/変更/削除）、軸別ピッカー（契約先→現場 / アカウント の2段階バッジ選択）
- **既読化バッジ連動**: 個別クリックで `is-unread` 除去 + バッジ-1、「すべて既読」でバッジ0化
- **アイコン解決**: 27スロット既定アイコン (`CN_SLOT_DEFAULT`) を `co-notify-panel.js` に埋め込み。localStorage `notifyIconSelections.v1` のユーザー選択を優先
- **既存デモ通知移行**: 旧 `mdNavCnItems` 3件を `bell-master` / `bell-pending` へ振り分け

### 14.2 新規 API（`window.coNotifyPanel`）

| API | 用途 |
|------|------|
| `applyBellIcon(bellId)` | ベルアイコンを `<img src>` に適用 |
| `setItems(bellId, items[])` | 最新タブを全置換、ID 自動付与 |
| `addItem(bellId, item)` → id | 先頭追加、id を返す（各画面JS の発信先） |
| `removeItem(bellId, id)` → boolean | 個別削除 |
| `clearItems(bellId)` | クリア |
| `getItems(bellId)` → items[] | 現在の通知リスト |
| `setHistory(bellId, config)` | 履歴タブの構造を投入 |
| `updateBadge(bellId, count?)` | バッジ件数（省略時は未読カウント） |
| `renderCrossHintsIn(item)` | アコーディオン展開時にヒント描画 |
| `getCurrentPage()` | `location.pathname` から現在画面ID |

### 14.3 `cn:jump` イベント（§6.5 仕様準拠）
```js
item.dispatchEvent(new CustomEvent('cn:jump', {
    bubbles: true,
    detail: {
        item,                    // DOM要素
        source: 'ob',            // 発信ベルID
        affects: ['order-book', 'screen-layout'],
        inContext: true,         // 現在画面が affects に含まれるか
        type: 'modify',          // アイテム種別
        slot: 'type-ob-modify',  // アイコンスロット
        target: { axis: 'orderId', value: 'O-...' }  // N-5 で各画面JS が付与
    }
}));
```
各画面のリスナーは `detail.inContext === true` の場合のみフラッシュ起動（N-5 で本実装）。

### 14.4 アイテムデータ形式
```js
{
    id: 'cn-ob-xxx',           // 省略時は自動採番
    type: 'add' | 'modify' | 'delete' | 'new' | 'approve' | 'reject' | 'pending' | 'auto',
    slot: 'type-employee',     // 任意。指定なければ type-{bellId}-{type} で解決
    main: '東央警備 / 渋谷駅前ビル の受注を追加',
    sub: '山田太郎 ・ 09:14',
    date: '今日 (5/15)',       // 日付グループ用
    expand: '差分サマリ',       // 任意。アコーディオン展開時のテキスト
    affects: ['order-book', 'screen-layout'],  // 任意。クロス画面ヒント用
    target: { axis: 'orderId', value: 'O-2026-0123' }  // 任意。N-5 用
}
```

### 14.5 履歴 config 形式
```js
{
    businessAxis: {
        tab: '契約先/現場',
        search: '現場名で検索...',
        prefix: '現場',
        groups: [{ title: '...', items: [...] }],
        companies: ['東央警備', ...],
        sites: { '東央警備': ['渋谷駅前ビル', ...] }
    },
    accountAxis: {
        tab: 'アカウント',
        search: '...',
        prefix: 'アカウント',
        groups: [...],
        accounts: ['山田太郎', ...]
    }
}
```

### 14.6 変更ファイル一覧
- `docs/mockup/co-navbar.js` — 単一ベル → 7ベルコンテナへリプレース、デモ通知・履歴データ投入
- `docs/mockup/co-navbar.css` — `.md-nav-cn-bells` + 白フィルタ + 縦仕切り
- `docs/mockup/co-notify-panel.js` — API群追加（490行 → 約940行へ拡張）
- `docs/mockup/co-notify-panel.css` — `.cn-icon-img` / `.cn-expand-summary` / `.cn-cross-hint` 関連
- 5 HTML (`order-book` / `screen-layout` / `weekly-schedule` / `leave-application` / `quick-access`):
  - script 読み込み順を `panel→navbar` に統一（panel.js が先に API を公開する必要）
  - キャッシュバージョン `panel.js?v=9` / `navbar.js?v=8`

### 14.7 残課題（N-3 着手前に判断必要） ★重要
**#7 画面側既存ベルの撤去** — 以下のHTML/JSが旧仕様のまま残存:

| ファイル | 残存要素 | 撤去要否 |
|---------|---------|---------|
| `docs/order-book.html` | `cn-anchor#obCnAnchor` + `obCnNotifyBtn` + `obCnOpenModal()` | 撤去対象 |
| `docs/screen-layout.html` | `cn-anchor#cnAnchor` + `cnNotifyBtn` + `openChangeNotifyModal()` | 撤去対象 |
| `docs/weekly-schedule.html` | 同上の画面固有ベル | 要調査 |
| `docs/leave-application.html` | 同上 | 要調査 |
| `docs/quick-access.html` | モバイル独自ヘッダー（ナビバー非使用） | スコープ判断 |

§13.4 で「現状の `mdNavCnAnchor` を完全リプレース」と明記済だが、画面側ベルの撤去まで踏み込んでいない。N-2.2 のナビバー側7ベルと **並存中**。

**撤去時の対応:**
1. 各画面 HTML から `cn-anchor` 要素を削除
2. 各画面 JS から ベル開閉ロジック・通知データ生成・モーダル定義を削除
3. 各画面が独自に保持していた通知データを `window.coNotifyPanel.addItem(bellId, item)` 経由で新ベルへ発信するよう改修
4. これが計画書 §13.4-5「各画面JSの発信ロジック改修はサブタスク」の本体

撤去判断は **N-3 着手前または同時実施を推奨**。

### 14.8 N-2.2 で確認した未解決の論点
- 各画面JS の **自領域発信化（リアルタイム通知）** は別タスク → #7 撤去と同時実施推奨
- 「○○画面で開く ↗」の実画面遷移ロジックは Phase **N-5** で本実装
- アイコン編集トグルの本番組込みは個人設定保存と関連、本実装スコープ外
- DB通知テーブル設計（§3.5）は別途実施。モック段階ではメモリ保持
- アイテム検索ボックスのリアルタイム入力フィルタは未実装（プレビュー含めて）

### 14.9 進行中のセッションで判明した実装抜けと修正履歴
N-2.2 セッション内で以下の実装抜けがユーザー指摘で判明し、すべて修正済:
1. **個別クリック時のバッジ-1 連動** が抜けていた → `markItemReadAndRefresh` 追加
2. **履歴タブのアイテムにアコーディオン展開機能なし** だった → `buildAxisGroupsHtml` で `expand`/`affects` を保持
3. **add/new/delete/reject 系で `affects` があってもアコーディオン展開不可** だった → `jumpOnly` 強制ロジック廃止
4. **`cn:jump` の detail が `{item}` のみ** だった → §6.5 仕様準拠に拡張
5. **アイテムID管理が無く `addItem`/`removeItem` API が無かった** → `bellItemsStore` 内部状態 + 自動採番

→ 反省点: 計画書 §5.4 / §6.5 / §13.4 の精読不足だった。次フェーズではプレビュー実装と本実装の対照確認を厳密に行う。

### 14.10 引き継ぎ要点（N-2.3 / N-3 着手時）

**2026-05-18 更新**: 「#7 画面側既存ベル撤去」は **Phase N-2.3 として独立フェーズ化**（§15）。OB/WS/LA の自領域発信化は N-2.3、SL は N-3 と同時実施。

1. **まず本計画 §7 を全読**: WS の `supportPartners` / `supportReservations` データ構造を SL に移植、単一情報源は WS（§7.2）
2. **既存計画 `ws-support-partner-plan.md` Phase A5 以降と統合**: 本計画優先
3. **API 利用例**:

   ```js
   // 各画面JSが自領域変更時に呼ぶ
   window.coNotifyPanel.addItem('sl', {
       type: 'modify',
       slot: 'type-sl-auto',
       main: '渋谷駅前ビル に他GC社員を配置（自動受注生成）',
       sub: '配置: 田中一郎(Nikkei) ・ 11:30',
       date: '今日 (5/15)',
       expand: 'グループ間応援を検出 → OB側に自動受注行を生成',
       affects: ['screen-layout', 'order-book'],
       target: { axis: 'siteCode', value: 'S-042' }
   });
   ```

---

## 15. Phase N-2.3 詳細計画（旧画面ベル撤去 + OB/WS/LA 自領域発信化）

### 15.1 確定方針（2026-05-18 ユーザー判断）

| 論点 | 決定 | 備考 |
|------|------|------|
| 行単位ベル機能（`md-ob-row-bell` / `cnOpenModalForRow`） | **撤去** | 行絞り込みは履歴タブの軸別ピッカーで代替 |
| 旧トースト（`obCnShowToast` / `cnShowToast`） | **単純削除** | 必要になれば後追いで新システム移植（共通API化） |
| quick-access の `qa-cn-anchor`×2 | **今回スコープ外** | モバイル独自レイアウト、別途PWA用検討 |
| 作業順序 | **N-2.3 先行 → N-3** | SL自領域発信化は応援未実装のため N-3 と統合 |
| SL の承認待ち承認機能（`cnApprovePending` / `cnPendingMap`） | **未確定（実装着手時に再確認）** | 承認待ちベルパネル内のアクションに移植 or 廃止 |

### 15.2 スコープ画面と対象要素

| 画面 | HTML 撤去対象 | JS 撤去対象（主要） |
|------|---------------|--------------------|
| `docs/order-book.html` | `cn-anchor#obCnAnchor` ブロック / `obCnToastContainer` / 行ベル描画箇所 | `obCnOpenModal` / `obCnOpenModalForRow` / `obCnCloseModal` / `obCnSwitchTab` / `obCnShowToast` / `obCnRenderLatest` / `obCnRenderHistory` / `obCnGetRowBellHtml` / `obCnGetUnreadForRow` / `obCnState` / `obCnUpdateBadge` 等 |
| `docs/screen-layout.html` | `cn-anchor#cnAnchor` ブロック / `cnToastContainer` / 行ベル描画箇所 | `openChangeNotifyModal` / `cnOpenModalForRow` / `closeChangeNotifyModal` / `switchCnTab` / `cnShowToast` / `cnRenderLatest` / `cnRenderHistory` / `cnState` / `cnUpdateBadge` / `cnUpdateRowBells` / `cnGetRowSiteName` 等。`cnApprovePending` / `cnPendingMap` は §15.1 残論点 |
| `docs/weekly-schedule.html` | `cn-anchor#wsCnAnchor`（ツールバー内） | 旧ベル関連JS（着手時 grep で特定） |
| `docs/leave-application.html` | `cn-anchor#laCnAnchor` | 旧ベル関連JS（着手時 grep で特定） |
| `docs/quick-access.html` | **対象外** | `qa-cn-anchor` 系は現状維持 |

### 15.3 自領域発信化 — フック対象イベント

各画面の CRUD 操作箇所に `window.coNotifyPanel.addItem(bellId, item)` を埋め込む。

| ベル | 発火イベント | 推奨 type / slot |
|------|-------------|-----------------|
| `ob` | 受注追加 / 変更 / 削除 | `add` (type-ob-add) / `modify` (type-ob-modify) / `delete` (type-ob-delete) |
| `ws` | 週間予定変更 / 応援予約変更 / 休バッジ変更 | `modify` (type-ws-schedule-change) / `modify` (type-ws-leave-reflect) |
| `la` | 休暇申請追加 / 承認 / 却下 | `new` (type-la-new) / `approve` (type-la-approve) / `reject` (type-la-reject) |
| `sl` | （N-3 で実施） | — |

モック段階では「手動でデモ通知発火するボタン」または「既存のサンプル通知を起動時に投入」の2方式を併用。実運用では Supabase Realtime のチャネル購読で発火（DB設計時に詳細）。

### 15.4 デモ通知の移行

旧 `cnState.notifications` / `obCnState.notifications` 等のデモデータを、N-2.2 で導入した `coNotifyBells` の各ベルへ振り分け。

- OB由来 → `bell-ob`
- SL由来 → `bell-sl`（暫定。応援関連は N-3 で再分類）
- WS由来 → `bell-ws`
- LA由来 → `bell-la`
- マスタ更新／承認待ち／車両スケ系は既に `bell-master` / `bell-pending` / `bell-vehicle` に移行済（N-2.2 §14.1）

### 15.5 作業手順（推奨）

1. **OB から着手**（最もパターンが明確、旧コードが整理しやすい）
   - HTML から `cn-anchor#obCnAnchor` + `obCnToastContainer` + 行ベル出力箇所削除
   - JS から旧 `obCn*` 関数群削除
   - 受注追加/変更/削除のフック点を特定し `coNotifyPanel.addItem('ob', ...)` 追加
   - 既存デモ通知を `coNotifyPanel.setItems('ob', [...])` で起動時投入
   - ブラウザ確認
2. **WS、LA を同パターンで実施**
3. **SL は最小限の撤去のみ**（承認待ち承認の扱い未確定のため）
   - HTML/JS の旧ベル撤去
   - 自領域発信は N-3 で実施
   - `cnApprovePending` / `cnPendingMap` は §15.1 残論点として保留
4. **キャッシュバージョン更新**: 影響JS（各画面JS）の `?v=N` を1つ上げる
5. **検証**:
   - 各画面で旧ベルが消えていること
   - ナビバー新ベルに通知が表示されること
   - 行ベル削除に伴う行レイアウト崩れがないこと
   - script 読み込み順（panel → navbar → 各画面JS）

### 15.6 ロールアウト戦略

- **段階コミット**: OB / WS / LA を画面単位で別コミット
- **各コミットでユーザーレビュー**（Phase Gate Rules 準拠）
- 各コミット後に Playwright で動作確認

### 15.7 残論点（実装着手時にユーザー確認）

1. **SL の承認待ち承認機能 (`cnApprovePending` / `cnPendingMap`) の移行先**
   - 案A: `bell-pending`（承認待ちベル）のパネル内アイテムに「承認」「却下」アクションを追加 → アクション実行で対応行のハイライト除去
   - 案B: 機能廃止（実運用では Supabase Realtime で他者変更を即時反映するため承認概念が不要になる可能性）
   - 案C: 当面保留（コードは残し、N-5 クロスフラッシュ実装時に再設計）
2. **行レイアウトの調整**: 行ベル列の幅を取り戻すか、別UI要素（例: 行ハイライトフラッシュ）に置き換えるか
3. **デモ通知の最終確定セット**: モックレビュー用に何件・どのパターンを残すか

### 15.8 影響ファイル一覧（N-2.3 スコープ）

- `docs/order-book.html` — 旧ベルブロック削除
- `docs/screen-layout.html` — 旧ベルブロック削除
- `docs/weekly-schedule.html` — 旧ベルブロック削除
- `docs/leave-application.html` — 旧ベルブロック削除
- `docs/mockup/order-book.js` — 旧JS削除 + 発信化フック追加 + デモ通知移行
- `docs/mockup/screen-layout.js` — 旧JS削除（自領域発信は N-3）
- `docs/mockup/weekly-schedule.js` — 旧JS削除 + 発信化フック追加 + デモ通知移行
- `docs/mockup/leave-application.js` — 旧JS削除 + 発信化フック追加 + デモ通知移行
- `docs/mockup/weekly-schedule.css` — `md-ws-cn-anchor` セレクタ削除
- 各画面の他CSS（旧ベル関連スタイル `md-cn-toast*` 等）

---

## 16. Phase N-2.4 詳細計画（通知タイプ分類の細分化）

### 16.1 背景（N-2.3 OB 実装で露呈）

OB 撤去後の動作確認で、ユーザーから以下の指摘あり (2026-05-18):

> 契約先名や現場の行を増やしたことと、業内の特定の日付に人数を入れたものが、同じ新規作成として処理されているように見えます。明確にその趣旨は異なったものであるのに通知として分けられていません。

**現状の問題**:
- 計画書 §5.0 / §14.4 / §15.3 で OB の通知タイプは `add` / `modify` / `delete` の **3 種類のみ** と定義
- アイコンスロットも `type-ob-add` / `type-ob-modify` / `type-ob-delete` の 3 つだけ
- しかし実際の業務操作は粒度がもっと細かい
- SL / WS / LA でも同様の分類粒度問題が発生する見込み

### 16.2 OB 通知タイプ細分化（確定 / 2026-05-18 ユーザー承認）

ラベル: 「業務行」→ **「行」** / 「配置先」→ **「受注」**（2026-05-18 ユーザー指示で名称統一）。
内部 key は意味準拠の英語 (`row` / `cell` / `site` / `badge`) 維持。

| 操作 | 現状 type | 細分化 type | 表示ラベル | 想定アイコン方向性 |
|------|----------|------------|----------|------------------|
| シートに**行**を新規追加（契約先・業務名・区分・シフトの組） | add | `row-add` | 行追加 | 行追加系（リスト+） |
| **セル**に人数を初めて入れる（0名 → N名） | add | `cell-place` | セル配置 | 配置追加系（人物+） |
| **行**のメタ情報変更（契約先名・業務名・区分等） | modify | `row-modify` | 行編集 | 行編集系（リスト編集） |
| **セル**内の人数・時間・責任者・備考・サブタスク変更 | modify | `cell-modify` | セル編集 | 配置編集系（人物編集） |
| **セル**内の人数を N → 0（配置クリア） | delete | `cell-clear` | セルクリア | 配置除去系 |
| **行**ごと削除 | delete | `row-delete` | 行削除 | 行削除系（リスト−） |
| **セル**内に複数業務がある場合、**受注**（副 entry）を追加 | add | `site-add` | 受注追加 | site +（同セル副 entry 追加） |
| **セル**内の **受注**（副 entry）を除去 | delete | `site-remove` | 受注解除 | site ×（副 entry 除去） |
| セル編集モーダル内で子バッジ（作業内容）を追加 | add | `badge-child-add` | 作業内容追加 | star + |
| 子バッジ（作業内容）を削除 | delete | `badge-child-delete` | 作業内容削除 | star × |
| セル編集モーダル内で孫バッジ（詳細項目）を追加 | add | `badge-grand-add` | 詳細項目追加 | star + |
| 孫バッジ（詳細項目）を削除 | delete | `badge-grand-delete` | 詳細項目削除 | star × |

### 16.3 SL / WS / LA も同パターンで洗い出し

実装着手時に各画面で同じ粒度設計を行う。現時点で想定される分類:

- **SL**: 社員/車両/応援/応援予約 × 配置追加/変更/削除/解除 = 約 12 タイプ
- **WS**: 週間予定変更（業務行 vs 日付セル）/ 応援予約追加・変更・削除 / 休バッジ変更 = 約 6 タイプ
- **LA**: 休暇申請新規 / 承認 / 却下 / 取消（既存 new/approve/reject + 1）

### 16.4 slot 命名規則の選択肢

| 案 | slot 形式 | 例 |
|----|----------|----|
| A | `type-{bell}-{scope}-{op}` | `type-ob-row-add` / `type-ob-cell-modify` |
| B | `type-{bell}-{op}-{scope}` | `type-ob-add-row` / `type-ob-modify-cell` |
| C | フラット意味命名 | `type-ob-row-add` / `type-ob-cell-place` / `type-ob-cell-edit` |

### 16.5 スコープ

1. **OB の細分化案を確定**（§16.2 を叩き台にユーザーレビュー）
2. **SL / WS / LA の細分化案を作成**（同パターン）
3. **slot 命名規則を確定**（§16.4 案 A/B/C から選択）
4. **アイコン選定**: 追加分（OB 6 + SL 12 + WS 6 + LA 1 = 約 25 タイプ追加）
   - `docs/preview/notify-icons-selected.json` を拡張
   - `docs/preview/notify-compare.html` のプレビューモード（[アイコン選定] / [N-2統合]）に新スロットを反映
5. **表示テンプレートの規約整理**:
   - main の文言テンプレート（「{業務名} の {N日} に {人数}名 を配置」など）
   - sub / expand の標準化
6. **co-notify-panel.js の type 解決ロジック拡張**
   - `resolveItemSlotKey` に新 type を追加
   - 既存 add/modify/delete は後方互換維持（slot 未指定の場合のフォールバック）
7. **OB の実装移行**: `obCnSelfNotify` 内部の type 解決を細分化
8. **計画書更新**: §5.0 / §14.4 / §15.3 / §16 全体

### 16.6 影響範囲

- `docs/preview/notify-icons-selected.json` — slot 増加
- `docs/preview/notify-compare.html` + `.js` + `.css` — プレビューに新スロット
- `docs/mockup/co-notify-panel.js` — `CN_SLOT_DEFAULT` 拡張、type 解決ロジック
- `docs/mockup/co-navbar.js` — デモ通知の type 振り分け
- `docs/mockup/order-book.js` — `obCnSelfNotify` の type 細分化呼び出し（既存 21 箇所の各 CRUD ポイントで適切な type に書き換え）
- 計画書 §5 / §14 / §15 / §16

### 16.7 N-2.3 との関係

- N-2.3 OB 部分（コミット 2405df7 + d32afa1）は **完了扱い**。新 type 体系への移行は N-2.4 で行う
- N-2.3 の **WS / LA 撤去** は N-2.4 完了後に着手（type 細分化を反映した形で発信化する）
- これにより WS / LA で「後から type を書き換える」二度手間を回避

### 16.8 残論点（実装着手時に詰める）

1. type と slot の関係: type を細分化するか、type は add/modify/delete のまま slot 拡張だけにするか
2. 「業務行追加 → 同時にセル配置も入れる」ような複合操作で 1 通知 / 2 通知 どちらにするか
3. デモ通知（initial seed）の更新方針: 全パターン網羅 / 代表3件のみ

### 16.9 サブフェーズ進捗（2026-05-18 時点）

| サブ | 内容 | 状態 |
|------|------|------|
| N-2.4.1 | 通知タイプ分類設計（OB 12 type 確定 §16.2 / 命名規則案 / アイコングループ分け案B採用） | **完了** |
| N-2.4.2 | プレビュー [マトリクス選定] モード実装 (notify-compare.html) | **完了**（コミット 5ba8082） |
| N-2.4.2a | scope ラベル変更 (業務行→行 / 配置先→受注) + 通知サンプル文言調整 | **完了**（未コミット → 次コミットで反映予定） |
| N-2.4.2b | **ユーザーによるアイコン選定作業** | **進行中**（新会話で継続） |
| N-2.4.3 | co-notify-panel.js 本体のアイコン合成描画実装 | 未着手（選定完了後） |
| N-2.4.4 | OB の type 細分化（obCnSelfNotify 21 箇所を新 type へ振り分け） | 未着手 |
| N-2.4.5 | SL / WS / LA のスコープ × 操作リスト確定とアイコン選定 | 未着手 |

### 16.10 次会話への引き継ぎ要点 ★重要

**現在地**: N-2.4.2b ユーザーアイコン選定中。マトリクス選定 UI は完成・動作確認済み。

**新会話でやるべき手順**:

1. **本計画書 §16 全体を全読**（特に §16.2 確定タイプ / §16.9 進捗 / §16.10 本セクション）
2. **メモリ `project_notification_refactor.md` を読む**
3. ユーザーに選定状況を確認:
   - 「マトリクス選定UI でアイコン選定は進みましたか？JSON 出力していただけますか？」
   - もしくは「localStorage の選定値を JSON 出力ボタンで取得済みですか？」
4. ユーザーから JSON を受領 → 以下に反映:
   - `docs/preview/notify-icons-selected.json` に `primitives` セクションと `typeOverrides` セクションを追加
   - 既存の `bells` / `commonTypes` / `panelTypes` とは別構造で保持
   - 既存スロット (`type-ob-add` 等) は **typeOverrides として吸収**するか、廃止するか確認
5. アイコン選定確定後、N-2.4.3 (co-notify-panel 本体の合成描画) に進む
   - `notifyPrimitives.v1` / `notifyTypeOverrides.v1` を `co-notify-panel.js` に読み込む
   - `buildItemHtml` を拡張: scope + op から typeKey を構築 → typeOverride or primitive 合成
   - `CN_SLOT_DEFAULT` を `MTX_PRIMITIVE_DEFAULT` ベースに再構築
6. その後 N-2.4.4 (OB の type 細分化) に進む
   - `obCnSelfNotify` を `(scope, op, opts)` 形式に変更
   - 既存呼び出し 21 箇所を新 type へ振り分け（§16.2 のマッピング表参照）
   - 代表呼び出し位置の振り分け案:
     - L1284, L1303 → `badge-child-delete` / `badge-grand-delete`
     - L1389, L1406 → `badge-child-add` / `badge-grand-add`
     - L1999 → `site-add` （配置先追加）
     - L2029, L2161, L2171 → `site-remove` （配置先削除）
     - L2119 → `cell-place` または `cell-modify` （_cnOldEntry 有無で分岐）
     - L2129 → `cell-clear`
     - L2756 → master ベル管轄 (bell-master) へ送る
     - L2896 → `row-add`
     - L2929 → `row-modify`
     - L3891 → `cell-modify`

**関連ファイル**:

- `docs/preview/notify-compare.html` 内 [マトリクス選定 (N-2.4)] タブ — 主要選定 UI
- `docs/preview/notify-matrix-prototype.html` — 静的プロトタイプ（参照用、編集不要）
- `docs/preview/notify-compare.js` `MTX_*` 定数群 — マトリクス選定モードロジック
- `docs/preview/notify-compare.css` `.cmp-mtx-*` セレクタ — マトリクス選定モードスタイル
- `docs/preview/notify-icons-selected.json` — 確定アイコン定義（拡張先）

**localStorage キー（ユーザー選定の保存先）**:

- `notifyPrimitives.v1` = `{ "scope": { "row": "...", "cell": "...", ... }, "op": { "add": "...", "modify": "...", ... } }`
- `notifyTypeOverrides.v1` = `{ "row-add": "...", "cell-place": "...", ... }`
- 既存 `notifyIconSelections.v1`（27 スロット）とは独立

**アイコン UI 仕様（確定済み 2026-05-18）**:

- scope (親): 30px、合成領域 32px 中央配置
- op (子): 28px、scope 右下角に中心配置（right/bottom -13px）
- op 背景: 角丸 6px 四角バッジ（border-radius:50% は img 四隅が円形 mask で切れるため不採用）
- box-sizing: border-box 必須

---

**本計画書はモックアップ段階の構想として作成。実装着手前に各 Phase でユーザーレビュー必須（Phase Gate Rules 準拠）。**
