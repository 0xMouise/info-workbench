import { randomUUID } from "node:crypto";
export function emptyWorkspace() {
    return { targets: [], cardGroups: [], customGroups: [], trash: [], currentTargetId: null };
}
export function normalizeWorkspace(value) {
    if (!value || typeof value !== "object")
        return emptyWorkspace();
    const input = value;
    const targets = Array.isArray(input.targets) ? input.targets.filter(isTarget).map((target) => ({
        ...target,
        cards: Array.isArray(target.cards) ? target.cards.filter(isCard) : [],
        connections: Array.isArray(target.connections) ? target.connections.filter(isConnection) : []
    })) : [];
    return { ...input, targets, currentTargetId: typeof input.currentTargetId === "string" ? input.currentTargetId : targets[0]?.id ?? null };
}
function isTarget(value) {
    return !!value && typeof value === "object" && typeof value.id === "string" && typeof value.name === "string";
}
function isCard(value) {
    return !!value && typeof value === "object" && typeof value.id === "string" && typeof value.title === "string";
}
function isConnection(value) {
    return !!value && typeof value === "object" && typeof value.id === "string" && typeof value.source === "string" && typeof value.target === "string";
}
export function createTarget(data, targetId, name) {
    const existing = data.targets.find((target) => target.id === targetId);
    if (existing)
        return existing;
    const target = { id: targetId, name, cards: [], connections: [], createdAt: Date.now(), updatedAt: Date.now() };
    data.targets.push(target);
    data.currentTargetId ??= target.id;
    return target;
}
export function mergeLineContent(current, incoming, mode) {
    if (mode === "replace" || mode === "new")
        return incoming;
    if (mode === "append")
        return [current.trimEnd(), incoming.trim()].filter(Boolean).join("\n");
    const seen = new Set();
    const lines = [];
    `${current}\n${incoming}`.split(/\r?\n/).forEach((line) => {
        const key = line.trim();
        if (!key || seen.has(key))
            return;
        seen.add(key);
        lines.push(line);
    });
    return lines.join("\n");
}
function recordAgentVersion(card, source) {
    const history = Array.isArray(card.history) ? card.history : [];
    history.unshift({
        id: `version-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        reason: "agent-update",
        changedBy: `${source.agent}:${source.tool}`,
        createdAt: Date.now(),
        title: card.title,
        data: card.data ?? "",
        status: card.status ?? "todo",
        risk: card.risk ?? "info",
        tags: [...(card.tags ?? [])],
        source: card.mcpSource ?? null
    });
    card.history = history.slice(0, 30);
}
export function upsertCards(data, targetId, source, writes) {
    const target = data.targets.find((item) => item.id === targetId);
    if (!target)
        throw new Error(`Target '${targetId}' not found. Call collector_list_targets or collector_create_target first.`);
    const changed = [];
    writes.forEach((incoming, index) => {
        const alwaysNew = incoming.write_mode === "new";
        let card = alwaysNew ? undefined : target.cards.find((item) => item.mcpKey === incoming.card_key);
        if (!card) {
            const count = target.cards.length;
            card = {
                id: `agent-${randomUUID()}`,
                mcpKey: alwaysNew ? `${incoming.card_key}:${randomUUID()}` : incoming.card_key,
                templateId: incoming.template_id ?? "notes",
                icon: incoming.icon ?? "◈",
                title: incoming.title,
                desc: incoming.description ?? `由 Agent · ${source.tool} 写入`,
                data: incoming.content,
                collapsed: false,
                x: 310 + (count % 3) * 430,
                y: 100 + Math.floor(count / 3) * 330,
                width: 400,
                height: 300,
                status: incoming.status,
                viewMode: "edit",
                risk: incoming.risk,
                tags: [...new Set([...incoming.tags, "agent"])],
                createdAt: Date.now() + index,
                updatedAt: Date.now() + index
            };
            target.cards.push(card);
        }
        else {
            recordAgentVersion(card, source);
            card.data = mergeLineContent(card.data ?? "", incoming.content, incoming.write_mode);
            card.title = incoming.title || card.title;
            if (incoming.description !== undefined)
                card.desc = incoming.description;
            card.risk = incoming.risk;
            card.status = incoming.status;
            card.tags = [...new Set([...(card.tags ?? []), ...incoming.tags, "agent"])];
            card.updatedAt = Date.now() + index;
        }
        card.mcpSource = source;
        card.lastAgentUpdate = new Date().toISOString();
        changed.push(card);
    });
    target.updatedAt = Date.now();
    data.currentTargetId = target.id;
    return { target, cards: changed };
}
export function addConnection(data, targetId, fromKey, toKey, type, operationId) {
    const target = data.targets.find((item) => item.id === targetId);
    if (!target)
        throw new Error(`Target '${targetId}' not found.`);
    const resolve = (key) => target.cards.find((card) => card.id === key || card.mcpKey === key);
    const from = resolve(fromKey);
    const to = resolve(toKey);
    if (!from || !to)
        throw new Error("Source or target card not found. Use collector_get_target to inspect card IDs and mcp_key values.");
    target.connections ??= [];
    const existing = target.connections.find((item) => item.agentOperationId === operationId);
    if (existing)
        return existing;
    const connection = { id: `conn-agent-${randomUUID()}`, source: from.id, target: to.id, type, agentOperationId: operationId };
    target.connections.push(connection);
    return connection;
}
//# sourceMappingURL=workspace-ops.js.map