import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { PointsTransaction, PointsTransactionInsert } from "@/types/database.types"

export function usePointsTransactions(customerId: string) {
  const [data, setData] = useState<PointsTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("points_transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      setError(new Error(error.message))
    } else {
      setData((data as PointsTransaction[]) ?? [])
    }

    setIsLoading(false)
  }, [customerId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useCreatePointsTransaction() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (values: PointsTransactionInsert) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("points_transactions")
      .insert(values)
      .select()
      .single()
    setIsLoading(false)

    if (error) throw new Error(error.message)
    return data as PointsTransaction
  }

  return { mutate, isLoading }
}
