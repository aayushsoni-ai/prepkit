import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { readFile, stat } from "fs/promises";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const currentDir = resolve(fileURLToPath(import.meta.url), "..");
const sitesRoot = join(currentDir, "sites");

function getContentType(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (filePath.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const urlPath = decodeURIComponent(req.url?.split("?")[0] || "/");
  let relativePath = urlPath.startsWith("/sites/") ? urlPath.slice("/sites/".length) : urlPath;
  if (relativePath.startsWith("/")) {
    relativePath = relativePath.slice(1);
  }

  let fullPath = join(sitesRoot, relativePath);

  try {
    const fileStat = await stat(fullPath);
    if (fileStat.isDirectory()) {
      fullPath = join(fullPath, "index.html");
    }
  } catch {
    if (!fullPath.includes(".")) {
      fullPath = `${fullPath}.html`;
    }
  }

  try {
    const content = await readFile(fullPath);
    res.writeHead(200, { "Content-Type": getContentType(fullPath) });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
}

export function startFixtureServer(port = 8099): Promise<Server> {
  return new Promise((resolveServer) => {
    const server = createServer(handleRequest);
    server.listen(port, "127.0.0.1", () => {
      resolveServer(server);
    });
  });
}

export function stopFixtureServer(server: Server): Promise<void> {
  return new Promise((resolveStop, rejectStop) => {
    server.close((err) => {
      if (err) rejectStop(err);
      else resolveStop();
    });
  });
}

if (process.argv[1]?.endsWith("serveFixtures.ts")) {
  void startFixtureServer(8099);
}
