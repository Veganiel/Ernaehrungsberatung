-- Daniel Suckrow Website: Community-Funktionen (Supabase / PostgreSQL)
-- Im Supabase SQL Editor ausführen. RLS ist für alle öffentlichen Tabellen aktiviert.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Mitglied',
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  opted_in boolean not null default false,
  consent_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  article_slug text not null,
  content text not null check (char_length(content) between 2 and 3000),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Anonym' check (char_length(author_name) between 1 and 60),
  avatar_url text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id bigint generated always as identity primary key,
  article_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(article_slug, user_id)
);

alter table public.profiles enable row level security;
alter table public.newsletter_subscriptions enable row level security;

drop policy if exists "Users read own newsletter preference" on public.newsletter_subscriptions;
create policy "Users read own newsletter preference" on public.newsletter_subscriptions for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users insert own newsletter preference" on public.newsletter_subscriptions;
create policy "Users insert own newsletter preference" on public.newsletter_subscriptions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own newsletter preference" on public.newsletter_subscriptions;
create policy "Users update own newsletter preference" on public.newsletter_subscriptions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- Profiles: öffentliche Anzeige von Name/Avatar; Nutzer ändern nur eigenes Profil.
drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable" on public.profiles for select using (true);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Kommentare: freigegebene Kommentare sind öffentlich sichtbar. Neue Kommentare bleiben bis zur Moderation unsichtbar.
drop policy if exists "Read approved comments" on public.comments;
create policy "Read approved comments" on public.comments for select using (is_approved = true or author_id = auth.uid());
drop policy if exists "Anyone can submit comments" on public.comments;
create policy "Anyone can submit comments" on public.comments for insert to anon, authenticated with check (
  char_length(content) between 2 and 3000 and
  char_length(author_name) between 1 and 60 and
  (author_id is null or author_id = auth.uid()) and
  (author_id is null or author_name <> 'Anonym')
);
drop policy if exists "Authors can delete own comments" on public.comments;
create policy "Authors can delete own comments" on public.comments for delete to authenticated using (author_id = auth.uid());

-- Likes: nur eingeloggte Nutzer; pro Artikel maximal ein Like je Konto.
drop policy if exists "Likes are publicly readable" on public.likes;
create policy "Likes are publicly readable" on public.likes for select using (true);
drop policy if exists "Users can like as themselves" on public.likes;
create policy "Users can like as themselves" on public.likes for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can remove own likes" on public.likes;
create policy "Users can remove own likes" on public.likes for delete to authenticated using (auth.uid() = user_id);

-- Beim Signup werden Profil und optionale Newsletter-Einwilligung angelegt.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1), 'Mitglied'))
  on conflict (id) do nothing;
  if coalesce((new.raw_user_meta_data->>'newsletter_opt_in')::boolean, false) then
    insert into public.newsletter_subscriptions (user_id, opted_in, consent_at)
    values (new.id, true, now())
    on conflict (user_id) do update set opted_in=true, consent_at=now(), updated_at=now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Avatar-Speicher: Bucket einmalig anlegen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Newsletter consent is stored separately and is visible only to the account owner. Connect a newsletter provider separately
-- before sending emails; this schema alone does not send newsletters.
