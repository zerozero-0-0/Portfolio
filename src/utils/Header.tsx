import type { ReactNode } from "react";
import { css } from "../../styled-system/css";

type IconProps =
	| { type: "react-icon"; icon: ReactNode }
	| { type: "image"; icon: string; alt?: string };

export function Header({ title, icon }: { title: string; icon: IconProps }) {
	return (
		<div
			className={css({
				display: "flex",
				p: 4,
				alignItems: "center",
				_hover: {
					color: "gray.500",
				},
			})}
		>
			<span
				className={css({
					fontSize: "36px",
				})}
			>
				{title}
			</span>
			{icon.type === "react-icon" ? (
				<span
					className={css({
						fontSize: "36px",
						ml: 8,
					})}
				>
					{icon.icon}
				</span>
			) : (
				<span
					className={css({
						display: "inline-block",
						width: "24px",
						height: "24px",
					})}
				>
					<img
						src={icon.icon}
						alt={icon.alt ?? title}
						className={css({
							width: "100%",
							height: "100%",
							objectFit: "contain",
						})}
					/>
				</span>
			)}
		</div>
	);
}
