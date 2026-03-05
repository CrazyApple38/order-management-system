# Claude Code Configuration

## Project Overview

受注管理システム（Order Management System）- Supabase + Next.js

Excel VBAで運用していた受注簿・業務管理計画書をWebシステム化するプロジェクト。

## Development Process

開発手順の詳細は `docs/00_開発手順書.md` を参照。

### Current Phase: Phase 2 — モックアップ開発サイクル

### Mockup Status

| ID | 画面名 | 状態 | フィードバック |
|----|--------|------|---------------|
| A | 業務管理計画書 | 作成中 | — |
| B | 受注簿 | 作成中 | — |
| C | Quick Access（受注クイック入力） | — | — |
| D | 経理画面（グループ間請求確認） | — | — |
| E | 休日申請管理 | — | — |

### Phase Gate Rules（厳守）

1. **フェーズ進行にはユーザーの明示的な宣言が必要**
   - 「モックアップ完了」→ Phase 3へ
   - 「仕様書作成完了」→ Phase 4へ
   - **宣言がない限り、次フェーズの作業は一切行わない**
2. **フィードバック反映（要件定義・DB設計の更新）は自動で進めてよい**
3. **モックアップ間の整合性修正は事前にユーザーへ報告し、承認後に実施**

## Key Files

- `docs/00_開発手順書.md` — 開発プロセス手順書
- `docs/01_要件定義.md` — システム要件定義
- `docs/02_既存システム分析.md` — 既存システム分析
- `docs/03_データベース設計.md` — DB設計書（PostgreSQL / Supabase）
- `docs/04_差分処理要件定義.md` — 差分処理要件定義
- Mockup A（業務管理計画書）: `docs/screen-layout-v2-light.html` + `docs/mockup/screen-layout-v2-light.{js,css}`
- Mockup B（受注簿）: `docs/order-book-light.html` + `docs/mockup/order-book-light.{js,css}`
- UIコンポーネント集: `docs/ui-components/index-light.html` + `{script-light.js, styles-light.css}`

## Technical Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Mockup**: Vanilla HTML/CSS/JS (CSS Grid layout)

MCP設定: `docs/mcp-servers.md` を参照

## Project Rules

- **Confirmation Rule**: When responding to user requests, confirm step-by-step until understanding exceeds 90%. If there are better approaches or improvements, propose them step-by-step for user confirmation.
- **Naming Consistency Rule**: 用語・名付けについて、整合性が取れないものや判断が必要なものがある場合、ユーザーにステップバイステップで確認すること。自己判断で用語を統一しない。
- **No Playwright**: User tests in browser themselves. Playwrightを使ったブラウザ確認は不要。

## Mockup Conventions

- CSS Grid layout for spreadsheet-like order book
- Coastal Light color palette (CSS variables in `:root`)
- Badge system: parent = category (read-only), children = selectable chips, grandchildren = detail items
- `categoryToBadgeId` maps category names to badge definition IDs
- Row edit modal uses chip selection (not dropdowns) for 会社/区分/昼夜
- Category additions auto-sync to badgeDefinitions
- Code marked with `【モックアップ専用】` or `【検証用】` is demo-only and not needed in production
