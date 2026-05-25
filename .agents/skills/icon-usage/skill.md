---
name: icon-usage
description: UIにアイコン（記号・マーク類）を追加する作業時の規約。docs/assets/icons/ ライブラリからの選定方法、SVGスプライト実装パターン、確定アイコン一覧。絵文字・Unicode記号での代用は禁止。
allowed-tools: Read, Grep, Glob
---

## 採用原則

UIコンポーネント集・モックアップでアイコンが必要な場面は、必ず `docs/assets/icons/` のアイコンライブラリから採用する。

## ライブラリ所在

- 場所: `docs/assets/icons/`（27カテゴリ、15,652件）
- 検索インデックス: `docs/assets/icons/index.json`（`id / title / cat / file / fmt / src` フィールド）
- 命名: `im-{id}-{slug}.svg`（icooon-mono、推奨）/ `si-{id}-{slug}.png`（silhouette-illust）

## 採用ルール

- アイコンが必要になったら、まずライブラリから探す。見つからない場合のみカスタムSVGを自作する
- **絵文字（📋 等）・Unicode記号（×、✓、！、？、★、＋、▾、⋮ 等）での代用は禁止**（OS・ブラウザで見た目がバラつくため）
- 色変更が必要な箇所は必ずSVG形式（`im-*.svg`）を選ぶ。PNG（`si-*.png`）は色変更が難しいため避ける

## 実装パターン（推奨）

- `<svg><defs><symbol id="ui-icon-xxx" viewBox="0 0 512 512">...</symbol></defs></svg>` でスプライト定義
- 各所で `<svg class="ui-icon"><use href="#ui-icon-xxx"/></svg>` で参照
- 共通CSS: `.ui-icon { width: 1em; height: 1em; fill: currentColor; vertical-align: -0.125em; }`
- icooon-mono のSVGはすでに `fill: currentColor` が適用済みのため、親要素の `color` プロパティで色が一括制御できる

## 確定アイコン（UIコンポーネント集で採用済）

- info → `sign-mark/im-11925-infomeeshon.svg`
- check（成功・チェック）→ `sign-mark/im-11451-chekku-maaku-no-muryou.svg`
- exclaim（警告・エラー）→ `sign-mark/im-11478-bikkuri-maaku.svg`
- caution（三角注意）→ `sign-mark/im-11908-chuui-maaku.svg`
- close（×）→ `sign-mark/im-11911-hosoi-batsu.svg`
- question（?）→ `sign-mark/im-11574-hatena.svg`
- plus（+）→ `sign-mark/im-00105-purasu.svg`
- star（★）→ `sign-mark/im-10058-okiniiri-osusume-ni-tsukaeru-hoshi-aikon.svg`
- chevron-down（▾）→ `sign-mark/im-12243-yajirushi-aikon-shimo-2.svg`
- chevron-up（▴）→ `sign-mark/im-12242-yajirushi-aikon-ue-2.svg`
- document（書類）→ `stationery/im-00051-kami-to-pen.svg`
- settings（歯車）→ `sign-mark/im-00001-muryou-no-settei-haguruma.svg`

## 例外メモ

- メニュー（⋮ kebab/three-dots）に相当するアイコンはライブラリに無いため、当面は「歯車（settings）」で代替する。必要になったら新規追加するか自作SVGで対応。

## 再ダウンロード / 追加DL

- `scripts/download-icons.js`（レジューム対応）
