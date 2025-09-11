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
marked.setOptions({ gfm: true, async: false });
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
		const file = parseFrontmatter(String(raw));
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

// 簡易Frontmatterパーサ（YAMLサブセット: title/date/excerpt/tags に対応）
function parseFrontmatter(input: string): {
	data: Record<string, unknown>;
	content: string;
} {
	const match = input.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
	if (!match) return { data: {}, content: input };
	const yaml = match[1];
	const rest = input.slice(match[0].length);
	const data: Record<string, unknown> = {};
	let currentKey: string | null = null;
	for (const rawLine of yaml.split(/\r?\n/)) {
		const line = rawLine.trimEnd();
		if (!line) continue;
		const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (kv) {
			const key = kv[1];
			const val = kv[2];
			if (val === "" || val == null) {
				currentKey = key;
				if (key === "tags") data[key] = [] as string[];
			} else {
				currentKey = null;
				data[key] = stripQuotes(val);
			}
			continue;
		}
		const li = line.match(/^-\s*(.*)$/);
		if (li && currentKey) {
			const arr = (data[currentKey] as string[]) || [];
			arr.push(stripQuotes(li[1]));
			data[currentKey] = arr;
		}
	}
	return { data, content: rest };
}

function stripQuotes(v: string): string {
	const s = v.trim();
	if (
		(s.startsWith('"') && s.endsWith('"')) ||
		(s.startsWith("'") && s.endsWith("'"))
	) {
		return s.slice(1, -1);
	}
	return s;
}
