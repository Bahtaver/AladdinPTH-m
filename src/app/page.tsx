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
                fetchPriority="high"
                sizes="(max-width: 640px) 62vw, (max-width: 1024px) 48vw, 30rem"
                quality={65}
              />
            ) : (
              <span className="text-sm font-semibold">Aladdin Premium Care</span>
            )}
          </Link>
          <p className="hidden shrink-0 text-xs text-zinc-500 lg:block">
            Konumunuza gelen yapılandırılmış hizmet
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:py-14">
        <section className="space-y-4">
          <p className="text-sm font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
            Aladdin
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Temizlik ve Bakımda Yeni Standart
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Şeffaf fiyatlandırma, eğitimli ekip ve randevu takibiyle evinizde ve aracınızda
            profesyonel temizlik hizmeti sunuyoruz.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => (
            <ServiceCard key={s.id} service={s} imagePriority={idx === 0} />
          ))}
        </section>
      </main>
    </div>
  );
}
