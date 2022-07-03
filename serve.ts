import {
  serve,
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.146.0/http/mod.ts";

import { getDependenciesScores } from "./score.ts";

serve(async (request) => {
  const { pathname, searchParams } = new URL(request.url);
  if (pathname === "/api/dependencies_score") {
    const rootSpecifier = searchParams.get("url");
    if (!rootSpecifier) {
      return new Response(STATUS_TEXT[Status.BadRequest], {
        status: Status.BadRequest,
        statusText: STATUS_TEXT[Status.BadRequest],
      });
    }
    return Response.json(await getDependenciesScores(rootSpecifier));
  }
  return new Response(STATUS_TEXT[Status.NotFound], {
    status: Status.NotFound,
    statusText: STATUS_TEXT[Status.NotFound],
  });
});
