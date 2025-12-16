import os
import re

# 映射配置: 文件夹名 -> (一级分类, 二级分类)
CATEGORY_MAPPING = {
    # Lecture Notes (CS 课程笔记 - 理论/学术)
    '博弈论笔记': ('Lecture Notes', 'Game Theory'),
    '应用代数笔记': ('Lecture Notes', 'Applied Algebra'),
    '操作系统笔记': ('Lecture Notes', 'Operating System'),
    '数据科学基础笔记': ('Lecture Notes', 'Data Science'),
    '离散数学': ('Lecture Notes', 'Discrete Math'),
    '计算机图形学笔记': ('Lecture Notes', 'Computer Graphics'),
    '计算机组成笔记': ('Lecture Notes', 'Computer Organization'),
    '计算机网络笔记': ('Lecture Notes', 'Computer Network'),
    '量子力学': ('Lecture Notes', 'Quantum Mechanics'),
    '试卷解答': ('Lecture Notes', 'Exam Solutions'),
    '人工智能笔记': ('Lecture Notes', 'Artificial Intelligence'),
    '机器学习笔记': ('Lecture Notes', 'Machine Learning'),

    # AI & Machine Learning (人工智能与机器学习 - 理论与工具)
    '动手学深度学习': ('AI & Machine Learning', 'Deep Learning'),
    'PyTorch': ('AI & Machine Learning', 'PyTorch'),

    # Dev Tools (开发工具 - 环境/版本控制/编辑器)
    'conda': ('Dev Tools', 'Conda'),
    'docker_': ('Dev Tools', 'Docker'),
    'git_': ('Dev Tools', 'Git'),
    'vscode_': ('Dev Tools', 'VS Code'),
    'Makefile': ('Dev Tools', 'Makefile'),
    'hexo': ('Dev Tools', 'Hexo'),
    'latex': ('Dev Tools', 'LaTeX'),
    'software': ('Dev Tools', 'Software'), # 通用软件/效率工具

    # System & Hardware (系统与硬件 - OS/硬件/网络实践)
    'linux_': ('System & Hardware', 'Linux'),
    'windows_': ('System & Hardware', 'Windows'),
    'hardware': ('System & Hardware', 'Hardware'),
    'system': ('System & Hardware', 'System Knowledge'),
    'network': ('System & Hardware', 'Network Practice'),
    'verilog_and_vivado': ('System & Hardware', 'FPGA & Verilog'),

    # Programming Languages (编程语言)
    'python_': ('Programming Languages', 'Python'),
    'c#': ('Programming Languages', 'C#'),

    # Algorithms (算法)
    'oj': ('Algorithms', 'Online Judge'),

    # Multimedia (多媒体)
    'media_': ('Multimedia', 'Video & Audio'),

    # Life (生活)
    '自行车': ('Life', 'Cycling'),
}

# 脚本位置: source/code/add_category.py
# 目标路径: source/_posts/
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.dirname(CURRENT_DIR) # source/
POSTS_DIR = os.path.join(SOURCE_DIR, '_posts')

def get_category_for_folder(folder_name):
    return CATEGORY_MAPPING.get(folder_name)

def process_file(filepath, folder_name):
    target_cats = get_category_for_folder(folder_name)
    if not target_cats:
        # print(f"Skipping {filepath}: No mapping for folder '{folder_name}'")
        return

    top_cat, sub_cat = target_cats

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    # 匹配 Front Matter
    match = re.match(r'^\s*---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        print(f"Skipping {filepath}: No front matter found.")
        return

    front_matter = match.group(1)
    
    # 查找 categories 行
    cat_match = re.search(r'^categories:\s*(.+)$', front_matter, re.MULTILINE)
    
    new_front_matter = front_matter
    needs_update = False
    
    if cat_match:
        original_line = cat_match.group(0)
        original_value = cat_match.group(1).strip()
        
        # 检查是否已经是列表且有多个元素
        if original_value.startswith('[') and original_value.endswith(']'):
            inner = original_value[1:-1]
            items = [item.strip() for item in inner.split(',')]
            # if len(items) >= 2:
            if False:
                # 已经有两级或更多，跳过
                return
            else:
                # 列表但只有1个元素，或者空的
                # 强制更新为目标分类
                new_value = f'[{top_cat}, {sub_cat}]'
                if original_value != new_value:
                     new_line = f'categories: {new_value}'
                     new_front_matter = front_matter.replace(original_line, new_line, 1)
                     needs_update = True
        else:
            # 单值，例如 categories: latex
            # 强制更新为目标分类
            new_value = f'[{top_cat}, {sub_cat}]'
            new_line = f'categories: {new_value}'
            new_front_matter = front_matter.replace(original_line, new_line, 1)
            needs_update = True
            
    else:
        # 没有 categories 字段，添加它
        # 加在 Front Matter 的最后
        new_line = f'categories: [{top_cat}, {sub_cat}]'
        if front_matter.strip():
            new_front_matter = front_matter.rstrip() + '\n' + new_line + '\n'
        else:
            new_front_matter = new_line + '\n'
        needs_update = True

    if needs_update:
        # 替换 Front Matter
        new_content = content.replace(front_matter, new_front_matter, 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} (Folder: {folder_name}) -> [{top_cat}, {sub_cat}]")

def main():
    print(f"Scanning posts in: {POSTS_DIR}")
    
    # 遍历 _posts 下的一级子目录
    for item in os.listdir(POSTS_DIR):
        item_path = os.path.join(POSTS_DIR, item)
        if os.path.isdir(item_path):
            folder_name = item
            # 遍历子目录下的 md 文件
            for root, dirs, files in os.walk(item_path):
                for file in files:
                    if file.endswith('.md'):
                        process_file(os.path.join(root, file), folder_name)

if __name__ == '__main__':
    main()
