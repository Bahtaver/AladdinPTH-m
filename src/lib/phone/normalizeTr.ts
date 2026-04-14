/** Türkiye GSM → E.164 (+905...) */
export function normalizeTurkeyPhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    const rest = digits;
    if (rest.length >= 12 && rest.startsWith("90")) return `+${rest}`;
    return null;
  }
  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0") && digits[1] === "5") {
    return `+90${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("90")) {
    return `+${digits}`;
  }
  return null;
}
