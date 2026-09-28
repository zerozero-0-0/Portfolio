const username = process.env.ATCODER_USERNAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const firstSubmissionEpochSec = parseInt(
    process.env.ATCODER_FIRST_SUBMISSION_EPOCH_SEC,
    10,
);
const kvKey = `atcoder-problems-data:${username}`; // update スクリプトと同じキー構造

if (!(username && accountId && namespaceId && apiToken && firstSubmissionEpochSec)) {
    throw new Error("Environment variables are not set properly.");
}

const ATCODER_API_BASE = "https://kenkoooo.com/atcoder/atcoder-api/v3";
const FETCH_CHUNK = 500;
const SLEEP_MS = 150;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAllSubmissions(user, startEpochSec) {
    let cursor = startEpochSec;
    const submissions = [];

    while (true) {
        const url = `${ATCODER_API_BASE}/user/submissions?user=${user}&from_second=${cursor}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "zerozero-0-0/portfolio-init-script",
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(
                `Failed to fetch AtCoder submissions: ${res.status} ${res.statusText}\n${body}`,
            );
        }

        const chunk = await res.json();
        if (!Array.isArray(chunk)) {
            throw new Error("AtCoder submissions history is invalid.");
        }

        if (chunk.length === 0) {
            break;
        }

        submissions.push(...chunk);

        // from_second は inclusive なので次は+1 して重複を避ける
        const lastEpoch = chunk[chunk.length - 1].epoch_second;
        cursor = lastEpoch + 1;

        if (chunk.length < FETCH_CHUNK) {
            break; // 500 未満ならもう取得済み
        }

        await sleep(SLEEP_MS);
    }

    return submissions;
}

function buildDailyFirstAc(submissions, { offsetHours = 0 } = {}) {
    const solved = new Set();
    const daily = {};

    for (const s of submissions) {
        if (s.result !== "AC") continue;
        if (solved.has(s.problem_id)) continue;

        const date = new Date((s.epoch_second + offsetHours * 3600) * 1000);
        const day = date.toISOString().slice(0, 10);

        daily[day] = (daily[day] || 0) + 1;
        solved.add(s.problem_id);
    }

    return daily;
}

async function putToKv(key, value) {
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;

    const res = await fetch(kvUrl, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(value),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to update Cloudflare KV: ${res.status} ${res.statusText}\n${body}`);
    }
}

async function main() {
    console.log(`Fetching submissions for ${username} from ${firstSubmissionEpochSec} ...`);
    const submissions = await fetchAllSubmissions(username, firstSubmissionEpochSec);

    // API は古い順で返る保証がないので昇順ソート
    submissions.sort((a, b) => a.epoch_second - b.epoch_second);

    const dailyFirstAcCounts = buildDailyFirstAc(submissions, { offsetHours: 0 });
    const lastFetchedEpochSec = submissions.length
        ? submissions[submissions.length - 1].epoch_second
        : firstSubmissionEpochSec;

    const payload = {
        dailyFirstAcCounts,
        lastFetchedEpochSec,
        fetchedAt: Date.now(),
    };

    await putToKv(kvKey, payload);
    console.log(`Stored ${Object.keys(dailyFirstAcCounts).length} days into KV at key ${kvKey}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

