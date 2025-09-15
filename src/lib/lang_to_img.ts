import type { IconType } from "react-icons";
import { FaHtml5 } from "react-icons/fa";
import {
	SiC,
	SiCplusplus,
	SiCss3,
	SiJavascript,
	SiPython,
	SiRust,
	SiTypescript,
} from "react-icons/si";
import { TbFileUnknown } from "react-icons/tb";
import type { languageData } from "../types/language";

export default function langToImg(data: languageData): IconType {
	switch (data.language) {
		case "JavaScript":
			return SiJavascript;
		case "TypeScript":
			return SiTypescript;
		case "Python":
			return SiPython;
		case "Rust":
			return SiRust;
		case "Cpp":
			return SiCplusplus;
		case "C":
			return SiC;
		case "CSS":
			return SiCss3;
		case "HTML":
			return FaHtml5;
		default:
			return TbFileUnknown;
	}
}
