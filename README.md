# 信息收集工作台 v9

本地 SQLite 信息收集与资产关系可视化工作台，支持浏览器界面、Agent/MCP 写入、扫描批次整理、搜索、去重、备份和项目报告。

工作台本身不执行扫描器或系统命令，仅用于合法授权范围内的信息整理、安全研究和资产管理。

## 快速开始

需要 Windows 10/11 和 Node.js 24 或更高版本。

```powershell
cd info-workbench-v9
npm ci
npm run build
npm test
```

也可使用根目录的 `启动-v9本地工作台.cmd` 或 PowerShell 启动脚本。

## 文档

- [项目说明](项目说明.md)
- [使用指南](使用指南.md)
- [注意事项](注意事项.md)
- [应用内部说明](info-workbench-v9/README.md)

## 数据与隐私

`data/`、SQLite 数据库、日志和备份默认不纳入 Git。发布或提交前请仍检查是否包含 IP、域名、路径或其他敏感信息。
