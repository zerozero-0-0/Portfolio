import { Link, useLoaderData } from "react-router";
import { css } from "styled-system/css";
import { TagBadge } from "../components/TagBadge";
import { getAllPosts, getAllTags } from "../data/posts";
import type { Route } from "./+types/home";

export async function clientLoader() {
	const posts = getAllPosts().slice(0, 3);
	const tags = getAllTags().slice(0, 10);
	return { posts, tags };
}

export const meta: Route.MetaFunction = () => [
	{ title: "ホーム | My Blog" },
	{ name: "description", content: "最近の投稿とタグ" },
];

export default function Home() {
	const { posts, tags } = useLoaderData<typeof clientLoader>();
	return (
		<main
			className={css({
				maxW: "1280px",
				mx: "auto",
				pt: 16,
				p: 4,
				display: "grid",
				gap: 10,
			})}
		>
			{/* Hero */}
			<section className={css({ display: "grid", gap: 4 })}>
				<h1
					className={css({
						fontSize: { base: "3xl", md: "4xl" },
						fontWeight: "bold",
					})}
				>
					My Blog
				</h1>
				<p className={css({ color: { base: "gray.700", _dark: "gray.300" } })}>
					React Router v7 と PandaCSS で作る、シンプルで読みやすいブログ。
				</p>
				<div
					className={css({ display: "flex", gap: 3, mt: 2, flexWrap: "wrap" })}
				>
					<Link
						to="/blog"
						className={css({
							px: 4,
							py: 2,
							rounded: "md",
							bg: { base: "blue.600" },
							color: "white",
							_hover: { bg: { base: "blue.700" } },
							transition: "colors",
						})}
					>
						ブログを見る
					</Link>
					<Link
						to="/blog/tags"
						className={css({
							px: 4,
							py: 2,
							rounded: "md",
							borderWidth: "1px",
							borderColor: { base: "gray.300", _dark: "gray.700" },
							_hover: { bg: { base: "gray.100", _dark: "gray.800" } },
						})}
					>
						タグ一覧
					</Link>
				</div>
			</section>

			{/* Recent posts */}
			<section className={css({ display: "grid", gap: 4 })}>
				<h2 className={css({ fontSize: "2xl", fontWeight: "bold" })}>
					最近の投稿
				</h2>
				<ul className={css({ display: "grid", gap: 4 })}>
					{posts.map((p) => (
						<li
							key={p.slug}
							className={css({
								borderBottomWidth: "1px",
								borderColor: { base: "gray.200", _dark: "gray.800" },
								pb: 4,
							})}
						>
							<h3 className={css({ fontSize: "xl", fontWeight: "semibold" })}>
								<Link
									to={`/blog/${p.slug}`}
									className={css({ _hover: { textDecoration: "underline" } })}
								>
									{p.title}
								</Link>
							</h3>
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
							<div
								className={css({
									display: "flex",
									gap: 2,
									mt: 2,
									flexWrap: "wrap",
								})}
							>
								{p.tags.map((t) => (
									<TagBadge key={t} tag={t} />
								))}
							</div>
						</li>
					))}
				</ul>
			</section>

			{/* Popular tags */}
			<section className={css({ display: "grid", gap: 3 })}>
				<h2 className={css({ fontSize: "2xl", fontWeight: "bold" })}>
					人気のタグ
				</h2>
				<div className={css({ display: "flex", gap: 2, flexWrap: "wrap" })}>
					{tags.map((t) => (
						<TagBadge key={t} tag={t} />
					))}
				</div>
			</section>
		</main>
	);
}
