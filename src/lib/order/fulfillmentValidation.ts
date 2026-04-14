import type { Fulfillment } from "@/lib/order/draftSchema";

export function fulfillmentError(f: Fulfillment): string | null {
  if (!f.full_name?.trim()) return "Ad soyad gerekli.";
  if (!f.phone?.trim()) return "Telefon gerekli.";
  if (!f.address_line?.trim()) return "Adres satırı gerekli.";
  return null;
}
