import { Outlet } from "react-router";
import { css } from "styled-system/css";
import type { Route } from "./+types/blog";

export const meta: Route.MetaFunction = () => [
	{ title: "Blog | My Blog" },
	{ name: "description", content: "ブログ記事の一覧と詳細" },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<main className={css({ maxW: "1280px", mx: "auto", pt: 16, p: 4 })}>
			<div
				className={css({
					display: "grid",
					gridTemplateColumns: { base: "1fr", md: "240px 1fr" },
					gap: 6,
				})}
			>
				<aside className={css({ order: { base: 2, md: 1 } })}>
					<div
						className={css({
							fontSize: "sm",
							color: { base: "gray.600", _dark: "gray.400" },
						})}
					>
						React Router v7で実装したブログです。
					</div>
				</aside>
				<section className={css({ order: { base: 1, md: 2 }, minW: 0 })}>
					{children}
				</section>
			</div>
		</main>
	);
}

export default function Blog() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	return (
		<div className={css({ maxW: "1280px", mx: "auto", pt: 16, p: 4 })}>
			<h2 className={css({ fontSize: "lg", fontWeight: "semibold" })}>
				Blog Error
			</h2>
			<p className={css({ color: "red.600" })}>
				{error instanceof Error ? error.message : "Unexpected error"}
			</p>
		</div>
	);
}
