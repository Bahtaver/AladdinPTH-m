import Image from "next/image";
import Link from "next/link";
import { ServiceCard } from "@/components/commerce/ServiceCard";
import { listActiveServices } from "@/lib/data/servicesRepository";
import { BRAND_STORAGE_PATHS } from "@/lib/storage/brandAssets";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const services = await listActiveServices(supabase);
  const logo = publicServiceAssetUrl(BRAND_STORAGE_PATHS.headerLogo);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-5">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
            {logo ? (
              <Image
                src={logo}
                alt="Aladdin Premium Care"
                width={640}
                height={192}
                className="h-14 w-auto max-w-[min(62vw,13.5rem)] object-contain object-left sm:h-24 sm:max-w-[min(48vw,24rem)] lg:h-[7.25rem] lg:max-w-[min(38vw,30rem)]"
                priority
                unoptimized
              />
            ) : (
              <span className="text-sm font-semibold">Aladdin Premium Care</span>
            )}
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/profil"
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:border-emerald-200 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-800 dark:hover:text-emerald-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-500" aria-hidden>
                <path
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Profilim
            </Link>
            <p className="hidden text-xs text-zinc-500 lg:block">
              Konumunuza gelen yapılandırılmış hizmet
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:py-14">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Hizmet mağazası
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Evinize ve aracınıza güvenilir, adım adım sipariş deneyimi
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Takvim seçtirmiyoruz: önce hizmeti seçin, detayları rehberde
            tamamlayın, canlı fiyatı görün, adresinizi girin ve onaylayın. Zaman
            tercihiniz hafif bir pencere olarak kalır.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </section>
      </main>
    </div>
  );
}
