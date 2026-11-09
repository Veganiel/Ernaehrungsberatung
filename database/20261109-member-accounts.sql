-- Additive migration. Public blog profiles never contain private contact information.
begin;
create table if not exists public.member_details (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '' check (char_length(full_name)<=120),
 address_line text not null default '' check (char_length(address_line)<=160),
 postal_code text not null default '' check (char_length(postal_code)<=20),
 city text not null default '' check (char_length(city)<=100),
 country text not null default '' check (char_length(country)<=80),
 updated_at timestamptz not null default now()
);
alter table public.member_details enable row level security;
revoke all on public.member_details from anon, authenticated;
grant select, insert, update, delete on public.member_details to authenticated;
create policy "Members read their own details" on public.member_details for select to authenticated using(user_id=auth.uid());
create policy "Members insert their own details" on public.member_details for insert to authenticated with check(user_id=auth.uid());
create policy "Members update their own details" on public.member_details for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Members delete their own details" on public.member_details for delete to authenticated using(user_id=auth.uid());
create table if not exists public.quiz_results (
 user_id uuid not null references auth.users(id) on delete cascade,
 quiz_key text not null check(char_length(quiz_key) between 1 and 120),
 best integer not null check(best between 0 and 10),
 attempts integer not null default 1 check(attempts>0),
 primary key(user_id,quiz_key)
);
create table if not exists public.quiz_result_events (
 user_id uuid not null references auth.users(id) on delete cascade,
 event_id uuid not null,
 primary key(user_id,event_id)
);
alter table public.quiz_results enable row level security;
alter table public.quiz_result_events enable row level security;
revoke all on public.quiz_results,public.quiz_result_events from anon,authenticated;
grant select on public.quiz_results to authenticated;
create policy "Members read their own quiz results" on public.quiz_results for select to authenticated using(user_id=auth.uid());
-- Idempotent event ids prevent retries after connection errors counting twice.
create or replace function public.record_quiz_result(event uuid,quiz text,score integer)
returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); inserted_count integer;
begin
 if owner_id is null then raise exception 'Authentication required'; end if;
 if score is null or score<0 or score>10 or quiz is null or char_length(quiz) not between 1 and 120 or event is null then raise exception 'Invalid result';end if;
 insert into public.quiz_result_events(user_id,event_id) values(owner_id,event) on conflict do nothing;
 get diagnostics inserted_count=row_count;
 if inserted_count=0 then return;end if;
 insert into public.quiz_results(user_id,quiz_key,best,attempts) values(owner_id,quiz,score,1)
 on conflict(user_id,quiz_key) do update set best=greatest(public.quiz_results.best,excluded.best),attempts=public.quiz_results.attempts+1;
end;$$;
revoke all on function public.record_quiz_result(uuid,text,integer) from public, anon;
grant execute on function public.record_quiz_result(uuid,text,integer) to authenticated;
create or replace function public.clear_quiz_results()
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 delete from public.quiz_results where user_id=auth.uid();
 -- Keep event IDs so a stale offline retry cannot recreate cleared results.
end;$$;
revoke all on function public.clear_quiz_results() from public, anon;
grant execute on function public.clear_quiz_results() to authenticated;
commit;
