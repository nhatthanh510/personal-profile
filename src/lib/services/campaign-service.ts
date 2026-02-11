import { supabase } from "@/lib/supabase"
import { queryCustomersBySegment } from "@/lib/segments"
import type { CampaignInsert, SegmentFilter } from "@/types/database.types"

export async function createAndSendCampaign(data: {
  name: string
  type: "sms" | "email"
  subject?: string
  body: string
  segment_filter?: SegmentFilter | null
}) {
  // 1. Insert campaign
  const campaignInsert: CampaignInsert = {
    name: data.name,
    type: data.type,
    subject: data.subject || null,
    body: data.body,
    segment_filter: data.segment_filter || null,
    status: "draft",
  }

  const { data: campaign, error: insertError } = await supabase
    .from("campaigns")
    .insert(campaignInsert)
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  // 2. Build recipient list from segment
  const customers = await queryCustomersBySegment(data.segment_filter)

  // Filter customers who have the required contact info
  const eligibleCustomers = customers.filter((c) =>
    data.type === "sms" ? c.phone : c.email
  )

  if (eligibleCustomers.length === 0) {
    // Update campaign status to failed
    await supabase
      .from("campaigns")
      .update({ status: "failed" as const })
      .eq("id", campaign.id)
    throw new Error(
      `No eligible customers found. ${
        data.type === "sms"
          ? "Customers need a phone number for SMS campaigns."
          : "Customers need an email address for email campaigns."
      }`
    )
  }

  // 3. Bulk insert recipients
  const recipients = eligibleCustomers.map((c) => ({
    campaign_id: campaign.id,
    customer_id: c.id,
    status: "pending" as const,
  }))

  const { error: recipientError } = await supabase
    .from("campaign_recipients")
    .insert(recipients)

  if (recipientError) throw new Error(recipientError.message)

  // 4. Update campaign status
  // In production, this would invoke a Supabase Edge Function.
  // For MVP, we mark the campaign as "sent" (provider not configured yet).
  await supabase
    .from("campaigns")
    .update({
      status: "sent" as const,
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaign.id)

  // Update recipients to sent
  await supabase
    .from("campaign_recipients")
    .update({ status: "sent" as const, sent_at: new Date().toISOString() })
    .eq("campaign_id", campaign.id)

  return {
    campaignId: campaign.id,
    recipientCount: eligibleCustomers.length,
  }
}
