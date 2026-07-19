create table if not exists public.game_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  pull_history jsonb not null default '[]'::jsonb,
  save_version integer not null default 1,
  revision bigint not null default 1,
  updated_at timestamptz not null default timezone('utc', now()),
  last_device_id text,
  constraint game_saves_save_data_object check (jsonb_typeof(save_data) = 'object'),
  constraint game_saves_pull_history_array check (jsonb_typeof(pull_history) = 'array'),
  constraint game_saves_save_version_positive check (save_version > 0),
  constraint game_saves_revision_positive check (revision > 0),
  constraint game_saves_device_id_length check (last_device_id is null or char_length(last_device_id) between 1 and 128)
);

alter table public.game_saves enable row level security;

revoke all on table public.game_saves from anon;
revoke all on table public.game_saves from public;
grant select, insert, update, delete on table public.game_saves to authenticated;

drop policy if exists "select_own_game_save" on public.game_saves;
create policy "select_own_game_save"
on public.game_saves
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "insert_own_game_save" on public.game_saves;
create policy "insert_own_game_save"
on public.game_saves
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "update_own_game_save" on public.game_saves;
create policy "update_own_game_save"
on public.game_saves
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "delete_own_game_save" on public.game_saves;
create policy "delete_own_game_save"
on public.game_saves
for delete
to authenticated
using ((select auth.uid()) = user_id);
