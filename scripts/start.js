import { spawn } from "child_process";

const apiPort = process.env.API_PORT || "4000";
const webPort = process.env.PORT || "3000";

const api = spawn("node", ["apps/api/dist/src/server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: apiPort
  }
});

const web = spawn("npx", ["next", "start", "apps/web", "-p", webPort], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: webPort,
    INTERNAL_API_URL: `http://127.0.0.1:${apiPort}`
  }
});

function shutdown(code = 0) {
  try {
    api.kill("SIGTERM");
  } catch {}
  try {
    web.kill("SIGTERM");
  } catch {}
  process.exit(code);
}

api.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    shutdown(code);
  }
});

web.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    shutdown(code);
  }
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
