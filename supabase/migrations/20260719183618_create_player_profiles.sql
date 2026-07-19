create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.player_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  public_id text not null default (
    'AETH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint player_profiles_username_format_check
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  constraint player_profiles_public_id_format_check
    check (public_id ~ '^AETH-[A-F0-9]{12}$'),
  constraint player_profiles_public_id_key unique (public_id)
);

create unique index player_profiles_username_lower_key
  on public.player_profiles (lower(username));

insert into public.player_profiles (user_id, username)
select
  id,
  'Legacy_' || substr(replace(id::text, '-', ''), 1, 13)
from auth.users
on conflict (user_id) do nothing;

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := btrim(new.raw_user_meta_data ->> 'username');
begin
  if requested_username is null or requested_username !~ '^[A-Za-z0-9_]{3,20}$' then
    raise exception using
      errcode = '22023',
      message = 'invalid_username';
  end if;

  insert into public.player_profiles (user_id, username)
  values (new.id, requested_username);

  return new;
exception
  when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'username_taken';
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_player_profile
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create function private.is_username_available_candidate(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate = btrim(candidate)
    and candidate ~ '^[A-Za-z0-9_]{3,20}$'
    and not exists (
      select 1
      from public.player_profiles
      where lower(username) = lower(candidate)
    );
$$;

revoke all on function private.is_username_available_candidate(text) from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_username_available_candidate(text) to anon, authenticated;

create function public.is_username_available(candidate text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_username_available_candidate(candidate);
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

alter table public.player_profiles enable row level security;

revoke all on table public.player_profiles from anon, authenticated;
grant select on table public.player_profiles to authenticated;

create policy "select_own_player_profile"
  on public.player_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
