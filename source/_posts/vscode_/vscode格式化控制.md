---
title: vscode格式化控制
cover: https://source.fomal.cc/img/default_cover_45.webp
tags:
  - vscode
  - format
abbrlink: 327b67b2
date: 2023-07-19 22:27:05
description: 发现vscode的格式化操作会受到注释的影响
---

在vscode中一般使用 `alt+shift+F` 对代码进行格式化。但是如果在代码开头加上形如
```c++
// clang-format off
```

的注释，就能让代码无法格式化。

而如果在代码中加上注释
```c++
// clang-format on
```

那么又可以再让后面的代码能正常格式化。