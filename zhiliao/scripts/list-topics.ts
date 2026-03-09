import { loadConfig, loadTopics, loadArticlesCache, formatArticle, FREE_TOPIC_LIMIT } from "./config.js";

function main() {
  const args = process.argv.slice(2);
  const topics = loadTopics();
  const config = loadConfig();

  if (topics.length === 0) {
    console.log("*暂无话题。使用 create-topic.ts 创建一个。*");
    return;
  }

  const targetId = args[0];

  if (targetId) {
    const topic = topics.find((t) => t.topic_id === targetId);
    if (!topic) {
      console.error(`未找到话题: ${targetId}`);
      process.exit(1);
    }
    console.log(`# ${topic.name}\n`);
    console.log(`| 字段 | 值 |`);
    console.log(`|------|------|`);
    console.log(`| ID | \`${topic.topic_id}\` |`);
    console.log(`| 描述 | ${topic.description} |`);
    console.log(`| 创建时间 | ${topic.created_at} |`);
    if (topic.surface_url) {
      console.log(`\n![封面](${topic.surface_url})`);
    }

    const cache = loadArticlesCache(topic.topic_id);
    if (cache) {
      console.log(`\n## 缓存文章 (更新于: ${cache.updated_at})\n`);
      for (let i = 0; i < cache.articles.length; i++) {
        console.log(formatArticle(cache.articles[i], i));
        console.log("");
      }
    }
    return;
  }

  // List all topics
  const quotaLabel = config.apiKey ? "付费用户 - 无限制" : `${topics.length}/${FREE_TOPIC_LIMIT} 免费额度`;
  console.log(`# 我的话题 (${quotaLabel})\n`);

  for (const topic of topics) {
    console.log(`## ${topic.name}\n`);
    console.log(`| 字段 | 值 |`);
    console.log(`|------|------|`);
    console.log(`| ID | \`${topic.topic_id}\` |`);
    console.log(`| 描述 | ${topic.description} |`);
    console.log(`| 创建时间 | ${topic.created_at} |`);

    const cache = loadArticlesCache(topic.topic_id);
    if (cache) {
      console.log(`| 缓存文章 | ${cache.articles.length} 篇 (更新于 ${cache.updated_at}) |`);
    }
    console.log("");
  }

  if (!config.apiKey && topics.length >= FREE_TOPIC_LIMIT) {
    console.log(`---\n\n> **提示**：免费额度已用完。如需创建更多话题，请访问知了网站申请 API Key。`);
  }
}

main();
