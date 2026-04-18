# 週間予定表 — 協力業者／応援予約 実装引き継ぎ

**最終更新**: 2026-04-18
**ステータス**: Phase A1〜A4 完了、A5 以降が未着手
**対象モックアップ**: `docs/weekly-schedule.html` + `docs/mockup/weekly-schedule.{js,css}`

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

## 5. 未着手フェーズ（今後の作業）

### A5: 予約入力モーダル 🔜 次に着手
- 応援予約行左端「＋」ボタンで起動
- 入力項目:
  - 協力業者名（略称）: オートコンプリート（既存 `supportPartners` から）
  - 依頼元GC: 選択中タブから自動設定
  - 日別人数: 週内日付×flex列
- バリデーション: 下限0、上限なし
- 確定動作: UPSERT（新規業者なら `addPartner()`、既存なら ID 取得 → `setReservedCount()`）
- モーダル骨格は `md-cp-modal-*` や `md-modal-*` の既存パターンを踏襲

### A6: D&D 移動ルールの厳密化
- 同日内D&D: 自由（行・シフト問わず）
- 別日D&D: 同シフトのみ（昼→昼／夜→夜）
- 違反時の挙動: ドロップ禁止 or 自動補正

### A7: 返却D&D強化
- 現場セル → 応援予約行へのD&Dで在庫復元
- 現状は×ボタン／アクションポップオーバー削除で代替可能

### A8: CSS微調整
- 動作確認後に発見した微調整を反映
- 警告アイコン・バッジ配色・ホバー状態等の最終調整

### A9: ブラウザ動作確認
- `docs/weekly-schedule.html` をブラウザで開いて一連の操作を検証
- ゴールデンパス＋エッジケース（残0、シフト違反、連続配置等）

## 6. 要件定義・DB設計の状態

以下は既に `docs/01_要件定義.md` / `docs/03_データベース設計.md` に反映済（コミット `ac36b2d`）:
- 3.18.10〜3.18.13: 応援予約行、バッジ仕様、予約モーダル、プリセット応援廃止（**要更新**: 再びプリセット応援復活・昼夜→フレックス統一を反映する必要）
- 3.19 協力業者管理
- 3.20 注文書・注文請書発行
- 3.21 マスタ管理ハブ
- DB: `support_partners` / `support_reservations` / `support_assignments` / `purchase_orders` 等

### 要件定義・DB設計への追加反映が必要な項目（未実施）
- **Q51 変更**: フレックス統一に伴い、`support_reservations.shift_type` 列は廃止するか `CHECK` を `flex` のみに変更
- **Q47 変更**: プリセット応援復活を反映
- **Q56 追加**: 紐付けポップオーバーに既存協力業者選択機能を追加
- **Q58 解消**: 配置済みチップのアクションポップオーバー（応援に戻す/削除）仕様
- **応援予約行のセル結合（昼/夜統合）** 記述追加

## 7. 既知の注意点（gotcha）

1. **プリセット応援バッジは `supportPartners` に `isPreset: true` で混在**
   - `getActivePartners(gcCode)` はデフォルトで preset を除外する
   - サイドバーでは `{includePreset: true}` で取得
   - 予約行・紐付けポップオーバーでは preset を除外（実在パートナーのみ）

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
   - 紐付けポップオーバーの既存業者選択ボタンは `disabled` + `filter: grayscale` で残0業者を選択不可化
   - 予約未登録業者（`reserved === 0`）も選択不可（「予約なし」表示）

## 8. ファイル一覧（変更箇所）

| ファイル | 主な変更 |
|---------|---------|
| `docs/mockup/weekly-schedule.js` | データモデル刷新、応援予約行追加、予約バッジ、配置チップ、ポップオーバー類、D&Dハンドラ |
| `docs/mockup/weekly-schedule.css` | 応援予約行スタイル、予約バッジ（フレックス統一）、×ボタンのレイアウトシフト防止、ポップオーバー、Applied Color Palette 準拠 |
| `docs/01_要件定義.md` | 3.18.10〜13、3.19〜3.21 追加、更新履歴（コミット済） |
| `docs/03_データベース設計.md` | 3.23〜3.30 追加、group_companies/companies 拡張、license_types 拡充、更新履歴（コミット済） |

## 9. 次の会話で最初にすべきこと

1. **このドキュメント（`docs/plan/ws-support-partner-plan.md`）を読む**
2. 必要なら `docs/weekly-schedule.html` をブラウザで開いて現状確認（A1〜A4まで）
3. ユーザーに「A5（予約入力モーダル）から再開でよいか」確認
4. 並行して、要件定義・DB設計への方針変更反映（フレックス統一、プリセット復活等）が必要かユーザーに確認
5. 作業開始

### 参照先
- 開発プロセス: `docs/00_開発手順書.md`
- 現行要件: `docs/01_要件定義.md` （3.18〜3.21）
- DB設計: `docs/03_データベース設計.md` （3.0/3.1/3.4/3.23〜3.30）
- モック規約: `.claude/skills/mockup-guide`
- UIカラー: `docs/ui-components/index-light.html` + `docs/ui-components/styles-light.css`
- アイコン: `docs/assets/icons/index.json`
