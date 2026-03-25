import * as esbuild from "esbuild";

const isProduction = process.argv.includes("--production");
const isWatch = process.argv.includes("--watch");

/** @type {esbuild.BuildOptions} */
const buildOptions = {
	entryPoints: ["src/extension.ts"],
	bundle: true,
	outfile: "dist/extension.js",
	format: "cjs",
	platform: "node",
	target: "node20",
	external: ["vscode"],
	sourcemap: !isProduction,
	minify: isProduction,
	alias: {
		"@pulse/shared": "../shared/src/index.ts",
		"@pulse/cli": "../cli/src",
	},
};

if (isWatch) {
	const ctx = await esbuild.context(buildOptions);
	await ctx.watch();
	console.log("[pulse] watching for changes...");
} else {
	await esbuild.build(buildOptions);
	console.log(`[pulse] built dist/extension.js (${isProduction ? "production" : "dev"})`);
}
