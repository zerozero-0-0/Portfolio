import buildPercentages from "../src/lib/calc_percentage";
import type { FetchResult, GitHubRepo } from "../src/types/githubRepo";
import type { languageUsage } from "../src/types/language";

const CACHE_TTL = 60 * 60 * 24 * 7; // 1 week
const MAX_CONCURRENT = 5;

const corsHeaders = {
	"Access-Control-Allow-Origin": "*", // development only
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, content-type",
};

function isPreflight(req: Request): boolean {
	return req.method === "OPTIONS" && req.headers.has("Origin");
}

function BuildCorsResponse<T>(body: T, init: ResponseInit = {}): Response {
	return Response.json(body, {
		...init,
		headers: {
			...corsHeaders,
			...(init.headers || {}),
		},
	});
}

function buildCacheKey(username: string): string {
	return `lang-summary:${username}`;
}

async function aggregateLanguages(
	repos: GitHubRepo[],
	headers: Headers,
): Promise<FetchResult> {
	const totals = new Map<string, number>();
	let rejectedCount = 0;
	let pendingCount = 0;

	for (let i = 0; i < repos.length; i += MAX_CONCURRENT) {
		const slice = repos.slice(i, i + MAX_CONCURRENT);
		const results = await Promise.allSettled(
			slice.map((repo) => fetch(repo.languages_url, { headers })),
		);

		for (let index = 0; index < results.length; index++) {
			const result = results[index];
			const repo = slice[index];

			if (result.status === "rejected") {
				rejectedCount++;
				console.error(
					"languages_url fetch failed:",
					repo.full_name,
					result.reason,
				);
				continue;
			}

			const response = result.value;

			if (!response.ok) {
				rejectedCount++;
				console.warn(
					"languages_url return non-2xx",
					response.status,
					response.statusText,
					repo.full_name,
					response.url,
				);
				continue;
			}

			if (response.status === 202) {
				pendingCount++;
				console.info("languages_url processing", repo.full_name, response.url);
				continue;
			}

			if (response.status === 204) {
				console.log("Empty repository detected", response.url);
				continue;
			}

			const payload = (await response.json()) as Record<string, number>;
			console.log("Fetched languages:", payload);
			for (const [lang, bytes] of Object.entries(payload)) {
				totals.set(lang, (totals.get(lang) || 0) + bytes);
			}
		}

		if (rejectedCount > 0) {
			return {
				ok: false,
				errorMessage: `Failed to fetch language data for ${rejectedCount} repositories`,
				statusCode: 502,
			};
		}
	}

	if (totals.size === 0) {
		return {
			ok: false,
			errorMessage: "No language data found",
			statusCode: 404,
		};
	}

	if (totals.size === 0) {
		return {
			ok: false,
			errorMessage: "No language data found",
		};
	}

	if (pendingCount > 0) {
		console.info(
			`Skipped ${pendingCount} repositories with languages processing (HTTP 202)`,
		);
	}

	const summary = buildPercentages(totals);
	return {
		ok: true,
		data: summary,
		fetchedAt: Date.now(),
	};
}

type LinkMap = Record<string, string>;

function parseLinkHeader(header: string | null): LinkMap {
	if (!header) return {};
	return header.split(",").reduce((acc, part) => {
		const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
		if (match) {
			const [, url, rel] = match;
			acc[rel] = url;
		}
		return acc;
	}, {} as LinkMap);
}

async function fetchAllRepos(
	initialUrl: string,
	headers: HeadersInit,
): Promise<GitHubRepo[] | FetchResult> {
	const repos: GitHubRepo[] = [];
	let url = initialUrl;

	while (url) {
		const res = await fetch(url, { headers });
		if (!res.ok) {
			return {
				ok: false,
				statusCode: res.status,
				errorMessage:
					res.status === 403
						? "GitHub API rate limit exceeded"
						: `Failed to fetch repos: ${res.statusText}`,
			};
		}

		const pageData = (await res.json()) as GitHubRepo[];
		repos.push(...pageData);

		const links = parseLinkHeader(res.headers.get("Link"));
		url = links.next ?? null;
	}

	return repos;
}

async function fetchFromGitHub(env: Env): Promise<FetchResult> {
	const headers = new Headers({
		"User-Agent": "zerozero-0-0/portfolio",
		Accept: "application/vnd.github.v3+json",
	});

	if (env.LANG_USAGE_TOKEN) {
		headers.set("Authorization", `Bearer ${env.LANG_USAGE_TOKEN}`);
	}

	const baseUrl = `https://api.github.com/users/${env.GITHUB_USERNAME}/repos?per_page=100&type=public&sort=updated`;

	const repoResult = await fetchAllRepos(baseUrl, headers);

	if (!Array.isArray(repoResult)) {
		return repoResult;
	}

	const activeRepos = repoResult.filter((repo) => !repo.fork && !repo.archived);

	return aggregateLanguages(activeRepos, headers);
}

async function handleLanguageRequest(
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const cacheKey = buildCacheKey(env.GITHUB_USERNAME);
	const cached = (await env.LANG_STATS.get(cacheKey, { type: "json" })) as {
		data: languageUsage[];
		fetchedAt: number;
	} | null;

	if (cached && Date.now() - cached.fetchedAt < CACHE_TTL * 1000) {
		return BuildCorsResponse({
			data: cached.data,
			cached: true,
			fetchedAt: cached.fetchedAt,
		});
	}

	const fresh = await fetchFromGitHub(env);
	if (!fresh.ok) {
		return BuildCorsResponse(
			{ error: fresh.errorMessage },
			{ status: fresh.statusCode ?? 502 },
		);
	}

	ctx.waitUntil(
		env.LANG_STATS.put(
			cacheKey,
			JSON.stringify({ data: fresh.data, fetchedAt: fresh.fetchedAt }),
			{ expirationTtl: CACHE_TTL },
		),
	);

	return BuildCorsResponse({
		data: fresh.data,
		cached: false,
		fetchedAt: fresh.fetchedAt,
	});
}

export default {
	async fetch(req, env, ctx) {
		if (isPreflight(req)) {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(req.url);

		if (req.method === "GET" && url.pathname === "/api/languages") {
			return handleLanguageRequest(env, ctx);
		}

		return new Response(null, { status: 404 });
	},

	// fetch(request) {
	//     const url = new URL(request.url);

	//     if (url.pathname.startsWith("/api/")) {
	//         return Response.json({
	//             name: "Cloudflare",
	//         });
	//     }
	//     return new Response(null, { status: 404 });
	// },
} satisfies ExportedHandler<Env>;
