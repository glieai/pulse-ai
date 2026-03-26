import { chmodSync, writeFileSync } from "node:fs";
import * as esbuild from "esbuild";

// Build the main server bundle
await esbuild.build({
	entryPoints: ["src/server.ts"],
	bundle: true,
	platform: "node",
	target: "node18",
	format: "esm",
	outfile: "dist/server.mjs",
	external: [],
	minify: true,
});

// Create a CJS bin wrapper with shebang (Node.js doesn't support shebangs in ESM)
writeFileSync("dist/bin.js", '#!/usr/bin/env node\nimport("./server.mjs");\n');
chmodSync("dist/bin.js", "755");

console.log("Built dist/server.mjs + dist/bin.js");
