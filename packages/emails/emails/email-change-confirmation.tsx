import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

import { GeistFont } from "./utils/font-geist"
import { tailwindConfig } from "./utils/tailwind-config"

export const EmailChangeConfirmation = ({
  confirmUrl,
  name,
  newEmail,
}: {
  confirmUrl: string
  name: string
  newEmail: string
}) => {
  return (
    <Html>
      <Head>
        <GeistFont />
      </Head>
      <Tailwind config={tailwindConfig}>
        <Body className="mx-auto my-0 bg-background font-sans">
          <Container className="mx-auto my-10 max-w-xl p-5 text-center">
            <Section className="rounded-lg border border-border bg-card px-8 py-8 shadow-lg">
              <Heading className="mb-6 text-2xl font-bold text-foreground">
                Confirm Email Change
              </Heading>
              <Text className="mb-6 text-base text-foreground">
                Hello {name ?? "there"}, we received a request to change your
                email address to <strong>{newEmail}</strong>. Click the button
                below to confirm this change:
              </Text>
              <Section className="my-8">
                <Button
                  href={confirmUrl}
                  className="rounded-md bg-primary-lighter px-6 py-3 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Confirm Email Change
                </Button>
              </Section>
              <Text className="mt-6 text-sm text-muted-foreground">
                If the button doesn't work, you can also copy and paste this
                link into your browser:
              </Text>
              <Text className="my-2 text-xs break-all text-primary">
                <Link href={confirmUrl} className="underline">
                  {confirmUrl ?? "Not provided"}
                </Link>
              </Text>
              <Text className="mt-4 text-xs text-muted-foreground">
                This confirmation link will expire in 24 hours.
              </Text>
            </Section>

            <Text className="mt-8 text-xs text-muted-foreground">
              If you didn't request this email change, please ignore this email
              or contact support if you have concerns.
            </Text>

            <Hr className="my-8 border-border" />

            <Text className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Ignita. All rights reserved.
            </Text>
            <Text className="text-xs text-muted-foreground">
              <Link href="#" className="text-primary">
                Privacy Policy
              </Link>{" "}
              ·{" "}
              <Link href="#" className="text-primary">
                Terms of Service
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default EmailChangeConfirmation
