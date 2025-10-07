import matter from "gray-matter";
import hljs from "highlight.js";
import markdownIt from "markdown-it";
import type { Article, ArticleMeta } from "../../src/types/Article";

const md = markdownIt({
	html: false,
	linkify: true,
});

md.set({
	highlight: (code: string, language?: string): string => {
		if (language && hljs.getLanguage(language)) {
			return `<pre><code class="hljs">${hljs.highlight(code, { language }).value}</code></pre>`;
		}

		return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`;
	},
});

type RawMap = Record<string, string>;
type RawFrontmatter = Record<string, unknown>;

const files = import.meta.glob("/src/Article/**/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as RawMap;

export function listArticles(): ArticleMeta[] {
	return Object.entries(files)
		.map(([path, raw]) => {
			const { data } = matter(raw);
			return buildMeta(path, data);
		})
		.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): Article | null {
	for (const [path, raw] of Object.entries(files)) {
		const { data, content } = matter(raw);
		const meta = buildMeta(path, data);
		if (meta.slug === slug) {
			return {
				meta,
				content: md.render(content),
			};
		}
	}
	return null;
}

function buildMeta(path: string, rawData: RawFrontmatter): ArticleMeta {
	const data: Record<string, unknown> = Object.fromEntries(
		Object.entries(rawData).map(([key, value]) => [key.toLowerCase(), value]),
	);

	const title = ensureString(data.title, getFallbackTitle(path));
	const slug = ensureSlug(data.slug ?? getFilename(path), path);
	const tags = normalizeTags(data.tags);

	return {
		title,
		slug,
		tags,
		createdAt: normalizeDate(data.createdat ?? data.createddate),
		updatedAt: normalizeDate(
			data.updatedat ?? data.updateddate ?? data.createdat,
		),
	};
}

function getFilename(path: string): string {
	const segments = path.split("/");
	return segments[segments.length - 1] ?? "post";
}

function getFallbackTitle(path: string): string {
	const filename = getFilename(path);
	return filename.replace(/\.md$/i, "");
}

function ensureSlug(value: unknown, path: string): string {
	const raw = ensureString(value, "");
	const candidate = slugify(raw);
	if (candidate) {
		return candidate;
	}
	return slugify(path.replace(/\.md$/i, "")) || `post-${Date.now()}`;
}

function slugify(value: string): string {
	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();
}

function ensureString(value: unknown, fallback: string): string {
	if (typeof value === "string") {
		return value;
	}
	return fallback;
}

function normalizeTags(value: unknown): string[] | undefined {
	if (!value) {
		return undefined;
	}
	if (Array.isArray(value)) {
		return value.map((item) => `${item}`);
	}
	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return undefined;
}

function normalizeDate(value: unknown): string {
	if (typeof value === "string" || value instanceof Date) {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return date.toISOString();
		}
	}
	return new Date().toISOString();
}
