import type { ApiFetchResult, CachedApiFetchResult } from "../types/api";

export async function handleCachedRequest<T>(
	kv: KVNamespace,
	cacheKey: string,
	ttlSeconds: number,
	fetcher: () => Promise<ApiFetchResult<T>>,
	ctx: ExecutionContext,
): Promise<CachedApiFetchResult<T>> {
	const cached = (await kv.get(cacheKey, { type: "json" })) as {
		data: T;
		fetchedAt: number;
	} | null;

	if (cached && Date.now() - cached.fetchedAt < ttlSeconds * 1000) {
		return {
			ok: true,
			data: cached.data,
			fetchedAt: cached.fetchedAt,
			fromCache: true,
		};
	}

	const fresh = await fetcher();
	if (!fresh.ok) {
		return fresh;
	}

	ctx.waitUntil(
		kv.put(
			cacheKey,
			JSON.stringify({ data: fresh.data, fetchedAt: fresh.fetchedAt }),
			{ expirationTtl: ttlSeconds },
		),
	);

	return {
		...fresh,
		fromCache: false,
	};
}
