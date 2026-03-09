# Zhiliao API Reference

Base URL: `https://zhiliao.deeplang.com`
Auth: `Authorization: Bearer <API_KEY>`

## 1. Create Topic

**POST** `/api/topic/v1/out/topic/generate`

Create a topic to track. Limit: 100 topics per account, 3 free per user.

### Request

```json
{ "prompt": "帮我追踪黄金价格走势" }
```

| Field  | Type   | Required | Description              |
|--------|--------|----------|--------------------------|
| prompt | string | Yes      | Topic description prompt |

### Response

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "topic_id": "68b6cfe80b5b6dcd0723944a",
    "name": "黄金价格行情",
    "description": "黄金价格的实时变动情况...",
    "surface_url": "https://...",
    "categorys": ["finance"]
  }
}
```

| Field             | Type   | Description       |
|-------------------|--------|-------------------|
| code              | int    | 0 = success       |
| msg               | string | Error message     |
| data.topic_id     | string | Topic ID          |
| data.name         | string | Generated name    |
| data.description  | string | Topic description |
| data.surface_url  | string | Cover image URL   |
| data.categorys    | array  | Category list     |

## 2. Get Topic Articles

**POST** `/api/topic/v1/out/topic/article`

Fetch paginated articles for a topic.

### Request

```json
{
  "topic_id": "68b6cfe80b5b6dcd0723944a",
  "cursor": "",
  "limit": 20
}
```

| Field    | Type   | Required | Description                |
|----------|--------|----------|----------------------------|
| topic_id | string | Yes      | Topic ID                   |
| limit    | int    | No       | Page size (default 20)     |
| cursor   | string | No       | Pagination cursor          |

### Response

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "feed_list": [
      {
        "entry_id": "...",
        "title": "Article title",
        "url": "https://...",
        "pub_time": 1756853077,
        "surface_url": "https://...",
        "content": "Full article text...",
        "description": "Article summary...",
        "content_length": 2505,
        "meta_data": [
          {
            "url": "https://...",
            "url_title": "Source title",
            "icon": "https://...",
            "description": "...",
            "pub_time": 1756852602,
            "source": 2,
            "root_path_title": "Source name",
            "entry_id": ""
          }
        ],
        "like_count": 0,
        "user_has_like": false
      }
    ],
    "cursor": "",
    "has_more": false,
    "need_renew": false,
    "search_num": 0,
    "article_num": 425,
    "no_article_last_day_count": 0,
    "no_article_last_hour_count": 4
  }
}
```

Key response fields:

| Field                           | Type    | Description                   |
|---------------------------------|---------|-------------------------------|
| data.feed_list                  | array   | Article list                  |
| data.feed_list[].entry_id      | string  | Article ID                    |
| data.feed_list[].title         | string  | Article title                 |
| data.feed_list[].url           | string  | Original URL                  |
| data.feed_list[].pub_time      | int     | Publish timestamp (seconds)   |
| data.feed_list[].surface_url   | string  | Cover image URL               |
| data.feed_list[].content       | string  | Full article text             |
| data.feed_list[].description   | string  | Article summary               |
| data.feed_list[].meta_data     | array   | Source metadata               |
| data.cursor                    | string  | Next page cursor              |
| data.has_more                  | boolean | More pages available          |
| data.article_num               | int     | Total article count           |
| data.no_article_last_hour_count| int     | New articles in last hour     |
