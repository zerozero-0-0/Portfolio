import { data, Link, useLoaderData } from "react-router";
import { css } from "styled-system/css";
import { getPostBySlug } from "../data/posts";
import type { Route } from "./+types/blog.$slug";

export async function loader({ params }: Route.LoaderArgs) {
	const slug = params.slug ?? "";
	const post = getPostBySlug(slug);
	if (!post) {
		throw data(
			{ message: "Not Found" },
			{ status: 404, statusText: "Not Found" },
		);
	}
	return data({ post });
}

export const meta: Route.MetaFunction = ({ data }) =>
	data
		? [
				{ title: `${data.post.title} | My Blog` },
				{ name: "description", content: data.post.excerpt },
			]
		: [{ title: "記事 | My Blog" }];

export default function BlogPost() {
	const { post } = useLoaderData<typeof loader>();
	return (
		<article className={css({ display: "grid", gap: 4 })}>
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
				<ul
					className={css({
						display: "flex",
						gap: 2,
						mt: 2,
						fontSize: "xs",
						color: { base: "gray.600", _dark: "gray.400" },
					})}
				>
					{post.tags.map((t: string) => (
						<li
							key={t}
							className={css({
								px: 2,
								py: 1,
								rounded: "full",
								borderWidth: "1px",
								borderColor: { base: "gray.300", _dark: "gray.700" },
							})}
						>
							#{t}
						</li>
					))}
				</ul>
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
			<h2 className="text-lg font-semibold">記事の読み込みに失敗しました</h2>
			<p className="text-red-600">
				{error instanceof Error ? error.message : String(error)}
			</p>
			<p className="mt-2">
				<Link to="/blog" className="text-blue-600 hover:underline">
					Blog一覧へ
				</Link>
			</p>
		</div>
	);
}
