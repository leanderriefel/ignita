# Ignita

Modern AI note-taking app, similar to Notion but open-source.
Currently web (+ desktop app) but mobile app soon.

Still heavily work in progress but frequent updates!

### (The desktop app installers inside the releases have a high probability to be broken!)

## Features

- Rich text editor with AI-powered features
- Board view for kanban-style note organization
- Directory view for traditional file organization (wip)
- Workspace-based organization
- Custom themes and styling
- Authentication with email/password and Google

- Web app (Next.js + React Router)
- Cross-platform desktop app (Tauri) (wip)
- Mobile app coming soon (wip)

## Tech Stack

- **Frontend**:
  - **Web**: Next.js, React Router, Tailwind CSS
  - **Desktop**: Tauri (Rust), React Router
- **Backend**: tRPC, Next.js API routes, Drizzle ORM
- **Authentication**: BetterAuth
- **Email**: Resend
- **Analytics**: PostHog
- **AI**: OpenRouter (via `ai` SDK)
- **Monorepo**: TurboRepo, pnpm workspaces

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Rust (for desktop app development)

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

3. Set up environment variables (create a `.env` file in the repo root):

```bash
# Copy the example env file
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development servers:

```bash
# Web app (Next.js)
pnpm turbo dev --filter=@ignita/next

# Desktop app (Tauri). Requires the web app running.
pnpm turbo dev --filter=@ignita/tauri
```

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
│   └── tauri/         # Desktop app (Tauri)
├── packages/
│   ├── auth/          # Authentication package
│   ├── ai/            # OpenRouter provider and AI helpers
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
- [ ] Mobile App
- [ ] Version History
- [x] Resend Email
