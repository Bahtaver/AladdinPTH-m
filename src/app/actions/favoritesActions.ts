"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loadCartWithItems } from "@/lib/data/cartRepository";
import { getServiceBySlug } from "@/lib/data/servicesRepository";
import { listPricingRulesForService } from "@/lib/data/pricingRulesRepository";
import { getOrderDraft } from "@/lib/order/draftCookie";
import { configurationError } from "@/lib/order/configurationValidation";
import { quoteForRules, type OrderConfiguration } from "@/lib/pricing/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectSiparisHata(slug: string, message: string) {
  redirect(`/siparis/${encodeURIComponent(slug)}?hata=${encodeURIComponent(message)}`);
}

/**
 * Sipariş taslağındaki seçimlerle favori aç/kapa (sepete eklemeden).
 */
export async function toggleFavoriteFromOrderDraftForm(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    redirectSiparisHata(slug, "Favoriler için giriş yapmanız gerekir.");
  }
  const customerId = authUser!.id;

  const orderDraftRaw = await getOrderDraft();
  if (!orderDraftRaw || orderDraftRaw.serviceSlug !== slug) {
    redirectSiparisHata(slug, "Taslak bulunamadı veya hizmet eşleşmiyor.");
  }
  const orderDraft = orderDraftRaw!;

  const svcRaw = await getServiceBySlug(supabase, slug);
  if (!svcRaw?.slug) {
    redirectSiparisHata(slug, "Hizmet bulunamadı.");
  }
  const svc = svcRaw!;
  const serviceSlug = svc.slug as string;

  const cfg = orderDraft.configuration as OrderConfiguration;
  const cfgErr = configurationError(serviceSlug, cfg);
  if (cfgErr) {
    redirectSiparisHata(slug, cfgErr);
  }

  const rules = await listPricingRulesForService(supabase, svc.id);
  const quote = quoteForRules(rules, cfg);
  if (quote.total <= 0) {
    redirectSiparisHata(slug, "Geçerli bir tutar hesaplanamadı; seçimleri kontrol edin.");
  }

  const now = new Date().toISOString();
  const serviceId = svc.id;

  const { data: existing, error: selErr } = await supabase
    .from("customer_favorites")
    .select("id")
    .eq("customer_id", customerId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (selErr) {
    redirectSiparisHata(slug, selErr.message);
  }

  if (existing?.id) {
    const { error } = await supabase.from("customer_favorites").delete().eq("id", existing.id as string);
    if (error) {
      redirectSiparisHata(slug, error.message);
    }
  } else {
    const { error } = await supabase.from("customer_favorites").insert({
      customer_id: customerId,
      service_id: serviceId,
      selection_json: cfg as unknown as Record<string, unknown>,
      notify_on_discount: false,
      sort_order: 0,
      updated_at: now,
    });
    if (error) {
      redirectSiparisHata(slug, error.message);
    }
  }

  revalidatePath(`/siparis/${slug}`);
  revalidatePath("/favoriler");
  revalidatePath("/sepet");
  redirect(`/siparis/${slug}`);
}

/**
 * Sepet kalemindeki hizmet için favori aç/kapa.
 * Favori yoksa ekler; varsa favorilerden siler (sepet satırı durur). Çöp kutusu ayrıdır.
 */
export async function toggleFavoriteFromCartItemForm(formData: FormData) {
  const id = String(formData.get("cart_item_id") ?? "").trim();
  if (!id) {
    redirect(`/sepet?hata=${encodeURIComponent("Kalem kimliği eksik.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const bundle = await loadCartWithItems(supabase, user.id);
  const line = bundle?.items.find((i) => i.id === id);
  if (!line) {
    redirect(`/sepet?hata=${encodeURIComponent("Sepet kalemi bulunamadı veya güncellenmiş olabilir.")}`);
  }

  const slug = line.services?.slug;
  if (!slug) {
    redirect(`/sepet?hata=${encodeURIComponent("Hizmet bilgisi eksik.")}`);
  }

  const cfg = line.configuration as OrderConfiguration;
  const cfgErr = configurationError(slug, cfg);
  if (cfgErr) {
    redirect(`/sepet?hata=${encodeURIComponent(cfgErr)}`);
  }

  const now = new Date().toISOString();

  const { data: existing, error: selErr } = await supabase
    .from("customer_favorites")
    .select("id")
    .eq("customer_id", user.id)
    .eq("service_id", line.service_id)
    .maybeSingle();

  if (selErr) {
    redirect(`/sepet?hata=${encodeURIComponent(selErr.message)}`);
  }

  if (existing?.id) {
    const { error } = await supabase.from("customer_favorites").delete().eq("id", existing.id as string);
    if (error) {
      redirect(`/sepet?hata=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("customer_favorites").insert({
      customer_id: user.id,
      service_id: line.service_id,
      selection_json: cfg as unknown as Record<string, unknown>,
      notify_on_discount: false,
      sort_order: 0,
      updated_at: now,
    });
    if (error) {
      redirect(`/sepet?hata=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/favoriler");
  revalidatePath("/sepet");
  redirect("/sepet");
}
