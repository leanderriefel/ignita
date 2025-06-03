"use client"

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient } from "@tanstack/react-query"

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    },
  })

export const STORAGE_KEY = "ignita-cache"

export const localStoragePersister = createAsyncStoragePersister({
  key: STORAGE_KEY,
  storage: window.localStorage,
})
