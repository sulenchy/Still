-- Migration: Restructure memory media to support multiple attachments per memory
-- 1. Adds updated_at to memories and allows 'moment' kind
-- 2. Renames memory_assets to memory_media
-- 3. Drops the single-role unique constraint to allow multiple media files per memory
-- 4. Adds display_order and created_by to memory_media
-- 5. Updates triggers, RLS policies, and storage policies to point to memory_media

begin;

-- 1. Add updated_at to memories
alter table public.memories
  add column if not exists updated_at timestamptz not null default now();

-- 2. Expand kind check on memories
alter table public.memories
  drop constraint if exists memories_kind_check;

alter table public.memories
  add constraint memories_kind_check check (
    kind in ('photo', 'story', 'voice', 'video', 'moment')
  );

-- 3. Rename table memory_assets to memory_media
alter table public.memory_assets rename to memory_media;

alter table public.memory_media
  rename constraint memory_assets_pkey to memory_media_pkey;

alter table public.memory_media
  rename constraint memory_assets_memory_id_fkey to memory_media_memory_id_fkey;

alter table public.memory_media
  rename constraint memory_assets_role_check to memory_media_role_check;

alter table public.memory_media
  rename constraint memory_assets_bytes_check to memory_media_bytes_check;

alter table public.memory_media
  rename constraint memory_assets_mime_matches_role to memory_media_mime_matches_role;

alter table public.memory_media
  rename constraint memory_assets_duration_check to memory_media_duration_check;

alter table public.memory_media
  rename constraint memory_assets_storage_path_key to memory_media_storage_path_key;

-- 4. Drop the single-role unique constraint so multiple media items can belong to a memory
alter table public.memory_media
  drop constraint if exists memory_assets_role_key;

-- 5. Add display_order and created_by columns to memory_media
alter table public.memory_media
  add column if not exists display_order integer not null default 0,
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter index if exists public.memory_assets_memory_idx rename to memory_media_memory_idx;

create index if not exists memory_media_memory_order_idx
  on public.memory_media (memory_id, display_order, created_at);

-- 6. Trigger function for memory_media
create or replace function private.memory_media_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_archive uuid;
begin
  if new.alt is not null then
    new.alt := nullif(btrim(new.alt), '');
  end if;

  new.mime_type := lower(btrim(new.mime_type));

  if tg_op = 'INSERT' then
    select archive_id
    into owner_archive
    from public.memories
    where id = new.memory_id;

    if owner_archive is null then
      raise exception 'memory does not exist';
    end if;

    if new.id is null then
      new.id := gen_random_uuid();
    end if;

    new.storage_path := owner_archive::text || '/' || new.memory_id::text || '/' || new.id::text;
    return new;
  end if;

  if new.id is distinct from old.id
    or new.memory_id is distinct from old.memory_id
    or new.role is distinct from old.role
    or new.storage_path is distinct from old.storage_path then
    raise exception 'an asset path, memory, and role stay fixed';
  end if;

  return new;
end;
$$;

drop trigger if exists memory_assets_guard on public.memory_media;
create trigger memory_media_guard
  before insert or update on public.memory_media
  for each row execute function private.memory_media_guard();

drop trigger if exists memory_assets_delete_object on public.memory_media;
create trigger memory_media_delete_object
  after delete on public.memory_media
  for each row execute function private.delete_asset_object();

-- 7. RLS policies on memory_media
alter policy memory_assets_select on public.memory_media rename to memory_media_select;
alter policy memory_assets_insert on public.memory_media rename to memory_media_insert;
alter policy memory_assets_update on public.memory_media rename to memory_media_update;
alter policy memory_assets_delete on public.memory_media rename to memory_media_delete;

-- 8. Storage policies on storage.objects
drop policy if exists archive_media_select on storage.objects;
create policy archive_media_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_media media
      join public.memories memory on memory.id = media.memory_id
      where media.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  );

drop policy if exists archive_media_insert on storage.objects;
create policy archive_media_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_media media
      join public.memories memory on memory.id = media.memory_id
      where media.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  );

drop policy if exists archive_media_update on storage.objects;
create policy archive_media_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_media media
      join public.memories memory on memory.id = media.memory_id
      where media.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  )
  with check (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_media media
      join public.memories memory on memory.id = media.memory_id
      where media.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  );

-- 9. Grants
grant execute on function private.memory_media_guard() to authenticated, service_role;
grant select, insert, update, delete on table public.memory_media to authenticated;
grant select, insert, update, delete on table public.memory_media to service_role;

commit;
