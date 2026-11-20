import { createFileRoute } from "@tanstack/react-router";

import { getMatchIds, type MatchlistQuery } from "../../../lib/riot/endpoints";
import { isPlatform } from "../../../lib/riot/regions";
import { HTTP_CACHE, jsonError, jsonOk } from "../../../lib/riot/http";

const MATCH_TYPES = new Set(["RANKED", "NORMAL", "TOURNEY", "TUTORIAL"]);

export const Route = createFileRoute("/api/riot/matches")({
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

        const query: MatchlistQuery = {};

        const start = params.get("start");
        if (start !== null) {
          const parsed = Number(start);
          if (Number.isFinite(parsed) && parsed >= 0) {
            query.start = Math.floor(parsed);
          }
        }

        const count = params.get("count");
        if (count !== null) {
          const parsed = Number(count);
          if (Number.isFinite(parsed)) {
            query.count = Math.min(100, Math.max(1, Math.floor(parsed)));
          }
        }

        const queue = params.get("queue");
        if (queue !== null) {
          const parsed = Number(queue);
          if (Number.isFinite(parsed) && parsed > 0) {
            query.queue = Math.floor(parsed);
          }
        }

        const type = params.get("type");
        if (type !== null && MATCH_TYPES.has(type)) {
          query.type = type as MatchlistQuery["type"];
        }

        const startTime = params.get("startTime");
        if (startTime !== null) {
          const parsed = Number(startTime);
          if (Number.isFinite(parsed) && parsed > 0) {
            query.startTime = Math.floor(parsed);
          }
        }

        const endTime = params.get("endTime");
        if (endTime !== null) {
          const parsed = Number(endTime);
          if (Number.isFinite(parsed) && parsed > 0) {
            query.endTime = Math.floor(parsed);
          }
        }

        try {
          const matchIds = await getMatchIds(platform, puuid, query);
          return jsonOk(matchIds, HTTP_CACHE.matchlist);
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
