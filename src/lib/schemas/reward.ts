import { z } from "zod"

export const rewardFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  points_cost: z.number().int().positive("Must be at least 1 point"),
  is_active: z.boolean(),
})

export type RewardFormValues = z.infer<typeof rewardFormSchema>
