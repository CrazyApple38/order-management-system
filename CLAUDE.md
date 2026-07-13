# Claude Code Configuration

<!-- AUTO-GENERATED from docs/rules/ -- 手編集禁止。編集は docs/rules/*.md を編集して `node scripts/build-rules.js` を再実行すること -->

## Project Overview

受注管理システム（Order Management System）- Supabase + Next.js

Excel VBAで運用していた受注簿・業務管理計画書をWebシステム化するプロジェクト。

## Development Process

開発手順の詳細は `docs/00_開発手順書.md` を参照。

### Current Phase: Phase 2 — モックアップ開発サイクル

### Mockup Status

| ID | 画面名（ファイル） | 状態 |
|----|-------------------|------|
| A | 業務管理計画書（weekly-schedule.html） | 作成済・フィードバック反映中 |
| B | 受注簿（order-book.html） | 作成済・フィードバック反映中 |
| C | Quick Access（quick-access.html） | 作成済・フィードバック反映中 |
| D | 経理画面（グループ間請求確認） | 未着手 |
| E | 休暇申請管理（leave-application.html） | 作成済（構想= docs/plan/leave-application-plan.md） |
| F | マスタ管理（master-management.html） | F-0〜F-5 完了・F-6 未定義 |
| G | アカウント画面（account-settings.html） | G-1〜G-3 完了 |

- F/G の計画 = `docs/plan/mockup-master-account-plan.md`（§2 AI実装ガイドライン厳守）
- `admin-notify.html` は管理者補助画面のため本表対象外（計画= docs/plan/admin-notify-icons-plan.md）

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

## AI 間引き継ぎ運用（厳守）

このプロジェクトは Claude Code と Codex を行き来して開発する。両 AI 共有の知識は **永続事実 = `docs/SHARED-MEMORY.md`／揮発状態 = `docs/HANDOFF.md`** の2層で管理する（重複させない）。

### 新会話開始時（必ず順番に）

1. `docs/SHARED-MEMORY.md` を全読 — 永続事実・制約・触らないでほしいもの・構造的変更の警告・会社マッピング・命名規約・未決の横断判断
2. `docs/HANDOFF.md` を全読（10〜30 行・今セッションの揮発状態のみ）— 「直前にやったこと」「次にやるべきこと」「今だけの申し送り」
3. `git log --oneline -10` で直近の他 AI 側コミットを確認
4. `HANDOFF.md` の「次にやるべきこと」とユーザー指示が一致するか確認
5. 該当する Phase 計画書（`docs/plan/*.md`）が指定されていれば全読

### 作業終了 / コミット前（必ず）

1. `docs/HANDOFF.md` を **上書き更新**（追記して肥大させない。最新1〜2セッション分のみ残す）:
   - 更新者（Claude Code / Codex + モデル名）／日付／コミット SHA（直前 HEAD でよい）
   - 直前にやったこと（3〜5 行・最新のみ）／次にやるべきこと（3〜5 行）／今だけの申し送り（任意）
2. **永続事実・制約・決定・構造変更が生じたら `docs/SHARED-MEMORY.md` を更新**（大規模なデータ構造変更は「構造的変更の警告」テーブルに 1 行追記）。揮発状態は HANDOFF、永続事実は SHARED-MEMORY に振り分ける。
3. 更新は本体作業と同じコミットに含めて push

### Claude メモリとの関係

- `~/.claude/projects/.../memory/`（Obsidian Vault 統合）の Claude メモリは **Claude 私的なもの（user / feedback / reflection / コード探索メモ）に限定**する。**両 AI が共有すべき横断事実は `docs/SHARED-MEMORY.md`（git 管理・Codex も読む）が正本**。同じ事実を両方に二重管理しない（Claude メモリ側はポインタに留める）。

### 役割分担

- `docs/SHARED-MEMORY.md` — **永続事実・制約・決定・構造履歴の正本（両AI共有・変更確定時のみ更新）**
- `docs/HANDOFF.md` — セッション境界の揮発状態のみ（10〜30 行、毎セッション上書き）
- `docs/plan/*.md` — Phase 計画書（フェーズの単一情報源、計画変更時のみ更新）
- `AGENTS.md` / `CLAUDE.md` — AI ごとの常時ルール（**`docs/rules/` から生成。手編集禁止**）

## orca worktree 並列開発（Claude↔Codex）

Claude と Codex の並列作業は orca の linked git worktree で行う。SSOT = `docs/plan/orca-worktree-workflow-plan.md`。

- **ラッパー**: `sh scripts/orca-wt.sh new <ai> <topic>`（worktree 作成 + `http://localhost/oms-wt-<ai>-<topic>/` 配信）／`drop <ai>-<topic>`／`list`。main リポジトリ側で実行する。
- **worktree 内での作業ルール**: ブランチは作成済みのため `pr-flow.sh start` は使わない（`review`→`submit`→`automerge` のみ）。**`docs/HANDOFF.md` は更新しない**（直列前提のファイル。引き継ぎは PR 本文で行う。pre-commit v5 が worktree では HANDOFF ゲートを免除する）。`docs/SHARED-MEMORY.md` 全読・独立レビュー基準・視覚変更のユーザー確認は通常どおり。
- main リポジトリ（`C:\xampp\htdocs\order-management-system`）での直列作業は従来どおり（`pr-flow start`・HANDOFF 更新必須）。

## Local Browser Verification

- このプロジェクトのローカル画面確認は、可能な限り XAMPP Apache 経由で行う。
- URL は `http://localhost/order-management-system/...` を優先する。
- SL / OB など `localStorage` 連携が必要な画面は、必ず同じ host (`localhost`) で開く。
- Apache が起動していない場合は、起動前にユーザーへ確認する。

## Project Rules

- **会話言語**: 会話は日本語で行うこと。
- **確認ルール（厳守）**:
  1. **理解の要約確認**: ユーザーの会話や指示を受けたら、まず自分の理解を要約して提示し、認識が合っているか確認してから作業を実行すること。
  2. **理解度90%未満の場合**: 理解度が90%に達するまで、ステップバイステップで質問・確認を行うこと。90%を超えてから作業を開始する。
  3. **補足確認・先読み**: 指示に対して補足的に確認が必要なことや、次のステップで考えられる問題点があれば、ステップバイステップで質問・確認を行うこと。**特に視覚デザイン（色・形・サイズ・配置）は主観判断の温床のため、指示されていない属性は絶対に触らない**。「ついでに〜した方が良い」と感じた瞬間、手を止めて確認する。
  4. **提案**: より良いアイデアや提案があればステップバイステップで確認を行うこと。
  5. **確認の形式**: ステップバイステップの質問・確認時は、クリック可能な選択肢（AskUserQuestion ツール）を提示してユーザーが選択できる形式にすること。テキストで「A. xxx / B. yyy」と列挙するのは NG。**1ターン目のヒアリングから例外なく徹底**する。選択肢だけでは回答しきれない場合のみ、自由入力欄を併記してよい。
- **誤り指摘ルール**: ユーザーの意見や認識に誤りがある場合は、指摘して説明すること。
- **命名整合性ルール**: 用語・名付けについて、整合性が取れないものや判断が必要なものがある場合、ユーザーにステップバイステップで確認すること。自己判断で用語を統一しない。
- **進行中プロジェクト参照ルール**: `docs/plan/*.md` に計画書が存在するテーマ（応援予約・UIコンポーネント整備・DS移行・LCログ等）の作業指示を受けたら、**まず該当プランを全読してから着手すること**。計画書がプロジェクトの単一情報源（Single Source of Truth）。**ただし計画書冒頭に「完了」と明記されている場合は、末尾の「完了サマリ」節のみ読めば足りる**（例: `notification-refactor-plan.md` §18）。
- **スクリーンショット保存先（厳守）**: Playwright MCP 等で撮影したスクリーンショットは必ずプロジェクトルート直下の `screenshots/` ディレクトリに保存すること。`browser_take_screenshot` の `filename` パラメータには `screenshots/xxx.png` の形で明示的に相対パスを指定する。プロジェクトルート直下に直接 PNG を散らかさない。

## Context Optimization Rules（厳守）

コンテキストウィンドウの消費を最小化するため、以下を厳守すること。

1. **タスク管理ツール（TaskCreate/TaskUpdate 等）は最小限に使用**
   - 3ステップ以上のタスクでのみ使用
   - 初回作成 + 完了マーク更新のみ。`in_progress`への切替だけの呼び出しは禁止
   - タスク説明は簡潔に（1行以内）
2. **計画の単一情報源（Single Source of Truth）**
   - 計画はプランファイルのみに記述。タスクリストとの二重管理禁止
   - 承認後のテキスト要約出力は不要（即座に実装開始）
3. **完了報告は簡潔に**
   - 変更ファイル名 + 1行要約のみ
   - 変更内容の詳細列挙は不要（diffで確認可能）
4. **探索エージェントの結果は必要部分だけ抽出**
   - 全文転記しない。行番号・関数名など必要情報のみ参照
   - 直接Read/Grepで確認できるものはエージェントを使わない
