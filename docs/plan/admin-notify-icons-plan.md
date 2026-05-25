# 管理者アカウント用 変更通知アイコン管理画面 — 計画書

**最終更新**: 2026-05-25
**ステータス**: 計画策定中 / 実装未着手
**対象**: ナビバー「マスタ管理」配下 + `docs/admin-notify.html` (新規)
**起点**: ユーザーからの「notify-compare.html のマトリクス選定 / 通知一覧を管理者向け機能として組み込む」依頼 (2026-05-25)

---

## 1. 背景・目的

### 1.1 現状

- 通知アイコンの選定・通知タイプの編集 UI は `docs/preview/notify-compare.html` に開発者プレビューとして実装済 (10 モード)
- マトリクス選定 (N-2.4) と通知一覧 (N-3.4) はモック段階の選定/編集ツールとして既に機能
- localStorage (`notifyPrimitives.v1` / `notifyTypeOverrides.v1` / `notifyIconSelections.v1`) に保存
- 本番アプリ (`docs/*.html`) からは到達手段なし

### 1.2 目的

運用者 (管理者ロール) がログイン後、ナビバー経由で通知アイコン・通知タイプを編集できる **本番アプリ内の管理者画面** を新設。preview のロジックを最大限再利用し、メンテナンス二重化を回避。

### 1.3 スコープ外

- ロールベース権限制御 (Phase 4 実装フェーズで追加)
- Supabase テーブル設計 (DB 設計時に確定)
- 個人設定との連動 ([project_account_management](../../../../Users/Owner/.claude/projects/c--xampp-htdocs-order-management-system/memory/project_account_management.md) で扱う)

---

## 2. 確定仕様 (2026-05-25 ヒアリング結果)

| Q | 論点 | 決定 |
|---|------|------|
| Q1 | 含める機能 | **4 モード**: アイコン選定 (N-2.1) / N-2 統合プレビュー / マトリクス選定 (N-2.4) / 通知一覧 (N-3.4) |
| Q2 | 起動導線 | **ナビバー「マスタ管理」配下の最下段** に区切り + 「変更通知設定」を追加 |
| Q3 | 画面構成 | **1 画面でタブ切替** (preview のモードボタン UI を流用) |
| Q4 | ファイル戦略 | **`docs/admin-notify.html` を新規作成** + preview は併存 (開発者ツールとして維持) |
| Q5 | 保存先・権限 | **localStorage のまま / 権限チェックなし** (モック段階の妥当性) |
| Q6 | JS/CSS 実装 | **preview の `notify-compare.{js,css}` をそのまま読み込み**、admin 側で不要モード非表示 + 4 モードのみ表示 |
| Q7 | タブラベル | **主能名 (説明的)**: 「アイコン選定」/「ベルパネルプレビュー」/「マトリクス選定」/「通知タイプ一覧」 |

---

## 3. 全体設計

### 3.1 ファイル構成

```
docs/
├── admin-notify.html        ← 新規 (管理者向け本番画面)
├── preview/
│   ├── notify-compare.html  ← 並存 (開発者プレビュー / 10 モード)
│   ├── notify-compare.js    ← 共通利用 (admin / preview 双方が読み込み)
│   └── notify-compare.css   ← 共通利用
└── mockup/
    └── co-navbar.js         ← マスタ管理メニュー項目追加
```

### 3.2 ナビバー導線

`co-navbar.js` の `masterItems` 配列に末尾項目を追加:

```js
var masterItems = [
    { id: 'employee', label: '社員', ... },
    // ... 既存 11 項目 ...
    { id: 'holiday', label: '祝日', ... },
    { divider: true },                                          // ← 新規区切り
    { id: 'admin-notify', label: '変更通知設定', icon: 'gear.svg' }  // ← 新規
];
```

`admin-notify` のみ `pageLinks['admin-notify'] = 'admin-notify.html'` でページ遷移、モーダルではなくページ遷移とする。

### 3.3 admin-notify.html 画面構成

```
┌─────────────────────────────────────────────┐
│  共通ナビバー (md-nav-bar)                   │
├─────────────────────────────────────────────┤
│  ページタイトル                              │
│    📌 変更通知設定 (管理者)                  │
│    システム全体の通知アイコンとタイプを編集  │
├─────────────────────────────────────────────┤
│  [アイコン選定][ベルパネル][マトリクス][通知タイプ一覧]
├─────────────────────────────────────────────┤
│                                              │
│   選択されたモードの本体 UI                  │
│   (preview/notify-compare.{js,css} 由来)     │
│                                              │
└─────────────────────────────────────────────┘
```

### 3.4 preview JS の再利用方式

**問題**: preview の JS は preview/ 起点で動作する前提 (例: `MTX_ICON_BASE = '../assets/icons/'`)。docs/admin-notify.html (docs/ 直下) から読み込むとパス解決が壊れる。

**解決**: `notify-compare.js` 冒頭に window override hook を導入:

```js
// preview/notify-compare.js
var MTX_ICON_BASE = window.NOTIFY_COMPARE_ICON_BASE || '../assets/icons/';
var N34_ICON_BASE = window.NOTIFY_COMPARE_ICON_BASE || '../assets/icons/';
// (既存 2 箇所を hook 化)
```

`admin-notify.html` の `<head>` で事前設定:

```html
<script>window.NOTIFY_COMPARE_ICON_BASE = 'assets/icons/';</script>
```

preview 側は default 値で従来通り動作 (後方互換)。

### 3.5 不要モードの非表示

admin では 4 モード (icons / n2-integration / matrix / n34) のみ表示。preview のモードボタン全 10 個のうち 6 個 (before / after / history / bell-order / panel-layout / auto-overlay) は CSS で非表示。

**方式**: `admin-notify.html` 内に scoped CSS で:
```css
.cmp-mode-tab[data-mode="before"],
.cmp-mode-tab[data-mode="after"],
.cmp-mode-tab[data-mode="history"],
.cmp-mode-tab[data-mode="bell-order"],
.cmp-mode-tab[data-mode="panel-layout"],
.cmp-mode-tab[data-mode="auto-overlay"] { display: none !important; }
```

タブラベルも CSS attribute hack (`::before` content) または JS で書き換え:

```js
document.querySelector('[data-mode="icons"]').textContent          = 'アイコン選定';
document.querySelector('[data-mode="n2-integration"]').textContent = 'ベルパネルプレビュー';
document.querySelector('[data-mode="matrix"]').textContent         = 'マトリクス選定';
document.querySelector('[data-mode="n34"]').textContent            = '通知タイプ一覧';
```

(JS の方が明示的でメンテしやすいので JS 採用)

### 3.6 初期表示モード

admin 起動時は「マトリクス選定」モードをデフォルト表示 (最も日常的に使う想定)。
URL ハッシュ (`#matrix` / `#n34` 等) でモード指定可。

---

## 4. 影響範囲

| ファイル | 変更内容 |
|---------|---------|
| `docs/admin-notify.html` | 新規作成 — タイトル / タブ / preview JS 読み込み |
| `docs/mockup/co-navbar.js` | masterItems に divider + 「変更通知設定」追加 / pageLinks に admin-notify 追加 |
| `docs/preview/notify-compare.js` | アイコンパス 2 定数を window override hook 化 (後方互換維持) |
| `docs/preview/notify-compare.html` | **無変更** (preview 動作影響なし) |

---

## 5. Phase 構成

```
A-1: preview JS の window override hook 追加 + 既存動作確認
      ↓
A-2: docs/admin-notify.html 新規作成 + ナビバー導線追加 + Playwright 動作確認
      ↓
A-3: ラベル/初期表示/ハッシュ遷移の調整 + 視覚確認
      ↓
A-4: ユーザーレビュー
```

各 Phase は独立コミット単位、A-2 完了後にユーザーレビューを経て A-3 へ。

---

## 6. リスク・未確定事項

### リスク

| 項目 | 内容 | 対策 |
|------|------|------|
| preview の 6 モード非表示が将来壊れる | preview に新モード追加された際に admin で勝手に表示される | admin 側で「表示する 4 モード」をホワイトリスト化 (CSS で display:none ではなく display:flex を 4 つに限定) |
| アイコンパスのハードコード追加箇所 | 他に `'../assets/icons/'` がある可能性 | A-1 着手時に grep で全件抽出して hook 化 |
| preview の不要モードが本番から見える | URL 直叩きや DevTools 操作で非表示モードが見える可能性 | モック段階では許容、Phase 4 実装時に admin/preview の JS 分離を検討 |
| DS 不揃い | preview の CSS は preview 用、admin の他画面と見た目が違う | A-3 で確認、必要なら admin 側でラッパー CSS を追加 |

### 未確定事項 (実装着手時 / 完了後に詰める)

- A-3 完了時のキャッシュバージョン (admin-notify.html 初期 = ?v=1)
- 個人設定 ([project_account_management](../../../../Users/Owner/.claude/projects/c--xampp-htdocs-order-management-system/memory/project_account_management.md)) との関係 — 「全ユーザー共通」設定か「個人ごと」設定か (現状は localStorage = ブラウザ単位)
- Phase 4 実装時の DB スキーマ (`notification_icon_settings` テーブル想定 / 別途設計)

---

## 7. 関連計画

| 既存計画 | 関係 |
|---------|------|
| `notification-refactor-plan.md` | 本計画は通知システム本体のリファクタ完了後 (Phase N-2.4) の運用補助。本計画着手後も notification-refactor の Phase N-3 以降は独立進行可 |
| `project_account_management.md` (メモリ) | 個人設定保存・ログイン時復元の方針が確定したら、admin 側の localStorage を個人設定領域に統合 |

---

**本計画はモックアップ段階。実装着手前に各 Phase でユーザーレビュー必須 (Phase Gate Rules 準拠)。**
