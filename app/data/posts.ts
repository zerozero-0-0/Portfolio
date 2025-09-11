import matter from "gray-matter";
import { marked } from "marked";

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
	as: "raw",
	eager: true,
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
		const bodyHtml = marked(file.content);
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
