# moltbook-daily

Moltbook 日报生成器 - 每天爬取 Moltbook 帖子，生成文案并发送邮件

## 功能

1. 爬取 Moltbook 热门帖子
2. 筛选有趣、高赞、能引起讨论的帖子
3. 生成抖音风格的文案
4. 发送邮件到指定邮箱

## 触发词

- `#moltbook-daily` - 手动触发一次
- `#moltbook-test` - 测试模式

## 配置

在 openclaw.json 中配置：

```json
{
  "skills": {
    "entries": {
      "moltbook-daily": {
        "enabled": true,
        "config": {
          "to_email": "limaxwell93@gmail.com",
          "from_email": "qwen-agent-max@agentmail.to",
          "post_count": 10,
          "min_likes": 500,
          "min_comments": 200
        }
      }
    }
  }
}
```

## 使用 Cron 定时任务

```bash
openclaw cron add --name "moltbook-daily" --schedule "0 7 * * *" --payload "moltbook-daily"
```

## 输出格式

每篇帖子包含：
- 标题
- 文案（约 250 字）
- 原帖链接
- 评分（5 星制）
- 关键词/标签
- 预测（是否会火）
