import {
  serve,
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.146.0/http/mod.ts";
import { contentType } from "https://deno.land/std@0.146.0/media_types/mod.ts";

import { getDependenciesScores } from "./score.ts";
import { svg } from "./svg.ts";

serve(async (request) => {
  const { pathname, searchParams } = new URL(request.url);
  if (pathname === "/api/dependencies_score") {
    const rootSpecifier = searchParams.get("url");
    if (!rootSpecifier) {
      return createResponse(Status.BadRequest);
    }
    return Response.json(await getDependenciesScores(rootSpecifier));
  }
  if (pathname === "/badge.svg") {
    const rootSpecifier = searchParams.get("url");
    if (!rootSpecifier) {
      return createResponse(Status.BadRequest);
    }
    const { score } = await getDependenciesScores(rootSpecifier);
    const body = await svg(`${Math.round(score * 1000) / 1000}`, "green");
    return new Response(body, {
      headers: {
        "Content-Type": contentType(".svg"),
      },
    });
  }
  return createResponse(Status.NotFound);
});

function createResponse(status: Status) {
  return new Response(STATUS_TEXT[status], {
    status: status,
    statusText: STATUS_TEXT[status],
  });
}
