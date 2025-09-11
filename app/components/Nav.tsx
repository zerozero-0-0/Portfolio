import { NavLink } from "react-router";
import { css, cva, cx } from "styled-system/css";

const navStyle = css({ display: "flex", alignItems: "center", gap: 2 });

const item = cva({
	base: {
		px: 3,
		py: 2,
		rounded: "md",
		fontSize: "sm",
		fontWeight: "medium",
		_hover: { bg: { base: "gray.100", _dark: "gray.800" } },
	},
	variants: {
		active: { true: { bg: { base: "gray.200", _dark: "gray.700" } } },
	},
});

export function Nav() {
	return (
		<nav className={navStyle}>
			<NavLink to="/" className={({ isActive }) => item({ active: isActive })}>
				Home
			</NavLink>
			<NavLink
				to="/blog"
				className={({ isActive }) => item({ active: isActive })}
			>
				Blog
			</NavLink>
			<a
				href="https://github.com/zerozero-0-0"
				className={cx(item())}
				target="_blank"
				rel="noreferrer noopener"
			>
				GitHub
			</a>
		</nav>
	);
}
