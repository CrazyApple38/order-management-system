# SL / WS / LA / 通知seed ダミーデータ一本化プラン

最終更新: 2026-05-28 / Claude Code (Opus 4.7)

## 0. 目的

SL (現場一覧) / WS (週間予定表) / LA (休日申請管理) と各画面の変更通知 seed が、**同一の「世界観」(誰が・いつ・どこに・どんな状態で）**を共有するように、配置・応援・休み・車両のダミーデータを単一情報源 (SSOT) に一本化する。

現状、社員マスター・車両マスターは既に共通化されているが、**配置データ・応援予約・休み判定・通知 seed が画面ごとに独立 hardcode** されており、画面遷移時に矛盾が露呈する（例: SL では林さんが常時休み、WS では特定日のみ休み、LA では別パターン）。

---

## 1. 現状調査レポート

### 1.1 既に共通化されているもの (SSOT 成立)

| 項目 | 単一情報源ファイル | 参照画面 |
|------|-------------------|---------|
| 社員マスター (25名) | `mock-employees-data.js` | SL / WS / LA / OB |
| 車両マスター (15台) | `mock-vehicles-data.js` (`DEFAULT_VEHICLES`) | SL / WS / LA |
| 車両整備予定 | `mock-vehicles-data.js` (`DEFAULT_VEHICLE_SCHEDULES`) | SL / WS / LA |
| ETCカード | `mock-vehicles-data.js` (`DEFAULT_ETC_CARDS`) | 全画面 |
| グループ会社・組織階層 | `demo-data.js` | SL / WS |
| デモ「今日」 | `OmsMockStore.getDemoToday()` | 全画面 |
| LA → WS 休暇申請反映 | `OmsMockStore.getLeaveApplications()` + `wsApplyLeaveApplications()` | WS が LA を読み取り |

### 1.2 SSOT が**取れていない**もの（修正対象）

| 項目 | 現状の分散先 | 不整合の具体例 |
|------|-------------|----------------|
| **応援パートナーマスター** | SL: `screen-layout.js:341-370` / WS: `weekly-schedule.js:97-156` で別 seed | WS は p4=D社④(nikkei) / SL は partner-4=E社⑤(zennihon) と末尾が違う。Preset含む数も SL=5 / WS=6 |
| **応援予約 (`supportReservations`)** | SL/WS で独立 hardcode | SL は「今日のみ」 / WS は5日分。SL で予約変更しても WS に反映されない |
| **WS 配置社員 (`assignments`)** | `weekly-schedule.js:259-331` `generateDemoAssignments()` の 28件 hardcode | SL/LA はこの配置を一切知らない。例: WS で emp5(林) が 4/7 に出勤しているが SL/LA は無関係 |
| **WS 配置車両 (`vehicleAssignments`)** | WS で 9件 hardcode | SL は車両配置の概念なし、LA も未参照 |
| **WS 初期休み (`holidays`)** | WS で 4件 hardcode + LA から動的反映 | WS hardcode の 4件が LA `seedDemoLeaves()` の 14件と日付・対象社員が一致していない可能性大（要検証→確認では実際に不一致） |
| **LA 内 WS 配置 (`laWsAssignments`)** | `leave-application.js:195-214` で 8件 hardcode | 本物の WS 配置データ (`wsAssignments`) を参照せず、独自の偽データを持つ。LA上の「申請日に現場配置あり」表示が事実と食い違う |
| **LA 休暇申請 seed (`seedDemoLeaves`)** | `leave-application.js:256-288` の 14件 hardcode | empIdx 25, 26 が配列外（マスター 0〜24）→ 申請レコードが消える / 反映されないバグあり |
| **通知 seed 内の人名** | `leave-application.js:1452,1464` で `"DCP-柊本"`, `"DCP-斎藤"` | 「柊本」はマスターに存在しない架空社員。「DCP-」プレフィックスも仕様未定 |
| **SL 応援系通知 seed** | 未実装 (N-3.2 待ち) | sl-reservation-add/modify/delete が seed されていない。WS 側のみ部分実装 |

### 1.3 整合性チェック詳細

#### A. isOnLeave 3名と LA seed の整合性
- マスターで `isOnLeave: true` の3名: **林 (touo)** / **清水 (nikkei)** / **前田 (zennihon)**
- LA seed の approved 申請: 林 (3/3, 3/4) / 前田 (5/10) / 鈴木 (5/15 pm) / 山本 (5/15) / 木村 (5/15) / 小林 (5/27 am)
- → **「isOnLeave=今この瞬間休んでいる人」と「LA の approved 申請日」がそもそも別概念**。デモ「今日」=2026-05-28 に approved な人は誰もいない。LA 申請 + isOnLeave フラグの意味的な定義が必要。

#### B. WS 配置と LA 内 `laWsAssignments` の整合性
- WS の `generateDemoAssignments` 28件と LA の `laWsAssignments` 8件は**完全に別 hardcode**。
- 例: LA は「emp5 (林) が 5/3 に ◇◇整備工場 昼」と主張するが、WS の seed にはその配置レコードがない。

#### C. WS 初期休み 4件 vs LA seed 14件
- WS `generateDemoAssignments` 内の `holidays[idx][dateKey]=true` 初期 4件は LA seed と独立して書かれている。
- ただし `wsApplyLeaveApplications()` が動くと LA seed (14件) が WS に上書き反映される **→ ランタイムでは LA seed が優先される**。
- WS 初期 hardcode 4件は事実上の dead code (LA seed で上書きされる) なので削除可能。

---

## 2. 一本化方針

### 2.1 新規ファイル: `docs/mockup/mock-assignments-data.js`

下記すべてを単一ファイルに集約し、`window.OmsMockAssignmentsData` で提供する。

```javascript
window.OmsMockAssignmentsData = {
    // 応援パートナーマスター（preset 1 + 通常 5 = 計 6）
    createSupportPartners: function() { return [...]; },

    // 応援予約: partnerId → dateKey → { flex: 人数 }
    createSupportReservations: function() { return {...}; },

    // 応援配置: partnerId → dateKey → shift → [siteId]
    createSupportAssignments: function() { return {...}; },

    // 社員配置: empIdx → dateKey → shift → [siteId]
    //   (これが SL/WS で同じ社員が同じ日に同じ現場にいる状態を作る)
    createEmployeeAssignments: function() { return {...}; },

    // 車両配置: dateKey → shift → siteId → vehicleId
    createVehicleAssignments: function() { return {...}; },

    // WS 現場マスター（社員配置と siteId 整合のため）
    createSites: function() { return [...]; },
};
```

### 2.2 LA 休暇申請 seed の権威化

- 「誰がいつ休んでいるか」の権威データは **`OmsMockStore.getLeaveApplications()` (LA seed) に一本化**。
- 社員マスターの `isOnLeave` フラグは廃止せず**「デモ今日 (2026-05-28) を含む期間に approved 申請がある社員のショートカット」**として残す（後方互換）。
- LA seed のデモ「今日」を含む approved 申請を、マスターの `isOnLeave: true` 3名と完全一致させる。
  - 例: 林 / 清水 / 前田 がデモ今日に approved 申請を持つように seed を調整。
- `seedDemoLeaves` の empIdx 25, 26 バグを修正（配列範囲内に収める）。

### 2.3 各画面の seed 関数を共通ソースから取得するように改修

| 画面 | 変更前 | 変更後 |
|------|--------|--------|
| SL | `slSeedSupportDemoData()` 内で hardcode | `OmsMockAssignmentsData.createSupportPartners/Reservations` を呼ぶ |
| WS | `seedSupportDemoData()` / `generateDemoAssignments()` で hardcode | 同上 + `createEmployeeAssignments` / `createVehicleAssignments` を呼ぶ |
| LA | `laWsAssignments` の 8件 hardcode | `OmsMockAssignmentsData.createEmployeeAssignments` を集約して同じ形に変換 |
| 通知 seed | "DCP-柊本" 等架空人名 | マスターに存在する実在社員名 + 部門記号は仕様策定後に再導入 (今回は人名のみ修正) |

### 2.4 通知 seed の整合性

- 通知 seed が言及する `(siteId, dateKey, empName, partnerId, vehicleId)` はすべて `OmsMockAssignmentsData` 上に実在するレコードを参照する。
- 例: 「emp5 (林) を 2026-05-28 の現場 s1 に配置」という通知 seed があるなら、`createEmployeeAssignments()` にも emp5→'2026-05-28'→'day'→['s1'] を入れる。

---

## 3. 実装ステップ

| Step | 内容 | 影響ファイル |
|------|------|--------------|
| **S1** | `mock-assignments-data.js` を新規作成。現在 WS で hardcode されている配置 28件 + 応援6社 + 応援予約パターンを移植 | `docs/mockup/mock-assignments-data.js` (新規) |
| **S2** | LA `seedDemoLeaves` の empIdx 25/26 バグ修正 + デモ今日に林/清水/前田の approved 申請を追加 | `leave-application.js:256-288` |
| **S3** | SL `slSeedSupportDemoData` を共通ソース参照に置換 | `screen-layout.js:341-370` |
| **S4** | WS `generateDemoAssignments` / `seedSupportDemoData` を共通ソース参照に置換、WS の初期休み 4件 hardcode を削除（LA seed に統一） | `weekly-schedule.js:97-156, 259-331` |
| **S5** | LA `laWsAssignments` の 8件 hardcode を共通ソース参照に置換 | `leave-application.js:124-127, 195-214` |
| **S6** | 通知 seed の "DCP-柊本" を実在社員名に置換、その他人名違反を修正 | `leave-application.js:1422-1472` (laCnSeedInitialDemo)、他 |
| **S7** | 各 HTML の script タグに `mock-assignments-data.js` を追加 + キャッシュバスター | `screen-layout.html` / `weekly-schedule.html` / `leave-application.html` |
| **S8** | 手動検証: SL/WS/LA 各画面でデモ今日の配置・休み・応援が同じデータを見せるか確認 | — |

---

## 4. リスク・確認事項

- **WS hardcode 配置 28件の中身**: 既存のデモ動作（休日出勤テストなど）を壊さないように、共通ソースに**忠実に移植**する。WS の現状動作が変わらないことを確認。
- **SL は OB から配置を引いている**: SL の社員配置は注文書から自動生成されるため、共通ソースに「emp→date→shift→site」を入れただけでは SL に反映されない可能性。SL 側に「共通配置データを画面に反映する」コードを追加する必要があるか要検討。
- **「LA approved = 休み」概念の確定**: isOnLeave フラグと LA 申請 status の関係をどう定義するか、ユーザー確認後に確定。
- **N-3.2 (SL 応援通知 seed) との衝突**: 本プランで応援予約データを一本化するが、SL 応援通知 seed の実装は別タスク (N-3.2) として残っている。データ層の一本化が先に入ることで、N-3.2 実装が容易になる方向。

---

## 4.5. 決定事項 (2026-05-28 ユーザー承認)

- **isOnLeave の定義**: LA seed を権威とし、デモ今日 (2026-05-28) に approved 申請がある社員のショートカットとして isOnLeave フラグを残す。LA seed 側を「林・清水・前田が 2026-05-28 を含む期間に approved」になるよう調整する。
- **SL 配置の扱い (最終)**: SL の社員配置を共通ソースから読み取り描画する方針は維持しつつ、実装は **Phase 2 として分離** する。
  - 理由: SL の行は OB 由来 (`branch/category/shift/company/task`) で識別され、WS は `siteId` で識別しているため、共通ソース → SL 行 のマッピング処理に `screen-layout.js` 広範囲の改修が必要。Phase 1 と切り離すことでデグレリスクを下げる。
- **Phase 1 スコープ (今回実施)**:
  1. `mock-assignments-data.js` 新規作成 (応援パートナー / 応援予約 / 社員配置 / 車両配置 / 車両整備 を集約)
  2. WS の seed を共通ソース参照に置換
  3. SL の応援 seed を共通ソース参照に置換 (SL 配置は手付かず)
  4. LA `seedDemoLeaves` のバグ修正 + デモ今日に林/清水/前田 approved 追加
  5. LA `seedWsAssignments` を共通ソースから派生
  6. 通知 seed の架空人名 ("柊本" 等) を実在社員名に
  7. HTML 6本に `mock-assignments-data.js` script タグ追加
- **Phase 2 スコープ (2026-05-29 完了)**:
  - SL 描画時に `OmsMockAssignmentsData.createEmployeeAssignments()` から「デモ今日 (現在表示日) の配置」を読み取り、OB 由来の空行に初期配置を充填するマッピング処理を追加

## 4.6. Phase 2 実装記録 (2026-05-29 完了 / Claude Code Opus 4.8)

### 決定事項
- **WS現場(s1〜s6) ⇄ SL受注行の対応**: 対応表を新設する方針 (ユーザー承認)。`mock-assignments-data.js` に `createSiteOrderMap()` を追加し、siteId → {会社, 業務} を定義。SL は描画時に「会社+業務+shift」一致で行を解決。
- **ランダム受注問題の対処**: SL は受注のある行しか描画せず、当日受注の有無は `generateCellData` が `Math.random()` でランダムに決める (OmsMockStore に永続)。対応表6行がデモ今日に必ず描画される保証がないため、`buildMonthState` 後に `ensureDemoTodayPlacementRows()` でデモ今日(5/1)の対応6行へ受注エントリを保証注入する (ユーザー承認のクロス画面修正)。shift は配置データから導出し対応表の二重管理を回避。

### 対応表 (createSiteOrderMap)
| siteId | 現場 | → OB受注行 (会社 / 業務 / shift) |
|---|---|---|
| s1 | ○○ビル | (株)丸山建設 / 〇〇ビル巡回 / 昼 |
| s2 | △△マンション | (株)丸山建設 / △△マンション / 昼 |
| s3 | 国道1号線 舗装工事 | □□警備(株) / 国道1号線 / 夜 |
| s4 | 県道15号 橋梁工事 | □□警備(株) / 県道12号線 / 夜 |
| s5 | 高速SA補修 | (株)〇〇高速 / 東名SA巡回 / 昼 |
| s6 | ○○アリーナ | 全日本エンタープライズ / 商業施設A / 昼 |

### 実装ファイル
- `mock-assignments-data.js`: `createSiteOrderMap()` 新設 + export、samplePlacements にデモ今日(dayOffset 4)配置12件追加 (休暇中3名除外)
- `mock-orders-data.js`: `buildDemoCellEntry()` / `ensureDemoTodayPlacementRows()` 新設、`buildMonthState` から呼び出し
- `screen-layout.js`: `slRefreshRowCountDisplay()` 抽出、`slGetDefaultPlacementContext()` / `slApplyDefaultPlacementToRow()` 新設。`slBuildStateFromOrderBookDate` で保存状態の無い行のみ初期充填 (savedRows[savedKey] === undefined のとき)

### 検証 (Playwright, 2026-05-29)
- SL: 5/1 に全6現場の社員を共通ソースと完全一致で描画 (田中/佐藤, 山本, 高橋/斎藤, 小林/木村, 橋本/渡辺, 吉田/山田/松本)
- SL ⇄ WS が 5/1 で社員・現場一致
- OB: 注入により6行すべてに 5/1 受注エントリ
- SL/WS/OB すべて console エラー0
- 配置削除が再読込後も維持 (初期充填が保存状態を上書きしない)

## 5. 完了基準

- [ ] `mock-assignments-data.js` が新設され、SL / WS / LA / 通知 seed が同じソースを参照
- [ ] LA `seedDemoLeaves` の empIdx 範囲外バグが解消
- [ ] デモ今日 (2026-05-28) の状態が SL / WS / LA で完全一致（同じ社員が同じ現場に配置、同じ社員が休み、同じ応援予約が見える）
- [ ] 通知 seed に架空人名 ("柊本" 等) が登場しない
- [ ] 手動検証で SL → WS → LA の画面遷移時に状態の食い違いがないことを確認
