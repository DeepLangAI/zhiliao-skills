# 知了 - AI 话题追踪与资讯聚合 (OpenClaw Skill)

📰 通过自然语言创建追踪话题，自动从全网聚合相关资讯文章，并支持定时更新。

## 功能特点

- **自然语言创建话题** - 描述你想追踪的信息，AI 自动生成精准话题
- **全网文章聚合** - 自动抓取和聚合话题相关的文章
- **定时任务** - 通过 OpenClaw Cron 定时检查新文章
- **Markdown 输出** - 所有结果以 Markdown 格式展示
- **免费起步** - 每个 API Key 前 3 个话题免费

## 安装方法

### 方法一：直接克隆到工作区（推荐）

```bash
# 进入 OpenClaw 工作区
cd ~/.openclaw/workspace/skills

# 克隆 skill
git clone https://github.com/DeepLangAI/zhiliao-skills.git zhiliao

# 安装依赖
cd zhiliao/zhiliao/scripts && bash setup.sh
```

### 方法二：使用 ClawdHub 安装（发布后）

```bash
clawdhub search zhiliao
clawdhub install zhiliao
```

## 配置

### 获取 API Key

1. 访问 [知了网站](https://zhiliao.news/)
2. 注册账号并进入 [API Key 申请页面](https://open.zhiliao.news/)
3. 获取 API Key

### 配置方式一：环境变量（推荐）

```bash
export ZHILIAO_API_KEY="your-api-key-here"
```

添加到 `~/.bashrc` 或 `~/.zshrc` 使其永久生效。

### 配置方式二：OpenClaw 配置文件

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "skills": {
    "entries": {
      "zhiliao": {
        "enabled": true,
        "env": {
          "ZHILIAO_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

### 配置方式三：命令行参数（首次使用时自动保存）

```bash
npx tsx create-topic.ts "帮我追踪黄金价格走势" --api-key YOUR_KEY
```

API Key 会自动保存到 `~/.zhiliao/config.json`，后续无需重复输入。

## 使用方法

配置完成后，在 OpenClaw 中直接使用：

```
"帮我创建一个追踪黄金价格走势的话题"
"查看我的知了话题列表"
"获取话题 xxx 的最新文章"
"设置每小时自动检查新文章"
```

## 额度说明

| 额度类型 | 话题数量 | 说明 |
|---------|---------|------|
| 免费 | 3 个 | 每个 API Key 自带 |
| 付费 | 无限制 | 访问知了网站充值 |

## 项目结构

```
zhiliao/
├── SKILL.md               # OpenClaw Skill 定义文件
├── README.md              # 说明文档
├── references/
│   └── api-docs.md        # API 接口文档
└── scripts/
    ├── package.json       # Node.js 项目配置
    ├── tsconfig.json      # TypeScript 配置
    ├── setup.sh           # 依赖安装脚本
    ├── config.ts          # 共享配置和工具函数
    ├── create-topic.ts    # 创建话题
    ├── fetch-articles.ts  # 获取文章
    ├── list-topics.ts     # 查看话题列表
    └── check-articles.ts  # 定时检查脚本（供 OpenClaw Cron 调用）
```

## 故障排除

### API Key 未配置

**症状**: 提示 `错误: 未配置 API Key`

**解决**: 设置环境变量 `export ZHILIAO_API_KEY="your-key"` 或通过 `--api-key` 参数传入。

### 免费额度用完

**症状**: 创建话题时服务端返回错误

**解决**: 访问 [知了网站](https://zhiliao.news/) 付费充值。

### 文章为空

**症状**: 话题创建后没有文章

**解决**: 话题刚创建时需要一些时间聚合内容，建议等待几分钟后再查询。

## 相关链接

- [知了网站](https://zhiliao.news/)
- [API Key 申请](https://open.zhiliao.news/)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [ClawdHub](https://clawdhub.com)
