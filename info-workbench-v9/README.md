# 信息收集工作台 v9

v9 是前后端分离的纯本地工作台：浏览器负责画布交互，Node.js 服务负责 API、静态资源和 WebSocket，SQLite 是唯一权威数据源，stdio MCP 与浏览器共享同一数据库。

Markdown 与代码高亮依赖已随项目本地化，工作台运行不依赖 CDN 或公网。

## 架构

```text
外部扫描工具 → Agent → stdio MCP ─┐
                                  ├→ workbench.db
浏览器 HTML/CSS/JS → 本地 HTTP API ┘       ↓
                                  WebSocket revision 通知
```

MCP 和本地服务不包含、不下载、也不执行扫描器。

## 使用

双击根目录的 `启动-v9本地工作台.cmd`，浏览器会打开 `http://127.0.0.1:17321/`。首次启动时，同一浏览器里的 v8 localStorage 会自动写入 SQLite；v5～v8 文件不会被修改。

数据库位于 `data/workbench.db`。停止服务请双击 `停止-v9本地工作台.cmd`。

## 目录

- `public/index.html`：页面结构。
- `public/assets/app.css`：完整界面样式。
- `public/assets/app.js`：画布和交互逻辑。
- `public/assets/bootstrap.js`：SQLite 启动同步和 v8 迁移。
- `src/server.ts`：本地 API、静态资源、WebSocket。
- `src/db.ts`：SQLite schema、事务、revision 和查询。
- `src/mcp.ts`：Agent MCP 工具。
- `src/workspace-ops.ts`：工作区领域操作，供 MCP 和测试复用。

## MCP 工具

- `collector_list_targets`
- `collector_get_target`
- `collector_create_target`
- `collector_upsert_cards`
- `collector_add_connection`
- `collector_search_cards`
- `collector_list_scan_runs`

所有写操作都要求稳定的 `operation_id`。MCP 直接事务写 SQLite，因此浏览器关闭时也能保存扫描结果。

## 安全边界

- 只监听 `127.0.0.1`。
- 校验 Host 和 Origin，阻止局域网/DNS rebinding 访问。
- API 请求体限制为 25 MB，WebSocket payload 限制为 1 MB。
- 静态资源路径经过目录边界校验。
- MCP 没有 shell、child_process、URL 请求或扫描器执行入口。
