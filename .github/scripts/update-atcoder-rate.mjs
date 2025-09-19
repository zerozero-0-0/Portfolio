const username = process.env.ATCODER_USERNAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!(username && accountId && namespaceId && apiToken)) {
    throw new Error('Environment variables are not set properly.');
}

const url = `https://atcoder.jp/users/${username}/history/json`;
const kvKey = `atcoder-rate:${username}`;

async function main() {
    const historyRes = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            Referer: `https://atcoder.jp/users/${username}/`,
        }
    });

    if (!historyRes.ok) {
        const body = await historyRes.text();
        throw new Error(`Failed to fetch AtCoder history: ${historyRes.status} ${historyRes.statusText}\n${body}`);
    }

    const history = await historyRes.json();
    if (!Array.isArray(history) || history.length === 0) {
        throw new Error('AtCoder history is empty or invalid.');
    }

    const latest = history[history.length - 1];
    if (typeof latest?.NewRating !== 'number') {
        throw new Error('Latest AtCoder rating is invalid.');
    }

    const payload = {
        rating: latest.NewRating,
        fetchedAt: Date.now(),
    };

    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(kvKey)}`;

    const putRes = await fetch(kvUrl, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!putRes.ok) {
        const body = await putRes.text();
        throw new Error(`Failed to update Cloudflare KV: ${putRes.status} ${putRes.statusText}\n${body}`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
