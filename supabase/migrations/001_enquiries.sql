-- Run in the Supabase SQL editor before enabling the form.
begin;
create table public.admin_members(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_members enable row level security;
create policy "Admins can see their own membership" on public.admin_members for select to authenticated using(user_id=auth.uid());
revoke all on public.admin_members from anon,authenticated;
grant select on public.admin_members to authenticated;

create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admin_members where user_id=(select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.enquiries(
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 submission_token uuid not null unique, payload_hash text not null,
 name text not null check(length(name) between 2 and 120), email text not null check(length(email)<=254),
 phone text not null default '' check(length(phone)<=40), institution text not null default '' check(length(institution)<=180),
 service text not null, message text not null check(length(message) between 20 and 5000), consent boolean not null check(consent),
 status text not null default 'new' check(status in ('new','contacted','closed')),
 email_status text not null default 'pending' check(email_status in ('pending','sending','sent','failed','unconfigured')),
 email_attempted_at timestamptz, email_sent_at timestamptz
);
create index enquiries_created_idx on public.enquiries(created_at desc);
create index enquiries_status_idx on public.enquiries(status,created_at desc);
alter table public.enquiries enable row level security;
create policy "Admins read enquiries" on public.enquiries for select to authenticated using(public.is_admin());
create policy "Admins update enquiries" on public.enquiries for update to authenticated using(public.is_admin()) with check(public.is_admin());
revoke all on public.enquiries from anon,authenticated;
grant select on public.enquiries to authenticated;
grant update(status) on public.enquiries to authenticated;

create table public.rate_limits(key text not null,bucket timestamptz not null,count integer not null,primary key(key,bucket));
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon,authenticated;

create function public.consume_rate_limit(p_key text,p_limit integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 delete from public.rate_limits where bucket<now()-interval '24 hours';
 insert into public.rate_limits(key,bucket,count) values(p_key,date_trunc('hour',now()),1)
 on conflict(key,bucket) do update set count=public.rate_limits.count+1 returning count into n;
 return n<=p_limit;
end; $$;
revoke all on function public.consume_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer) to service_role;

create function public.submit_enquiry(p_token uuid,p_payload jsonb,p_hash text,p_rate_key text,p_email_key text) returns jsonb language plpgsql security definer set search_path='' as $$
declare existing public.enquiries; new_id uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_token::text,0));
 select * into existing from public.enquiries where submission_token=p_token;
 if found then
  if existing.payload_hash<>p_hash then raise exception 'TOKEN_CONFLICT'; end if;
  return jsonb_build_object('id',existing.id,'duplicate',true);
 end if;
 if not public.consume_rate_limit(p_rate_key,5) or not public.consume_rate_limit(p_email_key,3) then raise exception 'RATE_LIMIT'; end if;
 insert into public.enquiries(submission_token,payload_hash,name,email,phone,institution,service,message,consent)
 values(p_token,p_hash,p_payload->>'name',p_payload->>'email',coalesce(p_payload->>'phone',''),coalesce(p_payload->>'institution',''),p_payload->>'service',p_payload->>'message',(p_payload->>'consent')::boolean) returning id into new_id;
 return jsonb_build_object('id',new_id,'duplicate',false);
end; $$;
revoke all on function public.submit_enquiry(uuid,jsonb,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_enquiry(uuid,jsonb,text,text,text) to service_role;

create function public.claim_enquiry_notification(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare updated_id uuid;
begin
 update public.enquiries set email_status='sending',email_attempted_at=now() where id=p_id and (email_status in ('pending','failed','unconfigured') or (email_status='sending' and email_attempted_at<now()-interval '5 minutes')) returning id into updated_id;
 return updated_id is not null;
end; $$;
revoke all on function public.claim_enquiry_notification(uuid) from public,anon,authenticated;
grant execute on function public.claim_enquiry_notification(uuid) to service_role;
commit;
