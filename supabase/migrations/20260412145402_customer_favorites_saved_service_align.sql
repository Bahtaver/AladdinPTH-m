-- Kayıtlı hizmet seçimleri (favoriler): public.customer_favorites
-- Uzak ortamda tablo zaten vardı (customer_favorites_table); yerelde yalnızca son migrasyonlar
-- olan repolar için IF NOT EXISTS ile tam iskelet + RLS.
-- Sepet ile bütünlük: selection_json, cart_items.configuration ve orders.configuration_snapshot ile aynı anlamda tutulur.
-- Aynı hizmete birden fazla kayıtlı konfigürasyon (cart'taki gibi) için (customer_id, service_id) tekilliği kaldırılır.

create table if not exists public.customer_favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  service_id uuid not null references public.services (id),
  selection_json jsonb not null default '{}'::jsonb,
  display_title text,
  notify_on_discount boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_favorites add column if not exists sort_order integer not null default 0;
alter table public.customer_favorites add column if not exists updated_at timestamptz not null default now();

alter table public.customer_favorites drop constraint if exists customer_favorites_unique_service;

create index if not exists customer_favorites_customer_id_idx
  on public.customer_favorites (customer_id);

create index if not exists customer_favorites_service_id_idx
  on public.customer_favorites (service_id);

create index if not exists customer_favorites_customer_sort_idx
  on public.customer_favorites (customer_id, sort_order);

comment on table public.customer_favorites is
  'Müşterinin kaydettiği hizmet + seçimler (favoriler); sepet staging (cart_items) alanından ayrıdır.';
comment on column public.customer_favorites.selection_json is
  'cart_items.configuration / orders.configuration_snapshot ile uyumlu seçim özeti.';

create or replace function public.customer_favorites_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customer_favorites_set_updated_at on public.customer_favorites;
create trigger customer_favorites_set_updated_at
before update on public.customer_favorites
for each row execute function public.customer_favorites_set_updated_at();

alter table public.customer_favorites enable row level security;

drop policy if exists customer_favorites_select_own on public.customer_favorites;
drop policy if exists customer_favorites_insert_own on public.customer_favorites;
drop policy if exists customer_favorites_update_own on public.customer_favorites;
drop policy if exists customer_favorites_delete_own on public.customer_favorites;
drop policy if exists customer_favorites_superadmin_all on public.customer_favorites;

create policy customer_favorites_select_own on public.customer_favorites
  for select to authenticated
  using (customer_id = (select auth.uid()));

create policy customer_favorites_insert_own on public.customer_favorites
  for insert to authenticated
  with check (customer_id = (select auth.uid()));

create policy customer_favorites_update_own on public.customer_favorites
  for update to authenticated
  using (customer_id = (select auth.uid()))
  with check (customer_id = (select auth.uid()));

create policy customer_favorites_delete_own on public.customer_favorites
  for delete to authenticated
  using (customer_id = (select auth.uid()));

create policy customer_favorites_superadmin_all on public.customer_favorites
  for all to authenticated
  using (is_superadmin())
  with check (is_superadmin());
