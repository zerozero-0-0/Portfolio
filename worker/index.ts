import { Hono } from "hono";
import type { languageUsage } from "../src/types/language";
import { createAtCoderLatestRateFetcher } from "./services/atcoder";
import { createGitHubLanguageSummaryFetcher } from "./services/github";
import { handleCachedRequest } from "./utils/cache";

const app = new Hono<{ Bindings: Env }>();

const CACHE_TTL_IN_SECONDS = 60 * 60 * 24 * 7;
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // development only
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, content-type",
};

app.options("*", () => new Response(null, { headers: corsHeaders }));

app.get("/api/languages", (c) => handleLanguageRequest(c.env, c.executionCtx));

const EXTERNAL_REQUEST = async (url: string, init: RequestInit = {}) =>
    fetch(url, init);

const buildGitHubHeaders = (token?: string): Headers => {
    const headers = new Headers({
        "User-Agent": "zerozero-0-0/portfolio",
        Accept: "application/vnd.github.v3+json",
    });

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
};

const fetchGitHubLanguageSummary = createGitHubLanguageSummaryFetcher({
    request: EXTERNAL_REQUEST,
    buildHeaders: buildGitHubHeaders,
});

const fetchLatestAtCoderRate = createAtCoderLatestRateFetcher();

app.get("/api/atcoder", async (c) => {
    const data = await fetchLatestAtCoderRate(c.env);
    if (!data.ok) {
        return buildJsonResponse(
            { error: "Failed to fetch AtCoder rating" },
            { status: 404 },
        );
    }
    return buildJsonResponse({ rating: data.rating });
});

app.notFound(() => new Response(null, { status: 404 }));

function buildCacheKey(resource: string, identifier: string): string {
    return `${resource}:${identifier}`;
}

function buildJsonResponse<T>(body: T, init: ResponseInit = {}): Response {
    return Response.json(body, {
        ...init,
        headers: {
            ...corsHeaders,
            ...init.headers,
        },
    });
}

async function handleLanguageRequest(
    env: Env,
    ctx: ExecutionContext,
): Promise<Response> {
    const result = await handleCachedRequest<languageUsage[]>(
        env.LANG_STATS,
        buildCacheKey("github-languages", env.GITHUB_USERNAME),
        CACHE_TTL_IN_SECONDS,
        () => fetchGitHubLanguageSummary(env),
        ctx,
    );

    if (!result.ok) {
        return buildJsonResponse(
            {
                error: result.errorMessage,
            },
            {
                status: result.statusCode ?? 502,
            },
        );
    }

    return buildJsonResponse({
        data: result.data,
        cached: result.fromCache,
        fetchedAt: result.fetchedAt,
    });
}

export default app;
