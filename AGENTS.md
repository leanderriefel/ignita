This is a monorepo using TurboRepo. Tooling configs are inside tooling/, packages like components, auth, database are inside packages/ and the actual apps like tauri desktop app or website are inside apps/.

The tauri desktop app inside apps/tauri uses react-router.

The web app inside apps/next uses nextjs and react-router. Notice: nextjs is used only as a shell and only for things like api routers, the landing page and auth. For the actual notes page, react-router is used. Nextjs shouldn't touch any of that stuff and also shouldn't server render any of that stuff.

When editing, be as concise as possible and don't edit anything that is not part of what was asked. However, when refactoring some code for example, still look for usages in other files and if these have to be changed as well, again don't change anything that wasn't asked for though.

When heavily changing stuff, to test if there are any errors you can run "pnpm turbo lint [--filter=@ignita/...]" and "pnpm turbo typecheck [--filter=@ignita/...]" from the root point of the project. Keep in mind that you can also use the native tools of your environment to test for errors, if available.

DO NOT RUN A DEV SERVER OR BUILD PROCESS. The user is already running a dev server and any of these commands will break it.

Always prefer "const foo = (bar: type) => " over "function foo(bar: type)".

When a package is used by more than two packages or apps or toolings (is in more than one package.json), then the version should be managed by the workspaces catalog inside the pnpm-workspace.yaml file and the package or app package.json files should use "catalog:" as the version.

Do not write comments unless its a complex and hacky piece of code which either way you should not code.

Do not use hardcoded colors.

If you are unsure, stop and ask.

Use pnpm as a package manager.

Do not start development servers or start build processes.

Never say "I see the issue now" or "You're absolutely right" because 99% of the time you don't and I'm not.
