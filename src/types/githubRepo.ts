import type { languageUsage } from "./language";

export type GitHubRepo = {
    id: number;
    name: string;
    full_name: string;
	fork: boolean;
	archived: boolean;
	languages_url: string;
};

export type FetchResult =
	| { ok: true; data: languageUsage[]; fetchedAt: number }
	| { ok: false; errorMessage: string; statusCode?: number };
