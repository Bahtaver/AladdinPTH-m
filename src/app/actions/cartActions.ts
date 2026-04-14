"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { needsCheckoutVerification } from "@/lib/auth/checkoutVerification";
import {
  ensureCustomerCartId,
  loadCartWithItems,
  type CartItemWithService,
} from "@/lib/data/cartRepository";
import { listPricingRulesForService } from "@/lib/data/pricingRulesRepository";
import { getServiceById, getServiceBySlug } from "@/lib/data/servicesRepository";
import { configurationError } from "@/lib/order/configurationValidation";
import { getOrderDraft, setOrderDraft } from "@/lib/order/draftCookie";
import type { Fulfillment, OrderDraft } from "@/lib/order/draftSchema";
import { fulfillmentError } from "@/lib/order/fulfillmentValidation";
import { quoteForRules, type OrderConfiguration, type PricedLine } from "@/lib/pricing/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CartRow } from "@/types/database";

function mapLinesToRpc(lines: PricedLine[]) {
  return lines.map((l) => ({
    line_code: l.label,
    line_label: l.title,
    quantity: l.quantity ?? null,
    unit_price: l.unit_price ?? null,
    line_total: l.line_total,
    pricing_rule_id: l.pricing_rule_id,
    price: l.line_total,
  }));
}

function rpcErrorMessage(code: string | undefined): string {
  switch (code) {
    case "not_authenticated":
      return "Oturum bulunamadı.";
    case "cart_id_required":
      return "Sepet bilgisi eksik.";
    case "cart_not_found":
      return "Sepet bulunamadı veya erişim yok.";
    case "fulfillment_required":
      return "Teslimat bilgileri eksik.";
    case "orders_required":
    case "no_orders":
      return "Sepette onaylanacak kalem yok.";
    case "cart_item_not_found":
      return "Sepet kalemi bulunamadı veya güncellenmiş olabilir.";
    default:
      return code ?? "Checkout tamamlanamadı.";
  }
}

export type CartSnapshot = { cart: CartRow; items: CartItemWithService[] } | null;

export async function getMyCartWithItems(): Promise<CartSnapshot> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return loadCartWithItems(supabase, user.id);
}

export async function addCartItem(input: {
  serviceSlug: string;
  configuration: OrderConfiguration;
}): Promise<{ ok: true; cartItemId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const service = await getServiceBySlug(supabase, input.serviceSlug);
  if (!service?.slug) {
    return { ok: false, error: "Hizmet bulunamadı." };
  }

  const cfgErr = configurationError(service.slug, input.configuration);
  if (cfgErr) return { ok: false, error: cfgErr };

  const rules = await listPricingRulesForService(supabase, service.id);
  const quote = quoteForRules(rules, input.configuration);
  if (quote.total <= 0) {
    return {
      ok: false,
      error: "Geçerli bir tutar hesaplanamadı; seçimleri kontrol edin.",
    };
  }

  const cartId = await ensureCustomerCartId(supabase, user.id);

  const { data: last } = await supabase
    .from("cart_items")
    .select("sort_order")
    .eq("cart_id", cartId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = typeof last?.sort_order === "number" ? last.sort_order + 1 : 0;

  const { data: row, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cartId,
      service_id: service.id,
      configuration: input.configuration,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error || !row?.id) {
    return { ok: false, error: error?.message ?? "Sepete eklenemedi." };
  }

  revalidatePath("/");
  revalidatePath("/sepet");
  return { ok: true, cartItemId: row.id as string };
}

export async function updateCartItem(input: {
  cartItemId: string;
  configuration: OrderConfiguration;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: item, error: selErr } = await supabase
    .from("cart_items")
    .select("id, service_id")
    .eq("id", input.cartItemId)
    .maybeSingle();

  if (selErr || !item) {
    return { ok: false, error: selErr?.message ?? "Kalem bulunamadı." };
  }

  const row = item as { id: string; service_id: string };
  const service = await getServiceById(supabase, row.service_id);
  if (!service?.slug) {
    return { ok: false, error: "Hizmet bulunamadı." };
  }

  const cfgErr = configurationError(service.slug, input.configuration);
  if (cfgErr) return { ok: false, error: cfgErr };

  const rules = await listPricingRulesForService(supabase, service.id);
  const quote = quoteForRules(rules, input.configuration);
  if (quote.total <= 0) {
    return {
      ok: false,
      error: "Geçerli bir tutar hesaplanamadı; seçimleri kontrol edin.",
    };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("cart_items")
    .update({ configuration: input.configuration, updated_at: now })
    .eq("id", input.cartItemId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/sepet");
  return { ok: true };
}

export async function removeCartItem(cartItemId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/sepet");
  return { ok: true };
}

export async function removeCartItemFromForm(formData: FormData) {
  const id = String(formData.get("cart_item_id") ?? "").trim();
  if (!id) {
    redirect(`/sepet?hata=${encodeURIComponent("Kalem kimliği eksik.")}`);
  }
  const r = await removeCartItem(id);
  if (!r.ok) {
    redirect(`/sepet?hata=${encodeURIComponent(r.error)}`);
  }
  redirect("/sepet");
}

function fulfillmentFromAddressForm(formData: FormData): Fulfillment {
  const tw = String(formData.get("time_window_preference") ?? "").trim();
  const allowed = ["morning", "afternoon", "evening", "flexible"] as const;
  const time_window_preference = allowed.includes(tw as (typeof allowed)[number])
    ? (tw as (typeof allowed)[number])
    : undefined;
  return {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address_line: String(formData.get("address_line") ?? ""),
    time_window_preference,
    customer_note: String(formData.get("customer_note") ?? ""),
  };
}

/**
 * `draft_source`:
 * - `configure` — seçimler tamam, adres adımına geçmeden sepete (aynı adrese çoklu hizmet).
 * - `address` — adres formu alanlarıyla birlikte sepete.
 * - `review` — özet adımından sepete (sonra yapılandırma adımına döner).
 * Sepete eklendikten sonra `configuration` sıfırlanır; `fulfillment` kaynağa göre güncellenir veya korunur.
 */
export async function addOrderDraftToCart(formData: FormData) {
  const draftSource = String(formData.get("draft_source") ?? "review").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  const draft = await getOrderDraft();
  if (!draft) {
    redirect(`/?hata=${encodeURIComponent("Taslak bulunamadı. Ana sayfadan hizmet seçerek başlayın.")}`);
  }

  const serviceSlug = draft.serviceSlug;
  if (slug && slug !== serviceSlug) {
    redirect(`/siparis/${serviceSlug}?hata=${encodeURIComponent("Taslak hizmeti eşleşmiyor.")}`);
  }

  let fulfillment = draft.fulfillment;
  if (draftSource === "address") {
    fulfillment = fulfillmentFromAddressForm(formData);
    const fe = fulfillmentError(fulfillment);
    if (fe) {
      redirect(`/siparis/${serviceSlug}?hata=${encodeURIComponent(fe)}`);
    }
  }

  const cfgErr = configurationError(serviceSlug, draft.configuration);
  if (cfgErr) {
    redirect(`/siparis/${serviceSlug}?hata=${encodeURIComponent(cfgErr)}`);
  }

  const res = await addCartItem({
    serviceSlug,
    configuration: draft.configuration,
  });
  if (!res.ok) {
    redirect(`/siparis/${serviceSlug}?hata=${encodeURIComponent(res.error)}`);
  }

  const nextStep: OrderDraft["step"] =
    draftSource === "address" ? "address" : "configure";
  await setOrderDraft({
    serviceSlug,
    step: nextStep,
    configuration: {},
    fulfillment,
  });

  revalidatePath(`/siparis/${serviceSlug}`);
  revalidatePath("/sepet");
  redirect(`/siparis/${serviceSlug}`);
}

function parseTimeWindow(
  raw: FormDataEntryValue | null,
): Fulfillment["time_window_preference"] {
  const tw = String(raw ?? "").trim();
  const allowed = ["morning", "afternoon", "evening", "flexible"] as const;
  return allowed.includes(tw as (typeof allowed)[number])
    ? (tw as (typeof allowed)[number])
    : undefined;
}

export async function submitCartCheckout(formData: FormData) {
  const rawIds = formData.getAll("cart_item_id").map((v) => String(v).trim()).filter(Boolean);
  const fulfillment: Fulfillment = {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address_line: String(formData.get("address_line") ?? ""),
    time_window_preference: parseTimeWindow(formData.get("time_window_preference")),
    customer_note: String(formData.get("customer_note") ?? ""),
  };

  const result = await checkoutCart({
    fulfillment,
    cartItemIds: rawIds,
  });

  if (!result.ok) {
    redirect(`/sepet?hata=${encodeURIComponent(result.error)}`);
  }

  const nos = result.orderIds.join(",");
  redirect(`/sepet/tesekkurler?no=${encodeURIComponent(nos)}`);
}

export async function checkoutCart(input: {
  fulfillment: Fulfillment;
  cartItemIds?: string[] | null;
}): Promise<{ ok: true; orderIds: string[] } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Oturum bulunamadı." };
  }

  if (needsCheckoutVerification(user)) {
    return {
      ok: false,
      error: "Siparişi tamamlamak için önce e-posta doğrulamasını bitirin.",
    };
  }

  const fe = fulfillmentError(input.fulfillment);
  if (fe) return { ok: false, error: fe };

  const bundle = await loadCartWithItems(supabase, user.id);
  if (!bundle || bundle.items.length === 0) {
    return { ok: false, error: "Sepet boş." };
  }

  let selected: typeof bundle.items;
  if (input.cartItemIds === undefined || input.cartItemIds === null) {
    selected = bundle.items;
  } else if (input.cartItemIds.length === 0) {
    return { ok: false, error: "En az bir hizmet seçin." };
  } else {
    const idSet = new Set(input.cartItemIds);
    selected = bundle.items.filter((i) => idSet.has(i.id));
    if (selected.length === 0) {
      return { ok: false, error: "Seçilen kalem bulunamadı." };
    }
  }

  const ordersPayload: Record<string, unknown>[] = [];

  for (const line of selected) {
    const slug = line.services?.slug;
    if (!slug) {
      return { ok: false, error: "Sepette geçersiz hizmet satırı var." };
    }

    const cfg = line.configuration as OrderConfiguration;
    const cfgErr = configurationError(slug, cfg);
    if (cfgErr) return { ok: false, error: cfgErr };

    const service = await getServiceById(supabase, line.service_id);
    if (!service?.slug) {
      return { ok: false, error: "Hizmet bulunamadı." };
    }

    const rules = await listPricingRulesForService(supabase, line.service_id);
    const quote = quoteForRules(rules, cfg);
    if (quote.total <= 0) {
      return {
        ok: false,
        error: "Geçerli bir tutar hesaplanamadı; seçimleri kontrol edin.",
      };
    }

    const disclaimerAcceptedAt =
      slug === "car-wash" &&
      cfg.touch_up_requested === true &&
      cfg.disclaimer_accepted === true
        ? new Date().toISOString()
        : null;

    ordersPayload.push({
      cart_item_id: line.id,
      service_id: line.service_id,
      total_price: quote.total,
      currency: quote.currency,
      configuration_snapshot: cfg,
      pricing_breakdown: quote.lines,
      disclaimer_accepted_at: disclaimerAcceptedAt,
      order_lines: mapLinesToRpc(quote.lines),
    });
  }

  const { data, error } = await supabase.rpc("checkout_staged_cart", {
    p_payload: {
      cart_id: bundle.cart.id,
      fulfillment: {
        full_name: input.fulfillment.full_name ?? "",
        phone: input.fulfillment.phone ?? "",
        address_line: input.fulfillment.address_line ?? "",
        time_window_preference: input.fulfillment.time_window_preference ?? "",
        customer_note: input.fulfillment.customer_note ?? "",
      },
      orders: ordersPayload,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const body = data as { ok?: boolean; error?: string; order_ids?: string[] } | null;
  if (!body?.ok) {
    return { ok: false, error: rpcErrorMessage(body?.error) };
  }

  const orderIds = Array.isArray(body.order_ids)
    ? body.order_ids.map((id) => String(id))
    : [];

  revalidatePath("/");
  revalidatePath("/sepet");
  return { ok: true, orderIds };
}
