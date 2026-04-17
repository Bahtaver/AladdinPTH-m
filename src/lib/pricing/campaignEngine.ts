import type { CampaignRow } from "@/types/database";
import type { PriceQuote, PricedLine } from "@/lib/pricing/engine";

type ApplyCampaignInput = {
  baseQuote: PriceQuote;
  campaigns: CampaignRow[];
  viewer: {
    isAnonymous: boolean;
    isVerified: boolean;
  };
};

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildLine(campaign: CampaignRow, discountAmount: number): PricedLine {
  return {
    pricing_rule_id: null,
    label: `campaign:${campaign.id}`,
    title: `Kampanya · ${campaign.name}`,
    line_total: -Math.abs(discountAmount),
  };
}

function audienceAllows(
  audienceType: CampaignRow["audience_type"],
  viewer: ApplyCampaignInput["viewer"],
): boolean {
  if (audienceType === "all") return true;
  if (audienceType === "anonymous_unverified") return viewer.isAnonymous;
  if (audienceType === "verified_only") return viewer.isVerified;
  return false;
}

export function applyCampaigns({ baseQuote, campaigns, viewer }: ApplyCampaignInput): PriceQuote {
  if (campaigns.length === 0 || baseQuote.total <= 0) {
    return baseQuote;
  }

  const eligible = campaigns.filter((campaign) => {
    if (!campaign.is_active || campaign.status !== "active") return false;
    if (!audienceAllows(campaign.audience_type, viewer)) return false;
    const minTotal = toNumber(campaign.min_order_total);
    return baseQuote.total >= minTotal;
  });

  if (eligible.length === 0) {
    return baseQuote;
  }

  const stackable = eligible.filter((campaign) => campaign.stackable);
  const exclusive = eligible.filter((campaign) => !campaign.stackable);
  const campaignLines: PricedLine[] = [];

  function calcDiscount(campaign: CampaignRow): number {
    const value = toNumber(campaign.discount_value);
    const maxDiscount = toNumber(campaign.max_discount);
    const raw =
      campaign.discount_type === "percent" ? (baseQuote.total * value) / 100 : value;
    const clamped = maxDiscount > 0 ? Math.min(raw, maxDiscount) : raw;
    return Math.max(0, clamped);
  }

  for (const campaign of stackable) {
    const discountAmount = calcDiscount(campaign);
    if (discountAmount > 0) {
      campaignLines.push(buildLine(campaign, discountAmount));
    }
  }

  if (exclusive.length > 0) {
    exclusive.sort((a, b) => b.priority - a.priority);
    const winner = exclusive[0];
    const discountAmount = calcDiscount(winner);
    if (discountAmount > 0) {
      campaignLines.push(buildLine(winner, discountAmount));
    }
  }

  if (campaignLines.length === 0) {
    return baseQuote;
  }

  const lines = [...baseQuote.lines, ...campaignLines];
  const total = Math.max(0, lines.reduce((sum, line) => sum + line.line_total, 0));

  return {
    currency: baseQuote.currency,
    lines,
    total,
    originalTotal: baseQuote.total,
  };
}

