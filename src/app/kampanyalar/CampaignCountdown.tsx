"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  endsAt: string | null;
};

function formatRemaining(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}g ${hours}s ${minutes}d`;
  return `${hours}s ${minutes}d`;
}

export function CampaignCountdown({ endsAt }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const text = useMemo(() => {
    if (!endsAt) return "Süre sınırsız";
    const endMs = new Date(endsAt).getTime();
    if (!Number.isFinite(endMs)) return "Süre bilgisi yok";
    const remaining = endMs - now;
    if (remaining <= 0) return "Sona erdi";
    return `Bitişe ${formatRemaining(remaining)}`;
  }, [endsAt, now]);

  return (
    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {text}
    </span>
  );
}

