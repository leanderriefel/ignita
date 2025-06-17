import { LazyStore } from "@tauri-apps/plugin-store"

export const authStore = new LazyStore("auth.json")

export const TOKEN_KEY = "bearer_token"
