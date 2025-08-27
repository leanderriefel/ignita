# Ignita

Modern AI note-taking app, similar to Notion but open-source.
Currently web (+ desktop app) but mobile app soon.

Still heavily work in progress but frequent updates!

### (The desktop app installers inside the releases have a 99% probability to be broken!)

## Features

- Rich text editor with AI-powered features
- Board view for kanban-style note organization
- Directory view for traditional file organization (wip)
- Workspace-based organization (wip)
- Custom themes and styling (coming soon)
- Authentication with google (more planned)

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

3. Set up environment variables:

```bash
# Copy the example env file
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:

```bash
# Web app
turbo dev --filter=@ignita/next

# Desktop app (You need to have the web app running for the desktop app to work)
turbo dev
```

### Development

`turbo <script> [--filter=@ignita/<package>]`:

- `turbo lint` - Run linting
- `turbo typecheck` - Run type checking
- `turbo format` - Format code

## Project Structure

```
ignita/
├── apps/
│   ├── next/          # Web app (Next.js)
│   └── tauri/         # Desktop app (Tauri)
├── packages/
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

- [ ] Editor Improvements
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
- [ ] Custom Themes
- [ ] Offline Support
- [ ] Mobile App
- [ ] Version History
- [x] Resend Email
