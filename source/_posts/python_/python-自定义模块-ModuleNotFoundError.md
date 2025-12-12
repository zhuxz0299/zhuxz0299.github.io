---
title: python 自定义模块 ModuleNotFoundError
cover: https://source.fomal.cc/img/default_cover_34.webp
tags: python
description: 解决在调用自定义模块时出现的 ModuleNotFoundError 问题
abbrlink: 541d1b4c
date: 2024-05-22 20:52:53
---

### 问题描述
现有如下文件结构：
```
- simulator
    - utils
        - constant.py
        - utility.py
    - simulator.py
```
* 在 `simulator.py` 中，使用 `from utils import utilities`。
* 在 `utility.py` 中，使用 `import constant as const`。

以 `simulator` 为工作目录，在命令行运行 `python simulator.py`，会出现报错：
```
Traceback (most recent call last):
  File "F:\laboratory\satellite computing\simulator\simulator.py", line 2, in <module>      
    from utils import utilities
  File "F:\laboratory\satellite computing\simulator\utils\utilities.py", line 2, in <module>
    import constant as const
ModuleNotFoundError: No module named 'constant'
```

### 解决方法
出现问题的原因是，python 解释器在运行 `utility.py` 文件时，找不到 `constant.py` 文件。因为运行代码的工作目录为 `simulator` 文件夹，因此解释器搜索的目录中不会包含 `utils` 文件夹。

此时只需要在 `simulator.py` 代码前加上
```python
import sys
import os
current_dir = os.path.dirname(os.path.realpath(__file__))
utils_dir = os.path.join(current_dir, "utils")
sys.path.append(utils_dir)
```

将 `utils` 文件夹加入搜索目录即可。