export async function fetchLatestRate(
    env: Env,
) {
    const url = `https://atcoder.jp/users/${env.ATCODER_USERNAME}/history/json`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch AtCoder data: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected AtCoder history response: empty or non-array payload");
    }

    const latestEntry = data[data.length - 1];

    return latestEntry.NewRating;
}
