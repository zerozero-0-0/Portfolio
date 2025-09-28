import type { ReactNode } from "react";
import { Outlet } from "react-router";
import { css } from "../../styled-system/css";
import { Sidebar } from "../components/sidebar";

type AppLayoutProps = {
	children?: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: { base: "column", lg: "row" },
				minHeight: "100vh",
				backgroundColor: "gray.100",
			})}
		>
			<div
				className={css({
					flexShrink: 0,
					px: { base: "0", lg: "4" },
					py: { base: "0", lg: "6" },
					display: "flex",
					justifyContent: { base: "center", lg: "flex-start" },
					backgroundColor: "gray.100",
					borderRight: { base: "none", lg: "1px solid" },
					borderColor: { base: "transparent", lg: "gray.300" },
				})}
			>
				<div
					className={css({
						backgroundColor: "white",
						boxShadow: { base: "md", lg: "xl" },
						borderRadius: { base: "lg", lg: "xl" },
						borderWidth: "1px",
						borderColor: "gray.300",
						overflow: "hidden",
					})}
				>
					<Sidebar />
				</div>
			</div>
			<main
				className={css({
					flex: 1,
					width: "full",
					minHeight: "100vh",
					backgroundColor: "transparent",
				})}
			>
				{children ?? <Outlet />}
			</main>
		</div>
	);
}
