import { Link, useLoaderData } from "react-router";
import { css } from "styled-system/css";
import { getPostsByTag } from "../data/posts";
import type { Route } from "./+types/blog.tags.$tag";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const tag = params.tag ?? "";
	const posts = getPostsByTag(tag);
	if (!tag || posts.length === 0) {
		throw new Response("見つかりません", {
			status: 404,
			statusText: "見つかりません",
		});
	}
	return { tag, posts };
}

export const meta: Route.MetaFunction = ({ data }) =>
	data
		? [
				{ title: `${data.tag} の記事 | My Blog` },
				{ name: "description", content: `${data.tag} のタグ記事一覧` },
			]
		: [{ title: "タグの記事 | My Blog" }];

export default function TagPosts() {
	const { tag, posts } = useLoaderData<typeof clientLoader>();
	return (
		<section className={css({ display: "grid", gap: 6 })}>
			<header
				className={css({ display: "flex", alignItems: "center", gap: 3 })}
			>
				<h1 className={css({ fontSize: "2xl", fontWeight: "bold" })}>#{tag}</h1>
				<Link
					to=".."
					relative="path"
					className={css({
						color: "blue.600",
						_hover: { textDecoration: "underline" },
					})}
				>
					すべてのタグ
				</Link>
			</header>
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
									to={`../../${p.slug}`}
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
		</section>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	return (
		<div>
			<h2 className={css({ fontSize: "lg", fontWeight: "semibold" })}>
				タグの記事の読み込みに失敗しました
			</h2>
			<p className={css({ color: "red.600" })}>
				{error instanceof Error ? error.message : String(error)}
			</p>
			<p className={css({ mt: 2 })}>
				<Link
					to="/blog/tags"
					className={css({
						color: "blue.600",
						_hover: { textDecoration: "underline" },
					})}
				>
					タグ一覧へ
				</Link>
			</p>
		</div>
	);
}
