import { Hono } from "hono";
import type { languageUsage } from "../src/types/language";
import { createAtCoderLatestRateFetcher } from "./services/atcoder";
import { createGitHubLanguageSummaryFetcher } from "./services/github";
import { handleCachedRequest } from "./utils/cache";

const app = new Hono<{ Bindings: Env }>();

const CACHE_TTL_IN_SECONDS = 60 * 60 * 24 * 7;
const BASE_CORS_HEADERS = {
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
} as const;

app.options("*", (c) => {
	const origin = c.req.header("Origin");

    if (!origin) {
        return new Response(null, { status: 204 });
    }

	const allowedOrigin = resolveAllowedOrigin(c.env, origin);

	if (origin && !allowedOrigin) {
		return new Response(null, { status: 403 });
	}

	return new Response(null, {
		headers: buildCorsHeaders(allowedOrigin),
	});
});

app.get("/api/languages", (c) => {
	const origin = c.req.header("Origin");

    if (!origin) {
        return new Response(null, { status: 204 });
    }

	const allowedOrigin = resolveAllowedOrigin(c.env, origin);

	if (origin && !allowedOrigin) {
		return buildJsonResponse(
			{ error: "Origin not allowed" },
			{ status: 403 },
		);
	}

	return handleLanguageRequest(c.env, c.executionCtx, allowedOrigin);
});

const fetchWithDefaultInit = async (url: string, init: RequestInit = {}) =>
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
	request: fetchWithDefaultInit,
	buildHeaders: buildGitHubHeaders,
});

const fetchLatestAtCoderRate = createAtCoderLatestRateFetcher();

app.get("/api/atcoder", async (c) => {
	const origin = c.req.header("Origin");
    if (!origin) {
        return new Response(null, { status: 204 });
    }
	const allowedOrigin = resolveAllowedOrigin(c.env, origin);

	if (origin && !allowedOrigin) {
		return buildJsonResponse(
			{ latestRating: null, error: "Origin not allowed" },
			{ status: 403 },
		);
	}

	const data = await fetchLatestAtCoderRate(c.env);
	if (!data.ok) {
		return buildJsonResponse(
			{ latestRating: null, error: "Failed to fetch AtCoder rating" },
			{ status: 404 },
			allowedOrigin,
		);
	}
	return buildJsonResponse({ latestRating: data.rating }, undefined, allowedOrigin);
});

app.notFound(() => new Response(null, { status: 404 }));

function buildCacheKey(resource: string, identifier: string): string {
	return `${resource}:${identifier}`;
}

function buildJsonResponse<T>(
	body: T,
	init: ResponseInit = {},
	allowedOrigin: string | null = null,
): Response {
	const headers = new Headers({
		...BASE_CORS_HEADERS,
		...init.headers,
	});

	if (allowedOrigin) {
		headers.set("Access-Control-Allow-Origin", allowedOrigin);
	}

	return Response.json(body, {
		...init,
		headers,
	});
}

async function handleLanguageRequest(
	env: Env,
	ctx: ExecutionContext,
	allowedOrigin: string | null,
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
			allowedOrigin,
		);
	}

	return buildJsonResponse(
		{
			data: result.data,
			cached: result.fromCache,
			fetchedAt: result.fetchedAt,
		},
		undefined,
		allowedOrigin,
	);
}

function resolveAllowedOrigin(env: Env, originHeader: string | null): string | null {
	if (!originHeader) {
		return null;
	}

	const allowedOrigins = env.ALLOWED_ORIGINS?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

	return allowedOrigins.includes(originHeader) ? originHeader : null;
}

function buildCorsHeaders(allowedOrigin: string | null): Headers {
	const headers = new Headers(BASE_CORS_HEADERS);
	if (allowedOrigin) {
		headers.set("Access-Control-Allow-Origin", allowedOrigin);
	}
	return headers;
}

export default app;
