import type { ReactNode } from "react";

type Props = {
  title: string;
  /** Kapalıyken görünen kısa açıklama (aç/kapa ipucu). */
  closedHint: string;
  /** Başlık yanındaki tema ikonu (örn. ev, profil). */
  icon: ReactNode;
  /** Tanımlıysa sağda kayıt sayısı rozeti gösterilir. */
  count?: number;
  /** İlk yüklemede açık başlasın mı (örn. misafir hesap kartı). */
  initiallyOpen?: boolean;
  children: ReactNode;
};

/** Hesap / doğrulama — kalkan */
export function AccordionIconAccount({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

/** Genel bilgiler — kullanıcı silüeti */
export function AccordionIconProfile({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

/** Kayıtlı adresler — ev */
export function AccordionIconHome({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

/** Üst bilgi bandı — bilgi */
export function AccordionIconInfo({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

/** Oturum e-postası kutusu — zarf */
export function AccordionIconMail({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** Kayıtlı telefonlar — ahize */
export function AccordionIconPhone({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 4h4l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 5 6.2 2 2 0 0 1 5 4Z" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg
      className="size-5 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180 dark:text-zinc-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <polyline
        points="6 9 12 15 18 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Native `details` — ek JS yok; tıklanınca açılır, ok ile durum anlaşılır.
 */
export function ProfileAccordion({
  title,
  closedHint,
  icon,
  count,
  initiallyOpen,
  children,
}: Props) {
  return (
    <details
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      {...(initiallyOpen ? { open: true } : {})}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-zinc-900/60 [&::-webkit-details-marker]:hidden sm:gap-4 sm:px-5">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-900/50 sm:size-14"
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </span>
            {count !== undefined ? (
              <span
                className={[
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                  count > 0
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                ].join(" ")}
              >
                {count}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 group-open:hidden dark:text-zinc-400">
            {closedHint}
          </p>
          <p className="mt-1.5 hidden text-sm font-medium text-emerald-800 group-open:block dark:text-emerald-300">
            Kapatmak için başlığa tekrar dokunun
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 self-start pt-0.5 sm:pt-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 group-open:text-emerald-700 dark:text-zinc-400 dark:group-open:text-emerald-400">
            <span className="group-open:hidden">Aç</span>
            <span className="hidden group-open:inline">Açık</span>
          </span>
          <Chevron />
        </div>
      </summary>
      <div className="border-t border-zinc-100 px-4 pb-4 pt-4 dark:border-zinc-800 sm:px-5">
        {children}
      </div>
    </details>
  );
}
