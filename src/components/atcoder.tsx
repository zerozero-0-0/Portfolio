import { css, cva } from "../../styled-system/css";
import atcoder_icon from "../assets/atcoder_icon.png";

type Tone =
	| "gray"
	| "brown"
	| "green"
	| "cyan"
	| "blue"
	| "yellow"
	| "orange"
	| "red";

const rateToColor = (rate: number): Tone => {
	if (rate < 400) return "gray";
	if (rate < 800) return "brown";
	if (rate < 1200) return "green";
	if (rate < 1600) return "cyan";
	if (rate < 2000) return "blue";
	if (rate < 2400) return "yellow";
	if (rate < 2800) return "orange";
	return "red";
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
			brown: { bg: "orange.500" },
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
	// 将来的にはAPIから取得する
	const algo_rate = 600;
	const heuristic_rate = 500;

	return (
		<div
			className={css({
				w: "80%",
				h: "auto",
				mx: "auto",
			})}
		>
			<img
				src={atcoder_icon}
				alt="atcoder_icon"
				className={css({
					width: "9rem",
					height: "9rem",
				})}
			/>
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
				})}
			>
				<span>
					Algo :{" "}
					<span className={rateText({ tone: rateToColor(algo_rate) })}>
						{algo_rate}
					</span>
				</span>

				<span>
					Heuristic :{" "}
					<span className={rateText({ tone: rateToColor(heuristic_rate) })}>
						{heuristic_rate}
					</span>
				</span>
			</div>
		</div>
	);
}
