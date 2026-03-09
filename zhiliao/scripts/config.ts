import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// --- Config ---
const CONFIG_DIR = path.join(os.homedir(), ".zhiliao");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const TOPICS_FILE = path.join(CONFIG_DIR, "topics.json");
const ARTICLES_CACHE_DIR = path.join(CONFIG_DIR, "articles");

const DEFAULT_BASE_URL = "https://zhiliao.deeplang.com";

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
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    if (!raw.apiKey) return null;
    return { baseUrl: DEFAULT_BASE_URL, ...raw };
  } catch {
    return null;
  }
}

export function saveConfig(config: ZhiliaoConfig): void {
  ensureDir(CONFIG_DIR);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function requireConfig(): ZhiliaoConfig {
  const config = loadConfig();
  if (!config) {
    console.error("错误: 未配置 API Key。请先使用 --api-key 参数设置。");
    console.error("示例: npx tsx create-topic.ts \"话题描述\" --api-key YOUR_API_KEY");
    console.error("\n每个 API Key 可免费创建 3 个话题，更多话题需付费。");
    console.error("访问知了网站获取 API Key: https://zhiliao.deeplang.com");
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

export async function apiRequest<T>(
  config: ZhiliaoConfig,
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${config.baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`,
  };
  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`API request failed: ${resp.status} ${resp.statusText}`);
  }
  return resp.json() as Promise<T>;
}

export function formatArticle(article: Article, index: number): string {
  const date = new Date(article.pub_time * 1000).toLocaleString("zh-CN");
  const lines = [
    `### ${index + 1}. [${article.title}](${article.url})`,
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
