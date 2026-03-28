const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true });

const testMd = `# 标题

## 二级标题

这是**粗体**和*斜体*。

- 列表项 1
- 列表项 2

> 引用内容

\`\`\`bash
echo hello
\`\`\`

| 列 1 | 列 2 |
|------|------|
| A    | B    |
`;

let html = md.render(testMd);

// 后处理
html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
html = html.replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1');
html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
html = html.replace(/<p>(<table>.*?<\/table>)<\/p>/gs, '$1');

console.log('=== HTML 输出 ===');
console.log(html);
