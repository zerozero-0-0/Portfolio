import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { FaRegStickyNote } from "react-icons/fa";
import { Link, useParams } from "react-router";
import { css } from "../../styled-system/css";
import type { Article } from "../types/Article";
import { Header } from "../utils/Header";

type ArticleState =
	| { status: "idle" | "loading" }
	| { status: "success"; data: Article }
	| { status: "error"; message: string };

export default function BlogPost() {
	const { slug } = useParams<{ slug: string }>();
	const [state, setState] = useState<ArticleState>({ status: "idle" });

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat("ja-JP", {
				dateStyle: "medium",
			}),
		[],
	);

	useEffect(() => {
		if (!slug) {
			setState({
				status: "error",
				message: "記事の識別子が指定されていません。",
			});
			return;
		}

		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}

		let active = true;
		setState({ status: "loading" });

		fetch(`/api/article/${slug}`)
			.then(async (res) => {
				if (res.status === 404) {
					const payload = await res.json().catch(() => null);
					const message =
						(payload as { error?: string } | null)?.error ??
						"指定された記事は見つかりませんでした。";
					throw new NotFoundError(message);
				}

				if (!res.ok) {
					throw new Error(`Failed to load article: ${res.status}`);
				}

				return res.json() as Promise<{ data: Article }>;
			})
			.then((payload) => {
				if (!active) return;
				setState({ status: "success", data: payload.data });
			})
			.catch((error: unknown) => {
				if (!active) return;
				const message = resolveErrorMessage(error);
				setState({ status: "error", message });
			});

		return () => {
			active = false;
		};
	}, [slug]);

	const content = renderContent(state, {
		formatDate: (iso) => {
			const date = new Date(iso);
			return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
		},
	});

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
				<nav
					className={css({
						fontSize: "sm",
					})}
				>
					<Link
						to="/blog"
						className={css({
							color: "blue.600",
							textDecoration: "none",
							transition: "color 0.2s ease",
							_hover: { color: "blue.700", textDecoration: "underline" },
						})}
					>
						&larr; 記事一覧に戻る
					</Link>
				</nav>
				{content}
			</div>
		</div>
	);
}

function renderContent(
	state: ArticleState,
	utils: { formatDate: (isoString: string) => string },
): ReactNode {
	switch (state.status) {
		case "idle":
		case "loading":
			return (
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
		case "error":
			return (
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
					記事を表示できませんでした。
					<br />
					<small>詳細: {state.message}</small>
				</p>
			);
		case "success": {
			const { meta, content } = state.data;
			return (
				<article
					className={css({
						backgroundColor: "white",
						borderRadius: "2xl",
						border: "1px solid",
						borderColor: "gray.200",
						boxShadow: "lg",
						paddingInline: { base: "6", md: "8" },
						paddingBlock: { base: "6", md: "8" },
						display: "flex",
						flexDirection: "column",
						gap: { base: "5", md: "6" },
					})}
				>
					<header
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: { base: "3", md: "4" },
						})}
					>
						<h1
							className={css({
								fontSize: { base: "2xl", md: "3xl" },
								fontWeight: "bold",
								color: "gray.900",
								lineHeight: "tight",
							})}
						>
							{meta.title}
						</h1>
						<div
							className={css({
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								gap: "3",
								color: "gray.600",
								fontSize: "sm",
							})}
						>
							<time dateTime={meta.updatedAt}>
								更新日 {utils.formatDate(meta.updatedAt)}
							</time>
							<span aria-hidden="true">・</span>
							<time dateTime={meta.createdAt}>
								公開日 {utils.formatDate(meta.createdAt)}
							</time>
						</div>
						{meta.tags?.length ? (
							<ul
								className={css({
									display: "flex",
									flexWrap: "wrap",
									gap: "2",
									listStyle: "none",
									margin: 0,
									padding: 0,
								})}
							>
								{meta.tags.map((tag) => (
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
					</header>
					<section
						className={css({
							lineHeight: "tall",
							color: "gray.800",
							display: "flex",
							flexDirection: "column",
							gap: { base: "5", md: "6" },
							"& h1": {
								fontSize: { base: "2xl", md: "3xl" },
								fontWeight: "bold",
								color: "gray.900",
								mt: "6",
							},
							"& h2": {
								fontSize: { base: "xl", md: "2xl" },
								fontWeight: "semibold",
								color: "gray.900",
								mt: "5",
							},
							"& h3": {
								fontSize: { base: "lg", md: "xl" },
								fontWeight: "semibold",
								color: "gray.900",
								mt: "4",
							},
							"& p": {
								fontSize: { base: "md", md: "lg" },
							},
							"& a": {
								color: "blue.600",
								textDecoration: "underline",
								_hover: { color: "blue.700" },
							},
							"& pre": {
								backgroundColor: "#0f172a",
								color: "white",
								padding: { base: "4", md: "5" },
								borderRadius: "lg",
								overflowX: "auto",
							},
							"& code": {
								fontFamily: "var(--font-mono)",
							},
							"& blockquote": {
								borderInlineStart: "4px solid",
								borderColor: "blue.200",
								backgroundColor: "blue.50",
								padding: { base: "3", md: "4" },
								borderRadius: "md",
								color: "gray.700",
							},
							"& table": {
								width: "full",
								borderCollapse: "collapse",
								fontSize: "sm",
							},
							"& th, & td": {
								borderWidth: "1px",
								borderColor: "gray.200",
								padding: "3",
								textAlign: "left",
							},
							"& th": {
								backgroundColor: "gray.100",
								fontWeight: "semibold",
							},
							"& img": {
								maxWidth: "100%",
								height: "auto",
								borderRadius: "lg",
								boxShadow: "md",
								borderWidth: "1px",
								borderColor: "gray.200",
							},
							"& ul": {
								paddingInlineStart: "6",
								listStyle: "disc",
							},
							"& ol": {
								paddingInlineStart: "6",
								listStyle: "decimal",
							},
							"& li": {
								marginBlock: "1",
							},
						})}
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown-itでHTMLタグを抑制した安全なコンテンツを表示するため
						dangerouslySetInnerHTML={{ __html: content }}
					/>
				</article>
			);
		}
	}
}

function resolveErrorMessage(error: unknown): string {
	if (error instanceof NotFoundError) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "未知のエラーが発生しました。";
}

class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}
