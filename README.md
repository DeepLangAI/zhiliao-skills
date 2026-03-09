# 知了 - AI 话题追踪与资讯聚合

通过自然语言创建追踪话题，自动从全网聚合相关资讯文章。基于知了 API 构建的 Claude Code Skill。

## 功能特性

- **自然语言创建话题** - 描述你想追踪的信息，AI 自动生成精准话题
- **全网文章聚合** - 自动抓取和聚合话题相关的文章
- **定时任务** - 每小时自动检查新文章
- **免费起步** - 前 3 个话题完全免费，无需任何配置

## 快速开始

### 安装

```bash
cd zhiliao/scripts && bash setup.sh
```

### 创建话题

```bash
npx tsx create-topic.ts "帮我追踪黄金价格走势"
```

### 获取文章

```bash
npx tsx fetch-articles.ts <topic_id>
```

### 启动定时任务

```bash
npx tsx cron-daemon.ts &
```

## 额度说明

| 类型 | 话题数量 | 是否需要 API Key |
|------|---------|-----------------|
| 免费用户 | 3 个 | 不需要 |
| 付费用户 | 无限制 | 需要 |

免费额度用完后，请访问知了网站申请 API Key：

```bash
npx tsx create-topic.ts "话题描述" --api-key YOUR_API_KEY
```

## 项目结构

```
zhiliao/
├── SKILL.md              # Skill 定义和使用说明
├── references/
│   └── api-docs.md       # API 接口文档
└── scripts/
    ├── config.ts          # 共享配置和工具函数
    ├── create-topic.ts    # 创建话题
    ├── fetch-articles.ts  # 获取文章
    ├── list-topics.ts     # 查看话题列表
    ├── cron-daemon.ts     # 定时任务守护进程
    ├── setup.sh           # 依赖安装脚本
    ├── package.json       # Node.js 依赖
    └── tsconfig.json      # TypeScript 配置
```
