import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Reward, RewardInsert, RewardUpdate } from "@/types/database.types"

export function useRewards(activeOnly = false) {
  const [data, setData] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRewards = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    let query = supabase
      .from("rewards")
      .select("*")
      .order("created_at", { ascending: false })

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      setError(new Error(error.message))
    } else {
      setData((data as Reward[]) ?? [])
    }

    setIsLoading(false)
  }, [activeOnly])

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  return { data, isLoading, error, refetch: fetchRewards }
}

export function useCreateReward() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (values: RewardInsert) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("rewards")
      .insert(values)
      .select()
      .single()
    setIsLoading(false)

    if (error) throw new Error(error.message)
    return data as Reward
  }

  return { mutate, isLoading }
}

export function useUpdateReward() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string, values: RewardUpdate) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("rewards")
      .update(values)
      .eq("id", id)
      .select()
      .single()
    setIsLoading(false)

    if (error) throw new Error(error.message)
    return data as Reward
  }

  return { mutate, isLoading }
}

export function useDeleteReward() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string) => {
    setIsLoading(true)
    const { error } = await supabase.from("rewards").delete().eq("id", id)
    setIsLoading(false)

    if (error) throw new Error(error.message)
  }

  return { mutate, isLoading }
}
