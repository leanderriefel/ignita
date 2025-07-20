"use client"

import { createTRPCContext } from "@trpc/tanstack-react-query"

import type { AppRouter } from "./routers/root"

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()
