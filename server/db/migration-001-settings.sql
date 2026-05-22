-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Migration 001 — App Settings (key-value store)                       ║
-- ║                                                                       ║
-- ║  Run this AFTER schema.sql in the Supabase SQL Editor.                ║
-- ║  Stores runtime config that the admin panel can edit:                 ║
-- ║    - openai_api_key       (admin overrides env, fallback if empty)    ║
-- ║    - openai_model         (gpt-4o-mini, gpt-4o, ...)                  ║
-- ║    - openai_temperature   (0.0–2.0)                                   ║
-- ║    - openai_max_tokens    (e.g. 600)                                  ║
-- ║    - active_prompt_id     (uuid of the system_prompts row to use)     ║
-- ║    - … any future toggles                                             ║
-- ╚══════════════════════════════════════════════════════════════════════╝

create table if not exists public.app_settings (
  key         text primary key,
  value       text,
  is_secret   boolean not null default false,
  description text,
  updated_by  uuid references public.admin_users(id),
  updated_at  timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Bootstrap default keys (idempotent)
insert into public.app_settings (key, value, is_secret, description) values
  ('openai_api_key',     null, true,  'Admin-managed OpenAI key. If null/empty, server falls back to OPENAI_API_KEY env var.'),
  ('openai_model',       null, false, 'Default: gpt-4o-mini. Other values: gpt-4o, gpt-4.1-mini.'),
  ('openai_temperature', null, false, 'Float 0.0–2.0. Default: 0.55.'),
  ('openai_max_tokens',  null, false, 'Integer. Default: 600.'),
  ('active_prompt_id',   null, false, 'UUID of the active row in system_prompts. If null, falls back to prompts/system.md.')
on conflict (key) do nothing;
