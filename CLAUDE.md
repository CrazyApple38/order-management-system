# Claude Code Configuration

## Project Overview

受注管理システム（Order Management System）- Supabase + Next.js

Excel VBAで運用していた受注簿・業務管理計画書をWebシステム化するプロジェクト。

## Key Files

- `docs/03_データベース設計.md` — DB設計書（PostgreSQL / Supabase）
- `docs/order-book-light.html` — 受注簿モックアップ（CSS Grid, Coastal Light）
- `docs/mockup/order-book-light.js` — モックアップロジック
- `docs/mockup/order-book-light.css` — モックアップスタイル

## Technical Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Mockup**: Vanilla HTML/CSS/JS (CSS Grid layout)

## MCP Servers

### Playwright (Browser Automation)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/playwright-mcp-server"
      ]
    }
  }
}
```

## Project Rules

- **Confirmation Rule**: When responding to user requests, confirm step-by-step until understanding exceeds 90%. If there are better approaches or improvements, propose them step-by-step for user confirmation.
- **No Playwright**: User tests in browser themselves. Playwrightを使ったブラウザ確認は不要。

## Mockup Conventions

- CSS Grid layout for spreadsheet-like order book
- Coastal Light color palette (CSS variables in `:root`)
- Badge system: parent = category (read-only), children = selectable chips, grandchildren = detail items
- `categoryToBadgeId` maps category names to badge definition IDs
- Row edit modal uses chip selection (not dropdowns) for 会社/区分/昼夜
- Category additions auto-sync to badgeDefinitions
- Code marked with `【モックアップ専用】` or `【検証用】` is demo-only and not needed in production
