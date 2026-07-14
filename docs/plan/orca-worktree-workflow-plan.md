# orca × git worktree 開発ワークフロー計画（OMS）

> **状態**: 運用中。初期実装（PR #14）後、Docker移行 D-4 で配信経路を更新（2026-07-14）。
> **目的**: Claude と Codex を **別々の git worktree で並列実行**し、成果を比較・マージできる開発環境にする。
> **スコープ**: **OMS のみ**。`pr-flow` スキル本体（agent-env 共通）は変更しない。OMS 内の薄いラッパーで `orca worktree` + Docker配信URL + `pr-flow` を束ねる。

---

## 1. 実測サマリ（すべて現物確認済み・2026-07-13）

| 項目 | 実測値 |
|---|---|
| orca CLI | `C:\Users\Owner\AppData\Local\Programs\orca\resources\bin\orca.cmd`（デスクトップアプリ同梱・稼働中） |
| OMS 登録 | 登録済み（repo id `6514a42a-c0a5-4165-8db7-bb35ab2b428b`）。CLI では `--repo path:<repo-root>` セレクタでも指定可 |
| worktree 物理パス | `C:\Users\Owner\orca\workspaces\order-management-system\<name>` — **htdocs の外** |
| ブランチ命名 | orca 既定 = `<gitUsername>/<name>`（例 `CrazyApple38/wt-probe`）。CLI で prefix 変更・上書き不可。`worktree set` はメタのみ変更（git ブランチ名は不変） |
| モック展開 | worktree に `docs/*.html` 一式が checkout される |
| Docker 配信 | orca workspaces ルートを web-stack へread-onlyマウントし、`http://localhost:8080/oms-wt-<topic>/docs/*.html` で **http 配信**（D-5後はポート80）。Windows junction はDocker越しに解決不能のため不使用 |
| 後始末 | `orca worktree rm --worktree name:<name> --force` で worktree もブランチも削除（クリーン復帰を確認） |

---

## 2. 決定事項（本会話で合意）

| 項目 | 決定 | 理由 |
|---|---|---|
| 目的 | Claude↔Codex 並列実行 | orca 本来の価値。現行の直列 HANDOFF を並列化 |
| 適用範囲 | OMS のみ（まず検証） | 影響範囲を絞る。pr-flow 本体は不変 |
| ブランチ命名 | worktree 名に AI 接頭辞：`--name claude-<topic>` / `codex-<topic>` → `CrazyApple38/claude-<topic>` / `CrazyApple38/codex-<topic>` | orca の `<username>/` 既定と衝突せず、AI 識別を名前に埋め込む |
| モック配信 | web-stack が `C:\Users\Owner\orca\workspaces\order-management-system` を直接read-onlyマウントし、URL `/oms-wt-<topic>/` とworktree名をAliasMatchで対応 | junctionを介さず http 配信を維持し、fetch 系機能も動かす |
| 成果物 | 計画書合意 → 薄いラッパースクリプト | agent-env の流儀（計画=単一情報源）に沿う |

---

## 3. ラッパー設計（`scripts/orca-wt.sh` 案）

POSIX sh（Git Bash）。repo id はハードコードせず **`--repo path:"$(git rev-parse --show-toplevel)"`** で解決（可搬性）。

### サブコマンド

- **`orca-wt.sh new <ai> <topic> [--agent <orca-agent-id>] [--prompt "<初期指示>"]`**
  1. `orca worktree create --repo id:<動的解決した repo id> --name <ai>-<topic> --base-branch master --setup skip --no-parent [--agent <orca-agent-id>] [--prompt ...] --json`（repo id は `orca repo list` を現リポジトリルートとパス一致で解決＝ハードコードなし）
  2. JSON（`.result.worktree.path`）から worktree パスを取得
  3. 応答pathと `OMS_WT_WORKSPACE_ROOT`（既定 `/c/Users/Owner/orca/workspaces/order-management-system`）をWindowsの大小文字・末尾スラッシュ非依存に正規化して配下か検証。範囲外なら作成済みworktreeをロールバックして停止
  4. worktree パスと配信 URL（並走中 `http://localhost:8080/oms-wt-<ai>-<topic>/`）を出力。URLのポートはweb-stack `.env` の `HTTP_PORT` に追従
  - `<ai>` ∈ `{claude, codex}`（ブランチ/worktree命名用ラベル。orca の TUI エージェント起動 id `--agent` とは別物。`--prompt` は `--agent` 必須）

- **`orca-wt.sh drop <ai>-<topic>`**
  1. 削除対象worktree内からの実行を拒否
  2. `orca worktree rm --worktree name:<ai>-<topic> --force`（junction後始末は不要）

- **`orca-wt.sh list`**
  - `git worktree list`（現リポジトリにスコープ）＋ `claude-*` / `codex-*` worktreeのDocker配信URL対応表を表示。配信ルート外のworktreeはURLを付けず`[未配信]`と明示

### 設計上の注意

- `<topic>` は英小数字ハイフンに正規化・バリデート（worktree名・URLに載るため）。
- `--setup skip` は初期方針（モック段階は npm 依存を新規解決しない）。ビルドが要る段階で `--setup run` に切替。
- **main-root 解決（2026-07-13 修正）**: リポジトリルートは `git rev-parse --path-format=absolute --git-common-dir` の親で解決する。worktree 内から実行してもorca repo照合がmain側に正しく解決される（従来の `--show-toplevel` はworktree内で誤動作していた）。
- **Docker配信（2026-07-14 D-4）**: junction方式はDockerバインドマウント越しにリンク先を解決できず403となったため廃止。orca workspacesルートの直接read-onlyマウントへ切替。`drop` は削除対象worktreeの中からは引き続き実行拒否する。

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

- [x] XAMPP Apache が junction を透過配信するか → **可**（旧方式・curl HTTP 200 実証・PR #14）。
- [x] DockerがWindows junctionをバインドマウント越しに解決するか → **不可**（403。コンテナ内リンク先が`/mnt/host/c/...`となり未解決）。既知の分岐どおりorca workspaces直接マウントへ変更しHTTP 200を確認。
- [x] `orca worktree create` の setup hook（`npm install`）を `--setup skip` で確実に回避できるか → **可**（実測で hook 非実行）。
- [ ] 並列時の同一ファイル競合（両 AI が同ファイルを編集 → merge conflict）→ **タスク分割で回避**する運用前提。HANDOFF は worktree から更新しないため主要な衝突面は解消済み（§5）。GitHub ruleset の required check は `strict=false`（up-to-date 必須なし・2026-07-13 確認）のため、衝突がない限り並列 PR は順次自動マージされる。

---

## 7. 初期実装履歴（2026-07-13完了）

1. `claude/orca-worktree-workflow` ブランチ（in-place・ブートストラップ。ラッパー未完のため今回だけ従来フロー）。
2. `scripts/orca-wt.sh` 実装（`new` / `drop` / `list`）。
3. **end-to-end 検証**: `orca-wt.sh new claude probe` → junction → `http://localhost/oms-wt-claude-probe/docs/order-book.html` をブラウザ表示確認 → `drop` でクリーン復帰。
4. 独立レビュー（新規 `.sh` = トリガ該当。実装文脈非継承の general-purpose）。
5. `pr-flow submit` → PR → `automerge`（非視覚のみ＝スクリプト/ドキュメント → 自動マージ）。
6. `docs/SHARED-MEMORY.md`・`CLAUDE.md` に worktree 運用を追記（両 AI 共有）。

---

## 8. Docker配信経路（D-4・2026-07-14）

```
C:\Users\Owner\orca\workspaces\order-management-system\<ai>-<topic>
  ↓ bind mount :ro
/var/www/orca-ws/<ai>-<topic>
  ↓ AliasMatch（URLの oms-wt- 接頭辞を除去）
http://localhost:8080/oms-wt-<ai>-<topic>/
```

- web-stack `compose.yaml`: `OMS_WT_WORKSPACE_ROOT` を `/var/www/orca-ws:ro` へマウント
- web-stack `apache/oms.conf`: `/oms-wt-<name>/...` → `/var/www/orca-ws/<name>/...`
- `scripts/orca-wt.sh`: junction作成・走査・除去を廃止し、worktree作成/削除とURL対応表示に限定
- D-5で `.env` の `HTTP_PORT=80` へ切り替わると、ラッパーの表示URLも自動的に `http://localhost/...` へ追従する
