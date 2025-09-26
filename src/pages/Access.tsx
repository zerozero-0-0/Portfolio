import type { IconType } from "react-icons";
import {
	FaExternalLinkAlt,
	FaGithub,
	FaKaggle,
	FaMapMarkerAlt,
	FaTwitter,
} from "react-icons/fa";
import { css } from "../../styled-system/css";
import { Header } from "../utils/Header";

type LinkType = {
	name: string;
	url: string;
	icon: IconType;
	color?: string;
};

const Links: LinkType[] = [
	{
		name: "GitHub",
		url: "https://github.com/zerozero-0-0",
		icon: FaGithub,
	},
	{
		name: "Twitter",
		url: "https://x.com/AaWlEw3pl899167",
		icon: FaTwitter,
		color: "#1DA1F2",
	},
	{
		name: "Kaggle",
		url: "https://www.kaggle.com/zrzr00",
		icon: FaKaggle,
		color: "#20BEFF",
	},
];

function LinkCard({ name, url, icon: Icon, color }: LinkType) {
	return (
		<li
			className={css({
				listStyle: "none",
				width: "100%",
			})}
		>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className={css({
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: { base: "4", md: "6" },
					textDecoration: "none",
					color: "gray.800",
					paddingInline: { base: "5", md: "6" },
					paddingBlock: { base: "5", md: "6" },
					borderRadius: "2xl",
					border: "1px solid",
					borderColor: "gray.200",
					backgroundColor: "white",
					boxShadow: "md",
					transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
				<span
					className={css({
						display: "inline-flex",
						alignItems: "center",
						gap: { base: "4", md: "5" },
					})}
				>
					<span
						className={css({
							boxSize: { base: "12", md: "14" },
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: "xl",
							backgroundColor: "gray.100",
						})}
					>
						<Icon size={22} color={color} />
					</span>
					<span
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: "1",
						})}
					>
						<strong
							className={css({
								fontSize: { base: "lg", md: "xl" },
								fontWeight: "semibold",
								color: "gray.900",
							})}
						>
							{name}
						</strong>
					</span>
				</span>
				<FaExternalLinkAlt
					size={16}
					className={css({
						color: "gray.400",
						flexShrink: 0,
					})}
				/>
			</a>
		</li>
	);
}

export default function Access() {
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
					gap: { base: "8", md: "10" },
				})}
			>
				<Header
					title="アクセス"
					icon={{ type: "react-icon", icon: <FaMapMarkerAlt /> }}
				/>
				<ul
					className={css({
						listStyle: "none",
						padding: "0",
						margin: "0",
						display: "flex",
						flexDirection: "column",
						gap: { base: "5", md: "6" },
					})}
				>
					{Links.map((link) => (
						<LinkCard key={link.name} {...link} />
					))}
				</ul>
			</div>
		</div>
	);
}
