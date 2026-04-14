import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getClientEnv } from "@/lib/env";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/**
 * OAuth (Google) ve e-posta magic link dönüşü — PKCE `code` ile oturum açılır.
 * Supabase Dashboard → URL configuration: `.../auth/callback` ekleyin.
 */
export async function GET(request: NextRequest) {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getClientEnv();
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  const nextPath = safeNextPath(url.searchParams.get("next"));
  const origin = url.origin;

  const errorDescription = url.searchParams.get("error_description");
  if (url.searchParams.get("error")) {
    const msg = errorDescription ?? url.searchParams.get("error") ?? "Giriş iptal edildi.";
    return NextResponse.redirect(`${origin}/?hata=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/?hata=${encodeURIComponent("Doğrulama kodu eksik. Bağlantıyı tekrar deneyin.")}`,
    );
  }

  const redirectResponse = NextResponse.redirect(`${origin}${nextPath}`);

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/?hata=${encodeURIComponent(error.message)}`,
    );
  }

  return redirectResponse;
}
