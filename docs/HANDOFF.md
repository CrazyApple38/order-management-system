# 引き継ぎノート（10〜30行・毎回上書き）

永続事実・制約・構造的変更の警告は `docs/SHARED-MEMORY.md` を参照。

## 最終更新
- **更新者**: Codex（GPT-5）
- **日付**: 2026-07-14
- **コミット**: `codex/docker-cutover-d5` ブランチ（直前 HEAD `39b431f`）

## 直前にやったこと
- D-5切替実施: legacy 35,862ファイル（3,995,916,711 bytes）を `C:\dev\legacy-htdocs` へ完全コピーし、web-stackを80/3306へ変更。
- OMS/legacy/phpMyAdmin全URL、DB API・ホスト3306・Laravel、ブラウザconsole、OB⇄SL、worktree配信の回帰はすべてgreen。
- robocopy除外名が配下にも一致する欠陥を発見し、トップ階層絶対パス指定へ計画を修正。コピー突合で欠損/余分/サイズ不一致0。

## 次にやるべきこと
1. ユーザー承認後にOS再起動し、Docker Desktop + web-stack自動復帰、80/3306と全主要URLを再確認してD-5を完了にする。
2. 関連セッション終了後、旧 `C:\xampp\htdocs` を `htdocs_MOVED-20260714` へリネーム（現在はハンドル保持で拒否。削除禁止）。
3. D-5完了後、次フェーズD-6は別途ユーザー確認を得て着手する。

## 今だけの申し送り
- web-stack起動中（HTTP 80 / DB 3306）。XAMPP Apache/MySQLは停止済み、サービス・自動起動登録なし。
- 旧htdocsリネーム失敗時もデータ変更なし。Dockerは `C:\dev\legacy-htdocs` のみ参照し、旧htdocsはロールバック用に残置。
- OMS/web-stackともD-5ブランチ。再起動前にコミット・pushして状態を保全する。
