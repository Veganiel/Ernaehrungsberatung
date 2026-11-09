-- Add the time-based bonus for the weekly quiz league on existing installations.
begin;
alter table public.quiz_weekly_events add column if not exists time_bonus integer not null default 0 check (time_bonus between 0 and 75);
create or replace function public.record_weekly_quiz_score(event uuid, quiz text, score integer, time_bonus integer)
returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if event is null or score is null or score < 0 or score > 10 or time_bonus is null or time_bonus < 0 or time_bonus > 75 or quiz is null or char_length(quiz) not between 1 and 120 or (quiz <> 'Blitzrunde' and quiz !~ ' · (Leicht|Mittel|Schwer)$') then raise exception 'Invalid result'; end if;
  if not exists (select 1 from public.quiz_leaderboard_preferences where user_id=owner_id and participates) then return; end if;
  insert into public.quiz_weekly_events(user_id,event_id,quiz_key,score,time_bonus) values(owner_id,event,quiz,score,time_bonus) on conflict do nothing;
end;
$$;
revoke all on function public.record_weekly_quiz_score(uuid,text,integer,integer) from public,anon;
grant execute on function public.record_weekly_quiz_score(uuid,text,integer,integer) to authenticated;
commit;
