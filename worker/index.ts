import { Hono } from "hono";
import type { languageUsage } from "../src/types/language";
import { fetchLatestRate } from "./services/atcoder";
import { fetchGitHubLanguageSummary } from "./services/github";
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

app.get("/api/atcoder", async (c) => {
	const latestRating = await fetchLatestRate(c.env);
	return buildJsonResponse({ latestRating });
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
