import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { PointsEarnRate, MessagingProviderConfig, StoreInfo } from "@/types/database.types"

interface AppSettings {
  points_earn_rate: PointsEarnRate
  messaging_provider: MessagingProviderConfig
  store_info: StoreInfo
}

const defaultSettings: AppSettings = {
  points_earn_rate: { points_per_dollar: 1 },
  messaging_provider: { sms: null, email: null },
  store_info: { name: "Nail Store", phone: "", address: "" },
}

export function useAppSettings() {
  const [data, setData] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase.from("app_settings").select("*")

    if (error) {
      setError(new Error(error.message))
    } else if (data) {
      const settings = { ...defaultSettings }
      for (const row of data) {
        if (row.key in settings) {
          (settings as Record<string, unknown>)[row.key] = row.value
        }
      }
      setData(settings)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { data, isLoading, error, refetch: fetchSettings }
}

export function useUpdateSetting() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (key: string, value: Record<string, unknown>) => {
    setIsLoading(true)
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
    setIsLoading(false)

    if (error) throw new Error(error.message)
  }

  return { mutate, isLoading }
}
