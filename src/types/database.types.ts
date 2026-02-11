export type PointsTransactionType = "earn" | "redeem" | "adjust"
export type CampaignType = "sms" | "email"
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed"
export type RecipientStatus = "pending" | "sent" | "failed" | "delivered" | "bounced"

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  total_visits: number
  total_spent: number
  points_balance: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CustomerInsert {
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
}

export interface CustomerUpdate {
  name?: string
  phone?: string | null
  email?: string | null
  total_visits?: number
  total_spent?: number
  notes?: string | null
}

export interface PointsTransaction {
  id: string
  customer_id: string
  type: PointsTransactionType
  amount: number
  description: string | null
  staff_note: string | null
  visit_amount: number | null
  created_at: string
}

export interface PointsTransactionInsert {
  customer_id: string
  type: PointsTransactionType
  amount: number
  description?: string | null
  staff_note?: string | null
  visit_amount?: number | null
}

export interface Reward {
  id: string
  name: string
  description: string | null
  points_cost: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RewardInsert {
  name: string
  description?: string | null
  points_cost: number
  is_active?: boolean
}

export interface RewardUpdate {
  name?: string
  description?: string | null
  points_cost?: number
  is_active?: boolean
}

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  subject: string | null
  body: string
  segment_filter: SegmentFilter | null
  status: CampaignStatus
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignInsert {
  name: string
  type: CampaignType
  subject?: string | null
  body: string
  segment_filter?: SegmentFilter | null
  status?: CampaignStatus
  scheduled_at?: string | null
}

export interface CampaignRecipient {
  id: string
  campaign_id: string
  customer_id: string
  status: RecipientStatus
  error_message: string | null
  sent_at: string | null
  created_at: string
}

export interface AppSetting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface SegmentFilter {
  rules: SegmentRule[]
  logic: "and" | "or"
}

export interface SegmentRule {
  field: "total_visits" | "total_spent" | "points_balance" | "created_at"
  operator: "gte" | "lte" | "eq" | "gt" | "lt"
  value: number | string
}

export interface PointsEarnRate {
  points_per_dollar: number
}

export interface MessagingProviderConfig {
  sms: {
    provider: "twilio" | "vonage" | null
    api_key?: string
    api_secret?: string
    from_number?: string
  } | null
  email: {
    provider: "resend" | "sendgrid" | null
    api_key?: string
    from_address?: string
    from_name?: string
  } | null
}

export interface StoreInfo {
  name: string
  phone: string
  address: string
}
