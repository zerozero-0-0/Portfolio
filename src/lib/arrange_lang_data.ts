import type { languageUsage } from "../types/language";
import { languageToIconMap } from "./lang_to_img";

export default function arrangeLangData(
	data: languageUsage[],
): languageUsage[] {
	const filteredData: languageUsage[] = [];
	let others_sum = 0.0;

	for (const item of data) {
		if (!(item.language in languageToIconMap)) {
			others_sum += item.percentage;
		} else {
			filteredData.push(item);
		}
	}
	if (others_sum > 0) {
		filteredData.push({ language: "Other", percentage: others_sum });
	}

	return filteredData;
}
