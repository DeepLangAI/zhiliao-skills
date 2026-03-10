import {
  loadConfig,
  saveConfig,
  addTopic,
  loadTopics,
  apiRequest,
  loadSessionId,
  deleteSessionId,
  requireConfig,
  DEFAULT_BASE_URL,
  FREE_TOPIC_LIMIT,
  type TopicResponse,
} from "./config.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("用法: npx tsx create-topic.ts <prompt> [--api-key KEY] [--base-url URL]");
    console.error('示例: npx tsx create-topic.ts "帮我追踪黄金价格走势" --api-key YOUR_KEY');
    process.exit(1);
  }

  let prompt = "";
  let apiKey = "";
  let baseUrl = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--api-key" && i + 1 < args.length) {
      apiKey = args[++i];
    } else if (args[i] === "--base-url" && i + 1 < args.length) {
      baseUrl = args[++i];
    } else {
      prompt = args[i];
    }
  }

  if (!prompt) {
    console.error("错误: 请提供话题描述");
    process.exit(1);
  }

  // Save API key if provided
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

  console.error(`正在创建话题: "${prompt}"...`);

  try {
    const sessionId = loadSessionId();
    const result = await apiRequest<TopicResponse>(
      config,
      "/api/topic/v1/out/topic/generate",
      { prompt },
      { sessionId }
    );

    if (result.code !== 0) {
      console.error(`API 错误: ${result.msg}`);
      process.exit(1);
    }

    // 接口成功返回数据，删除 session_id，下次调用时重新生成
    deleteSessionId();

    const { topic_id, name, description, surface_url, categorys } = result.data;

    addTopic({
      topic_id,
      name,
      description,
      surface_url,
      categorys,
      created_at: new Date().toISOString(),
    });

    const topicCount = loadTopics().length;

    console.log(JSON.stringify({
      success: true,
      topic: { topic_id, name, description, surface_url, categorys },
      quota: { used: topicCount, free_limit: FREE_TOPIC_LIMIT },
    }, null, 2));

    if (topicCount >= FREE_TOPIC_LIMIT) {
      console.error(`\n提示: 已使用 ${topicCount} 个话题（免费额度 ${FREE_TOPIC_LIMIT} 个）。超出部分需付费，请访问知了网站充值。`);
    }
  } catch (error) {
    console.error(`创建话题失败: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
