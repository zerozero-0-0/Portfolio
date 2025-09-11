import { Link } from "react-router";
import { cva } from "styled-system/css";

const badge = cva({
	base: {
		px: 2,
		py: 1,
		rounded: "full",
		borderWidth: "1px",
		borderColor: { base: "gray.300", _dark: "gray.700" },
		fontSize: "xs",
		color: { base: "gray.700", _dark: "gray.300" },
		_hover: { bg: { base: "gray.100", _dark: "gray.800" } },
		transition: "colors",
	},
});

export function TagBadge({ tag }: { tag: string }) {
	return (
		<Link to={`/blog/tags/${encodeURIComponent(tag)}`} className={badge()}>
			#{tag}
		</Link>
	);
}
