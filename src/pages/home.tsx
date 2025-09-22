import { css } from "../../styled-system/css";
import AtCoder from "../components/atcoder";
import Card from "../components/card";
import LanguageUsage from "../components/language_usage";

export default function Home() {
	return (
		<div
			className={css({
				minHeight: "100%",
				background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 45%, #f1f5f9 100%)",
			})}
		>
			<div
				className={css({
					maxW: "1200px",
					mx: "auto",
					px: { base: "6", md: "12" },
					py: { base: "12", md: "16" },
					display: "flex",
					flexDirection: "column",
					gap: { base: "10", md: "12" },
				})}
			>
				<section
					className={css({
						display: "grid",
						gap: { base: "6", lg: "8" },
						gridTemplateColumns: {
							base: "1fr",
							lg: "minmax(0, 1.2fr) minmax(0, 1fr)",
						},
						alignItems: "start",
					})}
				>
					<div
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: { base: "6", md: "8" },
						})}
					>
						<Card />
						<AtCoder />
					</div>
					<LanguageUsage />
				</section>
			</div>
		</div>
	);
}
