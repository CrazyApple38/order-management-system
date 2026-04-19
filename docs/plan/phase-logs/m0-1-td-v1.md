# テスト項目: M0-1 — `co-tokens.css` 新設

- 作成日: 2026-04-18
- 作成者: Test Designer（TD）
- 対象ファイル（新設）: `docs/mockup/co-tokens.css`
- 正の参照元: `docs/ui-components/styles-light.css`（`:root`） + `docs/ui-components/tokens.json`（v1.2.0）
- 関連: [ds-migration-governance.md](../ds-migration-governance.md) / [ds-migration-plan.md](../ds-migration-plan.md)

---

## 目的

`docs/mockup/co-tokens.css` を新規作成し、新デザインシステム（Plaster UI v1.2.0）の全CSS変数を**Single Source of Truth**として集約定義する。`styles-light.css` の `:root` および `tokens.json` と**完全一致する値**を、W3C Design Tokens Community Group ドラフトに準じた階層コメントとともに提供する。本サブフェーズでは各モックアップHTMLへのリンクは行わない（M0-3で接続）。Light テーマのみを対象とし、ダーク対応・旧→新エイリアスは別サブフェーズ（M0-2以降）で扱う。

---

## 評価項目（ウェイト調整後の配点）

M0-1は「CSS変数定義ファイルの新設」のみであり、実装コンポーネント・画面統合・インタラクション・a11yのランタイム検証を伴わない。そのためルーブリック標準配点（A30/B20/C15/D15/E10/F5/G5）を以下のように再配分する。

| カテゴリ | 配点 | 配点の根拠 |
|---------|------|-----------|
| **A. DS準拠（トークン・命名）** | **40** | 本サブフェーズの本質。`styles-light.css` と `tokens.json` の全トークンが同値で網羅されているかが最大の評価軸。標準30→40へ引上げ。 |
| **B. カラーコーディネーション** | **25** | Coastal Palette全色・第2アクセント・カテゴリ4色相・Chart Paletteの値一致を厳密に検証。標準20→25へ引上げ。 |
| **C. タイポグラフィ・余白** | **20** | font-family スタック・`palt` / `tabular-nums`・font-size 7段・space 8段・radius 4段・elevation 6段の完全性。標準15→20へ引上げ。 |
| **D. コンポーネント一貫性** | **0** | 本サブフェーズはトークン定義のみで、コンポーネントクラス（`.btn-*` / `.tbl-*` / `.modal-*` 等）は扱わない。 |
| **E. 機能回帰（バグゼロ）** | **0** | M0-1では既存モックアップHTMLにリンクしないため、ランタイム挙動への影響なし。機能回帰の検証対象がない。 |
| **F. アクセシビリティ** | **0** | `aria-*` / キーボード操作 / `.sr-only` はクラス・マークアップ側の仕様。トークン定義のみの本フェーズでは検証対象外。D6.1 のAA化値（text-tertiary/disabled）の正確性は B に含めて評価。 |
| **G. コード品質・保守性** | **15** | 単一情報源としての構造品質（セクションコメント階層・W3C DTCGドラフト準拠・重複定義ゼロ・アルファベット順や論理的並び・将来拡張余地）。標準5→15へ引上げ。 |
| **合計** | **100** | |

**判断メモ**: D/E/F をゼロにした分を A/B/C/G に再配分。D/E/F のウェイトは M0-3（リンク接続）および M-A〜M-G（コンポーネント置換）で本格的に評価する。

---

## Test Executor 向けチェックリスト

Test Executor は以下の各項目について、`grep` / `Grep` tool / ファイル目視により検証し、**合致/不一致と行番号**を客観的に報告すること。期待値は `tokens.json` v1.2.0 および `styles-light.css` の値に厳密準拠。

### A. DS準拠（40点）— トークン命名・網羅性

- [ ] **A1. ファイル新設の確認**: `docs/mockup/co-tokens.css` が存在し、`:root { ... }` ブロックを1つだけ含む。
  - 検証: `Grep pattern="^:root\\s*\\{" path="docs/mockup/co-tokens.css" output_mode="content" -n=true`
  - 期待: 1件ヒット
- [ ] **A2. カラー基盤トークン（6変数）**: `--bg-page / --bg-surface / --bg-surface-2 / --bg-surface-3 / --bg-sidebar / --divider` が全て定義されている。
  - 検証: `Grep pattern="--bg-page|--bg-surface|--bg-sidebar|--divider" path="docs/mockup/co-tokens.css" output_mode="content" -n=true`
  - 期待値: `#E9F1F6 / #FFFFFF / #F0EDE9 / #D3D0C8 / #004554 / #B2D5E2`
- [ ] **A3. テキストカラー（4変数）**: `--text-primary / --text-secondary / --text-tertiary / --text-disabled` が定義され、Phase D6.1 の AA 化値に一致。
  - 期待値: `#004554 / #2A6B7A / #5A8896 / #8BAEB9`
  - 旧値の混入ゼロ: `grep -E "#6B9AA8|#A0BCC5"` → 0件
- [ ] **A4. アクセントカラー（6変数）**: `--accent-primary / --accent-primary-light / --accent-primary-dim / --accent-secondary / --accent-secondary-light / --accent-secondary-dim` を全て含む（`styles-light.css` では旧名 `--accent / --accent-2` も併用。本M0-1では**新DS命名を正**として `--accent-primary` 系を採用すること）。
  - 期待値: `#44A6B5 / #5AB8C6 / rgba(68, 166, 181, 0.12) / #E07856 / #EA9980 / rgba(224, 120, 86, 0.12)`
- [ ] **A5. セマンティックカラー（6変数）**: `--semantic-success / --semantic-success-text / --semantic-warning / --semantic-warning-text / --semantic-warning-bg / --semantic-error`（または同値を表す命名）を含む。
  - 期待値: `#38A169 / #276749 / #D69E2E / #92400e / rgba(214, 158, 46, 0.1) / #DB577B`
- [ ] **A6. カテゴリ色4色相分化（D5.2・8変数）**: `--cat-bg-facility / --cat-text-facility / --cat-bg-event / --cat-text-event / --cat-bg-traffic / --cat-text-traffic / --cat-bg-highway / --cat-text-highway` を全て含む。
  - 期待値（bg）: `rgba(68,166,181,0.14) / rgba(122,140,196,0.14) / rgba(180,135,100,0.14) / rgba(98,158,120,0.14)`
  - 期待値（text）: `#1c4d54 / #2d3e7a / #5a3f25 / #1f4e31`
- [ ] **A7. Chart Palette（D5.3・14変数）**: `--chart-1 〜 --chart-6`（カテゴリカル）+ `--chart-seq-0 〜 --chart-seq-4`（連続）+ `--chart-diverge-neg / -neutral / -pos`（差分）を全て含む。
  - 期待値: `#44A6B5 / #E07856 / #7A8CC4 / #629E78 / #B48764 / #B8607A / #E9F1F6 / #B2D5E2 / #6B9AA8 / #2A6B7A / #004554 / #DB577B / #D3D0C8 / #38A169`
- [ ] **A8. Typography（font-family 2種）**: `--font-family-body` と `--font-family-mono` が `tokens.json` と完全一致。
  - 期待 body: `'Inter', -apple-system, BlinkMacSystemFont, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Segoe UI', Roboto, sans-serif`
  - 期待 mono: `'SF Mono', Consolas, Menlo, monospace`
- [ ] **A9. font-size 7段**: `--fs-caption / --fs-sm / --fs-base / --fs-md / --fs-lg / --fs-xl / --fs-2xl` が全て存在。
  - 期待値: `11px / 13px / 14px / 16px / 20px / 26px / 34px`
- [ ] **A10. font-weight 5段**: `--fw-regular / --fw-medium / --fw-semibold / --fw-bold / --fw-black`。
  - 期待値: `400 / 500 / 600 / 700 / 800`
- [ ] **A11. line-height 3段**: `--lh-tight / --lh-base / --lh-loose`。
  - 期待値: `1.3 / 1.5 / 1.7`
- [ ] **A12. Spacing 8段**: `--space-2xs / --space-xs / --space-sm / --space-md / --space-lg / --space-xl / --space-2xl / --space-3xl`。
  - 期待値: `2px / 4px / 8px / 12px / 16px / 24px / 32px / 48px`
- [ ] **A13. Radius 4段**: `--radius-sm / --radius-md / --radius-lg / --radius-xl`。
  - 期待値: `4px / 8px / 12px / 16px`
- [ ] **A14. Elevation 6段**: `--elevation-0 〜 --elevation-5`。
  - 期待値: `none / 0 1px 2px rgba(0,69,84,0.06) / 0 2px 4px rgba(0,69,84,0.08) / 0 4px 12px rgba(0,69,84,0.10) / 0 8px 24px rgba(0,69,84,0.14) / 0 16px 48px rgba(0,69,84,0.18)`
- [ ] **A15. Motion duration 5段**: `--duration-instant / --duration-fast / --duration-base / --duration-slow / --duration-slower`。
  - 期待値: `0ms / 120ms / 200ms / 320ms / 480ms`
- [ ] **A16. Motion easing 4種**: `--ease-out / --ease-in / --ease-in-out / --ease-spring`。
  - 期待値: `cubic-bezier(0.16, 1, 0.3, 1) / cubic-bezier(0.7, 0, 0.84, 0) / cubic-bezier(0.87, 0, 0.13, 1) / cubic-bezier(0.34, 1.56, 0.64, 1)`
- [ ] **A17. Breakpoint 5段**: `--bp-sm / --bp-md / --bp-lg / --bp-xl / --bp-2xl`。
  - 期待値: `640px / 768px / 1024px / 1280px / 1536px`
- [ ] **A18. Icon size 6段**: `--icon-xs / --icon-sm / --icon-md / --icon-lg / --icon-xl / --icon-2xl`。
  - 期待値: `12px / 14px / 16px / 20px / 24px / 32px`
- [ ] **A19. Z-index レイヤ 7段**: `--z-dropdown / --z-sticky / --z-overlay / --z-modal / --z-popover / --z-tooltip / --z-toast`。
  - 期待値: `100 / 200 / 900 / 1000 / 1100 / 1200 / 2000`
- [ ] **A20. Modal width 4段**: `--modal-w-sm / --modal-w-md / --modal-w-lg / --modal-w-xl`（または命名統一として `--modal-sm/md/lg/xl`。`styles-light.css` は `--modal-w-*`）。
  - 期待値: `380px / 480px / 600px / 800px`
- [ ] **A21. 密度モード 3段**: `:root[data-density="compact|comfortable|spacious"]` ブロックを用意し、`--tbl-row-h / --space-row / --fs-density-base` を切り替える。
  - 検証: `Grep pattern="data-density=\"(compact|comfortable|spacious)\"" path="docs/mockup/co-tokens.css" output_mode="content" -n=true`
  - 期待: 3ブロック存在。値は compact=28px/4px/13px, comfortable=36px/8px/14px, spacious=44px/12px/15px
- [ ] **A22. 未定義トークンゼロ**: ファイル内で `var(--...)` 参照した変数のうち、未定義のものがないこと（自己完結）。
  - 検証: `Grep pattern="var\\(--" path="docs/mockup/co-tokens.css" output_mode="content" -n=true` で抽出した参照名が全て同ファイル内に定義されている。

### B. カラーコーディネーション（25点）— Coastal Palette整合

- [ ] **B1. Coastal Palette外の色混入ゼロ**: Coastal帯（`#004554 / #2A6B7A / #5A8896 / #8BAEB9 / #B2D5E2 / #E9F1F6 / #F0EDE9 / #D3D0C8`）と Accent（`#44A6B5 / #5AB8C6 / #E07856 / #EA9980`）、Semantic（`#38A169 / #276749 / #D69E2E / #92400e / #DB577B`）、カテゴリ（`#1c4d54 / #2d3e7a / #5a3f25 / #1f4e31`）、Chart（`#7A8CC4 / #629E78 / #B48764 / #B8607A / #6B9AA8`）以外の16進カラーが出現しない。
  - 検証: `Grep pattern="#[0-9A-Fa-f]{6}" path="docs/mockup/co-tokens.css" output_mode="content" -n=true` の全件を期待リストと突合
- [ ] **B2. D6.1 AA化値が正確**: `--text-tertiary: #5A8896;` および `--text-disabled: #8BAEB9;` が定義され、旧値 `#6B9AA8 / #A0BCC5` が混入しない。
  - 検証: `Grep pattern="#6B9AA8|#A0BCC5" path="docs/mockup/co-tokens.css" output_mode="files_with_matches"` で tertiary/disabled 以外の場所（chart-seq-2 は `#6B9AA8` が正しい）で誤用されていないこと。`--text-tertiary` の行が `#5A8896` であること。
- [ ] **B3. 第2アクセント（D5.1）定義**: `--accent-secondary` 系 3色が揃い、`rgba(224, 120, 86, 0.12)` の dim 値が一致。
- [ ] **B4. カテゴリ4色相分化（D5.2）**: teal / blue-violet / warm brown / sage green の4色相が bg-rgba（alpha=0.14） + text-solid で揃う。どの色も同値の使い回しがない（`rgba(68,166,181,0.14)` は facility のみ等）。
- [ ] **B5. Chart Palette（D5.3）網羅**: カテゴリカル6 / 連続5 / 差分3 = 計14色が全て揃う。`--chart-seq-2: #6B9AA8` はシーケンシャル用であり、`--text-tertiary` の旧値と同じ値であるが**用途が異なる**ため許容される（この点は混同しないこと）。
- [ ] **B6. semantic色のAA性**: `--semantic-warning-text: #92400e`、`--semantic-success-text: #276749` が本文色として定義され、`--semantic-warning-bg: rgba(214, 158, 46, 0.1)` が存在。

### C. タイポグラフィ・余白（20点）

- [ ] **C1. body font-family スタック順序**: `Inter` が先頭、次に `-apple-system, BlinkMacSystemFont`、続けて和文 `'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI'`、最後に `'Segoe UI', Roboto, sans-serif` の順。
  - 検証: `Grep pattern="--font-family-body" path="docs/mockup/co-tokens.css" -A=2 output_mode="content" -n=true`
- [ ] **C2. mono font-family**: `'SF Mono', Consolas, Menlo, monospace` と厳密一致。
- [ ] **C3. font-feature-settings / font-variant-numeric のコメント注記**: co-tokens.css は**トークン定義のみ**であり、`body { font-feature-settings: "palt" 1; font-variant-numeric: tabular-nums; }` 等の適用はM0-4で実施する旨のコメントが併記されていること（本ファイルで `body` セレクタを書かない）。
  - 検証: `Grep pattern="palt|tabular-nums" path="docs/mockup/co-tokens.css" output_mode="content" -n=true` → コメント内のみヒット、セレクタ内の `font-feature-settings:` / `font-variant-numeric:` プロパティとしての記述はない。
- [ ] **C4. font-size の単位が全て px**: `rem / em / %` で定義されていない（`tokens.json` の type=dimension に準拠）。
- [ ] **C5. spacing の `--space-2xs: 2px`**: バッジ縦paddingの微小値として定義されている（`$description` のコメントを流用してよい）。
- [ ] **C6. radius の 4px 倍数性**: 4 / 8 / 12 / 16 の算術等差に沿う。
- [ ] **C7. elevation-1 の透明度**: 全段で `rgba(0,69,84, x)`（Coastal primary色の影）を使用。黒 `rgba(0,0,0,...)` を使っていない。
- [ ] **C8. easing の cubic-bezier 係数**: `tokens.json` と小数点まで完全一致（e.g. `0.16, 1, 0.3, 1` の空白・桁数）。空白の差異は許容するが値は不変。

### G. コード品質・保守性（15点）

- [ ] **G1. W3C DTCG 階層コメント**: ファイル先頭にファイル目的・参照元（`styles-light.css` / `tokens.json` v1.2.0）・同期方針（手動）・Light only 宣言が書かれている。
- [ ] **G2. セクションコメント階層**: `color.base / color.text / color.accent / color.semantic / color.category / color.chart / typography / spacing / radius / elevation / motion / breakpoint / icon-size / z-index / modal-width / density` の各セクションに区切りコメントがある（`tokens.json` の階層と対応）。
  - 検証: `Grep pattern="^\\s*/\\* " path="docs/mockup/co-tokens.css" output_mode="content" -n=true` で 10件以上のセクションコメントを確認。
- [ ] **G3. 変数の重複定義ゼロ**: 同じ変数名が `:root` 内で2回以上出現しない。
  - 検証: `Grep pattern="^\\s*--[a-z0-9-]+:" path="docs/mockup/co-tokens.css" output_mode="content" -n=true` の変数名部分を sort | uniq -d で重複ゼロ
- [ ] **G4. 将来拡張のプレースホルダ不在**: `/* TODO */` / `/* FIXME */` / 空のダミー変数宣言がない。
- [ ] **G5. ダーク対応の越境なし**: `prefers-color-scheme: dark` / `[data-theme="dark"]` / Dark用の色定義が含まれない（M0-1スコープ外）。
  - 検証: `Grep pattern="prefers-color-scheme|data-theme" path="docs/mockup/co-tokens.css" output_mode="files_with_matches"` → 0件
- [ ] **G6. 旧エイリアス（`--base-*`・`--sub-*`）の混入なし**: `--base-page / --base-surface / --base-surface-alt / --base-muted / --sub-primary / --sub-secondary / --accent-light / --accent-dim / --shadow-sm / --shadow-md / --shadow-lg / --shadow-medium / --shadow-strong` が定義されていない（M0-2で導入）。
  - 検証: `Grep pattern="--base-page|--base-surface|--sub-primary|--sub-secondary|--shadow-sm|--shadow-md|--shadow-lg|--shadow-medium|--shadow-strong" path="docs/mockup/co-tokens.css" output_mode="content"` → 0件
- [ ] **G7. ファイル末尾整形**: 最終行に改行あり、不要な空行が3連続以上ない。
- [ ] **G8. インデント統一**: 2 または 4 スペースで統一（タブと混在しない）。

---

## 重大Claim判定基準（1件該当で不合格）

1. **Coastal Palette / 第2アクセント / カテゴリ4色相 / Chart Palette の値が `tokens.json` v1.2.0 と1箇所でも不一致**（例: `--accent-primary` が `#44A6B5` 以外、`--cat-text-event` が `#2d3e7a` 以外）
2. **D6.1 AA化値の誤り**: `--text-tertiary` が `#5A8896` でない、または `--text-disabled` が `#8BAEB9` でない（旧値 `#6B9AA8 / #A0BCC5` の残存）
3. **Coastal Palette外の色が混入**（期待リストに無い16進カラーが `:root` 内に出現）
4. **必須トークンの欠落**: 上記 A1〜A21 のいずれかのカテゴリで1変数でも未定義
5. **スコープ外要素の混入**: ダーク対応 / 旧エイリアス / 各モックアップへのリンク（`<link>`記述はCSS側でなくHTML側の話だが、同スコープ違反として `@import` 等の越境参照があれば該当）

---

## 合格条件

- **総合点 ≥ 70 点 AND 重大Claim = 0**
- Scorer は上記カテゴリ別満点（A40 / B25 / C20 / G15、合計100）で採点し、`docs/plan/phase-logs/m0-1-sc-v{n}.md` に記録する。
- 不合格の場合は TD（本文書の修正 or 修正指示追記）→ IM 再実装 → TE 再検証 → SC 再採点の順で同サブフェーズを反復（上限5回）。

---

## 参考: 主要トークンのクイックリファレンス（Test Executor の期待値チェック用）

```
--bg-page:             #E9F1F6
--bg-surface:          #FFFFFF
--bg-surface-2:        #F0EDE9
--bg-surface-3:        #D3D0C8
--bg-sidebar:          #004554
--divider:             #B2D5E2
--text-primary:        #004554
--text-secondary:      #2A6B7A
--text-tertiary:       #5A8896   (D6.1)
--text-disabled:       #8BAEB9   (D6.1)
--accent-primary:      #44A6B5
--accent-primary-light:#5AB8C6
--accent-primary-dim:  rgba(68, 166, 181, 0.12)
--accent-secondary:    #E07856   (D5.1)
--accent-secondary-light: #EA9980
--accent-secondary-dim:   rgba(224, 120, 86, 0.12)
--semantic-success:    #38A169
--semantic-warning:    #D69E2E
--semantic-error:      #DB577B
--cat-text-facility:   #1c4d54   (teal, D5.2)
--cat-text-event:      #2d3e7a   (blue-violet, D5.2)
--cat-text-traffic:    #5a3f25   (warm brown, D5.2)
--cat-text-highway:    #1f4e31   (sage green, D5.2)
--fs-base:             14px
--duration-base:       200ms
--ease-out:            cubic-bezier(0.16, 1, 0.3, 1)
--z-sticky:            200
--z-modal:             1000
--modal-w-md:          480px
comfortable row-height: 36px (default)
```
