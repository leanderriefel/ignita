import { createFileRoute } from "@tanstack/react-router";

import { getLiveGame } from "../../../lib/riot/endpoints";
import { isPlatform } from "../../../lib/riot/regions";
import { HTTP_CACHE, jsonError, jsonOk } from "../../../lib/riot/http";

export const Route = createFileRoute("/api/riot/live")({
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
          const live = await getLiveGame(platform, puuid);
          return jsonOk(live, HTTP_CACHE.live);
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
