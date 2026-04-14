create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_customer_id_key unique (customer_id)
);

comment on table public.carts is 'Sepet (staging). Checkout öncesi seçimler; onayda kalemler ayrı orders satırlarına dönüşebilir.';

create index carts_customer_id_idx on public.carts (customer_id);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  service_id uuid not null references public.services (id),
  configuration jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cart_items is 'Sepet kalemi: hizmet + configuration. Tutar pricing_rules ile sunucuda hesaplanır.';

comment on column public.cart_items.configuration is 'Sipariş configuration_snapshot ile aynı anahtarlar (hizmet bazlı).';

create index cart_items_cart_id_idx on public.cart_items (cart_id);
create index cart_items_cart_sort_idx on public.cart_items (cart_id, sort_order);

create or replace function public.cart_items_bump_parent_cart_updated_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    update public.carts set updated_at = now() where id = old.cart_id;
    return old;
  else
    update public.carts set updated_at = now() where id = new.cart_id;
    return new;
  end if;
end;
$$;

create trigger cart_items_bump_parent_cart_updated_at
after insert or update or delete on public.cart_items
for each row execute function public.cart_items_bump_parent_cart_updated_at ();

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

create policy carts_select_own on public.carts
  for select to authenticated
  using (customer_id = (select auth.uid()));

create policy carts_insert_own on public.carts
  for insert to authenticated
  with check (customer_id = (select auth.uid()));

create policy carts_update_own on public.carts
  for update to authenticated
  using (customer_id = (select auth.uid()))
  with check (customer_id = (select auth.uid()));

create policy carts_delete_own on public.carts
  for delete to authenticated
  using (customer_id = (select auth.uid()));

create policy carts_superadmin_all on public.carts
  for all to authenticated
  using (is_superadmin())
  with check (is_superadmin());

create policy cart_items_select_own on public.cart_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.customer_id = (select auth.uid())
    )
  );

create policy cart_items_insert_own on public.cart_items
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.customer_id = (select auth.uid())
    )
  );

create policy cart_items_update_own on public.cart_items
  for update to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.customer_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.customer_id = (select auth.uid())
    )
  );

create policy cart_items_delete_own on public.cart_items
  for delete to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.customer_id = (select auth.uid())
    )
  );

create policy cart_items_superadmin_all on public.cart_items
  for all to authenticated
  using (is_superadmin())
  with check (is_superadmin());
