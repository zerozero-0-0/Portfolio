import type { languageData } from "../types/language";
import type { IconType } from "react-icons";
import { SiJavascript } from "react-icons/si";
import { SiTypescript } from "react-icons/si";
import { SiPython } from "react-icons/si";
import { SiRust } from "react-icons/si"; 
import { SiCplusplus } from "react-icons/si";
import { SiC } from "react-icons/si";
import { SiCss3 } from "react-icons/si"; import { FaHtml5 } from "react-icons/fa";
import { TbFileUnknown } from "react-icons/tb";

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
