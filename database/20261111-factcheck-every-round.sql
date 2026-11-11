-- Fakt oder Fake: every round counts for the weekly quiz league (themed quizzes keep "first attempt per week",
-- Blitzrunde keeps "best result per week"). Run once in the Supabase SQL editor. Safe to run again.
begin;

create or replace function public.finalize_closed_quiz_leaderboards()
returns void language plpgsql security definer set search_path='' as $$
declare current_week date := date_trunc('week', timezone('Europe/Berlin', now()))::date;
begin
  with event_weeks as (
    select user_id, quiz_key, score, time_bonus, event_id, occurred_at,
      date_trunc('week', timezone('Europe/Berlin', occurred_at))::date as week_start
    from public.quiz_weekly_events
  ), first_per_quiz as (
    select distinct on (week_start, user_id, quiz_key) week_start, user_id, quiz_key, score, time_bonus, occurred_at as first_played_at
    from event_weeks
    where week_start < current_week and quiz_key <> 'Blitzrunde' and quiz_key not like 'Fakt oder Fake · %'
    order by week_start, user_id, quiz_key, occurred_at asc, event_id asc
  ), best_sprint as (
    select distinct on (week_start, user_id) week_start, user_id, quiz_key, score, time_bonus, occurred_at as first_played_at
    from event_weeks where week_start < current_week and quiz_key = 'Blitzrunde'
    order by week_start, user_id, (score + time_bonus) desc, occurred_at asc, event_id asc
  ), fact_rounds as (
    -- Fakt oder Fake: every round counts, not only the first attempt.
    select week_start, user_id, quiz_key, score, time_bonus, occurred_at as first_played_at
    from event_weeks where week_start < current_week and quiz_key like 'Fakt oder Fake · %'
  ), scored_rounds as (
    select * from first_per_quiz union all select * from best_sprint union all select * from fact_rounds
  ), totals as (
    select week_start, user_id, sum(score + time_bonus)::integer as points,
      count(*) filter (where score = 10)::integer as perfect_scores,
      min(first_played_at) as first_played_at
    from scored_rounds
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
      select user_id, quiz_key, score, time_bonus, event_id, occurred_at,
        date_trunc('week', timezone('Europe/Berlin', occurred_at))::date as week_start
      from public.quiz_weekly_events
    ), first_per_quiz as (
      select distinct on (user_id, quiz_key) user_id, quiz_key, score, time_bonus, occurred_at as first_played_at
      from event_weeks where week_start = current_week and quiz_key <> 'Blitzrunde' and quiz_key not like 'Fakt oder Fake · %'
      order by user_id, quiz_key, occurred_at asc, event_id asc
    ), best_sprint as (
      select distinct on (user_id) user_id, quiz_key, score, time_bonus, occurred_at as first_played_at
      from event_weeks where week_start = current_week and quiz_key = 'Blitzrunde'
      order by user_id, (score + time_bonus) desc, occurred_at asc, event_id asc
    ), fact_rounds as (
      -- Fakt oder Fake: every round counts, not only the first attempt.
      select user_id, quiz_key, score, time_bonus, occurred_at as first_played_at
      from event_weeks where week_start = current_week and quiz_key like 'Fakt oder Fake · %'
    ), scored_rounds as (
      select * from first_per_quiz union all select * from best_sprint union all select * from fact_rounds
    ), totals as (
      select user_id, sum(score + time_bonus)::integer as points,
        count(*) filter (where score = 10)::integer as perfect_scores,
        min(first_played_at) as first_played_at
      from scored_rounds group by user_id
    ), live_ranked as (
      select t.*, row_number() over (order by t.points desc, t.perfect_scores desc, t.first_played_at asc, t.user_id) as placement
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

revoke all on function public.finalize_closed_quiz_leaderboards(), public.get_quiz_leaderboard(integer) from public, anon;
grant execute on function public.get_quiz_leaderboard(integer) to anon, authenticated;
commit;
