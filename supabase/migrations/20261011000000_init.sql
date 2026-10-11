-- =====================================================================
-- PaperCanvas 初期スキーマ
--
-- 設計の考え方:
--   * arxiv_papers  … arXiv のメタデータ + Gemini の要約。全ユーザー共通の「キャッシュ」。
--                     同じ論文を誰かが一度解析すれば、次の人は Gemini を呼ばずに済む。
--                     書き込みはサーバー(secret key)だけが行う。
--   * user_papers   … 「どのユーザーが、どの論文を、キャンバスのどこに置いたか」。
--                     色・個人メモ・添付PDFもここに持つ。
--   * memos/groups  … キャンバス上の付箋とグループ枠。
--   * analysis_events … Gemini を呼んだ記録。1日あたりの回数制限に使う。
--
-- RLS (Row Level Security) について:
--   ブラウザから Supabase に直接アクセスさせるため、「自分の行しか読めない/書けない」
--   というルールを DB 側で強制する。auth.uid() はリクエストしてきたユーザーのID。
--   アプリのコードにバグがあっても、他人のデータは DB が返さない、というのが安全性の要。
-- =====================================================================

-- ---------------------------------------------------------------------
-- arxiv_papers
-- ---------------------------------------------------------------------
create table public.arxiv_papers (
  id          text primary key,              -- arXiv ID (例: 1706.03762, cs/0601001)
  title       text not null,
  authors     text[] not null default '{}',
  year        int  not null,
  abstract    text not null,
  bullets     text[] not null default '{}',  -- AI要約
  tags        text[] not null default '{}',
  url         text not null,
  created_at  timestamptz not null default now()
);

alter table public.arxiv_papers enable row level security;

-- 論文情報は公開データなので、未ログインでも読める（共有ページで使う）。
-- insert/update/delete のポリシーは作らない = secret key 以外からは書き込めない。
create policy "arxiv_papers are readable by everyone"
  on public.arxiv_papers for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------
-- user_papers
-- ---------------------------------------------------------------------
create table public.user_papers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  arxiv_id    text not null references public.arxiv_papers (id),
  x           double precision not null default 100,
  y           double precision not null default 100,
  color       text not null default 'sky'
              check (color in ('sky', 'indigo', 'emerald', 'violet', 'rose', 'amber')),
  note        text not null default '',
  pdf_path    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, arxiv_id)
);

create index user_papers_user_id_idx on public.user_papers (user_id);

alter table public.user_papers enable row level security;

create policy "users manage their own papers"
  on public.user_papers for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- memos
-- ---------------------------------------------------------------------
create table public.memos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null default '' check (char_length(text) <= 5000),
  x           double precision not null,
  y           double precision not null,
  color       text not null default 'yellow'
              check (color in ('yellow', 'pink', 'blue', 'green', 'purple')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index memos_user_id_idx on public.memos (user_id);

alter table public.memos enable row level security;

create policy "users manage their own memos"
  on public.memos for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------
create table public.groups (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label         text not null check (char_length(label) between 1 and 100),
  x             double precision not null,
  y             double precision not null,
  width         double precision not null check (width >= 120),
  height        double precision not null check (height >= 120),
  bg_color      text not null,
  border_color  text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index groups_user_id_idx on public.groups (user_id);

alter table public.groups enable row level security;

create policy "users manage their own groups"
  on public.groups for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- updated_at を自動更新するトリガー
-- ---------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_papers_updated_at before update on public.user_papers
  for each row execute function public.set_updated_at();
create trigger memos_updated_at before update on public.memos
  for each row execute function public.set_updated_at();
create trigger groups_updated_at before update on public.groups
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- analysis_events (Gemini 呼び出しのレート制限用)
-- ---------------------------------------------------------------------
create table public.analysis_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index analysis_events_user_created_idx
  on public.analysis_events (user_id, created_at desc);

-- RLS を有効にしてポリシーを作らない = サーバー(secret key)専用テーブル
alter table public.analysis_events enable row level security;

-- ---------------------------------------------------------------------
-- Storage: PDF 添付用の非公開バケット
--   パスは "<user_id>/<user_paper_id>.pdf"。先頭フォルダが自分のIDのものだけ操作可能。
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pdfs', 'pdfs', false, 20971520, array['application/pdf']);

create policy "users read their own pdfs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "users upload their own pdfs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "users update their own pdfs"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "users delete their own pdfs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);
