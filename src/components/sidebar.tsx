import type { ReactNode } from "react";
import { FaHome, FaMapMarkerAlt, FaRegStickyNote } from "react-icons/fa";
import { SiZenn } from "react-icons/si";
import { SlMenu } from "react-icons/sl";
import { NavLink, type NavLinkRenderProps } from "react-router";
import { css } from "../../styled-system/css";

type NavItem = {
	label: string;
	to: string;
	icon: ReactNode;
	end?: boolean;
	external?: boolean;
};

const navItems: NavItem[] = [
	{
		label: "ホーム",
		to: "/",
		icon: <FaHome />,
		end: true,
	},
	{
		label: "アクセス",
		to: "/access",
		icon: <FaMapMarkerAlt />,
	},
	{
		label: "ブログ",
		to: "/blog",
		icon: <FaRegStickyNote />,
	},
	{
		label: "開発録",
		to: "https://zenn.dev/zerozero_00",
		icon: <SiZenn />,
		external: true,
	},
];

export function Sidebar() {
	return (
		<aside
			className={css({
				width: { base: "full", lg: "280px" },
				p: { base: "6", lg: "7" },
				display: "flex",
				flexDirection: "column",
				gap: { base: "6", lg: "8" },
				position: { base: "static", lg: "sticky" },
				top: { lg: "8" },
				maxH: { lg: "calc(100vh - 64px)" },
				overflow: { lg: "auto" },
			})}
		>
			<div
				className={css({
					display: "flex",
					alignItems: "center",
					gap: "3",
				})}
			>
				<span
					className={css({
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						boxSize: "10",
						borderRadius: "xl",
						backgroundColor: "gray.900",
						color: "white",
					})}
				>
					<SlMenu size={18} />
				</span>
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						gap: "1",
					})}
				>
					<strong
						className={css({
							fontSize: { base: "lg", lg: "xl" },
							color: "gray.900",
						})}
					>
						Menu
					</strong>
				</div>
			</div>
			<nav>
				<ul
					className={css({
						listStyle: "none",
						p: "0",
						m: "0",
						display: "flex",
						flexDirection: { base: "row", lg: "column" },
						gap: { base: "4", lg: "2" },
						flexWrap: { base: "wrap", lg: "nowrap" },
					})}
				>
					{navItems.map((item) => (
						<li
							key={item.to}
							className={css({
								width: { base: "calc(50% - 0.5rem)", lg: "full" },
							})}
						>
							{item.external ? (
								<a
									href={item.to}
									target="_blank"
									rel="noopener noreferrer"
									className={css({
										display: "inline-flex",
										alignItems: "center",
										gap: "3",
										width: "full",
										borderRadius: "lg",
										px: { base: "4", lg: "5" },
										py: { base: "3", lg: "3.5" },
										fontWeight: "medium",
										color: "gray.600",
										backgroundColor: "transparent",
										transition: "background-color 0.2s ease, color 0.2s ease",
										_hover: {
											backgroundColor: "gray.100",
											color: "gray.700",
										},
										_focusVisible: {
											outline: "3px solid #6366f1",
											outlineOffset: "3px",
										},
									})}
								>
									<span
										className={css({
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											boxSize: "8",
											borderRadius: "full",
											backgroundColor: "gray.200",
											color: "gray.600",
										})}
									>
										{item.icon}
									</span>
									<span>{item.label}</span>
								</a>
							) : (
								<NavLink
									to={item.to}
									end={item.end}
									className={({ isActive, isPending }: NavLinkRenderProps) =>
										css({
											display: "inline-flex",
											alignItems: "center",
											gap: "3",
											width: "full",
											borderRadius: "lg",
											px: { base: "4", lg: "5" },
											py: { base: "3", lg: "3.5" },
											fontWeight: "medium",
											color: isActive ? "white" : "gray.600",
											backgroundColor: isActive
												? "gray.900"
												: isPending
													? "gray.100"
													: "transparent",
											boxShadow: isActive ? "md" : "none",
											transition: "background-color 0.2s ease, color 0.2s ease",
											_hover: {
												backgroundColor: isActive ? "gray.900" : "gray.100",
												color: isActive ? "white" : "gray.700",
											},
											_focusVisible: {
												outline: "3px solid #6366f1",
												outlineOffset: "3px",
											},
										})
									}
								>
									{({ isActive }: NavLinkRenderProps) => (
										<>
											<span
												className={css({
													display: "inline-flex",
													alignItems: "center",
													justifyContent: "center",
													boxSize: "8",
													borderRadius: "full",
													backgroundColor: isActive ? "gray.700" : "gray.200",
													color: isActive ? "white" : "gray.600",
												})}
											>
												{item.icon}
											</span>
											<span>{item.label}</span>
										</>
									)}
								</NavLink>
							)}
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
