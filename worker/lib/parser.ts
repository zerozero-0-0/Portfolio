import articles from "../../content/generated/article-manifest";
import { sortArticleMetas } from "../../src/lib/article";
import type { Article, ArticleMeta } from "../../src/types/Article";

const articleByIdentifier = new Map<string, Article>();
const articleBySlug = new Map<string, Article>();

for (const article of articles) {
	articleByIdentifier.set(article.meta.identifier, article);
	articleBySlug.set(article.meta.slug, article);
}

export function listArticles(): ArticleMeta[] {
	return sortArticleMetas([...articleByIdentifier.values()]);
}

export function getPostByIdentifier(identifier: string): Article | null {
	return (
		articleByIdentifier.get(identifier) ?? articleBySlug.get(identifier) ?? null
	);
}
