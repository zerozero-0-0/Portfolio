import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { css } from "../../styled-system/css";
import type { ArticleMeta } from "../types/Article";

type FetchState =
	| { status: "idle" | "loading" }
	| { status: "success"; data: ArticleMeta[] }
	| { status: "error"; message: string };

export default function Blog() {
	const [state, setState] = useState<FetchState>({ status: "idle" });

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat("ja-JP", {
				dateStyle: "medium",
			}),
		[],
	);

	useEffect(() => {
		let active = true;
		setState({ status: "loading" });

		fetch("/api/article")
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to load articles: ${res.status}`);
				}
				return res.json() as Promise<{ data: ArticleMeta[] }>;
			})
			.then((payload) => {
				if (!active) return;
				setState({ status: "success", data: payload.data });
			})
			.catch((error: unknown) => {
				if (!active) return;
				const message =
					error instanceof Error ? error.message : "未知のエラーが発生しました";
				setState({ status: "error", message });
			});

		return () => {
			active = false;
		};
	}, []);

	const formatDate = (isoString: string) => {
		const date = new Date(isoString);
		return Number.isNaN(date.getTime())
			? isoString
			: dateFormatter.format(date);
	};

	let content: ReactNode;

	switch (state.status) {
		case "idle":
		case "loading":
			content = <p className={styles.message}>記事を読み込んでいます…</p>;
			break;
		case "error":
			content = (
				<p className={styles.error}>
					記事一覧の取得に失敗しました。しばらく待ってから再度お試しください。
					<br />
					<small>詳細: {state.message}</small>
				</p>
			);
			break;
		case "success":
			if (state.data.length === 0) {
				content = (
					<p className={styles.message}>公開済みの記事はまだありません。</p>
				);
				break;
			}

			content = (
				<ul className={styles.list}>
					{state.data.map((article) => (
						<li key={article.slug} className={styles.listItem}>
							<Link to={`/blog/${article.slug}`} className={styles.articleLink}>
								<h2 className={styles.articleTitle}>{article.title}</h2>
								<div className={styles.meta}>
									<time dateTime={article.updatedAt}>
										{formatDate(article.updatedAt)}
									</time>
									{article.tags?.length ? (
										<ul className={styles.tagList}>
											{article.tags.map((tag) => (
												<li key={tag} className={styles.tagItem}>
													#{tag}
												</li>
											))}
										</ul>
									) : null}
								</div>
							</Link>
						</li>
					))}
				</ul>
			);
			break;
	}

	return (
		<section className={styles.wrapper}>
			<div className={styles.container}>
				<header className={styles.header}>
					<p className={styles.kicker}>Blog</p>
					<h1 className={styles.title}>最新記事</h1>
					<p className={styles.description}>
						学びのメモや開発ノートなどをMarkdownで整理して公開しています。
					</p>
				</header>
				{content}
			</div>
		</section>
	);
}

const styles = {
	wrapper: css({
		minHeight: "100%",
		backgroundColor: "gray.100",
		py: { base: "10", md: "16" },
	}),
	container: css({
		maxW: "960px",
		mx: "auto",
		px: { base: "6", md: "10" },
		display: "flex",
		flexDirection: "column",
		gap: { base: "8", md: "12" },
	}),
	header: css({
		display: "flex",
		flexDirection: "column",
		gap: "4",
	}),
	kicker: css({
		fontSize: "sm",
		fontWeight: "semibold",
		color: "blue.600",
		textTransform: "uppercase",
		letterSpacing: "wider",
	}),
	title: css({
		fontSize: { base: "3xl", md: "4xl" },
		fontWeight: "bold",
		color: "gray.900",
		lineHeight: "none",
	}),
	description: css({
		fontSize: { base: "md", md: "lg" },
		color: "gray.600",
		maxW: "3xl",
	}),
	message: css({
		color: "gray.600",
		fontSize: { base: "md", md: "lg" },
	}),
	error: css({
		color: "red.600",
		fontSize: { base: "sm", md: "md" },
		lineHeight: "1.6",
	}),
	list: css({
		display: "flex",
		flexDirection: "column",
		gap: { base: "6", md: "8" },
	}),
	listItem: css({
		listStyle: "none",
		backgroundColor: "white",
		borderRadius: "xl",
		boxShadow: "md",
		borderWidth: "1px",
		borderColor: "gray.200",
		transition: "all 0.2s ease-in-out",
		_hover: {
			transform: "translateY(-4px)",
			boxShadow: "xl",
		},
	}),
	articleLink: css({
		display: "flex",
		flexDirection: "column",
		gap: "3",
		padding: { base: "5", md: "6" },
		color: "inherit",
		textDecoration: "none",
	}),
	articleTitle: css({
		fontSize: { base: "xl", md: "2xl" },
		fontWeight: "semibold",
		color: "gray.900",
	}),
	meta: css({
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		gap: "2",
		color: "gray.500",
		fontSize: "sm",
	}),
	tagList: css({
		display: "flex",
		flexWrap: "wrap",
		gap: "2",
		marginInlineStart: "4",
	}),
	tagItem: css({
		backgroundColor: "gray.100",
		borderRadius: "full",
		px: "3",
		py: "1",
		fontSize: "xs",
		fontWeight: "medium",
		color: "gray.600",
	}),
} as const;
