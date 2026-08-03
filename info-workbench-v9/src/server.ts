#!/usr/bin/env node
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { WebSocketServer, WebSocket } from "ws";
import { WorkbenchDatabase, RevisionConflictError } from "./db.js";
import { publicDir } from "./paths.js";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.INFO_WORKBENCH_PORT ?? "17321", 10);
const db = new WorkbenchDatabase();
const sockets = new Set<WebSocket>();
const wss = new WebSocketServer({ noServer: true, maxPayload: 1_000_000 });
let observedRevision = db.getRevision();

function headers(contentType: string): Record<string, string> {
  return {
    "Content-Type": contentType,
    "Cache-Control": contentType.startsWith("text/html") ? "no-store" : "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws://127.0.0.1:* ws://localhost:*; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
  };
}

function json(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, headers("application/json; charset=utf-8"));
  res.end(JSON.stringify(value));
}

function validHost(req: IncomingMessage): boolean {
  const value = req.headers.host?.toLowerCase() ?? "";
  return value === `${host}:${port}` || value === `localhost:${port}`;
}

function validOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  return !origin || origin === `http://${host}:${port}` || origin === `http://localhost:${port}`;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > 25_000_000) throw new Error("Request body exceeds 25 MB");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isWorkspacePayload(value: unknown): value is { base_revision: number; data: unknown; settings: unknown; source?: string } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.base_revision) && Number(candidate.base_revision) >= 0 && !!candidate.data && typeof candidate.data === "object";
}

async function serveStatic(urlPath: string, res: ServerResponse): Promise<void> {
  const requested = urlPath === "/" ? "index.html" : decodeURIComponent(urlPath.slice(1));
  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const file = path.resolve(publicDir, normalized);
  if (!file.startsWith(path.resolve(publicDir) + path.sep) && file !== path.join(publicDir, "index.html")) {
    return json(res, 403, { error: "Invalid path" });
  }
  try {
    if (!(await stat(file)).isFile()) return json(res, 404, { error: "Not found" });
    const extension = path.extname(file).toLowerCase();
    const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
    res.writeHead(200, headers(types[extension] ?? "application/octet-stream"));
    res.end(await readFile(file));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return json(res, 404, { error: "Not found" });
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (!validHost(req) || !validOrigin(req)) return json(res, 403, { error: "Local workbench origin required" });
    const url = new URL(req.url ?? "/", `http://${host}:${port}`);
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { ok: true, service: "info-workbench-local", version: 9, storage: "sqlite", revision: db.getRevision(), scanner_execution: false, websocket: true });
    }
    if (req.method === "GET" && url.pathname === "/api/workspace") return json(res, 200, db.getWorkspace());
    if (req.method === "PUT" && url.pathname === "/api/workspace") {
      const body = await readBody(req);
      if (!isWorkspacePayload(body)) return json(res, 400, { error: "Invalid workspace payload" });
      try {
        const state = db.saveWorkspace(body.data, body.settings, body.base_revision, typeof body.source === "string" ? body.source.slice(0, 80) : "browser");
        return json(res, 200, state);
      } catch (error: unknown) {
        if (error instanceof RevisionConflictError) return json(res, 409, { error: error.message, current: error.current });
        throw error;
      }
    }
    if (req.method === "GET" && url.pathname === "/api/activity") {
      const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "30", 10) || 30));
      const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
      return json(res, 200, db.listActivity(limit, offset));
    }
    if (req.method === "GET" && url.pathname === "/api/runs") {
      const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "30", 10) || 30));
      const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
      const tool = (url.searchParams.get("tool") ?? "").slice(0, 120);
      return json(res, 200, db.listRuns(limit, offset, tool));
    }
    if (req.method === "GET" && url.pathname.startsWith("/api/")) return json(res, 404, { error: "API route not found" });
    if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "Method not allowed" });
    return serveStatic(url.pathname, res);
  } catch (error: unknown) {
    console.error("Request failed:", error instanceof Error ? error.message : String(error));
    return json(res, 500, { error: "Local workbench request failed" });
  }
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${host}:${port}`);
  if (url.pathname !== "/ws" || !validHost(req) || !validOrigin(req)) return socket.destroy();
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});

wss.on("connection", (socket) => {
  sockets.add(socket);
  socket.send(JSON.stringify({ type: "ready", revision: db.getRevision(), storage: "sqlite" }));
  socket.on("close", () => sockets.delete(socket));
  socket.on("error", () => sockets.delete(socket));
});

function broadcastRevision(revision: number): void {
  const message = JSON.stringify({ type: "workspace.changed", revision });
  sockets.forEach((socket) => { if (socket.readyState === WebSocket.OPEN) socket.send(message); });
}

setInterval(() => {
  try {
    const revision = db.getRevision();
    if (revision !== observedRevision) {
      observedRevision = revision;
      broadcastRevision(revision);
    }
  } catch (error: unknown) {
    console.error("Revision watcher failed:", error instanceof Error ? error.message : String(error));
  }
}, 350).unref();

server.listen(port, host, () => console.error(`Info Workbench v9: http://${host}:${port}/ (SQLite revision ${observedRevision})`));

function shutdown(): void {
  sockets.forEach((socket) => socket.close());
  server.close(() => { db.close(); process.exit(0); });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
