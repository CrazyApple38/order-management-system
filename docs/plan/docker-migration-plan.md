# XAMPP → Docker 全面移行計画書

**ステータス: D-0〜D-6 完了（2026-07-14）／D-7 着手待ち**
**SSOT: 本計画書。着手前に全読すること（§2 AI 実装ガイドライン厳守）**

- 作成: 2026-07-14 Claude Code (Fable 5)・ユーザー承認済み方針に基づく
- 実装想定: Codex / Claude（Opus 等の下位モデル含む）。**D-3 のみ Claude Code 自身が実施推奨**（§4.4）
- 関連: `docs/plan/orca-worktree-workflow-plan.md`（worktree 配信の現行仕様）/ `docs/SHARED-MEMORY.md`

---

## §1 目的・スコープ・非スコープ

### 1.1 目的

1. **PC 故障リスクの低減** — 開発環境（Web サーバ・DB・データ）を宣言的な構成ファイル（compose）+ dump で再構築可能にする
2. **環境の可搬性** — ノート PC でも `git clone` + `docker compose up` で母艦と同一 URL・同一挙動の開発環境を再現する

### 1.2 スコープ（ユーザー確定 2026-07-14）

| # | 決定事項 |
|---|---------|
| 1 | 静的モックアップ配信 + **Next.js/Supabase の環境のみ**構築（アプリ実装は Phase 3 宣言後） |
| 2 | OMS リポジトリを **`C:\dev\order-management-system` へ移動**（AI 設定・メモリ・パス参照の引っ越し含む） |
| 3 | htdocs の他プロジェクト（legacy）も **`C:\dev` へ移動**し、**ポート 80 で URL 完全互換の全面移行・XAMPP 完全廃止** |
| 4 | **MariaDB 全 DB 移行**（keibi_system / basarak28_zennippon / zng_recruit_test）+ phpMyAdmin |
| 5 | **orca worktree 配信（`http://localhost/oms-wt-<ai>-<topic>/`）も Docker 対応** |
| 6 | ノート PC は **Windows + Docker Desktop・OMS のみ git 経由**で再現（legacy と DB は母艦のみ） |

### 1.3 非スコープ

- Next.js アプリ実装（create-next-app 含む）・Supabase スキーマ/マイグレーション作成 → **Phase 3（「モックアップ完了」宣言後）**
- MariaDB のバージョンアップ（10.4 は EOL だが今回は挙動互換優先でピン。§6）
- legacy プロジェクトの git 化・リファクタ（§6）
- ノート PC への legacy / DB の展開

### 1.4 前提事実（2026-07-14 調査確定・実装時に再検証不要のもの）

- OMS は **PHP / .htaccess / DB を一切使わない純静的**モックアップ（Apache の役割は静的配信のみ）
- XAMPP 実測: **PHP 8.2.12 / Apache 2.4.58 / MariaDB 10.4.32**・`httpd-vhosts.conf` にカスタム vhost なし
- MariaDB 実 DB: `keibi_system` / `basarak28_zennippon` / `zng_recruit_test`（+ system schema）
- PHP を含む htdocs 配下: `dashboard`（**XAMPP 自身のダッシュボード＝ユーザープロジェクトではない**）/ `keibi-report-quiz` / `keibi-system`（+backup）/ `Nikkei_HP` / `recruit_backup_2025-09-04` / `ZNG_Recruit`
- 移行前にXAMPPパスへ依存していた **`scripts/orca-wt.sh`** と **`docs/rules/shared.md`** はD-3/D-4でDocker前提へ移行済み
- `supabase/` は空の `migrations/` のみ（Supabase CLI 未初期化・config.toml なし）

---

## §2 AI 実装ガイドライン（厳守）

複数エージェント・下位モデルでの実装を前提とする。`docs/plan/mockup-master-account-plan.md` §2 と同趣旨。

### 2.1 着手前

1. **本計画書を全読**する（担当フェーズだけの拾い読み禁止。§3 アーキテクチャと §4 の担当フェーズ + 前後フェーズは必ず読む）
2. `docs/SHARED-MEMORY.md` と `docs/HANDOFF.md` を全読する
3. **フェーズ単位で着手前にユーザーへ確認**する（Claude = AskUserQuestion / Codex = 選択肢付き質問）。複数フェーズを勝手にまとめて進めない
4. 各フェーズの「ユーザー確認ゲート」に達したら、**ゲートを通過するまで次の操作をしない**

### 2.2 計画と実際が違ったときのプロトコル（本計画書の核）

実装中に「計画の記載と現実が異なる」事象（コマンド失敗・想定外のファイル・検証不合格など）に遭遇したら:

1. **各フェーズの「既知の分岐」表を最初に参照**する。記載があればその代替案を実施し、**本計画書の該当節を実績で更新**する（何が起き、どちらの分岐を選んだか）
2. 記載がない乖離は **作業を止めてユーザーに確認**する。勝手に構成変更・代替設計・スコープ拡大をしない
3. **破壊的操作（ファイル移動・削除・サービス停止・DB 上書き）は、直前バックアップの存在確認 + ユーザー承認後にのみ実行**する。「D-0 で取ったはず」ではなく、その場でバックアップファイルの実在とサイズを確認する
4. 本計画書は living document。乖離・決定・実績は該当節に追記し、**本体作業と同一コミット**に含める

### 2.3 検証の原則

- 受け入れ基準は「動いたはず」ではなく **§5 の検証コマンドの実行結果**で判定する（curl の HTTP ステータス・`docker compose ps` の STATE・DB の行数突合）
- 各フェーズの受け入れ基準を **全項目満たすまで完了と報告しない**。満たせない場合は 2.2 に従う

### 2.4 リポジトリ運用

- OMS リポジトリへの変更は **pr-flow**（start → review〈該当時〉→ commit → submit → automerge）で行う。`scripts/orca-wt.sh` の改修（D-4）は非 .md 変更のため独立レビュー基準に該当し得る — `pr-flow.sh review` の判定に従う
- **本移行は orca worktree（並列開発）を使わず、main リポジトリ + pr-flow ブランチで直列実施する（2026-07-14 ユーザー確認済み）**。理由:
  - D-0〜D-7 は直列依存で並列化の利得がなく、living document（本計画書）の並行更新はマージ競合を生むだけ
  - **D-3 の main リポジトリ移動は、linked worktree の絶対パス相互参照（worktree 側 `.git` → 旧 main パス / main 側 `.git\worktrees` → worktree パス）を全 worktree で破壊する**。worktree 内から D-3 を実施すると自分の作業ツリーごと壊れる
  - D-4 の受け入れ検証（`orca-wt.sh new/drop` の実走）は main リポジトリ側でしか行えない
  - **D-3 着手直前〜D-5 完了までは worktree の新規作成も禁止**（既存分は D-3 前提条件どおりゼロにしてから着手）。D-0〜D-2 は技術的には worktree でも可能だが、上記のとおり利得がないため main 直列で統一する
- **`CLAUDE.md` / `AGENTS.md` は手編集禁止**。`docs/rules/*.md` を編集し `node scripts/build-rules.js` で再生成する（pre-commit / CI が drift をブロックする）
- web-stack（§3）は新規の独立 git リポジトリ。GitHub に private リポジトリを作成して push する（リポジトリ名・可視性はユーザー確認）

---

## §3 最終アーキテクチャ

### 3.1 ディレクトリ配置（母艦・移行完了後）

```
C:\dev\
├─ web-stack\                  ← 新規 infra リポジトリ（git 管理・母艦専用）
│   ├─ compose.yaml             web / db / pma の3サービス定義
│   ├─ .env                     ポート等の環境変数（git 管理外・.env.example を管理）
│   ├─ php\Dockerfile           php:8.2-apache + 拡張
│   ├─ apache\oms.conf          OMS/worktree/phpMyAdmin の配信設定
│   ├─ db-init\                 初回インポート用 dump（git 管理外・.gitignore）
│   └─ README.md                起動・復旧手順
├─ legacy-htdocs\              ← 旧 C:\xampp\htdocs のユーザープロジェクト移動先
├─ order-management-system\    ← OMS リポジトリ移動先
└─ migration-backup\           ← D-0 バックアップ（dump・設定コピー。git 管理外）
```

orca worktree実体は `C:\Users\Owner\orca\workspaces\order-management-system\` にあり、web-stackが同ルートをread-onlyマウントする（D-4）。

### 3.2 コンテナ構成（web-stack）

| サービス | イメージ | ポート（最終） | 役割 |
|---------|---------|--------------|------|
| `web` | `php:8.2-apache` ベース（php/Dockerfile） | `80:80` | legacy PHP 群 + OMS 静的 + worktree 配信 |
| `db` | `mariadb:10.4` | `127.0.0.1:3306:3306` | 全 DB（named volume `db-data`） |
| `pma` | `phpmyadmin` | （直接公開なし） | `web` から `/phpmyadmin` に ProxyPass |

- **バージョンは XAMPP 実測にピン**（PHP 8.2 / MariaDB 10.4）— 挙動互換優先。アップグレードは §6
- `web` のマウント: `C:\dev\legacy-htdocs → /var/www/html`（docroot）/ `C:\dev\order-management-system → /var/www/html/order-management-system`（ネストマウント）/ orca workspacesルート → `/var/www/orca-ws:ro`
- MariaDB root は **XAMPP 互換のパスワード空を許容**（`MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=1`）し、その代わり **3306 は `127.0.0.1` バインドのみ**で公開する。パスワード導入は将来課題（§6。legacy 設定の一斉変更を避けるための決定）

### 3.3 URL 互換表（受け入れ基準の正本）

| URL | 移行前（XAMPP） | 移行後（Docker） |
|-----|----------------|-----------------|
| `http://localhost/<legacyプロジェクト>/...` | htdocs 直配信 | **不変**（legacy-htdocs 直配信） |
| `http://localhost/order-management-system/...` | htdocs 直配信 | **不変**（ネストマウント） |
| `http://localhost/oms-wt-<ai>-<topic>/` | htdocs 内 junction | **不変**（AliasMatch + orca workspaces直接マウント。D-4） |
| `http://localhost/phpmyadmin/` | XAMPP alias | **不変**（ProxyPass。不可なら `:8090` へ分岐 → D-1 既知の分岐） |
| `localhost:3306`（DB 接続・ホスト側から） | XAMPP MariaDB | **不変**（127.0.0.1 バインド） |
| PHP コンテナ内からの DB 接続 | `localhost` | **`db`（サービス名）に変更が必要** → D-2 |

### 3.4 OMS リポジトリ側の追加（ノート PC 用・母艦では原則未使用）

`docker/compose.yaml`（新規）:

```yaml
name: oms
services:
  mock-web:
    image: httpd:2.4-alpine
    ports: ["80:80"]
    volumes:
      # 母艦(web-stack)と同一 URL になるよう /order-management-system パスで配信
      - ..:/usr/local/apache2/htdocs/order-management-system:ro
  app:   # Phase 3 用の枠。既定では起動しない（環境のみ・§1.3）
    profiles: ["app"]
    image: node:22-alpine
    working_dir: /app
    ports: ["127.0.0.1:3000:3000"]
    volumes:
      - ../src:/app
    command: sh -c "node -v && npm -v && sleep infinity"
```

- httpd:2.4-alpine の既定 docroot 直下にはウェルカム `index.html` があるが放置してよい（`/order-management-system/` 配下だけ使う）
- Supabase は compose に入れず、プロジェクトの npm 開発依存に固定した **Supabase CLI（`npx supabase start`）** で管理する（CLI が専用コンテナ群を自動起動する公式方式）。D-6 参照

### 3.5 実施順序と依存

```
D-0 棚卸し・バックアップ
 → D-1 web-stack 構築（一時ポート 8080 で XAMPP と並走・現地 htdocs をそのままマウント）
 → D-2 legacy DB 接続修正・動作検証（並走のまま）
 → D-3 OMS リポジトリ移動 + AI 環境引っ越し（Claude Code 自身が実施推奨）
 → D-4 orca-wt.sh Docker 対応
 → D-5 切替（XAMPP 停止・htdocs 移動・ポート 80/3306 へ）★ここで初めて XAMPP を止める
 → D-6 Next.js/Supabase 環境
 → D-7 ノート PC 再現手順書
```

D-4 と D-5 の間まで、XAMPP は一切変更しない（ロールバック = Docker 側を止めるだけ）。

---

## §4 移行フェーズ詳細

> 各フェーズ共通: 着手前にユーザー確認 → 実施 → §5 検証 → 実績を本計画書へ追記 → コミット（OMS リポジトリに触れた場合は pr-flow）。

### 4.1 D-0 棚卸し・バックアップ

**目的**: ロールバック原資の確保と、後続フェーズの入力情報（拡張・サービス・プロジェクト一覧）の確定。**完了条件はバックアップの実在確認**。

**手順**（すべて読み取り or バックアップ作成のみ。XAMPP は稼働したまま）:

1. `mkdir C:\dev\migration-backup`（`C:\dev` が無ければ作成）
2. **全 DB dump（2 系統取る）**:
   ```
   C:\xampp\mysql\bin\mysqldump.exe -u root --all-databases --routines --events --result-file=C:\dev\migration-backup\all-databases.sql
   C:\xampp\mysql\bin\mysqldump.exe -u root --databases keibi_system --result-file=C:\dev\migration-backup\keibi_system.sql
   C:\xampp\mysql\bin\mysqldump.exe -u root --databases basarak28_zennippon --result-file=C:\dev\migration-backup\basarak28_zennippon.sql
   C:\xampp\mysql\bin\mysqldump.exe -u root --databases zng_recruit_test --result-file=C:\dev\migration-backup\zng_recruit_test.sql
   ```
   （root パスワードは XAMPP 既定で空。認証エラーなら `-p` を付けてユーザーにパスワード確認）
3. **ユーザー・権限の記録**: `mysql -u root -e "SELECT user,host FROM mysql.user;"` と、出てきた各ユーザーの `SHOW GRANTS FOR 'user'@'host';` を `users-grants.txt` へ保存（過去ログに `basarak28_zennippon` / `basarak28_zgu1` ユーザーの形跡あり）
4. **設定のコピー**: `C:\xampp\apache\conf\httpd.conf`・`conf\extra\httpd-xampp.conf`・`C:\xampp\php\php.ini`・`C:\xampp\mysql\bin\my.ini` を migration-backup へ
5. **PHP 拡張の記録**: `C:\xampp\php\php.exe -m > C:\dev\migration-backup\xampp-php-m.txt`
6. **htdocs 棚卸し**: 直下の一覧（ファイル/ディレクトリ・サイズ）を `htdocs-inventory.txt` へ。**「XAMPP 自身の付属物」候補**（`dashboard` / `xampp` / `webalizer` / `img` / `bitnami.css` / `index.php` / `favicon.ico`）と**ユーザープロジェクト**を分類する
7. **サービス登録確認**: `Get-Service | Where-Object {$_.Name -match 'apache|mysql'}` — XAMPP を Windows サービス登録しているか記録（D-5 の停止手順が変わる）
8. **Docker 動作確認**: `docker --version`・`docker compose version`・`docker run --rm hello-world`。Docker Desktop 未導入ならユーザーへインストールを依頼（AI が勝手にインストールしない）
9. ポート事前調査: `netstat -ano | findstr ":80 "` と `:3306` — XAMPP 以外の占有プロセスの有無を記録

**受け入れ基準**: dump 4 ファイルが存在しサイズ > 0 / users-grants.txt・設定コピー・php -m・棚卸し・サービス状況が migration-backup に揃う / hello-world 成功。

**実績による代替（2026-07-14 ユーザー承認）**: XAMPP 側 `mysql` システムスキーマの Aria 破損により全 DB 論理 dump は成立しなかった。アプリ DB 個別 dump 3 本 + `mysql` システムスキーマ全体の物理バックアップ + 生存する `mysql.global_priv` の論理 dump をバックアップ原資とし、Docker 側では正常な MariaDB 10.4 システムテーブルを新規生成してユーザー・権限を再構築する。失敗した全 DB dump 2 本は誤使用防止のため `.PARTIAL-*` 名で保管する。

**ユーザー確認ゲート（D-0 完了時）**: htdocs 棚卸し結果を提示し、(a) XAMPP 付属物の分類が正しいか、(b) 各ユーザープロジェクトの現役/休眠、を確認する（D-2・D-5 の入力になる）。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| mysqldump が認証エラー | `-p` でユーザーにパスワード確認。それでも不可なら停止しユーザー確認 |
| `mysql` システムスキーマの Aria テーブルが破損 | 原本への追加修復を止め、システムスキーマ全体を物理バックアップする。アプリ DB は個別 dump、生存する `global_priv` は個別に論理保全し、Docker 側の正常なシステムテーブルへ権限を再構築する。破損した `mysql` スキーマを db-init へ入れない |
| Docker Desktop 未導入 / WSL2 無効 | ユーザーにインストール・有効化を依頼（`wsl --install` 等はユーザー操作） |
| 80/3306 に XAMPP 以外の占有（IIS・Skype 等） | 記録して D-5 の切替前にユーザーへ提示（サービス停止判断はユーザー） |

**ロールバック**: 不要（読み取りのみ）。

**D-0 実績（2026-07-14 / Codex）**:

- `C:\dev\migration-backup` にアプリ DB 3 本を取得: `keibi_system.sql` 206,868 bytes / `basarak28_zennippon.sql` 113,481 bytes / `zng_recruit_test.sql` 1,482 bytes。
- 全 DB dump は `mysql.db`、再試行は `mysql.proxies_priv` の CRC 破損で失敗。全24 Aria テーブルの読み取り検査で `db` / `proxies_priv` / `tables_priv` が破損、`event` / `global_priv` / `roles_mapping` が「使用可能だが修復推奨」。`mysql` スキーマ全89ファイル（3,130,551 bytes）を `mysql-system-raw-20260714-060232` へ物理保全し、`mysql-global_priv.sql` / `users-grants.txt` も取得した。
- 設定4ファイル、PHP拡張一覧、サービス・ポート、htdocs容量付き棚卸しと SHA-256 マニフェストを取得。Windowsサービス登録なし、Apacheのみ port 80 で稼働、MariaDBは通常起動不可のため停止中（必要な読み取りは `--skip-grant-tables` で実施）。
- htdocs分類確定: 現役=`keibi-report-quiz` / `keibi-system` / `ZNG_Recruit`、休眠=`keibi-system-backup` / `Nikkei_HP` / `recruit_backup_2025-09-04`。XAMPP付属7項目は移行対象外、その他はユーザーデータとして D-5 移動対象。
- WSL / Docker Desktop は未導入。`hello-world` のみ未達で、導入・再起動後に D-0 を完了判定する。
- **（2026-07-14 / Claude Code 追記・D-0 完了）** ユーザー承認のもと Claude Code が導入を代行（UAC 承認はユーザー）: `wsl --install --no-distribution` で WSL 2.7.10（ディストリビューションなし・Docker Desktop 専用のため）→ OS 再起動 → winget で Docker Desktop 4.81.0。検証合格: `docker --version` = 29.6.1 / `docker compose version` = v5.2.0 / `docker run --rm hello-world` 成功。**D-0 受け入れ基準を全項目達成**。

### 4.2 D-1 web-stack 構築（XAMPP 並走・一時ポート）

**目的**: Docker スタックを一時ポートで立ち上げ、**XAMPP を止めずに** legacy 全体が配信できることを確認する。この時点では **現地 `C:\xampp\htdocs` をそのままマウント**する（ファイル移動は D-5）。

**手順**:

1. `C:\dev\web-stack` を作成し `git init`。以下を作成:

   `compose.yaml`:
   ```yaml
   name: web-stack
   services:
     web:
       build: ./php
       ports:
         - "${HTTP_PORT:-8080}:80"
       volumes:
         - "${HTDOCS_DIR:-C:/xampp/htdocs}:/var/www/html"
         - "${OMS_DIR:-C:/xampp/htdocs/order-management-system}:/var/www/html/order-management-system"
         - "./apache/oms.conf:/etc/apache2/conf-enabled/z-oms.conf:ro"
       depends_on: [db]
       restart: unless-stopped
     db:
       image: mariadb:10.4
       environment:
         MARIADB_ALLOW_EMPTY_ROOT_PASSWORD: "1"
       ports:
         - "127.0.0.1:${DB_PORT:-13306}:3306"
       volumes:
         - db-data:/var/lib/mysql
         - ./db-init:/docker-entrypoint-initdb.d:ro
       restart: unless-stopped
     pma:
       image: phpmyadmin
       environment:
         PMA_HOST: db
         PMA_ABSOLUTE_URI: "http://localhost:${HTTP_PORT:-8080}/phpmyadmin/"
       depends_on: [db]
       restart: unless-stopped
   volumes:
     db-data:
   ```
   ※ worktree 配信はD-4でorca workspacesルートのread-only直接マウントとして追加済み。
   `.env.example`（git 管理）と `.env`（管理外）: `HTTP_PORT=8080` / `DB_PORT=13306` / `HTDOCS_DIR=C:/xampp/htdocs` / `OMS_DIR=C:/xampp/htdocs/order-management-system`

   `php/Dockerfile`:
   ```dockerfile
   FROM php:8.2-apache
   # 拡張は mlocati/docker-php-extension-installer で導入（apt 依存解決を自動化）
   ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
   RUN chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions mysqli pdo_mysql mbstring gd zip intl
   RUN a2enmod rewrite proxy proxy_http
   ```
   ※ 拡張リストは **D-0 の `xampp-php-m.txt` と `php -m`（コンテナ内）を突合**して不足分を追記する（受け入れ基準参照）。

   `apache/oms.conf`:
   ```apache
   <Directory /var/www/html>
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   # phpMyAdmin（URL 互換: http://localhost/phpmyadmin/）
   Redirect permanent /phpmyadmin /phpmyadmin/
   ProxyPass /phpmyadmin/ http://pma/
   ProxyPassReverse /phpmyadmin/ http://pma/
   # worktree 配信（AliasMatch）は D-4 で追記
   ```
   `db-init/.gitkeep` + `.gitignore`（`db-init/*.sql` と `.env` を除外）

2. D-0 の dump をコピー: `keibi_system.sql` 等 **個別 DB dump 3 本**を `db-init/` へ（`--databases` 付き dump なので CREATE DATABASE を含む。**all-databases.sql は使わない** — mysql システムスキーマの上書きを避けるため）。ユーザー作成 SQL `db-init/90-users.sql` を D-0 の users-grants.txt から起こす（`CREATE USER IF NOT EXISTS ... ; GRANT ...;`）
3. `docker compose up -d --build` → 初回起動で db-init が自動インポートされる（`docker compose logs db` で完了確認。**インポートは volume 初回作成時のみ**走る点に注意。やり直しは `docker compose down -v` で volume ごと破棄してから）
4. 拡張突合: `docker compose exec web php -m > docker-php-m.txt` → xampp-php-m.txt と diff → XAMPP 側にだけある拡張のうち legacy が使いそうなもの（gd/intl/soap/curl 等）を Dockerfile へ追記 → rebuild

**受け入れ基準**（§5.1）: `docker compose ps` で 3 サービス running / `http://localhost:8080/<現役プロジェクト>/` が全て HTTP 200（リダイレクト含む 2xx/3xx）/ `http://localhost:8080/order-management-system/docs/index.html` 200 / `http://localhost:8080/phpmyadmin/` でログイン画面表示 / DB 3 つの主要テーブル行数が XAMPP 側と一致。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| ProxyPass 経由の phpMyAdmin が CSS 崩れ・ログイン不可 | `PMA_ABSOLUTE_URI` の値（ポート含む）を確認。解決しなければ **`/phpmyadmin` を諦め `pma` に `ports: "8090:80"` を付けて `http://localhost:8090`** に切替（URL 互換表 §3.3 を更新し、ユーザーへ報告） |
| db-init のインポートで照合順序エラー（utf8mb4_0900_* 等） | MySQL 8 系照合が紛れた場合のみ発生。dump 内の `COLLATE=utf8mb4_0900_ai_ci` を `utf8mb4_general_ci` に置換して再インポート |
| インポートで `Unknown character set` 等 | dump を `--default-character-set=utf8mb4` で取り直し |
| 拡張の docker-php-ext-install / install-php-extensions 失敗 | イメージ pull し直し・拡張名綴り確認。解決しなければその拡張を保留リストに記録しユーザー確認 |
| バインドマウントのファイル権限で PHP が書込不可（アップロード系機能） | 該当プロジェクトと書込先を特定し、`www-data` 所有の named volume 分離 or 権限調整をユーザーへ提案 |
| 8080/13306 が使用中 | `.env` で別ポートに変更（受け入れ基準の URL も読み替え） |

**ロールバック**: `docker compose down -v` のみ（XAMPP 側は無変更）。

**D-1 実績（2026-07-14 / Claude Code）**:

- `C:\dev\web-stack` を計画どおり作成（compose.yaml / php/Dockerfile / apache/oms.conf / .env(.example) / db-init）・git init 済み（GitHub リポジトリ作成は名称・可視性のユーザー確認待ち）。
- db-init = 個別 dump 3 本 + `90-users.sql`（生存 global_priv 由来: pma のみ。`basarak28_*` の権限は破損で失われたため **D-2 で PHP 設定から逆引き再構築**とコメント明記）。初回インポートはエラーなし。
- 検証全合格: 3 サービス running / 現役 legacy 3 件 + OMS docs/index.html + phpMyAdmin すべて 200（:8080）/ テーブル数 12・38・0 が dump と一致（`zng_recruit_test` は元々テーブル 0 の空 DB）/ 主要 6 テーブルの行数が dump のタプル数と完全一致。
- **乖離1（DB 突合の代替）**: XAMPP MariaDB が起動不可のため「XAMPP 側と行数一致」は実施不能。バックアップ原資である dump を基準に突合（受け入れ基準の趣旨=データ無欠損は担保）。
- **乖離2（phpMyAdmin 空パスワード）**: 公式 phpmyadmin イメージは既定 `AllowNoPassword=false` で root 空 PW ログイン不可。`pma/config.user.inc.php`（`AllowNoPassword=true`）を追加マウントで XAMPP 互換化し、curl での実ログイン成功を確認。
- **拡張突合**: 欠落は `ftp` のみ → legacy 全プロジェクトで ftp_* 関数未使用を grep 確認し導入見送り（Dockerfile にコメント記録）。gd/intl/zip/bcmath/bz2/calendar/exif/gettext は導入済み。

### 4.3 D-2 legacy DB 接続修正・動作検証

**目的**: legacy PHP の DB 接続を Docker 構成（ホスト名 `db`）で動くようにし、現役プロジェクトの動作を確認する。**唯一 legacy のコードに触れるフェーズ**。

**手順**:

1. 接続設定の棚卸し（node_modules / vendor を必ず除外。Git Bash 例）:
   ```sh
   for d in keibi-system keibi-report-quiz Nikkei_HP ZNG_Recruit recruit_backup_2025-09-04 keibi-system-backup; do
     grep -rlE "mysqli|new PDO|mysql_connect" --include='*.php' \
       --exclude-dir=node_modules --exclude-dir=vendor "C:/xampp/htdocs/$d" | head -20
   done
   ```
   検出ファイルから **接続ホスト・DB 名・ユーザーの定義箇所**（config.php 等の集中定義か、ファイル散在か）を一覧化する
2. **ユーザー確認ゲート**: 一覧（プロジェクト × 接続定義ファイル × 修正方針）を提示し、**現役プロジェクトのみ**修正対象として確定する（D-0 ゲートの現役/休眠判定を反映。休眠分は「dump 保管のみ・修正しない」）
3. 修正: 各対象ファイルの接続ホスト `localhost` / `127.0.0.1` → **`db`** へ変更。**変更前に必ず `<file>.bak-xampp` を同ディレクトリに作成**。ユーザー/パスワードは原則そのまま（db-init/90-users.sql で同一ユーザーを再現済みの前提。root 空パスワードも §3.2 で許容済み）
4. 動作検証: 現役プロジェクトごとに「DB を実際に読むページ」を 1 つ以上ユーザーに教えてもらい、`http://localhost:8080/...` で表示・データ表示を確認

**受け入れ基準**: 現役プロジェクト全てで DB 読み取りページが :8080 で正常表示 / 修正ファイルすべてに .bak-xampp が存在。

**注意**: この修正により **legacy を XAMPP（localhost 接続）で動かすことはできなくなる**（.bak-xampp で戻せる）。修正着手をもって「配信の正」は Docker 側へ移る — ユーザー確認ゲートで明示的に伝えること。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| 接続定義が大量に散在（数十ファイル） | 一括 sed はせず、対象一覧をユーザーへ提示して方針確認（集中 config 化の提案可・実施はユーザー承認後） |
| `basarak28_*` 等のユーザーで認証失敗 | db-init/90-users.sql の CREATE USER/GRANT を実 DB 照合（`SELECT user,host FROM mysql.user`）で修正。パスワード不明ならユーザーへ確認 |
| ソケット接続（`localhost` + Unix socket 前提）で失敗 | ホスト名を `db` にすれば TCP になるため通常解消。それでも失敗なら該当コード提示のうえユーザー確認 |
| PHP エラー（拡張不足・非推奨 API） | 拡張不足は D-1 の Dockerfile へ追加。コード起因（PHP 8.2 非互換等）は**修正せず**ユーザーへ報告（XAMPP も 8.2 なので通常は発生しない） |

**ロールバック**: .bak-xampp を戻す（`for f in $(find ... -name '*.bak-xampp'); do mv "$f" "${f%.bak-xampp}"; done` 相当）。

**D-2 実績（2026-07-14 / Claude Code）**:

- 棚卸し結果（ユーザー確認ゲート通過済み）: **keibi-system = Laravel**（接続= `.env`）/ **ZNG_Recruit = config 集中定義**（Docker では本番判定が偽になり `backend/config/database_local.php` が読まれる）/ **keibi-report-quiz = DB 不使用**（JSON ファイル保存・修正不要）/ 休眠 3 件は修正せず。ハードコード接続なし（全て DB_HOST 定数経由）。
- 修正 2 ファイル（各 `.bak-xampp` 作成済み）: `keibi-system/.env` の `DB_HOST=127.0.0.1`→`db` / `ZNG_Recruit/backend/config/database_local.php` の `localhost`→`db`。
- **ユーザー再構築**: ZNG_Recruit 本番 config から `basarak28_zgu1` のパスワードが判明 → 実 DB + `db-init/90-users.sql` へ CREATE USER/GRANT を反映（ユーザー承認・migration-backup へもコピー）。
- 検証合格: ZNG `backend/api/companies.php` が DB データを JSON 返却 / keibi-system トップ 200 + `artisan migrate:status` で 12 マイグレーション認識（接続先 `db`）/ www-data 書込テスト 3 箇所（quiz data・ZNG uploads・Laravel storage）全て可。
- **乖離（keibi-system 500）**: `storage/framework/{sessions,views,cache}` が欠損しており初回 500（XAMPP 期からの欠損・git 管理外の標準生成物）。標準ディレクトリの追加作成のみで解消 → 200。

### 4.4 D-3 OMS リポジトリ移動 + AI 環境引っ越し

**目的**: OMS を `C:\dev\order-management-system` へ移動し、AI ツーリング（Claude メモリ・orca・生成ルール）を追従させる。

**⚠ このフェーズは Claude Code 自身が実施することを推奨**（Claude のメモリ dir・Obsidian junction・settings は Claude 環境固有で、他 AI からは検証しづらい）。Codex が担当する場合、Claude メモリ関連（手順 4）はスキップして「Claude Code に引き継ぐ」と HANDOFF に明記する。

**前提条件（全て満たすまで着手禁止）**: `git status` clean / `sh scripts/orca-wt.sh list` で worktree・junction ゼロ（**リポジトリ移動は linked worktree の絶対パス参照を全破壊するため。移動後〜D-5 完了まで新規作成も禁止 = §2.4**）/ 進行中 PR なし / 他 AI セッションが本リポジトリを開いていない（ユーザーに確認）。

**手順**:

1. 移動（コピー→検証→旧削除の順。いきなり move しない）:
   ```powershell
   robocopy C:\xampp\htdocs\order-management-system C:\dev\order-management-system /E /COPYALL /DCOPY:DAT /R:1 /W:1
   ```
2. 検証: `git -C C:\dev\order-management-system status`（clean・ブランチ一致）/ `git -C C:\dev\order-management-system fsck --no-dangling` / `git remote -v` が GitHub を指す
3. **検証合格後**、旧 `C:\xampp\htdocs\order-management-system` をリネーム退避（`order-management-system_MOVED-YYYYMMDD`。削除は D-5 の保持期間後）。**リネームはユーザー承認後**
4. Claude 環境（Claude Code 実施）:
   - メモリ dir 複製: `C:\Users\Owner\.claude\projects\C--xampp-htdocs-order-management-system\` → `C--dev-order-management-system\`（memory/ 一式）
   - Obsidian ClaudeMemory との junction 統合は `ClaudeMemory/_system/schema.md` の規約に従い、新メモリ dir で junction を再作成・旧側の junction を除去
   - `~/.claude/settings.json` 等に旧絶対パスの permission・hook 記述がないか grep し、あれば更新
5. Codex 環境: `~/.codex/config.toml` 等の project trust / 履歴のパス参照を新パスへ（Codex 担当可）
6. orca: `orca repo add --path C:\dev\order-management-system`（旧登録は `orca repo` の remove 系コマンドがあれば除去、無ければ残置を記録）
7. リポジトリ内の記述更新（**新パスの OMS リポジトリで pr-flow ブランチを切って実施**）:
   - `docs/rules/shared.md` の「Local Browser Verification」節: XAMPP 前提 → Docker 前提へ書き換え（URL は不変・「Apache が起動していない場合」→「web-stack コンテナが起動していない場合は `docker compose up -d`」等）
   - `node scripts/build-rules.js` で CLAUDE.md / AGENTS.md を再生成
   - 本計画書の実績追記・`docs/SHARED-MEMORY.md`（構造的変更の警告 1 行 + 触らないでほしいもの更新）・HANDOFF
8. web-stack の `.env` を更新: `OMS_DIR=C:/dev/order-management-system` → `docker compose up -d` で反映 → `:8080/order-management-system/docs/index.html` 200 確認

**受け入れ基準**: 新パスで git 操作正常（status/fsck/log）/ :8080 で OMS モックアップ表示 / `node scripts/build-rules.js --check` green / Claude 新セッションが新パスでメモリを認識（Claude 実施時）。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| robocopy の終了コード 8 以上（コピー失敗あり） | 旧を残したままログ提示・ユーザー確認（0〜7 は成功系） |
| node_modules 起因でコピーが遅い/失敗 | node_modules を除外してコピーし、新パスで `npm install`（package-lock.json 準拠） |
| Obsidian junction の再作成手順が schema.md と現物で食い違う | 停止してユーザー確認（Vault 側は PII 注意・勝手に触らない） |
| orca に旧パス登録が残り worktree 作成先が混乱 | 旧登録の除去方法を orca CLI ヘルプで確認。除去不能なら ORCA 側は残置し、orca-wt.sh 側（D-4）が新パスの repo id を解決することを確認 |

**ロールバック**: 旧ディレクトリのリネームを戻し、web-stack `.env` を旧値へ。メモリ dir は複製方式なので旧側が無傷で残る。

**D-3 実績（2026-07-14 / Claude Code）**:

- 前提条件確認: git clean / worktree・junction ゼロ / open PR なし / 他 AI セッションなし（ユーザー確認）。
- robocopy コピー成功（1.5 GB・失敗 0）。**分岐: `/COPYALL` が非管理者で使用法エラー → D-5 の既知分岐と同様 `/COPY:DAT` へ**。新パスで git status clean・fsck エラーなし・remote 正常を確認。
- Claude 環境: メモリは junction 方式（実体= Vault `ClaudeMemory\order-management-system`・フォルダ名はパス非依存）のため複製ではなく **新 projects dir `C--dev-order-management-system` へ同一ターゲットの junction を再作成 + 旧 junction 除去**（Vault 実体無傷を確認）。`~/.claude/settings.json` の旧パス permission 8 箇所を新パスへ更新（JSON 妥当性確認済み）。
- Codex 環境: `~/.codex/config.toml` へ `[projects.'C:\dev\order-management-system'] trust_level="trusted"` を追加（旧エントリは無害のため残置）。
- orca: `orca repo add --path C:\dev\order-management-system` 実行（repo は remote 識別で解決。旧パス登録は除去手段がなく残置=既知の分岐どおり D-4 で orca-wt.sh 側の解決を確認）。
- リポジトリ内記述: `docs/rules/shared.md` の Local Browser Verification を Docker 前提へ（並走期間 :8080 注記付き）・main リポジトリパス更新 → build-rules 再生成・`--check` green。
- **旧 `C:\xampp\htdocs\order-management-system` のリネーム退避は保留**: 実施セッション（Claude Code プロセス）が旧パスを cwd として保持しハンドルを掴んでいるため。全セッション終了後にユーザーが Explorer 等でリネーム（`order-management-system_MOVED-20260714`）する。
- **CI 障害（記録）**: PR #21 以降、GitHub Actions が pull_request イベントで check-suite を生成しない事象（githubstatus 正常・workflow active・close/reopen・空 push・workflow disable/enable すべて無効）。緊急時手順（ruleset 18830708 一時無効化→手動 squash マージ→再有効化）で対応（ユーザー承認）。quality-gate 相当（ds-audit NG=0・build-rules --check）はローカル green を確認のこと。

### 4.5 D-4 orca-wt.sh Docker 対応（worktree 配信）

**目的**: `http://localhost/oms-wt-<ai>-<topic>/` の並列開発配信を Docker で維持する。

**現行仕様（D-4完了後）**: web-stackがorca workspacesルートをread-onlyで直接マウントし、`scripts/orca-wt.sh` はworktreeの作成・削除とDocker配信URLの対応表示を行う。Windows junctionは使用しない。

**設計**:

1. web-stack側: composeの`web`に `${OMS_WT_WORKSPACE_ROOT:-C:/Users/Owner/orca/workspaces/order-management-system}:/var/www/orca-ws:ro` を追加
2. `apache/oms.conf`でURLの`oms-wt-`接頭辞を除いたworktree名へ対応:
   ```apache
   AliasMatch ^/oms-wt-([^/]+)(/.*)?$ /var/www/orca-ws/$1$2
   <Directory /var/www/orca-ws>
       Options Indexes FollowSymLinks
       Require all granted
   </Directory>
   ```
3. `scripts/orca-wt.sh`: junction作成・除去・走査を廃止。比較pathはWindowsの大小文字非依存・末尾スラッシュ非依存に正規化する。`new`は作成pathが`OMS_WT_WORKSPACE_ROOT`配下か検証し、外れた場合は作成worktreeをロールバックする。`list`は配信ルート内だけURLを表示し、範囲外は`[未配信]`と明示する
4. 表示URLはweb-stack `.env` の`HTTP_PORT`に追従し、D-5の80番切替後はポートなしURLへ自動更新する
5. `docs/plan/orca-worktree-workflow-plan.md`を同じ配信経路へ更新

**分岐検証結果**: Windows junctionはコンテナ内で`/mnt/host/c/...`を指すリンクとして見えるが解決不能で、HTTP 403となった。このため既知の分岐どおりorca workspaces直接マウントを採用した。

**受け入れ基準**: `sh scripts/orca-wt.sh new claude smoke` → 出力URL（切替前は`:8080`）でworktreeの`docs/index.html`が表示 → `list`のURL/実体対応が正しい → `sh scripts/orca-wt.sh drop claude-smoke`でworktreeが消え、URLが404になる。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| orca worktreeが`OMS_WT_WORKSPACE_ROOT`外へ作成される | `new`が作成済みworktreeを即時ロールバックして停止。web-stackのマウント元と環境変数を一致させる |
| worktree 内の相対リンクが `/oms-wt-<name>/` プレフィックスで崩れる | 移行前と同じサブパス配信条件のため原則発生しない。発生したら該当ページを記録しユーザー確認 |
| `OMS_WT_WORKSPACE_ROOT` のPOSIX/Windowsパス変換ずれ | ラッパー内でWindows絶対パスを`cygpath -u`へ変換し、大小文字と末尾スラッシュを正規化。web-stack `.env` と同じ実体を指定する |

**ロールバック**: orca-wt.sh は git revert / compose・conf の追記を戻す。

**D-4 実績（2026-07-14 / Codex）**:

- **既知の分岐を採用**: `C:\dev\oms-wt-serve` のWindows junctionはコンテナ内で `/mnt/host/c/...` を指すリンクとして見えるがリンク先を解決できず、HTTP 403となった。
- web-stackはorca workspacesルート（既定 `C:\Users\Owner\orca\workspaces\order-management-system`）を `/var/www/orca-ws:ro` へ直接マウントし、AliasMatchでURLの `oms-wt-` 接頭辞を除いたworktree名へ対応する方式へ変更。`scripts/orca-wt.sh` はjunction操作を廃止し、worktree作成・削除・URL対応表示へ限定した。
- 実動検証合格: `new claude smoke` → `list`で `http://localhost:8080/oms-wt-claude-smoke/` を表示 → `docs/index.html` / `docs/order-book.html` ともHTTP 200 → `drop claude-smoke`後にworktree実体消失・URL 404。web-stack Apache構文とcompose構成もgreen。

### 4.6 D-5 切替・XAMPP 廃止

**目的**: XAMPP を停止し、htdocs を `C:\dev\legacy-htdocs` へ移動、web-stack をポート 80/3306 に切り替えて全面移行を完了する。**破壊的操作を含む唯一のフェーズ — 各ステップでユーザー承認**。

**前提条件**: D-1〜D-4 の受け入れ基準がすべて green / D-0 バックアップの実在を再確認（dump のサイズ・日付）/ worktreeゼロを維持していること（`orca-wt.sh list`のDocker配信URLが「なし」。D-4のsmoke検証分もdrop済み）。

**手順**:

1. **ユーザー承認**: 「XAMPP を停止して切り替える」ことの最終確認（このフェーズ中は legacy サイトが数分〜数十分ダウンする）
2. XAMPP 停止: コントロールパネルで Apache / MySQL を Stop。**サービス登録があれば**（D-0 手順 7 の記録参照）`Stop-Service` + スタートアップ種別を「無効」へ。コントロールパネル自体のスタートアップ登録（タスクスケジューラ / スタートアップフォルダ）も無効化
3. `docker compose down`（web-stack 停止。db volume は保持）
4. htdocs 移動（**XAMPP 付属物は移動しない** — D-0 ゲートで確定した分類に従う）:
   ```powershell
   # ユーザープロジェクトのみ C:\dev\legacy-htdocs へ。
   # 除外名だけを渡すと配下の同名 img/index.php 等まで除外されるため、トップ階層の絶対パスで指定する。
   $src = 'C:\xampp\htdocs'
   $excludeDirs = @(
     "$src\dashboard", "$src\xampp", "$src\webalizer", "$src\img", "$src\order-management-system"
   ) + @(Get-ChildItem -LiteralPath $src -Directory -Filter 'order-management-system_MOVED-*' |
       ForEach-Object FullName)
   $excludeFiles = @("$src\index.php", "$src\bitnami.css", "$src\favicon.ico")
   robocopy $src C:\dev\legacy-htdocs /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /XJ `
     /XD $excludeDirs /XF $excludeFiles
   ```
   コピー検証（ファイル数・サイズ突合）→ 合格後、旧 htdocs を `htdocs_MOVED-YYYYMMDD` へリネーム（削除しない）
5. web-stack `.env` 更新: `HTTP_PORT=80` / `DB_PORT=3306` / `HTDOCS_DIR=C:/dev/legacy-htdocs` → `docker compose up -d`
6. phpMyAdmin の `PMA_ABSOLUTE_URI` がポート 80 前提になるよう compose の式（`http://localhost:${HTTP_PORT}/phpmyadmin/`）を確認（80 のとき `:80` が付いても支障ないが、気になる場合は `http://localhost/phpmyadmin/` 固定へ）
7. §5.2 の全面回帰を実施
8. **C:\xampp は削除しない**。`htdocs_MOVED-*` と合わせて保持し、**削除はユーザー判断（目安 30 日後）**。Windows スタートメニュー等の XAMPP ショートカットはそのまま（ユーザー判断）

**受け入れ基準**（§5.2）: `http://localhost/`（80）で URL 互換表 §3.3 の全行が合格 / ホストから `mysql -h 127.0.0.1 -P 3306` で接続可 / OS 再起動後に Docker Desktop 自動起動 + `restart: unless-stopped` でスタックが自動復帰し、再起動後も全 URL 合格。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| ポート 80 が取れない（`bind: address already in use` 等） | D-0 手順 9 の記録を確認。IIS（W3SVC/HTTP.sys）・Skype 等の占有プロセスを特定しユーザーへ停止判断を仰ぐ。**勝手にサービス停止しない** |
| 3306 が取れない | 同上（XAMPP MySQL の止め忘れ・他 MySQL の常駐を確認） |
| 切替後に legacy の一部が動かない | 即 §ロールバックで XAMPP に戻すか、その場で直すかをユーザーへ確認（ダウンタイム判断はユーザー） |
| robocopy の /COPYALL が権限エラー | `/COPY:DAT` に落として再実行（ACL は開発ファイルには不要） |
| robocopy の除外名が配下の同名ファイル・ディレクトリにも一致 | `/XD` / `/XF` はトップ階層の絶対パスで指定する。件数・総容量・相対パス・各ファイルサイズをコピー元と突合 |
| 旧htdocsのリネームがアクティブなハンドルで拒否される | D-5完了を妨げない（Dockerはlegacy-htdocsのみ参照）。`Move-Item` は部分移動し得るため使わず、全関連セッション終了後に同一親で `Rename-Item` を使う。失敗時はその場で停止 |

**D-5 実績（2026-07-14 / Codex・完了）**:

- D-0バックアップ117ファイルの実在、manifest対象18件のSHA-256一致、CI green、worktreeゼロを再確認。XAMPP Apache/MySQLは停止済みでサービス・自動起動登録なし。
- legacy 35項目を `C:\dev\legacy-htdocs` へコピー。初回はrobocopyの名前指定が配下にも一致して156ファイルを除外したため、トップ階層の絶対パス指定で補完。最終突合は35,862ファイル・3,995,916,711 bytes・5,747ディレクトリで欠損/余分/サイズ不一致すべて0。
- web-stackを `HTTP_PORT=80` / `DB_PORT=3306` / `HTDOCS_DIR=C:/dev/legacy-htdocs` へ切替。OMS主要8画面・legacy・DB API・phpMyAdminは全てHTTP 200、ホスト3306接続、Apache構文、Laravel DB参照、localhost由来コンソールエラー0、OB⇄SL連携、worktree 200→drop後404まで合格。
- Docker DesktopのAutoStartを有効化してOS再起動。17:15起動後、Docker Desktopが17:17に自動起動し、`restart: unless-stopped` で3コンテナが自動復帰。主要13 URLは全てHTTP 200、ホスト3306接続・DB一覧・Apache構文も再度合格。
- 旧 `C:\xampp\htdocs` はアクティブなハンドルでリネーム不可。再起動後の `Move-Item` は574ファイル（572,346,239 bytes）を部分移動して停止したため、即座にコピーのみで元へ復元し、部分側の全ファイル/ディレクトリが元側に同一サイズで存在すること（欠損0）を確認。元は43トップ項目・58,143ファイルを保持し、部分退避 `htdocs_MOVED-20260714` も削除せず保全。後日の整理はユーザー判断とする。

**ロールバック**（完全復旧手順）: `docker compose down` → `htdocs_MOVED-*` を `htdocs` へリネーム → XAMPP Apache/MySQL を Start → D-2 の .bak-xampp を戻す（DB 接続を localhost に戻す）→ XAMPP で従来どおり。

### 4.7 D-6 Next.js / Supabase 環境（環境のみ・アプリ実装禁止）

**目的**: Phase 3 で即着手できる状態を作る。**create-next-app・スキーマ作成は実行しない**（Phase Gate。§1.3）。

**手順**:

1. OMS リポジトリに `docker/compose.yaml`（§3.4 の内容）と `docker/README.md` を追加（pr-flow）
2. `app` profile の枠検証: `docker compose -f docker/compose.yaml --profile app up -d app` → `docker compose -f docker/compose.yaml exec app node -v` が v22 系を返す → down。恒常起動はしない
3. Supabase CLI: 現行の公式手順に合わせ `npm install supabase --save-dev` でプロジェクトの開発依存へ固定する（2026-07-14 ユーザー承認）。リポジトリ直下で `npx supabase init`（`supabase/config.toml` が生成される。既存の空 `supabase/migrations/` はそのまま取り込まれる）
4. `npx supabase start` → 表示される API URL / DB URL / Studio URL を `docker/README.md` に記録 → `npx supabase stop`（常駐させない）
5. ポート衝突確認: Supabase 既定ポート（54321-54329）と web-stack / mock-web の衝突なしを確認

**受け入れ基準**: `npx supabase start` で全有効サービスが起動し Studio（http://localhost:54323）が開く / config.toml がコミットされ、`supabase/.temp` 等は .gitignore 済み / app profile の node -v 確認ログ。

**既知の分岐**:

| 事象 | 対応 |
|------|------|
| `npx supabase start` が Docker リソース不足で失敗 | Docker Desktop のメモリ割当をユーザーへ確認依頼（Settings > Resources） |
| ポート 54321 帯が使用中 | config.toml でポート変更（変更値を README へ記録） |
| Windowsでログ収集用VectorがDocker API 2375へ接続できず再起動 | Docker APIをTLSなしで公開せず、D-6に不要な `[analytics] enabled = false` を採用（2026-07-14 ユーザー承認） |

**ロールバック**: `npx supabase stop` + 追加ファイルの git revert。

**D-6 実績（2026-07-14 / Codex・完了）**:

- `docker/compose.yaml` に母艦では原則未使用の `mock-web` と、profile指定時だけ起動する `app` 枠を追加。`app` で Node.js v22.23.1 / npm 10.9.8 を確認後、コンテナを停止した。
- 現行のSupabase公式手順に合わせ、ユーザー承認のもとCLI 2.109.1をnpm開発依存へ固定。既存の空 `supabase/migrations/` を維持して `npx supabase init` を実行し、`supabase/config.toml` を生成した。
- 初回起動ではWindows上のログ収集用VectorがDocker API 2375へ接続できず再起動。TLSなしDocker APIは公開せず、D-6に不要で公式設定上も任意の `[analytics] enabled = false` をユーザー承認で採用した。
- 再起動後、全有効サービスに unhealthy / restarting なし。API / Studio / MailpitはHTTP 200、PostgreSQL `SELECT 1`、ChromeでStudio表示を確認。web-stackは80/3306で無影響。検証後 `npx supabase stop` を実行し、3000 / 54321〜54329の待受がないことを確認した。

### 4.8 D-7 ノート PC 再現手順書

**目的**: ノート PC（Windows + Docker Desktop）で OMS 開発環境を再現する手順を文書化する。**実機検証はユーザーが実施**（AI はドキュメント整備まで）。

**手順**: `docker/README.md` に以下を明記（D-6 で作成済みのファイルに追記）:

1. 前提: Docker Desktop（WSL2 バックエンド）/ Git / （Phase 3 以降）Supabase CLI・Node.js
2. セットアップ: `git clone <repo> C:\dev\order-management-system` → `cd docker` → `docker compose up -d`
3. 確認 URL: `http://localhost/order-management-system/docs/index.html`（**母艦と同一 URL** — localStorage 連携モック（`mock.oms.*`）も同一オリジンで動作。ただし localStorage の中身は端末ごとに独立＝母艦の入力状態は持ち運ばれない、と明記）
4. 制約: legacy PHP 群・MariaDB・worktree 配信は母艦のみ / Supabase は各端末で `supabase start`（データはローカル） / ポート 80 衝突時は compose の `ports` を `8080:80` にし URL を読み替え
5. web-stack 側 README には母艦の災害復旧手順（新 PC で web-stack clone → .env 作成 → migration-backup の dump を db-init へ → up）を明記

**受け入れ基準**: README 2 本（OMS `docker/README.md` / web-stack `README.md`）に上記が揃い、ユーザーがノート PC で手順どおり再現できたと確認（ユーザー実施・非同期でよい）。

---

## §5 検証マトリクス

### 5.1 D-1 完了時（:8080・XAMPP 並走）

| 項目 | コマンド / 操作 | 合格条件 |
|------|----------------|---------|
| コンテナ状態 | `docker compose ps` | web/db/pma すべて running |
| legacy 配信 | `curl -s -o NUL -w "%{http_code}" http://localhost:8080/<現役プロジェクト>/`（全件） | 2xx/3xx |
| OMS 配信 | 同 `http://localhost:8080/order-management-system/docs/index.html` | 200 |
| phpMyAdmin | ブラウザで `http://localhost:8080/phpmyadmin/` | ログイン画面 → root（空 pw）でログイン可 |
| DB 突合 | 各 DB で `SELECT COUNT(*)` を主要テーブル 2〜3 本（XAMPP 側と Docker 側で同値） | 完全一致 |
| PHP 拡張 | `docker compose exec web php -m` vs xampp-php-m.txt | legacy 使用拡張の欠落なし |

### 5.2 D-5 完了時（:80・全面切替後の回帰）

| 項目 | 合格条件 |
|------|---------|
| URL 互換表 §3.3 全行 | すべて移行前と同 URL で表示（現役 legacy 全トップ + DB 読み取りページ + OMS 主要 5 画面: order-book / weekly-schedule / screen-layout / quick-access / leave-application + master-management / account-settings） |
| OMS モックアップ実動 | ブラウザで order-book.html を開きコンソールエラー 0・localStorage 連携（OB⇄SL）動作 |
| worktree 配信 | `orca-wt.sh new claude smoke` → URL 200 → `drop` |
| ホスト DB 接続 | `mysql -h 127.0.0.1 -P 3306 -u root` 接続可 |
| OS 再起動耐性 | 再起動 → スタック自動復帰 → 上記 URL 再確認 |
| XAMPP 停止確認 | `Get-Service`・タスクマネージャで Apache/mysqld プロセスなし |

### 5.3 ドキュメント整合（各フェーズ共通）

- OMS リポジトリに触れた PR: pre-commit / CI `quality-gate` green（build-rules `--check` 含む）
- 本計画書の該当フェーズに「実績」追記済み / SHARED-MEMORY・HANDOFF 更新済み

---

## §6 未決事項・将来課題

| 項目 | 内容 | 時期 |
|------|------|------|
| MariaDB アップグレード | 10.4（EOL）→ 10.11 LTS 以降。dump/restore で移行・legacy 動作再検証が必要 | 移行安定後・別タスク |
| DB root パスワード導入 | 現状は XAMPP 互換で空 + 127.0.0.1 バインド。legacy 接続設定の一斉更新とセット | 同上 |
| legacy の git 化・バックアップ自動化 | legacy-htdocs は現状 git 管理外。NAS への定期バックアップ等 | ユーザー判断 |
| `C:\xampp` / `htdocs_MOVED-*` の削除 | 保持期間（目安 30 日）後にユーザー判断で削除 | D-5 + 30 日 |
| Next.js scaffold・Supabase スキーマ | Phase 3（「モックアップ完了」宣言後） | Phase 3 |
| Claude メモリのノート PC 同期 | ClaudeMemory は母艦の Obsidian Vault 統合。ノート側の扱いは未設計 | 必要になったら |

---

## 実績ログ（実装 AI が追記する）

> 形式: `YYYY-MM-DD / 担当 AI / フェーズ / 実施内容・選んだ分岐・乖離と対応（1〜3 行）`

- 2026-07-14 / Codex / D-0（実施中）/ 個別3DB・権限・設定・htdocs棚卸しを `C:\dev\migration-backup` へ保全。XAMPP `mysql` の複数 Aria システムテーブル破損により全DB dumpを物理バックアップへ代替（ユーザー承認）。残作業は WSL / Docker Desktop 導入後の `hello-world`。
- 2026-07-14 / Claude Code (Fable 5) / D-0（完了）/ WSL 2.7.10（`--no-distribution`）+ Docker Desktop 4.81.0（winget）をユーザー承認のもと導入代行し、再起動後に engine 起動・`hello-world` 成功を確認。乖離: 計画では導入=ユーザー操作としていたが、ユーザー明示依頼により AI 代行（UAC 承認・再起動はユーザー）へ変更。D-0 受け入れ基準クローズ。
- 2026-07-14 / Claude Code (Fable 5) / D-1（完了）/ web-stack 構築・:8080 で XAMPP 並走・§5.1 全合格。分岐: DB 突合は XAMPP 起動不可のため dump 基準へ代替 / phpMyAdmin は AllowNoPassword=true の config 追加で空 PW 互換化 / ftp 拡張は legacy 未使用で見送り。web-stack の GitHub リポジトリ作成は未（名称・可視性のユーザー確認待ち）。
- 2026-07-14 / Claude Code (Fable 5) / D-1 補・D-2（完了）/ web-stack を private リポジトリ `CrazyApple38/web-stack` として GitHub へ push（ユーザー承認）。D-2: 修正 2 ファイル（keibi-system/.env・ZNG database_local.php → `db`）+ `basarak28_zgu1` 再構築 + keibi-system の storage/framework 欠損補修。検証全合格（DB 読取 2 系統 + www-data 書込 3 箇所）。
- 2026-07-14 / Claude Code (Fable 5) / D-3（完了・旧dirリネームのみユーザー実施待ち）/ OMS を `C:\dev\order-management-system` へ複製・git 検証合格・Claude junction 再作成・settings/Codex config/orca 追従・rules を Docker 前提へ再生成・web-stack OMS_DIR 切替。分岐: robocopy `/COPYALL`→`/COPY:DAT`。CI 障害により PR は ruleset 一時無効化で手動マージ（ユーザー承認・D-4 でも CI 復旧まで同手順）。以後の作業は新パスで行うこと。D-4 以降は Codex 引き継ぎ。
- 2026-07-14 / Codex / D-4（完了）/ Windows junctionはDocker越しに解決不能（403）だったため既知の分岐を採用。orca workspacesルートをweb-stackへ直接read-onlyマウントし、ラッパーをjunctionなしのURL対応方式へ変更。実worktreeのnew/list・HTTP 200・drop/404まで合格。
