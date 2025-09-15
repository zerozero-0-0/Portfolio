import { css } from "../../styled-system/css";
import zrzrIcon from "../assets/Zrzr_icon.webp";
import { STUDENT_STATUS } from "../constant";

export default function Card() {
	return (
		<div
			className={css({
				w: "80%",
				h: "auto",
				mx: "auto",
				border: "2px solid gray",
				borderRadius: "lg",
			})}
		>
			<p
				className={css({
					textAlign: "center",
					fontSize: "4xl",
					fontWeight: "bold",
				})}
			>
				Hello, I'm Zrzr
			</p>
			<div
				className={css({
					display: "flex",
					alignItems: "center",
				})}
			>
				<img
					src={zrzrIcon}
					alt="zrzr-icon"
					className={css({
						width: "sm",
						height: "sm",
						borderRadius: "100%",
					})}
				/>
				{STUDENT_STATUS()}
			</div>
		</div>
	);
}
