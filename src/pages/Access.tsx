import type { IconType } from "react-icons";
import { FaGithub, FaKaggle, FaMapMarkerAlt, FaTwitter } from "react-icons/fa";
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
				display: "flex",
				justifyContent: "center",
			})}
		>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className={css({
					display: "inline-flex",
					alignItems: "center",
					gap: "3",
					color: "inherit",
					textDecoration: "none",
					p: 2,
					width: "75%",
					border: "1px solid #797a7aff",
					borderRadius: "xl",
				})}
			>
				<Icon color={color} />
				<span>{name}</span>
			</a>
		</li>
	);
}

export default function Access() {
	return (
		<div>
			<Header
				title="アクセス"
				icon={{ type: "react-icon", icon: <FaMapMarkerAlt /> }}
			/>
			<ul
				className={css({
					display: "flex",
					flexDirection: "column",
					gap: "4",
					alignItems: "center",
					paddingInlineStart: "0",
				})}
			>
				{Links.map((link) => (
					<LinkCard key={link.name} {...link} />
				))}
			</ul>
		</div>
	);
}
