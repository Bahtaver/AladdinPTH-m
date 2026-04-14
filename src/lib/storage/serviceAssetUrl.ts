import { getClientEnv } from "@/lib/env";

const BUCKET = "service_option_assets";

export function publicServiceAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { NEXT_PUBLIC_SUPABASE_URL } = getClientEnv();
  const trimmed = path.replace(/^\/+/, "");
  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${trimmed}`;
}
