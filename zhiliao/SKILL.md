---
name: zhiliao
description: "知了 - AI 话题追踪与资讯聚合服务。通过自然语言创建追踪话题，自动从全网聚合相关文章并定时更新。适用场景：(1) 创建信息追踪话题（如追踪黄金价格、科技新闻、行业动态），(2) 获取和浏览话题下的聚合文章，(3) 设置定时任务定期抓取新文章，(4) 管理话题列表。触发关键词：zhiliao、知了、话题追踪、资讯聚合、信息监控、追踪话题、创建话题、文章聚合。"
metadata: {"openclaw":{"emoji":"📰","requires":{"bins":["node"]},"primaryEnv":"ZHILIAO_API_KEY"}}
---

# 知了 - AI 话题追踪与资讯聚合

通过自然语言创建追踪话题，自动从全网聚合相关文章。所有脚本输出均为 Markdown 格式。

## 初始化

首次使用前安装依赖：

```bash
cd <skill-path>/scripts && bash setup.sh
```

## 配置 API Key

用户需前往知了网站 (https://zhiliao.news/) 注册，并在 API Key 申请页面 (https://open.zhiliao.news/) 获取 API Key。

配置方式一 — 环境变量（推荐）：

```bash
export ZHILIAO_API_KEY="your-api-key-here"
```

配置方式二 — 命令行参数（首次使用时自动保存）：

```bash
cd <skill-path>/scripts && npx tsx create-topic.ts "话题描述" --api-key YOUR_KEY
```

API Key 会自动保存到 `~/.zhiliao/config.json`，后续无需重复输入。

**额度说明**：每个 API Key 可免费创建 3 个话题，超出后需前往知了网站付费充值。

## 工作流程

### 1. 创建话题（多轮对话引导）

通过对话帮助用户创建精准的追踪话题：

1. **了解需求**：询问用户想追踪什么信息
2. **优化 prompt**：帮助用户细化描述，使话题更精准：
   - 模糊: "科技新闻" -> 优化: "AI大模型技术进展，包括OpenAI、Google、Anthropic等公司的最新发布和研究突破"
   - 模糊: "股市" -> 优化: "A股半导体板块行情分析，包括主要芯片公司股价走势和产业政策影响"
3. **调用创建**：
   ```bash
   cd <skill-path>/scripts && ZHILIAO_SESSION=<session> npx tsx create-topic.ts "优化后的PROMPT"
   ```
4. **展示结果**：向用户展示生成的话题名称、描述和封面图
5. **确认或迭代**：用户不满意则调整 prompt 重新创建

### 2. 获取文章

查询话题下的最新文章（输出 Markdown 格式，包含标题链接、摘要、信息源表格）：

```bash
cd <skill-path>/scripts && npx tsx fetch-articles.ts TOPIC_ID
```

可选参数：
- `--limit N`：每页数量（默认 20）
- `--cursor CURSOR`：翻页游标
- `--json`：输出原始 JSON

### 3. 查看话题列表

列出所有话题及缓存状态（Markdown 表格格式）：

```bash
cd <skill-path>/scripts && npx tsx list-topics.ts
```

查看某个话题详情及缓存文章：

```bash
cd <skill-path>/scripts && npx tsx list-topics.ts TOPIC_ID
```

### 4. 定时任务（OpenClaw Cron）

根据用户意图设置定时检查任务。常见场景：

**每天早上8点日报**：
```bash
openclaw cron add --cron "0 8 * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

**每小时检查一次**：
```bash
openclaw cron add --cron "0 * * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

**每30分钟检查一次**：
```bash
openclaw cron add --cron "*/30 * * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

**工作日早晚各一次（9:00 和 18:00）**：
```bash
openclaw cron add --cron "0 9,18 * * 1-5" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

**Cron 表达式格式**：`分钟 小时 日 月 星期`
- `0 8 * * *` - 每天8:00
- `0 */2 * * *` - 每2小时
- `*/15 * * * *` - 每15分钟
- `0 9-17 * * 1-5` - 工作日9:00-17:00每小时

**手动触发一次检查**：
```bash
cd <skill-path>/scripts && npx tsx check-articles.ts
```

**管理定时任务**：
```bash
openclaw cron list              # 查看所有任务
openclaw cron remove <jobId>    # 删除任务
```

## 数据存储

所有数据保存在 `~/.zhiliao/` 目录：
- `config.json` - API Key 和服务地址
- `topics.json` - 已创建的话题列表
- `articles/` - 各话题的文章缓存
- `sessions/` - 创建话题的 session_id（用于请求幂等性）

## 会话隔离（创建话题）

创建话题接口（`create-topic.ts`）使用 session_id 保证幂等性：同一请求失败重试时携带相同的 session_id，成功后自动删除并在下次调用时重新生成。

为防止多个对话窗口并发创建话题时 session_id 互相覆盖，每个对话需使用独立的会话作用域。

**使用方法**：在对话首次调用创建话题命令前，生成一个随机 session 名称（如 6 位随机字符串），并在本次对话中所有 `create-topic.ts` 调用中通过 `ZHILIAO_SESSION` 环境变量传递：

```bash
cd <skill-path>/scripts && ZHILIAO_SESSION=a1b2c3 npx tsx create-topic.ts "话题描述"
```

**注意**：
- 同一对话中多次创建话题时必须使用相同的 `ZHILIAO_SESSION` 值，不同对话窗口使用不同的值
- 其他命令（`fetch-articles.ts`、`check-articles.ts`、`list-topics.ts`）不需要 `ZHILIAO_SESSION`

## 错误处理

- **未配置 API Key**：引导用户前往知了网站注册获取
- **免费额度用完**：提示用户访问知了网站付费充值
- **网络错误**：重试一次，失败后报告错误
- **文章为空**：话题刚创建需要时间聚合，建议稍后再查
