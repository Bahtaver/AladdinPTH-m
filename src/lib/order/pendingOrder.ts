import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceRow } from "@/types/database";
import { listPricingRulesForService } from "@/lib/data/pricingRulesRepository";
import { configurationError } from "@/lib/order/configurationValidation";
import type { Fulfillment } from "@/lib/order/draftSchema";
import { quoteForRules, type OrderConfiguration } from "@/lib/pricing/engine";

export type CreatePendingOrderInput = {
  customerId: string;
  service: ServiceRow;
  configuration: OrderConfiguration;
  fulfillment: Fulfillment;
};

/**
 * Tek sipariş + order_items (rehberli akış ve ileride diğer giriş noktaları için ortak).
 */
export async function createPendingOrder(
  supabase: SupabaseClient,
  input: CreatePendingOrderInput,
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const { customerId, service, configuration, fulfillment } = input;
  const slug = service.slug;
  if (!slug) {
    return { ok: false, error: "Hizmet slug bilgisi yok." };
  }

  const cfgErr = configurationError(slug, configuration);
  if (cfgErr) return { ok: false, error: cfgErr };

  const rules = await listPricingRulesForService(supabase, service.id);
  const quote = quoteForRules(rules, configuration);
  if (quote.total <= 0) {
    return {
      ok: false,
      error: "Geçerli bir tutar hesaplanamadı; seçimleri kontrol edin.",
    };
  }

  const disclaimerAcceptedAt =
    slug === "car-wash" &&
    configuration.touch_up_requested === true &&
    configuration.disclaimer_accepted === true
      ? new Date().toISOString()
      : null;

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      service_id: service.id,
      total_price: quote.total,
      currency: quote.currency,
      configuration_snapshot: configuration,
      pricing_breakdown: quote.lines,
      full_name: fulfillment.full_name ?? null,
      phone: fulfillment.phone ?? null,
      address: fulfillment.address_line ?? null,
      time_window_preference: fulfillment.time_window_preference ?? null,
      customer_note: fulfillment.customer_note ?? null,
      status: "pending",
      disclaimer_accepted_at: disclaimerAcceptedAt,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    return {
      ok: false,
      error: orderError?.message ?? "Sipariş kaydedilemedi.",
    };
  }

  const orderId = orderRow.id as string;

  const itemRows = quote.lines.map((l) => ({
    order_id: orderId,
    line_code: l.label,
    line_label: l.title,
    quantity: l.quantity ?? null,
    unit_price: l.unit_price ?? null,
    line_total: l.line_total,
    pricing_rule_id: l.pricing_rule_id,
    price: l.line_total,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
  if (itemsError) {
    return { ok: false, error: itemsError.message };
  }

  return { ok: true, orderId };
}
