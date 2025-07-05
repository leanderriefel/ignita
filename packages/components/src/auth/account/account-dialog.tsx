"use client"

import { useState } from "react"
import type { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { usePostHog } from "posthog-js/react"
import { useNavigate, useSearchParams } from "react-router"

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"

export const AccountDialog = ({
  authClient,
  authHooks,
}: {
  authClient: ReturnType<typeof createAuthClient>
  authHooks: ReturnType<typeof createAuthHooks>
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const open = !!searchParams.get("account")
  const setOpen = (open: boolean) => {
    if (open) {
      searchParams.set("account", "open")
    } else {
      searchParams.delete("account")
    }
    setSearchParams(searchParams)
  }

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const posthog = usePostHog()

  const session = authHooks.useSession()

  const [deleteUserOpen, setDeleteUserOpen] = useState(false)

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
    authClient.deleteUser({})
    setDeleteUserOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="square" variant="ghost">
          <Avatar>
            <AvatarImage src={session.data?.user.image ?? undefined} />
            <AvatarFallback>
              {session.data?.user.name?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            {session.data?.user.name ?? "Loading..."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-2">
          <Button variant="primary" className="w-full" onClick={signOut}>
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
                  email at {session.data?.user.email} to complete the deletion.
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
      </DialogContent>
    </Dialog>
  )
}
