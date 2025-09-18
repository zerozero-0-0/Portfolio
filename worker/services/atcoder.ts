type AtCoderHistoryEntry = {
	NewRating: number;
};

function isAtCoderHistoryEntry(value: unknown): value is AtCoderHistoryEntry {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const record = value as Record<string, unknown>;
	return typeof record.NewRating === "number";
}

type AtCoderEnv = {
	ATCODER_USERNAME: string;
};

export async function fetchLatestRate(env: AtCoderEnv) {
	const url = `https://atcoder.jp/users/${env.ATCODER_USERNAME}/history/json`;

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(
			`Failed to fetch AtCoder data: ${res.status} ${res.statusText}`,
		);
	}

	const payload = (await res.json()) as unknown;

	if (!Array.isArray(payload) || payload.length === 0) {
		throw new Error(
			"Unexpected AtCoder history response: empty or non-array payload",
		);
	}

	const latestEntry = payload[payload.length - 1];

	if (!isAtCoderHistoryEntry(latestEntry)) {
		throw new Error("Unexpected AtCoder history response: missing NewRating");
	}

	return latestEntry.NewRating;
}
