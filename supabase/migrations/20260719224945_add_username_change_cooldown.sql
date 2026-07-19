alter table public.player_profiles
  add column username_changed_at timestamptz;

create function private.change_username_candidate(candidate text)
returns public.player_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  current_profile public.player_profiles;
  changed_profile public.player_profiles;
  changed_at timestamptz := timezone('utc', now());
begin
  if caller_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication_required';
  end if;

  if candidate is null
    or not (
      candidate = btrim(candidate)
      and candidate ~ '^[A-Za-z0-9_]{3,20}$'
    ) then
    raise exception using
      errcode = '22023',
      message = 'invalid_username';
  end if;

  select profile.*
  into current_profile
  from public.player_profiles as profile
  where profile.user_id = caller_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'profile_missing';
  end if;

  if lower(candidate) = lower(current_profile.username) then
    raise exception using
      errcode = '22023',
      message = 'username_unchanged';
  end if;

  if current_profile.username_changed_at is not null
    and current_profile.username_changed_at + interval '24 hours' > changed_at then
    raise exception using
      errcode = 'P0001',
      message = 'username_change_cooldown',
      detail = (current_profile.username_changed_at + interval '24 hours')::text;
  end if;

  begin
    update public.player_profiles
    set
      username = candidate,
      username_changed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where user_id = caller_id
    returning * into changed_profile;
  exception
    when unique_violation then
      raise exception using
        errcode = '23505',
        message = 'username_taken';
  end;

  return changed_profile;
end;
$$;

revoke all on function private.change_username_candidate(text) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.change_username_candidate(text) to authenticated;

create function public.change_username(candidate text)
returns public.player_profiles
language sql
security invoker
set search_path = ''
as $$
  select private.change_username_candidate(candidate);
$$;

revoke all on function public.change_username(text) from public, anon;
grant execute on function public.change_username(text) to authenticated;
