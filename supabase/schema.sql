-- Gestor de gastos — core schema
-- Run this against a Supabase project (SQL Editor or `supabase db push`).
-- Seed data for categories/subcategories lives in seed.sql, run after this file.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- categories
-- Fixed set of expense categories. Not editable by end users — rows are only
-- ever inserted via seed.sql / an admin connection (service_role), never from
-- the client.
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null,
  color text not null
);

-- ---------------------------------------------------------------------------
-- subcategories
-- Fixed, same admin-only write model as categories. `icon` was added beyond
-- the original column list because subcategories also need a Lucide icon
-- (see chat notes for why).
-- ---------------------------------------------------------------------------
create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  icon text not null,
  unique (category_id, name)
);

-- ---------------------------------------------------------------------------
-- expenses
-- One row per expense entry, owned by the authenticated user who created it.
-- ---------------------------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  subcategory_id uuid references subcategories(id) on delete set null,
  amount numeric not null check (amount > 0),
  date date not null default current_date,
  note text,
  payment_method text not null default 'card' check (payment_method in ('cash', 'card')),
  receipt_url text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_date_idx on expenses (user_id, date desc);
create index if not exists expenses_category_id_idx on expenses (category_id);
create index if not exists expenses_subcategory_id_idx on expenses (subcategory_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- categories / subcategories: read-only for authenticated users. No
-- insert/update/delete policies exist, so those operations are blocked for
-- every client role — rows can only be changed via a service_role/admin
-- connection, which bypasses RLS entirely.
alter table categories enable row level security;
alter table subcategories enable row level security;

create policy "Authenticated users can read categories"
  on categories for select
  to authenticated
  using (true);

create policy "Authenticated users can read subcategories"
  on subcategories for select
  to authenticated
  using (true);

-- expenses: each user can only see and manage their own rows.
alter table expenses enable row level security;

create policy "Users manage their own expenses"
  on expenses for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: receipts bucket
-- Files are stored at {user_id}/{expense_id}.jpg so ownership can be checked
-- from the path alone. Bucket is private; access goes through RLS on
-- storage.objects below (reads use signed URLs from the client).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "Users can read their own receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own receipts"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own receipts"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own receipts"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
