import { useLoaderData } from "react-router";
import { css } from "styled-system/css";
import { ArticleCard } from "../components/ArticleCard";
import { getAllPosts } from "../data/posts";
import type { Route } from "./+types/blog._index";

export async function clientLoader() {
	const list = getAllPosts();
	return { posts: list };
}

export const meta: Route.MetaFunction = () => [
	{ title: "Blog一覧 | My Blog" },
	{ name: "description", content: "ブログ記事の一覧" },
];

export default function BlogIndex() {
	const { posts } = useLoaderData<typeof clientLoader>();
	return (
		<div className={css({ display: "grid", gap: 6 })}>
			<h1 className={css({ fontSize: "2xl", fontWeight: "bold" })}>Blog</h1>
			<div
				className={css({
					display: "grid",
					gap: 4,
					gridTemplateColumns: { base: "1fr", md: "1fr 1fr" },
				})}
			>
				{posts.map(
					(p: {
						slug: string;
						title: string;
						excerpt: string;
						publishedAt: string;
					}) => (
						<ArticleCard
							key={p.slug}
							slug={p.slug}
							title={p.title}
							excerpt={p.excerpt}
							date={p.publishedAt}
						/>
					),
				)}
			</div>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	return (
		<div>
			<h2 className={css({ fontSize: "lg", fontWeight: "semibold" })}>
				一覧の読み込みに失敗しました
			</h2>
			<p className={css({ color: "red.600" })}>
				{error instanceof Error ? error.message : String(error)}
			</p>
		</div>
	);
}
