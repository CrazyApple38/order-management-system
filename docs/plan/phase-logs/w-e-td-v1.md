# W-E Test Design (TD) v1

サブフェーズ: **W-E — WS バッジを新DS `.bt-*` と alias 化**

作成日: 2026-04-20

## 目的

WS の以下のバッジを co-shared-badges.css `.bt-*` と視覚整合する。class 名は JS 互換のため温存し、CSS セレクタを新DS規範と**併記**する。

- `.md-ws-emp-tag`（社員バッジ / サイドバー内）→ `.bt-drag-tag` 相当
- `.md-ws-emp-tag.md-ws-tag-assigned` → `.bt-drag-tag.assigned` 相当
- `.md-ws-site-chip`（セル内現場チップ）→ `.bt-cell-tag` / `.bt-cell-child` 相当
- `.md-ws-staff-indicator`（不足人数表示）→ shortage/ok/over semantic（警告色 `--semantic-error/warning/success`）
- 監督バッジ（該当要素が既存コードに無いため新設しない）

## 配点

| 区分 | 配点 |
|------|-----:|
| A. バッジ alias | 25 |
| B. 視覚一致 | 20 |
| C. Dark 対応 | 15 |
| E. 機能回帰 | 30 |
| G. コード品質 | 10 |

合格: 70点以上

## テスト項目

- T1 `.md-ws-emp-tag` と `.bt-drag-tag` が同一背景・ボーダー・radius
- T2 `.md-ws-emp-tag.md-ws-tag-assigned` と `.bt-drag-tag.assigned` が同一色系
- T3 `.md-ws-site-chip` の radius が `var(--radius-sm)` で co-shared-badges との整合を保つ
- T4 `.md-ws-staff-indicator` の色分け（success/error/warning）が semantic トークンで解決
- T5 Dark テーマで不足・超過インジケーターが視認可能
- T6 JS 未変更
- T7 `co-shared-badges.css` は変更しない
- T8 バッジ hover 時アクセント色が co-tokens.css 経由で解決

## 重大Claim

- C1 JS の class 参照が壊れる
- C2 co-shared-badges.css に差分発生
