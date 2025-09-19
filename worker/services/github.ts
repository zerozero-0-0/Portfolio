import buildPercentages from "../../src/lib/calc_percentage";
import type { GitHubRepo } from "../../src/types/githubRepo";
import type { languageUsage } from "../../src/types/language";
import type { ApiErrorResult, ApiFetchResult } from "../types/api";

const MAX_CONCURRENT = 5;

type LinkMap = Record<string, string>;

type GitHubDependencies = {
	request: (url: string, init?: RequestInit) => Promise<Response>;
	buildHeaders: (token?: string) => Headers;
};

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
	request: GitHubDependencies["request"],
): Promise<GitHubRepo[] | ApiErrorResult> {
	const repos: GitHubRepo[] = [];
	let url: string | null = initialUrl;

	while (url) {
		const res = await request(url, { headers });
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

async function aggregateLanguages(
	repos: GitHubRepo[],
	headers: Headers,
	request: GitHubDependencies["request"],
): Promise<ApiFetchResult<languageUsage[]>> {
	const totals = new Map<string, number>();
	let rejectedCount = 0;

	for (let i = 0; i < repos.length; i += MAX_CONCURRENT) {
		const slice = repos.slice(i, i + MAX_CONCURRENT);
		const results = await Promise.allSettled(
			slice.map((repo) => request(repo.languages_url, { headers })),
		);

		for (let idx = 0; idx < results.length; idx++) {
			const result = results[idx];

			if (result.status === "rejected") {
				rejectedCount++;
				continue;
			}

			const res = result.value;

			if (!res.ok) {
				rejectedCount++;
				continue;
			}

			if (res.status === 202 || res.status === 204) {
				continue;
			}

			const payload = (await res.json()) as Record<string, number>;
			for (const [lang, bytes] of Object.entries(payload)) {
				totals.set(lang, (totals.get(lang) || 0) + bytes);
			}
		}

		if (rejectedCount > 0) {
			return {
				ok: false,
				errorMessage: `Failed to fetch languages for ${rejectedCount} repositories.`,
				statusCode: 502,
			};
		}
	}

	if (totals.size === 0) {
		return {
			ok: false,
			errorMessage: "No language data found across repositories.",
			statusCode: 404,
		};
	}


	const summary = buildPercentages(totals);
	return {
		ok: true,
		data: summary,
		fetchedAt: Date.now(),
	};
}

export function createGitHubLanguageSummaryFetcher({
	request,
	buildHeaders,
}: GitHubDependencies) {
	return async function fetchGitHubLanguageSummary(
		env: Env,
	): Promise<ApiFetchResult<languageUsage[]>> {
		const headers = buildHeaders(env.LANG_USAGE_TOKEN);

		const baseUrl = `https://api.github.com/users/${env.GITHUB_USERNAME}/repos?per_page=100&type=owner`;
		const repoResult = await fetchAllRepos(baseUrl, headers, request);

		if (!Array.isArray(repoResult)) {
			return repoResult;
		}

		const activeRepos = repoResult.filter(
			(repo) => !repo.fork && !repo.archived,
		);
		return aggregateLanguages(activeRepos, headers, request);
	};
}
