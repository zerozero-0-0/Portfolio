import { css, cx } from "styled-system/css";

export function Container({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cx(
				css({ maxW: "1280px", mx: "auto", px: { base: 4, md: 6 } }),
				className,
			)}
		>
			{children}
		</div>
	);
}
