import { createFileRoute } from "@tanstack/react-router";

import { getLeagueEntries } from "../../../lib/riot/endpoints";
import { isPlatform } from "../../../lib/riot/regions";
import { HTTP_CACHE, jsonError, jsonOk } from "../../../lib/riot/http";

export const Route = createFileRoute("/api/riot/ranked")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const platform = params.get("platform") ?? "";
        const puuid = params.get("puuid") ?? "";

        if (!isPlatform(platform)) {
          return Response.json(
            { error: "bad_request", message: "Unknown platform" },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }
        if (!puuid) {
          return Response.json(
            { error: "bad_request", message: "puuid is required" },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }

        try {
          const entries = await getLeagueEntries(platform, puuid);
          return jsonOk(entries, HTTP_CACHE.ranked);
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
