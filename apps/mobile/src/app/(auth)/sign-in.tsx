import React, { useState } from "react"
import { Link, Redirect } from "expo-router"
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native"

import { useAuth } from "../../providers/auth"

const SignInScreen = () => {
  const { isAuthenticated, signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}
    >
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "600" }}>Sign In</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
        <Pressable
          onPress={() => signIn(email, password)}
          style={{
            backgroundColor: "#000",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Continue</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Text>Don&apos;t have an account?</Text>
        <Link href="/(auth)/sign-up">Create one</Link>
      </View>
    </SafeAreaView>
  )
}

export default SignInScreen

