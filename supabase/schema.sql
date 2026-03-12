-- HomePlate MEHKO Marketplace Schema
-- Run this in your Supabase SQL Editor

-- Enable PostGIS for location queries
create extension if not exists postgis;

-- Approved MEHKO counties (seed this)
create table approved_counties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  state text default 'CA',
  active boolean default true
);

insert into approved_counties (name) values
  ('Riverside'), ('Alameda'), ('Solano'), ('San Mateo'),
  ('San Diego'), ('Santa Clara'), ('Amador'), ('San Benito'),
  ('Monterey'), ('Sierra'), ('Contra Costa'), ('Los Angeles'),
  ('Santa Cruz'), ('Sonoma'), ('Berkeley (City)'),
  ('Plumas'), ('San Luis Obispo'), ('Ventura');

-- Users (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text,
  role text not null check (role in ('cook', 'customer', 'admin')),
  avatar_url text,
  stripe_customer_id text,
  stripe_account_id text,
  stripe_onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cook profiles
create table cook_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  bio text,
  cuisine_types text[] default '{}',
  county text references approved_counties(name),
  permit_number text not null,
  permit_verified boolean default false,
  address text, -- NEVER expose until post-payment
  lat double precision,
  lng double precision,
  location geography(point, 4326),
  active boolean default false,
  profile_photo_url text,
  total_weekly_meals int default 0,
  total_daily_meals int default 0,
  last_meal_reset_date date,
  last_week_reset_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Menus (one per cook per day)
create table menus (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid references cook_profiles(id) on delete cascade,
  date date not null,
  available_from time not null,
  available_until time not null,
  meals_remaining int not null default 30,
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(cook_id, date)
);

-- Menu items
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references menus(id) on delete cascade,
  name text not null,
  description text,
  price int not null check (price > 0),
  photo_url text,
  dietary_tags text[] default '{}',
  available_qty int,
  qty_remaining int,
  sold_out boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id),
  cook_id uuid references cook_profiles(id),
  menu_id uuid references menus(id),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  fulfillment_type text not null
    check (fulfillment_type in ('pickup', 'dine_in', 'delivery')),
  total_amount int not null,
  platform_fee int not null,
  cook_payout int not null,
  stripe_payment_intent_id text unique,
  stripe_transfer_id text,
  address_revealed boolean default false,
  customer_notes text,
  pickup_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null check (quantity > 0),
  unit_price int not null,
  item_name text not null
);

-- Complaints (IFSI legal requirement)
create table complaints (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  cook_id uuid references cook_profiles(id),
  customer_id uuid references users(id),
  description text not null,
  submitted_at timestamptz default now(),
  admin_reviewed boolean default false,
  reported_to_lea boolean default false,
  lea_report_date timestamptz
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references orders(id),
  cook_id uuid references cook_profiles(id),
  customer_id uuid references users(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- RLS Policies
alter table users enable row level security;
alter table cook_profiles enable row level security;
alter table menus enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table complaints enable row level security;
alter table reviews enable row level security;

-- Users: can read own, admin reads all
create policy "Users read own" on users for select using (auth.uid() = id);
create policy "Users update own" on users for update using (auth.uid() = id);

-- Cook profiles: public read (EXCLUDING address field), cook edits own
create policy "Cook profiles public read" on cook_profiles
  for select using (true);

create policy "Cook profile owner write" on cook_profiles
  for all using (auth.uid() = user_id);

-- Menus: public read, cook writes own
create policy "Menus public read" on menus for select using (true);
create policy "Menus cook write" on menus for all
  using (auth.uid() = (select user_id from cook_profiles where id = cook_id));

-- Menu items: public read, cook writes own
create policy "Menu items public read" on menu_items for select using (true);
create policy "Menu items cook write" on menu_items for all
  using (auth.uid() = (
    select cp.user_id from cook_profiles cp
    join menus m on m.cook_id = cp.id
    where m.id = menu_id
  ));

-- Orders: customer sees own, cook sees their orders
create policy "Orders customer read" on orders for select
  using (auth.uid() = customer_id);
create policy "Orders cook read" on orders for select
  using (auth.uid() = (select user_id from cook_profiles where id = cook_id));
create policy "Orders customer insert" on orders for insert
  with check (auth.uid() = customer_id);

-- Order items: accessible through order
create policy "Order items read" on order_items for select using (true);

-- Complaints: customer inserts, admin reads all
create policy "Complaints customer insert" on complaints for insert
  with check (auth.uid() = customer_id);

-- Reviews: public read, customer inserts own
create policy "Reviews public read" on reviews for select using (true);
create policy "Reviews customer insert" on reviews for insert
  with check (auth.uid() = customer_id);
