import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const apiPort = env.API_PORT || process.env.API_PORT || "3000";

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: {
			proxy: {
				"/api": {
					target: `http://localhost:${apiPort}`,
					changeOrigin: true,
				},
			},
		},
	};
});
