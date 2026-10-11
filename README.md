# PaperCanvas

arXiv の論文をホワイトボードのようなキャンバスに並べ、AI（Gemini）が作る日本語の要約で素早く把握できる論文管理アプリです。

- arXiv の URL / ID を貼るだけで、タイトル・著者・概要を取得し、要点3つとタグを自動生成
- カードをドラッグして自由に配置、グループ枠や付箋メモで整理（配置は自動保存）
- 論文ごとの個人メモと PDF 添付
- 要約を公開ページとして共有（`/papers/<arXiv ID>`）
- ダークモード、タッチ操作対応

## 技術構成

| 役割 | 使っているもの |
| --- | --- |
| フロント/サーバー | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 |
| 認証・DB・ファイル | Supabase (Auth / Postgres + RLS / Storage) |
| AI 要約 | Google Gemini API (`@google/genai`) |
| ホスティング | Vercel |

### データの流れ

```
ブラウザ ──(RLS で自分の行だけ)──▶ Supabase      … メモ・グループ・配置の読み書き
   │
   └─▶ POST /api/papers ─▶ arXiv API ─▶ Gemini   … 論文の追加（secret key が必要な処理）
                          └─▶ arxiv_papers に保存（全ユーザー共通キャッシュ）
```

- 同じ論文は一度解析すれば `arxiv_papers` にキャッシュされ、他のユーザーが追加しても Gemini は呼ばれません。
- Gemini の呼び出しは 1 ユーザーあたり 24 時間で `ANALYSIS_DAILY_LIMIT` 回（既定 30）までに制限しています。

### ディレクトリ

```
app/
  page.tsx                 キャンバス（ログイン必須。サーバーで初期データを読み込む）
  login/                   ログイン・新規登録・パスワード再設定メール
  auth/callback/           確認メールなどのリンクの戻り先
  auth/reset-password/     新しいパスワードの設定
  papers/[...id]/          公開共有ページ
  privacy/                 プライバシーポリシー（雛形）
  api/papers/              論文の追加（arXiv + Gemini）
  api/account/             アカウント削除
components/                画面部品（CanvasApp.tsx がキャンバス本体）
lib/
  arxiv.ts                 arXiv ID の解析と API 呼び出し（テストあり）
  gemini.ts                Gemini による要約
  canvas-api.ts            ブラウザから Supabase への保存処理
  supabase/                Supabase クライアント（ブラウザ用・サーバー用・管理者用）
proxy.ts                   ログインセッションの更新（旧 middleware）
supabase/migrations/       DB スキーマ・RLS・Storage の定義
```

## ローカルで動かす

必要なもの: Node.js 22 以上、Docker（ローカル Supabase を使う場合）

```bash
npm install
```

### A. ローカルの Supabase を使う（おすすめ）

```bash
npx supabase start
```

起動すると URL と鍵が表示されるので、`.env.local` に設定します（`npx supabase status` で再表示できます）。

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` … `API URL`（通常 `http://127.0.0.1:54321`）
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` … `Publishable key`
- `SUPABASE_SECRET_KEY` … `Secret key`
- `GEMINI_API_KEY` … [Google AI Studio](https://aistudio.google.com/apikey) で発行

マイグレーションは `supabase start` 時に自動で適用されます。確認メールは http://127.0.0.1:54324 （Mailpit）で読めます。

### B. クラウドの Supabase を使う

本番と同じ手順（下記「Supabase の設定」）でプロジェクトを用意し、その URL と鍵を `.env.local` に書きます。

### 起動

```bash
npm run dev
```

http://localhost:3000 を開きます。

### チェック

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 本番リリース手順

### 1. Supabase の設定

1. https://supabase.com でプロジェクトを作成
2. スキーマを適用（どちらか）
   - CLI: `npx supabase login` → `npx supabase link --project-ref <プロジェクトID>` → `npx supabase db push`
   - 手動: ダッシュボードの **SQL Editor** に `supabase/migrations/20261011000000_init.sql` の中身を貼って実行
3. **Authentication > URL Configuration**
   - Site URL: `https://<本番ドメイン>`
   - Redirect URLs: `https://<本番ドメイン>/**`（プレビュー環境も使うなら `https://*-<vercelのチーム名>.vercel.app/**` も）
4. **Authentication > Sign In / Providers > Email**
   - 「Confirm email」を ON（確認メールを送る）
   - パスワードの最小文字数を 8 に
5. **Authentication > Emails > SMTP Settings**
   - Supabase 標準のメール送信は1時間あたりの送信数がごく少ないため、公開前に独自 SMTP（Resend、SendGrid など）を設定してください
6. **Project Settings > API Keys** から Publishable key と Secret key を控える

> 以前の開発で作った `papers` テーブルは使わなくなりました。不要なら削除して構いません。

### 2. Vercel にデプロイ

1. https://vercel.com で GitHub リポジトリをインポート
2. **Environment Variables** に `.env.example` の変数を設定
   - 必須: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` / `GEMINI_API_KEY`
   - 推奨: `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_CONTACT_EMAIL`
3. Deploy

### 3. 公開前チェックリスト

- [ ] 新規登録 → 確認メール → ログインできる
- [ ] パスワード再設定メールが届き、変更できる
- [ ] 論文を追加・移動・削除し、再読み込みしても残っている
- [ ] PDF を添付・表示・削除できる
- [ ] 共有リンクをログアウト状態で開ける
- [ ] 別アカウントでログインし、他人のデータが見えないこと
- [ ] `app/privacy/page.tsx` の内容を運用に合わせて修正した
- [ ] Gemini API の利用上限・課金アラートを Google Cloud 側で設定した

## 環境変数

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase の URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✓ | 公開してよい鍵（ブラウザで使用） |
| `SUPABASE_SECRET_KEY` | ✓ | サーバー専用の鍵。**絶対に公開しない** |
| `GEMINI_API_KEY` | ✓ | Gemini API キー |
| `GEMINI_MODEL` | | 使用モデル（既定 `gemini-3.7-flash`） |
| `ANALYSIS_DAILY_LIMIT` | | 1ユーザー/24時間の AI 解析回数上限（既定 30） |
| `NEXT_PUBLIC_SITE_URL` | | 本番 URL（OGP 用） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | | プライバシーポリシーの連絡先 |
