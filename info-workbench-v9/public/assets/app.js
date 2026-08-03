// 常量定义
        const COMMON_ICONS = ['🏢','🌐','🔍','🔌','👆','📁','⚡','☁️','🔗','📱','📦','💻','💾','🐛','🕵️','📝','🎯','🔐','📊','⚙️'];

        const CARD_TEMPLATES = [
            { id: 'company', icon: '🏢', title: '企业信息', desc: '公司架构、股权关系、子公司' },
            { id: 'domain', icon: '🌐', title: '主域名', desc: 'Whois、ICP备案、DNS记录' },
            { id: 'subdomain', icon: '🔍', title: '子域名', desc: '子域名发现、资产梳理' },
            { id: 'port', icon: '🔌', title: '端口服务', desc: '开放端口、服务版本' },
            { id: 'fingerprint', icon: '👆', title: '指纹识别', desc: 'Web指纹、中间件、框架' },
            { id: 'directory', icon: '📁', title: '目录结构', desc: '敏感目录、文件泄露' },
            { id: 'vuln', icon: '⚡', title: '漏洞信息', desc: 'CVE、已知漏洞' },
            { id: 'cdn', icon: '☁️', title: 'CDN信息', desc: 'CDN厂商、真实IP' },
            { id: 'link', icon: '🔗', title: '链接收集', desc: '外链、内链、接口' },
            { id: 'mobile', icon: '📱', title: '移动应用', desc: 'APP信息、API接口' },
            { id: 'api', icon: '📦', title: 'API接口', desc: 'RESTful、GraphQL' },
            { id: 'source', icon: '💻', title: '源码信息', desc: 'Github、代码仓库' },
            { id: 'database', icon: '💾', title: '数据库', desc: '数据库类型、版本' },
            { id: 'weakness', icon: '🐛', title: '弱点分析', desc: '配置缺陷、逻辑漏洞' },
            { id: 'social', icon: '🕵️', title: '社工信息', desc: '人员、邮箱、社交账号' },
            { id: 'notes', icon: '📝', title: '备注', desc: '其他信息、待办事项' }
        ];

        // 每种卡片模板的填写格式建议（用于输入框占位提示，避免与卡片描述重复）
        const FIELD_PLACEHOLDERS = {
            company: '格式示例：\n公司全称 | 统一社会信用代码\n股权结构 / 母公司 / 子公司列表\n关联企业（天眼查/企查查关联方）',
            domain: '格式示例：\nWhois: 注册商 / 注册人 / 注册时间\nICP备案: 备案号 / 主体单位\nDNS记录: A / MX / TXT / NS',
            subdomain: '格式示例：\nsub.example.com | 1.2.3.4 | 200 存活\nsub2.example.com | CNAME → xxx.cdn.com',
            port: '格式示例：\n1.2.3.4:80    http    nginx 1.20\n1.2.3.4:3306  mysql   5.7.30',
            fingerprint: '格式示例：\n中间件: Nginx / Tomcat / IIS\n框架: ThinkPHP / Spring / Django\nCMS: WordPress 6.x',
            directory: '格式示例：\n/admin/    后台入口\n/.git/     Git 泄露\n/backup/   备份文件泄露',
            vuln: '格式示例：\nCVE-2024-xxxx | 组件名 v版本 | 未验证/已验证\n漏洞类型 | 影响范围 | 参考链接',
            cdn: '格式示例：\nCDN厂商: 阿里云/腾讯云/Cloudflare\n真实IP绕过方式: 邮件头/历史DNS/多地ping',
            link: '格式示例：\nhttps://example.com/api/user  接口\nhttps://example.com/login     登录页',
            mobile: '格式示例：\nAPP名称 / 包名 / 加固方式\nAPI域名 / 抓包方式 / Token机制',
            api: '格式示例：\nGET  /api/v1/user/{id}   需鉴权\nPOST /api/v1/login       未鉴权 ⚠',
            source: '格式示例：\nGithub: org/repo（.git泄露 / 敏感key）\ngitee / gitlab 仓库地址',
            database: '格式示例：\n类型: MySQL / Redis / MongoDB\n版本 / 端口 / 是否可未授权访问',
            weakness: '格式示例：\n弱口令: admin/admin123\n越权: 水平/垂直越权点\n逻辑漏洞: 短信轰炸/支付逻辑',
            social: '格式示例：\n姓名 | 职位 | 邮箱 | 社交账号\n钓鱼可用信息来源',
            notes: '记录待办事项、临时想法或其他补充信息...'
        };

        // 卡片之间连线的语义类型
        const CONNECTION_TYPES = [
            { id: 'related',    label: '关联',   color: '#409eff' },
            { id: 'belongs',    label: '属于',   color: '#67c23a' },
            { id: 'discovered', label: '发现自', color: '#e6a23c' },
            { id: 'merged',     label: '合并自', color: '#909399' },
            { id: 'attack',     label: '攻击路径', color: '#f56c6c' }
        ];

        const SRC_SPECIALTY_TEMPLATES = [
            {
                id: 'src-scope', icon: '🧭', title: '01 · 授权范围与边界',
                desc: '先确认能收集什么、能验证到什么程度', tags: ['SRC', '范围'],
                content: '## 授权信息\n- 项目 / 授权编号：\n- 授权主体：\n- 允许的域名、IP、应用：\n- 排除项：\n- 测试时间窗口：\n- 允许方式与频率：\n- 紧急联系人：'
            },
            {
                id: 'src-org', icon: '🏢', title: '02 · 主体与组织关系',
                desc: '公司、子公司、控股关系和资产归属证据', tags: ['SRC', '主体'],
                content: '## 主体清单\n| 主体 | 关系 | 持股 / 控制情况 | 是否在授权范围 | 归属证据 |\n| --- | --- | --- | --- | --- |\n|  |  |  | 待确认 |  |\n\n## 待核实\n- 子公司 / 分支机构：\n- 对外品牌与产品：'
            },
            {
                id: 'src-domain', icon: '🌐', title: '03 · 主域名与备案',
                desc: 'WHOIS、ICP备案、主办单位和根域名归属', tags: ['SRC', '域名'],
                content: '## 根域名清单\n| 根域名 | ICP 主体 | WHOIS / 注册商 | 有效期 | 归属结论 |\n| --- | --- | --- | --- | --- |\n|  |  |  |  | 待确认 |\n\n## 关联线索\n- 注册邮箱 / 电话（脱敏）：\n- 同主体备案域名：'
            },
            {
                id: 'src-dns', icon: '🛰️', title: '04 · DNS、证书与历史解析',
                desc: 'DNS 记录、CT 日志、历史解析和证书关联', tags: ['SRC', 'DNS'],
                content: '## DNS / 证书记录\n| 类型 | 名称 | 值 / 指向 | 来源 | 首次 / 最近发现 |\n| --- | --- | --- | --- | --- |\n|  |  |  |  |  |\n\n## 判断\n- CDN / 云厂商：\n- 历史解析变化：\n- 需人工确认的真实源站线索：'
            },
            {
                id: 'src-subdomain', icon: '🔎', title: '05 · 子域名与关联资产',
                desc: '合并被动来源、解析结果、同 IP 与历史资产', tags: ['SRC', '子域名'],
                content: '## 资产清单\n| 主机名 | IP / CNAME | HTTP 状态 | 标题 | 来源 | 存活 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  | 待确认 |\n\n## 去重与归属\n- 通配符 DNS：\n- 同 IP / 旁站：\n- 已下线但值得回溯的资产：'
            },
            {
                id: 'src-network', icon: '🔌', title: '06 · IP、端口与服务',
                desc: '按授权范围记录存活、端口、服务与版本', tags: ['SRC', '网络'],
                content: '## 网络资产\n| IP | 端口 | 协议 / 服务 | 版本 | 暴露范围 | 来源时间 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 复核\n- 归属是否确认：\n- 非标准端口：\n- 需低频复测项：'
            },
            {
                id: 'src-stack', icon: '🧬', title: '07 · 指纹、防护与云资产',
                desc: '技术栈、WAF、CDN、云原生组件与误报判断', tags: ['SRC', '指纹'],
                content: '## 指纹矩阵\n| 资产 | Web / 框架 | 中间件 | WAF / CDN | 云组件 | 置信度 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 判断依据\n- 响应头 / 页面特征：\n- 蜜罐或伪装迹象：\n- 版本待验证：'
            },
            {
                id: 'src-web', icon: '🗂️', title: '08 · Web 入口与敏感路径',
                desc: '登录、后台、目录、敏感文件和历史 URL', tags: ['SRC', 'Web'],
                content: '## Web 入口\n| URL | 类型 | 状态 | 鉴权 | 来源 | 备注 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 重点检查\n- 登录 / 管理入口：\n- 公开文档与备份线索：\n- 历史 URL / 下线功能：'
            },
            {
                id: 'src-api', icon: '🧩', title: '09 · JS、API 与前端路由',
                desc: '接口、参数、鉴权要求、前端路由和数据流', tags: ['SRC', 'API'],
                content: '## 接口清单\n| 方法 | 路径 | 来源文件 | 身份要求 | 关键参数 | 响应摘要 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 前端结构\n- API Base URL：\n- Token / Cookie 位置：\n- 隐藏路由与角色入口：'
            },
            {
                id: 'src-mobile', icon: '📱', title: '10 · APP、小程序与公众号',
                desc: '客户端标识、版本、接口域名和跨端关系', tags: ['SRC', '移动端'],
                content: '## 客户端资产\n| 名称 | 类型 | 包名 / AppID | 版本 | API 域名 | 归属 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 关联关系\n- Web / APP / 小程序共用认证：\n- 更新与下载来源：\n- 客户端独有接口：'
            },
            {
                id: 'src-supply', icon: '🔗', title: '11 · 供应链与第三方',
                desc: '供应商、通用产品、外包系统和信任边界', tags: ['SRC', '供应链'],
                content: '## 第三方关系\n| 厂商 / 服务 | 关联资产 | 关系证据 | 数据 / 权限边界 | 是否在范围 |\n| --- | --- | --- | --- | --- |\n|  |  |  |  | 待确认 |\n\n## 风险线索\n- 通用产品 / 同源模板：\n- 回调、SSO、API 信任：\n- 需先向项目方确认的资产：'
            },
            {
                id: 'src-priority', icon: '🎯', title: '12 · 重点资产与后续计划',
                desc: '把收集结果转成优先级、待验证项和持续监控', tags: ['SRC', '计划'],
                content: '## 优先级队列\n| 优先级 | 资产 / 线索 | 判断依据 | 下一步 | 负责人 | 状态 |\n| --- | --- | --- | --- | --- | --- |\n| P0 |  |  |  |  | 待处理 |\n\n## 交接与监控\n- 新增资产监控：\n- 证书 / DNS / 代码仓库变化：\n- 已排除误报：\n- 数据来源与采集时间：'
            }
        ];

        const EDUSRC_SPECIALTY_TEMPLATES = [
            {
                id: 'edu-scope', icon: '🏫', title: '01 · 学校主体与收录边界',
                desc: '确认学校、二级单位、厂商系统及平台收录范围', tags: ['EDUSRC', '范围'],
                content: '## 项目边界\n- 学校 / 单位名称：\n- 平台与项目编号：\n- 收录范围来源：\n- 允许测试的域名、IP、APP / 小程序：\n- 明确排除项：\n- 测试时间与频率限制：\n- 敏感数据处理要求：'
            },
            {
                id: 'edu-asset', icon: '🗺️', title: '02 · 教育资产测绘',
                desc: '按学校、地区、教育网和系统类型整理资产', tags: ['EDUSRC', '测绘'],
                content: '## 资产测绘\n| 资产 | 系统类型 | IP / 端口 | 标题 / 指纹 | 来源 | 归属结论 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  | 待确认 |\n\n## 高价值系统\n- 教务 / 学工 / 招生 / 证书：\n- VPN / 邮箱 / 统一认证：\n- APP / 小程序 / 物联网平台：'
            },
            {
                id: 'edu-domain', icon: '🌐', title: '03 · 域名、ICP 与子域',
                desc: '学校主体、备案、证书、子域和厂商域名关系', tags: ['EDUSRC', '域名'],
                content: '## 域名归属\n| 域名 / 子域 | ICP 主体 | IP / CNAME | 证书 / DNS 证据 | 厂商 | 状态 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 待确认\n- 二级学院 / 附属单位：\n- 厂商托管域名：\n- 历史解析或下线系统：'
            },
            {
                id: 'edu-entry', icon: '🚪', title: '04 · 系统入口与角色地图',
                desc: '统一认证、教务、学工、招生及多端入口', tags: ['EDUSRC', '入口'],
                content: '## 入口矩阵\n| 系统 | URL / 客户端 | 登录方式 | 角色 | 认证域 | 备注 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  |  |\n\n## 角色关系\n- 学生 / 家长 / 教师 / 辅导员 / 管理员：\n- Web / APP / 小程序端：\n- 跨系统 SSO 关系：'
            },
            {
                id: 'edu-identities', icon: '👥', title: '05 · 授权测试身份',
                desc: '只记录获准使用的 A/B 测试账号与角色差异', tags: ['EDUSRC', '身份'],
                content: '## 测试身份（禁止记录明文密码）\n| 代号 | 角色 | 所属系统 | 数据范围 | 授权来源 |\n| --- | --- | --- | --- | --- |\n| A |  |  |  |  |\n| B |  |  |  |  |\n\n## 标识符规则\n- 学号 / 工号 / 用户 ID（脱敏）：\n- 可预测性与跨系统复用：\n- 测试数据销毁要求：'
            },
            {
                id: 'edu-auth', icon: '🔐', title: '06 · 统一认证与找回流程',
                desc: '记录登录、绑定、注册、找回密码和状态校验', tags: ['EDUSRC', '认证'],
                content: '## 认证流程\n| 流程 | 入口 | 输入字段 | 服务端校验 | 返回差异 | 结论 |\n| --- | --- | --- | --- | --- | --- |\n| 登录 |  |  |  |  | 待验证 |\n| 找回密码 |  |  |  |  | 待验证 |\n| 注册 / 绑定 |  |  |  |  | 待验证 |\n\n- 速率限制 / 验证码：\n- 账号存在性泄露：'
            },
            {
                id: 'edu-api', icon: '🧩', title: '07 · JS、API 与文档面',
                desc: '整理接口来源、鉴权、参数及文档暴露情况', tags: ['EDUSRC', 'API'],
                content: '## 接口清单\n| 方法 | 路径 | 来源 | 所需身份 | 身份 / 对象参数 | 返回摘要 |\n| --- | --- | --- | --- | --- | --- |\n|  |  | JS / 文档 / 抓包 |  |  |  |\n\n## 接口面\n- API 文档 / 调试入口：\n- Base URL / 网关：\n- 未登录与低权限响应差异：'
            },
            {
                id: 'edu-idor', icon: '↔️', title: '08 · 越权验证矩阵',
                desc: '使用授权 A/B 身份验证对象级和功能级权限', tags: ['EDUSRC', '越权'],
                content: '## A/B 验证矩阵\n| 接口 / 功能 | A 自有对象 | B 自有对象 | A 访问 B | 低角色访问高角色 | 结论 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  | 待验证 |\n\n## 关键记录\n- 对象标识符（脱敏）：\n- 读取 / 修改 / 删除分别验证：\n- 是否存在跨系统或跨端复用：'
            },
            {
                id: 'edu-sensitive', icon: '🛡️', title: '09 · 敏感数据与返回包',
                desc: '最小化记录超量返回、未授权数据和隐私字段', tags: ['EDUSRC', '数据'],
                content: '## 数据暴露记录\n| 接口 | 身份 | 字段类型 | 预期范围 | 实际范围 | 是否已脱敏 |\n| --- | --- | --- | --- | --- | --- |\n|  |  |  |  |  | 是 |\n\n## 安全要求\n- 仅保留证明漏洞所需的最少样本\n- 不批量下载真实学生 / 教职工数据\n- 截图与响应中的身份信息已打码：'
            },
            {
                id: 'edu-validation', icon: '🧪', title: '10 · 专项验证清单',
                desc: '认证、越权、信息泄露、注入、上传与 XSS 复核', tags: ['EDUSRC', '验证'],
                content: '## 授权内验证\n- [ ] 认证与账号生命周期\n- [ ] 水平 / 垂直越权\n- [ ] 未授权接口与超量返回\n- [ ] 输入处理与注入风险\n- [ ] 文件上传与内容解析\n- [ ] 存储型 / 反射型 XSS\n- [ ] 配置、文档与源码泄露\n\n## 约束\n- 未执行破坏性操作：\n- 未影响真实用户：'
            },
            {
                id: 'edu-chain', icon: '⛓️', title: '11 · 跨端与攻击链',
                desc: '把每一步输入输出串成可复核的信任边界链路', tags: ['EDUSRC', '链路'],
                content: '## 链路图\n| 步骤 | 起点身份 / 资产 | 操作 | 产出 | 下一步输入 | 信任边界 |\n| --- | --- | --- | --- | --- | --- |\n| 1 |  |  |  |  |  |\n\n## 影响控制\n- 链路成立所需的最小步骤：\n- 未继续扩大的原因：\n- Web / APP / 小程序 Token 隔离结论：'
            },
            {
                id: 'edu-report', icon: '📋', title: '12 · 证据、影响与提交',
                desc: '形成可交付、可复现、已脱敏的 EDUSRC 记录', tags: ['EDUSRC', '报告'],
                content: '## 漏洞记录\n- 标题：\n- 受影响资产：\n- 前置身份：\n- 漏洞类型与风险：\n- 最小复现步骤：\n- 实际影响（不夸大）：\n- 证据文件 / 时间：\n- 修复建议：\n- 数据清理情况：\n- 平台提交状态：'
            }
        ];

        const DEFAULT_GROUPS = [
            {
                id: 'src-specialty',
                name: 'SRC 信息收集专项',
                description: '授权边界 → 资产归属 → 攻击面 → 优先级与交接',
                templates: SRC_SPECIALTY_TEMPLATES
            },
            {
                id: 'edusrc-specialty',
                name: 'EDUSRC 专项',
                description: '学校资产 → 身份与接口 → 权限矩阵 → 证据提交',
                templates: EDUSRC_SPECIALTY_TEMPLATES
            }
        ];

        const cloneDefaultGroups = () => DEFAULT_GROUPS.map(group => ({
            ...group,
            templates: group.templates.map(template => ({ ...template, tags: [...(template.tags || [])] }))
        }));

        // 应用主类
        class InfoCollectorApp {
            constructor() {
                this.data = {
                    targets: [],
                    cardGroups: cloneDefaultGroups(),
                    customGroups: [],
                    trash: [],
                    currentTargetId: null
                };

                // 操作历史系统
                this.history = {
                    past: [],
                    future: [],
                    maxSize: 50
                };

                this.scale = 1;
                this.panX = 0;
                this.panY = 0;
                this.selectedIcon = COMMON_ICONS[0];
                this.dragState = null;
                this.resizeState = null;
                this.canvasDragState = null;
                this.selectionBoxState = null;
                this.selectedCards = new Set();
                this.alignGuides = [];
                this.connections = []; // 卡片连线
                this.connectMode = false; // 连线模式
                this.connectSourceCard = null; // 连线源卡片
                this.connectionDragState = null;
                this.navigatorStatus = 'all';
                this.navigatorRisk = 'all';
                this.navigatorQuery = '';
                this.navigatorSource = 'all';
                this.navigatorTag = 'all';
                this.currentMetaCardId = null;
                this.currentHistoryCardId = null;
                this.editingConnectionId = null;
                this.agentSocket = null;
                this.agentSyncing = false;
                this.agentActivity = [];
                this._agentRegistryTimer = null;
                this._lastAgentReceipt = null;
                this._agentReceiptTimer = null;
                this.agentRuns = [];
                this.reviewedAgentBatches = new Set();
                try {
                    this.reviewedAgentBatches = new Set(JSON.parse(localStorage.getItem('infoWorkbenchReviewedAgentBatches') || '[]'));
                } catch (_) {}
                this._serverSaveChain = Promise.resolve();
                this._cardHistoryThrottle = new Map();
                this.commandPaletteIndex = 0;
                this.visibleCommandItems = [];
                this._localDirty = false;
                this.serverRevision = Number(window.__V9_REVISION__ || 0);

                // 设置
                this.settings = {
                    darkMode: false,
                    fontSize: 14,
                    showGrid: true,
                    showMinimap: false,
                    autoSave: true,
                    confirmDelete: true,
                    showAlignGuides: true,
                    defaultWidth: 400,
                    defaultHeight: 300,
                    navigatorCollapsed: false,
                    canvasLocked: false,
                    performanceMode: 'auto'
                };

                this.init();
            }

            init() {
                this.loadData();
                this.loadSettings();
                this.renderTabs();
                this.renderIconPicker();
                this.renderCardGroups();
                this.renderTemplates();
                this.setupEventListeners();
                this.setupKeyboardShortcuts();
                this.populateConnectionTypes();

                if (this.data.targets.length === 0) {
                    // 首次打开或数据为空时，直接自动创建一个默认目标
                    // 不再弹窗要求输入名称——避免用户跳过/取消弹窗导致目标未创建、
                    // 画布渲染函数从未被调用（表现为标签栏和画布都空白）的问题
                    const target = {
                        id: 'target-' + Date.now(),
                        name: '未命名目标',
                        cards: []
                    };
                    this.data.targets.push(target);
                    this.renderTabs();
                    this.switchTarget(target.id);
                    this.saveData();
                } else {
                    this.switchTarget(this.data.targets[0].id);
                }

                if (this.settings.autoSave) {
                    this.updateSaveState('saved', 'SQLite 自动保存');
                } else {
                    this.updateSaveState('warning', '自动保存已关闭');
                }
                this.applyV7Settings();
                this.updateStorageEstimate();
                this.updateSnapshotStatus();
                this.setupAgentBridge();
                this.applyPerformanceMode();
            }

            // 数据持久化
            loadData() {
                try {
                    const saved = localStorage.getItem('infoCollectorData');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        this.data = { ...this.data, ...parsed };
                        // 预制组合属于应用版本，不沿用旧数据中的过时默认组；用户组合单独保存在 customGroups。
                        this.data.cardGroups = cloneDefaultGroups();
                        if (!this.data.customGroups) {
                            this.data.customGroups = [];
                        }
                        if (!Array.isArray(this.data.trash)) this.data.trash = [];
                        this.data.targets = Array.isArray(this.data.targets) ? this.data.targets : [];
                        this.data.targets.forEach(target => {
                            target.cards = Array.isArray(target.cards) ? target.cards : [];
                            target.connections = Array.isArray(target.connections) ? target.connections : [];
                            target.cards.forEach(card => {
                                if (!Array.isArray(card.tags)) card.tags = [];
                                if (!['critical','high','medium','low','info'].includes(card.risk)) card.risk = 'info';
                            });
                        });
                    }
                } catch (e) {
                    console.error('加载数据失败:', e);
                }
            }

            saveData() {
                try {
                    if (this.settings.autoSave) {
                        localStorage.setItem('infoCollectorData', JSON.stringify(this.data));
                        this.updateSaveState('saved', '已保存 · ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
                        this.updateStorageEstimate();
                    } else {
                        this.updateSaveState('warning', '自动保存已关闭');
                    }
                } catch (e) {
                    console.error('保存数据失败:', e);
                    // 自动保存失败时（比如存储空间已满、隐私模式限制等），
                    // 之前是完全无提示的，用户可能以为数据已保存，实际上丢了。
                    // 这里给一个节流提示（避免每次操作都弹一次）。
                    const now = Date.now();
                    if (!this.lastSaveErrorNotified || now - this.lastSaveErrorNotified > 10000) {
                        this.lastSaveErrorNotified = now;
                        this.showShortcutHint('⚠ 自动保存失败，请尽快手动导出数据备份');
                    }
                    this.updateSaveState('error', '保存失败，请立即备份');
                }
                this.scheduleAgentRegistrySync();
            }

            scheduleDataSave(delay = 350) {
                if (!this.settings.autoSave) return this.updateSaveState('warning', '自动保存已关闭');
                this.updateSaveState('', '正在保存…');
                clearTimeout(this._saveTimer);
                this._saveTimer = setTimeout(() => this.saveData(), delay);
            }

            // 设置管理
            loadSettings() {
                try {
                    const saved = localStorage.getItem('infoCollectorSettings');
                    if (saved) {
                        this.settings = { ...this.settings, ...JSON.parse(saved) };
                        this.applySettings();
                    }
                } catch (e) {
                    console.error('加载设置失败:', e);
                }
            }

            saveSettings() {
                try {
                    localStorage.setItem('infoCollectorSettings', JSON.stringify(this.settings));
                } catch (e) {
                    console.error('保存设置失败:', e);
                }
            }

            applySettings() {
                // 应用暗色主题
                if (this.settings.darkMode) {
                    document.body.classList.add('dark-theme');
                    document.getElementById('darkMode').checked = true;
                }

                // 应用字体大小
                document.body.style.fontSize = this.settings.fontSize + 'px';
                document.getElementById('fontSize').value = this.settings.fontSize;
                document.getElementById('fontSizeValue').textContent = this.settings.fontSize + 'px';

                // 应用网格显示
                const canvasWrapper = document.getElementById('canvasWrapper');
                if (this.settings.showGrid) {
                    canvasWrapper.classList.add('show-grid');
                    document.getElementById('showGrid').checked = true;
                } else {
                    canvasWrapper.classList.remove('show-grid');
                    document.getElementById('showGrid').checked = false;
                }

                // 应用小地图显示
                if (this.settings.showMinimap) {
                    document.getElementById('minimap').classList.add('show');
                    document.getElementById('showMinimap').checked = true;
                }

                // 应用其他设置
                document.getElementById('autoSave').checked = this.settings.autoSave;
                document.getElementById('confirmDelete').checked = this.settings.confirmDelete;
                document.getElementById('showAlignGuides').checked = this.settings.showAlignGuides;
                document.getElementById('defaultWidth').value = this.settings.defaultWidth;
                document.getElementById('defaultHeight').value = this.settings.defaultHeight;
            }

            applyV7Settings() {
                const collapsed = !!this.settings.navigatorCollapsed;
                document.getElementById('cardNavigator')?.classList.toggle('collapsed', collapsed);
                this.updateNavigatorToggle(collapsed);
                const lock = document.getElementById('toolbarLock');
                if (lock) {
                    lock.classList.toggle('active', !!this.settings.canvasLocked);
                    lock.textContent = this.settings.canvasLocked ? '已锁' : '解锁';
                }
                document.getElementById('toolbarMinimap')?.classList.toggle('active', !!this.settings.showMinimap);
            }

            toggleDarkMode() {
                this.settings.darkMode = !this.settings.darkMode;
                document.body.classList.toggle('dark-theme');
                this.saveSettings();
            }

            updateFontSize(value) {
                this.settings.fontSize = parseInt(value);
                document.body.style.fontSize = value + 'px';
                document.getElementById('fontSizeValue').textContent = value + 'px';
                this.saveSettings();
            }

            toggleGrid() {
                this.settings.showGrid = !this.settings.showGrid;
                const canvasWrapper = document.getElementById('canvasWrapper');
                canvasWrapper.classList.toggle('show-grid');
                if (this.settings.showGrid) this.applyCanvasTransform();
                this.saveSettings();
            }

            toggleMinimap() {
                this.settings.showMinimap = !this.settings.showMinimap;
                document.getElementById('minimap').classList.toggle('show');
                if (this.settings.showMinimap) {
                    this.updateMinimap();
                }
                document.getElementById('toolbarMinimap')?.classList.toggle('active', this.settings.showMinimap);
                this.saveSettings();
            }

            toggleConfirmDelete() {
                this.settings.confirmDelete = document.getElementById('confirmDelete').checked;
                this.saveSettings();
            }

            toggleAutoSave() {
                this.settings.autoSave = document.getElementById('autoSave').checked;
                this.saveSettings();
                if (this.settings.autoSave) {
                    this.saveData();
                    this.showShortcutHint('自动保存已开启');
                } else {
                    this.updateSaveState('warning', '自动保存已关闭');
                    this.showShortcutHint('自动保存已关闭，请手动备份');
                }
            }

            toggleAlignGuides() {
                this.settings.showAlignGuides = document.getElementById('showAlignGuides').checked;
                this.saveSettings();
            }

            updateDefaultSize() {
                const widthInput = document.getElementById('defaultWidth');
                const heightInput = document.getElementById('defaultHeight');
                this.settings.defaultWidth = Math.max(300, Math.min(800, Number(widthInput.value) || 400));
                this.settings.defaultHeight = Math.max(200, Math.min(600, Number(heightInput.value) || 300));
                widthInput.value = this.settings.defaultWidth;
                heightInput.value = this.settings.defaultHeight;
                this.saveSettings();
                this.showShortcutHint('默认卡片尺寸已保存');
            }

            updateSaveState(state, text) {
                const container = document.getElementById('saveState');
                const label = document.getElementById('saveStateText');
                if (!container || !label) return;
                container.className = 'save-state ' + state;
                label.textContent = text;
            }

            toggleDataMenu() {
                document.getElementById('dataMenu').classList.toggle('show');
            }

            closeDataMenu() {
                document.getElementById('dataMenu').classList.remove('show');
            }

            toggleSettings() {
                document.getElementById('settingsPanel').classList.toggle('show');
            }

            resetAllPrompts() {
                localStorage.removeItem('skipDeleteCardConfirm');
                this.showAlertDialog('成功', '所有提示已重置');
            }

            // 操作历史系统
            // 操作历史：卡片相关的操作只保存"当前标签页"的快照，
            // 撤销时只影响当前这个标签页，不会牵动到其他标签页里的操作
            // （标签页增删、导入数据等全局性操作走 saveGlobalHistory）。
            saveHistory() {
                const target = this.getCurrentTarget();
                let entry;
                if (target) {
                    entry = {
                        type: 'target',
                        targetId: target.id,
                        cards: JSON.parse(JSON.stringify(target.cards || [])),
                        connections: JSON.parse(JSON.stringify(target.connections || []))
                    };
                } else {
                    // 没有当前标签页时退化为全局快照，保证不会丢失撤销能力
                    entry = { type: 'global', data: JSON.parse(JSON.stringify(this.data)) };
                }
                this.history.past.push(entry);
                if (this.history.past.length > this.history.maxSize) {
                    this.history.past.shift();
                }
                this.history.future = [];
            }

            // 用于标签页增删、导入数据等会影响整体数据结构的操作
            saveGlobalHistory() {
                const entry = { type: 'global', data: JSON.parse(JSON.stringify(this.data)) };
                this.history.past.push(entry);
                if (this.history.past.length > this.history.maxSize) {
                    this.history.past.shift();
                }
                this.history.future = [];
            }

            // 根据历史条目的类型，构造出"当前状态"对应的条目（用于撤销/重做互相入栈）
            captureCurrentEntry(likeEntry) {
                if (likeEntry.type === 'target') {
                    const target = this.data.targets.find(t => t.id === likeEntry.targetId);
                    if (target) {
                        return {
                            type: 'target',
                            targetId: target.id,
                            cards: JSON.parse(JSON.stringify(target.cards || [])),
                            connections: JSON.parse(JSON.stringify(target.connections || []))
                        };
                    }
                    // 对应的标签页已经不存在了（比如中途被删除），退化为全局快照
                    return { type: 'global', data: JSON.parse(JSON.stringify(this.data)) };
                }
                return { type: 'global', data: JSON.parse(JSON.stringify(this.data)) };
            }

            applyHistoryEntry(entry) {
                if (entry.type === 'target') {
                    const target = this.data.targets.find(t => t.id === entry.targetId);
                    if (target) {
                        target.cards = entry.cards;
                        target.connections = entry.connections;
                        // 撤销/重做时自动切回该操作所在的标签页，避免撤销了却看不到效果
                        this.data.currentTargetId = target.id;
                    }
                } else {
                    this.data = entry.data;
                }
            }

            undo() {
                if (this.history.past.length === 0) {
                    this.showShortcutHint('没有可撤销的操作');
                    return;
                }

                const prevEntry = this.history.past.pop();
                const currentEntry = this.captureCurrentEntry(prevEntry);
                this.history.future.push(currentEntry);

                this.applyHistoryEntry(prevEntry);

                this.renderTabs();
                this.renderCanvas();
                this.renderCardGroups();
                this.showShortcutHint('已撤销');
            }

            redo() {
                if (this.history.future.length === 0) {
                    this.showShortcutHint('没有可重做的操作');
                    return;
                }

                const nextEntry = this.history.future.pop();
                const currentEntry = this.captureCurrentEntry(nextEntry);
                this.history.past.push(currentEntry);

                this.applyHistoryEntry(nextEntry);

                this.renderTabs();
                this.renderCanvas();
                this.renderCardGroups();
                this.showShortcutHint('已重做');
            }

            showShortcutHint(text) {
                const hint = document.getElementById('shortcutHint');
                hint.textContent = text;
                hint.classList.add('show');
                setTimeout(() => {
                    hint.classList.remove('show');
                }, 2000);
            }

            // 快捷键系统
            setupKeyboardShortcuts() {
                document.addEventListener('keydown', (e) => {
                    const active = document.activeElement;
                    const isTyping = active && (
                        active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' ||
                        active.tagName === 'SELECT' || active.isContentEditable
                    );

                    // Esc - 取消选择/关闭面板
                    if (e.key === 'Escape') {
                        this.clearSelection();
                        this.hideCardSelector();
                        this.closeSearch();
                        this.closeCardMenus();
                        this.dismissAgentResultReceipt();
                        this.closeCommandPalette();
                        this.closeProjectOverview();
                        this.closeDuplicateCenter();
                        this.closeCardHistory();
                        document.getElementById('settingsPanel').classList.remove('show');
                    }

                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                        e.preventDefault();
                        this.openCommandPalette();
                        return;
                    }

                    if (document.getElementById('commandPalette')?.classList.contains('show')) {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.moveCommandSelection(e.key === 'ArrowDown' ? 1 : -1);
                            return;
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.executeSelectedCommand();
                            return;
                        }
                    }

                    // 编辑文字时保留浏览器原生的全选、撤销、重做与删除行为。
                    // Ctrl+S / Ctrl+F 仍作为工作台级快捷键使用。
                    const isWorkspaceShortcut = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'f');
                    if (isTyping && e.key !== 'Escape' && !isWorkspaceShortcut) return;

                    // Ctrl/Cmd + S - 导出当前目标
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                        e.preventDefault();
                        this.exportCurrentTarget();
                        this.showShortcutHint('已导出当前目标');
                    }

                    // Ctrl/Cmd + Z - 撤销
                    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        this.undo();
                    }

                    // Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z - 重做
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                        e.preventDefault();
                        this.redo();
                    }

                    // Ctrl/Cmd + A - 全选卡片
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.preventDefault();
                        const target = this.getCurrentTarget();
                        if (target) {
                            this.selectedCards.clear();
                            target.cards.forEach(card => this.selectedCards.add(card.id));
                            this.updateSelectionUI();
                            this.showShortcutHint('已全选 ' + this.selectedCards.size + ' 张卡片');
                        }
                    }

                    // Delete - 删除选中的卡片
                    if (e.key === 'Delete' && this.selectedCards.size > 0) {
                        e.preventDefault();
                        this.batchDelete();
                    }

                    // Ctrl/Cmd + F - 搜索
                    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                        e.preventDefault();
                        this.openSearch();
                    }

                    // Ctrl/Cmd + Plus - 放大
                    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                        e.preventDefault();
                        this.handleZoom(0.1);
                    }

                    // Ctrl/Cmd + Minus - 缩小
                    if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
                        e.preventDefault();
                        this.handleZoom(-0.1);
                    }

                    // Home - 回到卡片所在位置（无论画布拖到多远都能一键归位）
                    if (e.key === 'Home') {
                        if (!isTyping) {
                            e.preventDefault();
                            this.fitView();
                            this.showShortcutHint('已回到卡片所在位置');
                        }
                    }
                });
            }

            // 搜索功能
            openSearch() {
                const panel = document.getElementById('searchPanel');
                panel.classList.add('show');
                document.getElementById('searchInput').focus();
            }

            closeSearch() {
                document.getElementById('searchPanel').classList.remove('show');
                document.getElementById('searchInput').value = '';
                document.getElementById('searchResults').innerHTML = '';
            }

            performSearch(query) {
                const target = this.getCurrentTarget();
                if (!target) return;

                const results = [];
                query = query.toLowerCase();

                target.cards.forEach(card => {
                    const titleMatch = card.title.toLowerCase().includes(query);
                    const dataMatch = card.data && card.data.toLowerCase().includes(query);

                    if (titleMatch || dataMatch) {
                        results.push({
                            card: card,
                            titleMatch: titleMatch,
                            dataMatch: dataMatch
                        });
                    }
                });

                this.renderSearchResults(results, query);
            }

            renderSearchResults(results, query) {
                const container = document.getElementById('searchResults');
                container.innerHTML = '';

                if (results.length === 0) {
                    container.innerHTML = '<div class="search-empty">未找到匹配结果</div>';
                    return;
                }

                results.forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.onclick = () => this.locateCard(result.card.id);

                    const highlightText = (text) => {
                        if (!text) return '';
                        const escapedText = this.escapeHTML(text);
                        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`(${escapedQuery})`, 'gi');
                        return escapedText.replace(regex, '<span class="search-highlight">$1</span>');
                    };

                    const contentPreview = result.card.data
                        ? result.card.data.substring(0, 100) + (result.card.data.length > 100 ? '...' : '')
                        : '(空)';

                    item.innerHTML = `
                        <div class="search-result-title">
                            <span>${this.escapeHTML(result.card.icon)}</span>
                            <span>${highlightText(result.card.title)}</span>
                        </div>
                        <div class="search-result-content">${highlightText(contentPreview)}</div>
                    `;

                    container.appendChild(item);
                });
            }

            locateCard(cardId) {
                const cardElement = document.getElementById('card-' + cardId);
                if (cardElement) {
                    // 高亮卡片
                    this.selectedCards.clear();
                    this.selectedCards.add(cardId);
                    this.updateSelectionUI();

                    // 移动画布使卡片居中
                    const rect = cardElement.getBoundingClientRect();
                    const canvasWrapper = document.getElementById('canvasWrapper');
                    const wrapperRect = canvasWrapper.getBoundingClientRect();

                    const navigatorOffset = this.settings.navigatorCollapsed ? 58 : 284;
                    const centerX = (navigatorOffset + wrapperRect.width) / 2;
                    const centerY = wrapperRect.height / 2;

                    const cardCenterX = rect.left + rect.width / 2;
                    const cardCenterY = rect.top + rect.height / 2;

                    this.panX += (centerX - cardCenterX);
                    this.panY += (centerY - cardCenterY);

                    this.applyCanvasTransform();

                    this.closeSearch();
                }
            }

            ensureCardsVisible(cardIds = [], options = {}) {
                if (!options.force && (this.dragState || this.resizeState || this.canvasDragState || this.selectionBoxState || this.connectionDragState)) return false;
                const active = document.activeElement;
                if (!options.force && active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable)) return false;

                const wrapper = document.getElementById('canvasWrapper');
                if (!wrapper) return false;
                const elements = cardIds.map(id => document.getElementById('card-' + id)).filter(Boolean);
                if (!elements.length) return false;

                const wrapperRect = wrapper.getBoundingClientRect();
                const safeLeft = wrapperRect.left + (this.settings.navigatorCollapsed ? 68 : 294);
                const safeRight = wrapperRect.right - 24;
                const safeTop = wrapperRect.top + 18;
                const safeBottom = wrapperRect.bottom - 78;
                const isVisible = element => {
                    const rect = element.getBoundingClientRect();
                    return rect.right > safeLeft + 36 && rect.left < safeRight - 36 && rect.bottom > safeTop + 36 && rect.top < safeBottom - 36;
                };

                if (!options.force && elements.some(isVisible)) return false;
                if (options.fitWhenAllHidden && !options.force) {
                    this.fitView();
                    return true;
                }

                const rect = elements[0].getBoundingClientRect();
                const centerX = safeLeft + (safeRight - safeLeft) / 2;
                const centerY = safeTop + (safeBottom - safeTop) / 2;
                this.panX += centerX - (rect.left + rect.width / 2);
                this.panY += centerY - (rect.top + rect.height / 2);
                this.applyCanvasTransform();
                this.updateMinimap();
                return true;
            }

            // 批量操作
            batchDelete() {
                if (this.selectedCards.size === 0) return;

                const count = this.selectedCards.size;
                const confirmMsg = `确定删除选中的 ${count} 张卡片？`;

                if (this.settings.confirmDelete) {
                    this.showConfirmDialog('批量删除', confirmMsg, (confirmed) => {
                        if (confirmed) {
                            this.saveHistory();
                            const target = this.getCurrentTarget();
                            if (target) {
                                [...this.selectedCards].forEach(cardId => this.moveCardToTrash(target, cardId));
                                this.selectedCards.clear();
                                this.renderCanvas();
                                this.updateSelectionUI();
                                this.saveData();
                            }
                        }
                    });
                } else {
                    this.saveHistory();
                    const target = this.getCurrentTarget();
                    if (target) {
                        [...this.selectedCards].forEach(cardId => this.moveCardToTrash(target, cardId));
                        this.selectedCards.clear();
                        this.renderCanvas();
                        this.updateSelectionUI();
                        this.saveData();
                    }
                }
            }

            batchCollapse() {
                if (this.selectedCards.size === 0) return;

                this.saveHistory();
                const target = this.getCurrentTarget();
                if (target) {
                    target.cards.forEach(card => {
                        if (this.selectedCards.has(card.id)) {
                            card.collapsed = true;
                        }
                    });
                    this.renderCanvas();
                    this.saveData();
                }
            }

            batchExpand() {
                if (this.selectedCards.size === 0) return;

                this.saveHistory();
                const target = this.getCurrentTarget();
                if (target) {
                    target.cards.forEach(card => {
                        if (this.selectedCards.has(card.id)) {
                            card.collapsed = false;
                        }
                    });
                    this.renderCanvas();
                    this.saveData();
                }
            }

            alignCards() {
                if (this.selectedCards.size === 0) return;

                this.saveHistory();
                const target = this.getCurrentTarget();
                if (!target) return;

                const selectedCardObjects = target.cards.filter(c => this.selectedCards.has(c.id));
                selectedCardObjects.sort((a, b) => a.y - b.y || a.x - b.x);

                const gap = 20;
                const cols = 3;
                // 以选中卡片当前所在位置的左上角为锚点重新排列，而不是固定跳到
                // 画布 (50,50) 处 —— 这样既能消除重叠，又不会跑到离原位置很远
                // 的地方，也不容易和其他未选中的卡片再次冲突。
                const startX = Math.min(...selectedCardObjects.map(c => c.x || 0));
                const startY = Math.min(...selectedCardObjects.map(c => c.y || 0));

                selectedCardObjects.forEach((card, index) => {
                    const row = Math.floor(index / cols);
                    const col = index % cols;
                    card.x = startX + col * (this.settings.defaultWidth + gap);
                    card.y = startY + row * (this.settings.defaultHeight + gap);
                });

                this.renderCanvas();
                this.saveData();
            }

            // 框选功能
            startSelectionBox(e) {
                const canvasWrapper = document.getElementById('canvasWrapper');
                const rect = canvasWrapper.getBoundingClientRect();

                this.selectionBoxState = {
                    startX: e.clientX - rect.left,
                    startY: e.clientY - rect.top,
                    element: document.createElement('div')
                };

                this.selectionBoxState.element.className = 'selection-box';
                document.getElementById('canvas').appendChild(this.selectionBoxState.element);

                canvasWrapper.classList.add('selecting');
            }

            updateSelectionBox(e) {
                if (!this.selectionBoxState) return;

                const canvasWrapper = document.getElementById('canvasWrapper');
                const rect = canvasWrapper.getBoundingClientRect();

                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;

                const left = Math.min(this.selectionBoxState.startX, currentX);
                const top = Math.min(this.selectionBoxState.startY, currentY);
                const width = Math.abs(currentX - this.selectionBoxState.startX);
                const height = Math.abs(currentY - this.selectionBoxState.startY);

                this.selectionBoxState.element.style.left = left + 'px';
                this.selectionBoxState.element.style.top = top + 'px';
                this.selectionBoxState.element.style.width = width + 'px';
                this.selectionBoxState.element.style.height = height + 'px';
            }

            finishSelectionBox() {
                if (!this.selectionBoxState) return;

                const box = this.selectionBoxState.element.getBoundingClientRect();
                const target = this.getCurrentTarget();

                if (target) {
                    this.selectedCards.clear();

                    target.cards.forEach(card => {
                        const cardElement = document.getElementById('card-' + card.id);
                        if (cardElement) {
                            const cardRect = cardElement.getBoundingClientRect();

                            // 检查是否相交
                            if (!(box.right < cardRect.left ||
                                  box.left > cardRect.right ||
                                  box.bottom < cardRect.top ||
                                  box.top > cardRect.bottom)) {
                                this.selectedCards.add(card.id);
                            }
                        }
                    });

                    this.updateSelectionUI();
                }

                this.selectionBoxState.element.remove();
                this.selectionBoxState = null;
                document.getElementById('canvasWrapper').classList.remove('selecting');
            }

            // 对齐辅助线
            updateAlignGuides(draggedCard) {
                if (!this.settings.showAlignGuides) return;

                // 清除旧的辅助线
                this.clearAlignGuides();

                const target = this.getCurrentTarget();
                if (!target) return;

                const threshold = 5;
                const draggedRect = draggedCard.getBoundingClientRect();

                target.cards.forEach(card => {
                    if (card.id === this.dragState.cardId) return;

                    const element = document.getElementById('card-' + card.id);
                    if (!element) return;

                    const rect = element.getBoundingClientRect();

                    // 检查左边对齐
                    if (Math.abs(draggedRect.left - rect.left) < threshold) {
                        this.createAlignGuide('vertical', rect.left);
                    }

                    // 检查右边对齐
                    if (Math.abs(draggedRect.right - rect.right) < threshold) {
                        this.createAlignGuide('vertical', rect.right);
                    }

                    // 检查顶部对齐
                    if (Math.abs(draggedRect.top - rect.top) < threshold) {
                        this.createAlignGuide('horizontal', rect.top);
                    }

                    // 检查底部对齐
                    if (Math.abs(draggedRect.bottom - rect.bottom) < threshold) {
                        this.createAlignGuide('horizontal', rect.bottom);
                    }

                    // 检查中心对齐
                    const draggedCenterX = draggedRect.left + draggedRect.width / 2;
                    const centerX = rect.left + rect.width / 2;
                    if (Math.abs(draggedCenterX - centerX) < threshold) {
                        this.createAlignGuide('vertical', centerX);
                    }

                    const draggedCenterY = draggedRect.top + draggedRect.height / 2;
                    const centerY = rect.top + rect.height / 2;
                    if (Math.abs(draggedCenterY - centerY) < threshold) {
                        this.createAlignGuide('horizontal', centerY);
                    }
                });
            }

            createAlignGuide(type, position) {
                const guide = document.createElement('div');
                guide.className = `align-guide ${type}`;

                if (type === 'vertical') {
                    guide.style.left = position + 'px';
                } else {
                    guide.style.top = position + 'px';
                }

                document.getElementById('canvasWrapper').appendChild(guide);
                this.alignGuides.push(guide);
            }

            clearAlignGuides() {
                this.alignGuides.forEach(guide => guide.remove());
                this.alignGuides = [];
            }

            // 小地图
            updateMinimap() {
                if (!this.settings.showMinimap) return;

                const canvas = document.getElementById('minimapCanvas');
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                const target = this.getCurrentTarget();

                if (!target || target.cards.length === 0) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    return;
                }

                canvas.width = 200;
                canvas.height = 150;

                // 计算所有卡片的边界
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                target.cards.forEach(card => {
                    const x = card.x || 0;
                    const y = card.y || 0;
                    const w = card.width || 400;
                    const h = card.height || 300;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x + w);
                    maxY = Math.max(maxY, y + h);
                });

                // 添加边距
                const padding = 20;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;

                // 计算缩放比例
                const contentWidth = maxX - minX;
                const contentHeight = maxY - minY;
                const scaleX = canvas.width / contentWidth;
                const scaleY = canvas.height / contentHeight;
                const scale = Math.min(scaleX, scaleY, 0.15); // 最大0.15倍

                // 清空画布，填充背景
                ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#1e1e2e' : '#f5f7fa';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 绘制卡片
                target.cards.forEach(card => {
                    const x = ((card.x || 0) - minX) * scale;
                    const y = ((card.y || 0) - minY) * scale;
                    const w = (card.width || 400) * scale;
                    const h = (card.height || 300) * scale;

                    // 卡片边框
                    ctx.strokeStyle = '#dcdfe6';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, w, h);

                    // 卡片填充（选中的高亮）
                    if (this.selectedCards.has(card.id)) {
                        ctx.fillStyle = 'rgba(64, 158, 255, 0.6)';
                    } else {
                        ctx.fillStyle = document.body.classList.contains('dark-theme') ? 'rgba(42, 42, 62, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                    }
                    ctx.fillRect(x, y, w, h);
                });

                // 绘制视口区域
                const viewportX = (-this.panX / this.scale - minX) * scale;
                const viewportY = (-this.panY / this.scale - minY) * scale;
                const viewportW = (window.innerWidth / this.scale) * scale;
                const viewportH = (window.innerHeight / this.scale) * scale;

                ctx.strokeStyle = '#409eff';
                ctx.lineWidth = 2;
                ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
            }

            // 标签页管理
            addTarget() {
                this.showInputDialog('添加目标', '请输入目标名称', (name) => {
                    if (!name) return;

                    this.saveGlobalHistory();
                    const target = {
                        id: 'target-' + Date.now(),
                        name: name,
                        cards: []
                    };

                    this.data.targets.push(target);
                    this.renderTabs();
                    this.switchTarget(target.id);
                    this.saveData();
                });
            }

            renameTarget(id) {
                const target = this.data.targets.find(t => t.id === id);
                if (!target) return;
                this.showInputDialog('重命名目标', '输入新的目标名称', (name) => {
                    const cleanName = (name || '').trim();
                    if (!cleanName || cleanName === target.name) return;
                    this.saveGlobalHistory();
                    target.name = cleanName;
                    this.renderTabs();
                    this.updateWorkspaceMeta();
                    this.saveData();
                    this.showShortcutHint('目标已重命名');
                }, target.name);
            }

            removeTarget(id) {
                this.showConfirmDialog('删除目标', '目标将移入回收站，可随时恢复。确定继续？', (confirmed) => {
                    if (!confirmed) return;

                    this.saveGlobalHistory();
                    const removedTarget = this.data.targets.find(t => t.id === id);
                    if (removedTarget) this.pushTrash('target', removedTarget, null, removedTarget.name);
                    this.data.targets = this.data.targets.filter(t => t.id !== id);

                    if (this.data.currentTargetId === id) {
                        this.data.currentTargetId = this.data.targets.length > 0 ? this.data.targets[0].id : null;
                    }

                    this.renderTabs();
                    if (this.data.currentTargetId) {
                        this.switchTarget(this.data.currentTargetId);
                    } else {
                        this.renderCanvas();
                    }
                    this.saveData();
                    this.showShortcutHint('目标已移入回收站');
                });
            }

            switchTarget(id) {
                this.data.currentTargetId = id;
                this.selectedCards.clear();
                this.renderTabs();
                this.renderCanvas();
                this.updateSelectionUI();
                this.updateMinimap();
                const target = this.getCurrentTarget();
                if (target?.cards?.length) {
                    setTimeout(() => this.ensureCardsVisible(target.cards.map(card => card.id), { fitWhenAllHidden: true }), 80);
                }
            }

            renderTabs() {
                const container = document.getElementById('tabsContainer');
                container.innerHTML = '';

                this.data.targets.forEach(target => {
                    const tab = document.createElement('div');
                    tab.className = 'tab' + (target.id === this.data.currentTargetId ? ' active' : '');
                    tab.title = '单击切换，双击重命名';

                    const name = document.createElement('span');
                    name.className = 'tab-name';
                    name.textContent = target.name;
                    name.onclick = () => this.switchTarget(target.id);
                    name.ondblclick = (event) => {
                        event.stopPropagation();
                        this.renameTarget(target.id);
                    };

                    const close = document.createElement('span');
                    close.className = 'tab-close';
                    close.innerHTML = '&times;';
                    close.title = '删除目标';
                    close.onclick = (event) => {
                        event.stopPropagation();
                        this.removeTarget(target.id);
                    };

                    tab.appendChild(name);
                    tab.appendChild(close);
                    container.appendChild(tab);
                });

                const addBtn = document.createElement('div');
                addBtn.className = 'tab-add';
                addBtn.textContent = '+';
                addBtn.onclick = () => this.addTarget();
                container.appendChild(addBtn);
            }

            // 统一更新画布的缩放/平移，并同步网格背景（网格改为绘制在小尺寸的
            // canvas-wrapper 上而不是巨大的 5000x5000 canvas 元素上，避免超大元素
            // 平铺重复背景图时出现部分区域绘制不出来/空白的浏览器渲染问题）
            applyCanvasTransform(panX = this.panX, panY = this.panY) {
                const canvas = this._canvasElement?.isConnected
                    ? this._canvasElement
                    : (this._canvasElement = document.getElementById('canvas'));
                const canvasGrid = this._canvasGridElement?.isConnected
                    ? this._canvasGridElement
                    : (this._canvasGridElement = document.getElementById('canvasGrid'));
                if (canvas) {
                    // panX / panY 始终使用屏幕像素。先平移、再缩放内容，确保任意
                    // 缩放倍率下鼠标移动 1px，画布也严格移动 1px。
                    canvas.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${this.scale})`;
                }
                if (canvasGrid && this.settings.showGrid) {
                    const gridSize = 20 * this.scale;
                    // 缩放没变化时不重复写 background-size，避免无意义的样式失效。
                    if (this._appliedGridSize !== gridSize) {
                        canvasGrid.style.backgroundSize = `${gridSize}px ${gridSize}px`;
                        this._appliedGridSize = gridSize;
                    }
                    // 网格只在一个图案周期内移动，始终覆盖视口边缘；transform
                    // 可由合成线程处理，不需要每帧重新绘制整个背景。
                    const gridX = panX % gridSize;
                    const gridY = panY % gridSize;
                    canvasGrid.style.transform = `translate3d(${gridX}px, ${gridY}px, 0)`;
                }
                this.queuePerformanceCulling();
            }

            // 画布渲染
            renderCanvas() {
                const canvas = document.getElementById('canvas');
                canvas.innerHTML = '';
                this.updateWorkspaceMeta();
                this.renderNavigator();

                const target = this.getCurrentTarget();
                this.applyPerformanceMode(target?.cards?.length || 0);
                if (!target) {
                    canvas.innerHTML = `<div class="empty-state-v6">
                        <div class="empty-kicker">START A WORKSPACE</div>
                        <h2>先创建一个目标</h2>
                        <p>目标用于隔离不同项目的数据、卡片和报告。</p>
                        <div class="empty-actions"><button class="btn btn-primary-v6" onclick="app.addTarget()">＋ 新建目标</button></div>
                    </div>`;
                    return;
                }

                if (target.cards.length === 0) {
                    canvas.innerHTML = `<div class="empty-state-v6">
                        <div class="empty-kicker">READY FOR RECON</div>
                        <h2>从一条清晰的收集路径开始</h2>
                        <p>可以直接套用常用组合，也可以从左下角添加单张卡片。所有内容会自动保存在当前浏览器。</p>
                        <div class="empty-actions">
                            <button class="btn btn-primary-v6" onclick="app.startWithGroup('src-specialty')">SRC 信息收集专项</button>
                            <button class="btn btn-default" onclick="app.startWithGroup('edusrc-specialty')">EDUSRC 专项</button>
                            <button class="btn btn-default" onclick="app.toggleCardSelector()">浏览全部模板</button>
                        </div>
                        <div class="empty-tip">提示：双击顶部目标标签可以重命名；Ctrl+F 可搜索全部卡片。</div>
                    </div>`;
                    return;
                }

                target.cards.forEach(card => {
                    this.createCardElement(card);
                });

                this.updateMinimap();

                // 渲染连线
                setTimeout(() => {
                    this.renderConnections();
                    this.applyNavigatorFilter();
                    this.updatePerformanceCulling();
                }, 50);
            }

            startWithGroup(groupId) {
                const group = [...DEFAULT_GROUPS, ...(this.data.customGroups || [])].find(item => item.id === groupId);
                if (group) this.addCardGroup(group);
            }

            createCardElement(cardData) {
                const card = document.createElement('div');
                card.className = 'card';
                if (this.selectedCards.has(cardData.id)) {
                    card.classList.add('selected');
                }
                card.id = 'card-' + cardData.id;
                card.style.left = (cardData.x || 100) + 'px';
                card.style.top = (cardData.y || 100) + 'px';
                card.style.width = (cardData.width || this.settings.defaultWidth) + 'px';
                card.style.height = (cardData.height || this.settings.defaultHeight) + 'px';

                // 确保卡片有状态和视图模式
                if (!['todo', 'doing', 'done'].includes(cardData.status)) cardData.status = 'todo';
                if (!['edit', 'markdown'].includes(cardData.viewMode)) cardData.viewMode = 'edit';
                if (!['critical','high','medium','low','info'].includes(cardData.risk)) cardData.risk = 'info';
                if (!Array.isArray(cardData.tags)) cardData.tags = [];

                const statusLabels = { todo: '待办', doing: '进行中', done: '已完成' };
                const riskLabels = { critical: '严重', high: '高危', medium: '中危', low: '低危', info: '信息' };
                const visibleTags = cardData.tags.slice(0, 3).map(tag => `<span class="tag-badge">${this.escapeHTML(tag)}</span>`).join('');

                card.innerHTML = `
                    <div class="card-status ${cardData.status}">${statusLabels[cardData.status]}</div>
                    <div class="card-header" data-card-id="${cardData.id}">
                        <div class="card-title">
                            <span class="card-icon">${this.escapeHTML(cardData.icon)}</span>
                            <span>${this.escapeHTML(cardData.title)}</span>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn" onclick="app.toggleCardCollapse('${cardData.id}')">${cardData.collapsed ? '▼' : '▲'}</button>
                        </div>
                    </div>
                    ${cardData.desc ? `<div class="card-desc">${this.escapeHTML(cardData.desc)}</div>` : ''}
                    <div class="card-meta-strip" style="display: ${cardData.collapsed ? 'none' : 'flex'}">
                        <span class="risk-badge ${cardData.risk}" onclick="app.editCardMeta('${cardData.id}')">${riskLabels[cardData.risk]}</span>
                        ${visibleTags}
                        ${cardData.tags.length > 3 ? `<span class="tag-badge">+${cardData.tags.length - 3}</span>` : ''}
                    </div>
                    <div class="card-content" style="display: ${cardData.collapsed ? 'none' : 'block'}">
                        ${cardData.viewMode === 'markdown' ?
                            `<div class="markdown-content" id="markdown-${cardData.id}"></div>` :
                            `<textarea placeholder="${this.escapeHTML(FIELD_PLACEHOLDERS[cardData.templateId] || cardData.desc || '输入内容...')}" oninput="app.updateCardData('${cardData.id}', this.value)">${this.escapeHTML(cardData.data || '')}</textarea>`
                        }
                    </div>
                    <div class="card-tools" style="display: ${cardData.collapsed ? 'none' : 'flex'}">
                        <select class="card-status-select" onchange="app.setCardStatus('${cardData.id}', this.value)">
                            <option value="todo" ${cardData.status === 'todo' ? 'selected' : ''}>待办</option>
                            <option value="doing" ${cardData.status === 'doing' ? 'selected' : ''}>进行中</option>
                            <option value="done" ${cardData.status === 'done' ? 'selected' : ''}>已完成</option>
                        </select>
                        <button class="card-tool-btn card-tool-primary ${cardData.viewMode === 'markdown' ? 'active' : ''}" onclick="app.toggleMarkdownView('${cardData.id}')">${cardData.viewMode === 'markdown' ? '编辑' : '预览'}</button>
                        <div class="card-more-wrap">
                            <button class="card-tool-btn card-more-trigger" onclick="app.toggleCardMoreMenu('${cardData.id}', event)" aria-expanded="false" title="更多操作">•••</button>
                            <div class="card-more-menu" id="card-menu-${cardData.id}" role="menu">
                                <button onclick="app.editCardMeta('${cardData.id}'); app.closeCardMenus()">编辑属性</button>
                                <button onclick="app.openCardHistory('${cardData.id}'); app.closeCardMenus()">来源与历史</button>
                                <button onclick="app.openParsePanel('${cardData.id}'); app.closeCardMenus()">解析输出</button>
                                <button class="danger" onclick="app.removeCard('${cardData.id}'); app.closeCardMenus()">删除卡片</button>
                            </div>
                        </div>
                    </div>
                    <span class="card-connection-port in" data-port="in" title="拖拽创建连线"></span>
                    <span class="card-connection-port out" data-port="out" title="拖拽创建连线"></span>
                    <div class="card-resize-handle" data-card-id="${cardData.id}"></div>
                `;

                if (cardData.collapsed) {
                    card.classList.add('collapsed');
                }

                // 如果是 Markdown 模式，渲染 Markdown
                if (cardData.viewMode === 'markdown' && cardData.data) {
                    setTimeout(() => {
                        const markdownDiv = document.getElementById('markdown-' + cardData.id);
                        if (markdownDiv && typeof marked !== 'undefined') {
                            marked.setOptions({
                                highlight: function(code, lang) {
                                    if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
                                        try {
                                            return hljs.highlight(code, { language: lang }).value;
                                        } catch (err) {}
                                    }
                                    return code;
                                },
                                breaks: true,
                                gfm: true
                            });
                            if (typeof marked !== 'undefined') {
                                markdownDiv.innerHTML = this.sanitizeHTML(marked.parse(cardData.data || ''));
                            } else {
                                markdownDiv.textContent = cardData.data || '';
                            }
                        }
                    }, 0);
                }

                document.getElementById('canvas').appendChild(card);
                this.attachCardEvents(card, cardData.id);
            }

            attachCardEvents(cardElement, cardId) {
                const header = cardElement.querySelector('.card-header');
                const resizeHandle = cardElement.querySelector('.card-resize-handle');
                const connectionPorts = cardElement.querySelectorAll('.card-connection-port');

                // 只要与卡片有交互（点击/拖拽/调整大小），就把它的层级提到最上层，
                // 避免卡片被不小心拖到别的卡片下面之后很难再选中或拖出来。
                cardElement.addEventListener('mousedown', () => {
                    this.bringCardToFront(cardId);
                }, true);

                // 卡片点击事件
                cardElement.addEventListener('click', (e) => {
                    if (e.target.closest('.card-btn') ||
                        e.target.closest('.card-tools') ||
                        e.target.closest('.card-meta-strip') ||
                        e.target.closest('.card-connection-port') ||
                        e.target.tagName === 'TEXTAREA' ||
                        e.target.classList.contains('card-resize-handle')) {
                        return;
                    }

                    if (e.ctrlKey || e.metaKey) {
                        e.stopPropagation();
                        this.toggleCardSelection(cardId);
                    }
                });

                // 拖拽移动
                header.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.card-btn')) return;
                    if (e.ctrlKey || e.metaKey) return;
                    if (this.settings.canvasLocked) {
                        this.showShortcutHint('画布已锁定');
                        return;
                    }

                    e.stopPropagation();

                    this.dragState = {
                        cardId: cardId,
                        startX: e.clientX,
                        startY: e.clientY,
                        cardStartX: cardElement.offsetLeft,
                        cardStartY: cardElement.offsetTop
                    };

                    cardElement.classList.add('dragging');
                    e.preventDefault();
                });

                // 调整大小
                resizeHandle.addEventListener('mousedown', (e) => {
                    if (this.settings.canvasLocked) {
                        this.showShortcutHint('画布已锁定');
                        return;
                    }
                    this.resizeState = {
                        cardId: cardId,
                        startX: e.clientX,
                        startY: e.clientY,
                        startWidth: cardElement.offsetWidth,
                        startHeight: cardElement.offsetHeight
                    };

                    e.stopPropagation();
                    e.preventDefault();
                });

                connectionPorts.forEach(port => {
                    port.addEventListener('mousedown', (e) => this.startConnectionDrag(e, cardId, port.dataset.port));
                });
            }

            // 卡片操作
            addCard(template) {
                const target = this.getCurrentTarget();
                if (!target) return;

                this.saveHistory();

                const card = {
                    id: 'card-' + Date.now(),
                    templateId: template.id,
                    icon: template.icon,
                    title: template.title,
                    desc: template.desc,
                    data: '',
                    collapsed: false,
                    x: (this.settings.navigatorCollapsed ? 90 : 310) + (target.cards.length * 30),
                    y: 100 + (target.cards.length * 30),
                    width: this.settings.defaultWidth,
                    height: this.settings.defaultHeight,
                    status: 'todo', // 新增：任务状态 todo/doing/done
                    viewMode: 'edit', // 新增：查看模式 edit/markdown
                    risk: 'info',
                    tags: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                target.cards.push(card);
                this.createCardElement(card);
                this.renderNavigator();
                this.saveData();
                this.hideCardSelector();
                this.updateMinimap();
            }

            addCardGroup(group) {
                const target = this.getCurrentTarget();
                if (!target) return;

                this.saveHistory();

                const cardWidth = this.settings.defaultWidth;
                const cardHeight = this.settings.defaultHeight;
                const gap = 20;
                const cols = 3;
                const startX = this.settings.navigatorCollapsed ? 70 : 300;
                const startY = 50;

                if (group.templates) {
                    group.templates.forEach((template, index) => {
                        const row = Math.floor(index / cols);
                        const col = index % cols;

                        const card = {
                            id: 'card-' + Date.now() + '-' + index,
                            templateId: template.id,
                            icon: template.icon,
                            title: template.title,
                            desc: template.desc,
                            data: template.content || '',
                            collapsed: false,
                            x: startX + col * (cardWidth + gap),
                            y: startY + row * (cardHeight + gap),
                            width: cardWidth,
                            height: cardHeight,
                            status: template.status || 'todo',
                            viewMode: 'edit',
                            risk: template.risk || 'info',
                            tags: [...(template.tags || [])],
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                        target.cards.push(card);
                    });
                } else if (group.templateIds) {
                    group.templateIds.forEach((templateId, index) => {
                        const template = CARD_TEMPLATES.find(t => t.id === templateId);
                        if (template) {
                            const row = Math.floor(index / cols);
                            const col = index % cols;

                            const card = {
                                id: 'card-' + Date.now() + '-' + index,
                                templateId: template.id,
                                icon: template.icon,
                                title: template.title,
                                desc: template.desc,
                                data: template.content || '',
                                collapsed: false,
                                x: startX + col * (cardWidth + gap),
                                y: startY + row * (cardHeight + gap),
                                width: cardWidth,
                                height: cardHeight,
                                status: template.status || 'todo',
                                viewMode: 'edit',
                                risk: template.risk || 'info',
                                tags: [...(template.tags || [])],
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };
                            target.cards.push(card);
                        }
                    });
                }

                this.renderCanvas();
                this.saveData();
                this.hideCardSelector();
                this.updateMinimap();
            }

            removeCard(cardId) {
                const target = this.getCurrentTarget();
                if (!target) return;

                const skipConfirm = localStorage.getItem('skipDeleteCardConfirm') === 'true';

                if (skipConfirm || !this.settings.confirmDelete) {
                    this.saveHistory();
                    this.moveCardToTrash(target, cardId);
                    this.renderCanvas();
                    this.saveData();
                    this.showShortcutHint('卡片已移入回收站');
                } else {
                    this.showConfirmDialogWithRemember('删除卡片', '确定删除此卡片？', '不再提示', (confirmed, remember) => {
                        if (confirmed) {
                            if (remember) {
                                localStorage.setItem('skipDeleteCardConfirm', 'true');
                            }
                            this.saveHistory();
                            this.moveCardToTrash(target, cardId);
                            this.renderCanvas();
                            this.saveData();
                            this.showShortcutHint('卡片已移入回收站');
                        }
                    });
                }
            }

            toggleCardCollapse(cardId) {
                const target = this.getCurrentTarget();
                if (!target) return;

                this.saveHistory();
                const card = target.cards.find(c => c.id === cardId);
                if (card) {
                    card.collapsed = !card.collapsed;
                    this.renderCanvas();
                    this.saveData();
                }
            }

            updateCardData(cardId, data) {
                const target = this.getCurrentTarget();
                if (!target) return;

                const card = target.cards.find(c => c.id === cardId);
                if (card) {
                    this.recordCardVersionThrottled(card, '内容编辑');
                    card.data = data;
                    card.updatedAt = Date.now();
                    this.scheduleDataSave();
                }
            }

            recordCardVersion(card, reason = '手动修改', changedBy = 'browser') {
                if (!card) return null;
                if (!Array.isArray(card.history)) card.history = [];
                const snapshot = {
                    id: 'version-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
                    reason,
                    changedBy,
                    createdAt: Date.now(),
                    title: card.title || '',
                    data: card.data || '',
                    status: card.status || 'todo',
                    risk: card.risk || 'info',
                    tags: [...(card.tags || [])],
                    source: card.mcpSource ? structuredClone(card.mcpSource) : null
                };
                const latest = card.history[0];
                if (latest && latest.data === snapshot.data && latest.status === snapshot.status && latest.risk === snapshot.risk && JSON.stringify(latest.tags || []) === JSON.stringify(snapshot.tags)) return latest;
                card.history.unshift(snapshot);
                card.history = card.history.slice(0, 30);
                return snapshot;
            }

            recordCardVersionThrottled(card, reason) {
                const now = Date.now();
                const last = this._cardHistoryThrottle.get(card.id) || 0;
                if (now - last < 60000 && Array.isArray(card.history) && card.history.length) return;
                this.recordCardVersion(card, reason);
                this._cardHistoryThrottle.set(card.id, now);
            }

            updateCardPosition(cardId, x, y) {
                const target = this.getCurrentTarget();
                if (!target) return;

                const card = target.cards.find(c => c.id === cardId);
                if (card) {
                    card.x = x;
                    card.y = y;
                    this.saveData();
                    this.updateMinimap();
                }
            }

            updateCardSize(cardId, width, height) {
                const target = this.getCurrentTarget();
                if (!target) return;

                const card = target.cards.find(c => c.id === cardId);
                if (card) {
                    card.width = width;
                    card.height = height;
                    this.saveData();
                    this.updateMinimap();
                }
            }

            // 卡片选择器
            toggleCardSelector() {
                const selector = document.getElementById('cardSelector');
                selector.classList.toggle('show');
            }

            hideCardSelector() {
                document.getElementById('cardSelector').classList.remove('show');
            }

            switchSelectorTab(tab) {
                document.querySelectorAll('.selector-tab').forEach(t => {
                    t.classList.remove('active');
                });
                document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

                document.querySelectorAll('.selector-section').forEach(s => {
                    s.classList.remove('active');
                });

                if (tab === 'groups') {
                    document.getElementById('sectionGroups').classList.add('active');
                } else if (tab === 'templates') {
                    document.getElementById('sectionTemplates').classList.add('active');
                } else if (tab === 'custom') {
                    document.getElementById('sectionCustom').classList.add('active');
                }
            }

            renderCardGroups() {
                const container = document.getElementById('sectionGroups');
                container.innerHTML = '';

                const toolbar = document.createElement('div');
                toolbar.className = 'groups-toolbar';
                const disabled = this.selectedCards.size === 0 ? 'disabled' : '';
                toolbar.innerHTML = `
                    <button class="btn btn-primary" onclick="app.saveSelectedAsGroup()" ${disabled}>
                        保存选中的卡片为组 (已选 ${this.selectedCards.size} 张)
                    </button>
                `;
                container.appendChild(toolbar);

                this.data.cardGroups.forEach(group => {
                    const item = document.createElement('div');
                    item.className = 'group-item';
                    item.onclick = () => this.addCardGroup(group);

                    const groupTemplates = group.templates || (group.templateIds || [])
                        .map(id => CARD_TEMPLATES.find(t => t.id === id))
                        .filter(t => t);
                    const templates = groupTemplates.slice(0, 8).map(template => template.icon).join(' ');
                    item.classList.add('specialty-group', `specialty-${group.id}`);

                    item.innerHTML = `
                        <div class="group-item-head">
                            <div class="group-name">${this.escapeHTML(group.name)}</div>
                            <span class="group-count">${groupTemplates.length} 张卡片</span>
                        </div>
                        <div class="group-description">${this.escapeHTML(group.description || '一键创建完整工作流')}</div>
                        <div class="group-templates" aria-hidden="true">${this.escapeHTML(templates)}</div>
                    `;
                    container.appendChild(item);
                });

                if (this.data.customGroups && this.data.customGroups.length > 0) {
                    const divider = document.createElement('div');
                    divider.className = 'groups-divider';
                    divider.innerHTML = '<span class="groups-divider-text">自定义组合</span>';
                    container.appendChild(divider);

                    this.data.customGroups.forEach(group => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'custom-group-item';
                        wrapper.style.marginBottom = '8px';

                        const item = document.createElement('div');
                        item.className = 'group-item';
                        item.onclick = () => this.addCardGroup(group);

                        let templates = '';
                        if (group.templates) {
                            templates = group.templates.map(t => t.icon).join(' ');
                        } else if (group.templateIds) {
                            templates = group.templateIds
                                .map(id => CARD_TEMPLATES.find(t => t.id === id))
                                .filter(t => t)
                                .map(t => t.icon)
                                .join(' ');
                        }

                        item.innerHTML = `
                            <div class="group-name">${this.escapeHTML(group.name)}</div>
                            <div class="group-templates">${this.escapeHTML(templates)}</div>
                        `;

                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-group-btn';
                        deleteBtn.textContent = '删除';
                        deleteBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.deleteCustomGroup(group.id);
                        };

                        wrapper.appendChild(item);
                        wrapper.appendChild(deleteBtn);
                        container.appendChild(wrapper);
                    });
                }
            }

            renderTemplates() {
                const container = document.getElementById('sectionTemplates');
                container.innerHTML = '';

                CARD_TEMPLATES.forEach(template => {
                    const item = document.createElement('div');
                    item.className = 'template-item';
                    item.onclick = () => this.addCard(template);
                    item.innerHTML = `
                        <span class="template-icon">${this.escapeHTML(template.icon)}</span>
                        <div class="template-info">
                            <div class="template-title">${this.escapeHTML(template.title)}</div>
                            <div class="template-desc">${this.escapeHTML(template.desc)}</div>
                        </div>
                    `;
                    container.appendChild(item);
                });
            }

            // 自定义卡片
            openCustomCardModal() {
                document.getElementById('customCardModal').classList.add('show');
                document.getElementById('customCardName').value = '';
                document.getElementById('customCardDesc').value = '';
                this.selectedIcon = COMMON_ICONS[0];
                this.renderIconPicker();
            }

            closeCustomCardModal() {
                document.getElementById('customCardModal').classList.remove('show');
            }

            renderIconPicker() {
                const picker = document.getElementById('iconPicker');
                picker.innerHTML = '';

                COMMON_ICONS.forEach(icon => {
                    const option = document.createElement('div');
                    option.className = 'icon-option' + (icon === this.selectedIcon ? ' selected' : '');
                    option.textContent = icon;
                    option.onclick = () => {
                        this.selectedIcon = icon;
                        this.renderIconPicker();
                    };
                    picker.appendChild(option);
                });
            }

            createCustomCard() {
                const name = document.getElementById('customCardName').value.trim();
                if (!name) {
                    this.showAlertDialog('提示', '请输入卡片名称');
                    return;
                }

                const desc = document.getElementById('customCardDesc').value.trim();

                const template = {
                    id: 'custom-' + Date.now(),
                    icon: this.selectedIcon,
                    title: name,
                    desc: desc
                };

                this.addCard(template);
                this.closeCustomCardModal();
            }

            // 自定义组管理
            saveSelectedAsGroup() {
                if (this.selectedCards.size === 0) {
                    this.showAlertDialog('提示', '请先选择要保存的卡片');
                    return;
                }

                const target = this.getCurrentTarget();
                if (!target) return;

                const selectedCardTemplates = [];
                this.selectedCards.forEach(cardId => {
                    const card = target.cards.find(c => c.id === cardId);
                    if (card) {
                        selectedCardTemplates.push({
                            icon: card.icon,
                            title: card.title,
                            desc: card.desc
                        });
                    }
                });

                this.showInputDialog('保存为组', '请输入组合名称', (name) => {
                    if (name && name.trim()) {
                        this.saveHistory();
                        const group = {
                            id: 'custom-group-' + Date.now(),
                            name: name.trim(),
                            templates: selectedCardTemplates,
                            isCustom: true
                        };

                        this.data.customGroups.push(group);
                        this.saveData();
                        this.renderCardGroups();
                        this.selectedCards.clear();
                        this.updateSelectionUI();
                        this.showAlertDialog('成功', '组合已保存');
                    }
                });
            }

            deleteCustomGroup(groupId) {
                this.showConfirmDialog('删除组合', '确定删除此自定义组合？', (confirmed) => {
                    if (!confirmed) return;

                    this.saveGlobalHistory();
                    this.data.customGroups = this.data.customGroups.filter(g => g.id !== groupId);
                    this.saveData();
                    this.renderCardGroups();
                });
            }

            // 卡片多选功能
            toggleCardSelection(cardId) {
                if (this.selectedCards.has(cardId)) {
                    this.selectedCards.delete(cardId);
                } else {
                    this.selectedCards.add(cardId);
                }
                this.updateSelectionUI();
            }

            updateSelectionUI() {
                const target = this.getCurrentTarget();
                if (!target) return;

                target.cards.forEach(card => {
                    const element = document.getElementById('card-' + card.id);
                    if (element) {
                        if (this.selectedCards.has(card.id)) {
                            element.classList.add('selected');
                        } else {
                            element.classList.remove('selected');
                        }
                    }
                });

                this.updateSelectedCount();
                this.renderCardGroups();
                this.updateMinimap();
            }

            updateSelectedCount() {
                const countElement = document.getElementById('selectedCount');
                const batchActions = document.getElementById('batchActions');
                if (this.selectedCards.size > 0) {
                    countElement.textContent = `已选 ${this.selectedCards.size} 张卡片`;
                    batchActions.classList.add('show');
                } else {
                    countElement.textContent = '已选 0 张卡片';
                    batchActions.classList.remove('show');
                }
            }

            clearSelection() {
                this.selectedCards.clear();
                this.updateSelectionUI();
            }

            toggleCardMoreMenu(cardId, event) {
                event?.stopPropagation();
                const wrap = document.getElementById('card-menu-' + cardId)?.closest('.card-more-wrap');
                if (!wrap) return;
                const willOpen = !wrap.classList.contains('open');
                this.closeCardMenus();
                if (willOpen) {
                    wrap.classList.add('open');
                    wrap.querySelector('.card-more-trigger')?.setAttribute('aria-expanded', 'true');
                }
            }

            closeCardMenus() {
                document.querySelectorAll('.card-more-wrap.open').forEach(wrap => {
                    wrap.classList.remove('open');
                    wrap.querySelector('.card-more-trigger')?.setAttribute('aria-expanded', 'false');
                });
            }

            // 对话框系统
            showInputDialog(title, placeholder, callback, initialValue = '') {
                const overlay = document.getElementById('dialogOverlay');
                const dialogTitle = document.getElementById('dialogTitle');
                const dialogMessage = document.getElementById('dialogMessage');
                const dialogInput = document.getElementById('dialogInput');
                const dialogFooter = document.getElementById('dialogFooter');

                const dialogSelect = document.getElementById('dialogSelect');
                if (dialogSelect) dialogSelect.style.display = 'none';

                dialogTitle.textContent = title;
                dialogMessage.textContent = '';
                dialogInput.style.display = 'block';
                dialogInput.value = initialValue;
                dialogInput.placeholder = placeholder;

                dialogFooter.innerHTML = `
                    <button class="btn btn-default" onclick="app.hideDialog()">取消</button>
                    <button class="btn btn-primary" onclick="app.confirmInputDialog()">确定</button>
                `;

                overlay.classList.add('show');
                setTimeout(() => {
                    dialogInput.focus();
                    if (initialValue) dialogInput.select();
                }, 100);

                this.dialogCallback = callback;

                const handleEnter = (e) => {
                    if (e.key === 'Enter') {
                        this.confirmInputDialog();
                        dialogInput.removeEventListener('keypress', handleEnter);
                    }
                };
                dialogInput.addEventListener('keypress', handleEnter);
            }

            confirmInputDialog() {
                const dialogInput = document.getElementById('dialogInput');
                const value = dialogInput.value.trim();
                this.hideDialog();
                if (this.dialogCallback) {
                    this.dialogCallback(value);
                    this.dialogCallback = null;
                }
            }

            // 通用下拉选择对话框（用于连线类型等场景）
            showSelectDialog(title, message, options, callback) {
                const overlay = document.getElementById('dialogOverlay');
                const dialogTitle = document.getElementById('dialogTitle');
                const dialogMessage = document.getElementById('dialogMessage');
                const dialogInput = document.getElementById('dialogInput');
                const dialogSelect = document.getElementById('dialogSelect');
                const dialogFooter = document.getElementById('dialogFooter');

                dialogTitle.textContent = title;
                dialogMessage.textContent = message || '';
                dialogInput.style.display = 'none';
                dialogSelect.style.display = 'block';
                dialogSelect.innerHTML = options.map(opt =>
                    `<option value="${opt.id}">${opt.label}</option>`
                ).join('');

                dialogFooter.innerHTML = `
                    <button class="btn btn-default" onclick="app.hideDialog()">取消</button>
                    <button class="btn btn-primary" onclick="app.confirmSelectDialog()">确定</button>
                `;

                overlay.classList.add('show');
                this.dialogCallback = callback;
            }

            confirmSelectDialog() {
                const dialogSelect = document.getElementById('dialogSelect');
                const value = dialogSelect.value;
                this.hideDialog();
                if (this.dialogCallback) {
                    this.dialogCallback(value);
                    this.dialogCallback = null;
                }
            }

            showConfirmDialog(title, message, callback) {
                const overlay = document.getElementById('dialogOverlay');
                const dialogTitle = document.getElementById('dialogTitle');
                const dialogMessage = document.getElementById('dialogMessage');
                const dialogInput = document.getElementById('dialogInput');
                const dialogFooter = document.getElementById('dialogFooter');

                const dialogSelect = document.getElementById('dialogSelect');
                if (dialogSelect) dialogSelect.style.display = 'none';

                dialogTitle.textContent = title;
                dialogMessage.textContent = message;
                dialogInput.style.display = 'none';

                dialogFooter.innerHTML = `
                    <button class="btn btn-default" onclick="app.cancelConfirmDialog()">取消</button>
                    <button class="btn btn-primary" onclick="app.confirmDialog()">确定</button>
                `;

                overlay.classList.add('show');
                this.dialogCallback = callback;
            }

            confirmDialog() {
                this.hideDialog();
                if (this.dialogCallback) {
                    this.dialogCallback(true);
                    this.dialogCallback = null;
                }
            }

            cancelConfirmDialog() {
                this.hideDialog();
                if (this.dialogCallback) {
                    this.dialogCallback(false);
                    this.dialogCallback = null;
                }
            }

            showAlertDialog(title, message) {
                const overlay = document.getElementById('dialogOverlay');
                const dialogTitle = document.getElementById('dialogTitle');
                const dialogMessage = document.getElementById('dialogMessage');
                const dialogInput = document.getElementById('dialogInput');
                const dialogFooter = document.getElementById('dialogFooter');

                const dialogSelect = document.getElementById('dialogSelect');
                if (dialogSelect) dialogSelect.style.display = 'none';

                dialogTitle.textContent = title;
                dialogMessage.textContent = message;
                dialogInput.style.display = 'none';

                dialogFooter.innerHTML = `
                    <button class="btn btn-primary" onclick="app.hideDialog()">确定</button>
                `;

                overlay.classList.add('show');
            }

            showConfirmDialogWithRemember(title, message, rememberText, callback) {
                const overlay = document.getElementById('dialogOverlay');
                const dialogTitle = document.getElementById('dialogTitle');
                const dialogMessage = document.getElementById('dialogMessage');
                const dialogInput = document.getElementById('dialogInput');
                const dialogFooter = document.getElementById('dialogFooter');

                dialogTitle.textContent = title;
                dialogMessage.innerHTML = `
                    <div>${message}</div>
                    <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="rememberChoice" style="cursor: pointer;">
                        <label for="rememberChoice" style="cursor: pointer; font-size: 13px; color: #606266;">${rememberText}</label>
                    </div>
                `;
                dialogInput.style.display = 'none';

                dialogFooter.innerHTML = `
                    <button class="btn btn-default" onclick="app.cancelConfirmDialogWithRemember()">取消</button>
                    <button class="btn btn-primary" onclick="app.confirmDialogWithRemember()">确定</button>
                `;

                overlay.classList.add('show');
                this.dialogCallbackWithRemember = callback;
            }

            confirmDialogWithRemember() {
                const remember = document.getElementById('rememberChoice')?.checked || false;
                this.hideDialog();
                if (this.dialogCallbackWithRemember) {
                    this.dialogCallbackWithRemember(true, remember);
                    this.dialogCallbackWithRemember = null;
                }
            }

            cancelConfirmDialogWithRemember() {
                this.hideDialog();
                if (this.dialogCallbackWithRemember) {
                    this.dialogCallbackWithRemember(false, false);
                    this.dialogCallbackWithRemember = null;
                }
            }

            hideDialog() {
                const overlay = document.getElementById('dialogOverlay');
                overlay.classList.remove('show');
                const dialogSelect = document.getElementById('dialogSelect');
                if (dialogSelect) dialogSelect.style.display = 'none';
            }

            // 把指定卡片的层级提到最上层（点击/拖拽/调整大小时调用），
            // 避免卡片被压在别的卡片下面之后难以再操作。
            bringCardToFront(cardId) {
                if (!this.topZIndex) this.topZIndex = 10;
                this.topZIndex += 1;
                const el = document.getElementById('card-' + cardId);
                if (el) {
                    el.style.zIndex = this.topZIndex;
                }
            }

            // 回到卡片所在位置 / 适应视图
            // 无论当前平移到多远，都能一键把（选中的，或全部的）卡片重新
            // 缩放居中显示在可视区域内。
            fitView() {
                const target = this.getCurrentTarget();
                if (!target || target.cards.length === 0) return;

                // 如果有选中的卡片，优先只适应选中的卡片；否则适应全部卡片
                const cards = this.selectedCards.size > 0
                    ? target.cards.filter(c => this.selectedCards.has(c.id))
                    : target.cards;

                if (cards.length === 0) return;

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                cards.forEach(card => {
                    const x = card.x || 0;
                    const y = card.y || 0;
                    const w = card.width || this.settings.defaultWidth || 400;
                    const h = card.collapsed ? 50 : (card.height || this.settings.defaultHeight || 300);
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x + w);
                    maxY = Math.max(maxY, y + h);
                });

                const padding = 60;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;

                const contentWidth = Math.max(maxX - minX, 1);
                const contentHeight = Math.max(maxY - minY, 1);

                const canvasWrapper = document.getElementById('canvasWrapper');
                const canvas = document.getElementById('canvas');
                const wrapperRect = canvasWrapper.getBoundingClientRect();

                // 计算能让内容完整显示的缩放比例，并限制在允许的缩放范围内 (0.5 ~ 2)
                const scaleX = wrapperRect.width / contentWidth;
                const scaleY = wrapperRect.height / contentHeight;
                const newScale = Math.max(0.5, Math.min(2, Math.min(scaleX, scaleY)));

                const worldCenterX = (minX + maxX) / 2;
                const worldCenterY = (minY + maxY) / 2;

                // 用一个临时探针元素实测当前 transform 的换算关系，避免因为
                // scale()/translate() 组合顺序的细节假设错误导致定位偏移，
                // 保证无论具体换算公式如何都能精确居中。
                const probe = document.createElement('div');
                probe.style.position = 'absolute';
                probe.style.width = '0px';
                probe.style.height = '0px';
                probe.style.pointerEvents = 'none';
                probe.style.left = worldCenterX + 'px';
                probe.style.top = worldCenterY + 'px';
                canvas.appendChild(probe);

                const prevTransition = canvas.style.transition;
                canvas.style.transition = 'none';

                const measureAt = (px, py) => {
                    this.scale = newScale;
                    this.panX = px;
                    this.panY = py;
                    this.applyCanvasTransform();
                    void canvas.offsetHeight; // 强制重排，确保测量的是最新的变换结果
                    const r = probe.getBoundingClientRect();
                    return { x: r.left - wrapperRect.left, y: r.top - wrapperRect.top };
                };

                const p0 = measureAt(0, 0);
                const testDelta = 1000;
                const p1 = measureAt(testDelta, testDelta);

                const slopeX = (p1.x - p0.x) / testDelta;
                const slopeY = (p1.y - p0.y) / testDelta;

                const navigatorOffset = this.settings.navigatorCollapsed ? 58 : 284;
                const targetScreenX = (navigatorOffset + wrapperRect.width) / 2;
                const targetScreenY = wrapperRect.height / 2;

                this.panX = slopeX !== 0 ? (targetScreenX - p0.x) / slopeX : 0;
                this.panY = slopeY !== 0 ? (targetScreenY - p0.y) / slopeY : 0;

                this.applyCanvasTransform();

                canvas.style.transition = prevTransition;
                probe.remove();

                this.showZoomIndicator();
                this.updateMinimap();
                if (typeof this.renderConnections === 'function') {
                    this.renderConnections();
                }
            }

            // 缩放功能
            handleZoom(delta) {
                const oldScale = this.scale;
                this.scale = Math.max(0.5, Math.min(2, this.scale + delta));

                if (oldScale === this.scale) return;

                const canvas = document.getElementById('canvas');
                this.applyCanvasTransform();

                this.showZoomIndicator();
                this.updateMinimap();
                this.syncConnectionsDuringCanvasTransition();
            }

            handleZoomAtPoint(delta, mouseX, mouseY) {
                const oldScale = this.scale;
                const newScale = Math.max(0.5, Math.min(2, this.scale + delta));

                if (oldScale === newScale) return;

                // 计算鼠标位置在画布中的坐标（缩放前）
                const worldX = (mouseX - this.panX) / oldScale;
                const worldY = (mouseY - this.panY) / oldScale;

                // 更新缩放
                this.scale = newScale;

                // 计算新的偏移，使鼠标位置保持不变
                this.panX = mouseX - worldX * newScale;
                this.panY = mouseY - worldY * newScale;

                this.applyCanvasTransform();

                this.showZoomIndicator();
                this.updateMinimap();
                this.syncConnectionsDuringCanvasTransition();
            }

            shouldUsePerformanceMode(cardCount, mode = this.settings.performanceMode || 'auto') {
                if (mode === 'on') return true;
                if (mode === 'off') return false;
                return Number(cardCount || 0) >= 80;
            }

            cyclePerformanceMode() {
                const order = ['auto', 'on', 'off'];
                const current = this.settings.performanceMode || 'auto';
                this.settings.performanceMode = order[(order.indexOf(current) + 1) % order.length];
                this.applyPerformanceMode();
                this.saveSettings();
                this.showShortcutHint(`画布性能模式：${{ auto: '自动', on: '开启', off: '关闭' }[this.settings.performanceMode]}`);
            }

            applyPerformanceMode(cardCount = this.getCurrentTarget()?.cards?.length || 0) {
                const mode = this.settings.performanceMode || 'auto';
                this.performanceActive = this.shouldUsePerformanceMode(cardCount, mode);
                document.body.classList.toggle('performance-mode', this.performanceActive);
                const button = document.getElementById('toolbarPerformance');
                if (button) {
                    const labels = { auto: this.performanceActive ? '性能·自动开' : '性能·自动', on: '性能·开启', off: '性能·关闭' };
                    button.textContent = labels[mode] || labels.auto;
                    button.classList.toggle('active', this.performanceActive);
                    button.setAttribute('aria-pressed', String(this.performanceActive));
                }
                this.updatePerformanceCulling();
            }

            queuePerformanceCulling() {
                if (this._performanceCullRAF) return;
                this._performanceCullRAF = requestAnimationFrame(() => {
                    this._performanceCullRAF = null;
                    this.updatePerformanceCulling();
                });
            }

            updatePerformanceCulling() {
                const target = this.getCurrentTarget();
                const wrapper = document.getElementById('canvasWrapper');
                if (!target || !wrapper) return;
                if (!this.performanceActive) {
                    document.querySelectorAll('.card.performance-culled, #canvasConnections .performance-culled').forEach(element => element.classList.remove('performance-culled'));
                    return;
                }
                const margin = 500 / Math.max(this.scale, .01);
                const left = -this.panX / this.scale - margin;
                const top = -this.panY / this.scale - margin;
                const right = (wrapper.clientWidth - this.panX) / this.scale + margin;
                const bottom = (wrapper.clientHeight - this.panY) / this.scale + margin;
                target.cards.forEach(card => {
                    const element = document.getElementById('card-' + card.id);
                    if (!element || element.style.display === 'none') return element?.classList.remove('performance-culled');
                    const x = Number(card.x ?? 100);
                    const y = Number(card.y ?? 100);
                    const width = Number(card.width ?? this.settings.defaultWidth);
                    const height = card.collapsed ? 60 : Number(card.height ?? this.settings.defaultHeight);
                    element.classList.toggle('performance-culled', x + width < left || x > right || y + height < top || y > bottom);
                });
                document.querySelectorAll('#canvasConnections [data-from-card][data-to-card]').forEach(line => {
                    const from = document.getElementById('card-' + line.dataset.fromCard);
                    const to = document.getElementById('card-' + line.dataset.toCard);
                    line.classList.toggle('performance-culled', !!from?.classList.contains('performance-culled') && !!to?.classList.contains('performance-culled'));
                });
            }

            showZoomIndicator() {
                let indicator = document.getElementById('zoomIndicator');
                const value = `${Math.round(this.scale * 100)}%`;
                indicator.textContent = value;
                const toolbarValue = document.getElementById('toolbarZoomValue');
                if (toolbarValue) toolbarValue.textContent = value;
                indicator.classList.add('show');

                clearTimeout(this.zoomTimeout);
                this.zoomTimeout = setTimeout(() => {
                    indicator.classList.remove('show');
                }, 1000);
            }

            // 数据导入导出
            exportData() {
                const dataStr = JSON.stringify(this.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `info-collector-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                localStorage.setItem('infoCollectorLastBackupAt', String(Date.now()));
                this.updateSnapshotStatus();
            }

            exportCurrentTarget() {
                const target = this.getCurrentTarget();
                if (!target) {
                    this.showAlertDialog('提示', '当前没有活动目标');
                    return;
                }

                const dataStr = JSON.stringify(target, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.safeFilename(target.name)}-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }

            importData() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const parsed = JSON.parse(e.target.result);

                            // 单目标文件：作为新目标加入，不覆盖当前工作。
                            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.cards) && !Array.isArray(parsed.targets)) {
                                const importedTarget = this.normalizeImportedTarget(parsed, 0, true);
                                if (!importedTarget) throw new Error('INVALID_TARGET');
                                this.showConfirmDialog('导入单个目标', `将“${importedTarget.name}”作为新目标加入，现有数据不会被覆盖。`, (confirmed) => {
                                    if (!confirmed) return;
                                    this.saveGlobalHistory();
                                    this.data.targets.push(importedTarget);
                                    this.renderTabs();
                                    this.switchTarget(importedTarget.id);
                                    this.saveData();
                                    this.showAlertDialog('成功', '目标已导入');
                                });
                                return;
                            }

                            // 全量备份：校验并规范化后恢复。确认时先自动下载当前备份。
                            if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.targets)) {
                                this.showAlertDialog('错误', '无法识别该文件：请选择 v5/v6 导出的目标或完整备份 JSON');
                                return;
                            }

                            const targets = parsed.targets
                                .map((target, index) => this.normalizeImportedTarget(target, index, false))
                                .filter(Boolean);
                            if (parsed.targets.length > 0 && targets.length === 0) throw new Error('INVALID_BACKUP');

                            this.showConfirmDialog('恢复完整备份', `将恢复 ${targets.length} 个目标并替换当前工作区。继续前会自动下载当前数据备份。`, (confirmed) => {
                                if (!confirmed) return;
                                this.exportData();
                                this.saveGlobalHistory();
                                this.data = {
                                    targets,
                                    cardGroups: cloneDefaultGroups(),
                                    customGroups: Array.isArray(parsed.customGroups) ? parsed.customGroups : [],
                                    trash: Array.isArray(parsed.trash) ? parsed.trash : [],
                                    currentTargetId: targets[0]?.id || null
                                };
                                this.saveData();
                                this.renderTabs();
                                this.renderCardGroups();
                                if (targets.length > 0) this.switchTarget(targets[0].id);
                                else this.renderCanvas();
                                this.showAlertDialog('成功', '完整备份已恢复');
                            });
                        } catch (err) {
                            console.error('导入失败:', err);
                            this.showAlertDialog('错误', '导入失败：文件损坏或数据结构不受支持');
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            }

            // 事件监听
            setupEventListeners() {
                // 全局鼠标移动和释放
                document.addEventListener('mousemove', (e) => {
                    // 卡片拖拽
                    if (this.dragState) {
                        const deltaX = e.clientX - this.dragState.startX;
                        const deltaY = e.clientY - this.dragState.startY;
                        const newX = this.dragState.cardStartX + deltaX / this.scale;
                        const newY = this.dragState.cardStartY + deltaY / this.scale;

                        const cardElement = document.getElementById('card-' + this.dragState.cardId);
                        if (cardElement) {
                            cardElement.style.left = newX + 'px';
                            cardElement.style.top = newY + 'px';

                            // 更新对齐辅助线
                            this.updateAlignGuides(cardElement);

                            // 更新连线（节流到每帧最多一次，避免连续 mousemove 时反复重建）
                            this.scheduleRenderConnections();
                        }
                    }

                    // 卡片调整大小
                    if (this.resizeState) {
                        const deltaX = e.clientX - this.resizeState.startX;
                        const deltaY = e.clientY - this.resizeState.startY;
                        const newWidth = Math.max(300, this.resizeState.startWidth + deltaX / this.scale);
                        const newHeight = Math.max(200, this.resizeState.startHeight + deltaY / this.scale);

                        const cardElement = document.getElementById('card-' + this.resizeState.cardId);
                        if (cardElement) {
                            cardElement.style.width = newWidth + 'px';
                            cardElement.style.height = newHeight + 'px';
                        }

                        // 更新连线（节流）
                        this.scheduleRenderConnections();
                    }

                    // 画布拖拽
                    if (this.canvasDragState) {
                        const deltaX = e.clientX - this.canvasDragState.startX;
                        const deltaY = e.clientY - this.canvasDragState.startY;

                        const dragPanX = this.canvasDragState.initialPanX + deltaX;
                        const dragPanY = this.canvasDragState.initialPanY + deltaY;
                        this.canvasDragState.pendingPanX = dragPanX;
                        this.canvasDragState.pendingPanY = dragPanY;

                        // mousemove 的触发频率可能高于屏幕刷新率。只在下一绘制帧应用
                        // 最新位置，避免同一帧重复改 transform / 网格背景造成抖动。
                        if (!this._canvasPanRAF) {
                            this._canvasPanRAF = requestAnimationFrame(() => {
                                this._canvasPanRAF = null;
                                const state = this.canvasDragState;
                                if (!state) return;
                                this.applyCanvasTransform(state.pendingPanX, state.pendingPanY);

                                // 平移时所有连线只需整体移动，无需逐条读取布局并重建 SVG。
                                const svg = state.connectionLayer;
                                if (svg && state.hasConnections) {
                                    const offsetX = state.pendingPanX - state.initialPanX;
                                    const offsetY = state.pendingPanY - state.initialPanY;
                                    svg.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
                                }
                            });
                        }
                    }

                    // 框选
                    if (this.selectionBoxState) {
                        this.updateSelectionBox(e);
                    }
                });

                document.addEventListener('mouseup', (e) => {
                    if (this.dragState) {
                        const cardElement = document.getElementById('card-' + this.dragState.cardId);
                        if (cardElement) {
                            cardElement.classList.remove('dragging');
                            this.updateCardPosition(
                                this.dragState.cardId,
                                parseFloat(cardElement.style.left),
                                parseFloat(cardElement.style.top)
                            );
                        }
                        this.clearAlignGuides();
                        this.dragState = null;
                    }

                    if (this.resizeState) {
                        const cardElement = document.getElementById('card-' + this.resizeState.cardId);
                        if (cardElement) {
                            this.updateCardSize(
                                this.resizeState.cardId,
                                parseFloat(cardElement.style.width),
                                parseFloat(cardElement.style.height)
                            );
                        }
                        this.resizeState = null;
                    }

                    if (this.canvasDragState) {
                        const deltaX = e.clientX - this.canvasDragState.startX;
                        const deltaY = e.clientY - this.canvasDragState.startY;
                        this.panX = this.canvasDragState.initialPanX + deltaX;
                        this.panY = this.canvasDragState.initialPanY + deltaY;

                        if (this._canvasPanRAF) {
                            cancelAnimationFrame(this._canvasPanRAF);
                            this._canvasPanRAF = null;
                        }
                        this.applyCanvasTransform();

                        document.getElementById('canvasWrapper').classList.remove('dragging');
                        document.body.classList.remove('canvas-panning');
                        this.canvasDragState = null;
                        const canvasEl = document.getElementById('canvas');
                        if (canvasEl) {
                            canvasEl.style.transition = '';
                        }
                        const connectionLayer = document.getElementById('canvasConnections');
                        if (connectionLayer) connectionLayer.style.transform = '';
                        this.renderConnections();
                        this.updateMinimap();
                    }

                    if (this.selectionBoxState) {
                        this.finishSelectionBox();
                    }
                });

                // 画布拖拽和框选
                const canvasWrapper = document.getElementById('canvasWrapper');
                const canvas = document.getElementById('canvas');

                canvasWrapper.addEventListener('mousedown', (e) => {
                    if (e.target === canvasWrapper || e.target === canvas) {
                        // Shift + 拖拽 = 框选
                        if (e.shiftKey) {
                            this.startSelectionBox(e);
                        } else {
                            // 普通拖拽 = 移动画布
                            // 拖拽过程中先关掉 transform 的过渡动画：因为每次 mousemove
                            // 都会设置一个新的目标位置，如果一直带着 0.1s 缓动，画布会
                            // 一直"追着"上一个目标跑而跟不上鼠标，感觉卡顿掉帧。
                            canvas.style.transition = 'none';
                            this.canvasDragState = {
                                startX: e.clientX,
                                startY: e.clientY,
                                initialPanX: this.panX,
                                initialPanY: this.panY,
                                pendingPanX: this.panX,
                                pendingPanY: this.panY,
                                hasConnections: !!this.getCurrentTarget()?.connections?.length,
                                connectionLayer: document.getElementById('canvasConnections')
                            };
                            canvasWrapper.classList.add('dragging');
                            document.body.classList.add('canvas-panning');
                        }
                        e.preventDefault();
                    }
                });

                // 点击画布空白处清除选择
                canvasWrapper.addEventListener('click', (e) => {
                    if (e.target === canvasWrapper || e.target === canvas) {
                        if (this.selectedCards.size > 0) {
                            this.selectedCards.clear();
                            this.updateSelectionUI();
                        }
                    }
                });

                // Ctrl + 滚轮缩放
                canvasWrapper.addEventListener('wheel', (e) => {
                    if (e.ctrlKey) {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.1 : 0.1;

                        // 获取鼠标在画布容器中的位置
                        const rect = canvasWrapper.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const mouseY = e.clientY - rect.top;

                        this.handleZoomAtPoint(delta, mouseX, mouseY);
                    }
                }, { passive: false });

                // 点击外部关闭选择器
                document.addEventListener('click', (e) => {
                    const selector = document.getElementById('cardSelector');
                    const addBtn = document.getElementById('addCardBtn');
                    const toolbarTrigger = e.target.closest('#canvasToolbar [onclick*="toggleCardSelector"]');
                    if (!selector.contains(e.target) && !addBtn.contains(e.target) && !toolbarTrigger) {
                        this.hideCardSelector();
                    }

                    const dataMenu = document.getElementById('dataMenu');
                    if (dataMenu && !e.target.closest('.data-menu-wrap')) {
                        this.closeDataMenu();
                    }
                    if (!e.target.closest('.card-more-wrap')) this.closeCardMenus();
                });

                // 关闭对话框（点击遮罩层）
                document.getElementById('dialogOverlay').addEventListener('click', (e) => {
                    if (e.target.id === 'dialogOverlay') {
                        this.hideDialog();
                    }
                });

                // 搜索输入实时搜索
                document.getElementById('searchInput').addEventListener('input', (e) => {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                    } else {
                        document.getElementById('searchResults').innerHTML = '';
                    }
                });

                // 点击搜索面板外部关闭
                document.getElementById('searchPanel').addEventListener('click', (e) => {
                    if (e.target.id === 'searchPanel') {
                        this.closeSearch();
                    }
                });
            }

            // 工具方法
            getCurrentTarget() {
                return this.data.targets.find(t => t.id === this.data.currentTargetId);
            }

            toggleNavigator() {
                this.settings.navigatorCollapsed = !this.settings.navigatorCollapsed;
                document.getElementById('cardNavigator').classList.toggle('collapsed', this.settings.navigatorCollapsed);
                this.updateNavigatorToggle(this.settings.navigatorCollapsed);
                this.saveSettings();
            }

            updateNavigatorToggle(collapsed) {
                const button = document.getElementById('navigatorToggle');
                if (!button) return;
                button.textContent = collapsed ? '›' : '‹';
                button.title = collapsed ? '展开卡片导航' : '收起卡片导航';
                button.setAttribute('aria-label', button.title);
                button.setAttribute('aria-expanded', String(!collapsed));
            }

            setNavigatorStatus(status) {
                this.navigatorStatus = status;
                document.querySelectorAll('#navigatorStatusFilters .filter-chip').forEach(button => button.classList.toggle('active', button.dataset.status === status));
                this.renderNavigator();
                this.applyNavigatorFilter();
            }

            setNavigatorRisk(risk) {
                this.navigatorRisk = risk;
                this.renderNavigator();
                this.applyNavigatorFilter();
            }

            setNavigatorQuery(query) {
                this.navigatorQuery = String(query || '').trim().toLowerCase();
                this.renderNavigator();
                this.applyNavigatorFilter();
            }

            setNavigatorSource(source) {
                this.navigatorSource = source || 'all';
                this.renderNavigator();
                this.applyNavigatorFilter();
            }

            setNavigatorTag(tag) {
                this.navigatorTag = tag || 'all';
                this.renderNavigator();
                this.applyNavigatorFilter();
            }

            resetNavigatorFilters() {
                this.navigatorStatus = 'all';
                this.navigatorRisk = 'all';
                this.navigatorQuery = '';
                this.navigatorSource = 'all';
                this.navigatorTag = 'all';
                const query = document.getElementById('navigatorQueryFilter');
                const risk = document.getElementById('navigatorRiskFilter');
                const source = document.getElementById('navigatorSourceFilter');
                const tag = document.getElementById('navigatorTagFilter');
                if (query) query.value = '';
                if (risk) risk.value = 'all';
                if (source) source.value = 'all';
                if (tag) tag.value = 'all';
                document.querySelectorAll('#navigatorStatusFilters .filter-chip').forEach(button => button.classList.toggle('active', button.dataset.status === 'all'));
                this.renderNavigator();
                this.applyNavigatorFilter();
            }

            getNavigatorFilterState() {
                return { query: this.navigatorQuery, status: this.navigatorStatus, risk: this.navigatorRisk, source: this.navigatorSource, tag: this.navigatorTag };
            }

            cardMatchesNavigatorFilters(card, filters = {}) {
                const status = filters.status || 'all';
                const risk = filters.risk || 'all';
                const source = filters.source || 'all';
                const tag = filters.tag || 'all';
                const query = String(filters.query || '').trim().toLowerCase();
                const sourceName = typeof card.mcpSource === 'object' ? (card.mcpSource.tool || card.mcpSource.agent || '') : (card.mcpSource || 'manual');
                const haystack = `${card.title || ''}\n${card.data || ''}\n${card.desc || ''}`.toLowerCase();
                return (status === 'all' || card.status === status) &&
                    (risk === 'all' || card.risk === risk) &&
                    (source === 'all' || sourceName === source) &&
                    (tag === 'all' || (card.tags || []).includes(tag)) &&
                    (!query || haystack.includes(query));
            }

            cardMatchesNavigator(card) {
                return this.cardMatchesNavigatorFilters(card, this.getNavigatorFilterState());
            }

            updateNavigatorFilterOptions(cards) {
                const sourceSelect = document.getElementById('navigatorSourceFilter');
                const tagSelect = document.getElementById('navigatorTagFilter');
                const sources = [...new Set(cards.map(card => typeof card.mcpSource === 'object' ? (card.mcpSource.tool || card.mcpSource.agent) : card.mcpSource).filter(Boolean))].sort();
                const tags = [...new Set(cards.flatMap(card => card.tags || []))].sort();
                const fill = (select, items, firstLabel, selected) => {
                    if (!select) return;
                    select.innerHTML = `<option value="all">${firstLabel}</option>` + items.map(item => `<option value="${this.escapeHTML(item)}">${this.escapeHTML(item)}</option>`).join('');
                    select.value = items.includes(selected) ? selected : 'all';
                };
                fill(sourceSelect, sources, '全部来源', this.navigatorSource);
                fill(tagSelect, tags, '全部标签', this.navigatorTag);
                if (sourceSelect?.value === 'all' && this.navigatorSource !== 'all') this.navigatorSource = 'all';
                if (tagSelect?.value === 'all' && this.navigatorTag !== 'all') this.navigatorTag = 'all';
            }

            renderNavigator() {
                const list = document.getElementById('navigatorList');
                if (!list) return;
                const target = this.getCurrentTarget();
                const cards = target?.cards || [];
                this.updateNavigatorFilterOptions(cards);
                const statusLabels = { todo: '待办', doing: '进行中', done: '完成' };
                const riskLabels = { critical: '严重', high: '高危', medium: '中危', low: '低危', info: '信息' };
                list.innerHTML = '';
                const visible = cards.filter(card => this.cardMatchesNavigator(card));
                const activeFilters = this.navigatorStatus !== 'all' || this.navigatorRisk !== 'all' || this.navigatorSource !== 'all' || this.navigatorTag !== 'all' || !!this.navigatorQuery;
                document.getElementById('navigatorFilterReset')?.classList.toggle('show', activeFilters);
                if (visible.length === 0) {
                    list.innerHTML = `<div class="navigator-empty">${cards.length ? '当前筛选条件下没有卡片' : '添加卡片后会在这里形成可定位的任务目录'}</div>`;
                    return;
                }
                visible.forEach(card => {
                    const item = document.createElement('div');
                    item.className = 'navigator-item';
                    item.onclick = () => this.locateCard(card.id);
                    item.innerHTML = `<span class="navigator-item-icon">${this.escapeHTML(card.icon)}</span><div class="navigator-item-copy"><div class="navigator-item-title">${this.escapeHTML(card.title)}</div><div class="navigator-item-meta">${statusLabels[card.status] || '待办'} · ${riskLabels[card.risk] || '信息'}${card.tags?.length ? ' · ' + this.escapeHTML(card.tags.slice(0,2).join(' / ')) : ''}</div></div><span class="risk-dot ${card.risk || 'info'}"></span>`;
                    list.appendChild(item);
                });
            }

            applyNavigatorFilter() {
                const target = this.getCurrentTarget();
                if (!target) return;
                target.cards.forEach(card => {
                    const element = document.getElementById('card-' + card.id);
                    if (element) element.style.display = this.cardMatchesNavigator(card) ? '' : 'none';
                });
                this.renderConnections();
                this.updatePerformanceCulling();
            }

            editCardMeta(cardId) {
                const card = this.getCurrentTarget()?.cards.find(item => item.id === cardId);
                if (!card) return;
                this.currentMetaCardId = cardId;
                document.getElementById('cardRiskInput').value = card.risk || 'info';
                document.getElementById('cardTagsInput').value = (card.tags || []).join(', ');
                document.getElementById('cardMetaModal').classList.add('show');
            }

            closeCardMeta() {
                document.getElementById('cardMetaModal').classList.remove('show');
                this.currentMetaCardId = null;
            }

            saveCardMeta() {
                const card = this.getCurrentTarget()?.cards.find(item => item.id === this.currentMetaCardId);
                if (!card) return this.closeCardMeta();
                this.saveHistory();
                this.recordCardVersion(card, '属性修改');
                card.risk = document.getElementById('cardRiskInput').value;
                card.tags = [...new Set(document.getElementById('cardTagsInput').value.split(/[,，]/).map(tag => tag.trim()).filter(Boolean))].slice(0, 12);
                card.updatedAt = Date.now();
                this.closeCardMeta();
                this.renderCanvas();
                this.saveData();
            }

            normalizeAssetIdentity(card) {
                if (!card) return null;
                const text = `${card.data || ''}\n${card.title || ''}`;
                const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i);
                if (urlMatch) {
                    try {
                        const url = new URL(urlMatch[0].replace(/[),.;]+$/, ''));
                        const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
                        return { key: `url:${url.protocol}//${url.host.toLowerCase()}${path}${url.search}`, label: `${url.host}${path}` };
                    } catch (_) {}
                }
                const ipMatch = text.match(/\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/);
                if (ipMatch) return { key: `ip:${ipMatch[0]}`, label: ipMatch[0] };
                const firstLine = String(card.data || '').split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';
                if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(firstLine)) {
                    const domain = firstLine.toLowerCase();
                    return { key: `domain:${domain}`, label: domain };
                }
                if (card.mcpKey) return { key: `mcp:${card.mcpKey}`, label: card.mcpKey };
                return null;
            }

            getDuplicateGroups(target = this.getCurrentTarget()) {
                const grouped = new Map();
                (target?.cards || []).forEach(card => {
                    const identity = this.normalizeAssetIdentity(card);
                    if (!identity) return;
                    if (!grouped.has(identity.key)) grouped.set(identity.key, { id: identity.key, key: identity.key, label: identity.label, cards: [] });
                    grouped.get(identity.key).cards.push(card);
                });
                return [...grouped.values()].filter(group => group.cards.length > 1).sort((a, b) => b.cards.length - a.cards.length);
            }

            openDuplicateCenter() {
                this.closeProjectOverview();
                this.renderDuplicateCenter();
                document.getElementById('duplicateCenterModal')?.classList.add('show');
            }

            closeDuplicateCenter() { document.getElementById('duplicateCenterModal')?.classList.remove('show'); }

            renderDuplicateCenter() {
                const list = document.getElementById('duplicateCenterList');
                if (!list) return;
                const groups = this.getDuplicateGroups();
                list.innerHTML = '';
                if (!groups.length) {
                    list.innerHTML = '<div class="navigator-empty">当前目标没有发现高置信度重复结果。<br>仅匹配相同完整 URL、IP、单值域名或 MCP key。</div>';
                    return;
                }
                groups.forEach(group => {
                    const section = document.createElement('section');
                    section.className = 'duplicate-group';
                    section.innerHTML = `<div class="duplicate-group-head"><div class="duplicate-key">${this.escapeHTML(group.label)}</div><span class="duplicate-count">${group.cards.length} 张重复</span></div><div class="duplicate-cards"></div><div class="duplicate-group-actions"></div>`;
                    const cards = section.querySelector('.duplicate-cards');
                    group.cards.forEach((card, index) => {
                        const row = document.createElement('div');
                        row.className = 'duplicate-card-row';
                        row.innerHTML = `<span>${index === 0 ? '保留' : '合并'}</span><strong>${this.escapeHTML(card.title || '未命名卡片')}</strong><span>${this.escapeHTML(card.mcpSource?.tool || '手动')}</span>`;
                        cards.appendChild(row);
                    });
                    const locate = document.createElement('button');
                    locate.textContent = '定位这组';
                    locate.onclick = () => {
                        this.closeDuplicateCenter();
                        this.selectedCards = new Set(group.cards.map(card => card.id));
                        this.updateSelectionUI();
                        this.ensureCardsVisible(group.cards.map(card => card.id), { force: true });
                    };
                    const merge = document.createElement('button');
                    merge.textContent = `合并到「${group.cards[0].title || '第一张'}」`;
                    merge.onclick = () => this.mergeDuplicateGroup(group.key, group.cards[0].id);
                    section.querySelector('.duplicate-group-actions').append(locate, merge);
                    list.appendChild(section);
                });
            }

            mergeDuplicateGroup(groupKey, keeperId) {
                const target = this.getCurrentTarget();
                const group = this.getDuplicateGroups(target).find(item => item.key === groupKey);
                const keeper = group?.cards.find(card => card.id === keeperId) || group?.cards[0];
                if (!target || !group || !keeper || group.cards.length < 2) return;
                const others = group.cards.filter(card => card.id !== keeper.id);
                this.showConfirmDialog('合并重复结果', `保留“${keeper.title}”，并将其余 ${others.length} 张卡片合并后移入回收站？`, confirmed => {
                    if (!confirmed) return;
                    this.saveHistory();
                    this.recordCardVersion(keeper, '重复结果合并');
                    const lines = new Set(String(keeper.data || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean));
                    others.forEach(card => String(card.data || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).forEach(line => lines.add(line)));
                    keeper.data = [...lines].join('\n');
                    keeper.tags = [...new Set(group.cards.flatMap(card => card.tags || []))].slice(0, 20);
                    const riskOrder = ['info', 'low', 'medium', 'high', 'critical'];
                    keeper.risk = group.cards.map(card => card.risk || 'info').sort((a, b) => riskOrder.indexOf(b) - riskOrder.indexOf(a))[0];
                    keeper.mergedFrom = [...(keeper.mergedFrom || []), ...others.map(card => ({ id: card.id, title: card.title, source: card.mcpSource || null, mergedAt: Date.now() }))].slice(-30);
                    keeper.updatedAt = Date.now();
                    others.forEach(card => this.moveCardToTrash(target, card.id));
                    this.selectedCards = new Set([keeper.id]);
                    this.renderCanvas();
                    this.updateSelectionUI();
                    this.saveData();
                    this.renderDuplicateCenter();
                    this.showShortcutHint(`已合并 ${others.length + 1} 张重复卡片，可撤销或从回收站恢复`);
                });
            }

            buildProjectOverview(target = this.getCurrentTarget()) {
                const cards = target?.cards || [];
                const risks = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
                const statuses = { todo: 0, doing: 0, done: 0 };
                const tools = {};
                let agentCards = 0;
                cards.forEach(card => {
                    risks[card.risk || 'info'] = (risks[card.risk || 'info'] || 0) + 1;
                    statuses[card.status || 'todo'] = (statuses[card.status || 'todo'] || 0) + 1;
                    if (card.mcpSource) {
                        agentCards += 1;
                        const tool = card.mcpSource?.tool || card.mcpSource?.agent || 'Agent';
                        tools[tool] = (tools[tool] || 0) + 1;
                    }
                });
                return { total: cards.length, done: statuses.done, todo: statuses.todo, doing: statuses.doing, risks, statuses, tools, agentCards, duplicateGroups: this.getDuplicateGroups(target).length };
            }

            openProjectOverview() {
                const target = this.getCurrentTarget();
                const content = document.getElementById('projectOverviewContent');
                if (!target || !content) return;
                const stats = this.buildProjectOverview(target);
                document.getElementById('overviewTitle').textContent = target.name + ' · 项目概览';
                const pct = value => stats.total ? Math.round(value / stats.total * 100) : 0;
                const riskLabels = { critical: '严重', high: '高危', medium: '中危', low: '低危', info: '信息' };
                const riskRows = Object.entries(stats.risks).map(([key, value]) => `<div class="overview-bar-row"><span>${riskLabels[key]}</span><div class="overview-bar"><span style="width:${pct(value)}%"></span></div><b>${value}</b></div>`).join('');
                const statusRows = [['done','已完成'],['doing','进行中'],['todo','待办']].map(([key,label]) => `<div class="overview-bar-row"><span>${label}</span><div class="overview-bar"><span style="width:${pct(stats.statuses[key])}%"></span></div><b>${stats.statuses[key]}</b></div>`).join('');
                const tools = Object.entries(stats.tools).sort((a,b) => b[1]-a[1]).map(([tool,count]) => `<span class="overview-tool">${this.escapeHTML(tool)} · ${count}</span>`).join('') || '<span class="agent-empty">暂无 Agent 来源</span>';
                content.innerHTML = `<div class="overview-hero"><div class="overview-stat primary"><div class="overview-stat-label">当前目标卡片</div><div class="overview-stat-value">${stats.total}</div></div><div class="overview-stat"><div class="overview-stat-label">完成率</div><div class="overview-stat-value">${pct(stats.done)}%</div></div><div class="overview-stat"><div class="overview-stat-label">Agent 结果</div><div class="overview-stat-value">${stats.agentCards}</div></div><div class="overview-stat"><div class="overview-stat-label">重复组</div><div class="overview-stat-value">${stats.duplicateGroups}</div></div></div><div class="overview-grid"><section class="overview-panel"><h4>风险分布</h4>${riskRows}</section><section class="overview-panel"><h4>处理进度</h4>${statusRows}</section><section class="overview-panel" style="grid-column:1/-1"><h4>来源工具覆盖</h4><div class="overview-tools">${tools}</div></section></div>`;
                document.getElementById('projectOverviewModal')?.classList.add('show');
            }

            closeProjectOverview() { document.getElementById('projectOverviewModal')?.classList.remove('show'); }

            openCardHistory(cardId) {
                const card = this.getCurrentTarget()?.cards.find(item => item.id === cardId);
                const content = document.getElementById('cardHistoryContent');
                if (!card || !content) return;
                this.currentHistoryCardId = cardId;
                document.getElementById('cardHistoryTitle').textContent = card.title + ' · 来源与历史';
                const source = typeof card.mcpSource === 'object' ? card.mcpSource : {};
                const entries = (card.history || []).map(entry => `<article class="history-entry"><div class="history-entry-title"><span>${this.escapeHTML(entry.reason || '版本记录')}</span><button class="text-button" onclick="app.restoreCardVersion('${card.id}','${entry.id}')">恢复此版本</button></div><div class="history-entry-meta">${this.escapeHTML(entry.changedBy || entry.source?.tool || 'browser')} · ${new Date(entry.createdAt || Date.now()).toLocaleString('zh-CN')}</div><div class="history-entry-preview">${this.escapeHTML(String(entry.data || '').slice(0, 180) || '空内容')}</div></article>`).join('') || '<div class="navigator-empty">还没有历史版本。下一次 Agent 覆盖、内容编辑、状态或属性修改时会自动记录。</div>';
                content.innerHTML = `<div class="provenance-card"><div class="provenance-field"><span>Agent</span><strong>${this.escapeHTML(source.agent || '手动')}</strong></div><div class="provenance-field"><span>工具</span><strong>${this.escapeHTML(source.tool || '工作台')}</strong></div><div class="provenance-field"><span>批次</span><strong title="${this.escapeHTML(source.run_id || '')}">${this.escapeHTML(source.run_id || '无')}</strong></div><div class="provenance-field"><span>最后更新</span><strong>${new Date(card.updatedAt || card.createdAt || Date.now()).toLocaleString('zh-CN')}</strong></div></div><h4 class="history-heading">版本记录 · ${(card.history || []).length}</h4><div class="history-list">${entries}</div>`;
                document.getElementById('cardHistoryModal')?.classList.add('show');
            }

            closeCardHistory() { document.getElementById('cardHistoryModal')?.classList.remove('show'); this.currentHistoryCardId = null; }

            restoreCardVersion(cardId, versionId) {
                const card = this.getCurrentTarget()?.cards.find(item => item.id === cardId);
                const version = card?.history?.find(item => item.id === versionId);
                if (!card || !version) return;
                this.showConfirmDialog('恢复历史版本', '当前内容会先保存为一个版本，然后恢复所选历史。继续吗？', confirmed => {
                    if (!confirmed) return;
                    this.saveHistory();
                    this.recordCardVersion(card, '恢复前版本');
                    card.title = version.title || card.title;
                    card.data = version.data || '';
                    card.status = version.status || card.status;
                    card.risk = version.risk || card.risk;
                    card.tags = [...(version.tags || [])];
                    card.updatedAt = Date.now();
                    this.renderCanvas();
                    this.saveData();
                    this.openCardHistory(cardId);
                });
            }

            getCommandItems() {
                const commands = [
                    { id: 'overview', icon: '◫', label: '打开项目概览', description: '查看进度、风险、来源和重复情况', type: '项目', action: () => this.openProjectOverview() },
                    { id: 'duplicates', icon: '≋', label: '检查重复结果', description: '查找相同 URL、IP、域名或 MCP key', type: '治理', action: () => this.openDuplicateCenter() },
                    { id: 'agent-inbox', icon: '↧', label: '打开 Agent 结果收件箱', description: '处理最新扫描批次', type: 'Agent', action: () => this.toggleAgentPanel(true) },
                    { id: 'latest-agent', icon: '⌖', label: '定位最新 Agent 结果', description: '跳转到最近写入的一批卡片', type: 'Agent', action: () => {
                        if (this._lastAgentReceipt) this.openLastAgentResult();
                        else { const batch = this.buildAgentBatches()[0]; if (batch) this.openAgentBatch(batch.key); else this.showShortcutHint('还没有 Agent 结果'); }
                    } },
                    { id: 'high-risk', icon: '!', label: '只看高危卡片', description: '清除其他筛选并筛选高危', type: '筛选', action: () => {
                        this.resetNavigatorFilters();
                        const select = document.getElementById('navigatorRiskFilter');
                        if (select) select.value = 'high';
                        this.setNavigatorRisk('high');
                    } },
                    { id: 'add-card', icon: '+', label: '添加卡片', description: '打开卡片模板选择器', type: '画布', action: () => this.toggleCardSelector() },
                    { id: 'fit-view', icon: '⌗', label: '适应画布', description: '把当前目标卡片放回视野', type: '画布', action: () => this.fitView() },
                    { id: 'performance', icon: '↯', label: '切换性能模式', description: `当前：${this.settings.performanceMode || 'auto'}`, type: '画布', action: () => this.cyclePerformanceMode() },
                    { id: 'export-report', icon: '⇧', label: '导出项目报告', description: '生成当前工作台 HTML 报告', type: '导出', action: () => this.exportHTMLReport() },
                    { id: 'settings', icon: '⌘', label: '打开设置', description: '主题、字体、画布与保存设置', type: '系统', action: () => this.toggleSettings() }
                ];
                (this.data.targets || []).forEach(target => commands.push({ id: 'target:' + target.id, icon: '◎', label: '切换到 ' + target.name, description: `${target.cards?.length || 0} 张卡片`, type: '目标', action: () => this.switchTarget(target.id) }));
                return commands;
            }

            openCommandPalette() {
                const overlay = document.getElementById('commandPalette');
                const input = document.getElementById('commandPaletteInput');
                if (!overlay || !input) return;
                if (overlay.classList.contains('show')) return this.closeCommandPalette();
                overlay.classList.add('show');
                input.value = '';
                this.commandPaletteIndex = 0;
                this.renderCommandPalette('');
                overlay.onclick = event => { if (event.target === overlay) this.closeCommandPalette(); };
                setTimeout(() => input.focus(), 30);
            }

            closeCommandPalette() {
                document.getElementById('commandPalette')?.classList.remove('show');
                this.visibleCommandItems = [];
                this.commandPaletteIndex = 0;
            }

            renderCommandPalette(query = '') {
                const list = document.getElementById('commandPaletteList');
                if (!list) return;
                const needle = String(query).trim().toLowerCase();
                this.visibleCommandItems = this.getCommandItems().filter(item => !needle || `${item.label} ${item.description} ${item.type}`.toLowerCase().includes(needle));
                this.commandPaletteIndex = Math.min(this.commandPaletteIndex, Math.max(0, this.visibleCommandItems.length - 1));
                list.innerHTML = '';
                if (!this.visibleCommandItems.length) { list.innerHTML = '<div class="command-empty">没有匹配的命令</div>'; return; }
                this.visibleCommandItems.forEach((item, index) => {
                    const row = document.createElement('div');
                    row.className = 'command-item' + (index === this.commandPaletteIndex ? ' active' : '');
                    row.innerHTML = `<span class="command-item-icon">${this.escapeHTML(item.icon)}</span><div><strong>${this.escapeHTML(item.label)}</strong><small>${this.escapeHTML(item.description)}</small></div><span class="command-item-type">${this.escapeHTML(item.type)}</span>`;
                    row.onmouseenter = () => { this.commandPaletteIndex = index; this.updateCommandSelection(); };
                    row.onclick = () => this.executeCommand(item);
                    list.appendChild(row);
                });
            }

            updateCommandSelection() {
                document.querySelectorAll('#commandPaletteList .command-item').forEach((row, index) => row.classList.toggle('active', index === this.commandPaletteIndex));
                document.querySelector('#commandPaletteList .command-item.active')?.scrollIntoView({ block: 'nearest' });
            }

            moveCommandSelection(delta) {
                if (!this.visibleCommandItems.length) return;
                this.commandPaletteIndex = (this.commandPaletteIndex + delta + this.visibleCommandItems.length) % this.visibleCommandItems.length;
                this.updateCommandSelection();
            }

            executeSelectedCommand() { const item = this.visibleCommandItems[this.commandPaletteIndex]; if (item) this.executeCommand(item); }

            executeCommand(item) { this.closeCommandPalette(); setTimeout(() => item.action(), 20); }

            zoomFromToolbar(delta) {
                const wrapper = document.getElementById('canvasWrapper');
                this.handleZoomAtPoint(delta, wrapper.clientWidth / 2, wrapper.clientHeight / 2);
            }

            resetZoom() {
                const delta = 1 - this.scale;
                if (Math.abs(delta) < .001) return;
                const wrapper = document.getElementById('canvasWrapper');
                this.handleZoomAtPoint(delta, wrapper.clientWidth / 2, wrapper.clientHeight / 2);
            }

            toggleCanvasLock() {
                this.settings.canvasLocked = !this.settings.canvasLocked;
                this.applyV7Settings();
                this.saveSettings();
                this.showShortcutHint(this.settings.canvasLocked ? '卡片位置已锁定' : '卡片位置已解锁');
            }

            pushTrash(type, payload, targetId, label) {
                if (!Array.isArray(this.data.trash)) this.data.trash = [];
                this.data.trash.unshift({ id: 'trash-' + Date.now() + '-' + Math.random().toString(36).slice(2,6), type, payload: JSON.parse(JSON.stringify(payload)), targetId, label, deletedAt: Date.now() });
                this.data.trash = this.data.trash.slice(0, 50);
            }

            moveCardToTrash(target, cardId) {
                const card = target.cards.find(item => item.id === cardId);
                if (!card) return;
                const connections = (target.connections || []).filter(conn => conn.from === cardId || conn.to === cardId);
                this.pushTrash('card', { card, connections }, target.id, card.title);
                target.cards = target.cards.filter(item => item.id !== cardId);
                target.connections = (target.connections || []).filter(conn => conn.from !== cardId && conn.to !== cardId);
                this.selectedCards.delete(cardId);
            }

            openTrash() {
                this.renderTrash();
                document.getElementById('trashModal').classList.add('show');
            }

            closeTrash() { document.getElementById('trashModal').classList.remove('show'); }

            renderTrash() {
                const list = document.getElementById('trashList');
                const items = this.data.trash || [];
                list.innerHTML = items.length ? '' : '<div class="navigator-empty">回收站是空的</div>';
                items.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'trash-item';
                    row.innerHTML = `<div class="trash-item-copy"><div class="trash-item-title">${item.type === 'target' ? '目标' : '卡片'} · ${this.escapeHTML(item.label || '未命名')}</div><div class="trash-item-meta">${new Date(item.deletedAt).toLocaleString('zh-CN')}</div></div><button class="btn btn-default" data-restore="${item.id}">恢复</button>`;
                    row.querySelector('[data-restore]').onclick = () => this.restoreTrash(item.id);
                    list.appendChild(row);
                });
            }

            restoreTrash(trashId) {
                const index = (this.data.trash || []).findIndex(item => item.id === trashId);
                if (index < 0) return;
                const item = this.data.trash[index];
                if (item.type === 'target') {
                    const target = item.payload;
                    if (this.data.targets.some(existing => existing.id === target.id)) target.id = 'target-restored-' + Date.now();
                    this.data.targets.push(target);
                    this.data.currentTargetId = target.id;
                } else {
                    const target = this.data.targets.find(existing => existing.id === item.targetId) || this.getCurrentTarget();
                    if (!target) return this.showAlertDialog('无法恢复', '原目标不存在，请先创建或恢复一个目标');
                    const restored = item.payload.card;
                    if (target.cards.some(card => card.id === restored.id)) restored.id = 'card-restored-' + Date.now();
                    target.cards.push(restored);
                    target.connections = [...(target.connections || []), ...(item.payload.connections || []).filter(conn => target.cards.some(card => card.id === conn.from) && target.cards.some(card => card.id === conn.to))];
                }
                this.data.trash.splice(index, 1);
                this.renderTabs();
                this.renderCanvas();
                this.renderTrash();
                this.saveData();
                this.showShortcutHint('已从回收站恢复');
            }

            emptyTrash() {
                if (!(this.data.trash || []).length) return;
                this.showConfirmDialog('清空回收站', '此操作无法撤销，确定永久删除？', confirmed => {
                    if (!confirmed) return;
                    this.data.trash = [];
                    this.renderTrash();
                    this.saveData();
                });
            }

            async updateStorageEstimate() {
                const label = document.getElementById('storageUsageText');
                if (!label) return;
                try {
                    if (navigator.storage?.estimate) {
                        const estimate = await navigator.storage.estimate();
                        const used = estimate.usage || new Blob([localStorage.getItem('infoCollectorData') || '']).size;
                        const quota = estimate.quota || 0;
                        label.textContent = quota ? `${this.formatBytes(used)} / ${this.formatBytes(quota)}` : `已使用 ${this.formatBytes(used)}`;
                    } else {
                        label.textContent = `已使用 ${this.formatBytes(new Blob([localStorage.getItem('infoCollectorData') || '']).size)}`;
                    }
                } catch { label.textContent = '存储状态不可用'; }
            }

            formatBytes(bytes) {
                if (!bytes) return '0 KB';
                const units = ['B','KB','MB','GB'];
                const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
                return `${(bytes / Math.pow(1024,index)).toFixed(index ? 1 : 0)} ${units[index]}`;
            }

            createSnapshot() {
                try {
                    const snapshots = JSON.parse(localStorage.getItem('infoCollectorSnapshots') || '[]');
                    snapshots.unshift({ id: 'snapshot-' + Date.now(), createdAt: Date.now(), data: this.data });
                    localStorage.setItem('infoCollectorSnapshots', JSON.stringify(snapshots.slice(0, 3)));
                    this.updateSnapshotStatus();
                    this.updateStorageEstimate();
                    this.showShortcutHint('本地快照已创建');
                } catch (error) {
                    this.showAlertDialog('快照失败', '浏览器存储空间不足，请导出完整备份');
                }
            }

            updateSnapshotStatus() {
                const label = document.getElementById('lastSnapshotText');
                if (!label) return;
                try {
                    const latest = JSON.parse(localStorage.getItem('infoCollectorSnapshots') || '[]')[0];
                    const backupAt = Number(localStorage.getItem('infoCollectorLastBackupAt') || 0);
                    const snapshotText = latest ? '快照 ' + new Date(latest.createdAt).toLocaleDateString('zh-CN') : '无快照';
                    const backupText = backupAt ? '备份 ' + new Date(backupAt).toLocaleDateString('zh-CN') : '无导出备份';
                    label.textContent = `${snapshotText} · ${backupText}`;
                } catch { label.textContent = '快照状态不可用'; }
            }

            restoreLatestSnapshot() {
                let snapshot;
                try { snapshot = JSON.parse(localStorage.getItem('infoCollectorSnapshots') || '[]')[0]; } catch {}
                if (!snapshot) return this.showAlertDialog('没有快照', '请先创建一个本地快照');
                this.showConfirmDialog('恢复最近快照', `将恢复 ${new Date(snapshot.createdAt).toLocaleString('zh-CN')} 的状态，当前数据会先自动导出备份。`, confirmed => {
                    if (!confirmed) return;
                    this.exportData();
                    this.data = JSON.parse(JSON.stringify(snapshot.data));
                    if (!Array.isArray(this.data.trash)) this.data.trash = [];
                    this.renderTabs();
                    if (this.data.targets.length) this.switchTarget(this.data.targets[0].id); else this.renderCanvas();
                    this.saveData();
                    this.showAlertDialog('成功', '最近快照已恢复');
                });
            }

            populateConnectionTypes() {
                const select = document.getElementById('connectionTypeInput');
                if (select) select.innerHTML = CONNECTION_TYPES.map(type => `<option value="${type.id}">${this.escapeHTML(type.label)}</option>`).join('');
            }

            startConnectionDrag(event, sourceCardId, sourcePort) {
                event.stopPropagation(); event.preventDefault();
                const svg = document.getElementById('canvasConnections');
                const card = document.getElementById('card-' + sourceCardId);
                if (!svg || !card) return;
                const svgRect = svg.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                const startX = sourcePort === 'out' ? cardRect.right - svgRect.left : cardRect.left - svgRect.left;
                const startY = cardRect.top + cardRect.height / 2 - svgRect.top;
                const draft = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                draft.setAttribute('class', 'connection-draft');
                draft.setAttribute('x1', startX); draft.setAttribute('y1', startY); draft.setAttribute('x2', startX); draft.setAttribute('y2', startY);
                svg.appendChild(draft);
                const move = e => { draft.setAttribute('x2', e.clientX - svgRect.left); draft.setAttribute('y2', e.clientY - svgRect.top); };
                const up = e => {
                    document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); draft.remove();
                    const targetCard = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card');
                    const targetId = targetCard?.id?.replace(/^card-/, '');
                    if (!targetId || targetId === sourceCardId) return;
                    const target = this.getCurrentTarget();
                    if ((target.connections || []).some(conn => conn.from === sourceCardId && conn.to === targetId)) return this.showShortcutHint('这条连线已存在');
                    const connection = { id: 'conn-' + Date.now(), from: sourcePort === 'out' ? sourceCardId : targetId, to: sourcePort === 'out' ? targetId : sourceCardId, type: 'related' };
                    target.connections = [...(target.connections || []), connection];
                    this.saveData(); this.renderConnections(); this.openConnectionEditor(connection.id);
                };
                document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
            }

            openConnectionEditor(connectionId) {
                const connection = this.getCurrentTarget()?.connections?.find(item => item.id === connectionId);
                if (!connection) return;
                this.editingConnectionId = connectionId;
                document.getElementById('connectionTypeInput').value = connection.type || 'related';
                document.getElementById('connectionModal').classList.add('show');
            }

            closeConnectionEditor() { document.getElementById('connectionModal').classList.remove('show'); this.editingConnectionId = null; }
            saveConnectionEditor() { const conn = this.getCurrentTarget()?.connections?.find(item => item.id === this.editingConnectionId); if (!conn) return this.closeConnectionEditor(); conn.type = document.getElementById('connectionTypeInput').value; this.closeConnectionEditor(); this.saveData(); this.renderConnections(); }
            reverseEditingConnection() { const conn = this.getCurrentTarget()?.connections?.find(item => item.id === this.editingConnectionId); if (!conn) return; [conn.from, conn.to] = [conn.to, conn.from]; this.saveConnectionEditor(); }
            deleteEditingConnection() { const id = this.editingConnectionId; this.closeConnectionEditor(); if (id) { const target = this.getCurrentTarget(); target.connections = (target.connections || []).filter(conn => conn.id !== id); this.saveData(); this.renderConnections(); } }

            updateWorkspaceMeta() {
                const target = this.getCurrentTarget();
                const name = document.getElementById('workspaceTargetName');
                const fill = document.getElementById('workspaceProgressFill');
                const text = document.getElementById('workspaceProgressText');
                if (!name || !fill || !text) return;

                if (!target) {
                    name.textContent = '尚未创建目标';
                    fill.style.width = '0%';
                    text.textContent = '0/0 完成';
                    return;
                }

                const cards = Array.isArray(target.cards) ? target.cards : [];
                const done = cards.filter(card => card.status === 'done').length;
                const percent = cards.length ? Math.round(done / cards.length * 100) : 0;
                name.textContent = target.name || '未命名目标';
                name.title = '双击上方标签可重命名';
                fill.style.width = percent + '%';
                text.textContent = `${done}/${cards.length} 完成`;
            }

            escapeHTML(value) {
                return String(value ?? '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            sanitizeHTML(html) {
                const template = document.createElement('template');
                template.innerHTML = String(html || '');
                template.content.querySelectorAll('script, iframe, object, embed, style, link, meta, base, form').forEach(node => node.remove());
                template.content.querySelectorAll('*').forEach(node => {
                    [...node.attributes].forEach(attr => {
                        const key = attr.name.toLowerCase();
                        const value = attr.value.trim().toLowerCase();
                        if (key.startsWith('on') || key === 'srcdoc' || ((key === 'href' || key === 'src') && /^(javascript|data:text\/html):/.test(value))) {
                            node.removeAttribute(attr.name);
                        }
                    });
                });
                return template.innerHTML;
            }

            safeFilename(value) {
                return String(value || '未命名目标').replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').slice(0, 80);
            }

            normalizeImportedTarget(rawTarget, index = 0, forceNewId = false) {
                if (!rawTarget || typeof rawTarget !== 'object' || !Array.isArray(rawTarget.cards)) return null;
                const stamp = Date.now() + '-' + index;
                const safeId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
                const usedCardIds = new Set();

                const cards = rawTarget.cards.map((rawCard, cardIndex) => {
                    const card = rawCard && typeof rawCard === 'object' ? rawCard : {};
                    let id = safeId(card.id) ? card.id : `card-import-${stamp}-${cardIndex}`;
                    if (usedCardIds.has(id)) id = `card-import-${stamp}-${cardIndex}`;
                    usedCardIds.add(id);
                    return {
                        ...card,
                        id,
                        icon: String(card.icon || '📝').slice(0, 16),
                        title: String(card.title || '未命名卡片').slice(0, 120),
                        desc: String(card.desc || '').slice(0, 500),
                        data: String(card.data || ''),
                        status: ['todo', 'doing', 'done'].includes(card.status) ? card.status : 'todo',
                        viewMode: ['edit', 'markdown'].includes(card.viewMode) ? card.viewMode : 'edit',
                        risk: ['critical','high','medium','low','info'].includes(card.risk) ? card.risk : 'info',
                        tags: Array.isArray(card.tags) ? card.tags.map(tag => String(tag).slice(0,40)).slice(0,12) : []
                    };
                });

                const targetId = !forceNewId && safeId(rawTarget.id) ? rawTarget.id : `target-import-${stamp}`;
                return {
                    ...rawTarget,
                    id: targetId,
                    name: String(rawTarget.name || `导入目标 ${index + 1}`).slice(0, 120),
                    cards,
                    connections: Array.isArray(rawTarget.connections)
                        ? rawTarget.connections.filter(conn => conn && usedCardIds.has(conn.from) && usedCardIds.has(conn.to))
                        : []
                };
            }

            // 卡片状态管理
            setCardStatus(cardId, status) {
                const target = this.getCurrentTarget();
                if (!target) return;

                this.saveHistory();
                const card = target.cards.find(c => c.id === cardId);
                if (card) {
                    this.recordCardVersion(card, '状态修改');
                    card.status = status;
                    card.updatedAt = Date.now();
                    this.renderCanvas();
                    this.saveData();
                }
            }

            // Markdown 视图切换
            toggleMarkdownView(cardId) {
                const target = this.getCurrentTarget();
                if (!target) return;

                this.saveHistory();
                const card = target.cards.find(c => c.id === cardId);
                if (card) {
                    card.viewMode = card.viewMode === 'markdown' ? 'edit' : 'markdown';
                    card.updatedAt = Date.now();
                    this.renderCanvas();
                    this.saveData();
                }
            }

            // 工具输出解析
            openParsePanel(cardId) {
                this.currentParseCardId = cardId;
                document.getElementById('parseOutputPanel').classList.add('show');
                document.getElementById('parseOutputText').value = '';
                document.getElementById('parseResults').style.display = 'none';
            }

            closeParsePanel() {
                document.getElementById('parseOutputPanel').classList.remove('show');
                this.currentParseCardId = null;
            }

            updateParsePlaceholder() {
                const type = document.getElementById('parseToolType').value;
                const textarea = document.getElementById('parseOutputText');
                const placeholders = {
                    nmap: '粘贴 nmap 扫描结果...\n例如: 80/tcp open http',
                    subfinder: '粘贴 subfinder 子域名结果...\n例如: www.example.com\napi.example.com',
                    dirsearch: '粘贴 dirsearch 目录扫描结果...\n例如: 200 - 1234B - /admin',
                    nuclei: '粘贴 nuclei 漏洞扫描结果...',
                    httpx: '粘贴 httpx 探测结果...\n例如: https://example.com [200]',
                    custom: '粘贴任意文本...'
                };
                textarea.placeholder = placeholders[type] || '粘贴工具输出...';
            }

            parseToolOutput() {
                const type = document.getElementById('parseToolType').value;
                const text = document.getElementById('parseOutputText').value.trim();

                if (!text) {
                    this.showAlertDialog('提示', '请粘贴工具输出内容');
                    return;
                }

                let parsed = [];

                try {
                    switch(type) {
                        case 'nmap':
                            parsed = this.parseNmap(text);
                            break;
                        case 'subfinder':
                            parsed = this.parseSubfinder(text);
                            break;
                        case 'dirsearch':
                            parsed = this.parseDirsearch(text);
                            break;
                        case 'nuclei':
                            parsed = this.parseNuclei(text);
                            break;
                        case 'httpx':
                            parsed = this.parseHttpx(text);
                            break;
                        case 'custom':
                            parsed = text.split('\n').filter(line => line.trim());
                            break;
                    }

                    const originalCount = parsed.length;
                    if (document.getElementById('parseDeduplicate').checked) parsed = [...new Set(parsed)];
                    this.showParseResults(parsed);

                    if (this.currentParseCardId) {
                        const target = this.getCurrentTarget();
                        const card = target?.cards.find(c => c.id === this.currentParseCardId);
                        if (card) {
                            const mode = document.getElementById('parseWriteMode').value;
                            const output = parsed.join('\n');
                            if (mode === 'preview') {
                                this.showShortcutHint(`预览：${originalCount} 条，去重后 ${parsed.length} 条`);
                                return;
                            }
                            this.saveHistory();
                            if (mode === 'append') card.data = [card.data, output].filter(Boolean).join('\n');
                            if (mode === 'replace') card.data = output;
                            if (mode === 'new') {
                                const template = { id: 'parsed-' + type, icon: '📥', title: `${type.toUpperCase()} 解析结果`, desc: `由 ${type} 输出解析生成` };
                                this.addCard(template);
                                const newCard = target.cards[target.cards.length - 1];
                                newCard.data = output;
                                newCard.tags = [type];
                            }
                            card.updatedAt = Date.now();
                            this.saveData();
                            this.renderCanvas();
                            this.closeParsePanel();
                            this.showAlertDialog('成功', `原始 ${originalCount} 条，写入 ${parsed.length} 条`);
                        }
                    }
                } catch (err) {
                    this.showAlertDialog('错误', '解析失败: ' + err.message);
                }
            }

            parseNmap(text) {
                const results = [];
                const lines = text.split('\n');
                const portRegex = /(\d+)\/(tcp|udp)\s+(open|closed|filtered)\s+(\S+)/i;

                lines.forEach(line => {
                    const match = line.match(portRegex);
                    if (match) {
                        results.push(`${match[1]}/${match[2]} - ${match[4]} (${match[3]})`);
                    }
                });

                return results.length > 0 ? results : text.split('\n').filter(l => l.trim());
            }

            parseSubfinder(text) {
                const results = [];
                const lines = text.split('\n');
                const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

                lines.forEach(line => {
                    const domain = line.trim();
                    if (domain && domainRegex.test(domain)) {
                        results.push(domain);
                    }
                });

                return results;
            }

            parseDirsearch(text) {
                const results = [];
                const lines = text.split('\n');
                const dirRegex = /(\d{3})\s+-\s+(\d+\S*)\s+-\s+(\S+)/;

                lines.forEach(line => {
                    const match = line.match(dirRegex);
                    if (match) {
                        results.push(`[${match[1]}] ${match[3]} (${match[2]})`);
                    }
                });

                return results.length > 0 ? results : text.split('\n').filter(l => l.trim());
            }

            parseNuclei(text) {
                const results = [];
                const lines = text.split('\n');

                lines.forEach(line => {
                    if (line.includes('[') && (line.includes('critical') || line.includes('high') || line.includes('medium') || line.includes('low') || line.includes('info'))) {
                        results.push(line.trim());
                    }
                });

                return results.length > 0 ? results : text.split('\n').filter(l => l.trim());
            }

            parseHttpx(text) {
                const results = [];
                const lines = text.split('\n');
                const httpRegex = /(https?:\/\/\S+)\s+\[(\d+)\]/;

                lines.forEach(line => {
                    const match = line.match(httpRegex);
                    if (match) {
                        results.push(`${match[1]} [${match[2]}]`);
                    } else if (line.trim().startsWith('http')) {
                        results.push(line.trim());
                    }
                });

                return results.length > 0 ? results : text.split('\n').filter(l => l.trim());
            }

            showParseResults(results) {
                const container = document.getElementById('parseResults');
                container.innerHTML = '';
                container.style.display = 'block';

                if (results.length === 0) {
                    container.innerHTML = '<div style="color: #909399; text-align: center; padding: 20px;">未解析到有效结果</div>';
                    return;
                }

                container.innerHTML = `<div style="margin-bottom: 8px; color: #67c23a; font-weight: 600;">✓ 成功解析 ${results.length} 条结果</div>`;

                results.slice(0, 10).forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'parse-result-item';
                    item.textContent = result;
                    container.appendChild(item);
                });

                if (results.length > 10) {
                    const more = document.createElement('div');
                    more.style.cssText = 'text-align: center; color: #909399; font-size: 12px; margin-top: 8px;';
                    more.textContent = `还有 ${results.length - 10} 条结果...`;
                    container.appendChild(more);
                }
            }

            // 卡片连线功能
            connectCards() {
                if (this.selectedCards.size !== 2) {
                    this.showAlertDialog('提示', '请选择正好 2 张卡片进行连线');
                    return;
                }

                const cardIds = Array.from(this.selectedCards);
                const target = this.getCurrentTarget();
                if (!target) return;

                this.saveHistory();

                if (!target.connections) {
                    target.connections = [];
                }

                // 检查是否已存在连线
                const exists = target.connections.some(conn =>
                    (conn.from === cardIds[0] && conn.to === cardIds[1]) ||
                    (conn.from === cardIds[1] && conn.to === cardIds[0])
                );

                if (exists) {
                    this.showAlertDialog('提示', '这两张卡片已经连线');
                    return;
                }

                this.showSelectDialog('选择连线类型', '这两张卡片之间是什么关系？', CONNECTION_TYPES, (typeId) => {
                    target.connections.push({
                        id: 'conn-' + Date.now(),
                        from: cardIds[0],
                        to: cardIds[1],
                        type: typeId || 'related'
                    });

                    this.saveData();
                    this.renderConnections();
                    this.selectedCards.clear();
                    this.updateSelectionUI();
                    this.showShortcutHint('已创建连线');
                });
            }

            // 把连线重绘节流到每帧最多一次，避免拖拽时连续的 mousemove 事件
            // 反复触发全量重建（这是拖拽卡顿掉帧的主要原因之一）
            scheduleRenderConnections() {
                if (this._connectionsRAF) return;
                this._connectionsRAF = requestAnimationFrame(() => {
                    this._connectionsRAF = null;
                    this.renderConnections();
                });
            }

            // 画布 transform 有 100ms 过渡动画。若只在动画开始时计算一次端点，
            // 卡片会继续缩放移动，而位于画布外层的 SVG 连线会停在旧位置。
            // 在过渡期内逐帧读取卡片的实际屏幕位置，保证连线始终贴合卡片。
            syncConnectionsDuringCanvasTransition(duration = 130) {
                if (this._connectionTransformRAF) {
                    cancelAnimationFrame(this._connectionTransformRAF);
                }

                const startedAt = performance.now();
                const syncFrame = (now) => {
                    this.renderConnections();
                    if (now - startedAt < duration) {
                        this._connectionTransformRAF = requestAnimationFrame(syncFrame);
                    } else {
                        this._connectionTransformRAF = null;
                        this.renderConnections();
                    }
                };

                this._connectionTransformRAF = requestAnimationFrame(syncFrame);
            }

            getConnectionEdgePoint(cardRect, towardRect, svgRect) {
                const centerX = cardRect.left + cardRect.width / 2;
                const centerY = cardRect.top + cardRect.height / 2;
                const towardX = towardRect.left + towardRect.width / 2;
                const towardY = towardRect.top + towardRect.height / 2;
                const deltaX = towardX - centerX;
                const deltaY = towardY - centerY;

                if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) {
                    return { x: centerX - svgRect.left, y: centerY - svgRect.top };
                }

                const halfWidth = Math.max(cardRect.width / 2, 1);
                const halfHeight = Math.max(cardRect.height / 2, 1);
                const edgeScale = 1 / Math.max(Math.abs(deltaX) / halfWidth, Math.abs(deltaY) / halfHeight);
                return {
                    x: centerX + deltaX * edgeScale - svgRect.left,
                    y: centerY + deltaY * edgeScale - svgRect.top
                };
            }

            renderConnections() {
                const target = this.getCurrentTarget();
                const svg = document.getElementById('canvasConnections');
                if (!svg) return;

                // 没有连线时直接清空并返回，避免拖拽画布/卡片时每次 mousemove 都要
                // 重建箭头 marker、并对每条连线做 getBoundingClientRect（强制同步布局），
                // 这是画布拖拽卡顿掉帧的主要原因之一。
                if (!target || !target.connections || target.connections.length === 0) {
                    if (svg.childNodes.length > 0) svg.innerHTML = '';
                    return;
                }

                svg.innerHTML = '';

                // 预先为每种连线类型注册一个箭头标记（不同颜色需要各自的 marker）
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                CONNECTION_TYPES.forEach(ct => {
                    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                    marker.setAttribute('id', 'arrowhead-' + ct.id);
                    marker.setAttribute('markerWidth', '10');
                    marker.setAttribute('markerHeight', '10');
                    marker.setAttribute('refX', '9');
                    marker.setAttribute('refY', '3');
                    marker.setAttribute('orient', 'auto');

                    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    polygon.setAttribute('points', '0 0, 10 3, 0 6');
                    polygon.setAttribute('fill', ct.color);

                    marker.appendChild(polygon);
                    defs.appendChild(marker);
                });
                svg.appendChild(defs);

                target.connections.forEach(conn => {
                    const fromCard = document.getElementById('card-' + conn.from);
                    const toCard = document.getElementById('card-' + conn.to);

                    if (fromCard && toCard && fromCard.style.display !== 'none' && toCard.style.display !== 'none') {
                        const fromRect = fromCard.getBoundingClientRect();
                        const toRect = toCard.getBoundingClientRect();
                        const canvasRect = svg.getBoundingClientRect();

                        const fromEdge = this.getConnectionEdgePoint(fromRect, toRect, canvasRect);
                        const toEdge = this.getConnectionEdgePoint(toRect, fromRect, canvasRect);
                        const x1 = fromEdge.x;
                        const y1 = fromEdge.y;
                        const x2 = toEdge.x;
                        const y2 = toEdge.y;

                        const connType = CONNECTION_TYPES.find(ct => ct.id === conn.type) || CONNECTION_TYPES[0];

                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.classList.add('connection-line');
                        line.dataset.fromCard = conn.from;
                        line.dataset.toCard = conn.to;
                        line.setAttribute('x1', x1);
                        line.setAttribute('y1', y1);
                        line.setAttribute('x2', x2);
                        line.setAttribute('y2', y2);
                        line.setAttribute('stroke', connType.color);
                        line.setAttribute('stroke-width', '2');
                        line.setAttribute('marker-end', 'url(#arrowhead-' + connType.id + ')');
                        line.style.cursor = 'pointer';
                        line.style.pointerEvents = 'stroke';

                        const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                        titleEl.textContent = connType.label + ' · 单击编辑';
                        line.appendChild(titleEl);

                        line.onclick = () => this.openConnectionEditor(conn.id);

                        svg.appendChild(line);

                        // 连线中点标签，标明关系语义
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        const labelWidth = connType.label.length * 14 + 12;

                        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        labelBg.setAttribute('x', midX - labelWidth / 2);
                        labelBg.setAttribute('y', midY - 10);
                        labelBg.setAttribute('width', labelWidth);
                        labelBg.setAttribute('height', 20);
                        labelBg.setAttribute('rx', 10);
                        labelBg.setAttribute('fill', connType.color);
                        labelBg.style.cursor = 'pointer';
                        labelBg.onclick = () => this.openConnectionEditor(conn.id);
                        svg.appendChild(labelBg);

                        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        labelText.setAttribute('x', midX);
                        labelText.setAttribute('y', midY + 4);
                        labelText.setAttribute('text-anchor', 'middle');
                        labelText.setAttribute('font-size', '11');
                        labelText.setAttribute('fill', '#fff');
                        labelText.style.cursor = 'pointer';
                        labelText.style.userSelect = 'none';
                        labelText.textContent = connType.label;
                        labelText.onclick = () => this.openConnectionEditor(conn.id);
                        svg.appendChild(labelText);
                    }
                });
            }

            removeConnection(connId) {
                const target = this.getCurrentTarget();
                if (!target || !target.connections) return;

                const conn = target.connections.find(c => c.id === connId);
                const connType = conn ? (CONNECTION_TYPES.find(ct => ct.id === conn.type) || CONNECTION_TYPES[0]) : null;
                const msg = connType ? `确定删除这条"${connType.label}"连线？` : '确定删除此连线？';

                this.showConfirmDialog('删除连线', msg, (confirmed) => {
                    if (confirmed) {
                        this.saveHistory();
                        target.connections = target.connections.filter(c => c.id !== connId);
                        this.saveData();
                        this.renderConnections();
                    }
                });
            }

            // v9 本地数据层：SQLite 是权威源，WebSocket 只负责 revision 通知。
            setupAgentBridge() {
                this.renderAgentActivity();
                this.renderAgentInbox();
                this.loadServerActivity();
                this.loadAgentRuns();
                this.openWorkbenchSocket();
            }

            openWorkbenchSocket() {
                this.updateAgentStatus('syncing', '数据库连接中', '正在连接本地 SQLite 服务');
                const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
                this.agentSocket = new WebSocket(protocol + '//' + location.host + '/ws');
                this.agentSocket.onopen = () => {
                    this.updateAgentStatus('connected', '本地库已连接', 'SQLite 已连接 · Agent MCP 可写入');
                    if (localStorage.getItem('infoWorkbenchV9Migrated') === 'pending-v8-import') this.syncAgentRegistry(true);
                };
                this.agentSocket.onmessage = event => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'ready') {
                            this.serverRevision = Math.max(this.serverRevision, Number(message.revision || 0));
                            this.updateAgentStatus('connected', '本地库已连接', 'SQLite revision ' + this.serverRevision);
                        }
                        if (message.type === 'workspace.changed' && Number(message.revision) > this.serverRevision) {
                            this.fetchAgentEvents();
                        }
                    } catch (_) {}
                };
                this.agentSocket.onclose = () => {
                    this.updateAgentStatus('error', '数据库重连中', '连接中断，正在自动重连');
                    setTimeout(() => this.openWorkbenchSocket(), 1200);
                };
                this.agentSocket.onerror = () => this.agentSocket?.close();
                window.addEventListener('beforeunload', () => this.agentSocket?.close(), { once: true });
            }

            updateAgentStatus(state, text, detail) {
                const button = document.getElementById('agentStatusButton');
                const label = document.getElementById('agentStatusText');
                const bridge = document.getElementById('agentBridgeState');
                if (button) button.classList.remove('connected', 'syncing', 'error');
                if (button && state !== 'offline') button.classList.add(state);
                if (label) label.textContent = text;
                if (bridge) {
                    bridge.textContent = detail || text;
                    bridge.style.color = state === 'connected' ? '#16875f' : state === 'error' ? '#d84a4a' : '#8a9290';
                }
            }

            toggleAgentPanel(force) {
                const panel = document.getElementById('agentPanel');
                if (!panel) return;
                panel.classList.toggle('open', typeof force === 'boolean' ? force : !panel.classList.contains('open'));
                if (panel.classList.contains('open')) {
                    this.renderAgentInbox();
                    this.loadAgentRuns();
                }
            }

            async loadAgentRuns() {
                if (location.protocol !== 'http:') return;
                try {
                    const response = await fetch('/api/runs?limit=100', { cache: 'no-store' });
                    if (!response.ok) return;
                    const payload = await response.json();
                    this.agentRuns = Array.isArray(payload.items) ? payload.items : [];
                    this.renderAgentInbox();
                } catch (_) {}
            }

            buildAgentBatches(data = this.data, runRecords = this.agentRuns) {
                const batches = new Map();
                const toTime = value => {
                    if (!value) return '';
                    const date = new Date(value);
                    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
                };
                (data?.targets || []).forEach(target => {
                    (target.cards || []).forEach(card => {
                        if (!card.mcpSource) return;
                        const source = typeof card.mcpSource === 'object' ? card.mcpSource : { tool: String(card.mcpSource) };
                        const tool = source.tool || source.agent || 'Agent';
                        const scannedAt = toTime(source.scanned_at || card.lastAgentUpdate || card.updatedAt || card.createdAt);
                        const bucket = scannedAt ? Math.floor(new Date(scannedAt).getTime() / 600000) : 'unknown';
                        const runId = source.run_id || `legacy-${target.id}-${tool}-${bucket}`;
                        const key = `run:${runId}`;
                        if (!batches.has(key)) batches.set(key, {
                            key, runId, agent: source.agent || 'Agent', tool, targetId: target.id,
                            targetName: target.name || '未命名目标', scannedAt, cardIds: [], cardCount: 0
                        });
                        const batch = batches.get(key);
                        batch.cardIds.push(card.id);
                        batch.cardCount = batch.cardIds.length;
                        if (scannedAt && (!batch.scannedAt || scannedAt > batch.scannedAt)) batch.scannedAt = scannedAt;
                    });
                });
                (runRecords || []).forEach(run => {
                    const runId = String(run.run_id || '');
                    if (!runId) return;
                    const key = `run:${runId}`;
                    const target = (data?.targets || []).find(item => item.id === run.target_id);
                    const existing = batches.get(key);
                    if (existing) {
                        existing.agent = run.agent || existing.agent;
                        existing.tool = run.tool || existing.tool;
                        existing.scannedAt = toTime(run.scanned_at) || existing.scannedAt;
                        existing.cardCount = Math.max(existing.cardIds.length, Number(run.card_count || 0));
                    } else {
                        batches.set(key, {
                            key, runId, agent: run.agent || 'Agent', tool: run.tool || 'Agent',
                            targetId: run.target_id, targetName: target?.name || '已删除目标',
                            scannedAt: toTime(run.scanned_at), cardIds: [], cardCount: Number(run.card_count || 0)
                        });
                    }
                });
                return [...batches.values()].sort((a, b) => String(b.scannedAt).localeCompare(String(a.scannedAt)));
            }

            renderAgentInbox() {
                const list = document.getElementById('agentInboxList');
                const count = document.getElementById('agentInboxCount');
                if (!list || !count) return;
                const batches = this.buildAgentBatches();
                const pending = batches.filter(batch => !this.reviewedAgentBatches.has(batch.key));
                count.textContent = String(pending.length);
                count.classList.toggle('empty', pending.length === 0);
                list.innerHTML = '';
                if (!batches.length) {
                    list.innerHTML = '<div class="agent-empty">Agent 扫描批次会在这里等待处理。</div>';
                    return;
                }
                [...pending, ...batches.filter(batch => this.reviewedAgentBatches.has(batch.key))].slice(0, 20).forEach(batch => {
                    const reviewed = this.reviewedAgentBatches.has(batch.key);
                    const row = document.createElement('article');
                    row.className = 'agent-run-item' + (reviewed ? ' reviewed' : '');
                    const time = batch.scannedAt ? new Date(batch.scannedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '时间未知';
                    row.innerHTML = `<div class="agent-run-head"><span class="agent-run-tool">${this.escapeHTML(batch.tool)}</span><span class="agent-run-state">${reviewed ? '已处理' : '待处理'}</span></div><div class="agent-run-meta"><span>${this.escapeHTML(batch.targetName)}</span><span>·</span><span>${batch.cardCount} 张卡片</span><span>·</span><span>${this.escapeHTML(time)}</span></div><div class="agent-run-actions"></div>`;
                    const actions = row.querySelector('.agent-run-actions');
                    const locate = document.createElement('button');
                    locate.textContent = '定位结果';
                    locate.onclick = () => this.openAgentBatch(batch.key);
                    const review = document.createElement('button');
                    review.textContent = reviewed ? '设为待处理' : '标记已处理';
                    review.onclick = () => this.toggleAgentBatchReviewed(batch.key);
                    actions.append(locate, review);
                    list.appendChild(row);
                });
            }

            persistReviewedAgentBatches() {
                localStorage.setItem('infoWorkbenchReviewedAgentBatches', JSON.stringify([...this.reviewedAgentBatches].slice(-500)));
            }

            toggleAgentBatchReviewed(key) {
                if (this.reviewedAgentBatches.has(key)) this.reviewedAgentBatches.delete(key);
                else this.reviewedAgentBatches.add(key);
                this.persistReviewedAgentBatches();
                this.renderAgentInbox();
            }

            markAllAgentBatchesReviewed() {
                this.buildAgentBatches().forEach(batch => this.reviewedAgentBatches.add(batch.key));
                this.persistReviewedAgentBatches();
                this.renderAgentInbox();
                this.showShortcutHint('全部 Agent 批次已标记为已处理');
            }

            openAgentBatch(key) {
                const batch = this.buildAgentBatches().find(item => item.key === key);
                if (!batch) return;
                if (this.data.currentTargetId !== batch.targetId) this.switchTarget(batch.targetId);
                setTimeout(() => {
                    const target = this.getCurrentTarget();
                    const cardIds = batch.cardIds.filter(id => target?.cards?.some(card => card.id === id));
                    this.selectedCards = new Set(cardIds);
                    this.updateSelectionUI();
                    if (cardIds.length) {
                        this.ensureCardsVisible(cardIds, { force: true });
                        cardIds.forEach(id => document.getElementById('card-' + id)?.classList.add('agent-updated'));
                    } else this.showShortcutHint('该历史批次没有可定位的卡片');
                }, 80);
            }

            clearAgentActivity() {
                this.agentActivity = [];
                this.renderAgentActivity();
            }

            addAgentActivity(message, status = 'success', meta = '') {
                this.agentActivity.unshift({ message, status, meta, time: new Date().toISOString() });
                this.agentActivity = this.agentActivity.slice(0, 30);
                this.renderAgentActivity();
            }

            renderAgentActivity() {
                const list = document.getElementById('agentActivityList');
                if (!list) return;
                list.innerHTML = '';
                if (!this.agentActivity.length) {
                    const empty = document.createElement('div');
                    empty.className = 'agent-empty';
                    empty.textContent = '还没有 Agent 写入记录。扫描完成后，Agent 会通过 MCP 将结果送到这里。';
                    list.appendChild(empty);
                    return;
                }
                this.agentActivity.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'agent-activity ' + (item.status === 'error' ? 'error' : 'success');
                    const main = document.createElement('div');
                    main.className = 'agent-activity-main';
                    main.textContent = item.message;
                    const meta = document.createElement('div');
                    meta.className = 'agent-activity-meta';
                    const time = new Date(item.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                    meta.textContent = [time, item.meta].filter(Boolean).join(' · ');
                    row.append(main, meta);
                    list.appendChild(row);
                });
            }

            scheduleAgentRegistrySync() {
                this._localDirty = true;
                clearTimeout(this._agentRegistryTimer);
                this._agentRegistryTimer = setTimeout(() => this.syncAgentRegistry(), 450);
            }

            async syncAgentRegistry(showFeedback = false) {
                this._serverSaveChain = this._serverSaveChain.then(async () => {
                    let data = structuredClone(this.data);
                    const settings = structuredClone(this.settings);
                    let baseRevision = this.serverRevision;
                    let response = await fetch('/api/workspace', {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ base_revision: baseRevision, data, settings, source: 'browser' })
                    });
                    if (response.status === 409) {
                        const conflict = await response.json();
                        data = this.mergeServerWorkspace(conflict.current?.data, data);
                        baseRevision = Number(conflict.current?.revision || baseRevision);
                        response = await fetch('/api/workspace', {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ base_revision: baseRevision, data, settings, source: 'browser-merge' })
                        });
                    }
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    const saved = await response.json();
                    this.serverRevision = Number(saved.revision || this.serverRevision);
                    this._localDirty = false;
                    localStorage.setItem('infoWorkbenchV9Migrated', 'sqlite');
                    this.updateAgentStatus('connected', '本地库已连接', 'SQLite revision ' + this.serverRevision);
                    if (showFeedback) this.showShortcutHint('工作区已写入 SQLite');
                }).catch(error => {
                    this._localDirty = true;
                    if (showFeedback) this.showShortcutHint('SQLite 保存失败');
                    this.updateAgentStatus('error', '数据库重连中', error?.message || 'SQLite 保存失败');
                });
                return this._serverSaveChain;
            }

            summarizeAgentSync(previousData, nextData, revision) {
                const previousTargets = new Map((previousData?.targets || []).map(target => [target.id, target]));
                const summary = { added: 0, updated: 0, cards: [], tools: [], targetCount: 0, revision: Number(revision || 0) };
                const tools = new Set();
                const affectedTargets = new Set();

                (nextData?.targets || []).forEach(target => {
                    const previousCards = new Map((previousTargets.get(target.id)?.cards || []).map(card => [card.mcpKey || card.id, card]));
                    (target.cards || []).forEach(card => {
                        if (!card.mcpSource) return;
                        const key = card.mcpKey || card.id;
                        const previous = previousCards.get(key);
                        const source = typeof card.mcpSource === 'object' ? card.mcpSource : { tool: String(card.mcpSource) };
                        const changed = previous && (
                            String(previous.updatedAt || '') !== String(card.updatedAt || '') ||
                            previous.data !== card.data || previous.title !== card.title ||
                            previous.status !== card.status || previous.risk !== card.risk ||
                            JSON.stringify(previous.tags || []) !== JSON.stringify(card.tags || [])
                        );
                        if (previous && !changed) return;
                        if (previous) summary.updated += 1; else summary.added += 1;
                        summary.cards.push({
                            targetId: target.id,
                            targetName: target.name || '未命名目标',
                            cardId: card.id,
                            title: card.title || '未命名卡片',
                            kind: previous ? 'updated' : 'added',
                            tool: source.tool || source.agent || 'Agent'
                        });
                        tools.add(source.tool || source.agent || 'Agent');
                        affectedTargets.add(target.id);
                    });
                });

                summary.tools = [...tools];
                summary.targetCount = affectedTargets.size;
                return summary.cards.length ? summary : null;
            }

            showAgentResultReceipt(summary) {
                if (!summary?.cards?.length) return;
                this._lastAgentReceipt = summary;
                this.renderAgentInbox();
                const receipt = document.getElementById('agentResultReceipt');
                const title = document.getElementById('agentReceiptTitle');
                const meta = document.getElementById('agentReceiptMeta');
                if (!receipt || !title || !meta) return;
                title.textContent = `Agent 新增 ${summary.added} · 更新 ${summary.updated}`;
                const toolText = summary.tools.slice(0, 2).join('、') + (summary.tools.length > 2 ? ` 等 ${summary.tools.length} 个工具` : '');
                meta.textContent = `${toolText || 'Agent'} · ${summary.targetCount} 个目标 · revision ${summary.revision}`;
                receipt.classList.add('show');
                clearTimeout(this._agentReceiptTimer);
                this._agentReceiptTimer = setTimeout(() => this.dismissAgentResultReceipt(), 12000);
            }

            dismissAgentResultReceipt() {
                document.getElementById('agentResultReceipt')?.classList.remove('show');
                clearTimeout(this._agentReceiptTimer);
                this._agentReceiptTimer = null;
            }

            openLastAgentResult() {
                const summary = this._lastAgentReceipt;
                if (!summary?.cards?.length) return;
                const result = summary.cards.find(card => card.kind === 'added') || summary.cards[0];
                if (this.data.currentTargetId !== result.targetId) this.switchTarget(result.targetId);
                setTimeout(() => {
                    this.ensureCardsVisible([result.cardId], { force: true });
                    const card = document.getElementById('card-' + result.cardId);
                    card?.classList.remove('agent-updated');
                    requestAnimationFrame(() => card?.classList.add('agent-updated'));
                }, 90);
                this.dismissAgentResultReceipt();
            }

            async fetchAgentEvents(showFeedback = false) {
                if (this.agentSyncing || location.protocol !== 'http:') return;
                this.agentSyncing = true;
                this.updateAgentStatus('syncing', '数据同步中', '正在读取 SQLite 最新 revision');
                try {
                    if (this._localDirty) {
                        await this.syncAgentRegistry(showFeedback);
                        return;
                    }
                    const response = await fetch('/api/workspace', { cache: 'no-store' });
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    const state = await response.json();
                    if (state.exists && Number(state.revision) > this.serverRevision) {
                        const previousData = structuredClone(this.data);
                        this.data = { ...this.data, ...state.data };
                        this.settings = { ...this.settings, ...state.settings };
                        this.serverRevision = Number(state.revision);
                        const syncSummary = this.summarizeAgentSync(previousData, this.data, this.serverRevision);
                        localStorage.setItem('infoCollectorData', JSON.stringify(this.data));
                        localStorage.setItem('infoCollectorSettings', JSON.stringify(this.settings));
                        this.renderTabs(); this.renderCanvas(); this.renderCardGroups(); this.renderTemplates();
                        this.applySettings(); this.applyV7Settings();
                        this.addAgentActivity('已从 SQLite 同步工作区 revision ' + this.serverRevision, 'success', 'Agent / API');
                        if (syncSummary) {
                            this.showAgentResultReceipt(syncSummary);
                            const visibleIds = syncSummary.cards.filter(card => card.targetId === this.data.currentTargetId).map(card => card.cardId);
                            setTimeout(() => {
                                visibleIds.forEach(id => document.getElementById('card-' + id)?.classList.add('agent-updated'));
                                if (visibleIds.length) this.ensureCardsVisible(visibleIds);
                            }, 80);
                        }
                        this.renderAgentInbox();
                        this.loadAgentRuns();
                        if (showFeedback) this.showShortcutHint('已载入 SQLite 最新数据');
                    } else if (showFeedback) this.showShortcutHint('当前已经是最新数据');
                    await this.loadServerActivity();
                    this.updateAgentStatus('connected', '本地库已连接', 'SQLite revision ' + this.serverRevision);
                } catch (error) {
                    this.addAgentActivity('同步失败：' + (error?.message || '未知错误'), 'error');
                    this.updateAgentStatus('error', '数据库重连中', '同步失败，稍后自动重试');
                } finally {
                    this.agentSyncing = false;
                }
            }

            async loadServerActivity() {
                try {
                    const response = await fetch('/api/activity?limit=30', { cache: 'no-store' });
                    if (!response.ok) return;
                    const payload = await response.json();
                    this.agentActivity = (payload.items || []).map(item => ({
                        message: item.message, status: 'success', meta: item.source || item.kind, time: item.created_at
                    }));
                    this.renderAgentActivity();
                } catch (_) {}
            }

            mergeServerWorkspace(serverData, localData) {
                if (!serverData?.targets) return localData;
                const merged = structuredClone(serverData);
                const targetMap = new Map(merged.targets.map(target => [target.id, target]));
                (localData.targets || []).forEach(localTarget => {
                    const target = targetMap.get(localTarget.id);
                    if (!target) { merged.targets.push(localTarget); return; }
                    const cards = new Map((target.cards || []).map(card => [card.id, card]));
                    (localTarget.cards || []).forEach(localCard => {
                        const serverCard = cards.get(localCard.id);
                        if (!serverCard || Number(localCard.updatedAt || 0) >= Number(serverCard.updatedAt || 0)) cards.set(localCard.id, localCard);
                    });
                    target.cards = [...cards.values()];
                    const connections = new Map((target.connections || []).map(connection => [connection.id, connection]));
                    (localTarget.connections || []).forEach(connection => connections.set(connection.id, connection));
                    target.connections = [...connections.values()];
                    target.name = localTarget.name || target.name;
                });
                merged.currentTargetId = localData.currentTargetId || merged.currentTargetId;
                merged.cardGroups = localData.cardGroups || merged.cardGroups;
                merged.customGroups = localData.customGroups || merged.customGroups;
                merged.trash = [...(serverData.trash || []), ...(localData.trash || [])].slice(-50);
                return merged;
            }

            applyAgentEvent(event) {
                if (!event || !event.payload || !event.type) throw new Error('无效的 Agent 事件');
                const payload = event.payload;
                if (event.type === 'target.create') {
                    if (!this.data.targets.some(target => target.id === payload.target_id)) {
                        this.data.targets.push({ id: payload.target_id, name: payload.name || 'Agent 新建目标', cards: [], connections: [] });
                        if (!this.data.currentTargetId) this.data.currentTargetId = payload.target_id;
                    }
                    this.addAgentActivity('Agent 创建目标：' + (payload.name || payload.target_id), 'success', event.operation_id);
                    return;
                }

                let target = this.data.targets.find(item => item.id === payload.target_id);
                if (!target) {
                    target = { id: payload.target_id, name: 'Agent 导入 · ' + payload.target_id, cards: [], connections: [] };
                    this.data.targets.push(target);
                }
                if (!Array.isArray(target.connections)) target.connections = [];

                if (event.type === 'cards.upsert') {
                    const highlighted = [];
                    (payload.cards || []).forEach((incoming, index) => {
                        const isNewMode = incoming.write_mode === 'new';
                        let card = isNewMode ? null : target.cards.find(item => item.mcpKey === incoming.card_key);
                        const template = CARD_TEMPLATES.find(item => item.id === incoming.template_id);
                        if (!card) {
                            const count = target.cards.length;
                            card = {
                                id: 'agent-' + event.event_id + '-' + index,
                                mcpKey: isNewMode ? incoming.card_key + ':' + event.event_id : incoming.card_key,
                                templateId: incoming.template_id || 'notes',
                                icon: incoming.icon || template?.icon || '◈',
                                title: incoming.title,
                                desc: incoming.description || ('由 Agent · ' + (payload.source?.tool || 'tool') + ' 写入'),
                                data: incoming.content || '', collapsed: false,
                                x: (this.settings.navigatorCollapsed ? 90 : 310) + (count % 3) * 430,
                                y: 100 + Math.floor(count / 3) * 330,
                                width: this.settings.defaultWidth, height: this.settings.defaultHeight,
                                status: incoming.status || 'done', viewMode: 'edit', risk: incoming.risk || 'info',
                                tags: Array.from(new Set([...(incoming.tags || []), 'agent'])),
                                createdAt: Date.now(), updatedAt: Date.now()
                            };
                            target.cards.push(card);
                        } else {
                            card.data = this.mergeAgentContent(card.data || '', incoming.content || '', incoming.write_mode);
                            card.title = incoming.title || card.title;
                            card.desc = incoming.description || card.desc;
                            card.risk = incoming.risk || card.risk;
                            card.status = incoming.status || card.status;
                            card.tags = Array.from(new Set([...(card.tags || []), ...(incoming.tags || []), 'agent']));
                            card.updatedAt = Date.now();
                        }
                        card.mcpSource = payload.source;
                        card.lastAgentUpdate = event.created_at;
                        highlighted.push(card.id);
                    });
                    this.data.currentTargetId = target.id;
                    this.addAgentActivity('写入 ' + (payload.cards?.length || 0) + ' 张卡片到「' + target.name + '」', 'success', (payload.source?.tool || 'agent') + ' · ' + event.operation_id);
                    setTimeout(() => highlighted.forEach(id => document.getElementById('card-' + id)?.classList.add('agent-updated')), 80);
                    return;
                }

                if (event.type === 'connection.add') {
                    const resolve = key => target.cards.find(card => card.id === key || card.mcpKey === key);
                    const from = resolve(payload.source_card);
                    const to = resolve(payload.target_card);
                    if (!from || !to) {
                        this.addAgentActivity('连线未创建：找不到源卡片或目标卡片', 'error', event.operation_id);
                        return;
                    }
                    const exists = target.connections.some(item => item.agentOperationId === event.operation_id);
                    if (!exists) target.connections.push({ id: 'conn-agent-' + event.event_id, source: from.id, target: to.id, type: payload.connection_type || 'discovered', agentOperationId: event.operation_id });
                    this.addAgentActivity('已连接「' + from.title + '」→「' + to.title + '」', 'success', event.operation_id);
                }
            }

            mergeAgentContent(current, incoming, mode) {
                if (mode === 'replace') return incoming;
                if (mode === 'append') return [current.trimEnd(), incoming.trim()].filter(Boolean).join('\n');
                if (mode === 'new') return incoming;
                const lines = [];
                const seen = new Set();
                (current + '\n' + incoming).split(/\r?\n/).forEach(line => {
                    const key = line.trim();
                    if (!key || seen.has(key)) return;
                    seen.add(key);
                    lines.push(line);
                });
                return lines.join('\n');
            }

            // 导出 HTML 报告
            exportHTMLReport() {
                const target = this.getCurrentTarget();
                if (!target) {
                    this.showAlertDialog('提示', '当前没有活动目标');
                    return;
                }

                const safeTargetName = this.escapeHTML(target.name);
                const reportCards = Array.isArray(target.cards) ? target.cards : [];
                const doneCount = reportCards.filter(card => card.status === 'done').length;
                const doingCount = reportCards.filter(card => card.status === 'doing').length;
                const todoCount = reportCards.length - doneCount - doingCount;

                let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTargetName} - 信息收集报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        .header { padding: 30px; border-bottom: 2px solid #409eff; }
        .header h1 { font-size: 28px; color: #303133; margin-bottom: 10px; }
        .header .meta { color: #909399; font-size: 14px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 22px; }
        .summary-item { padding: 14px; border: 1px solid #e4e7ed; border-radius: 9px; background: #fbfcfd; }
        .summary-value { display: block; color: #172033; font-size: 22px; font-weight: 700; }
        .summary-label { color: #909399; font-size: 12px; }
        .content { padding: 30px; }
        .card { background: #f9fafc; border: 1px solid #e4e7ed; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .card-icon { font-size: 24px; }
        .card-title { font-size: 18px; font-weight: 600; color: #303133; }
        .card-status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-left: auto; }
        .card-status.todo { background: #f56c6c; color: white; }
        .card-status.doing { background: #e6a23c; color: white; }
        .card-status.done { background: #67c23a; color: white; }
        .card-desc { color: #909399; font-size: 13px; margin-bottom: 12px; font-style: italic; }
        .card-meta { display: flex; gap: 6px; margin: -4px 0 12px; color: #718096; font-size: 12px; }
        .card-content { color: #606266; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; }
        .footer { padding: 20px; text-align: center; color: #909399; font-size: 13px; border-top: 1px solid #e4e7ed; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 ${safeTargetName}</h1>
            <div class="meta">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
            <div class="summary">
                <div class="summary-item"><span class="summary-value">${reportCards.length}</span><span class="summary-label">全部卡片</span></div>
                <div class="summary-item"><span class="summary-value">${doneCount}</span><span class="summary-label">已完成</span></div>
                <div class="summary-item"><span class="summary-value">${doingCount}</span><span class="summary-label">进行中</span></div>
                <div class="summary-item"><span class="summary-value">${todoCount}</span><span class="summary-label">待办</span></div>
            </div>
        </div>
        <div class="content">
`;

                const statusLabels = { todo: '待办', doing: '进行中', done: '已完成' };

                reportCards.forEach(card => {
                    const safeStatus = ['todo', 'doing', 'done'].includes(card.status) ? card.status : 'todo';
                    const reportRiskLabels = { critical: '严重', high: '高危', medium: '中危', low: '低危', info: '信息' };
                    html += `
            <div class="card">
                <div class="card-header">
                    <span class="card-icon">${this.escapeHTML(card.icon)}</span>
                    <span class="card-title">${this.escapeHTML(card.title)}</span>
                    <span class="card-status ${safeStatus}">${statusLabels[safeStatus]}</span>
                </div>
                ${card.desc ? `<div class="card-desc">${this.escapeHTML(card.desc)}</div>` : ''}
                <div class="card-meta">风险：${reportRiskLabels[card.risk] || '信息'}${card.tags?.length ? '　标签：' + this.escapeHTML(card.tags.join('、')) : ''}</div>
                <div class="card-content">${this.escapeHTML(card.data || '(空)')}</div>
            </div>
`;
                });

                html += `
        </div>
        <div class="footer">
            由信息收集工作台 v9 生成 | ${new Date().toLocaleDateString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.safeFilename(target.name)}-报告-${Date.now()}.html`;
                a.click();
                URL.revokeObjectURL(url);

                this.showAlertDialog('成功', 'HTML 报告已导出');
            }
        }

        // 初始化应用
        const app = window.app = new InfoCollectorApp();
    
