-- ============================================================
-- Deeno Brands — Client Portal Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Clients table (linked to auth.users)
create table if not exists public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  company text not null,
  trade text not null, -- e.g. "Commercial HVAC"
  market text not null, -- e.g. "Long Island, NY"
  status text not null default 'active', -- active | paused | completed
  start_date date,
  created_at timestamptz default now()
);

-- Campaign stats table (updated manually or via Smartlead sync)
create table if not exists public.campaign_stats (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  week_number int not null,
  week_label text not null, -- e.g. "Week 1", "Week 3–4"
  emails_sent int default 0,
  email_open_rate numeric(5,2) default 0, -- percentage e.g. 42.5
  email_reply_rate numeric(5,2) default 0,
  linkedin_sent int default 0,
  linkedin_replies int default 0,
  calls_made int default 0,
  calls_connected int default 0,
  meetings_booked int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meetings table
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_name text not null,
  contact_name text,
  contact_title text,
  meeting_date timestamptz,
  status text not null default 'scheduled', -- scheduled | completed | cancelled
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — clients only see their own data
-- ============================================================

alter table public.clients enable row level security;
alter table public.campaign_stats enable row level security;
alter table public.meetings enable row level security;

create policy "clients: own row only"
  on public.clients for select
  using (auth.uid() = id);

create policy "campaign_stats: own data only"
  on public.campaign_stats for select
  using (auth.uid() = client_id);

create policy "meetings: own data only"
  on public.meetings for select
  using (auth.uid() = client_id);
