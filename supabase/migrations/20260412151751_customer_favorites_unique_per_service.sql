-- Aynı hizmet için müşteri başına tek favori satırı; tekrar favorilemede upsert ile güncellenir (updated_at).
-- Önce mükerrer satırlar temizlenir (en güncel tutulur).

delete from public.customer_favorites cf
where cf.id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by customer_id, service_id
        order by updated_at desc nulls last, created_at desc
      ) as rn
    from public.customer_favorites
  ) t
  where t.rn > 1
);

do $m$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customer_favorites_unique_customer_service'
  ) then
    alter table public.customer_favorites
      add constraint customer_favorites_unique_customer_service
      unique (customer_id, service_id);
  end if;
end
$m$;
