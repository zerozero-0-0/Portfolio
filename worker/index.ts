import { type Context, Hono } from "hono";
import type { languageUsage } from "../src/types/language";
import { getPostByIdentifier, listArticles } from "./lib/parser";
import { createAtCoderLatestRateFetcher } from "./services/atcoder";
import { createGitHubLanguageSummaryFetcher } from "./services/github";
import { handleCachedRequest } from "./utils/cache";

type AppEnv = {
	Bindings: Env;
	Variables: { allowedOrigin: string | null };
};

const app = new Hono<AppEnv>();

const CACHE_TTL_IN_SECONDS = 60 * 60 * 24 * 7;
const BASE_CORS_HEADERS = {
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type,Accept,Accept-Language,Accept-Encoding,Authorization",
} as const;

app.use("*", async (c, next) => {
	const origin = c.req.header("Origin") ?? null;
	const allowedOrigin = origin ? resolveAllowedOrigin(c.env, origin) : null;

	if (origin && !allowedOrigin) {
		return new Response(null, { status: 403, headers: buildCorsHeaders(null) });
	}

	c.set("allowedOrigin", allowedOrigin);

	if (c.req.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: buildCorsHeaders(allowedOrigin),
		});
	}

	await next();
});

app.get("/api/languages", (c) => handleLanguageRequest(c));

const fetchWithDefaultInit = async (url: string, init: RequestInit = {}) =>
	fetch(url, init);

const buildGitHubHeaders = (token?: string): Headers => {
	const headers = new Headers({
		"User-Agent": "zerozero-0-0/portfolio",
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
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
	const data = await fetchLatestAtCoderRate(c.env);
	if (!data.ok) {
		return buildJsonResponse(
			c,
			{ latestRating: null, error: "Failed to fetch AtCoder rating" },
			{ status: 404 },
		);
	}
	return buildJsonResponse(c, { latestRating: data.rating });
});

app.notFound(() => new Response(null, { status: 404 }));

app.get("/api/article", (c) =>
	buildJsonResponse(c, {
		data: listArticles(),
	}),
);

app.get("/api/article/:identifier", (c) => {
	const identifier = c.req.param("identifier");
	const result = getPostByIdentifier(identifier);
	if (!result) {
		return buildJsonResponse(
			c,
			{ error: "Article not found" },
			{ status: 404 },
		);
	}
	return buildJsonResponse(c, { data: result });
});

function buildCacheKey(resource: string, identifier: string): string {
	return `${resource}:${identifier}`;
}

function buildJsonResponse<T>(
	c: Context<AppEnv>,
	body: T,
	init: ResponseInit = {},
): Response {
	const headers = new Headers(BASE_CORS_HEADERS);

	if (init.headers) {
		const extraHeaders = new Headers(init.headers);
		extraHeaders.forEach((value, key) => {
			headers.set(key, value);
		});
	}

	headers.set("Vary", "Origin");

	const allowedOrigin = c.get("allowedOrigin");
	if (allowedOrigin) {
		headers.set("Access-Control-Allow-Origin", allowedOrigin);
	}

	return Response.json(body, {
		...init,
		headers,
	});
}

async function handleLanguageRequest(c: Context<AppEnv>): Promise<Response> {
	const { env, executionCtx } = c;
	const result = await handleCachedRequest<languageUsage[]>(
		env.LANG_STATS,
		buildCacheKey("github-languages", env.GITHUB_USERNAME),
		CACHE_TTL_IN_SECONDS,
		() => fetchGitHubLanguageSummary(env),
		executionCtx,
	);

	if (!result.ok) {
		return buildJsonResponse(
			c,
			{
				error: result.errorMessage,
			},
			{
				status: result.statusCode ?? 502,
			},
		);
	}

	return buildJsonResponse(c, {
		data: result.data,
		cached: result.fromCache,
		fetchedAt: result.fetchedAt,
	});
}

function resolveAllowedOrigin(
	env: Env,
	originHeader: string | null,
): string | null {
	if (!originHeader) {
		return null;
	}

	const allowedOrigins =
		env.ALLOWED_ORIGINS?.split(",")
			.map((item) => item.trim())
			.filter(Boolean) ?? [];

	return allowedOrigins.includes(originHeader) ? originHeader : null;
}

function buildCorsHeaders(allowedOrigin: string | null): Headers {
	const headers = new Headers(BASE_CORS_HEADERS);
	headers.set("Vary", "Origin");
	if (allowedOrigin) {
		headers.set("Access-Control-Allow-Origin", allowedOrigin);
	}
	return headers;
}

export default app;
