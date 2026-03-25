// @bun
// src/index.ts
import { env } from "./env.js";
import { getHandler } from "./handler.js";
import process from "process";
var path = env("SOCKET_PATH", false);
var host = env("HOST", "0.0.0.0");
var port = env("PORT", "3000");
var body_size_limit = parse_as_bytes(env("BODY_SIZE_LIMIT", "512K"));
if (Number.isNaN(body_size_limit)) {
  throw new Error(`Invalid BODY_SIZE_LIMIT: '${env("BODY_SIZE_LIMIT")}'. Please provide a numeric value.`);
}
var idle_timeout = parseInt(env("IDLE_TIMEOUT", "10"), 10);
var { fetch: handlerFetch, websocket } = getHandler();
var options = {
  idleTimeout: idle_timeout,
  maxRequestBodySize: body_size_limit,
  fetch: handlerFetch,
  ...path ? { unix: path } : { hostname: host, port },
  ...websocket ? { websocket } : {}
};
var server = Bun.serve(options);
console.log(`Listening on ${server.url} ${websocket ? "with WebSocket" : ""}`);
async function graceful_shutdown(reason) {
  console.info("Stopping server...");
  process.emit("sveltekit:shutdown", reason);
  await server.stop(true);
  console.info("Stopped server");
  process.removeListener("SIGINT", graceful_shutdown);
  process.removeListener("SIGTERM", graceful_shutdown);
}
process.on("SIGTERM", graceful_shutdown);
process.on("SIGINT", graceful_shutdown);
function parse_as_bytes(value) {
  const units = value.at(-1)?.toUpperCase();
  const multiplier = {
    B: 1,
    K: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024
  }[units ?? "B"] ?? 1;
  return Number(multiplier !== 1 ? value.slice(0, -1) : value) * multiplier;
}
export {
  server,
  port,
  path,
  host
};
