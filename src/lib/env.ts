import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  /**
   * OAuth / magic link `redirectTo` kökü. Boş bırakılırsa tarayıcı `window.location.origin` kullanılır.
   * LAN’den telefonda test: `http://192.168.1.200:3000` — Supabase Redirect URLs’e aynı kök + `/auth/callback` ekleyin.
   */
  NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN: z
    .preprocess((raw) => {
      if (typeof raw !== "string") return undefined;
      const t = raw.trim();
      if (!t) return undefined;
      return t.replace(/\/$/, "");
    }, z.string().url().optional()),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function getClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN: process.env.NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN,
  });
}
