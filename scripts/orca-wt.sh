#!/usr/bin/env sh
# orca-wt.sh — OMS 用 git worktree ラッパー（orca worktree + XAMPP junction）
#
# 目的: Claude と Codex を「別々の worktree」で並列実行するための補助。
#   - new  : orca worktree 作成 + htdocs 内に junction を張り http 配信 URL を出力
#   - drop : junction 除去 → orca worktree 削除
#   - list : 現リポジトリの worktree 一覧 + 配信中 junction/URL 一覧
#
# 設計・背景の単一情報源: docs/plan/orca-worktree-workflow-plan.md
#
# 前提:
#   - Git Bash (POSIX sh) で実行する。
#   - orca CLI（デスクトップアプリ同梱）が利用可能。既定パスに無ければ ORCA_BIN で指定。
#   - このリポジトリが XAMPP の docroot（htdocs）直下にあり、localhost の docroot = htdocs。
#     → junction dir = <htdocs>/oms-wt-<ai>-<topic>、配信 URL = http://localhost/oms-wt-<ai>-<topic>/
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

# ---- リポジトリ / htdocs 解決 ----------------------------------------------
_repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || _die "git リポジトリ内で実行してください。"
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

# ---- Windows パス変換 / junction 操作 --------------------------------------
_win() { cygpath -w "$1"; }

_junction_create() {
  # $1=リンク(POSIXパス) $2=ターゲット(POSIXパス)
  # 注: cmd への引数は分離して渡す（1文字列に \"..\" を埋めると cmd の引用解釈で壊れる）。
  #     bash が各パスを quote するのでスペース入りパスにも耐える。
  link_win=$(_win "$1")
  target_win=$(_win "$2")
  MSYS_NO_PATHCONV=1 cmd /c mklink /J "$link_win" "$target_win" >/dev/null 2>&1
}

_junction_remove() {
  # $1=リンク(POSIXパス)。rmdir は junction 本体のみ削除（ターゲットの中身は無影響）。
  link_win=$(_win "$1")
  MSYS_NO_PATHCONV=1 cmd /c rmdir "$link_win" >/dev/null 2>&1
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
  htdocs=$(dirname "$root")
  link="$htdocs/oms-wt-$name"
  url="http://localhost/oms-wt-$name/"

  # fail-fast: 既に同名 junction/ディレクトリがあれば中止
  if [ -e "$link" ]; then
    _die "配信先 '$link' が既に存在します。先に '$SCRIPT drop $name' で片付けるか、別 topic を使ってください。"
  fi

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

  _info "junction 作成中: $link -> $wt_path"
  junction_ok=0
  if _junction_create "$link" "$wt_path"; then
    junction_ok=1
  else
    _info "警告: junction 作成に失敗しました。worktree は作成済みです（file:// で参照可）。"
    _info "  手動修復: cmd /c mklink /J \"$(_win "$link")\" \"$(_win "$wt_path")\""
  fi

  echo "worktree: $wt_path"
  echo "branch  : (orca 命名 <gitUsername>/$name)"
  if [ "$junction_ok" -eq 1 ]; then
    echo "serve   : $url"
  else
    echo "serve   : (junction 未作成のため未配信。手動修復後に $url)"
  fi
  echo "hint    : cd \"$wt_path\" して実装 → pr-flow.sh review → submit → automerge"
}

# ---- サブコマンド: drop -----------------------------------------------------
cmd_drop() {
  [ $# -ge 1 ] || _die "usage: $SCRIPT drop <ai>-<topic>   (例: claude-foo)"
  _ensure_orca
  name="$1"
  root=$(_repo_root)
  htdocs=$(dirname "$root")
  link="$htdocs/oms-wt-$name"

  # 1) junction を先に除去（worktree 実体より前に。誤って実体を消さないため）
  if [ -e "$link" ]; then
    _info "junction 除去中: $link"
    _junction_remove "$link" || _info "警告: junction 除去に失敗（手動で rmdir \"$(_win "$link")\"）。"
  else
    _info "junction は存在しません（$link）。worktree 削除のみ行います。"
  fi

  # 2) orca worktree 削除（ブランチも消える）
  _info "worktree 削除中: name=$name"
  _orca worktree rm --worktree "name:$name" --force --json >/dev/null 2>&1 \
    || _die "orca worktree rm に失敗しました（name:$name が存在するか確認してください）。"
  _info "完了: $name を削除しました。"
}

# ---- サブコマンド: list -----------------------------------------------------
cmd_list() {
  root=$(_repo_root)
  htdocs=$(dirname "$root")

  echo "=== worktrees (git) ==="
  git -C "$root" worktree list

  echo
  echo "=== 配信中 junction / URL ==="
  found=0
  for d in "$htdocs"/oms-wt-*; do
    [ -e "$d" ] || continue
    base=$(basename "$d")
    echo "  http://localhost/$base/   ->  $d"
    found=1
  done
  if [ "$found" -eq 0 ]; then echo "  (なし)"; fi
}

# ---- ディスパッチ -----------------------------------------------------------
usage() {
  cat >&2 <<EOF
$SCRIPT — OMS 用 git worktree ラッパー（orca worktree + XAMPP junction）

usage:
  $SCRIPT new  <ai> <topic> [--agent <orca-agent-id>] [--prompt <text>]
  $SCRIPT drop <ai>-<topic>
  $SCRIPT list

  <ai>    : claude | codex（ブランチ/junction 命名用ラベル）
  <topic> : 英小文字・数字・ハイフン
  --agent : orca の TUI エージェント起動 id（例: codex）。命名用 <ai> とは別物

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
