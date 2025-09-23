const LANGUAGE_COLOR_MAP: Record<string, string> = {
	JavaScript: "#FACC15",
	TypeScript: "#3B82F6",
	Python: "#6B4CE6",
	Rust: "#D97706",
	"C++": "#2563EB",
	C: "#0EA5E9",
	CSS: "#38BDF8",
	HTML: "#F97316",
	Dockerfile: "#0EA5E9",
	Markdown: "#7C3AED",
	Makefile: "#4B5563",
	others: "#000",
};

export default function getLanguageColor(language: string): string {
	const match = LANGUAGE_COLOR_MAP[language];
	if (match) {
		return match;
	}

	return LANGUAGE_COLOR_MAP.others;
}
