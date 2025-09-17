import type { languageUsage } from "../types/language";
import { languageToIconMap } from "./lang_to_img";

export default function arrangeLangData(
	data: languageUsage[],
): languageUsage[] {
	const { knownLanguages, othersPercentage } = data.reduce(
		(acc, item) => {
			if (item.language in languageToIconMap) {
				acc.knownLanguages.push(item);
			} else {
				acc.othersPercentage += item.percentage;
			}
			return acc;
		},
		{ knownLanguages: [] as languageUsage[], othersPercentage: 0.0 },
	);

	if (othersPercentage > 0) {
		knownLanguages.push({
			language: "Others",
			percentage: othersPercentage,
		});
	}

	return knownLanguages;
}
