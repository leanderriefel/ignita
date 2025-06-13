import { Link } from "react-router"
import { z } from "zod"

import { cn } from "@ignita/lib"

import { Button } from "../../ui/button"
import { Divider } from "../../ui/divider"
import { useAppForm } from "./hooks"

type SignUpProps<T extends string> = {
  socialProviders: T[]
  onSocialSignUp: (provider: T) => void | Promise<void>
  onEmailAndPasswordSignUp: ({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
  }) => void | Promise<void>
  error?: string
}

export const SignUp = <T extends string>({
  socialProviders,
  onSocialSignUp,
  onEmailAndPasswordSignUp,
  error,
}: SignUpProps<T>) => {
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: ({ value }) => {
      void onEmailAndPasswordSignUp(value)
    },
  })

  return (
    <div
      className={cn(
        "relative m-2 w-full max-w-lg items-center justify-center space-y-6 rounded-2xl border p-8",
        "before:to-primary/5 before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:blur-md",
      )}
    >
      <h1 className="text-center text-2xl font-bold">Sign up</h1>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        {socialProviders.map((provider) => (
          <Button
            variant="primary"
            className="w-full"
            key={provider}
            onClick={() => void onSocialSignUp(provider)}
          >
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </Button>
        ))}
      </div>
      <Divider>or</Divider>
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <form.AppForm>
          <form.AppField
            name="name"
            validators={{
              onBlur: z.string().min(1, "Name is required"),
            }}
            children={(field) => <field.AuthNameField />}
          />
          <form.AppField
            name="email"
            validators={{
              onBlur: z.string().email("Invalid email"),
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
          <form.AuthSubmitButton text="Sign up" />
        </form.AppForm>
      </form>
      {error && (
        <p className="text-destructive mt-2 text-center text-sm">{error}</p>
      )}
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/auth" className="text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  )
}
