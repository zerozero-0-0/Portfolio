import hljs from "highlight.js";
import markdownit from "markdown-it";
import type { Article } from "../../src/types/Article";
import matter from "gray-matter";

const md = new markdownit({
    html: false,
    linkify: true,
    highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            return `<pre><code class="hljs">${hljs.highlight(code, { language: lang }).value}</code></pre>`;
        }

        return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`;
    },
});

type RawMap = Record<string, string>;

const files = import.meta.glob("/src/Article/**/sample.md", { as: "raw", eager: true }) as RawMap;

export function listArticles(): Article[] {
    return Object.entries(files)
        .map(([path, raw]) => {
            const { data } = matter(raw);
            return {
                ...(data as Omit<Article, "slug">),
                path
            } as Article;
        });
}

export function getPostBySlug(slug: string) {
    for (const [path, raw] of Object.entries(files)) {
        const { data, content } = matter(raw);
        if ((data as any).slug === slug) {
            const html = md.render(content);
            return {
                meta: {
                    ...(data as Article),
                    path
                },
                content: html
            }
        }
    }
    return null;
}
