import { load } from "@tauri-apps/plugin-store"

export const authStore = await load("auth.json")

export const TOKEN_KEY = "bearer_token"
