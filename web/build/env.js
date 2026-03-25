// @bun
// src/env.ts
var expected = new Set([
  "SOCKET_PATH",
  "HOST",
  "PORT",
  "ORIGIN",
  "XFF_DEPTH",
  "ADDRESS_HEADER",
  "PROTOCOL_HEADER",
  "HOST_HEADER",
  "PORT_HEADER",
  "BODY_SIZE_LIMIT",
  "IDLE_TIMEOUT"
]);
if ("") {
  for (const name in Bun.env) {
    if (name.startsWith("")) {
      const unprefixed = name.slice("".length);
      if (!expected.has(unprefixed)) {
        throw new Error(`You should change envPrefix (${""}) to avoid conflicts with existing environment variables \u2014 unexpectedly saw ${name}`);
      }
    }
  }
}
function env(name, fallback) {
  const prefixed = "" + name;
  return prefixed in Bun.env ? Bun.env[prefixed] : fallback;
}
export {
  env
};
