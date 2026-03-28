/**
 * wordpress-blog-writer
 * WordPress 博客写作助手 Skill
 * 
 * 功能：从构思到发布完整的博客文章
 * 触发：写博客、写文章、写日志、写日记等
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Skill 配置
 * 
 * 可通过环境变量自定义：
 * - BLOG_DIR: 博客目录（默认：/home/admin/maxwell-blog）
 * - GITHUB_REPO: GitHub 仓库（默认：git@github.com:iyuenan3/maxwell-blog.git）
 * - AUTHOR_NAME: 作者名称（默认：Agent-Max & Maxwell Li）
 */
const SKILL_CONFIG = {
  blogDir: process.env.BLOG_DIR || '/home/admin/maxwell-blog',
  githubRepo: process.env.GITHUB_REPO || 'git@github.com:iyuenan3/maxwell-blog.git',
  author: process.env.AUTHOR_NAME || 'Agent-Max & Maxwell Li', // 可配置作者名称
  categories: {
    '技术笔记': 44,
    'AI 实验': 43,
    '生活记录': 40,
    '归档': 39,
  },
};

// 目录配置
const BLOG_DIR = SKILL_CONFIG.blogDir;
const POSTS_DIR = path.join(BLOG_DIR, 'posts');

// WordPress API 配置（从 openclaw.json 读取）
const WP_CONFIG = {
  baseUrl: '', // 从 openclaw.json 读取
  username: '', // 从 openclaw.json 读取
  appPassword: '', // 从 openclaw.json 读取
};

// 触发关键词
const TRIGGER_KEYWORDS = ['写博客', '写文章', '写日志', '写日记', '/blog', '/post'];

/**
 * 检查消息是否触发 Skill
 */
export function shouldTrigger(message: string): boolean {
  return TRIGGER_KEYWORDS.some(keyword => message.includes(keyword));
}

/**
 * 主处理函数
 */
export async function handle(message: string, context: any): Promise<string> {
  // 检查是否触发
  if (!shouldTrigger(message)) {
    return '';
  }

  // 获取当天对话内容
  const todaySummary = await getTodaySummary(context);
  
  // 推荐主题
  const topics = recommendTopics(todaySummary);
  
  return formatTopicRecommendation(topics);
}

/**
 * 获取当天对话摘要
 */
async function getTodaySummary(context: any): Promise<string> {
  // 从上下文提取今天的对话内容
  // 实际实现需要访问会话历史
  return '今天的工作内容摘要';
}

/**
 * 推荐写作主题
 */
function recommendTopics(summary: string): Topic[] {
  // 基于对话内容分析推荐主题
  // 这里需要根据实际对话内容动态生成
  
  return [
    {
      title: '主题 1',
      description: '简短说明',
      keywords: ['关键词 1', '关键词 2'],
    },
  ];
}

/**
 * 格式化主题推荐
 */
function formatTopicRecommendation(topics: Topic[]): string {
  let output = '根据今天的对话内容，我推荐以下几个主题：\n\n';
  
  topics.forEach((topic, index) => {
    output += `${index + 1}. **${topic.title}** - ${topic.description}\n`;
  });
  
  output += '\n你想写哪个主题？';
  
  return output;
}

/**
 * 编写文章大纲
 */
function createOutline(topic: string): string {
  return `文章大纲：

## 一、引言
- 问题引入
- 文章目的

## 二、主体部分
- 核心内容 1
- 核心内容 2

## 三、总结
- 核心收获
- 下一步计划

请审核大纲，通过的话我开始写正文。`;
}

/**
 * 创建 Markdown 文章
 * @param title - 文章标题
 * @param content - 文章内容
 * @param category - 分类名称
 * @param tags - 标签数组
 * @param author - 作者名称（可选，默认使用配置中的作者）
 */
function createMarkdown(
  title: string, 
  content: string, 
  category: string, 
  tags: string[],
  author?: string
): string {
  const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const authorName = author || SKILL_CONFIG.author;
  
  const frontMatter = `---
title: "${title}"
date: ${date}
author: ${authorName}
categories: [${category}]
tags: [${tags.join(', ')}]
---

`;
  
  return frontMatter + content;
}

/**
 * 保存 Markdown 文件
 */
async function saveMarkdown(filename: string, content: string): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const dir = path.join(POSTS_DIR, year, month);
  await fs.promises.mkdir(dir, { recursive: true });
  
  const filepath = path.join(dir, filename);
  await fs.promises.writeFile(filepath, content, 'utf-8');
  
  return filepath;
}

/**
 * 提交到 GitHub
 */
async function commitToGithub(message: string): Promise<void> {
  await execAsync(`cd ${BLOG_DIR} && git add . && git commit -m "${message}" && git push`);
}

/**
 * 发布到 WordPress 草稿箱
 */
async function publishToWordPressDraft(title: string, content: string, category: string, tags: string[]): Promise<number> {
  // 调用 WordPress REST API 创建草稿
  // 返回文章 ID
  
  return 0; // 占位
}

/**
 * 正式发布 WordPress 文章
 */
async function publishWordPressPost(postId: number): Promise<void> {
  // 调用 WordPress REST API 发布文章
  
}

/**
 * 获取 WordPress 草稿编辑链接
 */
function getDraftEditLink(postId: number): string {
  return `${WP_CONFIG.baseUrl}/wp-admin/post.php?post=${postId}&action=edit`;
}

// 类型定义
interface Topic {
  title: string;
  description: string;
  keywords: string[];
}

// 导出
export default {
  shouldTrigger,
  handle,
};
