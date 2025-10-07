export type ArticleMeta = {
	title: string;
	createdAt: string; // ISO 8601 format
	updatedAt: string; // ISO 8601 format

	tags?: string[];
	identifier: string;
	slug: string;
};

export type Article = {
	meta: ArticleMeta;
	content: string;
};
