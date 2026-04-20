# SC レポート: LC-1 v1
- 実施日: 2026-04-21
- 担当: SC (subagent)

## スコア

| カテゴリ | 配点 | 得点 | 評価コメント |
|---------|----:|----:|-----|
| A. 対象変数の置換漏れゼロ | 30 | 30 | `var(--base-(page\|surface\|surface-alt\|muted))` 0件、`var(--sub-(primary\|secondary))` 0件、weekly-schedule.js 参照 0件。co-tokens.css L195-198/201-202 の 6 定義行のみ保持（LC-5 スコープ、期待どおり）。`--base-grid*` の 14件は TD 2.2 注記で明示的にスコープ外。 |
| B. 未定義変数による CSS 参照エラーゼロ | 25 | 25 | Light は co-tokens.css L21-26 で 6 変数すべて定義。Dark は screen-layout.css L43-48/58 と weekly-schedule.css L66-73/83 で 6 変数すべて定義。Dark block 内の逆エイリアス（`--bg-page: var(--base-page)` 等）も除去済み。QA に dark block 不在だが TD 2.3 で SL/WS のみ指示のため設計どおり。 |
| C. 視覚差分なし | 20 | 20 | スクショ 8 枚を実機確認。SL Light は明色サーフェス、SL Dark は濃紺系背景＋明色文字で正常描画。WS Light/Dark とも列区分・バッジ色ともに崩れなし。OB Light/Dark と QA Light/Dark は共通 navbar 部を除き外観が同一だが、両画面は独自 dark block 未実装という既存仕様に起因（LC-1 起因ではない）。未定義変数起因の要素消失・色化け・テキスト不可視はいずれも観測されず、ユーザー承認済の Dark chip 色変化のみ。 |
| D. JS 参照破壊ゼロ | 15 | 15 | weekly-schedule.js の `--base-*`/`--sub-*` 参照 0件。Console エラーは OB/WS 0件、SL/QA 各 1件だが `icons/refresh.svg`・`icons/shield.svg` の 404 で LC-1 と無関係の既存欠損。ReferenceError・未捕捉例外なし。 |
| E. コミット粒度・メッセージの適切性 | 10 | 10 | 仮スコア（メインエージェント実施予定、SC ルーブリック指示に基づく）。 |
| **合計** | 100 | **100** | |

## 重大Claim

該当なし。

- 既存機能の破壊: Playwright スナップショットで要素欠落なく、navbar/フィルタ/テーブル/右ペインとも描画正常。
- Light/Dark どちらかで色崩壊（未定義変数による）: 対象 4 画面 × 2 テーマで崩壊兆候なし。
- co-tokens.css legacy aliases ブロック自体の誤削除: L195-202 の 6 行が保持されており grep で検出確認済み。

## 合否判定

**合格**。総合 100 点（≥70 点）で重大Claim 0件。カテゴリ A/B/C/D すべてで TD チェックリストを満たし、特に Dark block の 6 変数定義と逆エイリアス除去の両立ができている点は LC-2 以降の前提として堅牢。

## 次サブフェーズへの申し送り

1. **OB/QA の dark テーマ未実装は LC スコープ外の既存課題**: TE が所見で指摘したとおり、OB は screen-layout.css を読まず独自 dark block も持たない。QA も同様。LC 内で扱わないが、将来の Theme 整備フェーズで「dark block を持たない画面の運用方針（共通 navbar のみ切替で可とするか、各画面で dark block を整備するか）」を決めておく必要がある。
2. **`--base-grid / --base-grid-alt / --base-grid-total` の 14 件（order-book.css）**: TD 2.2 注記どおり LC-1 スコープ外。後続の LC フェーズ（特に OB 固有トークン整理時）で扱う想定であれば、LC-2 以降の TD で明示スコープ化を推奨。
3. **404 リソース 2件**: `icons/refresh.svg`・`icons/shield.svg` は LC と無関係だが、Console クリーンの観点で別チケット化推奨。
4. **`--secondary: var(--divider)` の置換**: RHS のみ更新済み。LHS（`--secondary` 本体）は LC スコープ外だが、co-shared-badges.css の後方互換用途が将来不要になった段階で廃止検討を記録。
5. **LC-5 前の safety net**: legacy aliases ブロック（L195-202）が保持されているため、万一 LC-2/3/4 で置換漏れが発生しても視覚崩壊には至らない安全余地が残っている。LC-5 の削除時は grep 再実行を必ず合否条件に含めること。
