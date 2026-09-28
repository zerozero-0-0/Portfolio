import type { Article, ArticleMeta } from "../types/Article";

/** dev サーバーで Markdown が更新されたときに送られる HMR イベント名 */
export const ARTICLE_HOT_UPDATE_EVENT = "blog:articles-updated";

/** 更新日の新しい順に並べたメタ情報一覧 */
export function sortArticleMetas(articles: Article[]): ArticleMeta[] {
	return articles
		.map((article) => article.meta)
		.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/** identifier を優先し、なければ slug で記事を探す */
export function findArticle(
	articles: Article[],
	identifier: string,
): Article | null {
	return (
		articles.find((article) => article.meta.identifier === identifier) ??
		articles.find((article) => article.meta.slug === identifier) ??
		null
	);
}
