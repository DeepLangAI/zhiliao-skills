#!/bin/bash
# Setup script for zhiliao skill scripts
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Installing dependencies..."
npm install

echo ""
echo "Setup complete! Available commands:"
echo "  npx tsx create-topic.ts <prompt> --api-key <key>  # Create a topic"
echo "  npx tsx fetch-articles.ts <topic_id>              # Fetch articles"
echo "  npx tsx list-topics.ts                            # List all topics"
echo "  npx tsx cron-daemon.ts                            # Start cron daemon"
echo "  npx tsx cron-daemon.ts --once                     # Single check"
