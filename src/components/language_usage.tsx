import { useEffect, useMemo, useState } from "react";
import { FaCode } from "react-icons/fa";
import { css } from "../../styled-system/css";
import arrangeLangData from "../lib/arrange_lang_data";
import langToImg from "../lib/lang_to_img";
import type { languageUsage } from "../types/language";

const LANGUAGE_API_URL =
	import.meta.env.VITE_LANGUAGE_USAGE_ENDPOINT ?? "/api/languages";

type LanguageApiResponse = {
	data?: languageUsage[];
	error?: string;
	cached?: boolean;
	fetchedAt?: number;
};

export default function LanguageUsage() {
	const [languages, setLanguages] = useState<languageUsage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [hasFetched, setHasFetched] = useState(false);

	useEffect(() => {
		const controller = new AbortController();

		async function load() {
			setIsLoading(true);
			let aborted = false;
			try {
				const res = await fetch(LANGUAGE_API_URL, {
					signal: controller.signal,
				});

				if (!res.ok) {
					throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
				}

				const payload = (await res.json()) as LanguageApiResponse;

				if (!payload.data) {
					throw new Error(`API Error: ${payload.error}`);
				}

				setLanguages(arrangeLangData(payload.data));
				setHasError(false);
			} catch (error) {
				if ((error as Error).name === "AbortError") {
					aborted = true;
				} else {
					console.error("Error fetching language data:", error);
					setHasError(true);
				}
			}
			if (!aborted) {
				setIsLoading(false);
				setHasFetched(true);
			}
		}

		load();

		return () => controller.abort();
	}, []);

	const arrangedLanguages = useMemo(
		() => [...languages].sort((a, b) => b.percentage - a.percentage),
		[languages],
	);
	const showEmpty =
		hasFetched && !isLoading && !hasError && arrangedLanguages.length === 0;

	return (
		<section
			className={css({
				w: "full",
				maxW: "100%",
				borderRadius: "2xl",
				border: "1px solid",
				borderColor: "gray.200",
				backgroundColor: "white",
				boxShadow: "lg",
				px: { base: "6", md: "8" },
				py: { base: "8", md: "10" },
				display: "flex",
				flexDirection: "column",
				gap: { base: "6", md: "7" },
			})}
		>
			<header
				className={css({
					display: "flex",
					alignItems: "center",
					gap: "4",
				})}
			>
				<span
					className={css({
						boxSize: "12",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "full",
						background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
						color: "white",
					})}
				>
					<FaCode size={22} />
				</span>
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						gap: "1",
					})}
				>
					<h2
						className={css({
							fontSize: { base: "xl", md: "2xl" },
							fontWeight: "semibold",
							color: "gray.900",
						})}
					>
						Language Data
					</h2>
					<p
						className={css({
							fontSize: "sm",
							color: "gray.500",
						})}
					>
						GitHubの活動データから、直近で扱っている言語の割合を自動集計しています。
					</p>
				</div>
			</header>
			{isLoading ? (
				<p
					className={css({
						fontSize: "sm",
						color: "gray.500",
					})}
				>
					データを取得しています...
				</p>
			) : hasError ? (
				<p
					className={css({
						fontSize: "sm",
						color: "red.500",
					})}
				>
					言語データの取得に失敗しました。時間をおいて再度お試しください。
				</p>
			) : showEmpty ? (
				<p
					className={css({
						fontSize: "sm",
						color: "gray.500",
					})}
				>
					表示できるデータがまだありませんが、近日中に更新されます。
				</p>
			) : (
				<ul
					className={css({
						listStyle: "none",
						p: "0",
						m: "0",
						display: "flex",
						flexDirection: "column",
						gap: { base: "5", md: "6" },
					})}
				>
					{arrangedLanguages.map((item) => {
						const Icon = langToImg(item);
						const percentage = Math.min(item.percentage, 100);
						return (
							<li
								key={item.language}
								className={css({
									display: "flex",
									flexDirection: "column",
									gap: "2",
								})}
							>
								<div
									className={css({
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										gap: { base: "4", md: "6" },
									})}
								>
									<span
										className={css({
											display: "inline-flex",
											alignItems: "center",
											gap: "3",
										})}
									>
										<span
											className={css({
												boxSize: "10",
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												borderRadius: "md",
												backgroundColor: "gray.100",
												color: "gray.700",
											})}
										>
											<Icon
												size={20}
												aria-label={item.language}
												title={item.language}
											/>
										</span>
										<span
											className={css({
												fontWeight: "medium",
												color: "gray.800",
											})}
										>
											{item.language}
										</span>
									</span>
									<span
										className={css({
											fontVariantNumeric: "tabular-nums",
											color: "gray.600",
											fontWeight: "medium",
										})}
									>
										{percentage.toFixed(1)}%
									</span>
								</div>
								<div
									className={css({
										height: "0.5rem",
										borderRadius: "full",
										backgroundColor: "gray.200",
										overflow: "hidden",
									})}
								>
									<span
										className={css({
											display: "block",
											height: "100%",
											borderRadius: "inherit",
											background:
												"linear-gradient(90deg, #22d3ee 0%, #6366f1 100%)",
											transition: "width 0.4s ease",
										})}
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
