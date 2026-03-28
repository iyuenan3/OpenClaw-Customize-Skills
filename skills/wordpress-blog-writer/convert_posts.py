#!/usr/bin/env python3
"""
批量转换 Markdown 文件为 HTML 格式
用于 wordpress-blog-writer skill

使用方法：
    python convert_posts.py [目录路径]
    
默认转换 /home/admin/maxwell-blog/posts 目录下的所有 Markdown 文件
"""

import os
import sys
import json
import re
from datetime import datetime
from pathlib import Path

# 尝试导入 markdown_it
try:
    import markdown_it
    MD_AVAILABLE = True
except ImportError:
    print("❌ 需要安装 markdown_it: pip install markdown-it-py")
    MD_AVAILABLE = False


def translate_to_pinyin(chinese: str) -> str:
    """简单的中文转拼音（无声调）"""
    # 这里使用简单的映射，实际应该使用 pypinyin 库
    # 临时方案：保留英文，中文用 - 替代
    result = []
    for char in chinese:
        if char.isalnum():
            result.append(char)
        else:
            result.append('-')
    return ''.join(result).replace('--', '-').strip('-')


def translate_title(title: str) -> str:
    """翻译标题为英文（简单版本）"""
    # 实际应该调用 AI 翻译 API
    # 这里使用拼音作为备用方案
    return translate_to_pinyin(title)


def convert_markdown_to_html(md_content: str) -> str:
    """将 Markdown 转换为 HTML"""
    if not MD_AVAILABLE:
        # 简单转换
        return md_content.replace('\n', '<br>\n')
    
    from markdown_it import MarkdownIt
    md = MarkdownIt()
    html = md.render(md_content)
    
    # 后处理：移除错误的 p 包裹
    html = re.sub(r'<p>(<h[1-6]>.*?</h[1-6]>)</p>', r'\1', html)
    html = re.sub(r'<p>(<ul>.*?</ul>)</p>', r'\1', html, flags=re.DOTALL)
    html = re.sub(r'<p>(<ol>.*?</ol>)</p>', r'\1', html, flags=re.DOTALL)
    html = re.sub(r'<p>(<blockquote>.*?</blockquote>)</p>', r'\1', html, flags=re.DOTALL)
    html = re.sub(r'<p>(<table>.*?</table>)</p>', r'\1', html, flags=re.DOTALL)
    html = re.sub(r'<p>(<pre>.*?</pre>)</p>', r'\1', html, flags=re.DOTALL)
    
    return html


def parse_front_matter(content: str) -> tuple:
    """解析 Front Matter"""
    match = re.match(r'^---\n([\s\S]*?)\n---\n\n([\s\S]*)$', content)
    if not match:
        return None, content
    
    front_matter_text = match.group(1)
    body = match.group(2)
    
    front_matter = {}
    
    # 解析 title
    title_match = re.search(r'title:\s*"([^"]+)"', front_matter_text)
    if title_match:
        front_matter['title'] = title_match.group(1)
    
    # 解析 date
    date_match = re.search(r'date:\s*(\S+)', front_matter_text)
    if date_match:
        front_matter['date'] = date_match.group(1)
    
    # 解析 author
    author_match = re.search(r'author:\s*(.+)', front_matter_text)
    if author_match:
        front_matter['author'] = author_match.group(1).strip()
    
    # 解析 categories
    cat_match = re.search(r'categories:\s*\[([^\]]+)\]', front_matter_text)
    if cat_match:
        front_matter['categories'] = [c.strip() for c in cat_match.group(1).split(',')]
    
    # 解析 tags
    tag_match = re.search(r'tags:\s*\[([^\]]+)\]', front_matter_text)
    if tag_match:
        front_matter['tags'] = [t.strip() for t in tag_match.group(1).split(',')]
    
    return front_matter, body


def create_html_document(title: str, html_content: str, front_matter: dict) -> str:
    """创建完整的 HTML 文档"""
    front_matter_json = json.dumps({
        'title': front_matter.get('title', title),
        'date': front_matter.get('date', datetime.now().strftime('%Y-%m-%d %H:%M')),
        'author': front_matter.get('author', 'Agent-Max & Maxwell Li'),
        'categories': front_matter.get('categories', []),
        'tags': front_matter.get('tags', []),
        'status': 'draft',
    }, indent=2, ensure_ascii=False)
    
    return f"""<!DOCTYPE html>
<html>
<head>
<title>{title}</title>
</head>
<body>
<!--
{front_matter_json}
-->
{html_content}
</body>
</html>"""


def convert_file(md_path: Path, output_dir: Path = None) -> dict:
    """转换单个文件"""
    print(f"📝 处理：{md_path.name}")
    
    try:
        # 读取 Markdown 文件
        md_content = md_path.read_text(encoding='utf-8')
        
        # 解析 Front Matter
        front_matter, body = parse_front_matter(md_content)
        if front_matter is None:
            print(f"   ⚠️  无 Front Matter，跳过")
            return {'success': False, 'reason': 'no_front_matter'}
        
        title = front_matter.get('title', md_path.stem)
        
        # 转换 Markdown 为 HTML
        html_content = convert_markdown_to_html(body)
        
        # 创建 HTML 文档
        html_doc = create_html_document(title, html_content, front_matter)
        
        # 生成文件名
        english_title = translate_title(title)
        html_filename = f"{md_path.stem}.html"
        
        # 确定输出目录
        if output_dir:
            output_path = output_dir / html_filename
        else:
            output_path = md_path.parent / html_filename
        
        # 保存 HTML 文件
        output_path.write_text(html_doc, encoding='utf-8')
        
        print(f"   ✅ 已保存：{output_path.name}")
        return {'success': True, 'output': str(output_path)}
        
    except Exception as e:
        print(f"   ❌ 失败：{e}")
        return {'success': False, 'reason': str(e)}


def main():
    # 确定输入目录
    if len(sys.argv) > 1:
        input_dir = Path(sys.argv[1])
    else:
        input_dir = Path('/home/admin/maxwell-blog/posts')
    
    if not input_dir.exists():
        print(f"❌ 目录不存在：{input_dir}")
        sys.exit(1)
    
    print(f"=== 批量转换 Markdown 为 HTML ===")
    print(f"输入目录：{input_dir}")
    print()
    
    # 查找所有 Markdown 文件
    md_files = list(input_dir.rglob('*.md'))
    
    if not md_files:
        print("❌ 未找到 Markdown 文件")
        sys.exit(0)
    
    print(f"找到 {len(md_files)} 个 Markdown 文件\n")
    
    # 转换统计
    stats = {'success': 0, 'failed': 0}
    
    for md_file in md_files:
        result = convert_file(md_file)
        if result['success']:
            stats['success'] += 1
        else:
            stats['failed'] += 1
    
    print()
    print(f"=== 转换完成 ===")
    print(f"成功：{stats['success']}")
    print(f"失败：{stats['failed']}")


if __name__ == '__main__':
    main()
