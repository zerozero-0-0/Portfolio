import { useEffect, useState } from "react";
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

	useEffect(() => {
		const controller = new AbortController();

		async function load() {
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
			} catch (error) {
				if ((error as Error).name !== "AbortError") {
					console.error("Error fetching language data:", error);
				}
			}
		}

		load();

		return () => controller.abort();
	}, []);

	return (
		<div
			className={css({
				w: "80%",
				h: "auto",
				mx: "auto",
				mt: "12",
			})}
		>
			<FaCode size={40} />
			<ul
				className={css({
					listStyle: "none",
					p: "0",
					m: "0",
				})}
			>
				{languages.map((item) => {
					const Icon = langToImg(item);
					return (
						<li
							key={item.language}
							className={css({
								display: "flex",
								alignItems: "center",
								gap: "3",
								py: "2",
							})}
						>
							<span
								className={css({
									boxSize: "8",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									lineHeight: "0",
									flexShrink: "0",
								})}
							>
								<Icon
									size={24}
									aria-label={item.language}
									title={item.language}
								/>
							</span>
							<span>{item.percentage}%</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
