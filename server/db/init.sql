-- Roots & Routes – Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- This version keeps the legacy markers table for compatibility and adds the new posts/post_images model.

create extension if not exists pgcrypto;

create table if not exists public.markers (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('memory', 'heritage', 'safety', 'accessibility')),
  category text not null default 'other',
  title text not null,
  description text default '',
  lat double precision not null,
  lng double precision not null,
  severity text default 'medium' check (severity in ('low', 'medium', 'high')),
  status text default 'open' check (status in ('open', 'in-progress', 'resolved')),
  photo text default null,
  author text default 'Community member',
  date_label text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('memory', 'safety', 'accessibility', 'heritage')),
  title text not null,
  description text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  category text not null default 'other',
  severity text check (severity in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved')),
  author text not null default 'Community member',
  date_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists author text not null default 'Community member';
alter table public.posts add column if not exists date_label text not null default '';

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('community-post-images', 'community-post-images', true)
on conflict (id) do update set public = excluded.public;

create index if not exists idx_posts_type_created_at on public.posts (type, created_at desc);
create index if not exists idx_posts_location on public.posts (latitude, longitude);
create index if not exists idx_post_images_post_id on public.post_images (post_id, display_order);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
before update on public.posts
for each row
execute function public.handle_updated_at();

alter table public.markers enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;

create policy "Public read markers" on public.markers for select using (true);
create policy "Public insert markers" on public.markers for insert with check (true);
create policy "Public update markers" on public.markers for update using (true);
create policy "Public delete markers" on public.markers for delete using (true);

create policy "Public read posts" on public.posts for select using (true);
drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts" on public.posts for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

drop policy if exists "Users can insert their own post images" on public.post_images;
drop policy if exists "Users can update their own post images" on public.post_images;
drop policy if exists "Users can delete their own post images" on public.post_images;
create policy "Public read post images" on public.post_images for select using (true);
create policy "Users can insert their own post images" on public.post_images for insert with check (
  exists (
    select 1 from public.posts p
    where p.id = post_images.post_id
      and auth.uid() = p.user_id
  )
);
create policy "Users can delete their own post images" on public.post_images for delete using (
  exists (
    select 1 from public.posts p
    where p.id = post_images.post_id
      and auth.uid() = p.user_id
  )
);

create policy "Users can update their own post images" on public.post_images for update using (
  exists (
    select 1 from public.posts p
    where p.id = post_images.post_id
      and auth.uid() = p.user_id
  )
) with check (
  exists (
    select 1 from public.posts p
    where p.id = post_images.post_id
      and auth.uid() = p.user_id
  )
);
