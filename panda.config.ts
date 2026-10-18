import { defineConfig } from "@pandacss/dev";

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	// v2 からはプリセットが自動で追加されないため明示する
	// preset-base: ユーティリティと条件 (_hover など)、preset-panda: 色・余白などのトークン
	presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],

	// Where to look for your css declarations
	include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: {
		extend: {},
	},

	// The output directory for your css system
	outdir: "styled-system",

	// コードから参照していないトークン (CSS 変数) を出力しない
	// v2 で preset-panda の色パレットが増え、未使用の変数で CSS が膨らむため
	optimize: {
		removeUnusedTokens: true,
	},
});
