import type { Article } from "../../src/types/Article";

const SITE_NAME = "Zrzr Portfolio";
const DESCRIPTION_MAX_LENGTH = 120;

type PageMeta = {
	title: string;
	description: string;
	url: string;
	type: "website" | "article";
};

/** 記事ページ用のメタ情報を組み立てる */
export function buildArticleMeta(article: Article, url: URL): PageMeta {
	return {
		title: `${article.meta.title} | ${SITE_NAME}`,
		description: summarize(article.content),
		// 末尾スラッシュや slug でのアクセスでも正規の URL にそろえる
		url: new URL(`/blog/${article.meta.identifier}`, url.origin).href,
		type: "article",
	};
}

/**
 * index.html の title / description / OGP / canonical を差し替える。
 * クローラーは JS を実行しないため、サーバー側で書き換えておく必要がある
 */
export function rewritePageMeta(response: Response, meta: PageMeta): Response {
	const setContent = (value: string) => ({
		element(element: Element) {
			element.setAttribute("content", value);
		},
	});

	// 書き換え後の HTML は index.html と中身が違うため、index.html の検証子を引き継がない
	const headers = new Headers(response.headers);
	headers.delete("ETag");
	headers.delete("Last-Modified");
	const shell = new Response(response.body, {
		status: response.status,
		headers,
	});

	return new HTMLRewriter()
		.on("title", {
			element(element) {
				element.setInnerContent(meta.title);
			},
		})
		.on('meta[name="description"]', setContent(meta.description))
		.on('meta[property="og:title"]', setContent(meta.title))
		.on('meta[property="og:description"]', setContent(meta.description))
		.on('meta[property="og:type"]', setContent(meta.type))
		.on('meta[property="og:url"]', setContent(meta.url))
		.on('link[rel="canonical"]', {
			element(element) {
				element.setAttribute("href", meta.url);
			},
		})
		.transform(shell);
}

/** 記事本文の HTML からタグを取り除き、先頭を説明文として切り出す */
function summarize(html: string): string {
	const text = html
		.replace(/<[^>]*>/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/\s+/g, " ")
		.trim();

	const chars = [...text];
	return chars.length > DESCRIPTION_MAX_LENGTH
		? `${chars.slice(0, DESCRIPTION_MAX_LENGTH).join("")}…`
		: text;
}
