import { useState } from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { usePostHog } from "posthog-js/react"
import { useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import z from "zod"

import { useAuthClient } from "../../../auth/auth-provider"
import { Button } from "../../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog"
import { Input } from "../../../ui/input"
import { Loading } from "../../../ui/loading"

export const AccountsTab = () => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  const [deleteUserOpen, setDeleteUserOpen] = useState(false)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const posthog = usePostHog()

  const signOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigate("/auth")
          queryClient.clear()
          posthog.capture("signed_out")
        },
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        },
      },
    })
  }

  const deleteUser = async () => {
    authClient.deleteUser({
      callbackURL: "/auth",
    })
    setDeleteUserOpen(false)
  }

  return (
    <div className="flex h-full flex-col gap-y-4">
      <NameInput />
      <div className="grid grid-cols-2 gap-x-4">
        <ChangeEmailDialog />
        <ChangePasswordDialog />
      </div>

      <div className="mt-auto flex flex-col gap-y-4">
        <Button variant="outline" className="w-full" onClick={signOut}>
          Log out
        </Button>
        <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                This action is irreversible. You will receive a confirmation
                email at {session?.user.email} to complete the deletion.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="destructive"
              size="square"
              className="w-full"
              onClick={deleteUser}
            >
              Send confirmation email
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

const ChangeEmailDialog = () => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  const location = useLocation()

  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      email: session?.user.email ?? "",
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        authClient
          .changeEmail({
            newEmail: value.email,
            callbackURL: location.pathname + location.search,
          })
          .then(() => setOpen(false)),
        {
          loading: "Sending email change request...",
          success: session?.user.emailVerified
            ? "A confirmation email has been sent to your current email address. Please confirm to complete the change."
            : "Your email has been changed.",
          error: "Failed to send email change request",
        },
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Change email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            {session?.user.emailVerified &&
              `Since you have verified your email, you will receive a confirmation email at ${session?.user.email} to complete the change.`}
            {!session?.user.emailVerified &&
              "Since you have not verified your email, you can change it without receiving a confirmation email."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="flex gap-x-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: z.email("Invalid email"),
            }}
          >
            {(field) => (
              <Input
                id="email-input"
                name={field.name}
                type="email"
                variant="outline"
                placeholder="Enter your new email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="flex-1"
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(formState) => ({
              canSubmit: formState.canSubmit,
              isSubmitting: formState.isSubmitting,
              isDefaultValue: formState.isDefaultValue,
            })}
          >
            {({ canSubmit, isSubmitting, isDefaultValue }) => (
              <Button
                type="submit"
                variant="outline"
                size="square"
                disabled={!canSubmit || isSubmitting || isDefaultValue}
              >
                {isSubmitting ? (
                  <Loading className="size-4" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ChangePasswordDialog = () => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        authClient
          .changePassword({
            currentPassword: value.currentPassword,
            newPassword: value.newPassword,
            revokeOtherSessions: true,
          })
          .then(() => setOpen(false)),
        {
          loading: "Changing password...",
          success: "Password changed successfully",
          error: "Failed to change password",
        },
      )
    },
  })

  const handleForgotPassword = () => {
    if (!session?.user.email) return

    toast.promise(
      authClient
        .requestPasswordReset({
          email: session.user.email,
          redirectTo: "/reset-password",
        })
        .then(() => {
          setOpen(false)
        }),
      {
        loading: "Sending password reset email...",
        success: "Password reset email sent. Check your inbox.",
        error: "Failed to send password reset email",
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password to update your
            account.
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
            name="currentPassword"
            validators={{
              onChange: z.string().min(1, "Current password is required"),
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor="current-password"
                  className="text-sm font-medium"
                >
                  Current password
                </label>
                <Input
                  id="current-password"
                  name={field.name}
                  type="password"
                  variant="outline"
                  placeholder="Enter your current password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="newPassword"
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
              </div>
            )}
          </form.Field>
          <div className="flex flex-col gap-y-2">
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
                    "Change password"
                  )}
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleForgotPassword}
            >
              Set password via email
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const NameInput = () => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  const form = useForm({
    defaultValues: {
      name: session?.user.name ?? "",
    },
    onSubmit: async ({ value }) => {
      toast.promise(authClient.updateUser({ name: value.name }), {
        loading: "Updating name...",
        success: "Name updated",
        error: "Failed to update name",
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-y-1">
        <label htmlFor="name-input" className="text-sm font-medium">
          Name
        </label>
        <div className="flex w-full gap-x-4">
          <form.Field
            name="name"
            validators={{
              onChange: z.string().min(1, "Name is required"),
            }}
          >
            {(field) => (
              <Input
                id="name-input"
                name={field.name}
                type="text"
                variant="outline"
                placeholder="Enter your name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="flex-1"
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(formState) => ({
              canSubmit: formState.canSubmit,
              isSubmitting: formState.isSubmitting,
              isDefaultValue: formState.isDefaultValue,
            })}
          >
            {({ canSubmit, isSubmitting, isDefaultValue }) => (
              <Button
                type="submit"
                variant="outline"
                size="square"
                disabled={!canSubmit || isSubmitting || isDefaultValue}
              >
                {isSubmitting ? (
                  <Loading className="size-4" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
                <span className="sr-only">Update name</span>
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
