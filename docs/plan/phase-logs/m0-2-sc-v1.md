# Scoring Report: M0-2 v1
- 採点日: 2026-04-18
- 採点者: SC

## 総合判定
- 総合点: 97 / 100
- 重大Claim: なし
- 判定: 合格（70点以上 AND 重大Claim=0）

## カテゴリ別採点

### A. DS準拠（35 / 35）
- A-1〜A-8 全8項目 Pass。
- legacy aliases セクション（L177-192）ブロックコメントで `legacy` `deprecated` `@deprecated` `Phase M0-2` を明示。
- 必須17種 + 追加3種の計20エイリアスすべてが `var(--新DS変数)` 参照形式で定義済み（値直書きゼロ）。
- `:root{}` 本体末尾・density overrides より前に配置、単方向参照（循環なし・未定義参照なし・再定義なし）。
- 評価: 配点満点。マッピング表の完全実装と配置方針が TD 指示・M0-1 SC 引き継ぎ事項に完全準拠。

### B. カラーコーディネーション（18 / 20）
- B-1（14項目値照合）、B-2（5 shadow項目解決）、B-3（Palette外混入なし）すべて Pass。
- B-4 Warning: `--warning-text` 値衝突（新DS `#92400e` vs モックアップ :root 旧 `#975A16`）について、セクションコメント L184-187 に「後勝ち」一般原則はあるが、この個別項目に対するインラインコメントが無い。機能的には問題ないが、IM/他担当者が M0-5 統一前に誤解するリスクが残る。
- 減点: -2（Warning 1件、保守性観点）。

### D. コンポーネント一貫性（10 / 10）
- D-1（`--base-page` 解決値 `rgb(233,241,246)` 一致）、D-2（`--shadow-medium` → `--elevation-3` = `0 4px 12px rgba(0,69,84,0.10)` 解決）、D-3（カテゴリ色衝突の後勝ち設計をコメント明示）すべて Pass。
- 配点満点。M-A で解消される値構造衝突（WS/SL `--shadow-medium` 単色rgba、カテゴリ色 teal 同色）について、セクションコメントで後勝ち原則を一般記述している点は適切。

### E. 機能回帰（20 / 20）
- E-1〜E-6 全6項目 Pass。
- 4モックアップCSS（order-book / weekly-schedule / quick-access / screen-layout）の `git diff` 差分ゼロ。
- 4モックアップHTMLの `git diff` 差分ゼロ。
- co-tokens.css 既存コンテンツ（M0-1 確定の L1-175）無改変、追加のみ。
- `:root{}` 括弧整合・コメント閉じ・セミコロン終端すべて整合、CSS syntax validity OK。
- 配点満点。E カテゴリは M0-2 の最重要ガード条件（重大Claim C-1/C-2/C-7 全回避）として厳格に満たされている。

### G. コード品質・保守性（14 / 15）
- G-1（@deprecated / M-G 削除予定明記）、G-2（Phase ラベル付与）、G-3（base/sub/accent/semantic/shadow の5小見出しグルーピング）、G-4（自己説明的右辺）、G-5（非対象変数の明示：`--base-grid*` / `--cell-base-*` / `--shift-bg-*` / `--md-gc-bg-*` / `--shadow-color` 単色rgba版）、G-6（重複ゼロ）、G-7（2スペースインデント）、G-8（TODO/FIXMEなし）、G-9（M0-1 SC 引き継ぎ事項を完全実装）まで Pass。
- G-10 Warning: セクション見出しフォーマットが M0-1 既存の `/* ----- section.name ----- */`（5ダッシュ囲み1行）と異なり、legacy aliases は `/* ============ ... ============ */`（等号囲みブロック）。TD L177 参考実装通りのため IM 起因ではないが、既存セクションとの見た目の一貫性は取れていない。
- 減点: -1（Warning 1件、TD 指示準拠ゆえに深追いは不要）。

## デザイナー視点のコメント（3〜5行）
エイリアスセクションのブロックコメントは「用途 / 注意 / 非対象」を3段構造で明示しており、コードレビュー担当やフェーズ引き継ぎ担当への配慮として非常に優秀。特に「非対象」リストで OB/WS/SL/QA 固有の単色rgba影やカテゴリ色衝突に触れているため、M-A 再設計時の議題洗い出しがこのコメントだけで成立する。グルーピング（base/sub/accent/semantic/shadow）と等号コロン揃えも走査性が高く、デザイナー視点では読みやすい。唯一の課題は「値衝突個別項目（`--warning-text`）へのインラインコメント不在」で、M0-5 までの3サブフェーズ分、保守者が `grep` 一発で衝突経緯を辿れる導線が弱い。Phase M-G で legacy aliases を削除する際は、このブロックコメント全体をそのまま目印に grep 一発で抽出できる構造になっており、削除作業の混乱リスクは低い。

## 次サブフェーズ（M0-3）への引き継ぎ事項

1. **`--warning-text` 値衝突のインラインコメント追加（B-4 Warning 対応）**: M0-3 で co-tokens.css をモックアップHTMLにリンクする前後で、L214 `--warning-text:` 行に `/* 値衝突: モックアップ :root 旧 #975A16 は後勝ちで有効。M0-5 で統一 */` を追記することを推奨（必須ではない）。同様に `--text-tertiary / --text-disabled` はエイリアス対象外だが、co-tokens.css L31-32 の Phase D6.1 コメントに「モックアップ :root の旧値 `#6B9AA8 / #A0BCC5` は M0-5 で更新」を追記するとさらに親切。
2. **セクション見出し形式の統一方針（G-10 Warning 対応）**: M0-1 既存の `/* ----- name ----- */` と legacy aliases の `/* ============ ... ============ */` の2形式が混在する。TD への改善提案として、情報量の多いセクション（@deprecated 等の注記付き）のみブロック形式、単純セクションは従来形式という運用ルールを明文化してもよい。co-tokens.css 自体の変更は不要。
3. **M0-3 作業内容の確認**: M0-3 では4モックアップHTMLに `<link rel="stylesheet" href="mockup/co-tokens.css">` を追加する。追加位置は各モックアップ既存の `<style>` / `<link>` **より前**（`:root{}` 再定義による後勝ち上書きが効く順序）。co-tokens.css 側の新DS正定義（`--bg-page: #E9F1F6` 等）は、モックアップ :root 内で同名定義がある場合のみ上書きされる設計で、これが M0-2 のエイリアス合意の前提。M0-3 TE では `git diff` でHTMLへの `<link>` 追加以外の差分ゼロを重大Claimとして設定すべき。
4. **WS/SL `--shadow-medium / --shadow-strong` 値構造衝突の M-A 予約**: 単色rgba（`rgba(0,69,84,0.12)` 等）→ `0 4px 12px rgba(...)` 3-part box-shadow への移行は、`box-shadow` 宣言側の利用パターン調査が必要なため本エイリアスでは扱わないと明示済み。M-A 着手時、`grep "box-shadow:.*--shadow-medium"` で WS/SL の全使用箇所を洗い出してから、単色 → elevation-3 に置換する計画を別途TDが立てる必要がある。
5. **M0-1 SC で指摘されていた「Phase ラベル統一付与」方針**: M0-2 追加分は legacy aliases セクションコメントで `Phase M0-2` `@deprecated` ラベル付与済み。shadow サブグループには `(Phase D1.5)` ラベルあり。既存セクション（color.base / color.text / color.accent / color.semantic 等）は M0-1 時点の状態を踏襲し、Phase ラベルが部分的にしか付いていない。M0-1 SC で指摘された「統一付与」は M0-2 ではスコープ外、M-A 以降の整備候補として残す。
