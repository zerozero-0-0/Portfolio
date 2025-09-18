type AtCoderDependencies = {
	request: (url: string, init: RequestInit) => Promise<Response>;
	buildRequestInit: () => RequestInit;
};

export function createAtCoderLatestRateFetcher({
	request,
	buildRequestInit,
}: AtCoderDependencies) {
	return async function fetchLatestRate(env: Env) {
	const username = env.ATCODER_USERNAME;

	const url = `https://atcoder.jp/users/${username}/history/json`;

	const res = await request(url, buildRequestInit());

	const payload = await res.json();

	if (!Array.isArray(payload) || payload.length === 0) {
		throw new Error(
			"Unexpected AtCoder history response: empty or non-array payload",
		);
	}

	const latestEntry = payload[payload.length - 1];

	return latestEntry.NewRating;
	};
}
