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
 */
const SKILL_CONFIG = {
  blogDir: '/home/admin/maxwell-blog',
  postsDir: '/home/admin/maxwell-blog/posts',
};

// WordPress API 配置（从 openclaw.json 读取）
const WP_CONFIG = {
  baseUrl: 'http://47.84.100.47',
  username: 'maxwell',
  appPassword: 'UjooevUHrkoVVTkKfh5kqi82',
};

// 触发关键词
const TRIGGER_KEYWORDS = ['写博客', '写文章', '写日志', '写日记', '/blog', '/post'];

// 当前处理状态
let currentState: {
  articleTitle?: string;
  articleHtml?: string;
  filePath?: string;
  postId?: number;
  stage: 'idle' | 'outline' | 'html' | 'draft' | 'published';
} = { stage: 'idle' };

/**
 * 检查消息是否触发 Skill
 */
export function shouldTrigger(message: string): boolean {
  // 检查发布命令
  if (message.startsWith('/publish') || message === '发布') {
    return true;
  }
  // 检查同步命令
  if (message.startsWith('/sync') || message.includes('同步')) {
    return true;
  }
  // 检查常规触发词
  return TRIGGER_KEYWORDS.some(keyword => message.includes(keyword));
}

/**
 * 主处理函数
 */
export async function handle(message: string, context: any): Promise<string> {
  // 处理发布命令
  if (message.startsWith('/publish')) {
    const parts = message.split(' ');
    const postId = parts[1] ? parseInt(parts[1]) : currentState.postId;
    if (!postId) {
      return '❌ 请指定文章 ID，如 `/publish 441`，或先创建文章。';
    }
    return await publishPost(postId);
  }
  
  if (message === '发布' && currentState.postId) {
    return await publishPost(currentState.postId);
  }
  
  // 处理同步命令
  if (message.startsWith('/sync') || message.includes('同步')) {
    return await syncFromWordPress();
  }
  
  // 处理常规写作流程
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
  return '今天的工作内容摘要';
}

/**
 * 推荐写作主题
 */
function recommendTopics(summary: string): Topic[] {
  // 基于对话内容分析推荐主题
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
 * 生成 HTML 文章
 */
async function generateHtml(title: string, outline: string, context: any): Promise<string> {
  // AI 直接生成 HTML 格式内容
  // 这里需要调用 AI 模型生成 HTML
  return '<h1>标题</h1><p>内容...</p>';
}

/**
 * HTML 后处理（修正格式错误）
 */
function postProcessHtml(html: string): string {
  // 移除包裹标题的 p 标签
  html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
  // 移除包裹列表的 p 标签
  html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
  html = html.replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1');
  // 移除包裹引用的 p 标签
  html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
  // 移除包裹表格的 p 标签
  html = html.replace(/<p>(<table>.*?<\/table>)<\/p>/gs, '$1');
  // 移除包裹代码块的 p 标签
  html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/gs, '$1');
  return html;
}

/**
 * HTML 验证
 */
async function validateHtml(html: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const { exec } = await import('child_process');
    const execAsync = promisify(exec);
    
    // 写入临时文件
    const tempFile = '/tmp/validate.html';
    fs.writeFileSync(tempFile, html, 'utf-8');
    
    // 运行 htmlhint
    const result = await execAsync(`htmlhint ${tempFile} 2>&1`);
    
    // 清理
    fs.unlinkSync(tempFile);
    
    if (result.stderr || result.stdout) {
      return { valid: false, errors: [result.stderr || result.stdout] };
    }
    
    return { valid: true, errors: [] };
  } catch (err: any) {
    return { valid: false, errors: [err.message] };
  }
}

/**
 * 翻译标题为英文
 */
async function translateTitleToEnglish(chineseTitle: string): Promise<string> {
  // AI 直接翻译
  // 如果失败，使用拼音
  return chineseTitle.replace(/[^a-zA-Z0-9]/g, '-');
}

/**
 * 保存 HTML 文件
 */
async function saveHtml(title: string, html: string, frontMatter: any): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // 翻译标题
  const englishTitle = await translateTitleToEnglish(title);
  
  // 检查文件是否已存在，添加序号
  let filename = `${year}-${month}-${day}-${englishTitle}.html`;
  const dir = path.join(SKILL_CONFIG.postsDir, year, month);
  let filePath = path.join(dir, filename);
  
  let counter = 1;
  while (fs.existsSync(filePath)) {
    filename = `${year}-${month}-${day}-${englishTitle}-${counter}.html`;
    filePath = path.join(dir, filename);
    counter++;
  }
  
  // 创建目录
  fs.mkdirSync(dir, { recursive: true });
  
  // 构建完整 HTML 文档
  const frontMatterJson = JSON.stringify({
    title: title,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    author: frontMatter.author || 'Agent-Max & Maxwell Li',
    categories: frontMatter.categories || [],
    tags: frontMatter.tags || [],
    status: 'draft',
  }, null, 2);
  
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
</head>
<body>
<!--
${frontMatterJson}
-->
${html}
</body>
</html>`;
  
  // 保存文件
  fs.writeFileSync(filePath, fullHtml, 'utf-8');
  
  return filePath;
}

/**
 * 提交到 GitHub
 */
async function commitToGithub(message: string): Promise<void> {
  await execAsync(`cd ${SKILL_CONFIG.blogDir} && git add . && git commit -m "${message}" && git push`);
}

/**
 * 获取 WordPress 分类 ID
 */
async function getCategoryId(categoryName: string): Promise<number> {
  const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
  
  // 查询现有分类
  const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(categoryName)}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  const categories = await response.json() as any[];
  
  if (categories.length > 0) {
    return categories[0].id;
  }
  
  // 创建新分类
  const createResponse = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: categoryName,
    }),
  });
  
  const category = await createResponse.json() as any;
  return category.id;
}

/**
 * 获取或创建标签 ID
 */
async function getOrCreateTagId(tagName: string): Promise<number> {
  const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
  
  // 查询现有标签
  const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  const tags = await response.json() as any[];
  
  if (tags.length > 0) {
    return tags[0].id;
  }
  
  // 创建新标签
  const createResponse = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/tags`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: tagName,
    }),
  });
  
  const tag = await createResponse.json() as any;
  return tag.id;
}

/**
 * 发布到 WordPress 草稿箱
 */
async function publishToWordPressDraft(
  title: string,
  html: string,
  categoryName: string,
  tags: string[]
): Promise<number> {
  const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
  
  // 获取分类 ID
  const categoryId = await getCategoryId(categoryName);
  
  // 获取标签 IDs
  const tagIds = await Promise.all(tags.map(tag => getOrCreateTagId(tag)));
  
  // 发布到草稿箱
  const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      content: html,
      status: 'draft',
      categories: [categoryId],
      tags: tagIds,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WordPress API 错误：${response.status} - ${error}`);
  }
  
  const post = await response.json() as any;
  return post.id;
}

/**
 * 正式发布 WordPress 文章
 */
async function publishWordPressPost(postId: number): Promise<void> {
  const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
  
  const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'publish',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WordPress API 错误：${response.status} - ${error}`);
  }
}

/**
 * 从 WordPress 同步修改
 */
async function syncFromWordPress(): Promise<string> {
  if (!currentState.postId || !currentState.filePath) {
    return '❌ 没有需要同步的文章。请先创建或发布文章。';
  }
  
  const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
  
  // 获取 WordPress 文章内容
  const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/posts/${currentState.postId}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  if (!response.ok) {
    return `❌ 获取文章内容失败：${response.status}`;
  }
  
  const post = await response.json() as any;
  
  // 读取本地文件
  let localContent = fs.readFileSync(currentState.filePath, 'utf-8');
  
  // 用 WordPress 内容更新本地文件
  const updatedContent = localContent.replace(
    /<body>\n<!--\n[\s\S]*?\n-->\n([\s\S]*?)\n<\/body>/s,
    `<body>\n<!--\n${JSON.stringify({
      title: post.title.rendered,
      date: post.date,
      author: 'Agent-Max & Maxwell Li',
      categories: post.categories,
      tags: post.tags,
      status: post.status,
    }, null, 2)}\n-->\n${post.content.raw}\n</body>`
  );
  
  fs.writeFileSync(currentState.filePath, updatedContent, 'utf-8');
  
  // 提交到 Git
  await commitToGithub(`feat: 同步 WordPress 修改 - ${post.title.rendered}`);
  
  return `✅ 已同步文章 "${post.title.rendered}" 的修改到本地文件。`;
}

/**
 * 正式发布文章
 */
async function publishPost(postId: number): Promise<string> {
  try {
    // 重试 5 次
    for (let i = 0; i < 5; i++) {
      try {
        await publishWordPressPost(postId);
        
        // 更新本地 HTML 文件注释
        if (currentState.filePath && fs.existsSync(currentState.filePath)) {
          let content = fs.readFileSync(currentState.filePath, 'utf-8');
          content = content.replace(/"status": "draft"/, '"status": "publish"');
          fs.writeFileSync(currentState.filePath, content, 'utf-8');
        }
        
        currentState.stage = 'published';
        
        const postUrl = `${WP_CONFIG.baseUrl}/?p=${postId}`;
        return `✅ 文章已正式发布！\n\n📰 文章链接：${postUrl}`;
      } catch (err: any) {
        if (i === 4) {
          throw err;
        }
        // 重试
      }
    }
    
    return '✅ 文章已正式发布！';
  } catch (err: any) {
    return `❌ 发布失败：${err.message}`;
  }
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
  createOutline,
  generateHtml,
  saveHtml,
  commitToGithub,
  publishToWordPressDraft,
  publishWordPressPost,
  syncFromWordPress,
  postProcessHtml,
  validateHtml,
};
