"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { ResetPassword } from "@ignita/components"

const ResetPasswordPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get("token")
  const error = searchParams?.get("error")

  return (
    <div className="flex size-full items-center justify-center">
      <ResetPassword
        token={token}
        error={error}
        onSuccess={() => router.replace("/notes")}
      />
    </div>
  )
}

export default ResetPasswordPage
