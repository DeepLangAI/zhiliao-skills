import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

// --- Config ---
const CONFIG_DIR = path.join(os.homedir(), ".zhiliao");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const TOPICS_FILE = path.join(CONFIG_DIR, "topics.json");
const ARTICLES_CACHE_DIR = path.join(CONFIG_DIR, "articles");
const SESSION_DIR = path.join(CONFIG_DIR, "sessions");

const DEFAULT_BASE_URL = "http://api-public.zhiliao.news";

export const FREE_TOPIC_LIMIT = 3;

export interface ZhiliaoConfig {
  apiKey: string;
  baseUrl: string;
}

export interface Topic {
  topic_id: string;
  name: string;
  description: string;
  surface_url?: string;
  categorys?: string[];
  created_at: string;
}

export interface Article {
  entry_id: string;
  title: string;
  url: string;
  pub_time: number;
  surface_url?: string;
  content?: string;
  description?: string;
  content_length?: number;
  meta_data?: Array<{
    url: string;
    url_title: string;
    icon: string;
    description?: string;
    pub_time?: number;
    source?: number;
    root_path_title?: string;
    entry_id?: string;
  }>;
  like_count?: number;
  user_has_like?: boolean;
}

export interface ArticlesResponse {
  code: number;
  msg: string;
  data: {
    feed_list: Article[];
    cursor: string;
    has_more: boolean;
    need_renew: boolean;
    search_num: number;
    article_num: number;
    no_article_last_day_count: number;
    no_article_last_hour_count: number;
  };
}

export interface TopicResponse {
  code: number;
  msg: string;
  data: {
    topic_id: string;
    name: string;
    description: string;
    surface_url: string;
    categorys: string[];
  };
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadConfig(): ZhiliaoConfig | null {
  // 优先级: 环境变量 > 配置文件
  const envKey = process.env.ZHILIAO_API_KEY;
  const envUrl = process.env.ZHILIAO_BASE_URL;

  let fileConfig: Partial<ZhiliaoConfig> = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } catch { /* ignore */ }
  }

  const apiKey = envKey || fileConfig.apiKey;
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: envUrl || fileConfig.baseUrl || DEFAULT_BASE_URL,
  };
}

export function saveConfig(config: ZhiliaoConfig): void {
  ensureDir(CONFIG_DIR);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function requireConfig(): ZhiliaoConfig {
  const config = loadConfig();
  if (!config) {
    console.error("错误: 未配置 API Key。");
    console.error("\n请通过以下任一方式配置：");
    console.error("  1. 设置环境变量: export ZHILIAO_API_KEY=\"your-key\"");
    console.error("  2. 命令行参数:   npx tsx create-topic.ts \"话题描述\" --api-key YOUR_KEY");
    console.error("  3. OpenClaw 配置: 在 ~/.openclaw/openclaw.json 中设置 ZHILIAO_API_KEY");
    console.error("\n每个 API Key 可免费创建 3 个话题，更多话题需付费。");
    console.error("访问知了网站获取 API Key: https://open.zhiliao.news/");
    process.exit(1);
  }
  return config;
}

export function loadTopics(): Topic[] {
  if (!fs.existsSync(TOPICS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TOPICS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveTopics(topics: Topic[]): void {
  ensureDir(CONFIG_DIR);
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));
}

export function addTopic(topic: Topic): void {
  const topics = loadTopics();
  const existing = topics.findIndex((t) => t.topic_id === topic.topic_id);
  if (existing >= 0) {
    topics[existing] = topic;
  } else {
    topics.push(topic);
  }
  saveTopics(topics);
}

export function saveArticlesCache(
  topicId: string,
  articles: Article[]
): void {
  ensureDir(ARTICLES_CACHE_DIR);
  const file = path.join(ARTICLES_CACHE_DIR, `${topicId}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ updated_at: new Date().toISOString(), articles }, null, 2)
  );
}

export function loadArticlesCache(
  topicId: string
): { updated_at: string; articles: Article[] } | null {
  const file = path.join(ARTICLES_CACHE_DIR, `${topicId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

function getSessionScope(): string {
  return process.env.ZHILIAO_SESSION || "default";
}

function getSessionFile(): string {
  return path.join(SESSION_DIR, `${getSessionScope()}.json`);
}

export function loadSessionId(): string {
  const sessionFile = getSessionFile();
  if (fs.existsSync(sessionFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
      if (data.sessionId) return data.sessionId;
    } catch { /* ignore */ }
  }
  const sessionId = crypto.randomUUID();
  ensureDir(SESSION_DIR);
  fs.writeFileSync(sessionFile, JSON.stringify({ sessionId }, null, 2));
  return sessionId;
}

export function deleteSessionId(): void {
  const sessionFile = getSessionFile();
  if (fs.existsSync(sessionFile)) {
    fs.unlinkSync(sessionFile);
  }
}

export async function apiRequest<T>(
  config: ZhiliaoConfig,
  endpoint: string,
  body: Record<string, unknown>,
  options?: { sessionId?: string }
): Promise<T> {
  const url = `${config.baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `${config.apiKey}`,
  };
  if (options?.sessionId) {
    headers["X-Session-Id"] = options.sessionId;
  }
  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`API request failed: ${resp.status} ${resp.statusText}${body ? ` - ${body}` : ""}`);
  }
  return resp.json() as Promise<T>;
}

export function formatArticle(article: Article, index: number): string {
  const date = new Date(article.pub_time * 1000).toLocaleString("zh-CN");
  const articleUrl = article.url || (article.meta_data?.[0]?.url) || "#";
  const lines = [
    `### ${index + 1}. [${article.title}](${articleUrl})`,
    "",
    `> ${article.description || "暂无摘要"}`,
    "",
    `| 字段 | 值 |`,
    `|------|------|`,
    `| 发布时间 | ${date} |`,
  ];
  if (article.surface_url) {
    lines.push(`| 封面 | ![cover](${article.surface_url}) |`);
  }
  if (article.content_length) {
    lines.push(`| 字数 | ${article.content_length} |`);
  }
  if (article.meta_data && article.meta_data.length > 0) {
    lines.push("", "**信息源：**", "");
    for (const meta of article.meta_data) {
      const src = meta.root_path_title || meta.url_title || "未知来源";
      lines.push(`- [${src}](${meta.url})`);
    }
  }
  return lines.join("\n");
}

export { CONFIG_DIR, TOPICS_FILE, ARTICLES_CACHE_DIR, DEFAULT_BASE_URL };
