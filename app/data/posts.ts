import matter from "gray-matter";
import hljs from "highlight.js";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";

export type Post = {
	slug: string;
	title: string;
	excerpt: string;
	bodyHtml: string;
	publishedAt: string; // ISO8601
	tags: string[];
};

// Vite/React RouterのビルドでMarkdownをraw文字列として読み込む
const markdownModules = import.meta.glob("../content/*.md", {
	eager: true,
	// Vite 6: `as: 'raw'` は非推奨。`query`+`import`でraw文字列を取得
	query: "?raw",
	import: "default",
});

// Markedの拡張（GFM/見出しID/コードハイライト）
marked.setOptions({ gfm: true });
marked.use(
	markedHighlight({
		langPrefix: "hljs language-",
		highlight(code, lang) {
			try {
				if (lang && hljs.getLanguage(lang)) {
					return hljs.highlight(code, { language: lang }).value;
				}
			} catch {}
			return hljs.highlightAuto(code).value;
		},
	}),
);
// 見出しにid付与（sluggerを利用）
marked.use({
	renderer: {
		heading(text: string, level: number, _raw: string) {
			const id = text
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9\u00C0-\u024f]+/g, "-")
				.replace(/^-+|-+$/g, "");
			return `<h${level} id="${id}">${text}</h${level}>`;
		},
	},
});

const parsedPosts: Post[] = Object.entries(markdownModules).map(
	([path, raw]) => {
		const file = matter(String(raw));
		const filename = path.split("/").pop() ?? "post";
		const slug = filename.replace(/\.md$/, "");
		const title = String(file.data.title ?? slug);
		const publishedAt = String(file.data.date ?? new Date().toISOString());
		const tags = Array.isArray(file.data.tags)
			? (file.data.tags as string[])
			: [];
		const excerpt = String(file.data.excerpt ?? "");
		const bodyHtml = marked.parse(file.content) as string;
		return { slug, title, excerpt, bodyHtml, publishedAt, tags };
	},
);

export function getAllPosts(): Post[] {
	return parsedPosts
		.slice()
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): Post | null {
	return parsedPosts.find((p) => p.slug === slug) ?? null;
}

export function getAllTags(): string[] {
	const set = new Set<string>();
	for (const p of parsedPosts) for (const t of p.tags) set.add(t);
	return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getPostsByTag(tag: string): Post[] {
	return parsedPosts
		.filter((p) => p.tags.includes(tag))
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
