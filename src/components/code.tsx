import { FaCode } from "react-icons/fa";
import { css } from "../../styled-system/css";
import langToImg from "../lib/lang_to_img";
import type { languageData } from "../types/language";

// 将来的にapiから取得するようにする
const data: languageData[] = [
	{ language: "JavaScript", per: 20 },
	{ language: "TypeScript", per: 27 },
	{ language: "Python", per: 32 },
	{ language: "Cpp", per: 15 },
	{ language: "Other", per: 6 },
];

export default function Code() {
	return (
		<div
			className={css({
				w: "80%",
				h: "auto",
				mx: "auto",
				mt: "12",
			})}
		>
			<FaCode size={40} />
			<ul
				className={css({
					listStyle: "none",
					p: "0",
					m: "0",
				})}
			>
				{data.map((item) => {
					const Icon = langToImg(item);
					return (
						<li
							key={item.language}
							className={css({
								display: "flex",
								alignItems: "center",
								gap: "3",
								py: "2",
							})}
						>
							<span
								className={css({
									boxSize: "8",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									lineHeight: "0",
									flexShrink: "0",
								})}
							>
								<Icon
									size={24}
									aria-label={item.language}
									title={item.language}
								/>
							</span>
							<span>{item.per}%</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
