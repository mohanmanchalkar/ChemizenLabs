begin;
create table public.reviews (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 submission_token uuid not null unique, payload_hash text not null,
 name text not null check(length(trim(name)) between 2 and 80),
 rating integer not null check(rating between 1 and 5),
 text text not null check(length(trim(text)) between 20 and 2000),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 helpful_count integer not null default 0 check(helpful_count>=0)
);
create index reviews_status_created_idx on public.reviews(status,created_at desc);
alter table public.reviews enable row level security;
revoke all on public.reviews from anon,authenticated;
grant select(id,name,rating,text,created_at,helpful_count,status) on public.reviews to anon,authenticated;
grant update(status) on public.reviews to authenticated;
create policy "Published reviews are public" on public.reviews for select to anon,authenticated using(status='approved');
create policy "Admins read all reviews" on public.reviews for select to authenticated using(public.is_admin());
create policy "Admins moderate reviews" on public.reviews for update to authenticated using(public.is_admin()) with check(public.is_admin());
create function public.submit_review(p_token uuid,p_name text,p_rating integer,p_text text,p_hash text,p_rate_key text) returns jsonb language plpgsql security definer set search_path='' as $$
declare existing public.reviews; new_id uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_token::text,0));
 select * into existing from public.reviews where submission_token=p_token;
 if found then
  if existing.payload_hash<>p_hash then raise exception 'TOKEN_CONFLICT'; end if;
  return jsonb_build_object('id',existing.id,'duplicate',true);
 end if;
 if not public.consume_rate_limit(p_rate_key,3) then raise exception 'RATE_LIMIT'; end if;
 insert into public.reviews(submission_token,payload_hash,name,rating,text)
 values(p_token,p_hash,p_name,p_rating,p_text) returning id into new_id;
 return jsonb_build_object('id',new_id,'duplicate',false);
end; $$;
revoke all on function public.submit_review(uuid,text,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_review(uuid,text,integer,text,text,text) to service_role;
grant all on public.reviews to service_role;
create table public.review_helpful_votes (
 review_id uuid not null references public.reviews(id) on delete cascade,
 voter_hash text not null, primary key(review_id,voter_hash)
);
alter table public.review_helpful_votes enable row level security;
revoke all on public.review_helpful_votes from public,anon,authenticated;
grant all on public.review_helpful_votes to service_role;
create function public.set_review_helpful(p_id uuid,p_voter text,p_liked boolean,p_rate_key text) returns jsonb language plpgsql security definer set search_path='' as $$
declare n integer; changed integer;
begin
 select helpful_count into n from public.reviews where id=p_id and status='approved' for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if not public.consume_rate_limit(p_rate_key,30) then raise exception 'RATE_LIMIT'; end if;
 if p_liked then
  insert into public.review_helpful_votes(review_id,voter_hash) values(p_id,p_voter) on conflict do nothing;
  get diagnostics changed=row_count;
  n:=n+changed;
 else
  delete from public.review_helpful_votes where review_id=p_id and voter_hash=p_voter;
  get diagnostics changed=row_count;
  n:=n-changed;
 end if;
 update public.reviews set helpful_count=n where id=p_id;
 return jsonb_build_object('liked',p_liked,'count',n);
end; $$;
revoke all on function public.set_review_helpful(uuid,text,boolean,text) from public,anon,authenticated;
grant execute on function public.set_review_helpful(uuid,text,boolean,text) to service_role;
commit;
