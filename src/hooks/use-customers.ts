import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Customer, CustomerInsert, CustomerUpdate } from "@/types/database.types"

const PAGE_SIZE = 20

export function useCustomers(options?: {
  search?: string
  page?: number
}) {
  const [data, setData] = useState<Customer[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const page = options?.page ?? 0
  const search = options?.search ?? ""

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, count, error } = await query

    if (error) {
      setError(new Error(error.message))
    } else {
      setData((data as Customer[]) ?? [])
      setCount(count ?? 0)
    }

    setIsLoading(false)
  }, [search, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return {
    data,
    count,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(count / PAGE_SIZE),
    isLoading,
    error,
    refetch: fetchCustomers,
  }
}

export function useCustomer(id: string) {
  const [data, setData] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      setError(new Error(error.message))
    } else {
      setData(data as Customer)
    }

    setIsLoading(false)
  }, [id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  return { data, isLoading, error, refetch: fetchCustomer }
}

export function useCreateCustomer() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (values: CustomerInsert) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("customers")
      .insert(values)
      .select()
      .single()
    setIsLoading(false)

    if (error) throw new Error(error.message)
    return data as Customer
  }

  return { mutate, isLoading }
}

export function useUpdateCustomer() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string, values: CustomerUpdate) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("customers")
      .update(values)
      .eq("id", id)
      .select()
      .single()
    setIsLoading(false)

    if (error) throw new Error(error.message)
    return data as Customer
  }

  return { mutate, isLoading }
}

export function useDeleteCustomer() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (id: string) => {
    setIsLoading(true)
    const { error } = await supabase.from("customers").delete().eq("id", id)
    setIsLoading(false)

    if (error) throw new Error(error.message)
  }

  return { mutate, isLoading }
}
