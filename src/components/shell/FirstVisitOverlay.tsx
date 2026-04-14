"use client";

import { useLayoutEffect, useState } from "react";
import { BrandSplashContent } from "@/components/brand/BrandSplashContent";

const STORAGE_KEY = "aladdin_initial_gate_v1";
/** İlk oturumda kasıtlı minimum bekleme (ms) */
const FIRST_VISIT_MIN_MS = 1000;

type Props = {
  logoUrl: string | null;
};

/**
 * Yalnızca istemcide mount olur (`layout` içinde `dynamic(..., { ssr: false })`).
 * İlk ziyaret: en az 1 sn logo ekranı; sonraki ziyaretlerde (aynı sekme oturumu) tekrarlanmaz.
 */
export default function FirstVisitOverlay({ logoUrl }: Props) {
  const [open, setOpen] = useState(() => {
    try {
      return !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  useLayoutEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* private mode vb. */
      }
      setOpen(false);
    }, FIRST_VISIT_MIN_MS);
    return () => clearTimeout(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-zinc-50 dark:bg-zinc-950"
      aria-hidden="true"
    >
      <BrandSplashContent logoUrl={logoUrl} />
    </div>
  );
}
