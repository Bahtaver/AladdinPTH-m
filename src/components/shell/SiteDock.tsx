"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartStroke24 } from "@/components/icons/Heart24";

function IconHome({ active }: { active: boolean }) {
  const c = active
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-zinc-500 dark:text-zinc-400";
  return (
    <svg className={c} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  const c = active
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-zinc-500 dark:text-zinc-400";
  return (
    <svg className={c} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeart({ active }: { active: boolean }) {
  const c = active
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-zinc-500 dark:text-zinc-400";
  return <HeartStroke24 className={["size-[22px] shrink-0", c].join(" ")} />;
}

/** Hediye paketi — orta FAB. */
function IconGiftPackage({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 11h16v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-9Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 11v11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M4 11V9.5A1.5 1.5 0 0 1 5.5 8H9M20 11V9.5A1.5 1.5 0 0 0 18.5 8H15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M12 8V6.5c0-1.25-1-2.25-2.25-2.25-.9 0-1.65.55-1.95 1.3M12 8V6.5c0-1.25 1-2.25 2.25-2.25.9 0 1.65.55 1.95 1.3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Sepet doluyken torba içi dolar; çizgi üstte kalır. */
function IconCart({ active, filled }: { active: boolean; filled: boolean }) {
  const stroke = active
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-zinc-500 dark:text-zinc-400";
  const fill =
    filled && active
      ? "text-emerald-600/45 dark:text-emerald-400/45"
      : filled
        ? "text-emerald-600/55 dark:text-emerald-400/50"
        : "text-transparent";
  return (
    <svg className={stroke} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        className={fill}
        d="M5.4 8.8h13.2l-1.05 7.9a1.85 1.85 0 0 1-1.85 1.65H8.3a1.85 1.85 0 0 1-1.85-1.65l-1.05-7.9Z"
        fill="currentColor"
      />
      <path
        d="M9 8V6a3 3 0 0 1 6 0v2M5 8h14l-1.2 9.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Zm3 0V6a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tab bar: arka plan / çerçeve yok; aktif = tipografi + ikon rengi. */
function dockLinkClass(active: boolean) {
  return [
    "relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium sm:text-[11px] transition-colors",
    active
      ? "font-semibold text-emerald-600 dark:text-emerald-400"
      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
  ].join(" ");
}

/** Aktif sekme — altta ince çubuk (mobil tab bar standardı). */
function DockTabBarIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "pointer-events-none absolute bottom-1 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full transition-opacity duration-200 ease-out",
        active ? "bg-emerald-500 opacity-100 dark:bg-emerald-400" : "opacity-0",
      ].join(" ")}
      aria-hidden
    />
  );
}

/** Alt sabit menü: ana sayfa, favoriler, ortada kampanyalar (FAB), sepet, profil. */
export function SiteDock() {
  const path = usePathname() ?? "";
  const home = path === "/";
  const sepet = path.startsWith("/sepet");
  const favoriler = path.startsWith("/favoriler");
  const profil = path.startsWith("/profil");
  const kampanyalar = path.startsWith("/kampanyalar");
  const [cartCount, setCartCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/cart/count")
        .then((r) => r.json())
        .then((body: { count?: number }) => {
          if (!cancelled && typeof body.count === "number") {
            setCartCount(body.count);
          }
        })
        .catch(() => {
          if (!cancelled) setCartCount(0);
        });
    };

    load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 1000);
    const onFocus = () => load();
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [path]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 overflow-visible border-t border-zinc-200 bg-white/95 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
      aria-label="Ana gezinme"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end gap-1 px-1.5 py-2">
        <Link
          href="/"
          className={dockLinkClass(home)}
          aria-current={home ? "page" : undefined}
        >
          <DockTabBarIndicator active={home} />
          <IconHome active={home} />
          Ana sayfa
        </Link>
        <Link
          href="/favoriler"
          className={dockLinkClass(favoriler)}
          aria-current={favoriler ? "page" : undefined}
        >
          <DockTabBarIndicator active={favoriler} />
          <IconHeart active={favoriler} />
          Favoriler
        </Link>

        <div className="flex items-end justify-center">
          <Link
            href="/kampanyalar"
            aria-label="Kampanyalar"
            aria-current={kampanyalar ? "page" : undefined}
            className={[
              "relative z-50 inline-flex items-center justify-center rounded-full outline-none",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-14 w-14 shrink-0 -translate-y-3 items-center justify-center rounded-full bg-white text-emerald-600 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.38)] ring-[3px] transition-[transform,box-shadow] active:scale-[0.96] dark:bg-zinc-100 dark:text-emerald-700 sm:-translate-y-3.5",
                kampanyalar
                  ? "ring-emerald-600 dark:ring-emerald-500"
                  : "ring-emerald-500/80 dark:ring-emerald-500/85",
              ].join(" ")}
            >
              <IconGiftPackage className="size-[1.35rem] shrink-0 sm:size-6" />
            </span>
          </Link>
        </div>

        <Link
          href="/sepet"
          className={dockLinkClass(sepet)}
          aria-current={sepet ? "page" : undefined}
        >
          <DockTabBarIndicator active={sepet} />
          <span className="relative mx-auto inline-block h-[22px] w-[22px] shrink-0">
            <IconCart active={sepet} filled={cartCount !== null && cartCount > 0} />
            {cartCount !== null && cartCount > 0 ? (
              <span className="absolute -right-2 -top-1.5 z-10 flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-none tabular-nums text-white shadow-sm ring-2 ring-white dark:ring-zinc-950">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </span>
          Sepet
        </Link>
        <Link
          href="/profil"
          className={dockLinkClass(profil)}
          aria-current={profil ? "page" : undefined}
        >
          <DockTabBarIndicator active={profil} />
          <IconUser active={profil} />
          Profilim
        </Link>
      </div>
    </nav>
  );
}
