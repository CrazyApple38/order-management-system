# OMS ローカル開発環境

このディレクトリは、Phase 3 で使用する Next.js / Supabase のローカル開発環境だけを準備します。現時点では Next.js アプリやデータベーススキーマを作成しません。

## 前提

- Docker Desktop（WSL 2 バックエンド）
- Git
- GitHub から本リポジトリをcloneできる認証設定

静的モックアップの確認だけなら、Node.jsとSupabaseは不要です。Phase 3以降の開発ではNode.js 20以上（推奨22）を用意し、リポジトリのルートで `npm ci` を実行します。Supabase CLIはプロジェクトの `devDependencies` に固定しているため、グローバルインストールは不要です。

## ノートPCでの再現

PowerShellで次を実行します。

```powershell
New-Item -ItemType Directory -Force C:\dev | Out-Null
git clone git@github.com:CrazyApple38/order-management-system.git C:\dev\order-management-system
Set-Location C:\dev\order-management-system
docker compose -f docker/compose.yaml up -d mock-web
```

ブラウザで次を開きます。

- OMS: http://localhost/order-management-system/docs/index.html

母艦と同じURL・同じオリジンで配信するため、受注簿などの `mock.oms.*` localStorage連携も同じ条件で動作します。ただし、localStorageの中身は端末ごとに独立しています。母艦で入力したモックデータはノートPCへ自動では移りません。

確認後の停止:

```powershell
docker compose -f docker/compose.yaml down
```

### ポート80が使用中の場合

`docker/compose.yaml` の `mock-web` にあるポート指定を `"8080:80"` に変更し、再度起動します。この場合はURLも次のように読み替えます。

- http://localhost:8080/order-management-system/docs/index.html

### ノートPC環境の制約

- legacy PHP群、MariaDB、phpMyAdmin、orca worktree配信は母艦の `C:\dev\web-stack` 専用で、ノートPCには展開しません。
- Supabaseは端末ごとにローカル起動します。データも端末ごとのDocker volumeに保存され、母艦とは同期されません。
- 現在は環境準備までです。Next.jsアプリ作成とSupabaseスキーマ作成は「モックアップ完了」宣言後のPhase 3で行います。

## 母艦での静的モックアップ

母艦では `C:\dev\web-stack` が同じURLをポート80で配信しているため、通常はこのサービスを起動しません。web-stack を使わない端末だけで起動します。

```powershell
docker compose -f docker/compose.yaml up -d mock-web
```

- OMS: http://localhost/order-management-system/docs/index.html

停止:

```powershell
docker compose -f docker/compose.yaml down
```

## Node.js 22 枠

`app` は Phase 3 用の枠で、profileを指定したときだけ起動します。現時点では動作確認後に停止し、常駐させません。

```powershell
docker compose -f docker/compose.yaml --profile app up -d app
docker compose -f docker/compose.yaml exec app node -v
docker compose -f docker/compose.yaml --profile app down
```

## Supabase

初期設定は `supabase/config.toml` にコミットされています。ローカルサービスを起動するときだけ次を実行します。

```powershell
npx supabase start
```

主要URL:

- API: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio: http://127.0.0.1:54323
- Mailpit: http://127.0.0.1:54324

停止（データは保持）:

```powershell
npx supabase stop
```

`supabase start` の主要サービスは 54321〜54329 番台を使用します。設定上はshadow DB用の54320とEdge Runtime inspector用の8083も予約されています。母艦の web-stack（80 / 3306）とは競合しません。

Windows版Docker DesktopでTLSなしのDocker API（2375）を公開しないため、ローカルのLogs & Analyticsは無効にしています。API・Database・Auth・Storage・Realtime・Studioなど、アプリ開発に必要なサービスは起動します。

ローカルサービスは開発用の共通キーを使用し、起動中はホストのネットワークインターフェースで待ち受けます。信頼できないネットワークでは起動せず、作業後は必ず停止してください。

## D-6 検証実績（2026-07-14）

- Supabase CLI: 2.109.1
- `app` profile: Node.js v22.23.1 / npm 10.9.8
- API / Studio / Mailpit: HTTP 200
- Database: `SELECT 1` 成功
- 検証後に `app` profileとSupabaseを停止し、3000 / 54321〜54329の待受がないことを確認
