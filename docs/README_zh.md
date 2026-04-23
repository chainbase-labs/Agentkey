<p align="center">
<img width="256" alt="AgentKey" src="https://github.com/user-attachments/assets/4c7c78a9-e5d8-45ce-9372-d5bffe8f61c5" />
</p>

<p align="center">
  <strong>一条命令，解锁 Agent 全网访问能力。</strong>
  <br>
  刷推特、搜领英、逛社交媒体、抓网页。无需配置，装好即用。
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#装好之后能干什么">支持平台</a> ·
  <a href="#计费相关">计费</a> ·
  <a href="#常见问题">常见问题</a> ·
  <a href="../README.md">English</a>
</p>

<p align="center">
  <a href="https://agentkey.app"><img src="https://img.shields.io/badge/Website-agentkey.app-blue?style=for-the-badge" alt="Website" /></a>
</p>

---

**安装 AgentKey，让你的 AI 拥有超能力**

AgentKey 是 Agent 生态里的"万能钥匙"。用户在用 Claude、Manus 这些 Agent 时，经常需要获取外部数据（社交媒体、电商、链上数据、各种 API），但要么要自己找 API 填 Key，要么根本找不到解决方案。

装了 AgentKey，Agent 就自动具备了这些数据获取能力。无需订阅，无需注册任何服务，充值即用。

> ⭐ 右上角 Star 本项目，我们会持续更新平台接入变化，有新版本自动通知你。

---

## 使用场景

| 你对 Agent 说                                         | 没装会怎样              | 装了 AgentKey 后                   |
| ----------------------------------------------------- | ----------------------- | ---------------------------------- |
| 🐦 马斯克最近在推特上在说什么                         | 看不了，搜不到完整推文  | 一次拉全相关推文，帮你总结结论     |
| 📕 Ins / 小红书 上大家怎么看这个产品                  | 打不开，必须登录才能看  | 直接抓真实笔记，按口碑帮你归纳     |
| 📺 这个 YouTube / B 站视频讲了什么                    | 看不了，字幕拿不到      | 自动看视频/字幕，提炼要点          |
| 📖 去 Reddit 上看看有没有人遇到同样的痛点             | 403 被封，帖子进不去    | 找到相关帖子，把解法抽出来         |
| 👔 帮我看一下这家竞品 / 候选人的 LinkedIn             | 进不去，权限烦还老 403  | 打开公司/个人页，提炼关键信息      |
| 🎵 帮我看看抖音 / TikTok 最近哪些话题最热             | 刷不动榜单，只能自己刷  | 抓热门话题和标签，帮你总结趋势     |
| 🌐 帮我看看这个网页写了啥                             | 抓回来一堆 HTML，没法读 | 把正文抠出来，用几段话讲清楚       |
| 📦 这个 GitHub 仓库是干嘛的？                         | 只能自己点进仓库慢慢翻  | 看 README、Issue，一句话说清       |
| 🧾 帮我看看这个地址/基金最近在买什么                  | 自己去区块浏览器一笔笔点 | 自动汇总最近交易，帮你看仓位变化  |

没有安装之前：10 个任务，10 个 Key，10 份账单。

Agent 就像半智能体，完全无法自主行动，不断需要人类帮助搜寻解决方案，管理复杂度直线上升。

现在，一个 AgentKey，所有服务全部搞定。**AgentKey 统一了 AI 干活需要的一切外部访问。**

---

## 安装

一条命令。浏览器弹出登录，完成即可。

**macOS / Linux**
```bash
curl -fsSL https://agentkey.app/install.sh | bash
```

**Windows**（PowerShell）
```powershell
irm https://agentkey.app/install.ps1 | iex
```

重启 Agent，然后问它一些需要联网的问题：

> *"马斯克最近在推特上在说什么？"*

就这样。不用复制 API Key，也不用改 JSON。安装脚本会自动识别你机器上每一个支持的 Agent（[已支持 40+](https://github.com/vercel-labs/skills#available-agents)），逐个配好。

<sub>想只装到特定 Agent / 在 CI 里跑 / 配置我们还没自动覆盖的 Agent？→ [进阶安装](#进阶安装)。</sub>

---

## 装好之后能干什么

AgentKey 在云端维护与各平台的对接 —— 你不需要额外开账号，也不用再填 Key。

| 类别 | 服务 |
| :--- | :--- |
| **搜索** | <img src="https://cdn.simpleicons.org/brave/FF2000" width="16" height="16" alt="" /> Brave · <img src="https://cdn.simpleicons.org/perplexity/20B8CD" width="16" height="16" alt="" /> Perplexity · Tavily · Serper |
| **抓取** | Firecrawl · Jina Reader · ScrapeNinja |
| **链上 / 加密** | Chainbase · <img src="https://cdn.simpleicons.org/coinmarketcap/17181B" width="16" height="16" alt="" /> CoinMarketCap · Dexscreener |
| **社交媒体与内容** | <img src="https://cdn.simpleicons.org/bilibili/00A1D6" width="16" height="16" alt="" /> Bilibili · <img src="https://cdn.simpleicons.org/tiktok/000000" width="16" height="16" alt="" /> Douyin · <img src="https://cdn.simpleicons.org/instagram/E4405F" width="16" height="16" alt="" /> Instagram · <img src="https://cdn.simpleicons.org/kuaishou/FF4900" width="16" height="16" alt="" /> Kuaishou · Lemon8 · LinkedIn · <br><img src="https://cdn.simpleicons.org/reddit/FF4500" width="16" height="16" alt="" /> Reddit · <img src="https://cdn.simpleicons.org/x/000000" width="16" height="16" alt="" /> Twitter (X) · <img src="https://cdn.simpleicons.org/sinaweibo/E6162D" width="16" height="16" alt="" /> Weibo · <img src="https://cdn.simpleicons.org/wechat/07C160" width="16" height="16" alt="" /> Weixin · <img src="https://cdn.simpleicons.org/xiaohongshu/FF2442" width="16" height="16" alt="" /> Xiaohongshu（维护中） · <img src="https://cdn.simpleicons.org/youtube/FF0000" width="16" height="16" alt="" /> YouTube · <img src="https://cdn.simpleicons.org/zhihu/0084FF" width="16" height="16" alt="" /> Zhihu |

**规划中：** 金融数据 · 电商平台 · 地图与天气

---

## 计费相关

**没有月费。用多少付多少。** 充值自定义金额，按实际 Credit 消费：

| 你让 Agent 做的事 | 大概花多少 |
|---|---|
| 搜网页 | $0.001 |
| 查币的情况 | $0.003 |
| 读社交媒体 | $0.006 |
| 每日定时任务 | 每月 $5–10 |

---

## 常见问题

**我不懂技术，能用吗？**
能。打开终端（macOS / Linux）或 PowerShell（Windows），把[安装](#安装)里的一键命令粘贴进去、回车。浏览器会自动弹登录，点同意，然后重启你的 Agent 就好了。

**安全吗？**
AgentKey 是请求中转网关：按产品设计不保存你的完整对话内容；我们代 Agent 向各平台请求数据，并把结果回传到你的 Agent 环境。（运营所需的计费、风控、排障等可能产生少量必要日志，以实际隐私政策为准。）

**和 Claude / ChatGPT 自带的能力有什么不一样？**
Claude 与 ChatGPT 的原生联网与平台覆盖有限，往往触达不到推特、小红书、链上数据等。AgentKey 让你的 Agent 能覆盖这些场景（具体以当前产品能力为准）。

**额度用完了怎么办？**
充值即可；无自动续费，无隐藏扣款。

**支持哪些 Agent？**
见 Skills CLI 的 [完整适配列表](https://github.com/vercel-labs/skills#available-agents)。如果你用的 Agent 不在列表里但支持加载 MCP Server，可以让它执行 `npx -y @agentkey/mcp --auth-login` 并重启。

**好像哪里不对？怎么排查？**
在 Agent 里试试 `/agentkey status` —— 会诊断 MCP 配置、版本、连通性。

**目前产品是什么阶段？**
早期内测阶段，产品仍有不少不完善之处，还请担待。功能建议与问题反馈欢迎通过 [GitHub Issues](https://github.com/chainbase-labs/agentkey/issues) 或下面的 Telegram 与我们联系。

---

## 社区

- **Telegram：** [t.me/agentkey33](https://t.me/agentkey33) —— 通用咨询、支持、需求反馈
- **问题反馈：** [GitHub Issues](https://github.com/chainbase-labs/agentkey/issues)
- **发布公告：** ⭐ Star 本项目即可在有新版本时收到通知

[![Star History Chart](https://api.star-history.com/svg?repos=chainbase-labs/agentkey&type=Date)](https://www.star-history.com/?repos=chainbase-labs%2Fagentkey&type=date&legend=top-left)

---

<br>

<details>
<summary><b>进阶安装</b> —— 参数、指定 Agent、手动两步、未被自动覆盖的 Agent</summary>

### 安装器参数

```bash
# 非交互模式（CI / 无人值守）：安装到所有检测到的 Agent，不询问
curl -fsSL https://agentkey.app/install.sh | bash -s -- --yes

# 只安装到指定的 Agent
curl -fsSL https://agentkey.app/install.sh | bash -s -- --only claude-code,cursor

# 只装 Skill 或只做 MCP 授权
curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-mcp
curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-skill
```

PowerShell 对应参数：`-Yes`、`-Only`、`-SkipMcp`、`-SkipSkill`。

### 手动两步安装

如果你想自己跑两条底层命令（或者一键脚本在你的环境里跑不起来）：

```bash
# 1. 把 Skill 装进所有检测到的 Agent
npx skills add chainbase-labs/agentkey

# 2. 浏览器授权并注册 MCP Server
npx -y @agentkey/mcp --auth-login
```

在 SSH 远程或无法弹浏览器的终端里，用 `npx -y @agentkey/mcp --setup` —— 交互式向导，问你要 Key 并让你勾选要写入的 MCP 客户端。

### `--auth-login` 不支持的 Agent

MCP 自动配置仅覆盖 Claude Code / Claude Desktop / Cursor。如果你用的是 **Codex / OpenCode / Gemini CLI / Hermes / Manus**（或 Linux 版 Claude Desktop），Skill 会正常装上，但你需要把下面这段 MCP 片段手动贴到该 Agent 的配置里（路径因 Agent 而异）：

```json
{
  "mcpServers": {
    "agentkey": {
      "command": "npx",
      "args": ["-y", "@agentkey/mcp"],
      "env": { "AGENTKEY_API_KEY": "ak_..." }
    }
  }
}
```

写完后重启 Agent。你第一次在对话里触发 Skill 时，它也会引导你走这一步。

### Agent 里的 Slash 命令

| 命令 | 作用 |
|---|---|
| `/agentkey` | 主入口：数据查询时自动触发，通常不需要手动调用 |
| `/agentkey setup` | 初始安装：配置 API Key + 验证 MCP 连通性 |
| `/agentkey status` | 诊断当前配置状态（MCP、版本、连通性测试） |

</details>

<details>
<summary><b>更新</b> —— 拉最新 Skill 或锁定某个版本</summary>

```bash
# 拉最新版的 Skill 内容
npx skills update chainbase-labs/agentkey

# 锁定特定版本
npx skills add chainbase-labs/agentkey@v1.0.0
```

重启 Agent 即可生效。

**MCP Server 不用手动更新。** 你的 MCP 配置使用的是 `npx -y @agentkey/mcp`，每次 Agent 重启都会自动解析到最新发布版本。只有在需要换 API Key 时才需要再跑一次 `npx -y @agentkey/mcp --auth-login`。

Claude Code 插件模式下，AgentKey 还会在运行时自动检查 GitHub Release，发现新版本会尝试静默更新并提示：

```
Claude: AgentKey Skill updated to v0.4.5.
```

</details>

<details>
<summary><b>卸载</b> —— 一条命令清理所有 Agent 与配置</summary>

**macOS / Linux**
```bash
curl -fsSL https://agentkey.app/uninstall.sh | bash
```

**Windows**（PowerShell）
```powershell
irm https://agentkey.app/uninstall.ps1 | iex
```

把 Skill 从所有 Agent 里清理掉，同时删除各 MCP 客户端里的 `agentkey` 条目 + API Key，清理缓存和日志。加 `--keep-marketplace`（bash）/ `-KeepMarketplace`（PowerShell）可以保留 Claude Code 的 marketplace 条目。

<details>
<summary>手动两步卸载</summary>

```bash
# 1. 把 Skill 从所有 Agent 里移除
npx skills remove chainbase-labs/agentkey

# 2. 在各 MCP 客户端配置里删掉 mcpServers 下的 "agentkey" 条目：
#    - Claude Code：    ~/.claude.json
#    - Claude Desktop： ~/Library/Application Support/Claude/claude_desktop_config.json  (macOS)
#                      %APPDATA%\Claude\claude_desktop_config.json                       (Windows)
#    - Cursor：         ~/.cursor/mcp.json
```

一键卸载脚本还会额外清 npm/npx 缓存、旧的 shell rc 残留、CLAUDE.md 里的 AgentKey 段、MCP stdio 日志 —— 想一次清干净就用它。

</details>

</details>

<details>
<summary><b>开发 / 自托管</b> —— 本地 checkout 验证、插件模式、发版</summary>

### 从本地 checkout 安装

```bash
git clone https://github.com/chainbase-labs/agentkey.git
cd agentkey

# 1. 把当前工作副本装进所有检测到的 Agent
npx skills add .

# 2. 注册 MCP Server（只需一次）
npx -y @agentkey/mcp --auth-login
```

`npx skills add .` 支持本地路径（也支持 `file://` URL），改完 `skills/agentkey/SKILL.md` 再跑一次就能立刻生效，是日常迭代最快的路径。MCP 注册步骤每台机器只需一次。

**想改 MCP Server 本身？** 在 MCP 配置里把 `command` 换成 `node /path/to/AgentKey-Server/mcp-server/dist/index.js`，然后在 server 仓库里 `pnpm --filter @agentkey/mcp build`，就能在本地验证改动。

### Claude Code 插件模式

本仓库同时也是一个 Claude Code 插件（见 `.claude-plugin/plugin.json` 与 `.mcp.json`）。如果需要测试插件特有的流程（marketplace、`userConfig`、通过 `.mcp.json` 自动注册 MCP），可以把仓库当成本地 marketplace 安装：

```bash
claude plugin marketplace add /absolute/path/to/agentkey
claude plugin install agentkey
```

编辑文件后 `claude plugin update agentkey` 重新加载。

日常 Skill 内容调整用 skills CLI 就够；只有在验证 Claude Code 插件内部机制（例如 `CLAUDE_PLUGIN_OPTION_*` 环境变量接线）时才走插件路径。

### 仓库结构

```
agentkey/
├── .claude-plugin/plugin.json   # Claude Code 插件清单
├── .mcp.json                    # 作为插件安装时使用
├── skills/agentkey/
│   ├── SKILL.md                 # 决策树 & 路由规则
│   └── scripts/                 # check-mcp / check-update 辅助脚本
├── scripts/
│   ├── install.sh               # 一键安装脚本（mac/linux），托管于 agentkey.app/install.sh
│   ├── install.ps1              # Windows PowerShell 安装脚本
│   ├── uninstall.sh             # 一键卸载脚本（mac/linux）
│   ├── uninstall.ps1            # Windows PowerShell 卸载脚本
│   └── release.sh               # 发版工具
├── archive/                     # 已退役的安装器与 CLI（保留历史）
└── version                      # 只由 release.sh 维护
```

### 发布新版本（Maintainer）

```bash
./scripts/release.sh patch "Bug fix description"
./scripts/release.sh minor "New feature description"
./scripts/release.sh major "Breaking change description"
```

需要 `gh` CLI 已登录。脚本会自动 bump `version`、提交、打 tag、推送并创建 GitHub Release。

</details>
