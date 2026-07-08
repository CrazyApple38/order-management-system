# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Opus 4.8)
- **日付**: 2026-07-08
- **コミット**: 本コミット（親=23faa0f）。**R-3c-1（WS チェックポイント）完了** — 骨格再構成+CSS読替+ツールバー整理+中央ボード色面整理+サイドバー暫定収容

## 直前にやったこと（最新のみ）

- **R-3c-1（WS チェックポイント）完了**（Playwright localhost 1440px で runtime 検証済・コンソールエラー0/警告0）:
  1. **CSS読替**: `co-tokens.css` 撤去→ `ds-tokens.css`＋`ds-components.css`＋新設 **`ws-ds.css`**。`ws-ds.css` 冒頭 `:root` で旧 co-tokens 名→ds 値をファイル内リマップ（ob-ds.css と同方式・bridge 不使用）。`weekly-schedule.css` は `?v=4`。
  2. **骨格再構成**: `.md-ws-container(header/toolbar/main)` → `.app.ws-app > .toolbar.md-ws-toolbar / .workspace.ws-workspace(rail 72 | main>main-card 1fr | prop 288)`。旧 `.md-ws-header` 濃紺帯を撤去（濃色=メニューバー1段のみ）、タイトルはツールバーへ。**panel-rail は R-3c-2 で 4 列化**。既存サイドバー(`.md-ws-sidebar` 340px)を `.prop` 列へ幅上書きで暫定収容。
  3. **ツールバー整理**: 現場軸/社員軸トグル(`injectViewToggle`)をタイトル直後へ、期間ナビ/今日を配置、右端に **stat-strip**（休み(本日)/整備(本日)= `wsRenderStatStrip`・renderGrid から更新）。**GC フィルタ seg は延期**（横断課題・下記申し送り）。
  4. **色面整理**（03 §3.1/§3.2）: `weekly-schedule.css :root` の桃色/teal ローカル定義を撤去 → 区分=青(`--cat-*`→blue-soft/blue)、桃色エラー→ `--error-*`=alert、`--night-text` の #DB577B 上書き撤去→ds `#d14d41` 継承、`--accent-hover`→blue-dark、`--semantic-warning-text`→alert。ws-ds.css remap で `--semantic-error`→alert-text(警告用)、holiday(日付ヘッダ/休みマーク)は青灰へターゲット上書き。直書き hex は :root から排除。
- 検証: `node --check` OK / Playwright: 骨格DOM（rail|main|prop = 72/1fr/288）・view-toggle 順序・stat-strip 描画（休み3人/整備0台）・軸切替(site⇄employee)・週移動(翌週/今日)・**非過去日セル選択（selection-active/cell-selected/col-highlighted）**・トークン remap 実測（夜間#d14d41 / 警告#f15e2a / 青#1f5fae / 区分#eaf3ff）・コンソール0/0。スクショ `screenshots/r3c1-ws-skeleton.png`。

## 次にやるべきこと

- **R-3c-2（WS 右プロパティ4モード化）**: `.prop-card#wsPropCard` + `panel-rail` 4ボタン（①選択セル ②社員 ③車両 ④協力業者・応援予約）。既存サイドバー render 群を各モードへ割当（`wsSetPropMode` 新設・OB/SL 同型）。**応援予約3モーダル**(`openReservationModal`/`QuickModal`/`WeekModal`)→④モード内 `.prop` ドックへ転換（schedule 発火機構は維持）。業者紐付けポップオーバー(`showLinkPopover`)は④へ整理。→ その後 **R-3c-3**（通知 rail cn-card + 変更履歴配線 + schedule19発火(N-6)回帰 + Playwright）。
- 以降 R-3d LA → R-3e QA。SSOT=`docs/plan/mockup-refactor-plan.md`、詳細計画=`~/.claude/plans/vivid-swinging-elephant.md`（R-3c 3段階ブレークダウン）。

## 今だけの申し送り（任意）

- **GC フィルタ seg 化は延期（ユーザー承認 2026-07-08）**: GC フィルタは階層構造を持つ共有ナビモーダル。R-3c では現行の共有モーダルをそのまま使い（回帰ゼロ）、seg 吸収は「全画面横断の別課題」で階層対応ごと一括（HANDOFF 既知項目）。WS には会社ローカル seg を追加していない（OB とは異なり二重状態を作らない選択）。
- **昼夜ヘッダ文字色**（`--shift-header-text-day` #B8651F amber / `-night` #1F5E70 navy-teal）は昼夜識別軸として **R-3c-1 では据え置き**。DS 非トークンのため、色面の最終調整（休みチップの色含む）は R-3c-2 の色パスでユーザー確認の上で検討。
- **ダークテーマ**は DS(Calm Operations)=light 専用のため WS でも移行対象外（`weekly-schedule.css [data-theme="dark"]` は残置・未検証）。OB は order-book.css からダーク全撤去済み。
- Playwright の孤立 Chrome（`mcp-chrome-33eff96` プロファイル）がロックを保持していたため該当 PID のみ kill して復帰。検証時に再発したら同プロファイルのみ終了。
- OB の 404: `shield.svg`（既知・R-2無関係・SHARED-MEMORY記録）は未対応のまま。
