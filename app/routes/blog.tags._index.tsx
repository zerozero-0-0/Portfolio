import { Link, useLoaderData } from "react-router";
import { css } from "styled-system/css";
import { getAllTags } from "../data/posts";
import type { Route } from "./+types/blog.tags._index";

export async function clientLoader() {
	const tags = getAllTags();
	return { tags };
}

export const meta: Route.MetaFunction = () => [
	{ title: "タグ一覧 | My Blog" },
	{ name: "description", content: "全タグの一覧" },
];

export default function TagsIndex() {
	const { tags } = useLoaderData<typeof clientLoader>();
	return (
		<section className={css({ display: "grid", gap: 4 })}>
			<h1 className={css({ fontSize: "2xl", fontWeight: "bold" })}>タグ</h1>
			<ul className={css({ display: "flex", gap: 2, flexWrap: "wrap" })}>
				{tags.map((t: string) => (
					<li key={t}>
						<Link
							to={t}
							className={css({
								px: 3,
								py: 2,
								rounded: "full",
								borderWidth: "1px",
								borderColor: { base: "gray.300", _dark: "gray.700" },
								_hover: { bg: { base: "gray.100", _dark: "gray.800" } },
							})}
						>
							#{t}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
