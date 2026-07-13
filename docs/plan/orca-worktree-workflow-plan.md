# orca × git worktree 開発ワークフロー計画（OMS）

> **状態**: 計画中（合意前）。本会話で骨子合意 → ラッパー実装 → 独立レビュー → PR。
> **目的**: Claude と Codex を **別々の git worktree で並列実行**し、成果を比較・マージできる開発環境にする。
> **スコープ**: **OMS のみ**。`pr-flow` スキル本体（agent-env 共通）は変更しない。OMS 内の薄いラッパーで `orca worktree` + junction + `pr-flow` を束ねる。

---

## 1. 実測サマリ（すべて現物確認済み・2026-07-13）

| 項目 | 実測値 |
|---|---|
| orca CLI | `C:\Users\Owner\AppData\Local\Programs\orca\resources\bin\orca.cmd`（デスクトップアプリ同梱・稼働中） |
| OMS 登録 | 登録済み（repo id `6514a42a-c0a5-4165-8db7-bb35ab2b428b`）。CLI では `--repo path:<repo-root>` セレクタでも指定可 |
| worktree 物理パス | `C:\Users\Owner\orca\workspaces\order-management-system\<name>` — **htdocs の外** |
| ブランチ命名 | orca 既定 = `<gitUsername>/<name>`（例 `CrazyApple38/wt-probe`）。CLI で prefix 変更・上書き不可。`worktree set` はメタのみ変更（git ブランチ名は不変） |
| モック展開 | worktree に `docs/*.html` 一式が checkout される |
| XAMPP 配信 | htdocs 内に junction（`mklink /J`・**管理者不要**）を張れば `http://localhost/oms-wt-<topic>/docs/*.html` で **http 配信**可能＝`file://` の fetch 制約も回避。junction 除去は `rmdir`（中身に無影響） |
| 後始末 | `orca worktree rm --worktree name:<name> --force` で worktree もブランチも削除（クリーン復帰を確認） |

---

## 2. 決定事項（本会話で合意）

| 項目 | 決定 | 理由 |
|---|---|---|
| 目的 | Claude↔Codex 並列実行 | orca 本来の価値。現行の直列 HANDOFF を並列化 |
| 適用範囲 | OMS のみ（まず検証） | 影響範囲を絞る。pr-flow 本体は不変 |
| ブランチ命名 | worktree 名に AI 接頭辞：`--name claude-<topic>` / `codex-<topic>` → `CrazyApple38/claude-<topic>` / `CrazyApple38/codex-<topic>` | orca の `<username>/` 既定と衝突せず、AI 識別を名前に埋め込む |
| モック配信 | junction 自動付与：`C:\xampp\htdocs\oms-wt-<topic>` → worktree、URL `http://localhost/oms-wt-<topic>/` | http 配信を維持し fetch 系機能も動かす |
| 成果物 | 計画書合意 → 薄いラッパースクリプト | agent-env の流儀（計画=単一情報源）に沿う |

---

## 3. ラッパー設計（`scripts/orca-wt.sh` 案）

POSIX sh（Git Bash）。repo id はハードコードせず **`--repo path:"$(git rev-parse --show-toplevel)"`** で解決（可搬性）。

### サブコマンド

- **`orca-wt.sh new <ai> <topic> [--agent <orca-agent-id>] [--prompt "<初期指示>"]`**
  1. `orca worktree create --repo id:<動的解決した repo id> --name <ai>-<topic> --base-branch master --setup skip --no-parent [--agent <orca-agent-id>] [--prompt ...] --json`（repo id は `orca repo list` を現リポジトリルートとパス一致で解決＝ハードコードなし）
  2. JSON（`.result.worktree.path`）から worktree パスを取得
  3. junction 作成：`cmd /c mklink /J <htdocs>\oms-wt-<ai>-<topic> <worktree-path>`（`MSYS_NO_PATHCONV=1`・引数分離）
  4. worktree パスと配信 URL（`http://localhost/oms-wt-<ai>-<topic>/`）を出力（junction 失敗時は URL を出さず注記）
  - `<ai>` ∈ `{claude, codex}`（ブランチ/junction 命名用ラベル。orca の TUI エージェント起動 id `--agent` とは別物。`--prompt` は `--agent` 必須）

- **`orca-wt.sh drop <ai>-<topic>`**
  1. junction 除去：`cmd /c rmdir C:\xampp\htdocs\oms-wt-<ai>-<topic>`（中身に無影響）
  2. `orca worktree rm --worktree name:<ai>-<topic> --force`

- **`orca-wt.sh list`**
  - `git worktree list`（現リポジトリにスコープ）＋ 配信中 junction/URL 対応表を表示

### 設計上の注意

- junction の rmdir は**必ず worktree rm より先**（逆だと worktree 実体を消しかねない誤操作リスク）。
- `<topic>` は英小数字ハイフンに正規化・バリデート（junction 名・URL に載るため）。
- `--setup skip` は初期方針（モック段階は npm 依存を新規解決しない）。ビルドが要る段階で `--setup run` に切替。
- **main-root 解決（2026-07-13 修正）**: リポジトリルートは `git rev-parse --path-format=absolute --git-common-dir` の親で解決する。worktree 内から実行しても htdocs・orca repo 照合が main 側に正しく解決される（従来の `--show-toplevel` は worktree 内で誤動作していた）。
- **ぶら下がり junction（2026-07-13 追加）**: ターゲット消失の junction は Git Bash で `-e` false／`-L` true（実測）。`list` は「[ぶら下がり]」と表示し、`drop`/`new` の fail-fast も `-e`＋`-L` で拾う。`drop` は削除対象 worktree の中からは実行拒否（cwd ごと消えるのを防ぐ）。

---

## 4. worktree 内での pr-flow 運用

- worktree ディレクトリで実装 → `pr-flow.sh review` → `submit` → `automerge`（**既存フローをそのまま使う**）。
- master 保護・CI（`quality-gate`）・条件付きマージ（BP-4）は**不変**。ブランチ名が `CrazyApple38/claude-<topic>` でも、CI の classify は**ファイルパス基準**なので影響なし。
- **`pr-flow.sh start` は使わない**（worktree+branch は orca が作るため）。`review` 以降のみ使用。
- 独立レビューのトリガ（新規実行可能ファイル／非.md 3ファイル以上／非.md 100行以上）は従来どおり。

---

## 5. HANDOFF 並列化（直列前提の見直し）

現状 `docs/HANDOFF.md` は**毎セッション上書き（直列前提）**。並列 worktree では両 AI が同時に触ると衝突する。

- **ルール**: worktree 作業中は `HANDOFF.md` を**触らない**。引き継ぎは各 worktree の**ブランチ／PR 本文**で行う。`HANDOFF.md` は master 統合基準の申し送りに用途限定。
- **機械層と同期済み（2026-07-13）**: agent-env **pre-commit v5** が linked worktree（`git rev-parse --git-dir` ≠ `--git-common-dir`）では HANDOFF ゲートを免除し、**session-start.ps1** が worktree 内セッションへ「start 不使用・HANDOFF 非更新・引き継ぎ=PR本文」を注入する（agent-env PR #1）。main 側は従来どおり（HANDOFF 更新必須）。
- スレッド化等の恒久設計は実運用後に詰める（保留継続）。`SHARED-MEMORY.md`（永続事実）は従来どおり変更確定時のみ更新（worktree からも更新可・衝突時は後勝ち PR が解消）。

---

## 6. 未確認の前提（実装時に検証）

- [x] Apache が junction を透過配信するか → **可**（curl HTTP 200 実証・PR #14）。
- [x] `orca worktree create` の setup hook（`npm install`）を `--setup skip` で確実に回避できるか → **可**（実測で hook 非実行）。
- [ ] 並列時の同一ファイル競合（両 AI が同ファイルを編集 → merge conflict）→ **タスク分割で回避**する運用前提。HANDOFF は worktree から更新しないため主要な衝突面は解消済み（§5）。GitHub ruleset の required check は `strict=false`（up-to-date 必須なし・2026-07-13 確認）のため、衝突がない限り並列 PR は順次自動マージされる。

---

## 7. 実装ステップ（骨子合意後）

1. `claude/orca-worktree-workflow` ブランチ（in-place・ブートストラップ。ラッパー未完のため今回だけ従来フロー）。
2. `scripts/orca-wt.sh` 実装（`new` / `drop` / `list`）。
3. **end-to-end 検証**: `orca-wt.sh new claude probe` → junction → `http://localhost/oms-wt-claude-probe/docs/order-book.html` をブラウザ表示確認 → `drop` でクリーン復帰。
4. 独立レビュー（新規 `.sh` = トリガ該当。実装文脈非継承の general-purpose）。
5. `pr-flow submit` → PR → `automerge`（非視覚のみ＝スクリプト/ドキュメント → 自動マージ）。
6. `docs/SHARED-MEMORY.md`・`CLAUDE.md` に worktree 運用を追記（両 AI 共有）。
