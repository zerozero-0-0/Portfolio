const username = process.env.ATCODER_USERNAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!(username && accountId && namespaceId && apiToken)) {
    throw new Error('Environment variables are not set properly.');
}

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);
const unixSec = Math.floor(yesterday.getTime() / 1000);

// 昨日0:00からの提出を取得するためのURL
const url = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${username}&from_second=${unixSec}`;
const KVkey = `atcoder-problems-data:${username}`;

async function main() {
    const historyRes = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            Referer: `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${username}`,
        }
    });

    if (!historyRes.ok) {
        const body = await historyRes.text();
        throw new Error(`Failed to fetch AtCoder submissions: ${historyRes.status} ${historyRes.statusText}\n${body}`);
    }

    const history = await historyRes.json();
    if (!Array.isArray(history)) {
        throw new Error('AtCoder submissions history is invalid.');
    }

    const cnt = history.filter(submission => submission.result === "AC").length;

    const payload = {
        cnt: cnt,
        fetchedAt: Date.now(),
    };

    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(KVkey)}`;

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

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

