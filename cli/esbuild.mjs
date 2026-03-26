import * as esbuild from "esbuild";
await esbuild.build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node18",
	format: "cjs",
	outfile: "dist/cli.cjs",
	banner: { js: "#!/usr/bin/env node" },
	external: [],
	minify: true,
});
console.log("Built dist/cli.mjs");
