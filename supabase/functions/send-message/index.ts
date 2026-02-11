// Supabase Edge Function: send-message
// Dispatches SMS/email to the configured provider
// Deploy with: supabase functions deploy send-message

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface SendRequest {
  campaign_id: string
  recipient_id: string
  channel: "sms" | "email"
  to: string
  subject?: string
  body: string
}

interface SendResult {
  success: boolean
  provider_message_id?: string
  error?: string
}

Deno.serve(async (req) => {
  const payload: SendRequest = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Fetch messaging config
  const { data: configRow } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "messaging_provider")
    .single()

  const config = configRow?.value as {
    sms: { provider: string; api_key: string; api_secret: string; from_number: string } | null
    email: { provider: string; api_key: string; from_address: string; from_name: string } | null
  }

  let result: SendResult

  if (payload.channel === "sms") {
    if (!config?.sms?.provider) {
      result = { success: false, error: "SMS provider not configured" }
    } else {
      // TODO: Implement actual provider dispatch
      // For now, simulate successful send
      result = { success: true, provider_message_id: `sim_${Date.now()}` }
    }
  } else {
    if (!config?.email?.provider) {
      result = { success: false, error: "Email provider not configured" }
    } else {
      // TODO: Implement actual provider dispatch
      result = { success: true, provider_message_id: `sim_${Date.now()}` }
    }
  }

  // Update recipient status
  await supabaseAdmin
    .from("campaign_recipients")
    .update({
      status: result.success ? "sent" : "failed",
      error_message: result.error || null,
      sent_at: result.success ? new Date().toISOString() : null,
    })
    .eq("id", payload.recipient_id)

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  })
})
