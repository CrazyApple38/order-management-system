# OMS ローカル開発環境

このディレクトリは、Phase 3 で使用する Next.js / Supabase のローカル開発環境だけを準備します。現時点では Next.js アプリやデータベーススキーマを作成しません。

## 前提

- Docker Desktop（WSL 2 バックエンド）
- Node.js 20 以上（母艦では Node.js 22 を確認済み）
- ルートディレクトリで `npm ci` を実行済み

Supabase CLI はプロジェクトの `devDependencies` に固定しています。グローバルインストールは不要です。

## 静的モックアップ

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
