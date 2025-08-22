import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { ai } from "@ignita/database/schema"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// Predefined models that are supported through OpenRouter
export const PREDEFINED_MODELS = [
  "openai/gpt-5-chat",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "anthropic/claude-opus-4.1",
  "anthropic/claude-sonnet-4",
  "x-ai/grok-4",
  "moonshotai/kimi-k2",
  "z-ai/glm-4.5",
  "z-ai/glm-4.5-air",
] as const

export const userRouter = createTRPCRouter({
  getSelectedModel: protectedProcedure.query(async ({ ctx }) => {
    try {
      const row = await ctx.db.query.ai.findFirst({
        where: eq(ai.userId, ctx.session.user.id),
        columns: { selectedModel: true },
      })

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AI settings not found",
        })
      }

      return {
        selectedModel: row.selectedModel,
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get selected model (${JSON.stringify(error)})`,
      })
    }
  }),

  setSelectedModel: protectedProcedure
    .input(
      z.object({
        selectedModel: z.string().min(1, "Model cannot be empty"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updated = await ctx.db
          .insert(ai)
          .values({
            userId: ctx.session.user.id,
            selectedModel: input.selectedModel,
          })
          .onConflictDoUpdate({
            target: [ai.userId],
            set: { selectedModel: input.selectedModel, updatedAt: new Date() },
          })
          .returning({ selectedModel: ai.selectedModel })

        return updated[0]
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to set selected model (${JSON.stringify(error)})`,
        })
      }
    }),

  getPredefinedModels: publicProcedure.query(() => ({
    models: PREDEFINED_MODELS,
  })),
})

