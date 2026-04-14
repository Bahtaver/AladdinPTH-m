import type { User } from "@supabase/supabase-js";

/**
 * MVP: `false` → özet adımında OTP yok; sipariş testleri kolay kalır.
 * Canlı öncesi `true` yapın; şimdilik yalnızca e-posta OTP (telefon doğrulama ertelendi).
 */
export const CHECKOUT_VERIFICATION_ENABLED = true;

/**
 * Sipariş öncesi: e-posta Supabase tarafında doğrulanmış olmalı (`email_confirmed_at`).
 * Telefon (`phone_confirmed_at`) şu an bu kapıda zorunlu değildir.
 * Bir kez tamamlandıktan sonra aynı hesapta tekrar istenmez; yeni cihazda aynı e-posta ile OTP yeterlidir.
 */
export function needsCheckoutVerification(user: User | null): boolean {
  if (!CHECKOUT_VERIFICATION_ENABLED) return false;
  if (!user) return true;
  return !user.email_confirmed_at;
}
