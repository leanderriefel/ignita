import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import {
  BaseDirectory,
  readDir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs"

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    },
  })

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    async getItem(key) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[QueryClient Storage] getItem:", key)
      }
      return await readTextFile(key, {
        baseDir: BaseDirectory.AppLocalData,
      })
    },
    async setItem(key, value) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[QueryClient Storage] setItem:", key, value)
      }
      return await writeTextFile(key, value, {
        baseDir: BaseDirectory.AppLocalData,
      })
    },
    async removeItem(key) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[QueryClient Storage] removeItem:", key)
      }
      return await remove(key, {
        baseDir: BaseDirectory.AppLocalData,
      })
    },
    async entries() {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[QueryClient Storage] entries")
      }
      const entries = await readDir("", { baseDir: BaseDirectory.AppLocalData })
      return entries.map((entry) => [entry.name, ""])
    },
  },
})
