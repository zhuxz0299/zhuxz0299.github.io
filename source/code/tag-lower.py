#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 _posts 文件夹下所有 .md 文件中的英文标签转换为小写
"""

import os
import re
import sys
from pathlib import Path


def is_english_tag(tag):
    """检查标签是否包含英文字符（只处理纯英文或英文数字组合的标签）"""
    tag = tag.strip()
    if not tag:
        return False
    
    # 如果包含中文字符，则不处理
    if any('\u4e00' <= char <= '\u9fff' for char in tag):
        return False
    
    # 如果包含英文字母，则认为是英文标签
    return any(char.isalpha() for char in tag)


def process_markdown_file(file_path):
    """处理单个 Markdown 文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 找到 YAML front matter 部分
        if not content.startswith('---'):
            return False
        
        # 分离 front matter 和正文
        parts = content.split('---', 2)
        if len(parts) < 3:
            return False
        
        front_matter = parts[1]
        body = parts[2]
        
        # 处理 tags
        modified = False
        lines = front_matter.split('\n')
        new_lines = []
        in_tags_section = False
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # 检查是否是 tags 行
            if re.match(r'^tags:\s*$', line):
                # tags: 后面没有内容，处理后续的列表项
                new_lines.append(line)
                in_tags_section = True
                i += 1
                
                # 处理后续的列表项
                while i < len(lines):
                    next_line = lines[i]
                    # 如果是列表项
                    if re.match(r'^\s*-\s+', next_line):
                        match = re.match(r'^(\s*-\s+)(.+)$', next_line)
                        if match:
                            prefix = match.group(1)
                            tag = match.group(2).strip()
                            if is_english_tag(tag):
                                new_lines.append(f"{prefix}{tag.lower()}")
                                modified = True
                            else:
                                new_lines.append(next_line)
                        else:
                            new_lines.append(next_line)
                        i += 1
                    else:
                        # 不是列表项，退出 tags 段
                        in_tags_section = False
                        break
                continue
            
            elif re.match(r'^tags:\s+(.+)$', line):
                # tags: value 格式（单行）
                match = re.match(r'^(tags:\s+)(.+)$', line)
                if match:
                    prefix = match.group(1)
                    tag = match.group(2).strip()
                    if is_english_tag(tag):
                        new_lines.append(f"{prefix}{tag.lower()}")
                        modified = True
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
                i += 1
                continue
            
            else:
                new_lines.append(line)
                i += 1
        
        # 如果有修改，写回文件
        if modified:
            new_content = '---' + '\n'.join(new_lines) + '---' + body
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"修改了文件: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")
        return False


def main():
    """主函数"""
    # 获取脚本所在目录
    script_dir = Path(__file__).parent
    # 获取 _posts 目录
    posts_dir = script_dir.parent / '_posts'
    
    if not posts_dir.exists():
        print(f"错误: 找不到 _posts 目录: {posts_dir}")
        sys.exit(1)
    
    print(f"开始处理目录: {posts_dir}")
    
    # 统计信息
    total_files = 0
    modified_files = 0
    
    # 递归遍历所有 .md 文件
    for md_file in posts_dir.rglob('*.md'):
        total_files += 1
        print(f"处理文件: {md_file}")
        
        if process_markdown_file(md_file):
            modified_files += 1
    
    print(f"\n处理完成:")
    print(f"总文件数: {total_files}")
    print(f"修改文件数: {modified_files}")


if __name__ == '__main__':
    main()