-- ============================================================================
-- TableTap MVP — database schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- restaurants
-- One row per restaurant. owner_id links to the Supabase Auth user that
-- manages it. owner_id is nullable so a restaurant (e.g. the demo) can exist
-- before it has been claimed by a logged-in owner.
-- ----------------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  phone text not null, -- WhatsApp number, international format, digits only e.g. 21698123456
  address text,
  cover_image_url text,
  timezone text not null default 'Africa/Tunis',
  created_at timestamptz not null default now()
);

create index if not exists restaurants_owner_id_idx on public.restaurants (owner_id);

-- ----------------------------------------------------------------------------
-- opening_hours
-- One row per restaurant per day of week (0 = Sunday ... 6 = Saturday).
-- ----------------------------------------------------------------------------
create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  is_closed boolean not null default false,
  open_time time,
  close_time time,
  unique (restaurant_id, day_of_week)
);

create index if not exists opening_hours_restaurant_id_idx on public.opening_hours (restaurant_id);

-- ----------------------------------------------------------------------------
-- reservations
-- One row per booking request submitted from the public reservation page.
-- ----------------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  party_size smallint not null check (party_size between 1 and 30),
  reservation_date date not null,
  reservation_time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists reservations_restaurant_id_idx on public.reservations (restaurant_id);
create index if not exists reservations_date_idx on public.reservations (reservation_date);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.restaurants enable row level security;
alter table public.opening_hours enable row level security;
alter table public.reservations enable row level security;

-- ---- restaurants ------------------------------------------------------------
-- Anyone (including anonymous visitors) can read restaurant profiles, since
-- the reservation page is public.
drop policy if exists "restaurants are publicly readable" on public.restaurants;
create policy "restaurants are publicly readable"
  on public.restaurants for select
  using (true);

-- Only the authenticated owner can update their own restaurant.
drop policy if exists "owners can update their restaurant" on public.restaurants;
create policy "owners can update their restaurant"
  on public.restaurants for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Only a logged-in user can create a restaurant, and only for themselves.
drop policy if exists "owners can create their restaurant" on public.restaurants;
create policy "owners can create their restaurant"
  on public.restaurants for insert
  with check (auth.uid() = owner_id);

-- ---- opening_hours ------------------------------------------------------------
-- Public read access, so the reservation page can show hours.
drop policy if exists "opening hours are publicly readable" on public.opening_hours;
create policy "opening hours are publicly readable"
  on public.opening_hours for select
  using (true);

-- Only the restaurant's owner can manage its opening hours.
drop policy if exists "owners can manage their opening hours" on public.opening_hours;
create policy "owners can manage their opening hours"
  on public.opening_hours for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = opening_hours.restaurant_id
        and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = opening_hours.restaurant_id
        and r.owner_id = auth.uid()
    )
  );

-- ---- reservations ------------------------------------------------------------
-- Anyone can submit a reservation request from the public booking page.
drop policy if exists "anyone can create a reservation" on public.reservations;
create policy "anyone can create a reservation"
  on public.reservations for insert
  with check (true);

-- Reservations are private: only the owning restaurant's owner can view them.
drop policy if exists "owners can view their reservations" on public.reservations;
create policy "owners can view their reservations"
  on public.reservations for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = reservations.restaurant_id
        and r.owner_id = auth.uid()
    )
  );

-- Only the owner can confirm / reject / cancel a reservation.
drop policy if exists "owners can update their reservations" on public.reservations;
create policy "owners can update their reservations"
  on public.reservations for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = reservations.restaurant_id
        and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = reservations.restaurant_id
        and r.owner_id = auth.uid()
    )
  );
