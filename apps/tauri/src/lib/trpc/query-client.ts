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
        gcTime: Infinity,
      },
    },
  })

export const STORAGE_KEY = "ignita-cache"

export const asyncStoragePersister = createAsyncStoragePersister({
  key: STORAGE_KEY,
  storage: {
    async getItem(key) {
      try {
        return await readTextFile(key, {
          baseDir: BaseDirectory.AppLocalData,
        })
      } catch {
        return null
      }
    },
    async setItem(key, value) {
      try {
        await writeTextFile(key, value, {
          baseDir: BaseDirectory.AppLocalData,
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[QueryClient Storage] setItem error:", error)
      }
    },
    async removeItem(key) {
      try {
        await remove(key, {
          baseDir: BaseDirectory.AppLocalData,
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[QueryClient Storage] removeItem error:", error)
      }
    },
    async entries() {
      try {
        const entries = await readDir("", {
          baseDir: BaseDirectory.AppLocalData,
        })
        return entries.map((entry) => [entry.name, ""])
      } catch {
        return []
      }
    },
  },
})
