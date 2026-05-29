# 週間予定表 — 協力業者／応援予約 実装引き継ぎ

**最終更新**: 2026-05-12
**ステータス**: Phase A1〜A6 完了／A7 スキップ／A8 UI修正反映済／A9 継続中／A10〜A15 完了（応援バッジ統合・行間D&D・全GC紐付け）／要件定義・DB設計反映済
**対象モックアップ**: `docs/weekly-schedule.html` + `docs/mockup/weekly-schedule.{js,css}`
**関連計画書**: `docs/plan/notification-refactor-plan.md` — 応援／応援予約の通知発信・SL 応援機能統合は Phase N-3 で本計画に統合済み。Phase A5 以降と通知計画 N-3 はスコープ重複あり、**通知計画を優先**（notification §9）。

このドキュメントは会話をまたいで作業継続できるようにまとめたもの。新会話ではまず本ファイルを読んでから作業に入ること。

---

## 1. プロジェクト全体の位置付け

- Phase 2: モックアップ開発サイクル中
- 週間予定表（モックID=A 業務管理計画書の補助ビュー）に、協力業者への応援予約／配置機能を追加する作業
- 将来的に協力業者マスタ画面・注文書発行機能と連携する（別モックID で後続実装）

## 2. 会話で確定した仕様（Q番号付き）

### 基本モデル
| Q | 決定 |
|---|------|
| Q1 | 予約はモーダルで「週内日別人数」を一括入力 |
| Q2 | 当初「昼/夜/フレックス」3分類 → その後「**フレックスのみに統一**」に変更（運用で昼夜を判断） |
| Q3 | 同一バッジを同一セルへ複数配置可（在庫を複数消費） |
| Q4 | 残0でバッジをグレーアウト（非表示ではなく常時表示） |
| Q5 | 協力業者略称はオートコンプリート |
| Q16 | 契約先（clients）に `formal_name` 必須、注文書発行時スナップショット |
| Q17 | 配置時間は HH:MM 直接入力 |
| Q18 | 資格検定は独立マスタ（既存 `license_types` を使用） |
| Q19 | 注文書定型文はマスタ管理 |
| Q20 | 警備料金は日額単価1行のシンプル構造 |
| Q21 | 協力業者マスタ編集はバッジ⋮メニューから |
| Q22 | マスタ未完備はバッジ横に警告アイコン（SVG、`docs/assets/icons/` から採用） |
| Q23 | 既存協力業者の選択は略称オートコンプリート |
| Q24 | モック作業は週間予定表のバッジ＋予約モーダルを先行実装、他マスタ画面は後続 |
| Q26 | バッジ表示 `A社① 残3`（残数内包） |
| Q27 | **途中で方針変更**: 最終形は「応援予約行」と「サイドバープリセット応援」の併存 |
| Q36 | 予約数バリデーションは下限0のみ、上限なし |
| Q38 | マスタ管理ハブは「アコーディオン＋検索」ハイブリッド |
| Q41 | 応援予約行のラベルは「応援予約」 |
| Q42 | 予約追加は行左端の「＋」ボタン → モーダル（A5で実装） |
| Q43 | 1バッジ＋残数内包（複数クローンはしない） |
| Q44 | 返却はD&D＋×ボタン両方可 |
| Q45 | 別日移動は同シフトのみ |
| Q46 | 応援予約行は淡い背景色で区別 |
| Q47 | プリセット応援の扱いは一度「廃止」→ **復活**（サイドバーに戻した） |
| Q48 | 予約段階は人数のみ、検定種別は注文書作成時 |
| Q49 | 配置後バッジは略称のみ表示（`A社①`）、プリセットは `東央｜応援` |
| Q50+Q53 | 同日内はD&D自由、別日は同シフトのみ |
| Q51 | フレックス予約導入（その後さらに **フレックス統一**） |
| Q54 | A1〜A4 で一旦プレビュー、その後 A5〜A8 |
| Q55 | デモ用に初期協力業者をプリセット配置 |
| Q56 | **サイドバー応援バッジ機能は必要**（f: 以前の挙動を復活。追加で、紐付けポップオーバーに既存協力業者の選択肢を表示） |

### 途中で方針転換した点（重要）
1. **昼/夜/フレックスの3分類 → フレックス統一**: 表示が煩雑なため、昼夜区分は運用者の判断に委ね、予約はフレックスのみに統一
2. **応援予約行セルの昼/夜分割 → 結合**: 1日=1セル×2列幅
3. **プリセット応援廃止 → 復活**: サイドバーにプリセット応援が必要と判明
4. **サイドバーの「＋追加ボタン」と実在協力業者一覧 → プリセット応援のみに簡素化**
5. **紐付けポップオーバーの新規追加機能 → 削除**（既存協力業者の選択のみ残す）

### UI/カラー方針
- **Coastal Light パレット準拠**（`:root` の CSS 変数）
- 応援予約行 = `--success` 系（緑）
- 休み行 = `--error` 系（赤）
- 修理/点検行 = `--base-muted` 系（グレー）
- マスタ未完備警告アイコン色 = `#DECCBE`（Shell Beige、Applied Color Palette の Warning/変更）
- アイコンは `docs/assets/icons/` 配下の icooon-mono（`im-` プレフィックス、SVG、`fill:currentColor`）を採用
  - 現在使用中: `im-11908-chuui-maaku.svg`（注意マーク、インラインSVG化）

### モックアップ規約
- `.claude/skills/mockup-guide` スキルを必ず確認
- CSS Grid レイアウト
- バッジシステム（親=区分、子=選択チップ、孫=詳細項目）
- `docs/ui-components/index-light.html` と `docs/ui-components/styles-light.css` がUIコンポーネント集＋カラーパレット定義

## 3. データモデル（mockup 上の現状）

```js
// 協力業者マスタ（プリセット応援とマスタ協力業者を混在、isPreset で区別）
supportPartners = [
  {
    id,                       // 'preset-{gcCode}' or 'partner-{N}'
    gcCode,                   // 'touo' | 'nikkei' | 'zennihon'
    shortName,                // '応援' (preset) or 'A社①' etc
    formalName,               // 正式名称（注文書用、NULL許容）
    postalCode, address,
    representativeTitle, representativeName,
    phone, email,
    isPreset,                 // プリセット応援なら true
    isMasterComplete,         // 注文書発行可否判定用
    isActive
  }
];

// 予約（フレックスのみ、日付単位）
supportReservations = {
  [partnerId]: {
    [dateKey]: { flex: N }    // 以前は day/night/flex の3キー、現在は flex のみ
  }
};

// 配置
supportAssignments = {
  [partnerId]: {
    [dateKey]: {
      day: [{ siteId }, ...],    // シフトごとに配置配列
      night: [{ siteId }, ...]
    }
  }
};
```

### ヘルパー関数
- `findPartner(partnerId)` — パートナー取得
- `getActivePartners(gcCode, {includePreset: bool})` — アクティブ一覧（デフォルト preset 除外）
- `addPartner(shortName, gcCode)` — 新規登録、ID `partner-{N}` 採番
- `deactivatePartner(partnerId)` — ソフト削除
- `getReservedCount(partnerId, dateKey)` — 予約人数（flex）
- `setReservedCount(partnerId, dateKey, count)` — 予約変更
- `getAssignedCountForDate(partnerId, dateKey)` — 当該日の配置済総数（昼＋夜）
- `getRemainingCount(partnerId, dateKey)` — 残 = 予約−配置
- `addSupportAssignment(partnerId, dateKey, shift, siteId)` — 配置追加
- `removeSupportAssignment(partnerId, dateKey, shift, siteId)` — 配置1件解除
- `getAssignedPartnersForCell(siteId, dateKey, shift)` — セル内配置取得 `[{partner}]`
- `getReservationSlotsForDate(gcCode, dateKey)` — 予約行表示用 `[{partner, reserved, remaining}]`
- `getPartnerPlacedLabel(partner)` — 配置後の表示ラベル（preset: `東央｜応援`、非preset: `A社①`）

### UI コンポーネント
- `createReservationBadge(slot, dateKey, isPast)` — 応援予約行セル内のバッジ
- `createSupportBadge(partner)` — サイドバー概要モード用
- `createAssignSupportBadge(partner, sc, currentAssignedCell)` — サイドバー配置モード用
- `appendSupportSection(container, gcCode, badgeCreator)` — GC毎の応援セクション（プリセットのみ）
- `showLinkPopover(chipEl, presetPartnerId, siteId, dateKey, shift, gcCode)` — プリセットクリック時の既存業者選択ポップオーバー
- `showPartnerChipActionPopover(chipEl, partnerId, siteId, dateKey, shift, gcCode)` — 非プリセット配置チップクリック時の「応援に戻す / 削除 / キャンセル」ポップオーバー

### D&D メッセージタイプ
- `'reservation-partner'`: 応援予約行 → 現場セル
- `'sidebar-support'`: サイドバー → 現場セル
- `'move-partner'`: 現場セル → 別セル

## 4. 完了フェーズの内容

### A1: データモデル刷新 ✅
- `wsSupportWorkers` → `supportPartners` にリネーム・拡張
- `supportReservations` / `supportAssignments` の構造を新規・変更
- デモデータ投入（各GCに協力業者2社程度、直近日付に予約）
- プリセット応援バッジは当初廃止したが、後日 Q56 で復活

### A2: サイドバー簡素化 ✅
- 結果的に「GCごとにプリセット応援バッジのみ」表示に落ち着き
- 実在パートナー一覧と「＋」追加ボタンはサイドバーから除外
- 新規協力業者登録は応援予約行の「＋」ボタン（A5）からのみに集約

### A3: 応援予約行追加 ✅
- 休み行／修理点検行の下、現場グループの上にGCごとに1行
- 昼/夜結合セル（`grid-column: N / span 2`）で1日=1セル
- 行ラベルは「{GC略号} 応援予約」＋左端「＋」ボタン（現状disabled、A5で有効化）

### A4: 予約バッジ描画 ✅
- フレックス統一表示 `A社① 残N`（残0でグレーアウト）
- マスタ未完備は警告アイコン（`im-11908`、SVGインライン、色 `#DECCBE`）
- D&D で現場セルに配置可能

### A4 の追加修正
- **配置済みチップのクリックアクションポップオーバー**: 非プリセットチップをクリックすると「応援バッジに戻す / 削除 / キャンセル」のポップオーバー
- **紐付けポップオーバーの予約超過防止**: 残0の協力業者は disabled 表示（選択不可）
- **紐付けポップオーバーから「新規追加」機能削除**: 既存業者選択のみ
- **×ボタンのレイアウトシフト防止**: `visibility: hidden → visible` + `opacity 0 → 0.7` で常時スペース確保

## 5. フェーズ進捗（最新）

### A5: 予約入力モーダル ✅（コミット 1b8b80d）

- 日付セル「＋」= 単日追加モーダル（業者 autocomplete ＋ ステッパー。既存は現人数プリフィル、新規は警告アイコン自動付与）
- 行左端「＋」= 週全体編集モーダル（業者×日付マトリクス、即時反映、⋮メニュー「この週の予約をクリア／マスタから削除」、「＋業者追加」パネル）
- 配置済み下限: ステッパーは `assigned_count` 未満に下げられない

### A6: D&D移動制限厳密化 ✅（コミット 2e6c114）

- 同日内: 行・シフト問わず自由
- 別日: 同シフトのみ（昼↔昼／夜↔夜）
- 違反セルはドラッグ開始時点で斜線ハッチング＋半透明で無効化表示
- 違反ドロップは無効化し、トースト「別日は同シフトのみ移動可能です」を約2.4秒表示
- 予約→セルは従来通り同日固定

### A7: 返却D&D強化 ⏭ スキップ

- ×ボタン／配置済みチップアクションポップオーバーの「削除」で返却代替済みのため、D&D返却は省略
- 必要性が後から出た場合に再着手

### A8: UI調整（ユーザーフィードバック反映）✅ 都度対応中

- `160c847` 予約バッジに×削除ボタン追加（業者キャンセル、配置ありは確認ダイアログ後に一括削除）
- `9bbe086` 予約バッジ×ボタンを他チップと同一の `md-ws-chip-remove` スタイルに統一
- `4cdc8b1` 単日モーダルを「入力欄＋候補業者バッジ一覧」UIに刷新（ドロップダウン型autocomplete廃止）
- `6c7e412` モーダル全体をUIコンポーネント準拠（accent-light ヘッダーバー、accent プライマリボタン、`--brand-primary` 誤参照を削除）
- `ef03d29` 候補業者ラベルを `md-modal-section-bar` 風（accent色＋右側divider下線）、バッジを `md-ob-supervisor-chip` 準拠の小型チップに統一

### A9: ブラウザ動作確認 🔄 継続

- ゴールデンパス＋エッジケースは Playwright 経由で検証済（A4検証8項目＋A5検証10項目＋A6検証3項目＋各UI修正ごとの個別検証）
- ユーザー自身のブラウザ確認フィードバックをA8として都度実装に反映
- 追加フィードバックが出たら引き続きA8として対応、出尽くしたらクローズ

### A10〜A15: 応援バッジ統合化・予約行間D&D ✅（仕様変更）

**背景**: サイドバーで GC ごとに分けていた応援プリセット3バッジを「応援」1バッジに統合。配置→クリックで紐付けする際、全GC の応援予約から横断的に選択可能に。さらに別GC の応援予約行間で協力業者バッジを D&D 移動可能に。

| Phase | 変更点 |
|-------|--------|
| A10 | `supportPartners` のプリセットを `preset-unified`（`gcCode: null`）1件に集約。`getPartnerPlacedLabel` を簡素化（GC短称プレフィックスを廃止）。 |
| A11 | サイドバー応援セクションを `appendUnifiedSupportSection(container, badgeCreator)` で1回だけ描画。GC ループ外に配置。 |
| A12 | `showLinkPopover` を全GC セクション分け表示に書き換え。「予約あり業者のみ」を表示し、`(予約なし)` 項目を除外。 |
| A13 | 応援予約行セルに `dragover`/`drop` ハンドラ追加。同日かつ別GC のときに `partner.gcCode` を書き換える `onReservationCellDragOver` / `onReservationCellDrop` を実装。 |
| A14 | 統合プリセット応援チップ用CSS追加（`.md-ws-emp-chip.md-ws-support-chip-preset` を中立色 `--text-tertiary` / `--bg-surface-2` に変更）。 |
| A15 | revert ボタン（配置済みチップ→「応援バッジに戻す」）が `preset-unified` を再配置するよう変更。`showLinkPopover` / `showPartnerChipActionPopover` から `gcCode` 引数を撤去。 |

**重要な仕様判断**:
- 業者所属GC変更時、既存配置の表示色は自動追随（業者の単一GC属性に従う）。確認ダイアログなし。
- インター行D&D は同日のみ。別日のGCはD&Dではなく予約モーダルから操作。
- 残0 の業者バッジも行間D&D 可能（GC変更は予約消費を伴わないため）。ただし現場セル drop は残0 で拒否（トースト表示）。

## 6. 要件定義・DB設計の状態

**反映済みセクション（`docs/01_要件定義.md` / `docs/03_データベース設計.md`）:**

- 3.18.10 応援予約行（昼/夜結合1セル、フレックス統一、日付セル＋／行左端＋の2系統）
- 3.18.11 協力業者バッジ（フレックス統一、残数内包、警告アイコン、D&D移動ルール表）
- 3.18.12 予約入力モーダル（単日追加／週全体編集の2モード、⋮メニュー、＋業者追加）
- 3.18.13 プリセット応援バッジ（復活）
- 3.18.14 配置済みチップアクション＋D&D違反フィードバック（トースト・違反セル無効化）
- 3.19 協力業者管理／3.20 注文書・注文請書発行／3.21 マスタ管理ハブ
- DB: `support_partners` / `support_reservations`（`shift_type='flex'` 限定 CHECK）／`support_assignments`（`source_shift_type='flex'` 限定 CHECK）／`purchase_orders` 等

## 7. 既知の注意点（gotcha）

1. **統合プリセット応援バッジ（A10〜以降）**: `supportPartners` 内の `preset-unified` 1件のみ。`gcCode: null`、`isPreset: true`。
   - `getActivePartners(gcCode)` は `gcCode === ...` フィルタなので preset は自動除外される
   - サイドバーでは `appendUnifiedSupportSection` で `findPartner('preset-unified')` から直接取得（GC を跨がず 1 個のみ表示）
   - 予約行・紐付けポップオーバーは非プリセットのみを対象

2. **配置セルの `shift`（day/night）は保持しているが、予約の `shift_type` はフレックスのみ**
   - `supportAssignments` のキーは配置先セルのシフト
   - `supportReservations` は日単位のみ（`flex` キー1つ）
   - 残数計算: `getRemainingCount = getReservedCount - getAssignedCountForDate`（昼＋夜合算）

3. **×ボタンのレイアウトシフト防止**
   - `display: none → inline` ではなく、`visibility: hidden → visible` + `opacity 0 → 0.7` 方式
   - `.md-ws-emp-chip .md-ws-chip-remove` と `.md-ws-site-chip .md-ws-chip-remove` の両方に適用済

4. **紐付けポップオーバーと配置チップアクションポップオーバーはセレクタを共有**
   - `.md-ws-link-popover` クラスで既存ポップオーバーを先に閉じる（単一表示保証）

5. **予約超過防止**
   - 紐付けポップオーバーは「予約あり業者のみ」を表示し、残0は `disabled` + `filter: grayscale` で選択不可
   - 現場セル drop も残0を拒否（A13 のサイドエフェクト）。トーストで通知

6. **応援予約行間D&D の状態管理**
   - `dragSourcePartnerGc` 変数で予約バッジドラッグ中の元GCを保持
   - `deactivateDragMode()` でクリア
   - 同日・別GC のときのみドロップ受け付け（同GC ドロップは no-op）

## 8. ファイル一覧（変更箇所）

| ファイル | 主な変更 |
|---------|---------|
| `docs/mockup/weekly-schedule.js` | データモデル刷新、応援予約行追加、予約バッジ、配置チップ、ポップオーバー類、D&Dハンドラ |
| `docs/mockup/weekly-schedule.css` | 応援予約行スタイル、予約バッジ（フレックス統一）、×ボタンのレイアウトシフト防止、ポップオーバー、Applied Color Palette 準拠 |
| `docs/01_要件定義.md` | 3.18.10〜13、3.19〜3.21 追加、更新履歴（コミット済） |
| `docs/03_データベース設計.md` | 3.23〜3.30 追加、group_companies/companies 拡張、license_types 拡充、更新履歴（コミット済） |

## 9. 次の会話で最初にすべきこと

1. **このドキュメント（`docs/plan/ws-support-partner-plan.md`）を読む**
2. `docs/weekly-schedule.html` をブラウザで開いてユーザーに総合確認を依頼（A1〜A6 実装済の挙動確認）
3. 違和感や追加要望が上がったら A8（CSS微調整）または新規Issueとして着手判断
4. 特に要望が無ければ、関連機能（協力業者マスタ画面・注文書発行画面）の新規モック着手をユーザーと相談

### 参照先
- 開発プロセス: `docs/00_開発手順書.md`
- 現行要件: `docs/01_要件定義.md` （3.18〜3.21）
- DB設計: `docs/03_データベース設計.md` （3.0/3.1/3.4/3.23〜3.30）
- モック規約: `.claude/skills/mockup-guide`
- UIカラー: `docs/ui-components/index-light.html` + `docs/ui-components/styles-light.css`
- アイコン: `docs/assets/icons/index.json`
