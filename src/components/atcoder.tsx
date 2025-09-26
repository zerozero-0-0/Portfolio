import { useEffect, useState } from "react";
import { css, cva } from "../../styled-system/css";
import atcoder_icon from "../assets/atcoder_icon.png";

const RATE_API_URL =
	import.meta.env.VITE_ATCODER_RATE_ENDPOINT ?? "/api/atcoder";

type Tone =
	| "gray"
	| "brown"
	| "green"
	| "cyan"
	| "blue"
	| "yellow"
	| "orange"
	| "red";

const RATING_COLORS: readonly [number, Tone][] = [
	[400, "gray"],
	[800, "brown"],
	[1200, "green"],
	[1600, "cyan"],
	[2000, "blue"],
	[2400, "yellow"],
	[2800, "orange"],
];

const rateToColor = (rate: number): Tone => {
	const color = RATING_COLORS.find(([threshold]) => rate < threshold)?.[1];
	return color ?? "red";
};
const rateText = cva({
	base: {
		color: "white",
		display: "inline-flex",
		alignItems: "center",
		px: "2",
		py: "0.5",
		borderRadius: "md",
		lineHeight: "1",
		fontWeight: "medium",
	},
	variants: {
		tone: {
			gray: { bg: "gray.500" },
			brown: { bg: "orange.900" },
			green: { bg: "green.500" },
			cyan: { bg: "cyan.500" },
			blue: { bg: "blue.500" },
			yellow: { bg: "yellow.500" },
			orange: { bg: "orange.500" },
			red: { bg: "red.500" },
		},
	},
});

export default function AtCoder() {
	const [algoRate, setAlgoRate] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		void (async () => {
			try {
				const res = await fetch(RATE_API_URL, { signal: controller.signal });
				const payload = (await res.json()) as { latestRating: number };
				setAlgoRate(payload.latestRating);
				setHasError(false);
			} catch (err) {
				if ((err as Error).name !== "AbortError") {
					console.error("AtCoderレートの取得に失敗しました", err);
					setHasError(true);
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		})();

		return () => controller.abort();
	}, []);

	const tone = algoRate === null ? "gray" : rateToColor(algoRate);

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
				gap: { base: "6", md: "8" },
			})}
		>
			<header
				className={css({
					display: "flex",
					alignItems: "center",
					gap: { base: "4", md: "5" },
				})}
			>
				<span
					className={css({
						boxSize: "12",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "xl",
						backgroundColor: "gray.900",
					})}
				>
					<img
						src={atcoder_icon}
						alt="AtCoderのロゴ"
						className={css({
							width: "70%",
							height: "70%",
							objectFit: "contain",
						})}
					/>
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
						AtCoder Rating
					</h2>
				</div>
			</header>
			{isLoading ? (
				<p
					className={css({
						fontSize: "sm",
						color: "gray.500",
					})}
				>
					現在レートを取得しています...
				</p>
			) : hasError ? (
				<p
					className={css({
						fontSize: "sm",
						color: "red.500",
					})}
				>
					レートを取得できませんでした。時間をおいて再度お試しください。
				</p>
			) : (
				<div
					className={css({
						display: "flex",
						flexDirection: { base: "column", sm: "row" },
						alignItems: { sm: "center" },
						justifyContent: "space-between",
						gap: { base: "5", sm: "6" },
					})}
				>
					<span
						className={css({
							fontSize: { base: "3xl", md: "4xl" },
							fontWeight: "bold",
							color: "gray.900",
						})}
					>
						<span className={rateText({ tone })}>{algoRate ?? "-"}</span>
					</span>
					<div
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: "2",
							color: "gray.600",
							fontSize: "sm",
						})}
					></div>
				</div>
			)}
		</section>
	);
}
