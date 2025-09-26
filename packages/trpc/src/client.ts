"use client"

import { isTRPCClientError } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"

import type { AppRouter } from "./routers/root"

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()

export const isTRPCError = isTRPCClientError<AppRouter>
