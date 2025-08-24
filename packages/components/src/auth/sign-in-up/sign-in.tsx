"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { cn } from "@ignita/lib"

import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Divider } from "../../ui/divider"
import { Input } from "../../ui/input"
import { Loading } from "../../ui/loading"
import { useAuthClient } from "../auth-provider"
import { useAppForm } from "./hooks"

type SignInProps<T extends string> = {
  socialProviders: T[]
  onSocialSignIn: (provider: T) => void | Promise<void>
  onEmailAndPasswordSignIn: ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => void | Promise<void>
  error?: string
  onGoToSignUp?: () => void
}

export const SignIn = <T extends string>({
  socialProviders,
  onSocialSignIn,
  onEmailAndPasswordSignIn,
  error,
  onGoToSignUp,
}: SignInProps<T>) => {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await onEmailAndPasswordSignIn(value)
    },
  })

  return (
    <div
      className={cn(
        "relative m-2 w-full max-w-lg items-center justify-center space-y-6 rounded-2xl border p-8",
        "before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/5 before:blur-lg",
      )}
    >
      <h1 className="text-center text-2xl font-bold">Sign in</h1>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        {socialProviders.map((provider) => (
          <Button
            variant="primary"
            className="w-full"
            key={provider}
            onClick={() => void onSocialSignIn(provider)}
          >
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </Button>
        ))}
      </div>
      <Divider>or</Divider>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.AppForm>
          <form.AppField
            name="email"
            validators={{
              onBlur: z.email("Invalid email"),
            }}
            children={(field) => <field.AuthEmailField />}
          />
          <form.AppField
            name="password"
            validators={{
              onBlur: z
                .string()
                .min(8, "Password must be at least 8 characters"),
            }}
            children={(field) => <field.AuthPasswordField />}
          />
          <form.AuthSubmitButton text="Sign in" />
        </form.AppForm>
      </form>
      {error && (
        <p className="mt-2 text-center text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-col items-center gap-2 text-center text-sm">
        <ForgotPasswordDialog />
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onGoToSignUp}
            disabled={!onGoToSignUp}
            className="text-primary hover:underline disabled:opacity-50"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  )
}

const ForgotPasswordDialog = () => {
  const [open, setOpen] = useState(false)

  const authClient = useAuthClient()

  const handleForgotPassword = async (email: string) => {
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })

    setOpen(false)
  }

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => {
      toast.promise(handleForgotPassword(value.email), {
        loading: "Sending password reset email...",
        success: "Password reset email sent. Check your inbox.",
        error: "Failed to send password reset email",
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: z.email("Invalid email"),
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  name={field.name}
                  type="email"
                  variant="outline"
                  placeholder="Enter your email address"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
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
                {isSubmitting ? (
                  <Loading className="size-4" />
                ) : (
                  "Send reset email"
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  )
}

