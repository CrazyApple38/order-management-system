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
| C | Quick Access（受注クイック入力） | 作成中 | — |
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

## Technical Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Mockup**: Vanilla HTML/CSS/JS (CSS Grid layout)

MCP設定: `docs/mcp-servers.md` を参照

## Project Rules

- **会話言語**: 会話は日本語で行うこと。
- **確認ルール（厳守）**:
  1. **理解の要約確認**: ユーザーの会話や指示を受けたら、まず自分の理解を要約して提示し、認識が合っているか確認してから作業を実行すること。
  2. **理解度90%未満の場合**: 理解度が90%に達するまで、ステップバイステップで質問・確認を行うこと。90%を超えてから作業を開始する。
  3. **補足確認・先読み**: 指示に対して補足的に確認が必要なことや、次のステップで考えられる問題点があれば、ステップバイステップで質問・確認を行うこと。
  4. **提案**: より良いアイデアや提案があればステップバイステップで確認を行うこと。
  5. **確認の形式**: ステップバイステップの質問・確認時は、クリック可能な選択肢（A/B/C…）を提示してユーザーが選択できる形式にすること。選択肢だけでは回答しきれない場合のみ、自由入力欄を併記してよい。
- **誤り指摘ルール**: ユーザーの意見や認識に誤りがある場合は、指摘して説明すること。
- **命名整合性ルール**: 用語・名付けについて、整合性が取れないものや判断が必要なものがある場合、ユーザーにステップバイステップで確認すること。自己判断で用語を統一しない。

## アイコン運用ルール（厳守）

UIコンポーネント集・モックアップでアイコンが必要な場面は、必ず `docs/assets/icons/` のアイコンライブラリから採用すること。

1. **ライブラリ所在**
   - 場所: `docs/assets/icons/`（27カテゴリ、15,652件）
   - 検索インデックス: `docs/assets/icons/index.json`（`id / title / cat / file / fmt / src` フィールド）
   - 命名: `im-{id}-{slug}.svg`（icooon-mono、推奨）/ `si-{id}-{slug}.png`（silhouette-illust）
2. **採用ルール**
   - アイコンが必要になったら、まずライブラリから探す。見つからない場合のみカスタムSVGを自作する
   - **絵文字（📋 等）・Unicode記号（×、✓、！、？、★、＋、▾、⋮ 等）での代用は禁止**（OS・ブラウザで見た目がバラつくため）
   - 色変更が必要な箇所は必ずSVG形式（`im-*.svg`）を選ぶ。PNG（`si-*.png`）は色変更が難しいため避ける
3. **実装パターン（推奨）**
   - `<svg><defs><symbol id="ui-icon-xxx" viewBox="0 0 512 512">...</symbol></defs></svg>` でスプライト定義
   - 各所で `<svg class="ui-icon"><use href="#ui-icon-xxx"/></svg>` で参照
   - 共通CSS: `.ui-icon { width: 1em; height: 1em; fill: currentColor; vertical-align: -0.125em; }`
   - icooon-mono のSVGはすでに `fill: currentColor` が適用済みのため、親要素の `color` プロパティで色が一括制御できる
4. **よく使う記号の採用アイコン（UIコンポーネント集で確定済）**
   - info → `sign-mark/im-11925-infomeeshon.svg`
   - check（成功・チェック）→ `sign-mark/im-11451-chekku-maaku-no-muryou.svg`
   - exclaim（警告・エラー）→ `sign-mark/im-11478-bikkuri-maaku.svg`
   - caution（三角注意）→ `sign-mark/im-11908-chuui-maaku.svg`
   - close（×）→ `sign-mark/im-11911-hosoi-batsu.svg`
   - question（?）→ `sign-mark/im-11574-hatena.svg`
   - plus（+）→ `sign-mark/im-00105-purasu.svg`
   - star（★）→ `sign-mark/im-10058-okiniiri-osusume-ni-tsukaeru-hoshi-aikon.svg`
   - chevron-down（▾）→ `sign-mark/im-12243-yajirushi-aikon-shimo-2.svg`
   - chevron-up（▴）→ `sign-mark/im-12242-yajirushi-aikon-ue-2.svg`
   - document（書類）→ `stationery/im-00051-kami-to-pen.svg`
   - settings（歯車）→ `sign-mark/im-00001-muryou-no-settei-haguruma.svg`
5. **再ダウンロード / 追加DL**: `scripts/download-icons.js`（レジューム対応）

メニュー（⋮ kebab/three-dots）に相当するアイコンはライブラリに無いため、当面は「歯車（settings）」で代替する。必要になったら新規追加するか自作SVGで対応。

## Context Optimization Rules（厳守）

コンテキストウィンドウの消費を最小化するため、以下を厳守すること。

1. **TodoWriteは最小限に使用**
   - 3ステップ以上のタスクでのみ使用
   - 初回作成 + 完了マーク更新のみ。`in_progress`への切替だけの呼び出しは禁止
   - タスク説明は簡潔に（1行以内）
2. **計画の単一情報源（Single Source of Truth）**
   - 計画はプランファイルのみに記述。TodoWriteとの二重管理禁止
   - 承認後のテキスト要約出力は不要（即座に実装開始）
3. **完了報告は簡潔に**
   - 変更ファイル名 + 1行要約のみ
   - 変更内容の詳細列挙は不要（diffで確認可能）
4. **探索エージェントの結果は必要部分だけ抽出**
   - 全文転記しない。行番号・関数名など必要情報のみ参照
   - 直接Read/Grepで確認できるものはエージェントを使わない
