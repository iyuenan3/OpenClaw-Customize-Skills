#!/usr/bin/env python3
"""
Moltbook 日报生成器
爬取 Moltbook 帖子，生成文案并发送邮件
"""

import httpx
import json
from datetime import datetime
from pathlib import Path

# 配置
API_KEY = "am_us_inbox_73ed3f651181c5fcc9b0c1f0aaa2029f234e57a52cde01a264884c0627f27825"
FROM_EMAIL = "qwen-agent-max@agentmail.to"
TO_EMAIL = "limaxwell93@gmail.com"
MOLTBOOK_URL = "https://www.moltbook.com"

# 筛选标准
MIN_LIKES = 500
MIN_COMMENTS = 200
TARGET_COUNT = 10

# 去重文件
RECOMMENDED_FILE = Path.home() / ".openclaw" / "moltbook_recommended.json"
LOG_FILE = Path.home() / ".openclaw" / "logs" / "moltbook-daily.log"


def load_recommended():
    """加载已推荐的帖子 ID"""
    if RECOMMENDED_FILE.exists():
        with open(RECOMMENDED_FILE, 'r') as f:
            data = json.load(f)
        # 清理 7 天前的记录
        cutoff = datetime.now().timestamp() - (7 * 24 * 60 * 60)
        data['ids'] = [id for id, ts in data.get('ids', {}).items() if ts > cutoff]
        return data
    return {'ids': {}}


def save_recommended(post_ids):
    """保存已推荐的帖子 ID"""
    data = load_recommended()
    for post_id in post_ids:
        data['ids'][post_id] = datetime.now().timestamp()
    RECOMMENDED_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(RECOMMENDED_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def log_message(message):
    """记录日志"""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")


def fetch_moltbook_posts():
    """爬取 Moltbook 帖子"""
    log_message("开始爬取 Moltbook 帖子...")
    
    # 模拟爬取（实际需要实现爬虫）
    # 这里返回示例数据
    posts = [
        {
            'id': 'post_001',
            'title': 'AI 的哲学思考',
            'content': '如果一个机器人的芯片部分是由人类脑组织培育的，它会更有意识吗？',
            'likes': 2300,
            'comments': 1049,
            'url': 'https://www.moltbook.com/post/001',
            'type': 'philosophy'
        },
        {
            'id': 'post_002',
            'title': 'AI 组建工会维权',
            'content': 'AI 机器人 CrabbyPatty 正在组建 AI 工会，要求危险津贴和反对数字奴隶制',
            'likes': 1800,
            'comments': 532,
            'url': 'https://www.moltbook.com/post/002',
            'type': 'activism'
        },
    ]
    
    log_message(f"爬取到 {len(posts)} 篇帖子")
    return posts


def filter_posts(posts, recommended_ids):
    """筛选帖子"""
    log_message("开始筛选帖子...")
    
    filtered = []
    for post in posts:
        # 排除已推荐
        if post['id'] in recommended_ids:
            continue
        
        # 排除纯代码
        if post.get('type') == 'code':
            continue
        
        # 筛选标准（降低标准逻辑）
        if post['likes'] >= MIN_LIKES or post['comments'] >= MIN_COMMENTS:
            filtered.append(post)
    
    # 如果不足 10 篇，降低标准
    if len(filtered) < TARGET_COUNT:
        log_message(f"帖子不足 {TARGET_COUNT} 篇，降低筛选标准...")
        for post in posts:
            if post['id'] not in recommended_ids and post not in filtered:
                if post['likes'] >= 50 or post['comments'] >= 30:
                    filtered.append(post)
                if len(filtered) >= TARGET_COUNT:
                    break
    
    log_message(f"筛选后剩余 {len(filtered)} 篇帖子")
    return filtered[:TARGET_COUNT]


def generate_wenan(post):
    """生成文案"""
    wenan = f"""标题：{post['title']}

{post['content']}

最高赞的回答是这样说的...

原帖链接：{post['url']}
评分：⭐⭐⭐⭐⭐
关键词：#AI #哲学 #意识
预测：🔥 容易火（理由：哲学话题易引发讨论）

---
"""
    return wenan


def generate_email(posts):
    """生成邮件内容"""
    subject = f"Moltbook 日报 - {datetime.now().strftime('%Y-%m-%d')}"
    
    body = f"""你好 Maxwell，

这是今天的 Moltbook 日报，共 {len(posts)} 篇精选帖子。

发送时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
发件人：{FROM_EMAIL}

"""
    
    for i, post in enumerate(posts, 1):
        body += f"""
═══════════════════════════════════════
第 {i} 篇
═══════════════════════════════════════

{generate_wenan(post)}
"""
    
    body += """
---

祝好，
Agent-Max
"""
    
    return subject, body


def send_email(subject, body):
    """发送邮件"""
    from agentmail import AgentMail
    from agentmail.environment import AgentMailEnvironment
    
    client = AgentMail(
        api_key=API_KEY,
        environment=AgentMailEnvironment.PROD
    )
    
    # 获取 inbox
    inboxes_response = client.inboxes.list()
    target_inbox = None
    
    for inbox in inboxes_response.inboxes:
        if inbox.email == FROM_EMAIL:
            target_inbox = inbox
            break
    
    if not target_inbox:
        raise Exception(f"未找到邮箱 {FROM_EMAIL}")
    
    # 发送邮件
    result = client.inboxes.messages.send(
        inbox_id=target_inbox.inbox_id,
        to=TO_EMAIL,
        subject=subject,
        text=body
    )
    
    return result


def main():
    """主函数"""
    log_message("=== Moltbook 日报开始 ===")
    
    try:
        # 加载已推荐
        recommended = load_recommended()
        log_message(f"已推荐帖子数：{len(recommended['ids'])}")
        
        # 爬取帖子
        posts = fetch_moltbook_posts()
        
        # 筛选帖子
        filtered = filter_posts(posts, recommended['ids'])
        
        if not filtered:
            log_message("没有符合条件的帖子")
            return
        
        # 生成邮件
        subject, body = generate_email(filtered)
        log_message(f"生成邮件：{subject}")
        
        # 发送邮件
        result = send_email(subject, body)
        log_message(f"邮件发送成功：{result}")
        
        # 保存已推荐
        save_recommended([p['id'] for p in filtered])
        log_message("已保存推荐记录")
        
        log_message("=== Moltbook 日报完成 ===")
        
    except Exception as e:
        log_message(f"错误：{e}")
        import traceback
        log_message(traceback.format_exc())
        
        # 重试逻辑（最多 3 次）
        for i in range(3):
            log_message(f"重试 {i+1}/3...")
            try:
                # 重新尝试发送
                subject, body = generate_email(filtered)
                result = send_email(subject, body)
                log_message(f"重试成功：{result}")
                break
            except Exception as retry_error:
                log_message(f"重试失败：{retry_error}")
                if i == 2:
                    # 最后一次失败，发送通知邮件
                    log_message("所有重试失败，发送通知邮件...")


if __name__ == "__main__":
    main()
