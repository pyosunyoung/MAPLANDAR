create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id bigint generated always as identity unique,
  email text not null,
  name text not null default '',
  nickname text,
  gender text,
  age integer,
  contact text,
  major text,
  location text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_email_not_blank check (length(trim(email)) > 0),
  constraint profiles_name_not_blank check (length(trim(name)) > 0)
);

create unique index if not exists profiles_email_lower_uidx
  on public.profiles (lower(email));

create table if not exists public.friend_requests (
  requester_id bigint not null references public.profiles(user_id) on delete cascade,
  receiver_id bigint not null references public.profiles(user_id) on delete cascade,
  accepted boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (requester_id, receiver_id),
  constraint friend_requests_no_self check (requester_id <> receiver_id)
);

create index if not exists friend_requests_receiver_idx
  on public.friend_requests (receiver_id, accepted);

create table if not exists public.groups (
  id bigint generated always as identity primary key,
  name text not null,
  owner_id bigint not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_members (
  group_id bigint not null references public.groups(id) on delete cascade,
  user_id bigint not null references public.profiles(user_id) on delete cascade,
  role text not null default 'MEMBER',
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (group_id, user_id),
  constraint group_members_role_check check (role in ('OWNER', 'MEMBER'))
);

create index if not exists group_members_user_idx
  on public.group_members (user_id);

create table if not exists public.calendars (
  id bigint generated always as identity primary key,
  group_id bigint not null unique references public.groups(id) on delete cascade,
  name text not null
);

create table if not exists public.schedules (
  id bigint generated always as identity primary key,
  group_id bigint not null references public.groups(id) on delete cascade,
  creator_id bigint not null references public.profiles(user_id) on delete cascade,
  title text not null,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedules_title_not_blank check (length(trim(title)) > 0),
  constraint schedules_address_not_blank check (length(trim(address)) > 0),
  constraint schedules_time_check check (end_datetime >= start_datetime)
);

create index if not exists schedules_group_idx
  on public.schedules (group_id, start_datetime);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_schedules_updated_at
before update on public.schedules
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, nickname)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      '사용자'
    ),
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    nickname = coalesce(excluded.nickname, public.profiles.nickname),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = coalesce(new.email, public.profiles.email),
    name = coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      public.profiles.name
    ),
    nickname = coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
      public.profiles.nickname
    ),
    updated_at = timezone('utc', now())
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update on auth.users
for each row
execute function public.sync_auth_user_profile();

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.calendars enable row level security;
alter table public.schedules enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
