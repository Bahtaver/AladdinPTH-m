import type { SupabaseClient } from "@supabase/supabase-js";
import type { PricingRuleRow } from "@/types/database";

export async function listPricingRulesForService(
  supabase: SupabaseClient,
  serviceId: string,
): Promise<PricingRuleRow[]> {
  const { data, error } = await supabase
    .from("pricing_rules")
    .select(
      "id,service_id,priority,match_criteria,pricing_model,currency,base_amount,unit_amount,unit_key,label,stackable",
    )
    .eq("service_id", serviceId)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) throw new Error(`pricing_rules: ${error.message}`);
  return (data ?? []) as PricingRuleRow[];
}
