# OpenClaw Custom Skills

个人定制的 OpenClaw Skill 集合，用于扩展 OpenClaw 的功能。

## 📦 项目说明

本项目用于维护和分享个人定制的 OpenClaw Skill。每个 Skill 都是一个独立的模块，可以单独安装和使用。

## 📚 已包含的 Skill

### 1. moltbook-daily 🦞

Moltbook 日报生成器 - 每天爬取 Moltbook 热门帖子，生成抖音风格文案并发送邮件

**功能**:
- 🦞 爬取 Moltbook 热门帖子
- 🎯 筛选有趣、高赞、能引起讨论的帖子
- 📝 生成抖音风格文案
- 📧 每天上午 7 点自动发送邮件
- 🔄 7 天内不重复推荐

**安装**:
```bash
cp -r skills/moltbook-daily ~/.openclaw/skills/
```

**使用**:
```bash
# 手动执行
python3 ~/.openclaw/skills/moltbook-daily/index.py

# 或设置 Cron 定时任务（每天 7:00）
openclaw cron add --name "moltbook-daily" --schedule "0 7 * * *" --payload "python3 ~/.openclaw/skills/moltbook-daily/index.py"
```

[查看详细文档](skills/moltbook-daily/README.md)

---

### 2. wordpress-blog-writer ✍️

WordPress 博客写作助手 - 从构思到发布完整的博客文章

**功能**:
- 📝 主题推荐（基于当天对话）
- 📋 大纲编写
- ✍️ HTML 格式文章撰写
- 📤 GitHub 备份
- 🚀 WordPress 发布

**安装**:
```bash
cp -r skills/wordpress-blog-writer ~/.openclaw/skills/
```

**触发词**:
- `写博客`
- `写文章`
- `/blog`
- `/post`

[查看详细文档](skills/wordpress-blog-writer/SKILL.md)

---

## 🚀 安装方法

### 方式一：手动安装

```bash
# 克隆项目
git clone https://github.com/iyuenan3/OpenClaw-Customize-Skills.git

# 进入项目目录
cd OpenClaw-Customize-Skills

# 复制 Skill 到 OpenClaw
cp -r skills/<skill-name> ~/.openclaw/skills/

# 安装依赖（如果有）
pip install -r skills/<skill-name>/requirements.txt
```

### 方式二：使用 ClawHub（推荐）

```bash
# 安装 ClawHub CLI
npm install -g clawhub

# 安装 Skill
clawhub install iyuenan3/OpenClaw-Customize-Skills/<skill-name>
```

---

## 📁 项目结构

```
OpenClaw-Customize-Skills/
├── README.md                 # 项目说明
├── .gitignore               # Git 忽略文件
└── skills/                  # Skill 目录
    ├── moltbook-daily/      # Moltbook 日报
    │   ├── SKILL.md         # Skill 说明
    │   ├── index.py         # 主脚本
    │   └── README.md        # 使用说明
    └── wordpress-blog-writer/  # WordPress 博客写作
        ├── SKILL.md
        ├── index.ts
        └── package.json
```

---

## 🛠️ 开发自己的 Skill

### 1. 创建 Skill 目录

```bash
mkdir -p skills/<skill-name>
```

### 2. 创建必要文件

```bash
# Skill 说明（必需）
touch skills/<skill-name>/SKILL.md

# 主脚本（必需）
touch skills/<skill-name>/index.py  # 或 index.ts

# 使用说明（推荐）
touch skills/<skill-name>/README.md

# 依赖文件（如果需要）
touch skills/<skill-name>/requirements.txt  # Python
# 或
touch skills/<skill-name>/package.json  # Node.js
```

### 3. 编写 SKILL.md

```markdown
# <skill-name>

简短描述 Skill 的功能。

## 功能

- 功能 1
- 功能 2
- 功能 3

## 触发词

- `触发词 1`
- `触发词 2`

## 配置

在 openclaw.json 中配置：

```json
{
  "skills": {
    "entries": {
      "<skill-name>": {
        "enabled": true,
        "config": {
          "key": "value"
        }
      }
    }
  }
}
```

## 使用

```bash
# 手动执行
python3 ~/.openclaw/skills/<skill-name>/index.py
```
```

### 4. 测试 Skill

```bash
# 复制到 OpenClaw
cp -r skills/<skill-name> ~/.openclaw/skills/

# 测试
python3 ~/.openclaw/skills/<skill-name>/index.py
```

### 5. 提交到项目

```bash
git add skills/<skill-name>
git commit -m "feat: 添加 <skill-name> Skill"
git push
```

---

## 📝 提交规范

本项目遵循 [约定式提交](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:
```bash
git commit -m "feat: 添加 moltbook-daily Skill"
git commit -m "fix: 修复邮件发送失败的问题"
git commit -m "docs: 更新 README 安装说明"
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 License

MIT License

---

## 📬 联系方式

- GitHub: [@iyuenan3](https://github.com/iyuenan3)
- Email: limaxwell93@gmail.com

---

**Made with ❤️ by Agent-Max & Maxwell**
