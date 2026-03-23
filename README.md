# 知了 - AI 话题追踪与资讯聚合 (OpenClaw Skill)

📰 通过自然语言创建追踪话题，自动从全网聚合相关资讯文章，并支持定时更新。

## 功能特点

- **自然语言创建话题** - 描述你想追踪的信息，AI 自动生成精准话题
- **智能话题推荐** - 创建前预览相关已有话题，避免重复创建
- **两步式创建** - 先预览再确认，支持创建新话题或关注已有话题
- **全网文章聚合** - 自动抓取和聚合话题相关的文章
- **定时任务** - 通过 OpenClaw Cron 定时检查新文章
- **Markdown 输出** - 所有结果以 Markdown 格式展示
- **无依赖** - 仅使用 curl + jq + iconv（系统自带），无需安装任何额外环境
- **免费起步** - 每个 API Key 前 3 个话题免费

## 安装方法

### 方法一：直接克隆到工作区（推荐）

```bash
cd ~/.openclaw/workspace/skills
git clone https://github.com/DeepLangAI/zhiliao-skills.git zhiliao
```

### 方法二：使用 ClawdHub 安装（发布后）

```bash
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

### 配置方式二：配置文件

```bash
mkdir -p ~/.zhiliao
echo '{"apiKey":"your-api-key-here"}' > ~/.zhiliao/config.json
```

### 配置方式三：OpenClaw 配置文件

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

## 使用方法

配置完成后，在 OpenClaw 中直接使用：

```
"帮我创建一个追踪黄金价格走势的话题"
"查看我的知了话题列表"
"获取话题 xxx 的最新文章"
"设置每小时自动检查新文章"
```

## 命令行工具

所有命令位于 `command/` 目录：

| 命令 | 功能 | 用法 |
|------|------|------|
| `create-topic` | 预览话题 | `./create-topic "描述" [SCOPE]` |
| `create-topic` | 预览并自动创建 | `./create-topic "描述" [SCOPE] --auto-create` |
| `create-topic` | 确认创建/关注 | `./create-topic --confirm --session-id ID --action create\|subscribe [--topic-id ID]` |
| `fetch-articles` | 获取文章 | `./fetch-articles TOPIC_ID [LIMIT] [CURSOR]` |
| `list-topics` | 查看话题列表 | `./list-topics [TOPIC_ID]` |
| `unsubscribe-topic` | 取消订阅话题 | `./unsubscribe-topic TOPIC_ID` |
| `check-articles` | 检查所有话题更新 | `./check-articles` |

示例：

```bash
cd ~/.openclaw/workspace/skills/zhiliao-skills/command

# Step 1: 预览话题（返回 JSON 含 session_id、待创建话题、相关话题）
./create-topic "追踪 AI 大模型技术进展"

# Step 2a: 确认创建新话题
./create-topic --confirm --session-id "SESSION_ID" --action create

# Step 2b: 或关注已有话题
./create-topic --confirm --session-id "SESSION_ID" --action subscribe --topic-id "TOPIC_ID"

# 一步到位：预览并自动创建
./create-topic "追踪 AI 大模型技术进展" --auto-create

# 查看话题列表
./list-topics

# 获取文章
./fetch-articles 69afe54d037de4f01d67b756

# 取消订阅话题
./unsubscribe-topic 69afe54d037de4f01d67b756

# 检查所有话题更新
./check-articles
```

## 额度说明

| 额度类型 | 话题数量 | 说明 |
|---------|---------|------|
| 免费 | 3 个 | 每个 API Key 自带 |
| 付费 | 无限制 | 访问知了网站充值 |

## 项目结构

```
zhiliao-skills/
├── SKILL.md               # OpenClaw Skill 定义文件
├── README.md              # 说明文档
└── command/               # CLI 命令工具
    ├── create-topic       # 创建话题（两步式：预览 + 确认）
    ├── fetch-articles     # 获取文章
    ├── list-topics        # 查看话题列表
    ├── unsubscribe-topic  # 取消订阅话题
    └── check-articles     # 检查所有话题更新
```

## 技术实现

- **纯 Shell 脚本** - 使用 bash + curl + jq + iconv
- **无需安装依赖** - 所有工具均为系统自带
- **控制字符处理** - 使用 `iconv -c -t UTF-8` 清理 API 响应
- **会话隔离** - 通过 SCOPE 机制避免并发冲突
- **本地缓存** - 文章数据缓存到 `~/.zhiliao/articles/`

## 故障排除

### API Key 未配置

**症状**: 提示未配置 API Key

**解决**: 设置环境变量 `export ZHILIAO_API_KEY="your-key"` 或写入 `~/.zhiliao/config.json`。

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
