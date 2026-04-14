import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyCartWithItems } from "@/app/actions/cartActions";
import { loadFavoritesWithServices } from "@/lib/data/favoritesRepository";
import { SepetCartWithCheckout } from "@/app/sepet/SepetCartWithCheckout";
import { getServiceCardCoverPath } from "@/config/homeServiceCardMedia";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";
import {
  CHECKOUT_VERIFICATION_ENABLED,
  needsCheckoutVerification,
} from "@/lib/auth/checkoutVerification";
import { listPricingRulesForService } from "@/lib/data/pricingRulesRepository";
import type { OrderConfiguration } from "@/lib/pricing/engine";
import { quoteForRules } from "@/lib/pricing/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerAddressRow } from "@/types/database";

export const metadata: Metadata = {
  title: "Sepetim",
};

type PageProps = {
  searchParams: Promise<{ hata?: string }>;
};

function decodeHata(raw: string | undefined): string | undefined {
  if (typeof raw !== "string") return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default async function SepetPage({ searchParams }: PageProps) {
  const { hata: hataRaw } = await searchParams;
  const hata = decodeHata(hataRaw);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const bundle = await getMyCartWithItems();
  const empty = !bundle || bundle.items.length === 0;

  const [{ data: profile }, { data: addrRows }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("customer_addresses")
      .select("id, label, address_line, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const savedAddresses = (addrRows ?? []) as CustomerAddressRow[];
  const profileDefaults = {
    full_name: String(profile?.full_name ?? "").trim(),
    phone: String(profile?.phone ?? "").trim(),
  };

  const pricedLines =
    bundle && bundle.items.length > 0
      ? await Promise.all(
          bundle.items.map(async (it) => {
            const rules = await listPricingRulesForService(supabase, it.service_id);
            const quote = quoteForRules(rules, it.configuration as OrderConfiguration);
            return {
              id: it.id,
              serviceName: it.services?.name ?? "Hizmet",
              quote,
            };
          }),
        )
      : [];

  const needsAuthVerification =
    CHECKOUT_VERIFICATION_ENABLED && needsCheckoutVerification(user);

  const favoriteRows = await loadFavoritesWithServices(supabase, user.id);
  const favoritedServiceIds = favoriteRows.map((r) => r.service_id);

  const checkoutFormId =
    CHECKOUT_VERIFICATION_ENABLED && needsAuthVerification ? null : "sepet-checkout-form";

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-xs font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
        >
          ← Ana sayfa
        </Link>
        <h1 className="text-sm font-semibold tracking-tight">Sepetim</h1>
        <Link
          href="/profil"
          className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Profilim
        </Link>
      </header>

      {hata ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50"
        >
          {hata}
        </div>
      ) : null}

      {empty ? (
        <div className="space-y-4 rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Sepetiniz boş.</p>
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Hizmet seç
          </Link>
        </div>
      ) : (
        <SepetCartWithCheckout
          checkoutFormId={checkoutFormId}
          displayLines={bundle.items.map((it, idx) => {
            const priced = pricedLines[idx];
            const slug = it.services?.slug ?? "";
            const coverPath = getServiceCardCoverPath(
              slug,
              it.services?.cover_image_path ?? null,
            );
            return {
              id: it.id,
              serviceId: it.service_id,
              serviceName: it.services?.name ?? "Hizmet",
              slug,
              imgUrl: publicServiceAssetUrl(coverPath),
              total: priced?.quote.total ?? 0,
              currency: priced?.quote.currency ?? "TRY",
            };
          })}
          favoritedServiceIds={favoritedServiceIds}
          pricedLines={pricedLines}
          savedAddresses={savedAddresses}
          profileDefaults={profileDefaults}
          needsAuthVerification={needsAuthVerification}
          defaultGateOpen={CHECKOUT_VERIFICATION_ENABLED && needsAuthVerification}
        />
      )}
    </main>
  );
}
