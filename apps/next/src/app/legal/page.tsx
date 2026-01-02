import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button, ThemeProvider } from "@ignita/components"

const LegalPage = () => {
  return (
    <ThemeProvider forcedTheme="light">
      <div className="relative">
        <Button size="square" variant="outline" asChild>
          <Link href="/" className="fixed top-8 left-8 md:top-20 md:left-20">
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="mx-auto my-24 prose w-11/12 px-4 prose-neutral md:my-40 md:prose-lg md:w-3/4">
          <h2>Privacy Policy</h2>

          <p>
            <strong>Last updated:</strong> August 24, 2025
          </p>

          <h3>Our Commitment to Privacy</h3>
          <p>
            At <strong>Ignita</strong>, privacy is fundamental. We are an
            open-source note-taking application that respects your privacy and
            handles your personal data transparently.
          </p>

          <h3>Data Collection and Usage</h3>
          <p>
            When you create an account via Google or email/password, we collect:
          </p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Profile picture (when signing in via social providers)</li>
            <li>IP address</li>
            <li>
              Time of signup and any subsequent changes to your personal data
            </li>
          </ul>
          <p>
            Your personal data and notes are securely stored on Neon databases
            with encryption at rest.
          </p>

          <h3>Analytics</h3>
          <p>
            We use <strong>PostHog EU Cloud</strong>, a GDPR-compliant analytics
            service, to track anonymized user interactions including:
          </p>
          <ul>
            <li>General click interactions</li>
            <li>Page views</li>
            <li>Feature usage metrics</li>
          </ul>
          <p>
            We do <strong>not</strong> collect specific keystrokes, identifiable
            click targets, or form inputs.
          </p>

          <h3>Local Storage</h3>
          <p>Ignita uses your device&apos;s local storage to:</p>
          <ul>
            <li>Store your selected theme</li>
            <li>Cache certain database queries to improve performance</li>
          </ul>
          <p>
            This data remains on your device and can be cleared anytime through
            your browser settings.
          </p>

          <h3>Open Source Transparency</h3>
          <p>
            Ignita is fully open source. You can review our entire source code
            to see exactly how your data is handled:
          </p>
          <ul>
            <li>
              <a href="https://github.com/leanderriefel/ignita">
                GitHub Repository
              </a>
            </li>
          </ul>

          <h3>Data Retention and Deletion</h3>
          <ul>
            <li>
              You can delete your account at any time; your data will be removed
              from our database within 1 minute.
            </li>
            <li>
              Backups and logs containing your personal data will be fully
              deleted within 30 days.
            </li>
          </ul>

          <h3>User Rights</h3>
          <p>Under GDPR, you have:</p>
          <ul>
            <li>
              <strong>Right to access:</strong> Request a copy of your data
            </li>
            <li>
              <strong>Right to rectification:</strong> Correct inaccurate data
            </li>
            <li>
              <strong>Right to erasure:</strong> Delete your data
            </li>
            <li>
              <strong>Right to data portability:</strong> Export your data
            </li>
          </ul>
          <p>
            You can use the account deletion feature within Ignita or contact us
            via email to exercise these rights.
          </p>

          <h3>Data Processing Locations</h3>
          <ul>
            <li>
              Data is processed and stored on servers hosted by Vercel and Neon.
            </li>
            <li>
              PostHog EU Cloud service processes analytics data within the EU.
            </li>
          </ul>

          <h3>Security Measures</h3>
          <ul>
            <li>
              Data encryption at rest using industry-standard encryption
              (AES-256)
            </li>
            <li>
              Secure authentication methods (OAuth 2.0 and secure password
              storage)
            </li>
            <li>Regular security updates</li>
          </ul>

          <h3>Contact</h3>
          <p>For privacy-related inquiries or exercising your data rights:</p>
          <ul>
            <li>
              Email: <a href="mailto:mail@leanderriefel.com">mail@leanderriefel.com</a>
            </li>
            <li>
              GitHub Issues:{" "}
              <a href="https://github.com/leanderriefel/ignita/issues">
                Open an issue
              </a>
            </li>
          </ul>

          <h3>Updates to This Policy</h3>
          <p>
            We may occasionally update this privacy policy. Material changes
            will be clearly communicated via our application or website.
          </p>

          <hr />

          <h2>Provider Identification (Impressum)</h2>
          <p>
            <strong>Leander Riefel</strong>
            <br />
            Email: <a href="mailto:mail@leanderriefel.com">mail@leanderriefel.com</a>
            <br />
            GitHub Issues:{" "}
            <a href="https://github.com/leanderriefel/ignita/issues">
              Open an issue
            </a>
          </p>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default LegalPage
