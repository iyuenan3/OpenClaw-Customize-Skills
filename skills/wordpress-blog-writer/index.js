"use strict";
/**
 * wordpress-blog-writer
 * WordPress 博客写作助手 Skill
 *
 * 功能：从构思到发布完整的博客文章
 * 触发：写博客、写文章、写日志、写日记等
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldTrigger = shouldTrigger;
exports.handle = handle;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const md = new markdown_it_1.default({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
});
/**
 * Skill 配置
 */
const SKILL_CONFIG = {
    blogDir: process.env.BLOG_DIR || '/home/admin/maxwell-blog',
    githubRepo: process.env.GITHUB_REPO || 'git@github.com:iyuenan3/maxwell-blog.git',
    author: process.env.AUTHOR_NAME || 'Agent-Max & Maxwell Li',
    categories: {
        '技术笔记': 44,
        'AI 实验': 43,
        '生活记录': 40,
        '归档': 39,
    },
};
const BLOG_DIR = SKILL_CONFIG.blogDir;
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
// WordPress API 配置
const WP_CONFIG = {
    baseUrl: 'http://47.84.100.47',
    username: 'Agent-Max',
    appPassword: 'xSwu pC2B 6KxX wVcV ro1D Fhsd',
};
const TRIGGER_KEYWORDS = ['写博客', '写文章', '写日志', '写日记', '/blog', '/post'];
function shouldTrigger(message) {
    return TRIGGER_KEYWORDS.some(keyword => message.includes(keyword));
}
async function handle(message, context) {
    if (!shouldTrigger(message)) {
        return '';
    }
    const todaySummary = await getTodaySummary(context);
    const topics = recommendTopics(todaySummary);
    return formatTopicRecommendation(topics);
}
async function getTodaySummary(context) {
    return '今天的工作内容摘要';
}
function recommendTopics(summary) {
    return [
        { title: '主题 1', description: '简短说明', keywords: ['关键词 1', '关键词 2'] },
    ];
}
function formatTopicRecommendation(topics) {
    let output = '根据今天的对话内容，我推荐以下几个主题：\n\n';
    topics.forEach((topic, index) => {
        output += `${index + 1}. **${topic.title}** - ${topic.description}\n`;
    });
    output += '\n你想写哪个主题？';
    return output;
}
function createOutline(topic) {
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
 * Markdown 转 HTML（WordPress 兼容格式）
 */
function markdownToHtml(markdown) {
    // 先解析 Markdown
    let html = md.render(markdown);
    // 后处理：确保格式符合 WordPress 要求
    // 1. 移除包裹段落的标题
    html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
    // 2. 确保列表格式正确
    html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
    html = html.replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1');
    // 3. 确保引用格式正确
    html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
    // 4. 确保表格格式正确（不被 p 包裹）
    html = html.replace(/<p>(<table>.*?<\/table>)<\/p>/gs, '$1');
    return html;
}
function createMarkdown(title, content, category, tags, author) {
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
async function saveMarkdown(filename, content) {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dir = path.join(POSTS_DIR, year, month);
    await fs.promises.mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    await fs.promises.writeFile(filepath, content, 'utf-8');
    return filepath;
}
async function commitToGithub(message) {
    await execAsync(`cd ${BLOG_DIR} && git add . && git commit -m "${message}" && git push`);
}
/**
 * 发布到 WordPress 草稿箱（使用 REST API）
 */
async function publishToWordPressDraft(title, content, category, tags) {
    const auth = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.appPassword}`).toString('base64');
    // 将 Markdown 转换为 HTML
    const htmlContent = markdownToHtml(content);
    // 获取分类 ID
    const categoryId = SKILL_CONFIG.categories[category] || 1;
    const response = await fetch(`${WP_CONFIG.baseUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            content: htmlContent,
            status: 'draft',
            categories: [categoryId],
            tags: tags,
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`WordPress API 错误：${response.status} - ${error}`);
    }
    const post = await response.json();
    return post.id;
}
/**
 * 正式发布 WordPress 文章
 */
async function publishWordPressPost(postId) {
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
function getDraftEditLink(postId) {
    return `${WP_CONFIG.baseUrl}/wp-admin/post.php?post=${postId}&action=edit`;
}
exports.default = {
    shouldTrigger,
    handle,
    createOutline,
    createMarkdown,
    saveMarkdown,
    commitToGithub,
    publishToWordPressDraft,
    publishWordPressPost,
    getDraftEditLink,
    markdownToHtml,
};
//# sourceMappingURL=index.js.map