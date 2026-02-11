import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Campaign, CampaignInsert } from "@/types/database.types"

export function useCampaigns() {
  const [data, setData] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setError(new Error(error.message))
    } else {
      setData((data as Campaign[]) ?? [])
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return { data, isLoading, error, refetch: fetchCampaigns }
}

export function useCreateCampaign() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (values: CampaignInsert) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("campaigns")
      .insert(values)
      .select()
      .single()
    setIsLoading(false)

    if (error) throw new Error(error.message)
    return data as Campaign
  }

  return { mutate, isLoading }
}
