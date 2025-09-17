import type { languageUsage } from "../types/language";
import { languageToIconMap } from "./lang_to_img";

export default function arrangeLangData(data: languageUsage[]): languageUsage[] {
    let others_sum = 0.0;

    for (const item of data) {
        if (!(item.language in languageToIconMap)) {
            others_sum += item.percentage;

        }
    }

    data.filter((item) => languageToIconMap[item.language]);

    if (others_sum > 0) {
        data.push({ language: "Other", percentage: others_sum });
    } 
    return data;
}
