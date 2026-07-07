# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。
ここは「今このセッション」の揮発状態だけ。詳細運用は `AGENTS.md` / `CLAUDE.md`「AI 間引き継ぎ運用」参照。

---

## 最終更新

- **更新者**: Claude Code (Fable 5)
- **日付**: 2026-07-07
- **コミット**: 本コミット（親=661c89d）。R-3b 途中チェックポイント（Codex の骨格/右プロパティ化 + Claude Code の設計正本ズレ3点修正）を1コミットに同梱

## 直前にやったこと（最新のみ）

- **R-3b 設計正本との照合 + ズレ3点修正**（Codex の R-3b 途中チェックポイントに対し 03 §1.1/§4 確定表と照合、ユーザー承認の上で修正）:
  1. **フィルタ行トグル廃止**: 旧 `#filterBar`（DD 式）を撤去し、ツールバー常設 seg（会社=動的生成 `#obSegBranch` / 区分 / 昼夜、全て `data-multi`・「すべて」排他）+ 契約先=検索カプセル（`.search` 内 `#filterCompany`）へ。`isFiltered`/`clearFilters`/`buildBranchPanel` を seg 版に書換、`toggleFilterRow`・DD 関数群は削除。
  2. **ビュー切替をツールバーへ**: rail の「月間グリッド」ボタン撤去（rail=ベルのみ）。ツールバーに A-04 `btn-group`（月間グリッド active / 行カレンダー **disabled 仮置き**）を新設。
  3. **density 3段復元**: ob-ds.css に旧 co-tokens 実値で `[data-density]` compact28/comfortable36/spacious44 を移植（ds-tokens 正本への spacious 昇格はユーザー承認後に別途）。
- 検証: `node --check` OK / Playwright localhost 1440px: コンソールエラー0（警告は既存 iframe sandbox のみ）、seg フィルタ実データ照合（夜5件・東央8件・施設3件・契約先「全日」3件）、すべて排他、clearFilters、density 3段、セルクリック→右プロパティドック回帰なし。スクショ `screenshots/r3b-ob-toolbar-filters.png`。

## 次にやるべきこと

- R-3b 継続: 行カレンダーを中央ビュー切替へ（ツールバーの `#obViewCalBtn` disabled 仮置きを配線し、行内カレンダーアイコンの `openCalendarModal(ri)` モーダルを廃止。03 §4 R-3b 確定表）。
- 右プロパティ「連携・所在」「変更履歴」の実データ配線 + cn:jump 回帰確認。
- OB 固有回帰: 行削除→復旧トグル、`cn:action`、日またぎ targetDate、月移動中編集、ソート設定モーダル。

## 今だけの申し送り（任意）

- 夜間行がまだ赤系文字（旧 `--semantic-error` → 暫定 `--alert-text` 写像）。03 §3.1 は「夜間=`--night-text` / 警告=`--alert-*` に分離」。R-3b の DS 適用継続時に要対応。
- 共通ナビ GC フィルタモーダルの「ツールバー seg への吸収」（03 §1.1 横断ルール）は共有コンポーネントのため未着手。OB 会社 seg と二重フィルタ状態（旧来と同じ挙動）。
- order-book.css 内の旧フィルタ DD 用 CSS（`.md-ob-filter-*`）は死にコード化。R-3b 仕上げ時に削除可。
