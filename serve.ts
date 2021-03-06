import {
  serve,
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.147.0/http/mod.ts";
import { contentType } from "https://deno.land/std@0.147.0/media_types/mod.ts";

import { getDependenciesScores, getSVG } from "./mod.ts";

// server implements
// サーバー（ブラウザからリクエストが来たらレスポンスを返す）
serve(async (request) => {
  const url = new URL(request.url);
  if (url.pathname === "/api/dependencies_score") {
    return await dependenciesScore(url);
  }
  if (url.pathname === "/badge.svg") {
    return await badge(url);
  }
  return notFound();
});

/**
 * Generate and return dependency score data
 * 依存関係スコアのデータを生成して返す
 */
async function dependenciesScore(url: URL) {
  const rootSpecifier = validateURL(url.searchParams.get("url"));
  if (!rootSpecifier) {
    return badRequest();
  }
  return Response.json(await getDependenciesScores(rootSpecifier), {
    headers: {
      "Cache-Control": "public, max-age=604800",
    },
  });
}

/**
 * Generate and return an image of the badge
 * バッジの画像を生成して返す
 */
async function badge(url: URL) {
  const rootSpecifier = validateURL(url.searchParams.get("url"));
  if (!rootSpecifier) {
    return badRequest();
  }
  const body = await getSVG(rootSpecifier);
  return new Response(body, {
    headers: {
      "Content-Type": contentType(".svg"),
      "Cache-Control": "public, max-age=604800",
    },
  });
}

/** 404 Not Found Response */
function notFound() {
  return new Response(STATUS_TEXT[Status.NotFound], {
    status: Status.NotFound,
    statusText: STATUS_TEXT[Status.NotFound],
  });
}

/** 400 Bad Request Response */
function badRequest() {
  return new Response(STATUS_TEXT[Status.BadRequest], {
    status: Status.BadRequest,
    statusText: STATUS_TEXT[Status.BadRequest],
  });
}

function validateURL(src: string | null) {
  if (!src) {
    return null;
  }
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
