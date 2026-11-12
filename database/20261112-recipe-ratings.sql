-- Rezeptbewertungen (1–5 Sterne) für veganiel.com/rezepte
-- Im Supabase SQL Editor ausführen. Bewerten nur mit Konto, je Konto und Rezept eine Bewertung.

create table if not exists public.recipe_ratings (
  recipe_slug text not null check (recipe_slug ~ '^[a-z0-9-]{1,80}$'),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (recipe_slug, user_id)
);

alter table public.recipe_ratings enable row level security;

drop policy if exists "Members read own recipe ratings" on public.recipe_ratings;
create policy "Members read own recipe ratings" on public.recipe_ratings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Members insert own recipe ratings" on public.recipe_ratings;
create policy "Members insert own recipe ratings" on public.recipe_ratings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Members update own recipe ratings" on public.recipe_ratings;
create policy "Members update own recipe ratings" on public.recipe_ratings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Members delete own recipe ratings" on public.recipe_ratings;
create policy "Members delete own recipe ratings" on public.recipe_ratings for delete to authenticated using (auth.uid() = user_id);

-- Öffentliche Zusammenfassung (Durchschnitt + Anzahl), ohne einzelne Nutzer offenzulegen.
create or replace function public.recipe_rating_summary(slug text)
returns table (average numeric, total integer)
language sql stable security definer set search_path = public as $$
  select round(avg(stars)::numeric, 1), count(*)::integer from public.recipe_ratings where recipe_slug = slug;
$$;
revoke all on function public.recipe_rating_summary(text) from public;
grant execute on function public.recipe_rating_summary(text) to anon, authenticated;
