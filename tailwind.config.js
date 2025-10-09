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
			},
		},
	},
	plugins: [],
};
