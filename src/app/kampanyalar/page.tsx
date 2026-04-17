import type { Metadata } from "next";
import Link from "next/link";
import { CampaignCountdown } from "@/app/kampanyalar/CampaignCountdown";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Kampanyalar",
};

type CampaignCard = {
  id: string;
  name: string;
  description: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  minOrderTotal: number;
  audienceType: "all" | "anonymous_unverified" | "verified_only";
  endsAt: string | null;
  serviceSlug: string | null;
  serviceName: string | null;
  serviceSlugs: string[];
  isAllServices: boolean;
};

function discountText(c: CampaignCard): string {
  if (c.discountType === "percent") {
    if (c.maxDiscount && c.maxDiscount > 0) {
      return `%${c.discountValue} indirim (en fazla ${new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }).format(c.maxDiscount)})`;
    }
    return `%${c.discountValue} indirim`;
  }
  return `${new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(c.discountValue)} indirim`;
}

function audienceText(a: CampaignCard["audienceType"]): string {
  if (a === "anonymous_unverified") return "Anonim kullanıcı kampanyası";
  if (a === "verified_only") return "Doğrulanmış hesap kampanyası";
  return "Tüm kullanıcılara açık";
}

function audienceEligible(
  audienceType: CampaignCard["audienceType"],
  viewer: { isAnonymous: boolean; isVerified: boolean },
): boolean {
  if (audienceType === "all") return true;
  if (audienceType === "anonymous_unverified") return viewer.isAnonymous;
  if (audienceType === "verified_only") return viewer.isVerified;
  return false;
}

export default async function KampanyalarPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();
  const [{ data: campaignRows }, { data: activeServices }] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id,name,description,discount_type,discount_value,max_discount,min_order_total,audience_type,ends_at,is_active,status,campaign_services(service_id,services(name,slug))",
      )
      .eq("is_active", true)
      .eq("status", "active")
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order("priority", { ascending: false }),
    supabase.from("services").select("slug").eq("is_active", true).not("slug", "is", null),
  ]);
  const activeServiceSlugs = new Set(
    (activeServices ?? [])
      .map((s) => (s as { slug?: string | null }).slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
  );

  const usedCampaignIds = new Set<string>();
  if (user) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("pricing_breakdown")
      .eq("customer_id", user.id)
      .limit(200);
    for (const row of orderRows ?? []) {
      const lines = Array.isArray((row as { pricing_breakdown?: unknown }).pricing_breakdown)
        ? ((row as { pricing_breakdown?: unknown[] }).pricing_breakdown ?? [])
        : [];
      for (const line of lines) {
        const label = typeof (line as { label?: unknown }).label === "string"
          ? String((line as { label?: unknown }).label)
          : "";
        if (label.startsWith("campaign:")) {
          usedCampaignIds.add(label.replace("campaign:", ""));
        }
      }
    }
  }

  const viewer = {
    isAnonymous: user?.is_anonymous === true,
    isVerified: user?.is_anonymous !== true && Boolean(user?.email_confirmed_at),
  };

  const campaigns: CampaignCard[] = (campaignRows ?? []).map((r) => {
    const row = r as {
      id: string;
      name: string;
      description: string | null;
      discount_type: "percent" | "fixed";
      discount_value: string | number;
      max_discount: string | number | null;
      min_order_total: string | number;
      audience_type: "all" | "anonymous_unverified" | "verified_only";
      ends_at: string | null;
      campaign_services?: Array<{
        services?: { name?: string | null; slug?: string | null } | null;
      }>;
    };
    const firstService = row.campaign_services?.[0]?.services ?? null;
    const campaignServiceSlugs = Array.from(
      new Set(
        (row.campaign_services ?? [])
          .map((cs) => cs.services?.slug)
          .filter((slug): slug is string => typeof slug === "string" && slug.length > 0),
      ),
    );
    const isAllServices =
      activeServiceSlugs.size > 0 &&
      campaignServiceSlugs.length >= activeServiceSlugs.size &&
      Array.from(activeServiceSlugs).every((slug) => campaignServiceSlugs.includes(slug));
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      discountType: row.discount_type,
      discountValue: Number(row.discount_value),
      maxDiscount: row.max_discount == null ? null : Number(row.max_discount),
      minOrderTotal: Number(row.min_order_total),
      audienceType: row.audience_type,
      endsAt: row.ends_at,
      serviceSlug: firstService?.slug ?? null,
      serviceName: firstService?.name ?? null,
      serviceSlugs: campaignServiceSlugs,
      isAllServices,
    };
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Kampanyalar
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Size uygun fırsatları buradan takip edin. Uygunluk durumunuz karta göre anlık gösterilir.
      </p>

      {campaigns.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Şu anda aktif kampanya yok.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {campaigns.map((c) => {
            const eligible = audienceEligible(c.audienceType, viewer);
            const usedBefore = usedCampaignIds.has(c.id);
            const blocked = !eligible || usedBefore;
            const statusTone = usedBefore
              ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              : !eligible
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200";
            const statusText = usedBefore
              ? "Bu kampanyadan yararlandınız"
              : !eligible
                ? "Bu kampanya hesabınız için uygun değil"
                : "Kampanya hesabınıza uygun";
            return (
              <li
                key={c.id}
                className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{c.name}</p>
                    <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {discountText(c)}
                    </p>
                  </div>
                  <CampaignCountdown endsAt={c.endsAt} />
                </div>

                {c.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {c.description}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {c.isAllServices ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      Bütün alışverişinize özel
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {audienceText(c.audienceType)}
                  </span>
                  {c.minOrderTotal > 0 ? (
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      Min. sepet {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        maximumFractionDigits: 0,
                      }).format(c.minOrderTotal)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={["inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusTone].join(" ")}>
                    {statusText}
                  </span>
                  {c.isAllServices || c.serviceSlug ? (
                    <Link
                      href={
                        blocked
                          ? "/siparislerim"
                          : c.isAllServices
                            ? "/"
                            : `/siparis/${encodeURIComponent(c.serviceSlug as string)}`
                      }
                      className={[
                        "inline-flex rounded-xl px-3 py-2 text-xs font-semibold",
                        blocked
                          ? "border border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          : "bg-emerald-600 text-white hover:bg-emerald-500",
                      ].join(" ")}
                    >
                      {blocked
                        ? "Detayları gör"
                        : c.isAllServices
                          ? "Alışverişe başla"
                          : `${c.serviceName ?? "Hizmeti"} planla`}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
