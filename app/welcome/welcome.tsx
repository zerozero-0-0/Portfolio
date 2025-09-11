import { css } from "styled-system/css";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
	return (
		<main
			className={css({
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				pt: 16,
				pb: 4,
			})}
		>
			<div
				className={css({
					flex: 1,
					display: "flex",
					flexDir: "column",
					alignItems: "center",
					gap: 16,
					minH: 0,
				})}
			>
				<header
					className={css({
						display: "flex",
						flexDir: "column",
						alignItems: "center",
						gap: 9,
					})}
				>
					<div className={css({ w: "500px", maxW: "100vw", p: 4 })}>
						<img
							src={logoLight}
							alt="React Router"
							className={css({
								display: "block",
								w: "full",
								_dark: { display: "none" },
							})}
						/>
						<img
							src={logoDark}
							alt="React Router"
							className={css({
								display: "none",
								w: "full",
								_dark: { display: "block" },
							})}
						/>
					</div>
				</header>
				<div
					className={css({
						maxW: "300px",
						w: "full",
						display: "grid",
						gap: 6,
						px: 4,
					})}
				>
					<nav
						className={css({
							rounded: "3xl",
							borderWidth: "1px",
							borderColor: { base: "gray.200", _dark: "gray.700" },
							p: 6,
							display: "grid",
							gap: 4,
						})}
					>
						<p
							className={css({
								lineHeight: 6,
								color: { base: "gray.700", _dark: "gray.200" },
								textAlign: "center",
							})}
						>
							What&apos;s next?
						</p>
					</nav>
				</div>
			</div>
		</main>
	);
}
