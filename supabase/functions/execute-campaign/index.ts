// Supabase Edge Function: execute-campaign
// Orchestrates sending a campaign to all recipients
// Deploy with: supabase functions deploy execute-campaign

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface ExecuteRequest {
  campaign_id: string
}

Deno.serve(async (req) => {
  const { campaign_id }: ExecuteRequest = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Update campaign status to sending
  await supabaseAdmin
    .from("campaigns")
    .update({ status: "sending" })
    .eq("id", campaign_id)

  // Fetch campaign details
  const { data: campaign } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("id", campaign_id)
    .single()

  if (!campaign) {
    return new Response(
      JSON.stringify({ error: "Campaign not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    )
  }

  // Fetch all pending recipients with customer data
  const { data: recipients } = await supabaseAdmin
    .from("campaign_recipients")
    .select("id, customer_id, customers(name, phone, email)")
    .eq("campaign_id", campaign_id)
    .eq("status", "pending")

  if (!recipients || recipients.length === 0) {
    await supabaseAdmin
      .from("campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaign_id)

    return new Response(
      JSON.stringify({ sent: 0, failed: 0 }),
      { headers: { "Content-Type": "application/json" } }
    )
  }

  let sentCount = 0
  let failedCount = 0

  for (const recipient of recipients) {
    const customer = recipient.customers as { name: string; phone: string; email: string }
    const to = campaign.type === "sms" ? customer.phone : customer.email

    if (!to) {
      await supabaseAdmin
        .from("campaign_recipients")
        .update({ status: "failed", error_message: `No ${campaign.type === "sms" ? "phone" : "email"} on file` })
        .eq("id", recipient.id)
      failedCount++
      continue
    }

    // Replace template variables
    const body = campaign.body
      .replace(/\{\{name\}\}/g, customer.name)
      .replace(/\{\{points_balance\}\}/g, "0") // Would need to fetch from customer

    try {
      // Call the send-message function
      const { data, error } = await supabaseAdmin.functions.invoke("send-message", {
        body: {
          campaign_id,
          recipient_id: recipient.id,
          channel: campaign.type,
          to,
          subject: campaign.subject,
          body,
        },
      })

      if (error || !data?.success) {
        failedCount++
      } else {
        sentCount++
      }
    } catch {
      failedCount++
      await supabaseAdmin
        .from("campaign_recipients")
        .update({ status: "failed", error_message: "Send function error" })
        .eq("id", recipient.id)
    }
  }

  // Update campaign status
  await supabaseAdmin
    .from("campaigns")
    .update({
      status: failedCount === recipients.length ? "failed" : "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaign_id)

  return new Response(
    JSON.stringify({ sent: sentCount, failed: failedCount }),
    { headers: { "Content-Type": "application/json" } }
  )
})
