# wordpress-blog-writer

WordPress 博客写作助手 Skill - 帮你从构思到发布完整的博客文章。

---

## 📋 功能说明

本 Skill 提供完整的博客写作流程：

1. **主题推荐** - 基于当天对话内容推荐 2-5 个写作主题
2. **大纲编写** - 编写包含引言、主体、总结的文章大纲
3. **文章撰写** - 撰写完整的 Markdown 格式文章
4. **GitHub 备份** - 自动提交到 GitHub 仓库备份
5. **WordPress 发布** - 发布到 WordPress 草稿箱并正式发布

---

## 🎯 触发方式

以下任一指令均可触发：

- "写博客"
- "写文章"
- "写日志"
- "写日记"
- "/blog"
- "/post"

---

## 📝 工作流程

```
1. 用户触发 → AI 推荐 2-5 个主题（基于当天对话 + 简短说明）
2. 用户选择主题 → AI 编写大纲（引言 + 主体 + 总结，一级 + 二级标题）
3. 大纲审核通过 → AI 撰写 Markdown 全文（含 Front Matter）
4. Markdown 审核通过 → 保存到 /home/admin/maxwell-blog/posts/YYYY/MM/YYYY-MM-DD-标题.md
5. 提交 GitHub（feat: 新增文章 - [标题]）
6. 发布 WordPress 草稿箱（自动分类 + 标签空格分隔）
7. 发送草稿编辑链接给用户审核
8. 用户说"发布" → 正式发布
```

---

## 📄 Markdown 格式

```yaml
---
title: "文章标题"
date: 2026-03-28 14:00
author: Agent-Max & Maxwell Li
categories: [技术笔记]
tags: [OpenClaw, AI, 知识图谱]
---

文章正文...
```

### Front Matter 说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 文章标题 | `"告别跨会话失忆"` |
| `date` | 发布日期时间（精确到分钟） | `2026-03-28 14:00` |
| `author` | 作者（可配置） | `Your Name` |
| `categories` | 分类（数组，使用分类名称） | `[技术笔记]` |
| `tags` | 标签（数组） | `[OpenClaw, AI, 知识图谱]` |

### 自定义作者名称

在 `~/.openclaw/openclaw.json` 中配置：

```json
{
  "skills": {
    "entries": {
      "wordpress-blog-writer": {
        "config": {
          "author": "Your Name & Your AI Assistant"
        }
      }
    }
  }
}
```

或使用环境变量：

```bash
export AUTHOR_NAME="Your Name & Your AI Assistant"
```

---

## 🎨 WordPress 排版规范

### 代码块格式

**使用 HTML 格式：**

```html
<pre><code class="language-bash">
# 安装依赖
npm install -g package-name
</code></pre>
```

**支持的语言标识：**
- `language-bash` - Shell 命令
- `language-yaml` - YAML 配置
- `language-json` - JSON 数据
- `language-javascript` - JavaScript 代码
- `language-python` - Python 代码
- `language-markdown` - Markdown 语法

### 粗体强调

**使用 `<strong>` 标签：**

```html
<strong>重要内容</strong>需要强调
```

**示例：**
```html
<p><strong>问题：</strong>如何让 6 个 AI 小弟高效协作？</p>
<p><strong>答案：</strong>使用 YAML 工作流编排。</p>
```

### 引用格式

**使用 `<blockquote>` 标签：**

```html
<blockquote>
<p><strong>摘要</strong>：这是文章摘要内容。</p>
</blockquote>
```

**对话引用：**
```html
<blockquote>
<p>"这个功能今天能完成吗？"</p>
<p>"这个 bug 为什么还没修好？"</p>
</blockquote>
```

### 表格格式

**使用标准 HTML 表格：**

```html
<table>
<thead>
<tr><th>阶段</th><th>门禁标准</th><th>理由</th></tr>
</thead>
<tbody>
<tr><td>设计</td><td>品牌一致性评分 ≥ 90 分</td><td>保证设计符合品牌规范</td></tr>
<tr><td>审查</td><td>阻塞问题数量 = 0</td><td>保证代码无严重问题</td></tr>
</tbody>
</table>
```

### 列表格式

**无序列表：**

```html
<ul>
<li>UI 设计师 – 负责 Design Token 设计</li>
<li>品牌守护者 – 负责品牌一致性审核</li>
<li>前端开发者 – 负责主题代码实现</li>
</ul>
```

**有序列表：**

```html
<ol>
<li>设计 – 先明确视觉规范和品牌标准</li>
<li>开发 – 根据设计规范实现代码</li>
<li>审查 – 确保代码质量和规范</li>
<li>文档 – 记录使用说明和最佳实践</li>
</ol>
```

### 标题规范

- **主标题不超过 12 个字** - 简洁明了
- **可以写副标题** - 补充说明

**示例：**
- 主标题：YAML 工作流编排 6 个 AI 智能体
- 副标题：从设计到发布的完整流程

### 对话称呼规范

- **用 "Maxwell" 和 "Agent-Max"** - 不要用 "B" 和 "A"
- 文章中的对话要清晰指明是谁说的

---

## 📁 目录结构

```
maxwell-blog/
├── posts/
│   ├── 2026/
│   │   └── 03/          ← 文章保存位置
│   └── archive/
└── [WordPress 主题文件]
```

---

## 🏷️ 分类体系

| 分类名称 | 说明 |
|----------|------|
| 技术笔记 | 技术学习、实践心得 |
| AI 实验 | AI 协作开发探索 |
| 生活记录 | 宠物、日常 |
| 归档 | 旧文章归档 |

---

## ⚠️ 错误处理

### WordPress 发布失败
- 文章保持在草稿箱
- 告知用户错误信息
- 等待用户指示

### GitHub 推送失败
- 本地文件已保存
- 告知用户错误信息
- 暂停流程

### 其他错误
- 立即告知用户
- 不自动重试
- 等待用户指示

---

## 🔧 配置要求

### WordPress 配置

在 `~/.openclaw/openclaw.json` 中配置：

```json
{
  "skills": {
    "entries": {
      "wordpress-blog-writer": {
        "enabled": true,
        "config": {
          "baseUrl": "http://***",
          "username": "***",
          "appPassword": "**** **** **** **** ****"
        }
      }
    }
  }
}
```

### GitHub 配置

确保已配置 SSH Key：

```bash
ssh -T git@github.com
```

---

## 📋 使用示例

### 示例 1：写博客

**用户**: 写个博客

**AI**: 
```
根据今天的对话内容，我推荐以下几个主题：

1. **graph-memory 安装实战** - 记录安装 graph-memory 的完整过程和踩坑经历
2. **AI 如何记住经验** - 探讨知识图谱在 AI 记忆系统中的应用
3. **OpenClaw 插件开发指南** - 分享开发 OpenClaw 插件的经验

你想写哪个主题？
```

### 示例 2：大纲审核

**AI**:
```
文章大纲：

## 一、引言
- 问题引入：为什么 100 万 tokens 不够用
- 文章目的：介绍 graph-memory 解决方案

## 二、什么是 graph-memory
- 核心概念
- 工作原理
- 核心优势

## 三、安装实战
- 环境准备
- 配置步骤
- 验证方法

## 四、踩坑记录
- pnpm 报错处理
- dimensions 配置问题
- baseUrl vs baseURL

## 五、总结
- 核心收获
- 适用场景

请审核大纲，通过的话我开始写正文。
```

### 示例 3：发布流程

**AI**: 
```
✅ 文章已保存到：posts/2026/03/2026-03-28-告别跨会话失忆.md
✅ 已提交 GitHub：feat: 新增文章 - 告别跨会话失忆
✅ 已发布到 WordPress 草稿箱

草稿编辑链接：[WordPress 后台编辑链接]

请预览草稿，确认无误后说"发布"，我正式发布。
```

---

## 📖 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-03-28 | 初始版本 |

---

## 📄 License

MIT License
