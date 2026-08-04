import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const serverEntry = path.join(projectDir, "dist", "server.js");
const mcpEntry = path.join(projectDir, "dist", "mcp.js");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 17325;
const cdpPort = 17326;
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "info-workbench-v9-browser-"));
const dbFile = path.join(tempRoot, "workbench.db");
const profileDir = path.join(tempRoot, "edge-profile");
const env = Object.fromEntries(Object.entries(process.env).filter((entry) => typeof entry[1] === "string"));
const serviceEnv = { ...env, INFO_WORKBENCH_PORT: String(port), INFO_WORKBENCH_DB: dbFile };
const server = spawn(process.execPath, [serverEntry], { cwd: projectDir, env: serviceEnv, stdio: ["ignore", "ignore", "pipe"] });
const edge = spawn(edgePath, ["--headless=new", `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profileDir}`, "--window-size=1440,1000", "--no-first-run", "--disable-gpu", "--disable-extensions", "about:blank"], { stdio: "ignore", windowsHide: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(check, label, timeout = 15_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { const value = await check(); if (value) return value; } catch {}
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); this.events = []; }
  async connect() {
    await new Promise((resolve, reject) => { this.socket.addEventListener("open", resolve, { once: true }); this.socket.addEventListener("error", reject, { once: true }); });
    this.socket.addEventListener("message", (message) => {
      const packet = JSON.parse(message.data);
      if (!packet.id) return this.events.push(packet);
      const pending = this.pending.get(packet.id); if (!pending) return;
      this.pending.delete(packet.id); packet.error ? pending.reject(new Error(packet.error.message)) : pending.resolve(packet.result);
    });
  }
  send(method, params = {}) { const id = this.nextId++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  async evaluate(expression) { const value = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (value.exceptionDetails) throw new Error(value.exceptionDetails.exception?.description || value.exceptionDetails.text); return value.result.value; }
  close() { this.socket.close(); }
}

let cdp;
let mcp;
try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/api/health`)).ok, "v9 server");
  await waitFor(async () => (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).ok, "Edge CDP");
  const target = await (await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: "PUT" })).json();
  cdp = new Cdp(target.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send("Runtime.enable"); await cdp.send("Page.enable");

  const legacy = {
    targets: [{ id: "target-legacy", name: "v8 迁移目标", cards: [{ id: "legacy-card", templateId: "domain", icon: "🌐", title: "历史域名", data: "legacy.example", x: 310, y: 100, width: 400, height: 300, status: "done", risk: "info", tags: ["legacy"], createdAt: 1700000000000, updatedAt: 1700000000000 }], connections: [] }],
    cardGroups: [], customGroups: [], trash: [], currentTargetId: "target-legacy"
  };
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `if (location.port === '${port}') { localStorage.setItem('infoCollectorData', ${JSON.stringify(JSON.stringify(legacy))}); localStorage.setItem('infoCollectorSettings', '{}'); }` });
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
  await waitFor(() => cdp.evaluate("typeof app !== 'undefined' && document.readyState === 'complete'"), "v9 app");
  await waitFor(async () => { const state = await (await fetch(`http://127.0.0.1:${port}/api/workspace`)).json(); return state.exists && state.data.targets.some((item) => item.id === "target-legacy"); }, "v8 migration to SQLite");
  await waitFor(() => cdp.evaluate("document.getElementById('agentStatusText')?.textContent === '本地库已连接'"), "WebSocket connection");
  const presetGroups = await cdp.evaluate(`app.data.cardGroups.map(group => ({ id: group.id, cards: group.templates?.length || 0 }))`);
  if (JSON.stringify(presetGroups) !== JSON.stringify([
    { id: "domain-breakdown", cards: 4 },
    { id: "src-specialty", cards: 12 },
    { id: "edusrc-specialty", cards: 12 }
  ])) throw new Error(`Specialty card presets missing: ${JSON.stringify(presetGroups)}`);

  const transport = new StdioClientTransport({ command: process.execPath, args: [mcpEntry], env: serviceEnv, stderr: "pipe" });
  mcp = new Client({ name: "v9-browser-regression", version: "1.0.0" }); await mcp.connect(transport);
  const targets = (await mcp.callTool({ name: "collector_list_targets", arguments: { response_format: "json" } })).structuredContent?.targets;
  if (!Array.isArray(targets) || !targets.some((item) => item.id === "target-legacy")) throw new Error("Migrated target is not visible to MCP");

  await cdp.send("Page.navigate", { url: "about:blank" });
  await delay(300);
  const write = await mcp.callTool({ name: "collector_upsert_cards", arguments: {
    operation_id: "v9-page-closed-httpx-001", target_id: "target-legacy", source: { agent: "regression", tool: "mock-httpx", run_id: "closed-run" },
    cards: [{ card_key: "httpx-live-hosts", title: "页面关闭时写入", content: "https://closed.example [200]", template_id: "fingerprint", write_mode: "merge", risk: "info", status: "done", tags: ["httpx"] }], response_format: "json"
  } });
  if (write.structuredContent?.written !== true) throw new Error("MCP did not commit while page was closed");
  const updated = await mcp.callTool({ name: "collector_upsert_cards", arguments: {
    operation_id: "v9-page-closed-httpx-002", target_id: "target-legacy", source: { agent: "regression", tool: "mock-httpx", run_id: "closed-run-2" },
    cards: [{ card_key: "httpx-live-hosts", title: "页面关闭时写入", content: "https://closed.example [200]\nupdated", template_id: "fingerprint", write_mode: "replace", risk: "low", status: "done", tags: ["httpx", "updated"] }], response_format: "json"
  } });
  if (updated.structuredContent?.written !== true) throw new Error("MCP update did not commit while page was closed");

  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
  await waitFor(() => cdp.evaluate("typeof app !== 'undefined' && app.data.targets.some(t => t.cards.some(c => c.mcpKey === 'httpx-live-hosts'))"), "closed-page MCP result after reopen");
  await waitFor(() => cdp.evaluate("document.querySelectorAll('#agentInboxList .agent-run-item').length > 0"), "Agent result inbox");
  const darkThemeContrast = await cdp.evaluate(`(() => {
    document.body.classList.add('dark-theme');
    app.settings.darkMode = true;
    app.switchSelectorTab('templates');
    const rgb = value => (value.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = value => {
      const channels = rgb(value).map(channel => {
        const normalized = channel / 255;
        return normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
      });
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const ratio = (foreground, background) => {
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      return (light + .05) / (dark + .05);
    };
    const inspect = (name, selector, backgroundSelector) => {
      const element = document.querySelector(selector);
      const background = document.querySelector(backgroundSelector);
      if (!element || !background) return { name, missing: true, ratio: 0 };
      const foregroundColor = getComputedStyle(element).color;
      const backgroundColor = getComputedStyle(background).backgroundColor;
      return { name, foregroundColor, backgroundColor, ratio: Number(ratio(foregroundColor, backgroundColor).toFixed(2)) };
    };
    return [
      inspect('card title', '.card-title', '.card'),
      inspect('card description', '.card-desc', '.card'),
      inspect('card body', '.card-content textarea', '.card-content textarea'),
      inspect('card tool', '.card-tool-btn', '.card-tool-btn'),
      inspect('template title', '.template-title', '.card-selector'),
      inspect('template description', '.template-desc', '.card-selector'),
      inspect('group name', '.group-name', '.card-selector')
    ];
  })()`);
  const lowContrast = darkThemeContrast.filter(item => item.missing || item.ratio < 4.5);
  if (lowContrast.length) throw new Error(`Dark theme contrast regression: ${JSON.stringify(lowContrast)}`);
  const runs = await (await fetch(`http://127.0.0.1:${port}/api/runs?limit=20`)).json();
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", modifiers: 2, key: "k", code: "KeyK", windowsVirtualKeyCode: 75 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", modifiers: 2, key: "k", code: "KeyK", windowsVirtualKeyCode: 75 });
  await waitFor(() => cdp.evaluate("document.getElementById('commandPalette')?.classList.contains('show')"), "Ctrl+K command palette");
  const result = await cdp.evaluate(`(() => { const target=app.data.targets.find(t=>t.id==='target-legacy'); const card=target.cards.find(c=>c.mcpKey==='httpx-live-hosts'); const overview=app.buildProjectOverview(target); const commandCount=document.querySelectorAll('#commandPaletteList .command-item').length; app.closeCommandPalette(); app.openCardHistory(card.id); const historyVisible=document.getElementById('cardHistoryModal').classList.contains('show'); app.closeCardHistory(); return { title:document.title, revision:app.serverRevision, migrated:target.cards.some(c=>c.id==='legacy-card'), cardCount:target.cards.filter(c=>c.mcpKey==='httpx-live-hosts').length, content:card.data, source:card.mcpSource.tool, runId:card.mcpSource.run_id, historyCount:card.history?.length||0, inboxItems:document.querySelectorAll('#agentInboxList .agent-run-item').length, commandCount, overviewTotal:overview.total, historyVisible, storage:document.getElementById('agentStatusText').textContent }; })()`);
  if (!result.migrated || result.cardCount !== 1 || result.source !== "mock-httpx" || result.runId !== "closed-run-2" || result.historyCount < 1 || result.inboxItems < 2 || result.commandCount < 8 || result.overviewTotal !== 2 || !result.historyVisible || runs.total_count !== 2) throw new Error(`Browser assertion failed: ${JSON.stringify({ ...result, runs })}`);
  const createdPreset = await cdp.evaluate(`(() => {
    const target=app.data.targets.find(item=>item.id==='target-legacy');
    const before=target.cards.length;
    app.addCardGroup(app.data.cardGroups.find(group=>group.id==='src-specialty'));
    const cards=target.cards.slice(before);
    return {
      count:cards.length,
      ids:cards.map(card=>card.templateId),
      structured:cards.every(card=>card.data.startsWith('## ')),
      tagged:cards.every(card=>card.tags.includes('SRC'))
    };
  })()`);
  if (createdPreset.count !== 12 || createdPreset.ids[0] !== "src-scope" || createdPreset.ids.at(-1) !== "src-priority" || !createdPreset.structured || !createdPreset.tagged) throw new Error(`Specialty preset creation failed: ${JSON.stringify(createdPreset)}`);
  const mergeResult = await cdp.evaluate(`(async () => {
    try {
    const target=app.data.targets.find(t=>t.id==='target-legacy');
    target.cards.push(
      { id:'merge-keep', title:'重复资产 A', data:'https://duplicate.example/admin/', x:300, y:700, width:400, height:300, status:'todo', risk:'low', tags:['first'] },
      { id:'merge-away', title:'重复资产 B', data:'https://duplicate.example/admin\\nextra evidence', x:740, y:700, width:400, height:300, status:'doing', risk:'high', tags:['second'] }
    );
    app.renderCanvas();
    const group=app.getDuplicateGroups(target).find(item=>item.cards.some(card=>card.id==='merge-keep'));
    app.mergeDuplicateGroup(group.key,'merge-keep'); app.confirmDialog();
    await new Promise(resolve=>setTimeout(resolve,80));
    const keeper=target.cards.find(card=>card.id==='merge-keep');
    return { remaining:target.cards.filter(card=>card.id==='merge-keep'||card.id==='merge-away').length, trashed:app.data.trash.some(item=>item.payload?.card?.id==='merge-away'), mergedFrom:keeper?.mergedFrom?.some(item=>item.id==='merge-away'), mergedContent:keeper?.data?.includes('extra evidence') };
    } catch (error) { return { error:String(error), stack:error?.stack }; }
  })()`);
  if (mergeResult.error) throw new Error(`Recoverable merge fixture failed: ${JSON.stringify(mergeResult)}`);
  if (mergeResult.remaining !== 1 || !mergeResult.trashed || !mergeResult.mergedFrom || !mergeResult.mergedContent) throw new Error(`Recoverable merge failed: ${JSON.stringify(mergeResult)}`);
  await cdp.evaluate(`(() => {
    const makeCard=(id,title,x)=>({ id, templateId:'notes', icon:'📝', title, desc:'连线遮挡回归夹具', data:'正文必须保持可读', x, y:180, width:300, height:220, status:'todo', risk:'info', tags:[], createdAt:Date.now(), updatedAt:Date.now() });
    app.data.targets.push({
      id:'target-connection-layer', name:'连线图层回归',
      cards:[makeCard('line-from','源卡片',300),makeCard('line-blocker','中间卡片',650),makeCard('line-to','目标卡片',1000)],
      connections:[{ id:'line-regression', from:'line-from', to:'line-to', type:'related' }]
    });
    app.panX=0; app.panY=0; app.zoom=1; app.switchTarget('target-connection-layer'); app.applyCanvasTransform(); app.renderConnections();
  })()`);
  await delay(120);
  const connectionLayering = await cdp.evaluate(`(() => {
    const svg=document.getElementById('canvasConnections'); const canvas=document.getElementById('canvas');
    const line=svg.querySelector('[data-from-card="line-from"]');
    const from=document.getElementById('card-line-from').getBoundingClientRect();
    const to=document.getElementById('card-line-to').getBoundingClientRect();
    const blocker=document.getElementById('card-line-blocker').getBoundingClientRect();
    const svgRect=svg.getBoundingClientRect();
    const x1=Number(line.getAttribute('x1'))+svgRect.left; const x2=Number(line.getAttribute('x2'))+svgRect.left;
    const topAtBlocker=document.elementFromPoint(blocker.left+blocker.width/2, blocker.top+blocker.height/2);
    const exposedLine=document.elementFromPoint((from.right+blocker.left)/2, from.top+from.height/2);
    return {
      svgZ:Number(getComputedStyle(svg).zIndex), canvasZ:Number(getComputedStyle(canvas).zIndex),
      canvasPointer:getComputedStyle(canvas).pointerEvents, cardPointer:getComputedStyle(document.getElementById('card-line-blocker')).pointerEvents,
      sourceEdgeGap:Number(Math.abs(x1-from.right).toFixed(2)), targetEdgeGap:Number(Math.abs(x2-to.left).toFixed(2)),
      blockerOwnsCenter:!!topAtBlocker?.closest('#card-line-blocker'),
      exposedLineClickable:exposedLine?.classList?.contains('connection-line') || false
    };
  })()`);
  if (connectionLayering.svgZ >= connectionLayering.canvasZ || connectionLayering.canvasPointer !== 'none' || connectionLayering.cardPointer !== 'auto' || connectionLayering.sourceEdgeGap > 3 || connectionLayering.targetEdgeGap > 3 || !connectionLayering.blockerOwnsCenter || !connectionLayering.exposedLineClickable) throw new Error(`Connection text occlusion regression: ${JSON.stringify(connectionLayering)}`);
  const exceptions = cdp.events.filter((event) => event.method === "Runtime.exceptionThrown");
  if (exceptions.length) throw new Error(`Browser runtime exceptions: ${exceptions.length}`);
  await cdp.evaluate("app.openProjectOverview()");
  await delay(450);
  const image = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(path.resolve(projectDir, "..", "v9-workbench-regression.png"), Buffer.from(image.data, "base64"));
  console.log(JSON.stringify({ ok: true, ...result, recoverableMerge: true, exceptions: 0 }));
} finally {
  try { await mcp?.close(); } catch {}
  try { cdp?.close(); } catch {}
  server.kill(); edge.kill(); await delay(300);
  await rm(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }).catch(() => {});
}
