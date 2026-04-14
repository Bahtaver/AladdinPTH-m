import { SERVICE_GUARANTEE } from "@/config/orderSidebarCopy";

export function ServiceGuaranteePanel() {
  return (
    <aside className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-950 ring-1 ring-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50 dark:ring-emerald-900/40">
      <p className="font-semibold tracking-tight">{SERVICE_GUARANTEE.title}</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4 leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
        {SERVICE_GUARANTEE.bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  );
}
