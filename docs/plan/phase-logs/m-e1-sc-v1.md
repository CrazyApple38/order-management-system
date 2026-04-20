# Phase M-E1 SC v1 — Scorecard / 採点

> Role: Scorer（SC） / Target: Sub-Phase **M-E1**
> Reference: `m-e1-td-v1.md` / `m-e1-te-v1.md`

---

## 1. 採点

配点（TD 定義 Section 2）: **A=20 / B=15 / D=25 / E=25 / G=15**

| 観点 | 配点 | 獲得 | 理由 |
|------|----:|----:|------|
| **A. DS準拠（トークン・値）** | 20 | **18** | トークン参照化 8ブロック、`.bt-*` エイリアス 19定義追加（チェックリスト ≥18 達成）、styles-light.css L2149-2263 と値等価。`.md-ob-*` 側の hover `rgba(68,166,181,0.06)` が `var(--accent-dim)` 未統一な点を -2（TD A-2 要件の厳密達成は `.bt-*` エイリアスのみ、dual-value は意図的ブリッジだが完全DS準拠としては減点） |
| **B. カラーコーディネーション** | 15 | **14** | Coastal Palette 準拠、新色混入なし、selected/active 組み合わせ維持。undo bar 系 `#fef3c7 / #fcd34d / #92400e / #f59e0b / #d97706` の warning 系ハードコードが未整理で -1（co-tokens.css の warning トークン活用余地残る） |
| **D. コンポーネント一貫性** | 25 | **25** | `.bt-*` エイリアス 19定義が co-shared-badges.css Section 7 に集約、対応コメント明示、`.md-ob-grandchild-section` 重複削除で単一ソース化、`.md-ob-tt-badge` と `.bt-tooltip-badge-accent` の値同値化達成 |
| **E. 機能回帰** | 25 | **25** | HTML/JS 変更ゼロ、トークン解決値が既存値と同一またはpixel差2px以内（視覚同等）、cursor/opacity/transform/box-shadow 全維持、querySelector / classList / innerHTML の整合性保持、Console エラーなし想定 |
| **G. コード品質・保守性** | 15 | **13** | トークン参照数 82→102件で +20件、重複定義削除、`.bt-*` エイリアスによる将来M-G移行準備完了。undo bar の warning色 / `.md-ob-confidence-chip` active-tentative の `#f59e0b #94a3b8` のハードコード残存で -2 |

### 総合点

**A 18 + B 14 + D 25 + E 25 + G 13 = 95 / 100**

---

## 2. 重大Claim 判定

| # | Claim | 判定 |
|---|-------|------|
| 1 | 機能破壊（選択/ドラッグ/削除/undo/信頼度/行編集チップのいずれか） | **該当なし** |
| 2 | バッジ表示崩壊 | **該当なし** |
| 3 | クリック不能（cursor:pointer消失/pointer-events:none混入） | **該当なし** |
| 4 | ドラッグ機能不能 | **該当なし** |
| 5 | 他モックアップ波及（8ファイル grep 0件検証済） | **該当なし** |
| 6 | 新規記号混入 | **該当なし** |
| 7 | HTML/JS リネーム混入（M-G領域侵食） | **該当なし** |
| 8 | 新DS `.bt-*` エイリアスの値ズレ | **該当なし**（styles-light.css L2149-2263 転記一致、`-webkit-user-select` はSafari互換の追加プレフィクスで値は同一） |

**重大Claim: 0件**

---

## 3. 判定

- 総合点: **95 / 100**（≥70 達成）
- 重大Claim: **0件**
- **判定: 合格**

---

## 4. 次フェーズ移行可否

Phase **M-E2**（`md-cn-*` 差分通知バッジの DS 化）または **M-F**（A11y・印刷）へ進行可。

### 4.1 M-E1 の技術的達成
- co-shared-badges.css Section 7 として新DS `.bt-*` エイリアス確立（WS/QA 画面が直接利用可）
- 既存 `.md-ob-*` のトークン参照化（値維持・機能回帰ゼロ）
- M-G（物理リネーム）の準備完了: クラス名置換のみで DS 完全統一が可能な状態

### 4.2 M-G 時の作業見通し（参考）
- OB/SL HTML の `md-ob-badge-*` → `bt-*` 機械置換（32件）
- OB/SL JS の innerHTML 文字列 / querySelector リネーム（61件）
- 機能回帰テスト（全モーダル × バッジ操作一式）
- co-shared-badges.css Section 4 の `.md-ob-badge-*` 定義削除
