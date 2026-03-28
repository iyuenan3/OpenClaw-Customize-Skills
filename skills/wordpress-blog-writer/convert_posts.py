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
from typing import Dict, List, Optional

# 尝试导入 markdown_it
try:
    from markdown_it import MarkdownIt
    MD_AVAILABLE = True
except ImportError:
    print("❌ 需要安装 markdown_it: pip install markdown-it-py")
    MD_AVAILABLE = False


def translate_to_pinyin(chinese: str) -> str:
    """简单的中文转拼音（无声调）"""
    # 简单映射（实际应该使用 pypinyin 库）
    pinyin_map = {
        '我': 'Wo', '是': 'Shi', '的': 'De', '一': 'Yi', '个': 'Ge',
        '爱': 'Ai', '你': 'Ni', '好': 'Hao', '中': 'Zhong', '国': 'Guo',
        '博': 'Bo', '客': 'Ke', '文': 'Wen', '章': 'Zhang', '记': 'Ji',
        '录': 'Lu', '实': 'Shi', '战': 'Zhan', '教': 'Jiao', '程': 'Cheng',
    }
    
    result = []
    for char in chinese:
        if char.isalnum():
            result.append(char)
        elif char in pinyin_map:
            result.append(pinyin_map[char])
        else:
            result.append('-')
    
    return ''.join(result).replace('--', '-').strip('-') or 'Untitled'


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


def convert_file(md_path: Path) -> dict:
    """转换单个文件"""
    print(f"📝 处理：{md_path.name}")
    
    try:
        # 读取 Markdown 文件
        md_content = md_path.read_text(encoding='utf-8')
        
        # 解析 Front Matter
        front_matter, body = parse_front_matter(md_content)
        if front_matter is None:
            print(f"   ⚠️  无 Front Matter，跳过")
            return {'success': False, 'reason': 'no_front_matter', 'file': str(md_path)}
        
        title = front_matter.get('title', md_path.stem)
        
        # 转换 Markdown 为 HTML
        html_content = convert_markdown_to_html(body)
        
        # 创建 HTML 文档
        html_doc = create_html_document(title, html_content, front_matter)
        
        # 生成文件名
        english_title = translate_title(title)
        html_filename = f"{md_path.stem}.html"
        
        # 确定输出目录（与 MD 文件同级）
        output_path = md_path.parent / html_filename
        
        # 保存 HTML 文件
        output_path.write_text(html_doc, encoding='utf-8')
        
        print(f"   ✅ 已保存：{html_filename}")
        return {
            'success': True,
            'output': str(output_path),
            'file': str(md_path),
            'title': title,
        }
        
    except Exception as e:
        print(f"   ❌ 失败：{e}")
        return {'success': False, 'reason': str(e), 'file': str(md_path)}


def print_report(results: List[dict]) -> None:
    """打印转换报告"""
    print()
    print("=" * 60)
    print("📊 转换报告")
    print("=" * 60)
    
    total = len(results)
    success = sum(1 for r in results if r['success'])
    failed = total - success
    
    print(f"\n总计：{total} 个文件")
    print(f"成功：{success} 个")
    print(f"失败：{failed} 个")
    
    if success > 0:
        print(f"\n✅ 成功转换的文件:")
        for r in results:
            if r['success']:
                print(f"   - {r['file']} → {r['output']}")
    
    if failed > 0:
        print(f"\n❌ 失败的文件:")
        for r in results:
            if not r['success']:
                print(f"   - {r['file']}: {r['reason']}")
    
    print()
    print("=" * 60)


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
    md_files = sorted(input_dir.rglob('*.md'))
    
    if not md_files:
        print("❌ 未找到 Markdown 文件")
        sys.exit(0)
    
    print(f"找到 {len(md_files)} 个 Markdown 文件\n")
    
    # 转换
    results = []
    for md_file in md_files:
        result = convert_file(md_file)
        results.append(result)
    
    # 打印报告
    print_report(results)
    
    # 返回状态码
    failed = sum(1 for r in results if not r['success'])
    sys.exit(0 if failed == 0 else 1)


if __name__ == '__main__':
    main()
