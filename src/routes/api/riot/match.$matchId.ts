import { createFileRoute } from "@tanstack/react-router";

import { getMatch } from "../../../lib/riot/endpoints";
import { HTTP_CACHE, jsonError, jsonOk } from "../../../lib/riot/http";

export const Route = createFileRoute("/api/riot/match/$matchId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const matchId = params.matchId ?? "";
        if (!matchId || !matchId.includes("_")) {
          return Response.json(
            { error: "bad_request", message: "A match id like EUW1_1234567890 is required" },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }

        try {
          const match = await getMatch(matchId);
          return jsonOk(match, HTTP_CACHE.match);
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
