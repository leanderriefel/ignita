import { createFileRoute } from "@tanstack/react-router";

import { getAccountByRiotId } from "../../../lib/riot/endpoints";
import { isPlatform } from "../../../lib/riot/regions";
import { HTTP_CACHE, jsonError, jsonOk } from "../../../lib/riot/http";

export const Route = createFileRoute("/api/riot/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const platform = params.get("platform") ?? "";
        const gameName = params.get("name") ?? "";
        const tagLine = params.get("tag") ?? "";

        if (!isPlatform(platform)) {
          return Response.json(
            { error: "bad_request", message: "Unknown platform" },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }
        if (!gameName || !tagLine) {
          return Response.json(
            { error: "bad_request", message: "Both name and tag are required" },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }

        try {
          const account = await getAccountByRiotId(platform, gameName, tagLine);
          return jsonOk(account, HTTP_CACHE.account);
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
