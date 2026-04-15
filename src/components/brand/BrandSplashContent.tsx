import Image from "next/image";

type Props = {
  logoUrl: string | null;
};

/** Sadece marka; ilerleme çubuğu veya “yükleniyor” metni yok (pasif his). */
export function BrandSplashContent({ logoUrl }: Props) {
  const shell =
    "flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16";

  return (
    <div className={shell}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          width={960}
          height={288}
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 92vw, 640px"
          quality={65}
          className="h-[14rem] w-auto max-w-[min(92vw,40rem)] object-contain object-center opacity-95 sm:h-[17rem] motion-safe:animate-[brandPulse_1.4s_ease-in-out_infinite]"
        />
      ) : (
        <p className="text-center text-3xl font-semibold tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-100">
          Aladdin Premium Care
        </p>
      )}
    </div>
  );
}
