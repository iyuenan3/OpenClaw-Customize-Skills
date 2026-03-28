/**
 * wordpress-blog-writer
 * WordPress 博客写作助手 Skill v2.0
 * 
 * 功能：从构思到发布完整的博客文章（HTML 格式）
 * 触发：写博客、写文章、写日志、写日记、/publish-blog
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { HTMLHint } from 'htmlhint';

const execAsync = promisify(exec);

/**
 * Skill 配置（从 openclaw.json 读取）
 */
interface SkillConfig {
  blogDir: string;
  postsDir: string;
  wordpress: {
    baseUrl: string;
    username: string;
    appPassword: string;
  };
}

const DEFAULT_CONFIG: SkillConfig = {
  blogDir: '/home/admin/maxwell-blog',
  postsDir: '/home/admin/maxwell-blog/posts',
  wordpress: {
    baseUrl: 'http://47.84.100.47',
    username: 'maxwell',
    appPassword: '', // 从 openclaw.json 读取
  },
};

// 触发关键词
const TRIGGER_KEYWORDS = ['写博客', '写文章', '写日志', '写日记', '/publish-blog', '发布'];

// 当前处理状态
interface ArticleState {
  title: string;
  html?: string;
  filePath?: string;
  postId?: number;
  stage: 'idle' | 'outline' | 'html' | 'draft' | 'published';
  category?: string;
  tags?: string[];
}

let currentState: ArticleState = { title: '', stage: 'idle' };

/**
 * 检查消息是否触发 Skill
 */
export function shouldTrigger(message: string): boolean {
  // 检查发布命令
  if (message.startsWith('/publish')) {
    return true;
  }
  // 检查常规触发词
  return TRIGGER_KEYWORDS.some(keyword => message.includes(keyword));
}

/**
 * 主处理函数
 */
export async function handle(message: string, context: any): Promise<string> {
  // 从上下文读取配置
  const config: SkillConfig = {
    ...DEFAULT_CONFIG,
    wordpress: {
      ...DEFAULT_CONFIG.wordpress,
      appPassword: context?.wordpress?.appPassword || 'UjooevUHrkoVVTkKfh5kqi82',
    },
  };

  // 处理发布命令
  if (message.startsWith('/publish')) {
    const parts = message.split(' ');
    if (parts.length > 1 && parts[1]) {
      const postId = parseInt(parts[1]);
      if (!isNaN(postId)) {
        return await publishPost(postId, config);
      }
    }
    // 没有指定 ID，询问用户
    return '请告诉我要发布哪篇文章，可以提供 WordPress 文章 ID（如 `/publish 441`），或说"发布最新的文章"。';
  }
  
  // 处理"发布"命令
  if (message === '发布') {
    if (currentState.postId) {
      return await publishPost(currentState.postId, config);
    }
    return '❌ 没有找到待发布的文章。请先创建文章。';
  }
  
  // 处理常规写作流程
  if (!shouldTrigger(message)) {
    return '';
  }
  
  // 检查是否是审核确认
  if (message.includes('审核通过') || message.includes('确认')) {
    return await handleReviewConfirm(config);
  }
  
  // 检查是否是修改请求
  if (message.includes('修改')) {
    return await handleModificationRequest(message, config);
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
  return '今天的工作内容摘要';
}

/**
 * 推荐写作主题
 */
function recommendTopics(summary: string): Topic[] {
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
export function createOutline(topic: string): string {
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
export async function generateHtml(title: string, outline: string, context: any): Promise<string> {
  // AI 直接生成 HTML 格式内容
  return '<h1>标题</h1><p>内容...</p>';
}

/**
 * HTML 后处理（修正格式错误）
 */
export function postProcessHtml(html: string): string {
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
export async function validateHtml(html: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const messages = HTMLHint.verify(html, {
      'tagname-lowercase': true,
      'attr-lowercase': true,
      'attr-value-double-quotes': true,
      'doctype-first': true,
      'tag-pair': true,
      'spec-char-escape': true,
      'id-unique': true,
      'src-not-empty': true,
      'attr-no-duplication': true,
      'title-require': true,
    });
    
    if (messages.length > 0) {
      const errors = messages.map((m: any) => `${m.message} (line ${m.line}, col ${m.col})`);
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  } catch (err: any) {
    return { valid: false, errors: [err.message] };
  }
}

/**
 * 翻译标题为英文（AI 翻译，失败用拼音）
 */
export async function translateTitleToEnglish(chineseTitle: string): Promise<string> {
  // 简单实现：保留英文和数字，中文用拼音替代
  // 实际应该调用 AI 模型翻译
  let result = chineseTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-');
  
  // 简单拼音映射（实际应该使用 pypinyin）
  const pinyinMap: Record<string, string> = {
    '我': 'Wo', '是': 'Shi', '的': 'De', '一': 'Yi', '个': 'Ge',
    '爱': 'Ai', '你': 'Ni', '好': 'Hao', '中': 'Zhong', '国': 'Guo',
  };
  
  for (const [cn, py] of Object.entries(pinyinMap)) {
    result = result.replace(new RegExp(cn, 'g'), py);
  }
  
  // 清理多余的分隔符
  result = result.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  return result || 'Untitled';
}

/**
 * 保存 HTML 文件
 */
export async function saveHtml(title: string, html: string, frontMatter: any): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // 翻译标题
  const englishTitle = await translateTitleToEnglish(title);
  
  // 检查文件是否已存在，添加序号
  let filename = `${year}-${month}-${englishTitle}.html`;
  const dir = path.join(DEFAULT_CONFIG.postsDir, year, month);
  let filePath = path.join(dir, filename);
  
  let counter = 1;
  while (fs.existsSync(filePath)) {
    filename = `${year}-${month}-${englishTitle}-${counter}.html`;
    filePath = path.join(dir, filename);
    counter++;
  }
  
  // 创建目录
  fs.mkdirSync(dir, { recursive: true });
  
  // 构建 Front Matter JSON
  const frontMatterJson = JSON.stringify({
    title: title,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    author: frontMatter.author || 'Agent-Max & Maxwell Li',
    categories: frontMatter.categories || [],
    tags: frontMatter.tags || [],
    status: 'draft',
  }, null, 2);
  
  // 构建完整 HTML 文档
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
export async function commitToGithub(message: string): Promise<void> {
  await execAsync(`cd ${DEFAULT_CONFIG.blogDir} && git add . && git commit -m "${message}" && git push`);
}

/**
 * 获取 WordPress 分类 ID
 */
export async function getCategoryId(categoryName: string, config: SkillConfig): Promise<number> {
  const auth = Buffer.from(`${config.wordpress.username}:${config.wordpress.appPassword}`).toString('base64');
  
  // 查询现有分类
  const response = await fetch(`${config.wordpress.baseUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(categoryName)}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  const categories = await response.json() as any[];
  
  if (categories.length > 0) {
    return categories[0].id;
  }
  
  throw new Error(`分类 "${categoryName}" 不存在，请先在 WordPress 中创建`);
}

/**
 * 获取或创建标签 ID
 */
export async function getOrCreateTagId(tagName: string, config: SkillConfig): Promise<number> {
  const auth = Buffer.from(`${config.wordpress.username}:${config.wordpress.appPassword}`).toString('base64');
  
  // 查询现有标签
  const response = await fetch(`${config.wordpress.baseUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  const tags = await response.json() as any[];
  
  if (tags.length > 0) {
    return tags[0].id;
  }
  
  // 创建新标签
  const createResponse = await fetch(`${config.wordpress.baseUrl}/wp-json/wp/v2/tags`, {
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
export async function publishToWordPressDraft(
  title: string,
  html: string,
  categoryName: string,
  tags: string[],
  config: SkillConfig
): Promise<number> {
  const auth = Buffer.from(`${config.wordpress.username}:${config.wordpress.appPassword}`).toString('base64');
  
  // 获取分类 ID
  const categoryId = await getCategoryId(categoryName, config);
  
  // 获取标签 IDs
  const tagIds = await Promise.all(tags.map(tag => getOrCreateTagId(tag, config)));
  
  // 发布到草稿箱
  const response = await fetch(`${config.wordpress.baseUrl}/wp-json/wp/v2/posts`, {
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
export async function publishWordPressPost(postId: number, config: SkillConfig): Promise<void> {
  const auth = Buffer.from(`${config.wordpress.username}:${config.wordpress.appPassword}`).toString('base64');
  
  const response = await fetch(`${config.wordpress.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
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
 * 处理审核确认
 */
async function handleReviewConfirm(config: SkillConfig): Promise<string> {
  if (currentState.stage !== 'html' || !currentState.filePath) {
    return '❌ 没有待审核的文章。';
  }
  
  try {
    // 读取 HTML 文件
    const html = fs.readFileSync(currentState.filePath, 'utf-8');
    
    // 验证 HTML
    const validation = await validateHtml(html);
    if (!validation.valid) {
      return `❌ HTML 验证失败：\n${validation.errors.join('\n')}`;
    }
    
    // 提交到 GitHub
    await commitToGithub(`feat: 新增文章 - ${currentState.title}`);
    
    // 发布到草稿箱
    const postId = await publishToWordPressDraft(
      currentState.title,
      html,
      currentState.category || '技术笔记',
      currentState.tags || [],
      config
    );
    
    currentState.postId = postId;
    currentState.stage = 'draft';
    
    return `✅ 已提交 GitHub\n✅ 已发布到 WordPress 草稿箱\n\n📝 编辑链接：${config.wordpress.baseUrl}/wp-admin/post.php?post=${postId}&action=edit\n\n请预览草稿，确认无误后说"发布"，我正式发布。`;
  } catch (err: any) {
    return `❌ 操作失败：${err.message}`;
  }
}

/**
 * 处理修改请求
 */
async function handleModificationRequest(message: string, config: SkillConfig): Promise<string> {
  if (!currentState.filePath || !fs.existsSync(currentState.filePath)) {
    return '❌ 没有找到可修改的文章。';
  }
  
  // 提供修改选项
  return `我理解您想修改文章。请告诉我具体想怎么修改，或者：

1. **直接编辑文件**：编辑 ${currentState.filePath}，然后告诉我"已修改"
2. **描述修改内容**：告诉我具体修改哪部分，我来修改
3. **重新生成**：如果需要大改，我可以重新生成整篇文章

您想选择哪种方式？`;
}

/**
 * 正式发布文章
 */
export async function publishPost(postId: number, config: SkillConfig): Promise<string> {
  try {
    // 重试 5 次
    for (let i = 0; i < 5; i++) {
      try {
        await publishWordPressPost(postId, config);
        
        // 更新本地 HTML 文件注释
        if (currentState.filePath && fs.existsSync(currentState.filePath)) {
          let content = fs.readFileSync(currentState.filePath, 'utf-8');
          content = content.replace(/"status": "draft"/, '"status": "publish"');
          fs.writeFileSync(currentState.filePath, content, 'utf-8');
        }
        
        currentState.stage = 'published';
        
        const postUrl = `${config.wordpress.baseUrl}/?p=${postId}`;
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
  publishPost,
  postProcessHtml,
  validateHtml,
  translateTitleToEnglish,
};
