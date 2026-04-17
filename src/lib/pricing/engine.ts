import type { PricingRuleRow } from "@/types/database";

export type OrderConfiguration = Record<string, unknown>;

export type PricedLine = {
  pricing_rule_id?: string | null;
  label: string;
  title: string;
  line_total: number;
  quantity?: number;
  unit_price?: number;
};

export type PriceQuote = {
  currency: string;
  lines: PricedLine[];
  total: number;
  originalTotal?: number;
};

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function matches(
  criteria: Record<string, unknown>,
  configuration: OrderConfiguration,
): boolean {
  for (const [key, expected] of Object.entries(criteria)) {
    if (configuration[key] !== expected) return false;
  }
  return true;
}

function lineFromRule(
  rule: PricingRuleRow,
  configuration: OrderConfiguration,
): PricedLine | null {
  const base = num(rule.base_amount);

  if (rule.pricing_model === "fixed") {
    return {
      pricing_rule_id: rule.id,
      label: rule.label,
      title: humanizeLine(rule),
      line_total: base,
      quantity: undefined,
      unit_price: undefined,
    };
  }

  if (rule.pricing_model === "per_unit") {
    const key = rule.unit_key;
    if (!key) return null;
    const qtyRaw = configuration[key];
    const qty =
      typeof qtyRaw === "number"
        ? qtyRaw
        : typeof qtyRaw === "string"
          ? Number(qtyRaw)
          : 0;
    if (!Number.isFinite(qty) || qty <= 0) return null;
    const unit = num(rule.unit_amount);
    const total = base + qty * unit;
    return {
      pricing_rule_id: rule.id,
      label: rule.label,
      title: humanizeLine(rule),
      line_total: total,
      quantity: qty,
      unit_price: unit,
    };
  }

  /* composite: şimdilik per_unit ile aynı mantık */
  const key = rule.unit_key;
  if (!key) {
    return {
      pricing_rule_id: rule.id,
      label: rule.label,
      title: humanizeLine(rule),
      line_total: base,
    };
  }
  const qtyRaw = configuration[key];
  const qty =
    typeof qtyRaw === "number"
      ? qtyRaw
      : typeof qtyRaw === "string"
        ? Number(qtyRaw)
        : 0;
  if (!Number.isFinite(qty) || qty < 0) return null;
  const unit = num(rule.unit_amount);
  return {
    pricing_rule_id: rule.id,
    label: rule.label,
    title: humanizeLine(rule),
    line_total: base + qty * unit,
    quantity: qty,
    unit_price: unit,
  };
}

export function quoteForRules(
  rules: PricingRuleRow[],
  configuration: OrderConfiguration,
): PriceQuote {
  const matched = rules.filter((r) => matches(r.match_criteria, configuration));

  const stackable = matched.filter((r) => r.stackable);
  const exclusivePool = matched.filter((r) => !r.stackable);

  const lines: PricedLine[] = [];

  for (const r of stackable) {
    const line = lineFromRule(r, configuration);
    if (line && line.line_total > 0) lines.push(line);
  }

  if (exclusivePool.length > 0) {
    exclusivePool.sort((a, b) => b.priority - a.priority);
    const winner = exclusivePool[0];
    const line = lineFromRule(winner, configuration);
    if (line && line.line_total > 0) lines.push(line);
  }

  const currency = rules[0]?.currency ?? "TRY";
  const total = lines.reduce((s, l) => s + l.line_total, 0);
  return { currency, lines, total };
}

export function humanizeLine(rule: PricingRuleRow): string {
  const mc = rule.match_criteria;
  if (rule.label.startsWith("seed:car")) {
    const ct = String(mc.cleaning_type ?? "");
    const vc = String(mc.vehicle_class ?? "");
    const ctTr =
      ct === "interior"
        ? "İç"
        : ct === "exterior"
          ? "Dış"
          : ct === "interior_exterior"
            ? "İç + dış"
            : ct;
    const vcTr =
      vc === "sedan"
        ? "Binek"
        : vc === "suv"
          ? "SUV"
          : vc === "pickup"
            ? "Kamyonet / pickup"
            : vc;
    return `Araç yıkama ve bakımı · ${ctTr} · ${vcTr}`;
  }
  if (rule.label.startsWith("seed:carpet")) {
    const fiber = String(mc.fiber ?? "");
    return fiber === "natural"
      ? "Halı temizliği · doğal elyaf (m²)"
      : "Halı temizliği · sentetik (m²)";
  }
  if (rule.label.startsWith("seed:sofa")) {
    const t = String(mc.sofa_type ?? "");
    const map: Record<string, string> = {
      single: "Tekli koltuk",
      double: "İkili koltuk",
      full_set: "Tam takım",
      chair: "Sandalye",
    };
    return `Koltuk temizliği · ${map[t] ?? t}`;
  }
  if (rule.label.startsWith("seed:touchup")) {
    return "İsteğe bağlı · küçük çizik rötuş boya (sabit)";
  }
  if (rule.label.startsWith("seed:win:per-window")) {
    return "Standart pencere camı (adet)";
  }
  if (rule.label.startsWith("seed:win:balcony")) {
    return "Balkon cam sistemi";
  }
  return rule.label;
}
