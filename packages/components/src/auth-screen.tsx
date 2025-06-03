import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Loading } from "./ui/loading"

type AuthScreenProps = (
  | {
      onSignIn: ({
        email,
        password,
      }: {
        email: string
        password: string
      }) => void
      includeName: false
    }
  | {
      onSignIn: ({
        email,
        password,
        name,
      }: {
        email: string
        password: string
        name: string
      }) => void
      includeName: true
    }
) & {
  signUp?: string
  alreadyAccount?: string
  error?: string
}

export const AuthScreen = ({
  onSignIn,
  includeName,
  signUp,
  alreadyAccount,
  error,
}: AuthScreenProps) => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      if (includeName) {
        onSignIn({
          email: value.email,
          password: value.password,
          name: value.name,
        })
      } else {
        onSignIn({
          email: value.email,
          password: value.password,
        })
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className="w-1/2 max-w-xl items-center justify-center space-y-6 rounded-lg border p-8"
    >
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome to ignita</h1>
        <p className="text-muted-foreground text-sm">
          {includeName
            ? "Create an account to continue"
            : "Sign in to your account to continue"}
        </p>
      </div>

      {/* Name Field */}
      {includeName && (
        <form.Field
          validators={{
            onBlur: z.string().min(1, "Name is required"),
          }}
          name="name"
        >
          {(field) => (
            <div className="space-y-2">
              <div className="mb-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Name
                </label>
              </div>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder="Enter your name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full"
              />
              {!field.state.meta.isValid ? (
                <p className="text-destructive text-sm">
                  {field.state.meta.errors
                    .map((error) => error?.message)
                    .join(", ")}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
      )}

      {/* Email Field */}
      <form.Field
        validators={{
          onBlur: z.string().email("Invalid email"),
        }}
        name="email"
      >
        {(field) => (
          <div className="space-y-2">
            <div className="mb-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Email address
              </label>
            </div>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="Enter your email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
            />
            {!field.state.meta.isValid ? (
              <p className="text-destructive text-sm">
                {field.state.meta.errors
                  .map((error) => error?.message)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      {/* Password Field */}
      <form.Field
        validators={{
          onBlur: z.string().min(8, "Password must be at least 8 characters"),
        }}
        name="password"
      >
        {(field) => (
          <div className="space-y-2">
            <div className="mb-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Password
              </label>
            </div>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="Enter your password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
            />
            {!field.state.meta.isValid ? (
              <p className="text-destructive text-sm">
                {field.state.meta.errors
                  .map((error) => error?.message)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isSubmitting ? <Loading /> : includeName ? "Sign up" : "Sign in"}
          </Button>
        )}
      </form.Subscribe>

      {error && <p className="text-destructive text-center text-sm">{error}</p>}

      {signUp && (
        <p className="text-muted-foreground text-center text-sm">
          Don't have an account?{" "}
          <a href={signUp} className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      )}

      {alreadyAccount && (
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <a href={alreadyAccount} className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      )}
    </form>
  )
}
