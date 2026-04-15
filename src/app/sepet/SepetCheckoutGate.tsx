"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Doğrulama bekleniyorsa form zaten görünsün (ek tıklama olmasın). */
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/**
 * Önce kalemler + işaretler; kullanıcı "Teslimat ve onay"a basınca teslimat formu görünür.
 * Kapalıyken form `sr-only` ile DOM'da kalır — üstteki `form="…"` kutuları bağlı kalır.
 */
export function SepetCheckoutGate({ defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    document.getElementById("sepet-checkout-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [open]);

  return (
    <div className="space-y-4 pt-4">
      {!open ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Adres ve Onay
          </button>
          <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Planlamayı tamamlamak için adres bilgilerinizi girin.
          </p>
        </div>
      ) : null}

      <div
        id="sepet-checkout-panel"
        className={[
          "scroll-mt-8",
          open ? "space-y-4" : "sr-only",
        ].join(" ")}
        aria-hidden={!open}
      >
        {open ? (
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Adres ve Onay
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}
