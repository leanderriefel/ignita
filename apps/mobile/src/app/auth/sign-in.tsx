import { useForm } from "@tanstack/react-form"
import { Link, Redirect } from "expo-router"
import { Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { z } from "zod"

import { cn } from "@ignita/lib"

import { KeyboardAwareCenter } from "~/components/ui/keyboard-aware-center"
import { Loading } from "~/components/ui/loading"
import { signIn, useSession } from "~/lib/auth/auth-client"

const SignInScreen = () => {
  const session = useSession()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await signIn.email({
        email: value.email,
        password: value.password,
      })
    },
  })

  if (session.isPending) {
    return <Loading />
  }

  if (session.data) {
    return <Redirect href="/" />
  }

  return (
    <SafeAreaView className="flex-1 px-6 py-10">
      <KeyboardAwareCenter>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-8 grow justify-center"
        >
          <Text className="text-4xl font-bold">Sign In</Text>
          <Pressable
            className="rounded-lg bg-primary p-3"
            onPress={async () => {
              try {
                await signIn.social({
                  provider: "google",
                  callbackURL: "/",
                })
              } catch (error) {
                console.error(error)
              }
            }}
          >
            <Text className="text-center text-primary-foreground">Google</Text>
          </Pressable>
          <View className="flex-row items-center gap-4">
            <View className="grow border-b border-border" />
            <Text className="text-center">or</Text>
            <View className="grow border-b border-border" />
          </View>
          <View className="gap-2">
            <form.Field
              name="email"
              validators={{
                onBlur: z.email("Invalid email"),
              }}
            >
              {(field) => (
                <View className="gap-1">
                  <TextInput
                    placeholder="Email"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    className="rounded-lg border p-3 text-foreground placeholder:text-muted-foreground"
                  />
                  {!field.state.meta.isValid ? (
                    <Text className="text-xs text-destructive">
                      {field.state.meta.errors
                        .map((e) => e?.message)
                        .join(", ")}
                    </Text>
                  ) : null}
                </View>
              )}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onBlur: z
                  .string()
                  .min(8, "Password must be at least 8 characters")
                  .max(100, "Password must be less than 100 characters"),
              }}
            >
              {(field) => (
                <View className="gap-1">
                  <TextInput
                    placeholder="Password"
                    secureTextEntry
                    autoComplete="new-password"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    className="rounded-lg border p-3 text-foreground placeholder:text-muted-foreground"
                  />
                  {!field.state.meta.isValid ? (
                    <Text className="text-xs text-destructive">
                      {field.state.meta.errors
                        .map((e) => e?.message)
                        .join(", ")}
                    </Text>
                  ) : null}
                </View>
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
                <Pressable
                  accessibilityLabel="Sign in"
                  className={cn("rounded-lg bg-secondary p-3", {
                    "bg-muted": !canSubmit || isDefaultValue,
                  })}
                  onPress={() => void form.handleSubmit()}
                  disabled={!canSubmit || isSubmitting || isDefaultValue}
                >
                  <Text
                    className={cn("text-center text-secondary-foreground", {
                      "text-muted-foreground": !canSubmit || isDefaultValue,
                    })}
                  >
                    {isSubmitting ? <Loading className="size-4" /> : "Sign in"}
                  </Text>
                </Pressable>
              )}
            </form.Subscribe>
          </View>
          <Text className="text-center">
            Reset your password in the{" "}
            <Link href="https://www.ignita.app/auth" className="text-primary">
              web app
            </Link>{" "}
            for now.
          </Text>
          <View className="gap-4">
            <Text className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary">
                Sign up here
              </Link>
            </Text>
            <Text className="text-center text-xs">
              By signing in, you agree to our{" "}
              <Link
                href="https://www.ignita.app/legal"
                className="text-primary"
              >
                Terms of Service
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAwareCenter>
    </SafeAreaView>
  )
}

export default SignInScreen

