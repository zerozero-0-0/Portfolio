type dataType = {
	ok: boolean;
	rating: number | null;
};

type KvRatingPayload = {
	rating: number;
	fetchedAt: number;
};

const CACHE_KEY_PREFIX = "atcoder-problems-submission";
const STALE_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function createAtCoderLatestRateFetcher() {
	return async function fetchLatestRate(env: Env): Promise<dataType> {
		const username = env.ATCODER_USERNAME;
		if (!username) {
			throw new Error("AtCoder username is not set in environment variables.");
		}

		const cacheKey = `${CACHE_KEY_PREFIX}:${username}`;
		const cached = await env.LANG_STATS.get<KvRatingPayload>(cacheKey, {
			type: "json",
		});
		const now = Date.now();

		if (cached && typeof cached.rating === "number") {
			const isFresh = now - cached.fetchedAt < STALE_THRESHOLD_MS;
			if (isFresh) {
				return {
					ok: true,
					rating: cached.rating,
				};
			}
		}

		return {
			ok: false,
			rating: null,
		};
	};
}
