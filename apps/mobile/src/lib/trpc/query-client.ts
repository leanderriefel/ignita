import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient } from "@tanstack/react-query"

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
      },
    },
  })

export const STORAGE_KEY = "ignita-cache"

export const asyncStoragePersister = createAsyncStoragePersister({
  key: STORAGE_KEY,
  storage: AsyncStorage,
})
