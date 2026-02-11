import { z } from "zod"

export const segmentRuleSchema = z.object({
  field: z.enum(["total_visits", "total_spent", "points_balance"]),
  operator: z.enum(["gte", "lte", "eq", "gt", "lt"]),
  value: z.coerce.number(),
})

export const segmentFilterSchema = z.object({
  rules: z.array(segmentRuleSchema),
  logic: z.enum(["and", "or"]).default("and"),
})

export const campaignFormSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(100),
  type: z.enum(["sms", "email"]),
  subject: z.string().max(200).optional().or(z.literal("")),
  body: z.string().min(1, "Message body is required").max(5000),
  use_segment: z.boolean().default(false),
  segment_filter: segmentFilterSchema.optional(),
})

export type SegmentRuleValues = z.infer<typeof segmentRuleSchema>
export type CampaignFormValues = z.infer<typeof campaignFormSchema>
