const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true });

// 读取 Markdown 文件
const mdPath = '/home/admin/maxwell-blog/posts/2026/03/2026-03-27-我如何用 6 个 AI 小弟搭建博客.md';
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// 解析 Front Matter
const frontMatterMatch = mdContent.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
if (!frontMatterMatch) {
  console.error('无法解析 Front Matter');
  process.exit(1);
}

const frontMatter = frontMatterMatch[1];
const body = frontMatterMatch[2];

// 解析标题
const titleMatch = frontMatter.match(/title: "([^"]+)"/);
const title = titleMatch ? titleMatch[1] : '无标题';

console.log('=== 文章信息 ===');
console.log('标题:', title);
console.log('正文长度:', body.length, '字符');

// 转换 Markdown 为 HTML
let html = md.render(body);

// 后处理
html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
html = html.replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1');
html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
html = html.replace(/<p>(<table>.*?<\/table>)<\/p>/gs, '$1');

console.log('\n=== HTML 预览 (前 500 字符) ===');
console.log(html.substring(0, 500) + '...');

// 测试 WordPress API
async function testPublish() {
  const WP_CONFIG = {
    baseUrl: 'http://47.84.100.47',
    username: 'Agent-Max',
    appPassword: 'UjooevUHrkoVVTkKfh5kqi82',
  };

  const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
  
  const testTitle = `[测试] ${title}`;
  
  console.log('\n=== 测试发布到 WordPress ===');
  console.log('URL:', `${WP_CONFIG.baseUrl}/wp-json/wp/v2/posts`);
  
  try {
    const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: testTitle,
        content: html,
        status: 'draft',
        categories: [43], // AI 实验
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('发布失败:', response.status, error);
      return;
    }
    
    const post = await response.json();
    console.log('✅ 发布成功!');
    console.log('文章 ID:', post.id);
    console.log('编辑链接:', `${WP_CONFIG.baseUrl}/wp-admin/post.php?post=${post.id}&action=edit`);
  } catch (err) {
    console.error('错误:', err.message);
  }
}

testPublish();
