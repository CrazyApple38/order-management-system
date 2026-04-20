# TE レポート: LC-1 v1
- 実施日: 2026-04-21
- 担当: TE (subagent)

## A. 置換漏れ grep 結果

対象ディレクトリ: `docs/mockup`

| パターン | 件数 | 備考 |
|---------|----:|------|
| `var\(--base-(page\|surface\|surface-alt\|muted)\)` | 0 | 期待値どおり |
| `var\(--sub-(primary\|secondary)\)` | 0 | 期待値どおり |
| `^\s*--(base-page\|base-surface\|base-surface-alt\|base-muted\|sub-primary\|sub-secondary)\s*:` | 6 | `co-tokens.css:195-198,201-202` のみ（LC-5 削除予定、期待どおり） |

参考: `var(--base-grid|base-grid-alt|base-grid-total)` は `order-book.css` に14件残存するが、LC-1 のスコープ外（TD 2.2 注記で非対象、OB固有変数）。

weekly-schedule.js に `--base-*` / `--sub-*` 参照: 0件。

## B. 未定義変数チェック

新変数の定義箇所（grep `--bg-page:|--bg-surface:|--bg-surface-2:|--bg-surface-3:|--bg-sidebar:|--divider:`）:

- `co-tokens.css` L21-26: Light モード 6変数すべて定義
- `screen-layout.css` L43-48,58: Dark block 6変数すべて定義
- `weekly-schedule.css` L66-73,83: Dark block 6変数すべて定義
- `quick-access.css`: dark block なし（TD 2.3 で WS/SL のみ指示、期待どおり）

Dark block 内の「逆エイリアス」（`var(--base-*)` / `var(--sub-*)` 参照）: grep `var\(--(base|sub)-` で `--base-page|surface|surface-alt|muted|sub-*` 一致はゼロ。削除済み。

## C. 視覚差分（Playwright）

| 画面 | Light | Dark |
|------|-------|------|
| order-book | `c:\tmp\lc-1-order-book-light.png` | `c:\tmp\lc-1-order-book-dark.png` |
| screen-layout | `c:\tmp\lc-1-screen-layout-light.png` | `c:\tmp\lc-1-screen-layout-dark.png` |
| weekly-schedule | `c:\tmp\lc-1-weekly-schedule-light.png` | `c:\tmp\lc-1-weekly-schedule-dark.png` |
| quick-access | `c:\tmp\lc-1-quick-access-light.png` | `c:\tmp\lc-1-quick-access-dark.png` |

所見:
- SL/WS の Dark は濃紺系背景・明色文字で正常描画。色崩壊・黒抜けなし。
- OB の Dark 切替は本文の背景色が Light と同一に見える（OB は独自 dark block を持たず screen-layout.css も読んでいない構成のため、本画面の dark テーマ自体が未実装。LC-1 起因ではない）。navbar（共通）のダークモードアイコン差異は Light/Dark で切替わっており、共通部の dark 変数は適用されている。
- QA も dark block 不在で、data-theme="dark" 切替後もレイアウトは Light と同一。TD 2.3 の設計どおり。
- 8枚いずれも未定義変数起因と思われる要素消失・色化け・テキスト不可視は観測せず。

Console エラー:
- order-book.html: 0件（warning 1件のみ）
- screen-layout.html: 1件（`icons/refresh.svg` 404、LC-1 と無関係の既存欠損）
- weekly-schedule.html: 0件
- quick-access.html: 1件（`icons/shield.svg` 404、LC-1 と無関係の既存欠損）

## D. JS 動作確認

- weekly-schedule.html: Console エラー 0件。ページロード完了、スナップショット取得成功。
- order-book.html: Console エラー 0件（warning 1件）。ページロード完了、テーブル描画正常。
- 双方とも未捕捉例外・ReferenceError 等の報告なし。

## E. コミット

未実施（メインが実施）

## 重大Claim該当事象

なし。

- 既存機能破壊（モーダル開かない・クリック不能）: Playwright スナップショット上で要素欠落なく、機能破壊の兆候なし。
- Light/Dark で明らかな色変化（未定義）: 対象4画面 × 2テーマいずれも描画正常。
- `co-tokens.css` L195-222 legacy aliases ブロックの誤削除: L195-202 の 6行が保持されている（grep で検出済み）。

## 総評

LC-1 の置換は grep レベルで漏れゼロ、新変数の Light/Dark 両モード定義も揃っており、Dark block の逆エイリアス除去も確認できた。Playwright 8 パターンの視覚確認でも未定義変数起因とみられる崩壊は観測されず、SL/WS Dark は意図どおり濃色系で描画。OB・QA の Dark 属性下でテーマ切替外観が発生しないのは両画面に独自 dark block が存在しないためで、TD スコープ外の既存仕様。Console エラーは 404 リソース 2 件のみで LC-1 とは無関係。重大Claim該当なし。
