import {
  loadConfig,
  saveConfig,
  requireConfig,
  apiRequest,
  saveArticlesCache,
  formatArticle,
  DEFAULT_BASE_URL,
  type ArticlesResponse,
  type Article,
} from "./config.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("用法: npx tsx fetch-articles.ts <topic_id> [--limit N] [--cursor CURSOR] [--api-key KEY] [--json]");
    process.exit(1);
  }

  let topicId = "";
  let limit = 20;
  let cursor = "";
  let apiKey = "";
  let baseUrl = "";
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && i + 1 < args.length) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === "--cursor" && i + 1 < args.length) {
      cursor = args[++i];
    } else if (args[i] === "--api-key" && i + 1 < args.length) {
      apiKey = args[++i];
    } else if (args[i] === "--base-url" && i + 1 < args.length) {
      baseUrl = args[++i];
    } else if (args[i] === "--json") {
      jsonOutput = true;
    } else {
      topicId = args[i];
    }
  }

  if (!topicId) {
    console.error("错误: 请提供 topic_id");
    process.exit(1);
  }

  if (apiKey) {
    saveConfig({
      apiKey,
      baseUrl: baseUrl || loadConfig()?.baseUrl || DEFAULT_BASE_URL,
    });
  } else if (baseUrl) {
    const existing = loadConfig();
    if (existing) {
      existing.baseUrl = baseUrl;
      saveConfig(existing);
    }
  }

  const config = requireConfig();

  try {
    const result = await apiRequest<ArticlesResponse>(
      config,
      "/api/topic/v1/out/topic/article",
      { topic_id: topicId, limit, cursor }
    );

    if (result.code !== 0) {
      console.error(`API 错误: ${result.msg}`);
      process.exit(1);
    }

    const articles: Article[] = result.data.feed_list || [];
    saveArticlesCache(topicId, articles);

    if (jsonOutput) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log(`# 话题文章\n`);
      console.log(`> 本页 ${articles.length} 篇 | 共 ${result.data.article_num} 篇 | 最近一小时新增 ${result.data.no_article_last_hour_count} 篇 | 最近一天新增 ${result.data.no_article_last_day_count} 篇\n`);
      if (articles.length === 0) {
        console.log("*暂无文章，话题刚创建时需要一些时间来聚合内容。*");
      } else {
        for (let i = 0; i < articles.length; i++) {
          console.log(formatArticle(articles[i], i));
          console.log("");
        }
      }
      if (result.data.has_more) {
        console.log(`---\n\n**还有更多文章**，使用 \`--cursor "${result.data.cursor}"\` 获取下一页`);
      }
    }
  } catch (error) {
    console.error(`获取文章失败: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
