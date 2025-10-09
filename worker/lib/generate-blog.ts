// scripts/generate-articles.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import createDOMPurify from "dompurify";
import fg from "fast-glob";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import MarkdownIt from "markdown-it";

const ROOT_DIR = process.cwd();
const ARTICLES_DIR = path.join(ROOT_DIR, "content", "blog");
const OUTPUT_PATH = path.join(
	ROOT_DIR,
	"content",
	"generated",
	"article-manifest.ts",
);

const md = new MarkdownIt({
	html: true,
	linkify: true,
});

const jsdom = new JSDOM("");
const DOMPurify = createDOMPurify(jsdom.window);
process.on("exit", () => {
	jsdom.window.close();
});

/**
 * 文字列化しやすいように、undefined を除外しつつシリアライズ可能なオブジェクトへ整形
 */
const toSerializableArticle = (input: {
	meta: Record<string, unknown>;
	content: string;
}) => ({
	meta: input.meta,
	content: input.content,
});

const slugify = (value: string) =>
	value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();

async function generate() {
	const files = await fg("**/*.md", {
		cwd: ARTICLES_DIR,
		absolute: true,
	});

	try {
		const articles = await Promise.all(
			files.map(async (filePath) => {
				const raw = await readFile(filePath, "utf8");

				const { data, content } = matter(raw);
				const identifier =
					typeof data.identifier === "string" &&
					data.identifier.trim().length > 0
						? data.identifier.trim()
						: slugify(path.basename(filePath, ".md"));
				const slug =
					typeof data.slug === "string" && data.slug.trim().length > 0
						? data.slug.trim()
						: identifier;

				const meta = {
					title: data.title ?? slug,
					identifier,
					slug,
					createdAt: normalizeDate(data.createdAt),
					updatedAt: normalizeDate(data.updatedAt ?? data.createdAt),
					tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
				};

				const rendered = md.render(content);
				const sanitizedContent = DOMPurify.sanitize(rendered);

				return toSerializableArticle({
					meta,
					content: sanitizedContent,
				});
			}),
		);

		const code =
			`import type { Article } from "../../src/types/Article";\n\n` +
			`export const articles = ${JSON.stringify(articles, null, 2)} satisfies Article[];\n\n` +
			`export default articles;`;

		await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
		await writeFile(OUTPUT_PATH, code, "utf8");
		console.log(`Manifest generated at ${OUTPUT_PATH}`);
	} finally {
		window.close();
	}
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

generate().catch((error) => {
	console.error(error);
	process.exit(1);
});
