import { BrandSplashContent } from "@/components/brand/BrandSplashContent";
import { BRAND_STORAGE_PATHS } from "@/lib/storage/brandAssets";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";

export default function SiparisLoading() {
  const logoUrl = publicServiceAssetUrl(BRAND_STORAGE_PATHS.headerLogo);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <BrandSplashContent logoUrl={logoUrl} />
    </div>
  );
}
