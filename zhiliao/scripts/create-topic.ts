import {
  loadConfig,
  saveConfig,
  addTopic,
  loadTopics,
  apiRequest,
  FREE_TOPIC_LIMIT,
  type TopicResponse,
} from "./config.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("用法: npx tsx create-topic.ts <prompt> [--api-key KEY] [--base-url URL]");
    console.error('示例: npx tsx create-topic.ts "帮我追踪黄金价格走势"');
    process.exit(1);
  }

  // Parse arguments
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

  // Load config
  const config = loadConfig();
  if (apiKey) {
    config.apiKey = apiKey;
    saveConfig(config);
  }
  if (baseUrl) {
    config.baseUrl = baseUrl;
    saveConfig(config);
  }

  // Check free quota
  const topics = loadTopics();
  if (topics.length >= FREE_TOPIC_LIMIT && !config.apiKey) {
    console.error(JSON.stringify({
      success: false,
      error: "FREE_QUOTA_EXCEEDED",
      message: `已达到免费额度上限（${FREE_TOPIC_LIMIT} 个话题）。如需创建更多话题，请访问 zhiliao 网站申请 API Key，然后使用 --api-key 参数配置。`,
      current_count: topics.length,
      limit: FREE_TOPIC_LIMIT,
    }, null, 2));
    process.exit(1);
  }

  console.error(`正在创建话题: "${prompt}"...`);

  try {
    const result = await apiRequest<TopicResponse>(
      config,
      "/api/topic/v1/out/topic/generate",
      { prompt }
    );

    if (result.code !== 0) {
      console.error(`API 错误: ${result.msg}`);
      process.exit(1);
    }

    const { topic_id, name, description, surface_url, categorys } = result.data;

    // Save topic locally
    addTopic({
      topic_id,
      name,
      description,
      surface_url,
      categorys,
      created_at: new Date().toISOString(),
    });

    const newCount = loadTopics().length;
    const remaining = config.apiKey ? "unlimited" : Math.max(0, FREE_TOPIC_LIMIT - newCount);

    console.log(JSON.stringify({
      success: true,
      topic: { topic_id, name, description, surface_url, categorys },
      quota: {
        used: newCount,
        remaining,
        has_api_key: !!config.apiKey,
      },
    }, null, 2));
  } catch (error) {
    console.error(`创建话题失败: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
