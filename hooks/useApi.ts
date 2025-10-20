"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(apiCall: () => Promise<any>, dependencies: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        })
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || "An error occurred",
        })
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}

export function useJobs(params: any = {}) {
  return useApi(() => apiClient.getJobs(params), [JSON.stringify(params)])
}

export function useJob(id: string) {
  return useApi(() => apiClient.getJob(id), [id])
}

export function useProfile() {
  return useApi(() => apiClient.getProfile(), [])
}

export function useApplications(params: any = {}) {
  return useApi(() => apiClient.getApplications(params), [JSON.stringify(params)])
}

export function useNotifications(params: any = {}) {
  return useApi(() => apiClient.getNotifications(params), [JSON.stringify(params)])
}

export function useSavedJobs() {
  return useApi(() => apiClient.getSavedJobs(), [])
}

export function useJobMatches() {
  return useApi(() => apiClient.getJobMatches(), [])
}

export function useProfileAnalytics() {
  return useApi(() => apiClient.getProfileAnalytics(), [])
}
