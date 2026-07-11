# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告・会社マッピング・命名規約は `docs/SHARED-MEMORY.md` を参照。

## 最終更新

- **更新者**: Codex (GPT-5)
- **日付**: 2026-07-11
- **コミット**: 作業開始時 HEAD `ec58bbe`（R-3f D群は未コミット）

## 直前にやったこと（最新のみ）

- **R-3f D群 #5/#10/#11 完了**: 直書きWARNを用途別DSトークン化し `ds-audit NG=0 WARN=0`。
- ダークテーマを廃止し、共有切替UI・SL/WS切替/復元JS・dark CSSを撤去（テーマ参照0件）。
- LA中央月間/ミニカレンダーの土日祝文字と祝日名を青灰+ウェイト差へ統一。
- JS構文検査は合格。アプリ内ブラウザ接続先が利用不可のためruntime実測・スクショは未実施。

## 次にやるべきこと

1. runtime検証環境が利用可能なら LA/SL/WS/OB/admin-notify を `localhost` で実測する。
2. **R-3f E群 #6 menu-user / #7 ヘルプ icon-btn** を方針確認後に実装する。
3. その後 #12 横断棚卸し（SL/WS `--shadow-strong` のDS化を含む）→ R-4。

## 今だけの申し送り

- HTMLキャッシュバスター更新済み。完了条件は `node scripts/design-audit/ds-audit.js` の NG=0/WARN=0。
- 既存の `localStorage.theme_v2` は残っていても読み手がなく、画面へ影響しない。
