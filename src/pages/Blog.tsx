import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { FaRegStickyNote } from "react-icons/fa";
import { Link } from "react-router";
import { css } from "../../styled-system/css";
import type { ArticleMeta } from "../types/Article";
import { Header } from "../utils/Header";

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
			content = (
				<p
					className={css({
						backgroundColor: "white",
						borderRadius: "2xl",
						border: "1px solid",
						borderColor: "gray.200",
						paddingInline: { base: "5", md: "6" },
						paddingBlock: { base: "5", md: "6" },
						color: "gray.600",
						fontSize: { base: "md", md: "lg" },
						boxShadow: "md",
					})}
				>
					記事を読み込んでいます…
				</p>
			);
			break;
		case "error":
			content = (
				<p
					className={css({
						backgroundColor: "white",
						borderRadius: "2xl",
						border: "1px solid",
						borderColor: "red.200",
						paddingInline: { base: "5", md: "6" },
						paddingBlock: { base: "5", md: "6" },
						color: "red.600",
						fontSize: { base: "sm", md: "md" },
						lineHeight: "1.6",
						boxShadow: "md",
					})}
				>
					記事一覧の取得に失敗しました。しばらく待ってから再度お試しください。
					<br />
					<small>詳細: {state.message}</small>
				</p>
			);
			break;
		case "success":
			if (state.data.length === 0) {
				content = (
					<p
						className={css({
							backgroundColor: "white",
							borderRadius: "2xl",
							border: "1px solid",
							borderColor: "gray.200",
							paddingInline: { base: "5", md: "6" },
							paddingBlock: { base: "5", md: "6" },
							color: "gray.600",
							fontSize: { base: "md", md: "lg" },
							boxShadow: "md",
						})}
					>
						公開済みの記事はまだありません。
					</p>
				);
				break;
			}

			content = (
				<ul
					className={css({
						listStyle: "none",
						margin: 0,
						padding: 0,
						display: "flex",
						flexDirection: "column",
						gap: { base: "5", md: "6" },
					})}
				>
					{state.data.map((article) => (
						<li
							key={article.identifier}
							className={css({
								listStyle: "none",
							})}
						>
							<Link
								to={`/blog/${article.identifier}`}
								className={css({
									display: "flex",
									flexDirection: "column",
									gap: { base: "3", md: "4" },
									textDecoration: "none",
									color: "gray.800",
									paddingInline: { base: "5", md: "6" },
									paddingBlock: { base: "5", md: "6" },
									borderRadius: "2xl",
									border: "1px solid",
									borderColor: "gray.200",
									backgroundColor: "white",
									boxShadow: "md",
									transition:
										"transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
									_hover: {
										transform: "translateY(-4px)",
										boxShadow: "xl",
										borderColor: "gray.300",
									},
									_focusVisible: {
										outline: "3px solid #6366f1",
										outlineOffset: "4px",
									},
								})}
							>
								<h2
									className={css({
										fontSize: { base: "lg", md: "xl" },
										fontWeight: "semibold",
										color: "gray.900",
									})}
								>
									{article.title}
								</h2>
								<div
									className={css({
										display: "flex",
										flexWrap: "wrap",
										alignItems: "center",
										gap: "3",
										color: "gray.500",
										fontSize: "sm",
									})}
								>
									<time dateTime={article.createdAt}>
										公開日 {formatDate(article.createdAt)}
									</time>
									<span aria-hidden="true">・</span>
									<time dateTime={article.updatedAt}>
										最終更新 {formatDate(article.updatedAt)}
									</time>
								</div>
								{article.tags?.length ? (
									<ul
										className={css({
											display: "flex",
											flexWrap: "wrap",
											gap: "2",
											margin: 0,
											padding: 0,
											listStyle: "none",
										})}
									>
										{article.tags.map((tag) => (
											<li
												key={tag}
												className={css({
													backgroundColor: "gray.100",
													borderRadius: "full",
													px: "3",
													py: "1",
													fontSize: "xs",
													fontWeight: "medium",
													color: "gray.600",
												})}
											>
												#{tag}
											</li>
										))}
									</ul>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			);
			break;
	}

	return (
		<div
			className={css({
				minHeight: "100%",
				backgroundColor: "#f8fafc",
				paddingBlock: { base: "12", md: "16" },
				paddingInline: { base: "6", md: "12" },
			})}
		>
			<div
				className={css({
					maxW: "960px",
					mx: "auto",
					display: "flex",
					flexDirection: "column",
					gap: { base: "6", md: "8" },
				})}
			>
				<Header
					title="ブログ"
					icon={{ type: "react-icon", icon: <FaRegStickyNote /> }}
				/>
				{content}
			</div>
		</div>
	);
}
