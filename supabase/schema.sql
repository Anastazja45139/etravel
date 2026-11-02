-- ETravel database schema (PostgreSQL / Supabase).
-- Run once in Supabase → SQL Editor, then run seed.sql to fill the catalogue.
--
-- Catalogue (public, read-only):  countries → cities, dishes, facts, hotels, cars, tours
-- User data (private, RLS):       profiles, favorites, trip_requests, bookings

-- ───────────────────────── Catalogue ─────────────────────────

create table if not exists public.countries (
  iso2          char(2) primary key check (iso2 ~ '^[A-Z]{2}$'),
  region        text not null check (region in ('west', 'south', 'central', 'north', 'east', 'balkans')),
  wiki          text not null,
  capital_uk    text not null,
  capital_pl    text not null,
  intro_uk      text not null,
  intro_pl      text not null,
  best_months   smallint[] not null,
  daily_cost    numeric(8, 2) not null check (daily_cost > 0),
  tags          text[] not null default '{}',
  airport_code  char(3) not null,
  airport_name  text not null,
  airport_lat   double precision not null,
  airport_lng   double precision not null
);

create table if not exists public.cities (
  id            text primary key,
  country_iso2  char(2) not null references public.countries on delete cascade,
  name_uk       text not null,
  name_pl       text not null,
  wiki          text not null,
  lat           double precision not null check (lat between -90 and 90),
  lng           double precision not null check (lng between -180 and 180),
  blurb_uk      text not null,
  blurb_pl      text not null
);

create table if not exists public.dishes (
  id              serial primary key,
  country_iso2    char(2) not null references public.countries on delete cascade,
  name_uk         text not null,
  name_pl         text not null,
  description_uk  text not null,
  description_pl  text not null
);

create table if not exists public.facts (
  id            serial primary key,
  country_iso2  char(2) not null references public.countries on delete cascade,
  text_uk       text not null,
  text_pl       text not null
);

create table if not exists public.hotels (
  id               text primary key,
  country_iso2     char(2) not null references public.countries on delete cascade,
  city_id          text not null references public.cities on delete cascade,
  name             text not null,
  tier             text not null check (tier in ('budget', '3', '4', 'boutique', '5')),
  stars            smallint not null check (stars between 1 and 5),
  price_per_night  numeric(8, 2) not null check (price_per_night > 0),
  capacity         smallint not null check (capacity between 1 and 6),
  tags             text[] not null default '{}',
  description_uk   text not null,
  description_pl   text not null
);

create table if not exists public.cars (
  id             text primary key,
  country_iso2   char(2) not null references public.countries on delete cascade,
  class          text not null check (class in ('economy', 'suv', 'premium')),
  model          text not null,
  price_per_day  numeric(8, 2) not null check (price_per_day > 0),
  seats          smallint not null check (seats > 0)
);

-- Ready-made packages ("tours"): a themed route with one hotel, priced per person without flights.
create table if not exists public.tours (
  id                text primary key,
  country_iso2      char(2) not null references public.countries on delete cascade,
  hotel_id          text not null references public.hotels on delete cascade,
  theme             text not null check (theme in ('sea', 'mountains', 'city', 'food', 'romance', 'family', 'luxury')),
  title_uk          text not null,
  title_pl          text not null,
  nights            smallint not null check (nights between 1 and 30),
  price_per_person  numeric(8, 2) not null check (price_per_person > 0)
);

-- Ordered list of cities a tour visits (many-to-many).
create table if not exists public.tour_cities (
  tour_id   text not null references public.tours on delete cascade,
  city_id   text not null references public.cities on delete cascade,
  position  smallint not null,
  primary key (tour_id, position)
);

create index if not exists cities_country_idx on public.cities (country_iso2);
create index if not exists hotels_country_idx on public.hotels (country_iso2);
create index if not exists tours_country_idx  on public.tours (country_iso2);

-- ───────────────────────── User data ─────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id       uuid not null references auth.users on delete cascade default auth.uid(),
  country_iso2  char(2) not null references public.countries on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, country_iso2)
);

create table if not exists public.trip_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade default auth.uid(),
  created_at  timestamptz not null default now(),
  input       jsonb not null
);

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade default auth.uid(),
  request_id    uuid references public.trip_requests on delete cascade,
  tour_id       text references public.tours on delete set null,
  country_iso2  char(2) not null references public.countries,
  hotel_id      text not null references public.hotels,
  car_id        text references public.cars,
  start_date    date not null,
  nights        int not null check (nights between 1 and 30),
  travellers    int not null check (travellers between 1 and 14),
  total         numeric(10, 2) not null check (total >= 0),
  status        text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id, created_at desc);
create index if not exists requests_user_idx on public.trip_requests (user_id, created_at desc);

-- ───────────────────────── Security (Row Level Security) ─────────────────────────

do $$
declare t text;
begin
  -- Catalogue: anyone may read, nobody may write through the API.
  foreach t in array array['countries', 'cities', 'dishes', 'facts', 'hotels', 'cars', 'tours', 'tour_cities'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.trip_requests enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own requests" on public.trip_requests;
create policy "own requests" on public.trip_requests for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own bookings" on public.bookings;
create policy "own bookings" on public.bookings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A profile row is created automatically for every new account.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ───────────────────────── Handy views for reports ─────────────────────────

-- Cheapest hotel and number of tours per country.
create or replace view public.country_overview with (security_invoker = true) as
select c.iso2, c.region, c.capital_uk, c.daily_cost,
       (select min(h.price_per_night) from public.hotels h where h.country_iso2 = c.iso2) as cheapest_night,
       (select count(*) from public.tours t where t.country_iso2 = c.iso2) as tours
from public.countries c;
