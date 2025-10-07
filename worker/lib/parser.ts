import articles from "../../content/generated/article-manifest";
import type { Article, ArticleMeta } from "../../src/types/Article";

const articleByIdentifier = new Map<string, Article>();
const articleBySlug = new Map<string, Article>();

for (const article of articles) {
	articleByIdentifier.set(article.meta.identifier, article);
	articleBySlug.set(article.meta.slug, article);
}

export function listArticles(): ArticleMeta[] {
	return [...articleByIdentifier.values()]
		.map((article) => article.meta)
		.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getPostByIdentifier(identifier: string): Article | null {
	return (
		articleByIdentifier.get(identifier) ?? articleBySlug.get(identifier) ?? null
	);
}
