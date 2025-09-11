import { Link, useLoaderData } from "react-router";
import { css } from "styled-system/css";
import { TagBadge } from "../components/TagBadge";
import { getPostBySlug } from "../data/posts";
import type { Route } from "./+types/blog.$slug";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const slug = params.slug ?? "";
	const post = getPostBySlug(slug);
	if (!post) {
		throw new Response("見つかりません", {
			status: 404,
			statusText: "見つかりません",
		});
	}
	return { post };
}

export const meta: Route.MetaFunction = ({ data }) =>
	data
		? [
				{ title: `${data.post.title} | My Blog` },
				{ name: "description", content: data.post.excerpt },
			]
		: [{ title: "記事 | My Blog" }];

export default function BlogPost() {
	const { post } = useLoaderData<typeof clientLoader>();
	return (
		<article
			className={css({
				display: "grid",
				gap: 4,
				// 簡易Typography
				"& h2": { fontSize: "xl", fontWeight: "semibold", mt: 6 },
				"& h3": { fontSize: "lg", fontWeight: "semibold", mt: 4 },
				"& p": { mt: 3, lineHeight: 7 },
				"& ul": { pl: 5, listStyle: "disc", mt: 3, display: "grid", gap: 1 },
				"& code": {
					bg: { base: "gray.100", _dark: "gray.800" },
					px: 1,
					rounded: "sm",
				},
			})}
		>
			<Link
				to=".."
				relative="path"
				className={css({
					fontSize: "sm",
					color: "blue.600",
					_hover: { textDecoration: "underline" },
				})}
			>
				← 一覧へ戻る
			</Link>
			<header>
				<h1 className={css({ fontSize: "3xl", fontWeight: "bold" })}>
					{post.title}
				</h1>
				<p
					className={css({
						fontSize: "sm",
						color: { base: "gray.600", _dark: "gray.400" },
					})}
				>
					{new Date(post.publishedAt).toLocaleString()}
				</p>
				<div
					className={css({ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" })}
				>
					{post.tags.map((t: string) => (
						<TagBadge key={t} tag={t} />
					))}
				</div>
			</header>
			<div
				className={css({ lineHeight: "7", wordBreak: "break-word" })}
				/* biome-ignore lint/security/noDangerouslySetInnerHtml: 自作記事（リポジトリ管理）のみをHTML化して表示するため */
				dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
			/>
		</article>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	return (
		<div>
			<h2 className={css({ fontSize: "lg", fontWeight: "semibold" })}>
				記事の読み込みに失敗しました
			</h2>
			<p className={css({ color: "red.600" })}>
				{error instanceof Error ? error.message : String(error)}
			</p>
			<p className={css({ mt: 2 })}>
				<Link
					to="/blog"
					className={css({
						color: "blue.600",
						_hover: { textDecoration: "underline" },
					})}
				>
					Blog一覧へ
				</Link>
			</p>
		</div>
	);
}
