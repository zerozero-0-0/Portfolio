import type { IconType } from "react-icons";
import {
	SiC,
	SiCplusplus,
	SiCss3,
	SiDocker,
	SiHtml5,
	SiJavascript,
	SiMake,
	SiMarkdown,
	SiPython,
	SiRust,
	SiTypescript,
} from "react-icons/si";
import { TbFileUnknown } from "react-icons/tb";
import type { languageUsage } from "../types/language";

export const languageToIconMap: Record<string, IconType> = {
	JavaScript: SiJavascript,
	TypeScript: SiTypescript,
	Python: SiPython,
	Rust: SiRust,
	"C++": SiCplusplus,
	C: SiC,
	CSS: SiCss3,
	HTML: SiHtml5,
	Dockerfile: SiDocker,
	Markdown: SiMarkdown,
	Makefile: SiMake,
};

export default function langToImg(data: languageUsage): IconType {
	return languageToIconMap[data.language] || TbFileUnknown;
}
