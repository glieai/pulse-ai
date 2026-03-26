export type Theme = "light" | "dark" | "system";

let current = $state<Theme>("system");

export function getTheme(): Theme {
	return current;
}

export function setTheme(theme: Theme) {
	current = theme;
	if (typeof localStorage !== "undefined") {
		if (theme === "system") {
			localStorage.removeItem("pulse-theme");
		} else {
			localStorage.setItem("pulse-theme", theme);
		}
	}
	if (typeof document !== "undefined") {
		if (theme === "system") {
			document.documentElement.removeAttribute("data-theme");
		} else {
			document.documentElement.setAttribute("data-theme", theme);
		}
	}
}

export function initTheme() {
	if (typeof localStorage === "undefined") return;
	const saved = localStorage.getItem("pulse-theme");
	if (saved === "light" || saved === "dark") {
		setTheme(saved);
	}
}
