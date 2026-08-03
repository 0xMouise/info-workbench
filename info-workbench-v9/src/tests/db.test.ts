import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { WorkbenchDatabase, RevisionConflictError } from "../db.js";
import { createTarget, upsertCards } from "../workspace-ops.js";

test("SQLite persists workspace, enforces revisions, and deduplicates Agent operations", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "info-workbench-db-"));
  const file = path.join(dir, "test.db");
  const db = new WorkbenchDatabase(file);
  try {
    const initial = db.saveWorkspace({ targets: [{ id: "target-1", name: "示例", cards: [], connections: [] }], currentTargetId: "target-1" }, { autoSave: true }, 0, "test");
    assert.equal(initial.revision, 1);
    assert.throws(() => db.saveWorkspace(initial.data, initial.settings, 0), RevisionConflictError);

    const write = db.runOperation("test-httpx-operation-001", "cards.upserted", "test:httpx", (data) => {
      const changed = upsertCards(data, "target-1", { agent: "test", tool: "httpx", run_id: "run-1" }, [{
        card_key: "live-hosts", title: "存活主机", content: "https://example.test", write_mode: "merge", risk: "info", status: "done", tags: ["httpx"]
      }]);
      return { result: { card_id: changed.cards[0]!.id }, message: "test write", scanRun: { run_id: "run-1", agent: "test", tool: "httpx", target_id: "target-1", scanned_at: "2026-08-02T00:00:00.000Z", card_count: 1, metadata: {} } };
    });
    const duplicate = db.runOperation("test-httpx-operation-001", "cards.upserted", "test:httpx", () => { throw new Error("must not execute"); });
    assert.equal(write.duplicate, false);
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.result.card_id, write.result.card_id);
    db.runOperation("test-httpx-operation-002", "cards.upserted", "test:httpx", (data) => {
      const changed = upsertCards(data, "target-1", { agent: "test", tool: "httpx", run_id: "run-2" }, [{
        card_key: "live-hosts", title: "存活主机", content: "https://example.test\nhttps://new.example.test", write_mode: "replace", risk: "low", status: "done", tags: ["httpx"]
      }]);
      return { result: { card_id: changed.cards[0]!.id }, message: "test history", scanRun: { run_id: "run-2", agent: "test", tool: "httpx", target_id: "target-1", scanned_at: "2026-08-02T01:00:00.000Z", card_count: 1, metadata: {} } };
    });
    const versioned = db.getWorkspace().data?.targets[0]?.cards[0];
    assert.equal(Array.isArray(versioned?.history), true);
    assert.equal((versioned?.history as Array<{ data?: string }>)[0]?.data, "https://example.test");
    assert.equal(db.searchCards("example.test", "target-1", "", "httpx", 10, 0).total_count, 1);
    assert.equal(db.listRuns(10, 0, "httpx").total_count, 2);
  } finally {
    db.close();
  }
  const reopened = new WorkbenchDatabase(file);
  assert.equal(reopened.getWorkspace().data?.targets[0]?.cards.length, 1);
  reopened.close();
  await rm(dir, { recursive: true, force: true });
});
