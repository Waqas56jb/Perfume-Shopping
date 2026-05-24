-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  ELEGANZA · COMPLETE DATABASE SCHEMA (Supabase / PostgreSQL 15)       ║
-- ║  Version 1.0                                                          ║
-- ║                                                                       ║
-- ║  HOW TO RUN                                                           ║
-- ║   1.  Open Supabase Dashboard → SQL Editor                            ║
-- ║   2.  Paste this entire file and click "Run"                          ║
-- ║   3.  Run scripts/createAdmin.js from the server folder to seed your  ║
-- ║       first admin user, OR run db/seed-products.sql to populate the   ║
-- ║       catalog with the 37 products from knowledgeBase.js.             ║
-- ║                                                                       ║
-- ║  RE-RUNNING                                                           ║
-- ║   This file is *destructive* — it drops the schema first.             ║
-- ║   Uncomment the DROP section only if you want a clean rebuild.        ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";        -- gen_random_uuid()
create extension if not exists "citext";          -- case-insensitive text

-- ────────────────────────────────────────────────────────────────────────
-- 0b. CLEAN SLATE (uncomment to wipe and rebuild)
-- ────────────────────────────────────────────────────────────────────────
-- drop table if exists public.analytics_events     cascade;
-- drop table if exists public.chat_messages        cascade;
-- drop table if exists public.chat_leads           cascade;
-- drop table if exists public.chat_sessions        cascade;
-- drop table if exists public.dupe_mappings        cascade;
-- drop table if exists public.forbidden_terms      cascade;
-- drop table if exists public.system_prompts       cascade;
-- drop table if exists public.products             cascade;
-- drop table if exists public.customers            cascade;
-- drop table if exists public.admin_sessions       cascade;
-- drop table if exists public.admin_password_resets cascade;
-- drop table if exists public.admin_users          cascade;
-- drop function if exists set_updated_at()         cascade;

-- ────────────────────────────────────────────────────────────────────────
-- 1. SHARED — auto-updating updated_at
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 2. ADMIN AUTHENTICATION
-- ════════════════════════════════════════════════════════════════════════

-- Admin users — no public sign-up. Seeded via scripts/createAdmin.js.
create table public.admin_users (
  id              uuid primary key default gen_random_uuid(),
  email           citext unique not null,
  password_hash   text not null,                                 -- bcrypt, never store plain
  name            text not null,
  role            text not null default 'admin'
                  check (role in ('owner', 'admin', 'editor')),
  is_active       boolean not null default true,
  last_login_at   timestamptz,
  failed_attempts smallint not null default 0,
  locked_until    timestamptz,                                   -- account lockout window
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_admin_users_email      on public.admin_users (email);
create index idx_admin_users_active     on public.admin_users (is_active) where is_active = true;

create trigger trg_admin_users_updated
  before update on public.admin_users
  for each row execute function public.set_updated_at();

-- Password reset tokens — only the SHA-256 hash is stored; raw token in email.
create table public.admin_password_resets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.admin_users(id) on delete cascade,
  token_hash  text unique not null,                              -- sha256 hex
  expires_at  timestamptz not null,
  used_at     timestamptz,                                       -- null until consumed
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index idx_password_resets_token  on public.admin_password_resets (token_hash);
create index idx_password_resets_user   on public.admin_password_resets (user_id);
create index idx_password_resets_valid  on public.admin_password_resets (expires_at)
  where used_at is null;

-- Admin sessions — opaque-token sessions stored server-side (revocable).
create table public.admin_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.admin_users(id) on delete cascade,
  token_hash  text unique not null,                              -- sha256 hex of token
  expires_at  timestamptz not null,
  ip_address  inet,
  user_agent  text,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_admin_sessions_token   on public.admin_sessions (token_hash);
create index idx_admin_sessions_user    on public.admin_sessions (user_id);
create index idx_admin_sessions_active  on public.admin_sessions (expires_at)
  where revoked_at is null;

-- ════════════════════════════════════════════════════════════════════════
-- 3. PRODUCT CATALOG
-- ════════════════════════════════════════════════════════════════════════

create table public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,                            -- "rouge-240"
  name           text not null,                                   -- "ROUGE 240"
  tagline        text,
  family         text,                                            -- "Ambré Floral Boisé"
  gender         text not null check (gender in ('F','H','U')),   -- Femme, Homme, Unisexe
  notes_tete     text[] not null default '{}',
  notes_coeur    text[] not null default '{}',
  notes_fond     text[] not null default '{}',
  season         text[] not null default '{}',                    -- ['Automne','Hiver']
  intensity      smallint check (intensity between 1 and 5),
  sillage        smallint check (sillage between 1 and 5),
  longevity      smallint check (longevity between 1 and 5),
  occasions      text[] not null default '{}',
  vibe           text,
  price          numeric(10,2) not null,
  old_price      numeric(10,2),
  currency       text not null default 'EUR',
  in_stock       boolean not null default true,
  is_bestseller  boolean not null default false,
  is_new         boolean not null default false,
  url            text,
  image_url      text,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_products_slug          on public.products (slug);
create index idx_products_in_stock      on public.products (in_stock) where in_stock = true;
create index idx_products_gender        on public.products (gender);
create index idx_products_family        on public.products (family);
create index idx_products_bestseller    on public.products (is_bestseller) where is_bestseller = true;

create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 4. HIDDEN DUPE MAPPINGS — customer mentions famous brand → Eleganza product
-- ════════════════════════════════════════════════════════════════════════

create table public.dupe_mappings (
  id              uuid primary key default gen_random_uuid(),
  triggers        text[] not null,                                -- ["baccarat rouge 540", "br540", ...]
  product_id      uuid not null references public.products(id) on delete cascade,
  notes_to_pitch  text,                                           -- hint for the agent
  notes_internal  text,                                           -- private admin note
  is_active       boolean not null default true,
  hit_count       int not null default 0,                         -- analytics
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_dupe_mappings_product  on public.dupe_mappings (product_id);
create index idx_dupe_mappings_active   on public.dupe_mappings (is_active) where is_active = true;
create index idx_dupe_mappings_triggers on public.dupe_mappings using gin (triggers);

create trigger trg_dupe_mappings_updated
  before update on public.dupe_mappings
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 5. FORBIDDEN VOCABULARY — safety-net, admin-editable
-- ════════════════════════════════════════════════════════════════════════

create table public.forbidden_terms (
  id          uuid primary key default gen_random_uuid(),
  term        citext unique not null,                              -- "Baccarat Rouge 540"
  category    text not null check (category in ('brand', 'perfume', 'dupe-vocab', 'other')),
  severity    smallint not null default 5 check (severity between 1 and 5),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_forbidden_active on public.forbidden_terms (is_active) where is_active = true;
create index idx_forbidden_category on public.forbidden_terms (category);

-- ════════════════════════════════════════════════════════════════════════
-- 6. CHATBOT — sessions, messages, leads
-- ════════════════════════════════════════════════════════════════════════

create table public.chat_sessions (
  id                uuid primary key default gen_random_uuid(),
  language          text not null default 'fr',
  customer_email    citext,
  customer_name     text,
  customer_phone    text,
  ip_address        inet,
  user_agent        text,
  referrer          text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  message_count     int not null default 0,
  lead_captured     boolean not null default false,
  escalated         boolean not null default false,
  escalation_reason text,
  total_tokens      int not null default 0,
  created_at        timestamptz not null default now(),
  last_active_at    timestamptz not null default now(),
  closed_at         timestamptz
);

create index idx_chat_sessions_active   on public.chat_sessions (last_active_at desc);
create index idx_chat_sessions_email    on public.chat_sessions (customer_email)
  where customer_email is not null;
create index idx_chat_sessions_lead     on public.chat_sessions (lead_captured)
  where lead_captured = true;
create index idx_chat_sessions_escalated on public.chat_sessions (escalated)
  where escalated = true;
create index idx_chat_sessions_created  on public.chat_sessions (created_at desc);

create table public.chat_messages (
  id                     uuid primary key default gen_random_uuid(),
  session_id             uuid not null references public.chat_sessions(id) on delete cascade,
  role                   text not null check (role in ('user', 'assistant', 'system')),
  content                text not null,
  intent                 text,
  suggested_product_ids  text[] not null default '{}',
  quick_replies          jsonb,
  detected_forbidden     text,                                    -- term that triggered routing
  redacted_terms         text[] not null default '{}',            -- terms the safety-net redacted
  routed_product_id      text,                                    -- product id the router suggested
  capture_lead           boolean not null default false,
  escalate_to_human      boolean not null default false,
  prompt_tokens          int,
  completion_tokens      int,
  total_tokens           int,
  model                  text,
  latency_ms             int,
  created_at             timestamptz not null default now()
);

create index idx_chat_messages_session  on public.chat_messages (session_id, created_at);
create index idx_chat_messages_intent   on public.chat_messages (intent) where intent is not null;
create index idx_chat_messages_redacted on public.chat_messages (redacted_terms)
  where array_length(redacted_terms, 1) > 0;

create table public.chat_leads (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid references public.chat_sessions(id) on delete set null,
  email             citext not null unique,
  name              text,
  phone             text,
  marketing_opt_in  boolean not null default false,
  source            text not null default 'chatbot',
  notes             text,
  created_at        timestamptz not null default now()
);

create index idx_chat_leads_email      on public.chat_leads (email);
create index idx_chat_leads_session    on public.chat_leads (session_id);
create index idx_chat_leads_created    on public.chat_leads (created_at desc);

-- ════════════════════════════════════════════════════════════════════════
-- 7. ANALYTICS — lightweight event log (UI interactions, milestones)
-- ════════════════════════════════════════════════════════════════════════

create table public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.chat_sessions(id) on delete cascade,
  event_type  text not null,                                      -- "open_chat","tap_chip","view_product",...
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index idx_analytics_session on public.analytics_events (session_id);
create index idx_analytics_type    on public.analytics_events (event_type, created_at desc);

-- ════════════════════════════════════════════════════════════════════════
-- 8. SYSTEM PROMPT VERSIONING — edit the agent from admin panel
-- ════════════════════════════════════════════════════════════════════════

create table public.system_prompts (
  id          uuid primary key default gen_random_uuid(),
  version     text not null,                                      -- "v1.0", "v1.1-A/B"
  content     text not null,
  appendix    text,
  is_active   boolean not null default false,
  notes       text,
  created_by  uuid references public.admin_users(id),
  created_at  timestamptz not null default now()
);

-- At most one active prompt at a time
create unique index idx_system_prompts_only_one_active
  on public.system_prompts (is_active) where is_active = true;

-- ════════════════════════════════════════════════════════════════════════
-- 9. CUSTOMERS — optional CRM for repeat-visit personalization
-- ════════════════════════════════════════════════════════════════════════

create table public.customers (
  id                  uuid primary key default gen_random_uuid(),
  email               citext unique not null,
  name                text,
  phone               text,
  preferred_language  text default 'fr',
  preferred_family    text,
  preferred_gender    text check (preferred_gender in ('F','H','U')),
  preferred_season    text[],
  budget_max          numeric(10,2),
  conversation_count  int not null default 0,
  order_count         int not null default 0,
  total_spent         numeric(10,2) not null default 0,
  first_seen_at       timestamptz not null default now(),
  last_seen_at        timestamptz not null default now(),
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_customers_email     on public.customers (email);
create index idx_customers_last_seen on public.customers (last_seen_at desc);

create trigger trg_customers_updated
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 10. ROW-LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════════
-- Strategy: the Node server uses the SERVICE ROLE key, which BYPASSES RLS.
-- We enable RLS on every table with NO public policies — meaning the
-- anonymous / publishable key can NOT read anything by default. This is
-- a defense-in-depth measure even though the browser never talks to
-- Supabase directly.

alter table public.admin_users           enable row level security;
alter table public.admin_password_resets enable row level security;
alter table public.admin_sessions        enable row level security;
alter table public.products              enable row level security;
alter table public.dupe_mappings         enable row level security;
alter table public.forbidden_terms       enable row level security;
alter table public.chat_sessions         enable row level security;
alter table public.chat_messages         enable row level security;
alter table public.chat_leads            enable row level security;
alter table public.analytics_events      enable row level security;
alter table public.system_prompts        enable row level security;
alter table public.customers             enable row level security;

-- (Optional) If you ever want the customer chatbot to read the catalog
-- directly via the anon key, uncomment this policy:
-- create policy "Anyone can read in-stock products"
--   on public.products for select using (in_stock = true);

-- ════════════════════════════════════════════════════════════════════════
-- 11. HELPER VIEWS (optional convenience for the admin panel)
-- ════════════════════════════════════════════════════════════════════════

-- Recent conversations with last message preview
create or replace view public.v_recent_conversations as
select
  s.id as session_id,
  s.created_at,
  s.last_active_at,
  s.language,
  s.message_count,
  s.lead_captured,
  s.escalated,
  s.customer_email,
  (
    select content
    from public.chat_messages m
    where m.session_id = s.id and m.role = 'user'
    order by m.created_at asc
    limit 1
  ) as first_user_message,
  (
    select content
    from public.chat_messages m
    where m.session_id = s.id
    order by m.created_at desc
    limit 1
  ) as last_message
from public.chat_sessions s
order by s.last_active_at desc;

-- Daily summary rollup
create or replace view public.v_daily_stats as
select
  date_trunc('day', created_at) as day,
  count(*)                         as total_sessions,
  sum(message_count)               as total_messages,
  count(*) filter (where lead_captured)  as leads_captured,
  count(*) filter (where escalated)      as escalations,
  sum(total_tokens)                as total_tokens
from public.chat_sessions
group by 1
order by 1 desc;

-- ════════════════════════════════════════════════════════════════════════
-- DONE.
-- Next steps:
--   1.  Verify the schema in Supabase Dashboard → Table Editor
--   2.  From the server folder run:  node scripts/createAdmin.js
--       (creates your first admin login + hashed password)
--   3.  Optionally run db/seed-products.sql to populate the catalog
--   4.  Test the connection:  node scripts/testConnection.js
-- ════════════════════════════════════════════════════════════════════════
