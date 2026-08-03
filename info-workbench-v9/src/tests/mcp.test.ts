import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

test("v9 MCP writes directly to SQLite and exposes read-only discovery tools", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "info-workbench-mcp-"));
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const entry = path.resolve(moduleDir, "..", "mcp.js");
  const env = Object.fromEntries(Object.entries(process.env).filter((item): item is [string, string] => typeof item[1] === "string"));
  env.INFO_WORKBENCH_DB = path.join(dir, "mcp.db");
  const transport = new StdioClientTransport({ command: process.execPath, args: [entry], env, stderr: "pipe" });
  const client = new Client({ name: "v9-test", version: "1.0.0" });
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name), [
      "collector_list_targets", "collector_get_target", "collector_create_target", "collector_upsert_cards",
      "collector_add_connection", "collector_search_cards", "collector_list_scan_runs"
    ]);
    assert.equal(tools.tools.every((tool) => !!tool.outputSchema), true);
    const created = await client.callTool({ name: "collector_create_target", arguments: { operation_id: "mcp-create-target-001", target_id: "target-mcp", name: "MCP 测试", response_format: "json" } });
    assert.equal((created.structuredContent as { revision?: number } | undefined)?.revision, 1);
    const written = await client.callTool({ name: "collector_upsert_cards", arguments: {
      operation_id: "mcp-write-httpx-001", target_id: "target-mcp", source: { agent: "test", tool: "httpx", run_id: "run-mcp" },
      cards: [{ card_key: "live-hosts", title: "存活资产", content: "https://mcp.example", write_mode: "merge", risk: "info", status: "done", tags: ["httpx"] }], response_format: "json"
    } });
    assert.equal((written.structuredContent as { revision?: number } | undefined)?.revision, 2);
    const duplicate = await client.callTool({ name: "collector_upsert_cards", arguments: {
      operation_id: "mcp-write-httpx-001", target_id: "target-mcp", source: { agent: "test", tool: "httpx" },
      cards: [{ card_key: "live-hosts", title: "错误重放", content: "duplicate", write_mode: "replace", risk: "high", status: "done", tags: [] }], response_format: "json"
    } });
    assert.equal((duplicate.structuredContent as { duplicate?: boolean } | undefined)?.duplicate, true);
    const search = await client.callTool({ name: "collector_search_cards", arguments: { query: "mcp.example", response_format: "json" } });
    assert.equal((search.structuredContent as { total_count?: number } | undefined)?.total_count, 1);
  } finally {
    await client.close();
    await rm(dir, { recursive: true, force: true });
  }
});
