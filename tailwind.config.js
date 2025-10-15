/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js}", "./src/**/*.{vue,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#fef7f0",
					100: "#fdeee0",
					200: "#fad9bf",
					300: "#f6c194",
					400: "#f1a066",
					500: "#ed8442",
					600: "#df6d2a",
					700: "#ba5623",
					800: "#944626",
					900: "#773b22",
					950: "#401d10",
				},
				secondary: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b",
					600: "#475569",
					700: "#334155",
					800: "#1e293b",
					900: "#0f172a",
					950: "#020617",
				},
				"hfj-red": {
					DEFAULT: "#d6001c",
					tint1: "#de3d52",
					tint2: "#e57a88",
					tint3: "#edb7be",
				},
				"hfj-green": {
					DEFAULT: "#5CAA7F",
				},
				"hfj-yellow": {
					DEFAULT: "#F79429",
					tint1: "#F3C05D",
					tint2: "#F0D193",
					tint3: "#FFF5E0",
				},
				"hfj-black": {
					DEFAULT: "#1c2122",
					tint1: "#646768",
					tint2: "#acaeae",
					tint3: "#FAFAFA",
				},
			},
			fontFamily: {
				sans: "var(--font-apercu)",
				display: "var(--font-canela)",
				fk: "var(--font-fk)",
			},
		},
	},
	plugins: [],
};
