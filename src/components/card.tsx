import { css } from "../../styled-system/css";
import zrzrIcon from "../assets/Zrzr_icon.webp";
import { STUDENT_STATUS } from "../constant";

export default function Card() {
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
				overflow: "hidden",
				px: { base: "6", md: "8" },
				py: { base: "8", md: "10" },
				display: "flex",
				flexDirection: "column",
				gap: { base: "6", md: "8" },
			})}
		>
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					gap: { base: "3", md: "4" },
				})}
			>
				<p
					className={css({
						fontSize: { base: "3xl", md: "4xl" },
						fontWeight: "bold",
						lineHeight: "shorter",
						color: "gray.900",
					})}
				>
					Hello, I'm Zrzr
				</p>
			</div>
			<div
				className={css({
					display: "flex",
					flexDirection: { base: "column", sm: "row" },
					alignItems: { sm: "center" },
					gap: { base: "5", sm: "6" },
				})}
			>
				<img
					src={zrzrIcon}
					alt="zrzr-icon"
					className={css({
						width: { base: "8rem", md: "9rem" },
						height: { base: "8rem", md: "9rem" },
						borderRadius: "full",
						objectFit: "cover",
						boxShadow: "md",
					})}
				/>
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						gap: "3",
					})}
				>
					<span
						className={css({
							fontSize: "sm",
							fontWeight: "semibold",
							textTransform: "uppercase",
							color: "gray.500",
							letterSpacing: "widest",
						})}
					>
						Profile
					</span>
					{STUDENT_STATUS()}
				</div>
			</div>
		</section>
	);
}
