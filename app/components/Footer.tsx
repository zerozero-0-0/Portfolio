import { css } from "styled-system/css";

export function Footer() {
	return (
		<footer
			className={css({
				mt: 16,
				borderTopWidth: "1px",
				borderColor: { base: "gray.200", _dark: "gray.800" },
				py: 8,
			})}
		>
			<div
				className={css({
					maxW: "1280px",
					mx: "auto",
					px: { base: 4, md: 6 },
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					color: { base: "gray.600", _dark: "gray.400" },
					fontSize: "sm",
				})}
			>
				<span>© {new Date().getFullYear()} My Blog</span>
				<a
					href="https://github.com/zerozero-0-0"
					target="_blank"
					rel="noreferrer noopener"
					className={css({ _hover: { textDecoration: "underline" } })}
				>
					GitHub
				</a>
			</div>
		</footer>
	);
}
