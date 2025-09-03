import React, { useState } from "react"
import { Link, Redirect } from "expo-router"
import { Button, SafeAreaView, Text, TextInput, View } from "react-native"

import { useAuth } from "../../providers/auth"

const SignUpScreen = () => {
  const { isAuthenticated, signUp } = useAuth()
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
        <Text style={{ fontSize: 28, fontWeight: "600" }}>Create account</Text>
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
        <Button
          title="Create account"
          onPress={() => signUp(email, password)}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Text>Already have an account?</Text>
        <Link href="/(auth)/sign-in">Sign in</Link>
      </View>
    </SafeAreaView>
  )
}

export default SignUpScreen

