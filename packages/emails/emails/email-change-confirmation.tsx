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
        <Body className="bg-background mx-auto my-0 font-sans">
          <Container className="mx-auto my-10 max-w-xl p-5 text-center">
            <Section className="bg-card border-border rounded-lg border px-8 py-8 shadow-lg">
              <Heading className="text-foreground mb-6 text-2xl font-bold">
                Confirm Email Change
              </Heading>
              <Text className="text-foreground mb-6 text-base">
                Hello {name ?? "there"}, we received a request to change your
                email address to <strong>{newEmail}</strong>. Click the button
                below to confirm this change:
              </Text>
              <Section className="my-8">
                <Button
                  href={confirmUrl}
                  className="bg-primary-lighter text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium shadow-sm transition-colors"
                >
                  Confirm Email Change
                </Button>
              </Section>
              <Text className="text-muted-foreground mt-6 text-sm">
                If the button doesn't work, you can also copy and paste this
                link into your browser:
              </Text>
              <Text className="text-primary my-2 break-all text-xs">
                <Link href={confirmUrl} className="underline">
                  {confirmUrl ?? "Not provided"}
                </Link>
              </Text>
              <Text className="text-muted-foreground mt-4 text-xs">
                This confirmation link will expire in 24 hours.
              </Text>
            </Section>

            <Text className="text-muted-foreground mt-8 text-xs">
              If you didn't request this email change, please ignore this email
              or contact support if you have concerns.
            </Text>

            <Hr className="border-border my-8" />

            <Text className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} Ignita. All rights reserved.
            </Text>
            <Text className="text-muted-foreground text-xs">
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
