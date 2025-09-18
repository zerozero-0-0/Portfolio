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

const EXTERNAL_REQUEST = async (url: string, init: RequestInit = {}) => fetch(url, init);

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

const buildAtCoderRequestInit = (): RequestInit => ({
	headers: new Headers({
		"User-Agent": "portfolio-worker/1.0 (+https://github.com/zerozero-0-0)",
		Accept: "application/json",
		"Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
		Referer: "https://atcoder.jp/",
	}),
	cf: {
		cacheEverything: true,
		cacheTtl: 60 * 30,
	},
});

const fetchGitHubLanguageSummary = createGitHubLanguageSummaryFetcher({
	request: EXTERNAL_REQUEST,
	buildHeaders: buildGitHubHeaders,
});

const fetchLatestRate = createAtCoderLatestRateFetcher({
	request: EXTERNAL_REQUEST,
	buildRequestInit: buildAtCoderRequestInit,
});

app.get("/api/atcoder", async (c) => {
	try {
		const latestRating = await fetchLatestRate(c.env);
		return buildJsonResponse({ latestRating });
	} catch (error) {
		console.error("Failed to fetch AtCoder rating", error);
		return buildJsonResponse(
			{
				error:
					error instanceof Error
						? error.message
						: "AtCoder レートの取得に失敗しました",
			},
			{ status: 502 },
		);
	}
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
