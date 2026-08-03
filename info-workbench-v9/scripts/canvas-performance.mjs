import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const cdpPort = 17328;
const pageUrl = process.env.INFO_WORKBENCH_URL || "http://127.0.0.1:17321/";
const profileDir = await mkdtemp(path.join(os.tmpdir(), "info-workbench-pan-perf-"));
const edge = spawn(edgePath, [
  "--headless=new",
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profileDir}`,
  "--window-size=2880,2000",
  "--force-device-scale-factor=2",
  "--no-first-run",
  "--disable-extensions",
  "about:blank"
], { stdio: "ignore", windowsHide: true });

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
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); }
  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (message) => {
      const packet = JSON.parse(message.data);
      if (!packet.id) return;
      const pending = this.pending.get(packet.id);
      if (!pending) return;
      this.pending.delete(packet.id);
      packet.error ? pending.reject(new Error(packet.error.message)) : pending.resolve(packet.result);
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const value = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (value.exceptionDetails) throw new Error(value.exceptionDetails.text);
    return value.result.value;
  }
  close() { this.socket.close(); }
}

let cdp;
try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).ok, "Edge CDP");
  const target = await (await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: "PUT" })).json();
  cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: pageUrl });
  await waitFor(() => cdp.evaluate("typeof app !== 'undefined' && document.readyState === 'complete'"), "workbench");
  await delay(500);

  const start = await cdp.evaluate(`(() => {
    const points = [];
    for (let y = 180; y <= 760; y += 80) for (let x = 420; x <= 1260; x += 80) {
      const el = document.elementFromPoint(x, y);
      if (el && (el.id === 'canvas' || el.id === 'canvasWrapper')) points.push({ x, y });
    }
    const point = points.at(-1);
    if (!point) throw new Error('No blank canvas point found');
    const target = app.getCurrentTarget();
    if (target?.cards?.length >= 2 && !target.connections?.length) {
      target.connections = [{ id: 'perf-connection', from: target.cards[0].id, to: target.cards[1].id, type: 'related' }];
      app.renderConnections();
    }
    const canvas = document.getElementById('canvas');
    const originalView = { scale: app.scale, panX: app.panX, panY: app.panY, transition: canvas.style.transition };
    canvas.style.transition = 'none';
    app.scale = 0.5; app.panX = 0; app.panY = 0; app.applyCanvasTransform();
    const beforeLeft = canvas.getBoundingClientRect().left;
    app.panX = 100; app.applyCanvasTransform();
    const panTrackingPxAt50Percent = canvas.getBoundingClientRect().left - beforeLeft;
    Object.assign(app, originalView); app.applyCanvasTransform(); canvas.style.transition = originalView.transition;
    window.__panPerf = { intervals: [], moves: 0, renders: 0, running: true, panTrackingPxAt50Percent };
    const originalRender = app.renderConnections.bind(app);
    app.renderConnections = (...args) => { window.__panPerf.renders++; return originalRender(...args); };
    document.addEventListener('mousemove', () => window.__panPerf.moves++, true);
    let previous = performance.now();
    const tick = (now) => {
      window.__panPerf.intervals.push(now - previous);
      previous = now;
      if (window.__panPerf.running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return point;
  })()`);

  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: start.x, y: start.y, button: "left", buttons: 1, clickCount: 1 });
  const moveCount = 180;
  for (let index = 1; index <= moveCount; index++) {
    const x = start.x - (index * 360 / moveCount);
    const y = start.y - (index * 220 / moveCount);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1 });
    await delay(4);
  }
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: start.x - 360, y: start.y - 220, button: "left", buttons: 0, clickCount: 1 });
  await delay(200);

  const result = await cdp.evaluate(`(() => {
    window.__panPerf.running = false;
    const samples = window.__panPerf.intervals.slice(2);
    const sorted = [...samples].sort((a, b) => a - b);
    const percentile = (value) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * value))] || 0;
    const line = document.querySelector('#canvasConnections line');
    let connectionEndpointErrorPx = 0;
    if (line) {
      const target = app.getCurrentTarget();
      const connection = target.connections[0];
      const from = document.getElementById('card-' + connection.from).getBoundingClientRect();
      const svg = document.getElementById('canvasConnections').getBoundingClientRect();
      const expectedX = from.left + from.width / 2 - svg.left;
      const expectedY = from.top + from.height / 2 - svg.top;
      connectionEndpointErrorPx = Math.hypot(Number(line.getAttribute('x1')) - expectedX, Number(line.getAttribute('y1')) - expectedY);
    }
    const navigator = document.getElementById('cardNavigator');
    const selectedCount = document.getElementById('selectedCount');
    const batchActions = document.getElementById('batchActions');
    navigator.classList.add('collapsed');
    selectedCount.textContent = '已选 2 张卡片';
    selectedCount.style.display = 'block';
    batchActions.classList.add('show');
    const navRect = navigator.getBoundingClientRect();
    const countRect = selectedCount.getBoundingClientRect();
    const batchRect = batchActions.getBoundingClientRect();
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const canvas = document.getElementById('canvas');
    const wrapper = document.getElementById('canvasWrapper');
    const canvasAreaRatio = (canvas.offsetWidth * canvas.offsetHeight) / Math.max(1, wrapper.clientWidth * wrapper.clientHeight);
    const gridUsesCompositorLayer = !!document.getElementById('canvasGrid') && getComputedStyle(wrapper).backgroundImage === 'none';
    const firstCard = document.querySelector('.card');
    const syncSummarySupported = typeof app.summarizeAgentSync === 'function';
    let syncSummaryCorrect = false;
    if (syncSummarySupported) {
      const summary = app.summarizeAgentSync(
        { targets: [{ id: 'ux-target', cards: [{ id: 'same', mcpKey: 'same', data: 'old', updatedAt: 1 }] }] },
        { targets: [{ id: 'ux-target', name: 'UX', cards: [
          { id: 'same', mcpKey: 'same', data: 'new', updatedAt: 2, mcpSource: { agent: 'test', tool: 'httpx' } },
          { id: 'new', mcpKey: 'new', data: 'asset', updatedAt: 2, mcpSource: { agent: 'test', tool: 'httpx' } }
        ] }] },
        99
      );
      syncSummaryCorrect = summary?.added === 1 && summary?.updated === 1 && summary?.cards?.length === 2;
    }
    const receipt = document.getElementById('agentResultReceipt');
    const selectionBarUnified = selectedCount.parentElement === batchActions;
    const compactCardTools = !!firstCard && firstCard.querySelectorAll('.card-tools > .card-tool-btn, .card-tools > .card-more-wrap').length <= 2 && !!firstCard.querySelector('.card-more-trigger');
    const batchBuilderSupported = typeof app.buildAgentBatches === 'function';
    const syntheticBatches = batchBuilderSupported ? app.buildAgentBatches({ targets: [{ id: 'batch-target', name: 'Batch', cards: [
      { id: 'batch-a', title: 'A', mcpSource: { agent: 'codex', tool: 'httpx', run_id: 'run-one', scanned_at: '2026-08-02T01:00:00.000Z' } },
      { id: 'batch-b', title: 'B', mcpSource: { agent: 'codex', tool: 'httpx', run_id: 'run-one', scanned_at: '2026-08-02T01:00:00.000Z' } }
    ] }] }, []) : [];
    const agentBatchCorrect = syntheticBatches.length === 1 && syntheticBatches[0].cardIds.length === 2 && syntheticBatches[0].runId === 'run-one';
    const filterPredicateCorrect = typeof app.cardMatchesNavigatorFilters === 'function' && app.cardMatchesNavigatorFilters(
      { title: 'Admin API', data: '/admin', status: 'doing', risk: 'high', tags: ['api'], mcpSource: { tool: 'httpx' } },
      { query: 'admin', status: 'doing', risk: 'high', tag: 'api', source: 'httpx' }
    );
    const performancePolicyCorrect = typeof app.shouldUsePerformanceMode === 'function' && app.shouldUsePerformanceMode(120, 'auto') && !app.shouldUsePerformanceMode(20, 'auto');
    let performanceCullingCorrect = false;
    if (typeof app.updatePerformanceCulling === 'function') {
      const target = app.getCurrentTarget();
      const fake = { id: 'perf-offscreen-card', title: 'Offscreen', x: 100000, y: 100000, width: 400, height: 300, status: 'todo', risk: 'info', tags: [] };
      const element = document.createElement('div');
      element.id = 'card-' + fake.id; element.className = 'card';
      document.getElementById('canvas').appendChild(element); target.cards.push(fake);
      const previousActive = app.performanceActive; app.performanceActive = true; app.updatePerformanceCulling();
      performanceCullingCorrect = element.classList.contains('performance-culled');
      target.cards.pop(); element.remove(); app.performanceActive = previousActive; app.updatePerformanceCulling();
    }
    const duplicateGroups = typeof app.getDuplicateGroups === 'function' ? app.getDuplicateGroups({ cards: [
      { id: 'dup-a', title: 'A', data: 'https://example.test/admin/' },
      { id: 'dup-b', title: 'B', data: 'https://example.test/admin' },
      { id: 'unique', title: 'C', data: 'https://example.test/login' }
    ] }) : [];
    const duplicateDetectionCorrect = duplicateGroups.length === 1 && duplicateGroups[0].cards.length === 2;
    const historyCard = { id: 'history-card', title: 'Before', data: 'old', status: 'todo', risk: 'info', tags: [] };
    const historySupported = typeof app.recordCardVersion === 'function';
    if (historySupported) app.recordCardVersion(historyCard, 'test');
    const historyRecordingCorrect = historySupported && historyCard.history?.length === 1 && historyCard.history[0].data === 'old';
    const overview = typeof app.buildProjectOverview === 'function' ? app.buildProjectOverview({ id: 'overview', name: 'Overview', cards: [
      { id: 'o1', status: 'done', risk: 'high', mcpSource: { tool: 'httpx' } },
      { id: 'o2', status: 'todo', risk: 'info' }
    ] }) : null;
    const overviewCorrect = overview?.total === 2 && overview?.done === 1 && overview?.risks?.high === 1 && overview?.agentCards === 1;
    const commandItems = typeof app.getCommandItems === 'function' ? app.getCommandItems() : [];
    const commandPaletteCorrect = commandItems.some(item => item.id === 'overview') && commandItems.some(item => item.id === 'agent-inbox');
    return {
      frames: samples.length,
      moves: window.__panPerf.moves,
      connectionRenders: window.__panPerf.renders,
      panTrackingPxAt50Percent: window.__panPerf.panTrackingPxAt50Percent,
      connectionEndpointErrorPx,
      collapsedNavigatorHeight: navRect.height,
      collapsedOverlapsSelection: overlaps(navRect, countRect),
      collapsedOverlapsBatchActions: overlaps(navRect, batchRect),
      canvasAreaRatio,
      gridUsesCompositorLayer,
      panningClassCleared: !document.body.classList.contains('canvas-panning'),
      selectionBarUnified,
      compactCardTools,
      agentReceiptPresent: !!receipt,
      syncSummaryCorrect,
      autoRevealSupported: typeof app.ensureCardsVisible === 'function',
      agentInboxPresent: !!document.getElementById('agentInboxList'),
      agentBatchCorrect,
      combinedFiltersPresent: !!document.getElementById('navigatorQueryFilter') && !!document.getElementById('navigatorSourceFilter') && !!document.getElementById('navigatorTagFilter'),
      filterPredicateCorrect,
      performanceToolbarPresent: !!document.getElementById('toolbarPerformance'),
      performancePolicyCorrect,
      performanceCullingCorrect,
      duplicateCenterPresent: !!document.getElementById('duplicateCenterModal'),
      duplicateDetectionCorrect,
      duplicateMergeSupported: typeof app.mergeDuplicateGroup === 'function',
      cardHistoryPresent: !!document.getElementById('cardHistoryModal'),
      historyRecordingCorrect,
      projectOverviewPresent: !!document.getElementById('projectOverviewModal'),
      overviewCorrect,
      commandPalettePresent: !!document.getElementById('commandPalette'),
      commandPaletteCorrect,
      averageFrameMs: samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length),
      p95FrameMs: percentile(0.95),
      maxFrameMs: Math.max(0, ...samples),
      framesOver20Ms: samples.filter((value) => value > 20).length,
      framesOver34Ms: samples.filter((value) => value > 34).length
    };
  })()`);
  if (Math.abs(result.panTrackingPxAt50Percent - 100) > 0.5) throw new Error(`Pan tracking regression: ${result.panTrackingPxAt50Percent}px`);
  if (result.connectionRenders > 8) throw new Error(`Too many connection renders while panning: ${result.connectionRenders}`);
  if (result.connectionEndpointErrorPx > 1) throw new Error(`Connection endpoint drifted by ${result.connectionEndpointErrorPx}px`);
  if (result.collapsedOverlapsSelection || result.collapsedOverlapsBatchActions) {
    throw new Error(`Collapsed navigator blocks selection controls: ${JSON.stringify(result)}`);
  }
  if (result.canvasAreaRatio > 1.1 || !result.gridUsesCompositorLayer) {
    throw new Error(`Canvas compositor regression: ${JSON.stringify(result)}`);
  }
  if (!result.panningClassCleared) throw new Error('Canvas panning performance state was not cleared');
  if (!result.selectionBarUnified || !result.compactCardTools || !result.agentReceiptPresent || !result.syncSummaryCorrect || !result.autoRevealSupported) {
    throw new Error(`UX workflow regression: ${JSON.stringify(result)}`);
  }
  if (!result.agentInboxPresent || !result.agentBatchCorrect || !result.combinedFiltersPresent || !result.filterPredicateCorrect || !result.performanceToolbarPresent || !result.performancePolicyCorrect || !result.performanceCullingCorrect) {
    throw new Error(`Advanced workflow regression: ${JSON.stringify(result)}`);
  }
  if (!result.duplicateCenterPresent || !result.duplicateDetectionCorrect || !result.duplicateMergeSupported || !result.cardHistoryPresent || !result.historyRecordingCorrect || !result.projectOverviewPresent || !result.overviewCorrect || !result.commandPalettePresent || !result.commandPaletteCorrect) {
    throw new Error(`Data governance regression: ${JSON.stringify(result)}`);
  }
  console.log(JSON.stringify(result));
} finally {
  try { cdp?.close(); } catch {}
  edge.kill();
  await delay(250);
  await rm(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }).catch(() => {});
}
