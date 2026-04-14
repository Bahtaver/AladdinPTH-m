create or replace function public.checkout_staged_cart(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_cart_id uuid;
  v_fulfillment jsonb;
  v_orders jsonb;
  n int;
  i int;
  rec jsonb;
  m int;
  j int;
  v_line jsonb;
  v_order_id uuid;
  v_order_ids uuid[] := array[]::uuid[];
begin
  if v_customer_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  v_cart_id := (p_payload->>'cart_id')::uuid;
  if v_cart_id is null then
    return jsonb_build_object('ok', false, 'error', 'cart_id_required');
  end if;

  if not exists (
    select 1
    from public.carts c
    where c.id = v_cart_id
      and c.customer_id = v_customer_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'cart_not_found');
  end if;

  v_fulfillment := p_payload->'fulfillment';
  if v_fulfillment is null then
    return jsonb_build_object('ok', false, 'error', 'fulfillment_required');
  end if;

  v_orders := p_payload->'orders';
  if v_orders is null or jsonb_typeof(v_orders) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'orders_required');
  end if;

  n := jsonb_array_length(v_orders);
  if n is null or n = 0 then
    return jsonb_build_object('ok', false, 'error', 'no_orders');
  end if;

  for i in 0 .. n - 1 loop
    rec := v_orders->i;
    if not exists (
      select 1
      from public.cart_items ci
      where ci.id = (rec->>'cart_item_id')::uuid
        and ci.cart_id = v_cart_id
    ) then
      return jsonb_build_object('ok', false, 'error', 'cart_item_not_found');
    end if;
  end loop;

  for i in 0 .. n - 1 loop
    rec := v_orders->i;

    insert into public.orders (
      customer_id,
      service_id,
      total_price,
      currency,
      configuration_snapshot,
      pricing_breakdown,
      full_name,
      phone,
      address,
      time_window_preference,
      customer_note,
      status,
      disclaimer_accepted_at
    ) values (
      v_customer_id,
      (rec->>'service_id')::uuid,
      (rec->>'total_price')::numeric,
      coalesce(nullif(rec->>'currency', ''), 'TRY'),
      coalesce(rec->'configuration_snapshot', '{}'::jsonb),
      coalesce(rec->'pricing_breakdown', '[]'::jsonb),
      nullif(btrim(v_fulfillment->>'full_name'), ''),
      nullif(btrim(v_fulfillment->>'phone'), ''),
      nullif(btrim(v_fulfillment->>'address_line'), ''),
      nullif(btrim(v_fulfillment->>'time_window_preference'), ''),
      nullif(btrim(v_fulfillment->>'customer_note'), ''),
      'pending',
      case
        when nullif(rec->>'disclaimer_accepted_at', '') is null then null
        else (rec->>'disclaimer_accepted_at')::timestamptz
      end
    )
    returning id into v_order_id;

    v_order_ids := array_append(v_order_ids, v_order_id);

    m := coalesce(jsonb_array_length(rec->'order_lines'), 0);
    for j in 0 .. m - 1 loop
      v_line := (rec->'order_lines')->j;
      insert into public.order_items (
        order_id,
        line_code,
        line_label,
        quantity,
        unit_price,
        line_total,
        pricing_rule_id,
        price
      ) values (
        v_order_id,
        nullif(v_line->>'line_code', ''),
        nullif(v_line->>'line_label', ''),
        nullif(v_line->>'quantity', '')::numeric,
        nullif(v_line->>'unit_price', '')::numeric,
        (v_line->>'line_total')::numeric,
        case
          when nullif(v_line->>'pricing_rule_id', '') is null then null
          else (v_line->>'pricing_rule_id')::uuid
        end,
        (v_line->>'price')::numeric
      );
    end loop;

    delete from public.cart_items
    where id = (rec->>'cart_item_id')::uuid
      and cart_id = v_cart_id;
  end loop;

  return jsonb_build_object('ok', true, 'order_ids', to_jsonb(v_order_ids));
end;
$$;

comment on function public.checkout_staged_cart(jsonb) is
  'Atomik sepet checkout: doğrulanmış fiyat satırlarıyla N sipariş + kalemler, ardından sepet kalemlerini siler.';

grant execute on function public.checkout_staged_cart(jsonb) to authenticated;
