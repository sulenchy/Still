-- One archive per auth user. People, memories, and capsules belong to that archive.
-- Files live in the private archive-media bucket at {archive_id}/{memory_id}/{asset_id}.

begin;

create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role, supabase_auth_admin;

create or replace function private.owns_archive(target uuid)
returns boolean
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  return exists (
    select 1
    from public.archives
    where id = target
      and owner_id = auth.uid()
  );
end;
$$;

create or replace function private.object_archive_id(object_name text)
returns uuid
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  folder text;
begin
  folder := (storage.foldername(object_name))[1];

  if folder is null
    or folder !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;

  return folder::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.archives (owner_id)
  values (new.id)
  on conflict (owner_id) do nothing;

  return new;
end;
$$;

create or replace function private.profiles_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.id is distinct from old.id then
    raise exception 'profile id cannot change';
  end if;

  if new.display_name is not null then
    new.display_name := nullif(btrim(new.display_name), '');
  end if;

  return new;
end;
$$;

create or replace function private.people_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));

  if char_length(new.name) = 0 then
    raise exception 'name is required';
  end if;

  if new.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'email must look like an email address';
  end if;

  if tg_op = 'UPDATE' and new.archive_id is distinct from old.archive_id then
    raise exception 'a person cannot move archives';
  end if;

  return new;
end;
$$;

create or replace function private.memories_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.story := btrim(new.story);

  if new.place is not null then
    new.place := nullif(btrim(new.place), '');
  end if;

  if new.voice_speaker is not null then
    new.voice_speaker := nullif(btrim(new.voice_speaker), '');
  end if;

  if new.voice_transcript is not null then
    new.voice_transcript := nullif(btrim(new.voice_transcript), '');
  end if;

  if char_length(new.title) = 0 or char_length(new.story) = 0 then
    raise exception 'title and story are required';
  end if;

  if tg_op = 'UPDATE' and new.archive_id is distinct from old.archive_id then
    raise exception 'a memory cannot move archives';
  end if;

  if tg_op = 'UPDATE' and new.created_by is distinct from old.created_by then
    raise exception 'created_by cannot change';
  end if;

  return new;
end;
$$;

create or replace function private.capsules_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.message := btrim(new.message);
  new.signature := btrim(new.signature);

  if char_length(new.title) = 0
    or char_length(new.message) = 0
    or char_length(new.signature) = 0 then
    raise exception 'title, message, and signature are required';
  end if;

  if tg_op = 'UPDATE' and (
    new.archive_id is distinct from old.archive_id
    or new.created_by is distinct from old.created_by
    or new.recipient_id is distinct from old.recipient_id
  ) then
    raise exception 'archive, author, and recipient stay fixed';
  end if;

  if tg_op = 'UPDATE' and old.sealed_at is not null and (
    new.title is distinct from old.title
    or new.message is distinct from old.message
    or new.signature is distinct from old.signature
    or new.opens_on is distinct from old.opens_on
    or new.sealed_at is distinct from old.sealed_at
  ) then
    raise exception 'a sealed capsule stays as it was sealed';
  end if;

  return new;
end;
$$;

create or replace function private.memory_assets_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, extensions
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

create or replace function private.memory_people_same_archive()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.memories memory
    join public.people person on person.id = new.person_id
    where memory.id = new.memory_id
      and memory.archive_id = person.archive_id
  ) then
    raise exception 'memory and person must belong to the same archive';
  end if;

  return new;
end;
$$;

-- Seal only after capsule_memories rows exist. Membership is fixed once sealed_at is set.
create or replace function private.capsule_memories_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  capsule_archive uuid;
  capsule_sealed timestamptz;
  memory_archive uuid;
  capsule_key uuid;
begin
  capsule_key := case
    when tg_op = 'DELETE' then old.capsule_id
    else new.capsule_id
  end;

  select archive_id, sealed_at
  into capsule_archive, capsule_sealed
  from public.capsules
  where id = capsule_key;

  if capsule_sealed is not null then
    raise exception 'a sealed capsule keeps the memories it was sealed with';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  select archive_id
  into memory_archive
  from public.memories
  where id = new.memory_id;

  if capsule_archive is null
    or memory_archive is null
    or capsule_archive <> memory_archive then
    raise exception 'capsule and memory must belong to the same archive';
  end if;

  return new;
end;
$$;

create or replace function private.delete_asset_object()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects
  where bucket_id = 'archive-media'
    and name = old.storage_path;

  return old;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank check (
    display_name is null or char_length(display_name) > 0
  )
);

create table public.archives (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint archives_id_owner_key unique (id, owner_id)
);

create table public.people (
  id uuid primary key default extensions.gen_random_uuid(),
  archive_id uuid not null references public.archives (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null,
  created_at timestamptz not null default now(),
  constraint people_role_check check (
    role in ('family_member', 'contributor', 'viewer')
  ),
  constraint people_archive_email_key unique (archive_id, email),
  constraint people_id_archive_key unique (id, archive_id)
);

create table public.memories (
  id uuid primary key default extensions.gen_random_uuid(),
  archive_id uuid not null references public.archives (id) on delete cascade,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  title text not null,
  story text not null,
  place text,
  happened_on date not null,
  kind text not null,
  privacy text not null,
  voice_speaker text,
  voice_transcript text,
  constraint memories_kind_check check (
    kind in ('photo', 'story', 'voice', 'video')
  ),
  constraint memories_privacy_check check (
    privacy in ('private', 'family')
  ),
  constraint memories_voice_pair check (
    (voice_speaker is null and voice_transcript is null)
    or (voice_speaker is not null and voice_transcript is not null)
  ),
  constraint memories_archive_owner_fkey
    foreign key (archive_id, created_by)
    references public.archives (id, owner_id)
    on delete cascade,
  constraint memories_id_archive_key unique (id, archive_id)
);

create table public.memory_people (
  memory_id uuid not null references public.memories (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  primary key (memory_id, person_id)
);

create table public.memory_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  role text not null,
  storage_path text not null,
  mime_type text not null,
  bytes bigint not null,
  alt text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  constraint memory_assets_role_check check (
    role in ('image', 'video', 'audio')
  ),
  constraint memory_assets_bytes_check check (bytes > 0),
  constraint memory_assets_mime_matches_role check (
    (role = 'image' and mime_type like 'image/%')
    or (role = 'video' and mime_type like 'video/%')
    or (role = 'audio' and mime_type like 'audio/%')
  ),
  constraint memory_assets_duration_check check (
    duration_seconds is null
    or (role <> 'image' and duration_seconds >= 0)
  ),
  constraint memory_assets_role_key unique (memory_id, role),
  constraint memory_assets_storage_path_key unique (storage_path)
);

create table public.capsules (
  id uuid primary key default extensions.gen_random_uuid(),
  archive_id uuid not null references public.archives (id) on delete cascade,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  title text not null,
  recipient_id uuid not null,
  opens_on date not null,
  message text not null,
  signature text not null,
  sealed_at timestamptz,
  constraint capsules_archive_owner_fkey
    foreign key (archive_id, created_by)
    references public.archives (id, owner_id)
    on delete cascade,
  constraint capsules_recipient_archive_fkey
    foreign key (recipient_id, archive_id)
    references public.people (id, archive_id)
    on delete restrict,
  constraint capsules_id_archive_key unique (id, archive_id)
);

create table public.capsule_memories (
  capsule_id uuid not null references public.capsules (id) on delete cascade,
  memory_id uuid not null references public.memories (id) on delete cascade,
  position integer not null,
  primary key (capsule_id, memory_id),
  constraint capsule_memories_position_check check (position >= 0),
  constraint capsule_memories_position_key unique (capsule_id, position)
);

create index people_archive_idx on public.people (archive_id);
create index memories_archive_created_idx on public.memories (archive_id, created_at desc);
create index memory_people_person_idx on public.memory_people (person_id);
create index memory_assets_memory_idx on public.memory_assets (memory_id);
create index capsules_archive_created_idx on public.capsules (archive_id, created_at desc);
create index capsules_recipient_idx on public.capsules (recipient_id);
create index capsule_memories_memory_idx on public.capsule_memories (memory_id);

create trigger profiles_guard
  before insert or update on public.profiles
  for each row execute function private.profiles_guard();

create trigger people_guard
  before insert or update on public.people
  for each row execute function private.people_guard();

create trigger memories_guard
  before insert or update on public.memories
  for each row execute function private.memories_guard();

create trigger capsules_guard
  before insert or update on public.capsules
  for each row execute function private.capsules_guard();

create trigger memory_assets_guard
  before insert or update on public.memory_assets
  for each row execute function private.memory_assets_guard();

create trigger memory_assets_delete_object
  after delete on public.memory_assets
  for each row execute function private.delete_asset_object();

create trigger memory_people_same_archive
  before insert or update on public.memory_people
  for each row execute function private.memory_people_same_archive();

create trigger capsule_memories_guard
  before insert or update or delete on public.capsule_memories
  for each row execute function private.capsule_memories_guard();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;

insert into public.archives (owner_id)
select id
from auth.users
on conflict (owner_id) do nothing;

alter table public.profiles enable row level security;
alter table public.archives enable row level security;
alter table public.people enable row level security;
alter table public.memories enable row level security;
alter table public.memory_people enable row level security;
alter table public.memory_assets enable row level security;
alter table public.capsules enable row level security;
alter table public.capsule_memories enable row level security;

alter table public.profiles force row level security;
alter table public.archives force row level security;
alter table public.people force row level security;
alter table public.memories force row level security;
alter table public.memory_people force row level security;
alter table public.memory_assets force row level security;
alter table public.capsules force row level security;
alter table public.capsule_memories force row level security;

create policy profiles_select
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_insert
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy archives_select
  on public.archives
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy archives_insert
  on public.archives
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy people_select
  on public.people
  for select
  to authenticated
  using (private.owns_archive(archive_id));

create policy people_insert
  on public.people
  for insert
  to authenticated
  with check (private.owns_archive(archive_id));

create policy people_update
  on public.people
  for update
  to authenticated
  using (private.owns_archive(archive_id))
  with check (private.owns_archive(archive_id));

create policy people_delete
  on public.people
  for delete
  to authenticated
  using (private.owns_archive(archive_id));

create policy memories_select
  on public.memories
  for select
  to authenticated
  using (private.owns_archive(archive_id));

create policy memories_insert
  on public.memories
  for insert
  to authenticated
  with check (
    private.owns_archive(archive_id)
    and created_by = auth.uid()
  );

create policy memories_update
  on public.memories
  for update
  to authenticated
  using (private.owns_archive(archive_id))
  with check (
    private.owns_archive(archive_id)
    and created_by = auth.uid()
  );

create policy memories_delete
  on public.memories
  for delete
  to authenticated
  using (private.owns_archive(archive_id));

create policy memory_people_select
  on public.memory_people
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy memory_people_insert
  on public.memory_people
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy memory_people_delete
  on public.memory_people
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy memory_assets_select
  on public.memory_assets
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy memory_assets_insert
  on public.memory_assets
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy memory_assets_update
  on public.memory_assets
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  )
  with check (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy memory_assets_delete
  on public.memory_assets
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.memories memory
      where memory.id = memory_id
        and private.owns_archive(memory.archive_id)
    )
  );

create policy capsules_select
  on public.capsules
  for select
  to authenticated
  using (private.owns_archive(archive_id));

create policy capsules_insert
  on public.capsules
  for insert
  to authenticated
  with check (
    private.owns_archive(archive_id)
    and created_by = auth.uid()
  );

create policy capsules_update
  on public.capsules
  for update
  to authenticated
  using (private.owns_archive(archive_id))
  with check (
    private.owns_archive(archive_id)
    and created_by = auth.uid()
  );

create policy capsules_delete
  on public.capsules
  for delete
  to authenticated
  using (private.owns_archive(archive_id));

create policy capsule_memories_select
  on public.capsule_memories
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.capsules capsule
      where capsule.id = capsule_id
        and private.owns_archive(capsule.archive_id)
    )
  );

create policy capsule_memories_insert
  on public.capsule_memories
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.capsules capsule
      where capsule.id = capsule_id
        and private.owns_archive(capsule.archive_id)
    )
  );

create policy capsule_memories_delete
  on public.capsule_memories
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.capsules capsule
      where capsule.id = capsule_id
        and private.owns_archive(capsule.archive_id)
    )
  );

revoke all on table public.profiles from anon;
revoke all on table public.archives from anon;
revoke all on table public.people from anon;
revoke all on table public.memories from anon;
revoke all on table public.memory_people from anon;
revoke all on table public.memory_assets from anon;
revoke all on table public.capsules from anon;
revoke all on table public.capsule_memories from anon;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.archives to authenticated;
grant select, insert, update, delete on table public.people to authenticated;
grant select, insert, update, delete on table public.memories to authenticated;
grant select, insert, delete on table public.memory_people to authenticated;
grant select, insert, update, delete on table public.memory_assets to authenticated;
grant select, insert, update, delete on table public.capsules to authenticated;
grant select, insert, delete on table public.capsule_memories to authenticated;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.archives to service_role;
grant select, insert, update, delete on table public.people to service_role;
grant select, insert, update, delete on table public.memories to service_role;
grant select, insert, update, delete on table public.memory_people to service_role;
grant select, insert, update, delete on table public.memory_assets to service_role;
grant select, insert, update, delete on table public.capsules to service_role;
grant select, insert, update, delete on table public.capsule_memories to service_role;

revoke all on function private.handle_new_user() from public, anon, authenticated;
grant execute on function private.handle_new_user() to supabase_auth_admin;

revoke all on function private.owns_archive(uuid) from public, anon;
revoke all on function private.object_archive_id(text) from public, anon;
revoke all on function private.profiles_guard() from public, anon;
revoke all on function private.people_guard() from public, anon;
revoke all on function private.memories_guard() from public, anon;
revoke all on function private.capsules_guard() from public, anon;
revoke all on function private.memory_assets_guard() from public, anon;
revoke all on function private.memory_people_same_archive() from public, anon;
revoke all on function private.capsule_memories_guard() from public, anon;
revoke all on function private.delete_asset_object() from public, anon;

grant execute on function private.owns_archive(uuid) to authenticated, service_role;
grant execute on function private.object_archive_id(text) to authenticated, service_role;
grant execute on function private.profiles_guard() to authenticated, service_role;
grant execute on function private.people_guard() to authenticated, service_role;
grant execute on function private.memories_guard() to authenticated, service_role;
grant execute on function private.capsules_guard() to authenticated, service_role;
grant execute on function private.memory_assets_guard() to authenticated, service_role;
grant execute on function private.memory_people_same_archive() to authenticated, service_role;
grant execute on function private.capsule_memories_guard() to authenticated, service_role;
grant execute on function private.delete_asset_object() to authenticated, service_role, supabase_auth_admin;

insert into storage.buckets (id, name, "public", file_size_limit, allowed_mime_types)
values (
  'archive-media',
  'archive-media',
  false,
  52428800,
  array['image/*', 'video/*', 'audio/*']
)
on conflict (id) do update
set
  "public" = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy archive_media_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_assets asset
      join public.memories memory on memory.id = asset.memory_id
      where asset.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  );

create policy archive_media_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_assets asset
      join public.memories memory on memory.id = asset.memory_id
      where asset.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  );

create policy archive_media_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_assets asset
      join public.memories memory on memory.id = asset.memory_id
      where asset.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  )
  with check (
    bucket_id = 'archive-media'
    and exists (
      select 1
      from public.memory_assets asset
      join public.memories memory on memory.id = asset.memory_id
      where asset.storage_path = name
        and private.owns_archive(memory.archive_id)
    )
  );

create policy archive_media_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'archive-media'
    and private.owns_archive(private.object_archive_id(name))
  );

commit;
