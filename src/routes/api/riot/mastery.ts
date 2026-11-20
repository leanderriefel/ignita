import { createFileRoute } from "@tanstack/react-router";

import { getChampionMasteries } from "../../../lib/riot/endpoints";
import { isPlatform } from "../../../lib/riot/regions";
import { HTTP_CACHE, jsonError, jsonOk } from "../../../lib/riot/http";

export const Route = createFileRoute("/api/riot/mastery")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const platform = params.get("platform") ?? "";
        const puuid = params.get("puuid") ?? "";
        const countParam = params.get("count");

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

        const count =
          countParam === null ? undefined : Math.min(100, Math.max(1, Number(countParam) || 3));

        try {
          const masteries = await getChampionMasteries(platform, puuid, count);
          return jsonOk(masteries, HTTP_CACHE.mastery);
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
