"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Müşteri tarafında RLS ile uyum için gerçek bir auth kullanıcısı gerekir.
 * Anonim oturum: tarayıcıda kalıcı kimlik + çerezler; service role gerekmez.
 */
export function EnsureAnonymousSession() {
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionData.session) return;

      const { error } = await supabase.auth.signInAnonymously();
      if (cancelled) return;
      if (error) {
        setAuthError(
          "Anonim oturum açılamadı. Supabase Dashboard → Authentication → Providers bölümünde Anonymous provider’ı açın.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!authError) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950 shadow-lg dark:border-amber-900/60 dark:bg-amber-950/90 dark:text-amber-50"
    >
      {authError}
    </div>
  );
}
