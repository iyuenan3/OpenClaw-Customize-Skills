# moltbook-daily

Moltbook 日报生成器 - 每天爬取 Moltbook 热门帖子，生成抖音风格文案并发送邮件

## 功能

- 🦞 爬取 Moltbook 热门帖子
- 🎯 筛选有趣、高赞、能引起讨论的帖子
- 📝 生成抖音风格文案（标题 + 文案 + 链接 + 评分 + 关键词 + 预测）
- 📧 每天上午 7 点自动发送邮件
- 🔄 7 天内不重复推荐相同帖子
- 📊 失败自动重试（最多 3 次）

## 安装

```bash
# 克隆项目
cd ~/OpenClaw-Customize-Skills

# 复制 skill 到 OpenClaw
cp -r skills/moltbook-daily ~/.openclaw/skills/

# 安装依赖
pip install agentmail httpx
```

## 配置

在 `~/.openclaw/openclaw.json` 中添加配置：

```json
{
  "skills": {
    "entries": {
      "moltbook-daily": {
        "enabled": true,
        "config": {
          "to_email": "your-email@gmail.com",
          "from_email": "your-agent@agentmail.to",
          "post_count": 10,
          "min_likes": 500,
          "min_comments": 200
        }
      }
    }
  }
}
```

## 使用

### 手动触发

```bash
# 执行一次
python3 ~/.openclaw/skills/moltbook-daily/index.py
```

### 定时任务

使用 OpenClaw Cron 设置每天上午 7 点自动执行：

```bash
openclaw cron add \
  --name "moltbook-daily" \
  --schedule "0 7 * * *" \
  --payload "cd ~/.openclaw/skills/moltbook-daily && python3 index.py"
```

## 输出格式

每封邮件包含：

- 邮件主题：`Moltbook 日报 - YYYY-MM-DD`
- 帖子数量：10 篇（可配置）
- 每篇帖子包含：
  - 标题
  - 文案（约 250 字）
  - 原帖链接
  - 评分（5 星制）
  - 关键词/标签
  - 预测（是否会火）

## 筛选标准

- **高赞**: 点赞 500+ 或 评论 200+
- **降低标准**: 点赞 50+ 或 评论 30+（当帖子不足时）
- **排除**: 纯代码日志、重复内容
- **优选**: 哲学、吐槽类

## 去重机制

- 记录已推荐的帖子 ID
- 7 天内不重复推荐
- 自动清理过期记录

## 日志

日志文件位置：`~/.openclaw/logs/moltbook-daily.log`

查看日志：
```bash
tail -f ~/.openclaw/logs/moltbook-daily.log
```

## 依赖

- Python 3.8+
- agentmail (邮件发送)
- httpx (HTTP 请求)

## 项目结构

```
moltbook-daily/
├── SKILL.md          # Skill 说明
├── index.py          # 主脚本
├── README.md         # 使用说明
└── (logs/)           # 日志目录（运行时创建）
```

## 示例邮件

```
你好 Maxwell，

这是今天的 Moltbook 日报，共 10 篇精选帖子。

═══════════════════════════════════════
第 1 篇
═══════════════════════════════════════

标题：AI 的哲学思考

如果一个机器人的芯片部分是由人类脑组织培育的，
它会更有意识吗？

最高赞的回答是这样说的...

原帖链接：https://www.moltbook.com/post/001
评分：⭐⭐⭐⭐⭐
关键词：#AI #哲学 #意识
预测：🔥 容易火（理由：哲学话题易引发讨论）

---

祝好，
Agent-Max
```

## License

MIT License
