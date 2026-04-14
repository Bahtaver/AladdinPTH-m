"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServiceBySlug } from "@/lib/data/servicesRepository";
import { needsCheckoutVerification } from "@/lib/auth/checkoutVerification";
import { configurationError } from "@/lib/order/configurationValidation";
import {
  clearOrderDraft,
  getOrderDraft,
  setOrderDraft,
} from "@/lib/order/draftCookie";
import type { OrderDraft } from "@/lib/order/draftSchema";
import { fulfillmentError } from "@/lib/order/fulfillmentValidation";
import { createPendingOrder } from "@/lib/order/pendingOrder";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function beginOrder(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/");
  if (slug === "touch-up-paint") redirect("/");

  const draft: OrderDraft = {
    serviceSlug: slug,
    step: "configure",
    configuration: {},
    fulfillment: {},
  };
  await setOrderDraft(draft);
  redirect(`/siparis/${slug}`);
}

/** Araç yıkama ve bakımı — rötuş seçiliyken renk kodu + feragatname. */
export async function saveTouchUpDetails(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (slug !== "car-wash") redirect("/");
  const draft = await getOrderDraft();
  if (!draft || draft.serviceSlug !== slug) redirect("/");
  if (draft.configuration.touch_up_requested !== true) redirect(`/siparis/${slug}`);

  const color = String(formData.get("color_code") ?? "").trim();
  const accepted = formData.get("disclaimer_accepted") === "on";

  const next: OrderDraft = {
    ...draft,
    configuration: {
      ...draft.configuration,
      color_code: color,
      disclaimer_accepted: accepted,
    },
  };
  await setOrderDraft(next);
  revalidatePath(`/siparis/${slug}`);
  redirect(`/siparis/${slug}`);
}

export async function updateDraftField(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const field = String(formData.get("field") ?? "").trim();
  const draft = await getOrderDraft();
  if (!draft || draft.serviceSlug !== slug) redirect("/");
  if (!field) redirect(`/siparis/${slug}`);

  const raw = formData.get("value");
  let value: unknown = raw;
  if (raw === null) value = undefined;
  else if (raw === "true") value = true;
  else if (raw === "false") value = false;
  else if (typeof raw === "string" && field === "sqm") {
    value = Number(raw.replace(",", "."));
  } else if (typeof raw === "string" && field === "window_count") {
    value = Number(raw);
  }

  let configuration: Record<string, unknown>;
  if (slug === "car-wash" && field === "touch_up_requested" && value === false) {
    configuration = { ...draft.configuration, touch_up_requested: false };
    delete configuration.color_code;
    delete configuration.disclaimer_accepted;
  } else {
    configuration = { ...draft.configuration, [field]: value };
  }

  const next: OrderDraft = {
    ...draft,
    configuration,
  };
  await setOrderDraft(next);
  revalidatePath(`/siparis/${slug}`);
  redirect(`/siparis/${slug}`);
}

export async function goToStep(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const step = String(formData.get("step") ?? "").trim() as OrderDraft["step"];
  const draft = await getOrderDraft();
  if (!draft || draft.serviceSlug !== slug) redirect("/");
  if (step !== "configure" && step !== "address" && step !== "review") {
    redirect(`/siparis/${slug}`);
  }

  if (step === "address") {
    const err = configurationError(slug, draft.configuration);
    if (err) {
      revalidatePath(`/siparis/${slug}`);
      redirect(`/siparis/${slug}?hata=${encodeURIComponent(err)}`);
    }
  }

  if (step === "review") {
    const err = configurationError(slug, draft.configuration);
    if (err) {
      redirect(`/siparis/${slug}?hata=${encodeURIComponent(err)}`);
    }
    const fe = fulfillmentError(draft.fulfillment);
    if (fe) {
      redirect(`/siparis/${slug}?hata=${encodeURIComponent(fe)}`);
    }
  }

  await setOrderDraft({ ...draft, step });
  revalidatePath(`/siparis/${slug}`);
  redirect(`/siparis/${slug}`);
}

export async function saveFulfillment(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const draft = await getOrderDraft();
  if (!draft || draft.serviceSlug !== slug) redirect("/");

  const tw = String(formData.get("time_window_preference") ?? "").trim();
  const allowed = ["morning", "afternoon", "evening", "flexible"] as const;
  const time_window_preference = allowed.includes(tw as (typeof allowed)[number])
    ? (tw as (typeof allowed)[number])
    : undefined;

  const next: OrderDraft = {
    ...draft,
    fulfillment: {
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address_line: String(formData.get("address_line") ?? ""),
      time_window_preference,
      customer_note: String(formData.get("customer_note") ?? ""),
    },
    step: "review",
  };

  const fe = fulfillmentError(next.fulfillment);
  if (fe) {
    redirect(`/siparis/${slug}?hata=${encodeURIComponent(fe)}`);
  }

  await setOrderDraft(next);
  revalidatePath(`/siparis/${slug}`);
  redirect(`/siparis/${slug}`);
}

export async function submitOrder(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const draft = await getOrderDraft();
  if (!draft || draft.serviceSlug !== slug) redirect("/");

  const cfgErr = configurationError(slug, draft.configuration);
  if (cfgErr) redirect(`/siparis/${slug}?hata=${encodeURIComponent(cfgErr)}`);

  const fe = fulfillmentError(draft.fulfillment);
  if (fe) redirect(`/siparis/${slug}?hata=${encodeURIComponent(fe)}`);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/siparis/${slug}?hata=${encodeURIComponent(
        "Oturum bulunamadı. Sayfayı bir kez yenileyin; sorun sürerse Supabase’de Anonymous oturumunun açık olduğundan emin olun.",
      )}`,
    );
  }

  if (needsCheckoutVerification(user)) {
    redirect(
      `/siparis/${slug}?hata=${encodeURIComponent(
        "Siparişi tamamlamak için önce e-posta doğrulamasını bitirin.",
      )}`,
    );
  }

  const service = await getServiceBySlug(supabase, slug);
  if (!service) redirect("/");

  const created = await createPendingOrder(supabase, {
    customerId: user.id,
    service,
    configuration: draft.configuration,
    fulfillment: draft.fulfillment,
  });

  if (!created.ok) {
    redirect(`/siparis/${slug}?hata=${encodeURIComponent(created.error)}`);
  }

  const orderId = created.orderId;

  await clearOrderDraft();
  redirect(`/siparis/${slug}/tesekkurler?no=${encodeURIComponent(orderId)}`);
}
