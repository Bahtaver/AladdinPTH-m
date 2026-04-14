import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addOrderDraftToCart } from "@/app/actions/cartActions";
import { beginOrder } from "@/app/actions/orderFlow";
import { StepRail } from "@/components/commerce/StepRail";
import { TrustPanel } from "@/components/commerce/TrustPanel";
import {
  getDefaultServiceConfiguration,
  getServiceBySlug,
} from "@/lib/data/servicesRepository";
import { listPricingRulesForService } from "@/lib/data/pricingRulesRepository";
import { getOrderDraft } from "@/lib/order/draftCookie";
import { configurationError } from "@/lib/order/configurationValidation";
import {
  CHECKOUT_VERIFICATION_ENABLED,
  needsCheckoutVerification,
} from "@/lib/auth/checkoutVerification";
import { quoteForRules } from "@/lib/pricing/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerAddressRow } from "@/types/database";
import { AddressSection } from "./AddressSection";
import { ConfigureSection } from "./ConfigureSection";
import { ContinueBar } from "./ContinueBar";
import { DraftFavoriteButton } from "./DraftFavoriteButton";
import { ReviewSection } from "./ReviewSection";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hata?: string }>;
};

export default async function SiparisPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (slug === "touch-up-paint") {
    redirect("/");
  }
  const { hata: hataRaw } = await searchParams;
  const hata =
    typeof hataRaw === "string"
      ? (() => {
          try {
            return decodeURIComponent(hataRaw);
          } catch {
            return hataRaw;
          }
        })()
      : undefined;

  const supabase = await createSupabaseServerClient();
  const service = await getServiceBySlug(supabase, slug);
  if (!service?.slug) notFound();

  const [draft, rules, svcConfig] = await Promise.all([
    getOrderDraft(),
    listPricingRulesForService(supabase, service.id),
    getDefaultServiceConfiguration(supabase, service.id),
  ]);

  const quote = quoteForRules(rules, draft?.configuration ?? {});
  const cfgErr = draft
    ? configurationError(service.slug as string, draft.configuration)
    : "Taslak bulunamadı";
  const canAddConfiguredServiceToCart = !cfgErr && quote.total > 0;

  const {
    data: { user: accountUser },
  } = await supabase.auth.getUser();

  let draftServiceFavorited = false;
  if (accountUser) {
    const { data: favRow } = await supabase
      .from("customer_favorites")
      .select("id")
      .eq("customer_id", accountUser.id)
      .eq("service_id", service.id)
      .maybeSingle();
    draftServiceFavorited = Boolean(favRow?.id);
  }

  let needsAuthVerification = false;
  if (draft?.step === "review" && CHECKOUT_VERIFICATION_ENABLED) {
    needsAuthVerification = needsCheckoutVerification(accountUser);
  }

  const trustRaw = svcConfig?.definition?.trust;
  const trust =
    trustRaw && typeof trustRaw === "object" && !Array.isArray(trustRaw)
      ? (trustRaw as { title?: string; body?: string })
      : null;

  let savedAddresses: CustomerAddressRow[] = [];
  if (draft?.serviceSlug === slug && draft.step === "address") {
    if (accountUser) {
      const { data: addrRows } = await supabase
        .from("customer_addresses")
        .select("id, label, address_line, created_at")
        .eq("customer_id", accountUser.id)
        .order("created_at", { ascending: true });
      savedAddresses = (addrRows ?? []) as CustomerAddressRow[];
    }
  }

  if (!draft || draft.serviceSlug !== slug) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-4 py-16">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Taslak bulunamadı
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Rehberli sipariş akışı çerez tabanlı bir taslak kullanır. Ana sayfadan
            hizmet seçerek yeniden başlayın.
          </p>
        </div>
        <form action={beginOrder}>
          <input type="hidden" name="slug" value={slug} />
          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Bu hizmet için başlat
          </button>
        </form>
        <Link
          href="/"
          className="text-center text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
        >
          Ana sayfaya dön
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
          <Link
            href="/"
            className="text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
          >
            ← Ana sayfa
          </Link>
          <Link
            href="/profil"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Profilim
          </Link>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
          Rehberli sipariş
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {service.name}
        </h1>
        {service.long_description ? (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {service.long_description}
          </p>
        ) : null}
        <StepRail slug={slug} step={draft.step} />
      </header>

      {hata ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50"
        >
          {hata}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {draft.step === "configure" ? (
            <ConfigureSection slug={slug} draft={draft} quote={quote} />
          ) : null}
          {draft.step === "address" ? (
            <AddressSection
              slug={slug}
              draft={draft}
              savedAddresses={savedAddresses}
              showFavorite={Boolean(accountUser)}
              isFavorited={draftServiceFavorited}
              canFavorite={canAddConfiguredServiceToCart}
            />
          ) : null}
          {draft.step === "review" ? (
            <ReviewSection
              slug={slug}
              draft={draft}
              quote={quote}
              needsAuthVerification={needsAuthVerification}
              showFavorite={Boolean(accountUser)}
              isFavorited={draftServiceFavorited}
              canFavorite={canAddConfiguredServiceToCart}
            />
          ) : null}

          {draft.step === "configure" ? (
            <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {canAddConfiguredServiceToCart ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  {accountUser ? (
                    <DraftFavoriteButton
                      slug={slug}
                      isFavorited={draftServiceFavorited}
                      disabled={false}
                    />
                  ) : null}
                  <form action={addOrderDraftToCart} className="min-w-0 flex-1">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="draft_source" value="configure" />
                    <p className="mb-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      <strong>Aynı adrese</strong> birden fazla hizmet eklemek için seçimlerinizi sepete
                      atın; ardından ana sayfadan başka bir hizmete geçebilirsiniz. Teslimat adresini
                      sepette tek seferde girersiniz. <strong>Farklı adres</strong> isteyenler her
                      hizmeti ayrı ayrı bu akışta tamamlayabilir veya sepette sipariş kalemlerini
                      işaretleyerek ayrı checkout yapabilir.
                    </p>
                    <button
                      type="submit"
                      className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/80 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                    >
                      Sepete ekle (seçimleri sıfırlar, yapılandırmada kalırsınız)
                    </button>
                  </form>
                </div>
              ) : null}
              <ContinueBar
                slug={slug}
                nextStep="address"
                disabled={Boolean(cfgErr)}
                label="Adres bilgisine geç"
              />
            </div>
          ) : null}
        </section>

        <div className="space-y-4">
          <TrustPanel trust={trust} />
          <div className="rounded-3xl border border-dashed border-zinc-200 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            <p>
              Bu deneyim randevu takvimi değil: seçtiklerinizle hizmeti
              yapılandırıyor, adresinize sipariş veriyorsunuz. Kesin saat
              seçtirmiyoruz; ekip gün içi size yakın bir aralıkta ulaşır.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
