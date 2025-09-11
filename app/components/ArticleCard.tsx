import { Link } from "react-router";
import { css } from "styled-system/css";

export function ArticleCard({
	slug,
	title,
	excerpt,
	date,
}: {
	slug: string;
	title: string;
	excerpt: string;
	date: string;
}) {
	return (
		<article
			className={css({
				borderWidth: "1px",
				borderColor: { base: "gray.200", _dark: "gray.800" },
				rounded: "lg",
				p: 4,
				bg: { base: "white", _dark: "black" },
				_hover: { shadow: "md" },
				transition: "shadow",
			})}
		>
			<h3 className={css({ fontSize: "xl", fontWeight: "semibold" })}>
				<Link
					to={slug}
					className={css({ _hover: { textDecoration: "underline" } })}
				>
					{title}
				</Link>
			</h3>
			<p
				className={css({
					fontSize: "sm",
					color: { base: "gray.600", _dark: "gray.400" },
					mt: 1,
				})}
			>
				{new Date(date).toLocaleDateString()}
			</p>
			<p
				className={css({
					mt: 2,
					color: { base: "gray.800", _dark: "gray.200" },
				})}
			>
				{excerpt}
			</p>
		</article>
	);
}
