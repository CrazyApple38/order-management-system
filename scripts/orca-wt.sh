#!/usr/bin/env sh
# orca-wt.sh — OMS 用 git worktree ラッパー（orca worktree + Docker 配信 URL）
#
# 目的: Claude と Codex を「別々の worktree」で並列実行するための補助。
#   - new  : orca worktree 作成 + Docker 配信 URL を出力
#   - drop : orca worktree 削除
#   - list : 現リポジトリの worktree 一覧 + 配信 URL 対応表
#
# 設計・背景の単一情報源: docs/plan/orca-worktree-workflow-plan.md
#
# 前提:
#   - Git Bash (POSIX sh) で実行する。
#   - orca CLI（デスクトップアプリ同梱）が利用可能。既定パスに無ければ ORCA_BIN で指定。
#   - web-stack が orca workspaces ルートを /var/www/orca-ws に read-only マウント済み。
#     → worktree dir = <workspace-root>/<ai>-<topic>
#     → 配信 URL = http://localhost:8080/oms-wt-<ai>-<topic>/（D-5 切替前）
#   - Windows junction は Docker バインドマウント越しに解決不能だったため使用しない。
#
# ブランチ命名について:
#   orca はブランチ名を <gitUsername>/<name> で作る（CLI で prefix 変更不可）。
#   本ラッパーは worktree 名を <ai>-<topic> にすることで、どちらの AI の作業かを名前に埋め込む
#   （例 name=claude-foo → branch CrazyApple38/claude-foo）。
#   引数 <ai> は「命名用ラベル」であり、orca の TUI エージェント起動 id とは別物。
#   エージェントを起動したい場合は --agent <orca-agent-id>（例: codex）を明示的に渡す。

set -eu

SCRIPT="orca-wt"

_die()  { echo "$SCRIPT: $*" >&2; exit 1; }
_info() { echo "$SCRIPT: $*" >&2; }

# ---- orca CLI 解決 ----------------------------------------------------------
# orca CLI を解決（見つからなければ明確に die）。availability 判定を invoke から分離し、
# 呼び出し側で先に _ensure_orca することで「該当リポジトリなし」と「orca 不在」を取り違えない。
_ensure_orca() {
  if [ -n "${ORCA_BIN:-}" ]; then return 0; fi
  if command -v orca >/dev/null 2>&1; then
    ORCA_BIN="orca"
  elif [ -f "$HOME/AppData/Local/Programs/orca/resources/bin/orca.cmd" ]; then
    # 注: .cmd は Git Bash で実行ビット(-x)が立たないため -f で判定する
    ORCA_BIN="$HOME/AppData/Local/Programs/orca/resources/bin/orca.cmd"
  else
    _die "orca CLI が見つかりません。ORCA_BIN 環境変数にフルパスを指定してください。"
  fi
}

_orca() { _ensure_orca; "$ORCA_BIN" "$@"; }

# ---- リポジトリ / orca workspace 解決 --------------------------------------
# main リポジトリのルートを返す。linked worktree 内から実行されても main 側に解決する
# （orca への repo 登録パスは main リポジトリ基準のため。従来の
#   --show-toplevel は worktree 内だと worktree のルートを返して誤動作していた）。
_repo_root() {
  common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null) \
    || _die "git リポジトリ内で実行してください。"
  [ -n "$common" ] || _die "git リポジトリ内で実行してください。"
  dirname "$common"
}

_normalize_path() {
  raw="$1"
  case "$raw" in
    [A-Za-z]:\\*|[A-Za-z]:/*) dir=$(cygpath -u "$raw") ;;
    /*) dir="$raw" ;;
    *) _die "OMS_WT_WORKSPACE_ROOT は絶対パスで指定してください（指定値: '$raw'）。" ;;
  esac
  if [ "$dir" != "/" ]; then
    while [ "${dir%/}" != "$dir" ]; do dir=${dir%/}; done
  fi
  printf '%s' "$dir" | tr '[:upper:]' '[:lower:]'
}

_workspace_root() {
  _normalize_path "${OMS_WT_WORKSPACE_ROOT:-/c/Users/Owner/orca/workspaces/order-management-system}"
}

_serve_url() {
  if [ -n "${OMS_WT_BASE_URL:-}" ]; then
    base="$OMS_WT_BASE_URL"
  else
    # web-stack の現在ポートに追従し、D-5 の 8080→80 切替後もURLを正しく表示する。
    port=""
    env_file="${OMS_WEB_STACK_ENV:-/c/dev/web-stack/.env}"
    if [ -f "$env_file" ]; then
      port=$(sed -n 's/^HTTP_PORT=//p' "$env_file" | tail -n 1)
    fi
    port="${port:-8080}"
    if [ "$port" = "80" ]; then
      base="http://localhost"
    else
      base="http://localhost:$port"
    fi
  fi
  printf '%s/%s/' "${base%/}" "$1"
}

# orca に登録済みリポジトリの中から、現在のリポジトリルートに一致する repo id を返す。
# （--repo path: のパス表記揺れを避けるため、id を明示解決する）
_repo_id() {
  root="$1"
  # 正規化: バックスラッシュ→スラッシュ + 小文字化
  root_norm=$(printf '%s' "$root" | tr 'A-Z\\' 'a-z/')
  _orca repo list 2>/dev/null | while IFS= read -r line; do
    [ -n "$line" ] || continue
    id=$(printf '%s' "$line" | awk '{print $1}')
    path=$(printf '%s' "$line" | awk '{print $NF}')
    path_norm=$(printf '%s' "$path" | tr 'A-Z\\' 'a-z/')
    if [ "$path_norm" = "$root_norm" ]; then
      printf '%s' "$id"
      break
    fi
  done
}

# ---- 入力バリデーション -----------------------------------------------------
_validate_ai() {
  case "$1" in
    claude|codex) : ;;
    *) _die "<ai> は claude または codex を指定してください（指定値: '$1'）。" ;;
  esac
}

_validate_topic() {
  if ! printf '%s' "$1" | grep -qE '^[a-z0-9][a-z0-9-]*$'; then
    _die "<topic> は英小文字・数字・ハイフンのみ（先頭は英数字）: '$1'"
  fi
}

# ---- worktree create JSON から path 抽出 -----------------------------------
_extract_wt_path() {
  command -v node >/dev/null 2>&1 || _die "node が必要です（orca の JSON 応答を解釈します）。"
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);const p=j&&j.result&&j.result.worktree&&j.result.worktree.path;if(!p){process.stderr.write("no worktree.path in orca response\n");process.exit(3);}process.stdout.write(p);}catch(e){process.stderr.write("JSON parse error: "+e.message+"\n");process.exit(3);}});'
}

# ---- サブコマンド: new ------------------------------------------------------
cmd_new() {
  ai=""; topic=""; agent=""; prompt=""
  # 位置引数2つ（ai topic）+ オプション
  [ $# -ge 2 ] || _die "usage: $SCRIPT new <ai> <topic> [--agent <orca-agent-id>] [--prompt <text>]"
  ai="$1"; topic="$2"; shift 2
  while [ $# -gt 0 ]; do
    case "$1" in
      --agent)  [ $# -ge 2 ] || _die "--agent には値が必要です（例: --agent codex）。"; agent="$2"; shift 2 ;;
      --prompt) [ $# -ge 2 ] || _die "--prompt には値が必要です。"; prompt="$2"; shift 2 ;;
      *) _die "不明なオプション: $1" ;;
    esac
  done

  _validate_ai "$ai"
  _validate_topic "$topic"
  if [ -n "$prompt" ] && [ -z "$agent" ]; then
    _die "--prompt を使う場合は --agent <orca-agent-id> も指定してください（例: --agent codex）。"
  fi

  name="$ai-$topic"
  root=$(_repo_root)
  url=$(_serve_url "oms-wt-$name")

  _ensure_orca  # orca 不在を「未登録」と誤認する前に、ここで明確に停止する
  repo_id=$(_repo_id "$root")
  [ -n "$repo_id" ] || _die "このリポジトリが orca に未登録です。'orca repo add --path \"$root\"' で登録してください。"

  _info "worktree 作成中: name=$name (repo id=$repo_id, base=master)"
  set -- worktree create --repo "id:$repo_id" --name "$name" \
         --base-branch master --setup skip --no-parent --json
  [ -n "$agent" ]  && set -- "$@" --agent "$agent"
  [ -n "$prompt" ] && set -- "$@" --prompt "$prompt"

  json=$(_orca "$@") || _die "orca worktree create に失敗しました。"
  wt_path=$(printf '%s' "$json" | _extract_wt_path) \
    || _die "orca 応答から worktree パスを取得できませんでした。"

  wt_posix=$(_normalize_path "$wt_path")
  workspace_root=$(_workspace_root)
  case "$wt_posix" in
    "$workspace_root"/*) : ;;
    *)
      _info "worktree が Docker の配信ルート外に作成されました: $wt_path（期待: $workspace_root 配下）。"
      _info "作成済み worktree をロールバックします: name=$name"
      if _orca worktree rm --worktree "name:$name" --force --json >/dev/null 2>&1; then
        _die "ロールバック完了。web-stack と OMS_WT_WORKSPACE_ROOT を確認してください。"
      else
        _die "ロールバックにも失敗しました。'orca worktree rm --worktree name:$name --force' で手動削除してください。"
      fi
      ;;
  esac

  echo "worktree: $wt_path"
  echo "branch  : (orca 命名 <gitUsername>/$name)"
  echo "serve   : $url"
  echo "hint    : cd \"$wt_path\" して実装 → pr-flow.sh review → submit → automerge"
}

# ---- サブコマンド: drop -----------------------------------------------------
cmd_drop() {
  [ $# -ge 1 ] || _die "usage: $SCRIPT drop <ai>-<topic>   (例: claude-foo)"
  _ensure_orca
  name="$1"
  root=$(_repo_root)

  # 削除対象 worktree の中から drop すると、実行中の cwd ごと消えて後続が壊れる
  cur_top=$(git rev-parse --show-toplevel 2>/dev/null || true)
  case "$cur_top" in
    */"$name") _die "削除対象の worktree（$name）の中からは drop できません。main リポジトリ側で実行してください。" ;;
  esac

  # orca worktree 削除（ブランチも消える）。Docker は workspace ルートを直接参照するため
  # junction の後始末は不要。
  _info "worktree 削除中: name=$name"
  _orca worktree rm --worktree "name:$name" --force --json >/dev/null 2>&1 \
    || _die "orca worktree rm に失敗しました（name:$name が存在するか確認してください）。"
  _info "完了: $name を削除しました。"
}

# ---- サブコマンド: list -----------------------------------------------------
cmd_list() {
  root=$(_repo_root)

  echo "=== worktrees (git) ==="
  git -C "$root" worktree list

  echo
  echo "=== Docker 配信 URL ==="
  workspace_root=$(_workspace_root)
  mappings=$(git -C "$root" worktree list --porcelain | awk '$1 == "worktree" { print substr($0, 10) }' |
    while IFS= read -r wt_path; do
      name=$(basename "$wt_path")
      case "$name" in
        claude-*|codex-*)
          wt_posix=$(_normalize_path "$wt_path")
          case "$wt_posix" in
            "$workspace_root"/*) echo "  $(_serve_url "oms-wt-$name")   ->  $wt_path" ;;
            *) echo "  [未配信] $wt_path（Docker配信ルート外: $workspace_root）" ;;
          esac
          ;;
      esac
    done)
  if [ -n "$mappings" ]; then printf '%s\n' "$mappings"; else echo "  (なし)"; fi
}

# ---- ディスパッチ -----------------------------------------------------------
usage() {
  cat >&2 <<EOF
$SCRIPT — OMS 用 git worktree ラッパー（orca worktree + Docker 配信 URL）

usage:
  $SCRIPT new  <ai> <topic> [--agent <orca-agent-id>] [--prompt <text>]
  $SCRIPT drop <ai>-<topic>
  $SCRIPT list

  <ai>    : claude | codex（ブランチ/worktree 命名用ラベル）
  <topic> : 英小文字・数字・ハイフン
  --agent : orca の TUI エージェント起動 id（例: codex）。命名用 <ai> とは別物

環境変数:
  OMS_WT_WORKSPACE_ROOT: orca workspace ルート（既定 /c/Users/Owner/orca/workspaces/order-management-system）
  OMS_WT_BASE_URL      : 配信元URL（未指定時は /c/dev/web-stack/.env の HTTP_PORT に追従）
  OMS_WEB_STACK_ENV    : web-stack .env（既定 /c/dev/web-stack/.env）

詳細: docs/plan/orca-worktree-workflow-plan.md
EOF
}

[ $# -ge 1 ] || { usage; exit 2; }
sub="$1"; shift
case "$sub" in
  new)  cmd_new  "$@" ;;
  drop) cmd_drop "$@" ;;
  list) cmd_list "$@" ;;
  -h|--help|help) usage ;;
  *) _die "不明なサブコマンド: $sub （$SCRIPT --help）" ;;
esac
