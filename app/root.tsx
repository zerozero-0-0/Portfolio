import type { Route } from "./+types/root";
import "./app.css";
import {
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { css } from "styled-system/css";
import { Container } from "./components/Container";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<header
					className={css({
						position: "sticky",
						top: 0,
						zIndex: 10,
						backdropFilter: "blur(10px)",
						borderBottomWidth: "1px",
						borderColor: { base: "gray.200", _dark: "gray.800" },
						bg: {
							base: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.70))",
							_dark:
								"linear-gradient(180deg, rgba(0,0,0,0.50), rgba(0,0,0,0.35))",
						},
					})}
				>
					<Container>
						<div
							className={css({
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								py: 4,
							})}
						>
							<Link to="/" className={css({ fontWeight: "semibold" })}>
								My Blog
							</Link>
							<Nav />
						</div>
					</Container>
				</header>
				<Container>{children}</Container>
				<Footer />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "エラーが発生しました";
	let details = "予期しないエラーが発生しました。";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "エラー";
		details =
			error.status === 404
				? "ページが見つかりませんでした。"
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className={css({ pt: 16, p: 4, maxW: "1280px", mx: "auto" })}>
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className={css({ width: "full", p: 4, overflowX: "auto" })}>
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
