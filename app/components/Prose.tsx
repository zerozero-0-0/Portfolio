import { css } from "styled-system/css";

export function Prose({ children }: { children: React.ReactNode }) {
	const cls = css({
		display: "grid",
		gap: 4,
		lineHeight: 7,
		color: { base: "gray.900", _dark: "gray.100" },
		"& h1": { fontSize: "3xl", fontWeight: "bold", mt: 6 },
		"& h2": { fontSize: "2xl", fontWeight: "bold", mt: 6 },
		"& h3": { fontSize: "xl", fontWeight: "semibold", mt: 5 },
		"& h4": { fontSize: "lg", fontWeight: "semibold", mt: 4 },
		"& p": { mt: 3 },
		"& ul": { pl: 5, listStyle: "disc", mt: 3, display: "grid", gap: 1 },
		"& ol": { pl: 5, listStyle: "decimal", mt: 3, display: "grid", gap: 1 },
		"& a": { color: "blue.600", _hover: { textDecoration: "underline" } },
		"& blockquote": {
			borderLeftWidth: "3px",
			borderColor: { base: "gray.300", _dark: "gray.700" },
			pl: 4,
			color: { base: "gray.700", _dark: "gray.300" },
			fontStyle: "italic",
			mt: 3,
		},
		"& table": {
			width: "full",
			borderCollapse: "collapse",
			my: 4,
			"& th, & td": {
				borderWidth: "1px",
				borderColor: { base: "gray.200", _dark: "gray.700" },
				px: 3,
				py: 2,
			},
			"& th": {
				bg: { base: "gray.50", _dark: "gray.800" },
				fontWeight: "semibold",
			},
		},
		"& pre": {
			bg: { base: "gray.100", _dark: "gray.800" },
			p: 3,
			rounded: "md",
			overflowX: "auto",
		},
		"& code": {
			bg: { base: "gray.100", _dark: "gray.800" },
			px: 1,
			rounded: "sm",
		},
		// highlight.js のルートクラス
		"& .hljs": {
			bg: { base: "inherit", _dark: "inherit" },
		},
	});
	return <div className={cls}>{children}</div>;
}
