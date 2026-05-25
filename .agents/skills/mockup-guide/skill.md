---
name: mockup-guide
description: モックアップ作成・編集時のCSS Grid、カラーパレット、バッジシステム等の規約。モックアップ関連の作業時に参照。
allowed-tools: Read, Grep, Glob
---

## Mockup Conventions

- CSS Grid layout for spreadsheet-like order book
- Coastal Light color palette (CSS variables in `:root`)
- Badge system: parent = category (read-only), children = selectable chips, grandchildren = detail items
- `categoryToBadgeId` maps category names to badge definition IDs
- Row edit modal uses chip selection (not dropdowns) for 会社/区分/昼夜
- Category additions auto-sync to badgeDefinitions
- Code marked with `【モックアップ専用】` or `【検証用】` is demo-only and not needed in production

## Key Files

- Mockup A（業務管理計画書）: `docs/screen-layout.html` + `docs/mockup/screen-layout.{js,css}`
- Mockup B（受注簿）: `docs/order-book.html` + `docs/mockup/order-book.{js,css}`
- Mockup C（Quick Access）: `docs/quick-access.html` + `docs/mockup/quick-access.{js,css}`
- UIコンポーネント集: `docs/ui-components/index-light.html` + `{script-light.js, styles-light.css}`
