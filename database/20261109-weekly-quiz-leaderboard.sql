-- Weekly Quiz League. Participation is explicit; only opted-in display names are public.
begin;

create table if not exists public.quiz_leaderboard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  participates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_weekly_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null,
  quiz_key text not null check (char_length(quiz_key) between 1 and 120),
  score integer not null check (score between 0 and 10),
  occurred_at timestamptz not null default now(),
  primary key (user_id, event_id)
);
create index if not exists quiz_weekly_events_time_idx on public.quiz_weekly_events (occurred_at);

create table if not exists public.quiz_weekly_results (
  week_start date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  placement integer not null check (placement between 1 and 10),
  points integer not null check (points >= 0),
  perfect_scores integer not null check (perfect_scores >= 0),
  first_played_at timestamptz not null,
  primary key (week_start, user_id),
  unique (week_start, placement)
);

create table if not exists public.quiz_leaderboard_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  medal text not null check (medal in ('gold','silver','bronze')),
  awarded_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.quiz_leaderboard_preferences enable row level security;
alter table public.quiz_weekly_events enable row level security;
alter table public.quiz_weekly_results enable row level security;
alter table public.quiz_leaderboard_awards enable row level security;
revoke all on public.quiz_leaderboard_preferences, public.quiz_weekly_events, public.quiz_weekly_results, public.quiz_leaderboard_awards from anon, authenticated;
grant select on public.quiz_leaderboard_preferences to authenticated;
create policy "Members read their own leaderboard preference" on public.quiz_leaderboard_preferences for select to authenticated using (user_id = auth.uid());

create or replace function public.set_quiz_leaderboard_participation(enabled boolean)
returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  insert into public.quiz_leaderboard_preferences(user_id, participates, updated_at)
  values (owner_id, coalesce(enabled, false), now())
  on conflict (user_id) do update set participates = excluded.participates, updated_at = excluded.updated_at;
end;
$$;

create or replace function public.record_weekly_quiz_score(event uuid, quiz text, score integer)
returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if event is null or score is null or score < 0 or score > 10 or quiz is null
     or char_length(quiz) not between 1 and 120 or quiz !~ ' · (Leicht|Mittel|Schwer)$' then
    raise exception 'Invalid result';
  end if;
  if not exists (select 1 from public.quiz_leaderboard_preferences where user_id = owner_id and participates) then return; end if;
  insert into public.quiz_weekly_events(user_id, event_id, quiz_key, score)
  values (owner_id, event, quiz, score) on conflict do nothing;
end;
$$;

-- This is intentionally idempotent. It runs whenever the public board is read,
-- so a Monday board resets at midnight Berlin time without a separate cron secret.
create or replace function public.finalize_closed_quiz_leaderboards()
returns void language plpgsql security definer set search_path='' as $$
declare current_week date := date_trunc('week', timezone('Europe/Berlin', now()))::date;
begin
  with event_weeks as (
    select user_id, quiz_key, score, occurred_at,
      date_trunc('week', timezone('Europe/Berlin', occurred_at))::date as week_start
    from public.quiz_weekly_events
  ), best_per_quiz as (
    select week_start, user_id, quiz_key, max(score) as score, min(occurred_at) as first_played_at
    from event_weeks
    where week_start < current_week
    group by week_start, user_id, quiz_key
  ), totals as (
    select week_start, user_id, sum(score)::integer as points,
      count(*) filter (where score = 10)::integer as perfect_scores,
      min(first_played_at) as first_played_at
    from best_per_quiz
    group by week_start, user_id
  ), ranked as (
    select week_start, user_id, points, perfect_scores, first_played_at,
      row_number() over (partition by week_start order by points desc, perfect_scores desc, first_played_at asc, user_id) as placement
    from totals
  )
  insert into public.quiz_weekly_results(week_start, user_id, placement, points, perfect_scores, first_played_at)
  select week_start, user_id, placement, points, perfect_scores, first_played_at
  from ranked where placement <= 10
  on conflict (week_start, user_id) do nothing;

  insert into public.quiz_leaderboard_awards(user_id, week_start, medal)
  select user_id, week_start, case placement when 1 then 'gold' when 2 then 'silver' else 'bronze' end
  from public.quiz_weekly_results where placement <= 3
  on conflict (user_id, week_start) do nothing;
end;
$$;

create or replace function public.get_quiz_leaderboard(history_weeks integer default 12)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_week date := date_trunc('week', timezone('Europe/Berlin', now()))::date;
declare requested_history integer := greatest(1, least(coalesce(history_weeks, 12), 52));
begin
  perform public.finalize_closed_quiz_leaderboards();
  return (
    with event_weeks as (
      select user_id, quiz_key, score, occurred_at,
        date_trunc('week', timezone('Europe/Berlin', occurred_at))::date as week_start
      from public.quiz_weekly_events
    ), best_per_quiz as (
      select user_id, quiz_key, max(score) as score, min(occurred_at) as first_played_at
      from event_weeks where week_start = current_week
      group by user_id, quiz_key
    ), totals as (
      select user_id, sum(score)::integer as points,
        count(*) filter (where score = 10)::integer as perfect_scores,
        min(first_played_at) as first_played_at
      from best_per_quiz group by user_id
    ), live_ranked as (
      select t.*, row_number() over (order by points desc, perfect_scores desc, first_played_at asc, user_id) as placement
      from totals t join public.quiz_leaderboard_preferences pref on pref.user_id=t.user_id and pref.participates
    ), history as (
      select r.week_start, r.placement, r.points, r.perfect_scores, p.display_name
      from public.quiz_weekly_results r
      join public.quiz_leaderboard_preferences pref on pref.user_id=r.user_id and pref.participates
      join public.profiles p on p.id=r.user_id
      where r.week_start < current_week
      order by r.week_start desc, r.placement asc
    ), medals as (
      select medal, count(*)::integer as total from public.quiz_leaderboard_awards
      where user_id=auth.uid() group by medal
    )
    select jsonb_build_object(
      'week_start', current_week,
      'leaders', coalesce((select jsonb_agg(jsonb_build_object('placement',l.placement,'name',p.display_name,'points',l.points,'perfect_scores',l.perfect_scores) order by l.placement)
        from live_ranked l join public.profiles p on p.id=l.user_id), '[]'::jsonb),
      'history', coalesce((select jsonb_agg(jsonb_build_object('week_start',week_start,'placement',placement,'name',display_name,'points',points,'perfect_scores',perfect_scores) order by week_start desc, placement asc)
        from history), '[]'::jsonb),
      'viewer_participates', exists(select 1 from public.quiz_leaderboard_preferences where user_id=auth.uid() and participates),
      'viewer_medals', coalesce((select jsonb_object_agg(medal,total) from medals), '{}'::jsonb)
    )
  );
end;
$$;

revoke all on function public.set_quiz_leaderboard_participation(boolean), public.record_weekly_quiz_score(uuid,text,integer), public.finalize_closed_quiz_leaderboards(), public.get_quiz_leaderboard(integer) from public, anon;
grant execute on function public.set_quiz_leaderboard_participation(boolean), public.record_weekly_quiz_score(uuid,text,integer) to authenticated;
grant execute on function public.get_quiz_leaderboard(integer) to anon, authenticated;
commit;
