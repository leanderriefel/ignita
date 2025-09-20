# Ignita

Modern AI note-taking app, similar to Notion but open-source.
Web app, desktop app (Tauri), and a mobile app (Expo) are in active development.

Still heavily work in progress but frequent updates!

### Desktop installers are currently untested and likely broken. The only recommended way to use Ignita is the web app. Desktop/mobile should be built locally and may contain bugs.

## Features

- Rich text editor with AI-powered features
- Board view for kanban-style note organization
- Directory view for traditional file organization (wip)
- Workspace-based organization
- Custom themes and styling
- Authentication with email/password and Google

- Web app (Next.js + React Router)
- Cross-platform desktop app (Tauri) (in progress)
- Mobile app (Expo + React Native) (in progress)

## Tech Stack

- **Frontend**:
  - **Web**: Next.js, React Router, Tailwind CSS
  - **Desktop**: Tauri (Rust), React Router
  - **Mobile**: Expo, React Native, Expo Router, NativeWind
- **Backend**: tRPC, Next.js API routes, Drizzle ORM
- **AI**: OpenRouter (via `ai` SDK)
- **Authentication**: BetterAuth
- **Email**: Resend
- **Analytics**: PostHog
- **Monorepo**: TurboRepo, pnpm workspaces

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Rust (for desktop app development)
- Android Studio (for Android dev builds) — see Expo environment setup
- Xcode (for iOS dev builds; iOS currently untested) — see Expo environment setup

### Installation

1. Clone the repository:

```bash
git clone https://github.com/leanderriefel/ignita.git
cd ignita
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables (create a `.env` file in the repo root). All apps read from the top-level `.env` during development:

```bash
# Copy the example env file
cp .env.example .env
# Edit .env with your configuration
```

Notes:

- All variables inside the `.env` file are required for now. It is not tested if the variables are optional.
- In development, set `EXPO_PUBLIC_API_URL` to the LAN IP of your Next.js dev server (e.g., `192.168.x.x:3000`).
- Expo requirements and environment setup: see `https://docs.expo.dev/get-started/set-up-your-environment/`.
- Development builds (recommended for this project): see `https://docs.expo.dev/develop/development-builds/introduction/`.

1. Run the development servers:

```bash
# Web app (Next.js)
pnpm turbo dev --filter=@ignita/next

# Desktop app (Tauri). Requires the web app running.
pnpm turbo dev --filter=@ignita/tauri

# Mobile app (Expo dev build). Requires the web app running and EXPO_PUBLIC_API_URL pointing to your LAN IP.
# From apps/mobile (recommended):
pnpm expo run:android
# iOS (currently untested):
pnpm expo run:ios
```

Notes for mobile:

- Use development builds (`expo run:*`). Expo Go is untested and not recommended here.
- During development, without tunneling or reverse-port setup, Google social login will not work on real devices.

### Development

`pnpm turbo <script> [--filter=@ignita/<package>]`:

- `pnpm turbo lint` - Run linting
- `pnpm turbo typecheck` - Run type checking
- `pnpm turbo format` - Format code
- `pnpm turbo build` - Build packages/apps
- `pnpm db:push` - Push database schema (Drizzle)
- `pnpm db:studio` - Open Drizzle Studio

## Project Structure

```
ignita/
├── apps/
│   ├── next/          # Web app (Next.js)
│   ├── mobile/        # Mobile app (Expo + React Native)
│   └── tauri/         # Desktop app (Tauri)
├── packages/
│   ├── ai/            # OpenRouter provider and AI helpers
│   ├── auth/          # Authentication package
│   ├── components/    # Shared UI components
│   ├── database/      # Database schema and utilities
│   ├── emails/        # Email templates
│   ├── hooks/         # Shared React hooks
│   ├── lib/           # Shared utilities
│   ├── posthog/       # Analytics
│   └── trpc/          # tRPC routers and client
└── tooling/           # ESLint, Prettier, TypeScript configs
```

## Contributing

This project is being actively developed. At the moment, I am not accepting contributions.

---

## TODO

- [x] Editor Improvements
- [x] Board Notes
- [ ] Latex/Paper Notes with Preview
- [ ] Audio Component
- [ ] Live-Sync (Convex/Websockets?)
- [ ] Transcribe
- [ ] Autocomplete ("tab tab tab")
- [ ] (Re)write with AI
- [x] AI Summarization
- [ ] Notes Overview inside Workspace and Directory Notes
- [ ] Grid Layout / Multiple Notes on Screen
- [x] Landing Page
- [x] Continue from where you left off
- [ ] File Uploads (Uploadthing)
- [ ] Python/Javascript execution from Codeblocks
- [ ] Collaboration
- [x] Custom Themes
- [ ] Offline Support
- [ ] Mobile App (in progress, not priority)
- [ ] Version History
- [x] Resend Email
