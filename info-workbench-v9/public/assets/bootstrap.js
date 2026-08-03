async function boot() {
  const response = await fetch('/api/workspace', { cache: 'no-store' });
  if (!response.ok) throw new Error(`SQLite workspace unavailable (HTTP ${response.status})`);
  const state = await response.json();
  window.__V9_REVISION__ = Number(state.revision || 0);
  if (state.exists) {
    localStorage.setItem('infoCollectorData', JSON.stringify(state.data));
    localStorage.setItem('infoCollectorSettings', JSON.stringify(state.settings || {}));
    localStorage.setItem('infoWorkbenchV9Migrated', 'sqlite');
  } else if (localStorage.getItem('infoCollectorData')) {
    localStorage.setItem('infoWorkbenchV9Migrated', 'pending-v8-import');
  }
  await import('/assets/app.js');
}

boot().catch((error) => {
  document.body.innerHTML = '';
  const panel = document.createElement('main');
  panel.style.cssText = 'max-width:680px;margin:12vh auto;padding:32px;border:1px solid #dfe5e2;border-radius:16px;font-family:system-ui;background:#fff;box-shadow:0 20px 60px #193a2d20';
  const title = document.createElement('h1');
  title.textContent = 'v9 本地数据库未就绪';
  const detail = document.createElement('p');
  detail.textContent = error instanceof Error ? error.message : String(error);
  const hint = document.createElement('p');
  hint.textContent = '请关闭此页面，然后重新双击“启动-v9本地工作台.cmd”。';
  panel.append(title, detail, hint);
  document.body.appendChild(panel);
});
