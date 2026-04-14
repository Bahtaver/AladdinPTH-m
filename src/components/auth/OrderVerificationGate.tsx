"use client";

/**
 * `CHECKOUT_VERIFICATION_ENABLED === true` iken özet / checkout öncesi kullanılır.
 * — Google ile giriş (OAuth)
 * — E-posta: magic link (bağlantıya tıklama); Supabase şablonunun link içermesi gerekir.
 * @see src/lib/auth/checkoutVerification.ts
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { getClientEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Phase = "choose" | "email" | "email-wait";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function OrderVerificationGate() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [phase, setPhase] = useState<Phase>("choose");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const nextParam = useMemo(() => {
    const q = searchParams?.toString();
    const path = q ? `${pathname}?${q}` : pathname;
    return encodeURIComponent(path);
  }, [pathname, searchParams]);

  /** Magic link / Google dönüş adresi: tarayıcı adres çubuğu; isteğe bağlı env ile LAN sabitlenebilir. */
  const publicOrigin = useMemo(() => {
    if (typeof window === "undefined") return "";
    const fromEnv = getClientEnv().NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN;
    if (fromEnv) return fromEnv;
    return window.location.origin;
  }, []);

  const authCallbackUrl = useMemo(() => {
    if (!publicOrigin) return "";
    return `${publicOrigin}/auth/callback?next=${nextParam}`;
  }, [nextParam, publicOrigin]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const signInWithGoogle = async () => {
    setMessage(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: authCallbackUrl || undefined,
        queryParams: { prompt: "select_account" },
      },
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
    }
  };

  const sendEmailMagicLink = async () => {
    setMessage(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: authCallbackUrl || undefined,
      },
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setPhase("email-wait");
    setMessage(
      "E-postanıza bir bağlantı gönderdik. **Giriş yap** veya **Doğrula** linkine tıklayın; tarayıcı sizi siteye yönlendirecek. Bu sayfayı açık tutup aşağıdan yenileyebilirsiniz.",
    );
  };

  return (
    <div className="space-y-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-sm text-zinc-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-zinc-100">
      <div>
        <p className="font-semibold text-emerald-950 dark:text-emerald-50">
          Sipariş öncesi doğrulama
        </p>
        <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-200">
          Hesabınızı bir kez doğrulayın. Google ile hızlıca giriş yapabilir veya e-postanıza
          gönderilen tek kullanımlık bağlantıyı kullanabilirsiniz.
        </p>
        <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-300">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Başka cihaz veya tarayıcı?
          </span>{" "}
          Aynı yöntemle tekrar giriş yapmanız yeterlidir; sipariş geçmişiniz hesabınızda kalır.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
          {message.split("**").map((chunk, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-50">
                {chunk}
              </strong>
            ) : (
              <span key={i}>{chunk}</span>
            ),
          )}
        </p>
      ) : null}

      {phase === "choose" ? (
        <div className="space-y-3">
          <button
            type="button"
            disabled={busy || !authCallbackUrl}
            onClick={() => void signInWithGoogle()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            <GoogleIcon className="shrink-0" />
            Google ile devam et
          </button>
          <div className="relative py-1 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            <span className="relative z-10 bg-emerald-50/80 px-2 dark:bg-emerald-950/40">veya</span>
            <span className="absolute inset-x-0 top-1/2 z-0 h-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setPhase("email");
              setMessage(null);
            }}
            className="w-full rounded-xl border border-emerald-300/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-white disabled:opacity-50 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-100 dark:hover:bg-zinc-900"
          >
            E-posta ile bağlantı gönder
          </button>
        </div>
      ) : null}

      {phase === "email" ? (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              E-posta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="ornek@posta.com"
            />
          </label>
          <button
            type="button"
            disabled={busy || !email.includes("@") || !authCallbackUrl}
            onClick={() => void sendEmailMagicLink()}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Bağlantıyı e-postama gönder
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setPhase("choose");
              setMessage(null);
            }}
            className="text-xs text-emerald-800 underline dark:text-emerald-200"
          >
            ← Diğer seçenekler
          </button>
        </div>
      ) : null}

      {phase === "email-wait" ? (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            Gelen kutunuzu ve spam klasörünü kontrol edin. Bağlantıya tıkladıktan sonra aşağıdaki
            düğümle sayfayı yenileyin; doğrulama tamamlandıysa form açılır.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void refresh()}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Bağlantıya tıkladım — yenile
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setPhase("email");
              setMessage(null);
            }}
            className="text-xs text-emerald-800 underline dark:text-emerald-200"
          >
            Başka e-posta kullan
          </button>
        </div>
      ) : null}
    </div>
  );
}
