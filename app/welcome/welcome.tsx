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
				pt: 20,
				pb: 8,
				bg: {
					base: "linear-gradient(180deg, #f8fafc 0%, rgba(248,250,252,0) 60%)",
					_dark:
						"linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0) 60%)",
				},
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
						display: "flex",
						gap: 3,
						flexWrap: "wrap",
						justifyContent: "center",
					})}
				>
					<a
						href="/blog"
						className={css({
							px: 5,
							py: 3,
							rounded: "md",
							bg: { base: "blue.600" },
							color: "white",
							_hover: { bg: { base: "blue.700" } },
							transition: "colors",
						})}
					>
						ブログを見る
					</a>
					<a
						href="/blog/tags"
						className={css({
							px: 5,
							py: 3,
							rounded: "md",
							borderWidth: "1px",
							borderColor: { base: "gray.300", _dark: "gray.700" },
							_hover: { bg: { base: "gray.100", _dark: "gray.800" } },
						})}
					>
						タグ一覧
					</a>
				</div>
			</div>
		</main>
	);
}
