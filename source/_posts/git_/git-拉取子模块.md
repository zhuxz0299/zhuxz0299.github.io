---
title: git 拉取子模块
cover: 'https://source.fomal.cc/img/default_cover_129.webp'
tags:
  - github
  - git
description: 在拉取repo时拉取子模块
abbrlink: 78dbfa7
date: 2024-09-19 18:52:52
---

在 Git 中，有些文件夹可能使用了子模块(Submodule)来链接到其他仓库。子模块是 Git 仓库中的独立项目，可以和主仓库一起管理。如果克隆一个包含子模块的仓库，默认情况下，子模块不会自动被拉取下来。

## 检查是否有子模块
如果一个 repo 有子模块，那么会存在 `.gitmodules` 文件，可以打开查看。

或者直接运行
```bash
git submodule
```

该命令会列出子模块的信息。

## 拉取子模块
### 在 git clone 时拉取子模块
如果在克隆时希望一并拉取子模块的内容，可以使用 `--recurse-submodules` 参数：
```bash
git clone --recurse-submodules <repo_url>
```

### 克隆后拉取子模块
如果已经完成了 `git clone`，但发现子模块的内容没有拉取，可以执行以下操作来拉取子模块：
```bash
git submodule update --init --recursive
```

这会初始化并更新所有子模块，拉取它们的内容。