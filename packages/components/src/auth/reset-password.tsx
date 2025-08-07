"use client"

import { useForm } from "@tanstack/react-form"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Loading } from "../ui/loading"
import { useAuthClient } from "./auth-provider"

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token")
  const error = searchParams.get("error")

  const authClient = useAuthClient()

  if (error || !token) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 px-4 pt-8">
        <h2 className="text-2xl font-bold">Reset password</h2>
        <p className="text-destructive">
          An error occurred with your reset link. Please request a new password
          reset.
        </p>
      </div>
    )
  }

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await toast.promise(
        authClient
          .resetPassword({
            token,
            newPassword: value.password,
          })
          .then(() => navigate("/notes", { replace: true })),
        {
          loading: "Resetting password...",
          success: "Password reset successfully. You can now sign in.",
          error: "Failed to reset password",
        },
      )
    },
  })

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 pt-8">
      <h2 className="text-2xl font-bold">Reset password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field
          name="password"
          validators={{
            onChange: z
              .string()
              .min(8, "Password must be at least 8 characters"),
          }}
        >
          {(field) => (
            <div className="space-y-1">
              <label htmlFor="new-password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="new-password"
                name={field.name}
                type="password"
                variant="outline"
                placeholder="Enter your new password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid ? (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors
                    .map((err) => err?.message)
                    .join(", ")}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
        <form.Subscribe
          selector={(formState) => ({
            canSubmit: formState.canSubmit,
            isSubmitting: formState.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? <Loading className="size-4" /> : "Reset password"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
