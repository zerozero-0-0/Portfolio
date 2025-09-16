import type { languageUsage } from "../types/language";

export default function calcPercentage(
    totals: Map<string, number>,
): languageUsage[] {
    const totalBytes = Array.from(totals.values()).reduce(
        (acc, value) => acc + value,
        0,
    );

    const sorted = Array.from(totals.entries())
        .map(([language, bytes]) => {
            const rawPercentage = totalBytes === 0 ? 0 : (bytes / totalBytes) * 100;
            const rounded = Math.round(rawPercentage * 10) / 10; // 小数第2位で四捨五入し、第1位まで表示
            return { language, percentage: rounded };
        })
        .sort((a, b) => b.percentage - a.percentage);

    // 厳密に100%にするための調整は今のところしない

    return sorted;
}
