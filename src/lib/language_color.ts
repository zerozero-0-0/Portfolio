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
};

const FALLBACK_COLORS = [
	"#6366F1",
	"#22D3EE",
	"#38BDF8",
	"#A855F7",
	"#F97316",
	"#FACC15",
	"#2DD4BF",
	"#F87171",
	"#4ADE80",
	"#F472B6",
];

export default function getLanguageColor(language: string, fallbackIndex = 0) {
	if (!language) {
		return FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
	}
	const match = LANGUAGE_COLOR_MAP[language];
	if (match) {
		return match;
	}
	const hash = language
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const index = (hash + fallbackIndex) % FALLBACK_COLORS.length;
	return FALLBACK_COLORS[index];
}
