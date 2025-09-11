import { Link, useLoaderData } from "react-router";
import { css } from "styled-system/css";
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
			<ul className={css({ display: "grid", gap: 4 })}>
				{posts.map(
					(p: {
						slug: string;
						title: string;
						excerpt: string;
						publishedAt: string;
					}) => (
						<li
							key={p.slug}
							className={css({
								borderBottomWidth: "1px",
								borderColor: { base: "gray.200", _dark: "gray.800" },
								pb: 4,
							})}
						>
							<h2 className={css({ fontSize: "xl", fontWeight: "semibold" })}>
								<Link
									to={p.slug}
									className={css({ _hover: { textDecoration: "underline" } })}
								>
									{p.title}
								</Link>
							</h2>
							<p
								className={css({
									fontSize: "sm",
									color: { base: "gray.600", _dark: "gray.400" },
								})}
							>
								{new Date(p.publishedAt).toLocaleDateString()}
							</p>
							<p
								className={css({
									mt: 2,
									color: { base: "gray.800", _dark: "gray.200" },
								})}
							>
								{p.excerpt}
							</p>
						</li>
					),
				)}
			</ul>
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
