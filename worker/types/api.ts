export type ApiErrorResult = {
	ok: false;
	errorMessage: string;
	statusCode?: number;
};

export type ApiSuccessResult<T> = {
	ok: true;
	data: T;
	fetchedAt: number;
};

export type ApiFetchResult<T> = ApiErrorResult | ApiSuccessResult<T>;

export type CachedApiFetchResult<T> =
	| (ApiSuccessResult<T> & { fromCache: boolean })
	| ApiErrorResult;
