import { supabase } from "@/lib/supabase"
import type { Customer, SegmentFilter, SegmentRule } from "@/types/database.types"

function applyRule(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  rule: SegmentRule
) {
  switch (rule.operator) {
    case "gte":
      return query.gte(rule.field, rule.value)
    case "lte":
      return query.lte(rule.field, rule.value)
    case "eq":
      return query.eq(rule.field, rule.value)
    case "gt":
      return query.gt(rule.field, rule.value)
    case "lt":
      return query.lt(rule.field, rule.value)
  }
}

export async function queryCustomersBySegment(
  filter?: SegmentFilter | null
): Promise<Customer[]> {
  let query = supabase.from("customers").select("*")

  if (filter && filter.rules.length > 0) {
    for (const rule of filter.rules) {
      query = applyRule(query, rule)
    }
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data as Customer[]) ?? []
}

export async function countCustomersBySegment(
  filter?: SegmentFilter | null
): Promise<number> {
  let query = supabase
    .from("customers")
    .select("*", { count: "exact", head: true })

  if (filter && filter.rules.length > 0) {
    for (const rule of filter.rules) {
      query = applyRule(query, rule)
    }
  }

  const { count, error } = await query

  if (error) throw new Error(error.message)
  return count ?? 0
}

export const fieldLabels: Record<string, string> = {
  total_visits: "Total Visits",
  total_spent: "Total Spent ($)",
  points_balance: "Points Balance",
}

export const operatorLabels: Record<string, string> = {
  gte: ">=",
  lte: "<=",
  eq: "=",
  gt: ">",
  lt: "<",
}
