import { z } from "zod";

export const fulfillmentSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  address_line: z.string().optional(),
  time_window_preference: z
    .enum(["morning", "afternoon", "evening", "flexible"])
    .optional(),
  customer_note: z.string().optional(),
});

export type Fulfillment = z.infer<typeof fulfillmentSchema>;

const orderDraftBase = z.object({
  serviceSlug: z.string().min(1),
  step: z.enum(["configure", "address", "review"]),
  configuration: z.record(z.string(), z.any()),
  fulfillment: fulfillmentSchema.optional(),
});

export const orderDraftSchema = orderDraftBase.transform((d) => ({
  ...d,
  fulfillment: d.fulfillment ?? {},
}));

export type OrderDraft = z.infer<typeof orderDraftBase> & {
  fulfillment: Fulfillment;
};
