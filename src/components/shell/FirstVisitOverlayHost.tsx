"use client";

import dynamic from "next/dynamic";

const FirstVisitOverlay = dynamic(
  () => import("@/components/shell/FirstVisitOverlay"),
  { ssr: false },
);

type Props = {
  logoUrl: string | null;
};

/** Sunucu `layout` burayı import eder; `ssr: false` yalnızca istemci modülünde tanımlıdır. */
export function FirstVisitOverlayHost({ logoUrl }: Props) {
  return <FirstVisitOverlay logoUrl={logoUrl} />;
}
