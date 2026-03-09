---
name: zhiliao
description: "知了 - AI 话题追踪与资讯聚合服务。适用场景：(1) 创建信息追踪话题（如追踪黄金价格、科技新闻、行业动态），(2) 获取和浏览话题下的聚合文章，(3) 设置定时任务定期抓取新文章，(4) 管理话题列表。触发关键词：zhiliao、知了、话题追踪、资讯聚合、信息监控、追踪话题、创建话题、文章聚合。"
---

# 知了 - AI 话题追踪与资讯聚合

通过自然语言创建追踪话题，自动从全网聚合相关文章。所有脚本输出均为 Markdown 格式。

## 初始化

首次使用前安装依赖：

```bash
cd <skill-path>/scripts && bash setup.sh
```

**无需 API Key 即可开始使用**，每位用户免费创建 3 个话题。

## 工作流程

### 1. 创建话题（多轮对话引导）

通过对话帮助用户创建精准的追踪话题：

1. **了解需求**：询问用户想追踪什么信息
2. **优化 prompt**：帮助用户细化描述，使话题更精准：
   - 模糊: "科技新闻" -> 优化: "AI大模型技术进展，包括OpenAI、Google、Anthropic等公司的最新发布和研究突破"
   - 模糊: "股市" -> 优化: "A股半导体板块行情分析，包括主要芯片公司股价走势和产业政策影响"
3. **调用创建**：
   ```bash
   cd <skill-path>/scripts && npx tsx create-topic.ts "优化后的PROMPT"
   ```
4. **展示结果**：向用户展示生成的话题名称、描述和封面图
5. **确认或迭代**：用户不满意则调整 prompt 重新创建

**额度说明**：
- 免费用户可创建 3 个话题，无需任何配置
- 超过 3 个话题时，脚本会自动提示用户前往知了网站申请 API Key
- 用户获取 API Key 后，通过 `--api-key` 配置：
  ```bash
  cd <skill-path>/scripts && npx tsx create-topic.ts "PROMPT" --api-key 用户的KEY
  ```
- API Key 会自动保存到 `~/.zhiliao/config.json`，后续无需重复输入

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

使用 OpenClaw 原生 cron 调度定期检查所有话题的新文章。

**注册定时任务**（每小时执行一次）：

```bash
openclaw cron add --cron "0 * * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

**手动触发一次检查**：

```bash
cd <skill-path>/scripts && npx tsx check-articles.ts
```

**自定义频率示例**：

```bash
# 每 30 分钟
openclaw cron add --cron "*/30 * * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"

# 每天早上 9 点
openclaw cron add --cron "0 9 * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

**管理定时任务**：

```bash
openclaw cron list              # 查看所有任务
openclaw cron remove <jobId>    # 删除任务
```

## 数据存储

所有数据保存在 `~/.zhiliao/` 目录：
- `config.json` - API Key 和服务地址（可选）
- `topics.json` - 已创建的话题列表
- `articles/` - 各话题的文章缓存

## API 参考

完整接口文档见 [references/api-docs.md](references/api-docs.md)。

## 错误处理

- **免费额度用完**：提示用户访问知了网站付费并申请 API Key
- **网络错误**：重试一次，失败后报告错误
- **文章为空**：话题刚创建需要时间聚合，建议稍后再查
