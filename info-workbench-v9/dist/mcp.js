#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { randomUUID } from "node:crypto";
import { WorkbenchDatabase } from "./db.js";
import { addConnection, createTarget, upsertCards } from "./workspace-ops.js";
const responseFormat = z.enum(["markdown", "json"]).default("markdown");
const operationId = z.string().min(8).max(160).regex(/^[a-zA-Z0-9._:-]+$/)
    .describe("Stable idempotency key for this Agent write, e.g. run-20260802-httpx-assets. Reuse it only when retrying the same write.");
const targetId = z.string().min(1).max(160).describe("Target ID returned by collector_list_targets or collector_create_target.");
const sourceSchema = z.object({
    agent: z.string().min(1).max(100).describe("Agent name, e.g. codex"),
    tool: z.string().min(1).max(120).describe("Scanner/tool that produced the results, e.g. httpx"),
    run_id: z.string().max(160).optional().describe("Optional scanner run ID"),
    scanned_at: z.iso.datetime().optional().describe("Optional ISO-8601 scan time")
}).strict();
const cardSchema = z.object({
    card_key: z.string().min(1).max(180).describe("Stable key within this target, e.g. httpx-live-hosts. Reuse it to update the same card."),
    title: z.string().min(1).max(120),
    content: z.string().max(500_000).describe("Agent-normalized scan result text or Markdown"),
    template_id: z.string().max(80).optional().describe("Existing template ID such as subdomain, port, fingerprint, vuln, notes"),
    icon: z.string().max(12).optional(),
    description: z.string().max(240).optional(),
    write_mode: z.enum(["merge", "append", "replace", "new"]).default("merge")
        .describe("merge deduplicates lines; append adds text; replace overwrites; new always creates a card"),
    risk: z.enum(["critical", "high", "medium", "low", "info"]).default("info"),
    status: z.enum(["todo", "doing", "done"]).default("done"),
    tags: z.array(z.string().min(1).max(40)).max(20).default([])
}).strict();
const registryCardOutput = z.object({
    id: z.string(), mcp_key: z.string().optional(), title: z.string(), template_id: z.string().optional(),
    risk: z.enum(["critical", "high", "medium", "low", "info"]).optional(),
    status: z.enum(["todo", "doing", "done"]).optional(), updated_at: z.number().optional()
}).strict();
const registryTargetOutput = z.object({
    id: z.string(), name: z.string(), cards: z.array(registryCardOutput), connections: z.number(), updated_at: z.string()
}).strict();
const writeOutputBase = {
    written: z.boolean(), duplicate: z.boolean(), revision: z.number()
};
const server = new McpServer({ name: "info-workbench-mcp-server", version: "9.0.0" });
const db = new WorkbenchDatabase();
function output(value, format, markdown) {
    return {
        content: [{ type: "text", text: format === "json" ? JSON.stringify(value, null, 2) : markdown }],
        structuredContent: value
    };
}
server.registerTool("collector_list_targets", {
    title: "List Info Collector Targets",
    description: `List targets stored in the v9 SQLite workbench. Use this before writing scanner results to choose the correct target_id. This is read-only and never runs a scanner.`,
    inputSchema: z.object({
        query: z.string().max(120).default("").describe("Optional case-insensitive name filter"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        response_format: responseFormat
    }).strict(),
    outputSchema: z.object({
        total_count: z.number(), count: z.number(), offset: z.number(), has_more: z.boolean(),
        targets: z.array(z.object({ id: z.string(), name: z.string(), card_count: z.number(), connection_count: z.number(), updated_at: z.string() }).strict()),
        registry_updated_at: z.string().nullable()
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ query, limit, offset, response_format }) => {
    const state = db.getWorkspace();
    const q = query.trim().toLocaleLowerCase();
    const matches = (state.data?.targets ?? []).filter((target) => !q || target.name.toLocaleLowerCase().includes(q));
    const targets = matches.slice(offset, offset + limit).map((target) => ({
        id: target.id, name: target.name, card_count: target.cards.length,
        connection_count: target.connections?.length ?? 0, updated_at: new Date(Number(target.updatedAt || 0)).toISOString()
    }));
    const result = { total_count: matches.length, count: targets.length, offset, has_more: offset + targets.length < matches.length, targets, registry_updated_at: state.updated_at };
    const lines = targets.length ? targets.map((target) => `- ${target.name} (${target.id}) — ${target.card_count} cards`).join("\n") : "No matching targets. Open v9 once or call collector_create_target.";
    return output(result, response_format, `# Info Collector targets\n\n${lines}`);
});
server.registerTool("collector_get_target", {
    title: "Get Info Collector Target",
    description: "Read one SQLite-backed workbench target, including card IDs and stable mcp_key values. Use it before deciding whether scanner results should update an existing card. This never runs a scanner.",
    inputSchema: z.object({ target_id: targetId, response_format: responseFormat }).strict(),
    outputSchema: z.discriminatedUnion("found", [
        z.object({ found: z.literal(false), target_id: z.string() }).strict(),
        z.object({ found: z.literal(true), target: registryTargetOutput }).strict()
    ]),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ target_id, response_format }) => {
    const target = db.getWorkspace().data?.targets.find((item) => item.id === target_id);
    if (!target)
        return output({ found: false, target_id }, response_format, `Target not found: ${target_id}. Call collector_list_targets or collector_create_target.`);
    const summary = { id: target.id, name: target.name, connections: target.connections?.length ?? 0, updated_at: new Date(Number(target.updatedAt || 0)).toISOString(), cards: target.cards.map((card) => ({ id: card.id, ...(card.mcpKey ? { mcp_key: card.mcpKey } : {}), title: card.title, ...(card.templateId ? { template_id: card.templateId } : {}), risk: card.risk, status: card.status, updated_at: card.updatedAt })) };
    return output({ found: true, target: summary }, response_format, `# ${target.name}\n\nID: ${target.id}\nCards: ${target.cards.length}\n\n${target.cards.map((card) => `- ${card.title} (${card.id})${card.mcpKey ? ` — key: ${card.mcpKey}` : ""}`).join("\n") || "No cards"}`);
});
server.registerTool("collector_create_target", {
    title: "Create Info Collector Target",
    description: "Create a target directly in the v9 SQLite workbench. The write succeeds while the browser is closed and is idempotent by operation_id. This never starts or embeds scanners.",
    inputSchema: z.object({
        operation_id: operationId,
        name: z.string().min(1).max(120),
        target_id: z.string().min(1).max(160).optional().describe("Optional stable target ID; otherwise the server creates one"),
        response_format: responseFormat
    }).strict(),
    outputSchema: z.object({ ...writeOutputBase, target_id: z.string(), message: z.string() }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ operation_id, name, target_id, response_format }) => {
    const id = target_id ?? `target-agent-${randomUUID()}`;
    const operation = db.runOperation(operation_id, "target.created", "agent", (data) => {
        const target = createTarget(data, id, name);
        return { result: { target_id: target.id, message: "Target committed to SQLite." }, message: `Agent 创建目标：${target.name}` };
    });
    const result = { written: true, duplicate: operation.duplicate, revision: operation.revision, ...operation.result };
    return output(result, response_format, `${operation.duplicate ? "Already written" : "Written"} target **${name}** (${operation.result.target_id}) at revision ${operation.revision}.`);
});
server.registerTool("collector_upsert_cards", {
    title: "Write Scanner Results to Info Collector Cards",
    description: `Write one or more Agent-normalized scanner results directly into v9 SQLite cards. Call this AFTER the Agent invokes external scanners and interprets their output. This tool never executes scanners, shell commands, URLs, or arbitrary code. Writes persist while the page is closed and are idempotent by operation_id.`,
    inputSchema: z.object({
        operation_id: operationId,
        target_id: targetId,
        source: sourceSchema,
        cards: z.array(cardSchema).min(1).max(100),
        response_format: responseFormat
    }).strict(),
    outputSchema: z.object({ ...writeOutputBase, target_id: z.string(), card_count: z.number(), card_keys: z.array(z.string()), card_ids: z.array(z.string()), run_id: z.string() }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ operation_id, target_id, source, cards, response_format }) => {
    try {
        const runId = source.run_id ?? operation_id;
        const operation = db.runOperation(operation_id, "cards.upserted", `${source.agent}:${source.tool}`, (data) => {
            const normalizedSource = { ...source, run_id: runId };
            const changed = upsertCards(data, target_id, normalizedSource, cards);
            return {
                result: { target_id, card_count: changed.cards.length, card_keys: cards.map((card) => card.card_key), card_ids: changed.cards.map((card) => card.id), run_id: runId },
                message: `${source.tool} 写入 ${changed.cards.length} 张卡片到「${changed.target.name}」`,
                scanRun: { run_id: runId, agent: source.agent, tool: source.tool, target_id, scanned_at: source.scanned_at ?? new Date().toISOString(), card_count: changed.cards.length, metadata: { operation_id } }
            };
        });
        const result = { written: true, duplicate: operation.duplicate, revision: operation.revision, ...operation.result };
        return output(result, response_format, `${operation.duplicate ? "Already written" : "Written"} ${result.card_count} card(s) from ${source.tool} at SQLite revision ${operation.revision}.`);
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `Unable to write cards: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
server.registerTool("collector_add_connection", {
    title: "Connect Info Collector Cards",
    description: "Create an idempotent directed connection in SQLite between two cards. Use card IDs or stable mcp_key values. This only updates workspace visualization.",
    inputSchema: z.object({
        operation_id: operationId,
        target_id: targetId,
        source_card: z.string().min(1).max(180),
        target_card: z.string().min(1).max(180),
        connection_type: z.enum(["related", "depends", "discovered", "merged", "attack"]).default("discovered"),
        response_format: responseFormat
    }).strict(),
    outputSchema: z.object({ ...writeOutputBase, target_id: z.string(), source_card: z.string(), target_card: z.string(), connection_type: z.enum(["related", "depends", "discovered", "merged", "attack"]), connection_id: z.string() }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ operation_id, target_id, source_card, target_card, connection_type, response_format }) => {
    try {
        const operation = db.runOperation(operation_id, "connection.created", "agent", (data) => {
            const connection = addConnection(data, target_id, source_card, target_card, connection_type, operation_id);
            return { result: { target_id, source_card, target_card, connection_type, connection_id: connection.id }, message: `Agent 创建连线：${source_card} → ${target_card}` };
        });
        const result = { written: true, duplicate: operation.duplicate, revision: operation.revision, ...operation.result };
        return output(result, response_format, `${operation.duplicate ? "Already written" : "Written"} ${source_card} → ${target_card} (${connection_type}) at revision ${operation.revision}.`);
    }
    catch (error) {
        return { isError: true, content: [{ type: "text", text: `Unable to create connection: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});
server.registerTool("collector_search_cards", {
    title: "Search Workbench Cards",
    description: "Search SQLite card titles and contents with optional target, risk, and exact-tag filters. Read-only, paginated, and useful for checking existing findings before writing new scan results.",
    inputSchema: z.object({
        query: z.string().max(200).default(""), target_id: z.string().max(160).default(""),
        risk: z.enum(["", "critical", "high", "medium", "low", "info"]).default(""), tag: z.string().max(40).default(""),
        limit: z.number().int().min(1).max(50).default(20), offset: z.number().int().min(0).default(0), response_format: responseFormat
    }).strict(),
    outputSchema: z.object({ total_count: z.number(), count: z.number(), offset: z.number(), has_more: z.boolean(), items: z.array(z.record(z.string(), z.unknown())) }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ query, target_id, risk, tag, limit, offset, response_format }) => {
    const found = db.searchCards(query, target_id, risk, tag, limit, offset);
    const result = { total_count: found.total_count, count: found.items.length, offset, has_more: offset + found.items.length < found.total_count, items: found.items };
    return output(result, response_format, found.items.length ? found.items.map((item) => `- ${item.title} — ${item.target_name} (${item.id})`).join("\n") : "No matching cards.");
});
server.registerTool("collector_list_scan_runs", {
    title: "List Recorded Scan Runs",
    description: "List scan runs previously recorded when Agent results were written to SQLite. Read-only and paginated; optionally filter by exact tool name.",
    inputSchema: z.object({ tool: z.string().max(120).default(""), limit: z.number().int().min(1).max(100).default(20), offset: z.number().int().min(0).default(0), response_format: responseFormat }).strict(),
    outputSchema: z.object({ total_count: z.number(), count: z.number(), offset: z.number(), has_more: z.boolean(), items: z.array(z.record(z.string(), z.unknown())) }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}, async ({ tool, limit, offset, response_format }) => {
    const listed = db.listRuns(limit, offset, tool);
    const result = { total_count: listed.total_count, count: listed.items.length, offset, has_more: offset + listed.items.length < listed.total_count, items: listed.items };
    return output(result, response_format, listed.items.length ? listed.items.map((item) => `- ${item.tool} · ${item.run_id} · ${item.card_count} cards`).join("\n") : "No recorded scan runs.");
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("info-workbench-mcp-server ready on stdio (SQLite workspace writes only; no scanners)");
}
main().catch((error) => {
    console.error("info-workbench-mcp-server failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
});
//# sourceMappingURL=mcp.js.map