import type { languageUsage } from "./language";

export type GitHubRepo = {
	fork: boolean;
	archived: boolean;
	languages_url: string;
};

export type FetchResult =
	| { ok: true; data: languageUsage[]; fetchedAt: number }
	| { ok: false; errorMessage: string; statusCode?: number };
