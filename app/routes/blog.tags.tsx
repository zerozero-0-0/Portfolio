import { Outlet } from "react-router";
import { css } from "styled-system/css";
import type { Route } from "./+types/blog.tags";

export const meta: Route.MetaFunction = () => [
	{ title: "タグ | My Blog" },
	{ name: "description", content: "タグ一覧とタグ別記事一覧" },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<main className={css({ maxW: "1280px", mx: "auto", pt: 16, p: 4 })}>
			{children}
		</main>
	);
}

export default function Tags() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	return (
		<div>
			<h2 className={css({ fontSize: "lg", fontWeight: "semibold" })}>
				タグの読み込みに失敗しました
			</h2>
			<p className={css({ color: "red.600" })}>
				{error instanceof Error ? error.message : String(error)}
			</p>
		</div>
	);
}
