# W-B Test Execution (TE) v1

検証日: 2026-04-20
対象: `docs/mockup/weekly-schedule.css`

## 検証結果

| ID | 項目 | 結果 |
|----|------|------|
| T1 | フォーカスリング色統一 `var(--accent-dim)` 3px | PASS（md-ws-pac-input / md-ws-res-quick-input 共通） |
| T2 | ラベルカラー `var(--text-secondary)` + fw:600 + fs:11 | PASS（co-forms `.md-fi-label` と同等） |
| T3 | JS class 名変更ゼロ | PASS（weekly-schedule.js 未変更） |
| T4 | co-forms.css 未変更 | PASS |
| T5 | 視覚差分: ホバー時 `border-color: accent` + placeholder 色追加（DS 準拠の改善のみ） | PASS |

## 追加改善

- `.md-ws-pac-input` / `.md-ws-res-quick-input` に co-forms.css `.md-fi-input` 準拠の hover 状態・placeholder スタイル・transition を追加
- focus 挙動は既存踏襲（`var(--accent-dim)` 3px リング）

## 重大Claim

- C1: なし（JS 未変更）
- C2: WS CSS のみ差分
