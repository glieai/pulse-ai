import * as esbuild from "esbuild";
await esbuild.build({
	entryPoints: ["src/server.ts"],
	bundle: true,
	platform: "node",
	target: "node18",
	format: "esm",
	outfile: "dist/server.mjs",
	// shebang comes from src/server.ts
	external: [],
	minify: true,
});
console.log("Built dist/server.mjs");
