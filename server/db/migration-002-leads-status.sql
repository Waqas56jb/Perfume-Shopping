-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 002 — Enrich chat_leads with order tracking                ║
-- ║                                                                       ║
-- ║  Adds the columns the admin panel needs to manage real orders:        ║
-- ║    - status         (new / contacted / delivered / cancelled)         ║
-- ║    - product_ids    (slugs the customer was interested in)            ║
-- ║    - product_names  (display names — denormalized for fast list view) ║
-- ║    - total_amount   (sum of product prices in `currency`)             ║
-- ║    - currency       (default USD)                                     ║
-- ║    - address        (shipping address typed in the chat)              ║
-- ║    - updated_at     (auto-maintained)                                 ║
-- ║                                                                       ║
-- ║  Run this once in the Supabase SQL editor.                            ║
-- ╚══════════════════════════════════════════════════════════════════════╝

alter table public.chat_leads
  add column if not exists status text not null default 'new'
    check (status in ('new', 'contacted', 'delivered', 'cancelled')),
  add column if not exists product_ids text[] not null default '{}',
  add column if not exists product_names text[] not null default '{}',
  add column if not exists total_amount numeric(10, 2),
  add column if not exists currency text default 'EUR',
  add column if not exists address text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_chat_leads_status on public.chat_leads(status);

-- Auto-update updated_at on every UPDATE
drop trigger if exists trg_chat_leads_updated on public.chat_leads;
create trigger trg_chat_leads_updated
  before update on public.chat_leads
  for each row execute function public.set_updated_at();
