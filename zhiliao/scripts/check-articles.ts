import {
  requireConfig,
  loadTopics,
  apiRequest,
  saveArticlesCache,
  formatArticle,
  cleanupArticleHtml,
  type ArticlesResponse,
} from "./config.js";

async function checkTopicArticles(topicId: string, topicName: string) {
  const config = requireConfig();

  try {
    const result = await apiRequest<ArticlesResponse>(
      config,
      "/api/topic/v1/out/topic/article",
      { topic_id: topicId, cursor: "", limit: 10 }
    );

    if (result.code !== 0) {
      console.error(`API 错误 (${topicName}): ${result.msg}`);
      return;
    }

    const articles = result.data.feed_list || [];
    saveArticlesCache(topicId, articles);

    console.log(`## ${topicName}\n`);
    console.log(`> 话题 ID: \`${topicId}\` | 共 ${result.data.article_num} 篇文章 | 最近一小时新增 ${result.data.no_article_last_hour_count} 篇\n`);

    if (articles.length === 0) {
      console.log("*暂无文章*\n");
    } else {
      for (let i = 0; i < articles.length; i++) {
        console.log(formatArticle(articles[i], i));
        console.log("");
      }
    }
    console.log("---\n");
  } catch (error) {
    console.error(
      `检查话题 "${topicName}" 失败: ${error instanceof Error ? error.message : error}`
    );
  }
}

async function main() {
  cleanupArticleHtml(100);
  const topics = loadTopics();
  if (topics.length === 0) {
    console.log("*暂无话题，请先创建一个话题。*");
    return;
  }

  const now = new Date().toLocaleString("zh-CN");
  console.log(`# 知了 - 话题资讯更新\n`);
  console.log(`> 检查时间: ${now} | 共 ${topics.length} 个话题\n`);

  for (const topic of topics) {
    await checkTopicArticles(topic.topic_id, topic.name);
  }

  console.log(`*下次检查将由 OpenClaw cron 自动触发*`);
}

main();
