# 知了 - AI 话题追踪与资讯聚合

通过自然语言创建追踪话题，自动从全网聚合相关资讯文章。基于知了 API 构建的 OpenClaw Skill。

## 功能特性

- **自然语言创建话题** - 描述你想追踪的信息，AI 自动生成精准话题
- **全网文章聚合** - 自动抓取和聚合话题相关的文章
- **定时任务** - 通过 OpenClaw Cron 每小时自动检查新文章
- **免费起步** - 每个 API Key 前 3 个话题免费

## 快速开始

### 安装

```bash
cd zhiliao/scripts && bash setup.sh
```

### 获取 API Key

访问 https://zhiliao.deeplang.com 注册并获取 API Key。

### 创建话题（首次需带 --api-key）

```bash
npx tsx create-topic.ts "帮我追踪黄金价格走势" --api-key YOUR_API_KEY
```

API Key 保存后，后续使用无需重复输入：

```bash
npx tsx create-topic.ts "追踪AI大模型技术进展"
```

### 获取文章

```bash
npx tsx fetch-articles.ts <topic_id>
```

### 设置定时检查

```bash
openclaw cron add --cron "0 * * * *" --isolated --prompt "运行知了文章检查: cd <skill-path>/scripts && npx tsx check-articles.ts"
```

## 额度说明

| 额度类型 | 话题数量 | 说明 |
|---------|---------|------|
| 免费 | 3 个 | 每个 API Key 自带 |
| 付费 | 无限制 | 访问知了网站充值 |

## 项目结构

```
zhiliao/
├── SKILL.md               # Skill 定义和使用说明
├── references/
│   └── api-docs.md        # API 接口文档
└── scripts/
    ├── config.ts           # 共享配置和工具函数
    ├── create-topic.ts     # 创建话题
    ├── fetch-articles.ts   # 获取文章
    ├── list-topics.ts      # 查看话题列表
    ├── check-articles.ts   # 定时检查脚本（供 OpenClaw Cron 调用）
    ├── setup.sh            # 依赖安装脚本
    ├── package.json        # Node.js 依赖
    └── tsconfig.json       # TypeScript 配置
```
