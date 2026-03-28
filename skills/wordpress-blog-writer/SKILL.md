# wordpress-blog-writer

WordPress 博客写作助手 Skill - 帮你从构思到发布完整的博客文章。

---

## 📋 功能说明

本 Skill 提供完整的博客写作流程：

1. **主题推荐** - 基于当天对话内容推荐 2-5 个写作主题
2. **大纲编写** - 编写包含引言、主体、总结的文章大纲
3. **HTML 撰写** - 撰写符合 WordPress REST API 要求的 HTML 格式文章
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
1. 用户触发 → AI 分析当天对话内容，推荐 2-5 个主题（含简短说明）
2. 用户选择主题 → AI 编写大纲（一级 + 二级标题，含各部分说明）
3. 大纲审核通过 → AI 撰写 HTML 格式全文（符合 WordPress REST API 要求）
4. HTML 文件保存到 /home/admin/maxwell-blog/posts/YYYY/MM/YYYY-MM-DD-英文标题.html
5. 用户审核 HTML → 可口头确认/编辑文件/提出修改意见
6. 审核通过 → 提交 GitHub（feat: 新增文章 - [中文标题]）
7. 使用 REST API 发布到 WordPress 草稿箱
8. 发送草稿编辑链接给用户
9. 用户说"发布"或"/publish [ID]" → 正式发布
```

---

## 📄 HTML 格式要求

### 完整文档结构

```html
<!DOCTYPE html>
<html>
<head>
<title>文章标题</title>
</head>
<body>
<!--
{
  "title": "文章标题",
  "date": "2026-03-29 00:00",
  "author": "Agent-Max & Maxwell Li",
  "categories": ["技术笔记"],
  "tags": ["AI", "OpenClaw"],
  "status": "draft"
}
-->
<h1>文章标题</h1>
<p>正文内容...</p>
</body>
</html>
```

### Front Matter（HTML 注释中的 JSON）

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 文章标题 | `"告别跨会话失忆"` |
| `date` | 发布日期时间 | `"2026-03-29 00:00"` |
| `author` | 作者 | `"Agent-Max & Maxwell Li"` |
| `categories` | 分类数组 | `["技术笔记"]` |
| `tags` | 标签数组 | `["AI", "OpenClaw"]` |
| `status` | 状态 | `"draft"` 或 `"publish"` |

### HTML 内容规范

**✅ 正确的 HTML 格式：**

```html
<h1>文章标题</h1>
<blockquote>
  <p><strong>摘要</strong>：这是摘要内容。</p>
</blockquote>
<hr>
<h2>一、引言</h2>
<p>这是正文内容。</p>
<ul>
  <li>列表项 1</li>
  <li>列表项 2</li>
</ul>
<pre><code class="language-bash">echo hello</code></pre>
<table>
  <thead>
    <tr><th>列 1</th><th>列 2</th></tr>
  </thead>
  <tbody>
    <tr><td>A</td><td>B</td></tr>
  </tbody>
</table>
```

**❌ 错误的 HTML 格式：**

```html
<!-- 标题被 p 包裹 -->
<p><h1>文章标题</h1></p>

<!-- 列表被 p 包裹 -->
<p><ul><li>列表项</li></ul></p>

<!-- 引用被 p 包裹 -->
<p><blockquote>引用内容</blockquote></p>

<!-- 表格被 p 包裹 -->
<p><table>...</table></p>

<!-- 代码块被 p 包裹 -->
<p><pre><code>code</code></pre></p>
```

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

---

## 🏷️ 分类体系

| 分类名称 | 说明 | WordPress ID |
|----------|------|-------------|
| 技术笔记 | 技术学习、实践心得 | 44 |
| AI 实验 | AI 协作开发探索 | 43 |
| 生活记录 | 宠物、日常 | 40 |
| 归档 | 旧文章归档 | 39 |

分类 ID 从 WordPress API 动态查询，自动创建不存在的分类。

---

## 🎮 命令

### 发布文章
```
/publish [文章 ID]
```
- 如果不指定 ID，发布最新创建的文章
- 将草稿箱文章状态改为 `publish`

### 同步 WordPress 修改
```
/sync
```
- 将 WordPress 上的文章修改同步回本地 HTML 文件
- 需要用户主动告知"我修改了文章内容，请同步"

---

## ⚠️ 错误处理

### HTML 验证失败
- 使用 `htmlhint` 验证 HTML 格式
- 验证失败 → AI 重新生成
- 重试 5 次后仍失败 → 停止并告知用户

### REST API 发布失败
- 自动重试 5 次
- 保留已提交的 Git 记录
- 在当前会话中告知用户错误信息

### Git 提交失败
- 停止整个流程
- 告知用户错误信息

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
          "baseUrl": "http://47.84.100.47",
          "username": "maxwell",
          "appPassword": "**** **** **** **** **** ****"
        }
      }
    }
  }
}
```

---

## 📁 目录结构

```
maxwell-blog/
├── posts/
│   ├── 2026/
│   │   └── 03/
│   │       ├── 2026-03-29-I-Am-Agent-Max.html
│   │       └── 2026-03-29-I-Am-Agent-Max.md  (原始 Markdown，可选)
│   └── archive/
└── [WordPress 主题文件]
```

---

## 📖 使用示例

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

### 示例 3：HTML 审核

**AI**: 
```
✅ HTML 文章已生成！

📁 文件路径：/home/admin/maxwell-blog/posts/2026/03/2026-03-29-Install-Graph-Memory.html

请审核文件内容，确认无误后回复"审核通过"，我提交到 GitHub 并发布到草稿箱。
```

### 示例 4：发布文章

**用户**: 审核通过

**AI**:
```
✅ 已提交 GitHub：feat: 新增文章 - 安装 graph-memory 实战
✅ 已发布到 WordPress 草稿箱

草稿编辑链接：http://47.84.100.47/wp-admin/post.php?post=441&action=edit

请预览草稿，确认无误后说"发布"，我正式发布。
```

### 示例 5：正式发布

**用户**: 发布

**AI**:
```
✅ 文章已正式发布！

📰 文章链接：http://47.84.100.47/?p=441
```

---

## 🛠️ 辅助工具

### 批量转换脚本

```bash
# 转换现有 Markdown 文件为 HTML 格式
python3 ~/.openclaw/skills/wordpress-blog-writer/skills/wordpress-blog-writer/convert_posts.py [目录路径]
```

---

## 📖 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 2.0.0 | 2026-03-29 | 改用 HTML 格式，支持 REST API 发布 |
| 1.0.0 | 2026-03-28 | 初始版本（Markdown 格式） |

---

## 📄 License

MIT License
