import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { databaseFile } from "./paths.js";
import { emptyWorkspace, normalizeWorkspace } from "./workspace-ops.js";
export class RevisionConflictError extends Error {
    current;
    constructor(current) {
        super(`Workspace revision conflict; current revision is ${current.revision}`);
        this.current = current;
    }
}
export class WorkbenchDatabase {
    db;
    constructor(file = databaseFile) {
        mkdirSync(path.dirname(file), { recursive: true });
        this.db = new DatabaseSync(file);
        this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
        this.migrate();
    }
    migrate() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_state (
        id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL,
        data_json TEXT NOT NULL, settings_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS targets (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, sort_order INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY, target_id TEXT NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
        mcp_key TEXT, title TEXT NOT NULL, template_id TEXT, content TEXT NOT NULL,
        risk TEXT, status TEXT, tags_json TEXT NOT NULL, source_json TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cards_target ON cards(target_id);
      CREATE INDEX IF NOT EXISTS idx_cards_mcp_key ON cards(target_id, mcp_key);
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY, target_id TEXT NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
        source_card TEXT NOT NULL, target_card TEXT NOT NULL, type TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS operations (
        operation_id TEXT PRIMARY KEY, kind TEXT NOT NULL, result_json TEXT NOT NULL,
        revision INTEGER NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS scan_runs (
        run_id TEXT PRIMARY KEY, agent TEXT NOT NULL, tool TEXT NOT NULL,
        target_id TEXT NOT NULL, scanned_at TEXT NOT NULL, card_count INTEGER NOT NULL,
        metadata_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, message TEXT NOT NULL,
        source TEXT, created_at TEXT NOT NULL, revision INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_activity_revision ON activity(revision DESC);
      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY, target_id TEXT NOT NULL, run_id TEXT,
        name TEXT NOT NULL, relative_path TEXT NOT NULL, mime_type TEXT,
        size_bytes INTEGER, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS findings (
        id TEXT PRIMARY KEY, target_id TEXT NOT NULL, card_id TEXT,
        title TEXT NOT NULL, severity TEXT NOT NULL, status TEXT NOT NULL,
        evidence TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
    `);
    }
    close() { this.db.close(); }
    getRevision() {
        const row = this.db.prepare("SELECT revision FROM workspace_state WHERE id = 1").get();
        return row?.revision ?? 0;
    }
    getWorkspace() {
        const row = this.db.prepare("SELECT revision, data_json, settings_json, updated_at FROM workspace_state WHERE id = 1").get();
        if (!row)
            return { exists: false, revision: 0, data: null, settings: null, updated_at: null };
        return {
            exists: true,
            revision: row.revision,
            data: normalizeWorkspace(JSON.parse(row.data_json)),
            settings: JSON.parse(row.settings_json),
            updated_at: row.updated_at
        };
    }
    saveWorkspace(dataValue, settingsValue, expectedRevision, source = "browser") {
        const data = normalizeWorkspace(dataValue);
        const settings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
        this.db.exec("BEGIN IMMEDIATE");
        try {
            const current = this.getWorkspace();
            if (current.revision !== expectedRevision)
                throw new RevisionConflictError(current);
            const revision = current.revision + 1;
            this.persistWorkspace(data, settings, revision);
            this.insertActivity("workspace.saved", `工作区已由 ${source} 保存`, source, revision);
            this.db.exec("COMMIT");
            return this.getWorkspace();
        }
        catch (error) {
            this.db.exec("ROLLBACK");
            throw error;
        }
    }
    runOperation(operationId, kind, source, mutate) {
        this.db.exec("BEGIN IMMEDIATE");
        try {
            const existing = this.db.prepare("SELECT result_json, revision FROM operations WHERE operation_id = ?").get(operationId);
            if (existing) {
                this.db.exec("COMMIT");
                return { duplicate: true, revision: existing.revision, result: JSON.parse(existing.result_json) };
            }
            const current = this.getWorkspace();
            const data = current.data ?? emptyWorkspace();
            const settings = current.settings ?? {};
            const change = mutate(data);
            const revision = current.revision + 1;
            this.persistWorkspace(data, settings, revision);
            const now = new Date().toISOString();
            this.db.prepare("INSERT INTO operations(operation_id, kind, result_json, revision, created_at) VALUES (?, ?, ?, ?, ?)")
                .run(operationId, kind, JSON.stringify(change.result), revision, now);
            if (change.scanRun) {
                const run = change.scanRun;
                this.db.prepare(`INSERT OR REPLACE INTO scan_runs(run_id, agent, tool, target_id, scanned_at, card_count, metadata_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)`)
                    .run(run.run_id, run.agent, run.tool, run.target_id, run.scanned_at, run.card_count, JSON.stringify(run.metadata));
            }
            this.insertActivity(kind, change.message, source, revision);
            this.db.exec("COMMIT");
            return { duplicate: false, revision, result: change.result };
        }
        catch (error) {
            this.db.exec("ROLLBACK");
            throw error;
        }
    }
    persistWorkspace(data, settings, revision) {
        const now = new Date().toISOString();
        this.db.prepare(`INSERT INTO workspace_state(id, revision, data_json, settings_json, updated_at)
      VALUES (1, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, data_json=excluded.data_json,
      settings_json=excluded.settings_json, updated_at=excluded.updated_at`)
            .run(revision, JSON.stringify(data), JSON.stringify(settings), now);
        this.db.exec("DELETE FROM connections; DELETE FROM cards; DELETE FROM targets;");
        const insertTarget = this.db.prepare("INSERT INTO targets(id, name, sort_order, updated_at) VALUES (?, ?, ?, ?)");
        const insertCard = this.db.prepare(`INSERT INTO cards(id, target_id, mcp_key, title, template_id, content, risk, status, tags_json, source_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        const insertConnection = this.db.prepare(`INSERT INTO connections(id, target_id, source_card, target_card, type, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)`);
        data.targets.forEach((target, targetIndex) => {
            insertTarget.run(target.id, target.name, targetIndex, toIso(target.updatedAt));
            target.cards.forEach((card) => insertCard.run(card.id, target.id, card.mcpKey ?? null, card.title, card.templateId ?? null, card.data ?? "", card.risk ?? "info", card.status ?? "todo", JSON.stringify(card.tags ?? []), card.mcpSource ? JSON.stringify(card.mcpSource) : null, toIso(card.updatedAt ?? card.createdAt)));
            (target.connections ?? []).forEach((connection) => insertConnection.run(connection.id, target.id, connection.source, connection.target, connection.type ?? "related", now));
        });
    }
    insertActivity(kind, message, source, revision) {
        this.db.prepare("INSERT INTO activity(kind, message, source, created_at, revision) VALUES (?, ?, ?, ?, ?)")
            .run(kind, message, source, new Date().toISOString(), revision);
    }
    listActivity(limit = 30, offset = 0) {
        const total = this.db.prepare("SELECT COUNT(*) AS count FROM activity").get().count;
        const items = this.db.prepare("SELECT id, kind, message, source, created_at, revision FROM activity ORDER BY id DESC LIMIT ? OFFSET ?")
            .all(limit, offset);
        return { total_count: total, items };
    }
    listRuns(limit = 20, offset = 0, tool = "") {
        const where = tool ? "WHERE tool = ?" : "";
        const countArgs = tool ? [tool] : [];
        const total = this.db.prepare(`SELECT COUNT(*) AS count FROM scan_runs ${where}`).get(...countArgs).count;
        const args = tool ? [tool, limit, offset] : [limit, offset];
        const rows = this.db.prepare(`SELECT run_id, agent, tool, target_id, scanned_at, card_count FROM scan_runs ${where} ORDER BY scanned_at DESC LIMIT ? OFFSET ?`).all(...args);
        return { total_count: total, items: rows };
    }
    searchCards(query, targetId, risk, tag, limit, offset) {
        const clauses = [];
        const args = [];
        if (query) {
            clauses.push("(c.title LIKE ? ESCAPE '\\' OR c.content LIKE ? ESCAPE '\\')");
            const like = `%${escapeLike(query)}%`;
            args.push(like, like);
        }
        if (targetId) {
            clauses.push("c.target_id = ?");
            args.push(targetId);
        }
        if (risk) {
            clauses.push("c.risk = ?");
            args.push(risk);
        }
        if (tag) {
            clauses.push("EXISTS (SELECT 1 FROM json_each(c.tags_json) WHERE value = ?)");
            args.push(tag);
        }
        const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
        const total = this.db.prepare(`SELECT COUNT(*) AS count FROM cards c ${where}`).get(...args).count;
        const rows = this.db.prepare(`SELECT c.id, c.target_id, t.name AS target_name, c.mcp_key, c.title, c.template_id, c.content, c.risk, c.status, c.tags_json, c.source_json, c.updated_at
      FROM cards c JOIN targets t ON t.id = c.target_id ${where} ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`).all(...args, limit, offset);
        return { total_count: total, items: rows.map((row) => ({ ...row, tags: JSON.parse(String(row.tags_json)), source: row.source_json ? JSON.parse(String(row.source_json)) : null, tags_json: undefined, source_json: undefined })) };
    }
}
function toIso(value) {
    const number = typeof value === "number" ? value : Date.now();
    const date = new Date(number);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
function escapeLike(value) { return value.replace(/[\\%_]/g, (match) => `\\${match}`); }
//# sourceMappingURL=db.js.map