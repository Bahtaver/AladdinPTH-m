import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EnsureAnonymousSession } from "@/components/auth/EnsureAnonymousSession";
import { FirstVisitOverlayHost } from "@/components/shell/FirstVisitOverlayHost";
import { SiteChrome } from "@/components/shell/SiteChrome";
import { BRAND_STORAGE_PATHS } from "@/lib/storage/brandAssets";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aladdin Premium Care",
    template: "%s · Aladdin Premium Care",
  },
  description:
    "Konumunuza gelen yapılandırılmış hizmet siparişi: araç yıkama ve bakım, halı, koltuk ve cam.",
  applicationName: "Aladdin Premium Care",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Aladdin Premium Care",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = publicServiceAssetUrl(BRAND_STORAGE_PATHS.headerLogo);

  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50`}
      >
        <EnsureAnonymousSession />
        <FirstVisitOverlayHost logoUrl={logoUrl} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
