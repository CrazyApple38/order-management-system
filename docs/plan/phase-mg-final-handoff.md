# Phase M-G-Final（Legacy Cleanup）引継ぎ資料

- 作成日: 2026-04-21
- 対象: **新会話での再開用**
- 本書の位置付け: Phase M/S/W/Q 完了後の「legacy aliases 一括撤去」専用の最終フェーズ

---

## 1. これまでの到達点（新会話向けサマリ）

| フェーズ | 対象 | 状態 | コミット | 備考 |
|---------|------|------|---------|------|
| M0      | 共通基盤（co-tokens/forms/buttons/modal 作成） | 完了 | `95acce5` | co-tokens.css に legacy aliases も同梱 |
| M (A〜G) | Order Book | 完了 | `b0b7bdb` → `a9d7483` | M-G1で旧 `.md-ob-*` 0件確認、legacy aliases のみ他画面依存で保持 |
| S (A〜G) | Screen Layout | 完了 | `a26a118` (S/W/Q統合) | S-G: 97/100 PASS、JS依存クラスは永続残置 |
| W (A〜G) | Weekly Schedule | 完了 | `a26a118` | W-G: 91/100 PASS、`--md-gc-bg-*` 温存 |
| Q (A〜G) | Quick Access | 完了 | `a26a118` | Q-G: 93/100 PASS |
| ベル復活 | OB/SL 画面ベル + ナビバー独立モーダル | **未コミット** | — | 下記2参照 |

**参照すべき既存成果物**
- マスタープラン: [docs/plan/ds-migration-plan.md](../plan/ds-migration-plan.md)
- ガバナンス: [docs/plan/ds-migration-governance.md](../plan/ds-migration-governance.md)
- 過去のフェーズログ（TD/IM/TE/SC）: [docs/plan/phase-logs/](../plan/phase-logs/) 114ファイル
- DS原典: [docs/ui-components/styles-light.css](../ui-components/styles-light.css), [tokens.json](../ui-components/tokens.json)
- DSトークンSSoT: [docs/mockup/co-tokens.css](../mockup/co-tokens.css)

---

## 2. 直前会話の未コミット作業

以下の変更が未コミット状態で残存（ユーザーが OB/SL の画面ベルが消えたことを報告 → 復活・独立化したもの）：

```
 M docs/mockup/co-navbar.css      # 画面横断通知モーダル .md-nav-cn-* 追加
 M docs/mockup/co-navbar.js       # 独立モーダル + バッジ独立カウント
 M docs/mockup/order-book.css     # .md-cn-notify-btn を DSトークン化
 M docs/mockup/screen-layout.css  # .md-cn-notify-btn を DSトークン化
 M docs/order-book.html           # ベル復活 + co-navbar v=3→v=4
 M docs/quick-access.html         # co-navbar v=3→v=4
 M docs/screen-layout.html        # ベル復活 + co-navbar v=3→v=4
 M docs/weekly-schedule.html      # co-navbar v=3→v=4
```

**通知ベルの意図定義（確定仕様）**
- **ナビバーのベル**（`mdNavNotifyBtn`）: マスタ管理・休暇申請など、**画面を跨いで全ユーザーに共通する変更通知**。画面固有モーダルを呼ばず、独立モーダル `mdNavCnModal`（ダミー3件）を開く。
- **各画面のベル**（`obCnNotifyBtn` / `cnNotifyBtn`）: その画面における**全行を総括した変更通知**。既存の `obCnOpenModal()` / `openChangeNotifyModal()` を呼ぶ。
- 両者は別物として機能。バッジは独立カウント。
- WS は元々ベル無しのためそのまま。QA の2箇所ベルは据え置き。

**推奨アクション**: 新会話開始直後に
```
git add docs/mockup/co-navbar.* docs/mockup/order-book.css docs/mockup/screen-layout.css docs/*.html
git commit -m "feat(ui): 画面ベル復活 + ナビバーを画面横断通知の独立モーダルへ分離"
```
してから Phase M-G-Final に着手するのが安全。

---

## 3. Phase M-G-Final のスコープ

### 3.1 必須作業

#### A. co-tokens.css から legacy aliases セクション削除
対象: [docs/mockup/co-tokens.css](../mockup/co-tokens.css) L177〜222（`legacy aliases (deprecated)` コメント以下のブロック全体）

#### B. 削除に伴う参照の一括書換え
以下のマッピングで grep→置換。`var(--旧変数)` → `var(--新変数)`。

| 旧変数 | 新変数 |
|-------|-------|
| `--base-page` | `--bg-page` |
| `--base-surface` | `--bg-surface` |
| `--base-surface-alt` | `--bg-surface-2` |
| `--base-muted` | `--bg-surface-3` |
| `--sub-primary` | `--bg-sidebar` |
| `--sub-secondary` | `--divider` |
| `--accent` | `--accent-primary` |
| `--accent-light` | `--accent-primary-light` |
| `--accent-dim` | `--accent-primary-dim` |
| `--error` | `--semantic-error` |
| `--success` | `--semantic-success` |
| `--success-text` | `--semantic-success-text` |
| `--warning` | `--semantic-warning` |
| `--warning-text` | `--semantic-warning-text` |
| `--warning-bg` | `--semantic-warning-bg` |
| `--shadow-sm` | `--elevation-1` |
| `--shadow-md` | `--elevation-3` |
| `--shadow-lg` | `--elevation-4` |
| `--shadow-medium` | `--elevation-3` |
| `--shadow-strong` | `--elevation-5` |

**影響ファイル（実測件数）**
| ファイル | Legacy var 参照件数 |
|---------|-------------------:|
| screen-layout.css | 165 |
| weekly-schedule.css | 171 |
| quick-access.css | 117 |
| co-shared-badges.css | 24 |
| co-forms.css | 21 |
| co-buttons.css | 15 |
| co-navbar.css | 9 |
| weekly-schedule.js | 2 |
| **合計** | **524** |

**注**: 上記は grep の単純カウント。モックアップ自身の `:root` 内で同名再定義がある箇所は単純置換で値が変わらないため、書換えを省略可能（要個別判定）。

### 3.2 任意作業（余裕があれば）

#### C. co-shared-badges.css の `.md-ob-*` 旧エイリアス整理
`.bt-*` 側が正式名なので、co-shared-badges.css 内の `.md-ob-badge-*` エイリアスを撤去するか、`.bt-*` のみを残すか方針決めが必要。OB JSが `.md-ob-badge-*` を直接参照しているため、単純削除は不可。

### 3.3 明示的に範囲外（やらないこと）

- **SL `.grid-table` / `.category-*` / `.shift-*` / `.selected`**: JS依存のため永続残置（S-G スコア記録で確認済）
- **WS `--md-gc-bg-*` / `--shadow-medium`**: 将来利用のため温存（W-G で明記）
- **QA `--warning-text` / `--warning-bg`**: 意図的残留（Q-G で確認済）
- **OB `.bt-*` ⇔ `.md-ob-badge-*` の完全統一**: JS大規模リファクタが必要で範囲外

---

## 4. ガバナンス（TD → IM → TE → SC）

既存ガバナンスを踏襲。[docs/plan/ds-migration-governance.md](ds-migration-governance.md) 参照。

**サブフェーズ分割案**
- **LC-1**: `--base-*` / `--sub-*` 系の置換（背景・サイドバー・罫線）
- **LC-2**: `--accent` / `--accent-light` / `--accent-dim` の置換
- **LC-3**: `--error` / `--success*` / `--warning*` の置換
- **LC-4**: `--shadow-*` → `--elevation-*` の置換
- **LC-5**: co-tokens.css から legacy aliases ブロック削除 + 全画面回帰確認

各サブフェーズで TD（テスト定義）→ IM（実装）→ TE（テスト実行）→ SC（スコアリング、70点合格）サイクルを回す。

**スコアリングの変形ルーブリック案（LC専用）**
- A. 対象変数の置換漏れゼロ（30pt）
- B. 未定義変数による CSS 参照エラーゼロ（25pt）
- C. 視覚差分なし（Playwrightスクショ比較）（20pt）
- D. JS 参照破壊ゼロ（15pt）
- E. コミット粒度・メッセージの適切性（10pt）

---

## 5. 新会話での開始プロンプト（推奨テンプレ）

```
Phase M-G-Final (Legacy Cleanup) を開始します。

まず以下を読んでください：
1. docs/plan/phase-mg-final-handoff.md（本書）
2. docs/plan/ds-migration-plan.md
3. docs/plan/ds-migration-governance.md
4. docs/mockup/co-tokens.css（legacy aliases セクション L177-222）

未コミットのベル復活作業があれば先にコミットし、
その後 LC-1 から順に TD→IM→TE→SC サイクルで進めてください。

疑問点は AskUserQuestion で確認してください。
```

---

## 6. 終了条件（Phase 全体の DONE）

- [ ] co-tokens.css から legacy aliases セクションが削除されている
- [ ] 全 co-*.css / 4モックアップCSS で未定義変数参照ゼロ
- [ ] Playwright 4画面視覚回帰ゼロ
- [ ] 全サブフェーズ SC スコア 70点以上
- [ ] 本書の「これまでの到達点」表に `LC完了` 行を追記してコミット
