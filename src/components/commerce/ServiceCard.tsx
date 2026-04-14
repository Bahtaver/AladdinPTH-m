import Image from "next/image";
import { getServiceCardCoverPath } from "@/config/homeServiceCardMedia";
import type { ServiceRow } from "@/types/database";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";
import { beginOrder } from "@/app/actions/orderFlow";

type Props = {
  service: ServiceRow;
};

export function ServiceCard({ service }: Props) {
  const slug = service.slug ?? "";
  const coverPath = getServiceCardCoverPath(slug, service.cover_image_path);
  const img = publicServiceAssetUrl(coverPath);

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-900">
        {img ? (
          <Image
            src={img}
            alt=""
            fill
            className="object-contain object-center"
            sizes="(max-width:768px) 100vw, 33vw"
            priority={false}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Görsel yakında
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {service.name}
          </h2>
          {service.short_description ? (
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {service.short_description}
            </p>
          ) : null}
        </div>
        <form action={beginOrder} className="mt-auto">
          <input type="hidden" name="slug" value={slug} />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Siparişe başla
          </button>
        </form>
      </div>
    </article>
  );
}
