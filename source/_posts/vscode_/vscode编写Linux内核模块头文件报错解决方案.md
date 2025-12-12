---
title: vscode编写Linux内核模块头文件报错解决方案
cover: https://source.fomal.cc/img/default_cover_46.webp
tags:
  - vscode
  - linux
  - operating system
abbrlink: 2dbb0a4f
date: 2023-04-29 14:36:28
description: vscode的检查与自动补全依赖于对相关头文件的查找，如果头文件在特殊的地方，则需要专门设置路径
---

该解决方案参考了[这篇文章](https://www.joyk.com/dig/detail/1620497242851117)

## 报错情况
在使用 vscode 编写 Linux 内核模块的时候，需要 `#include` 一些与内核相关的头文件，然而经常会出现报错，比如当代码包含头文件

```c
#include <linux/slab.h>
```

就会出现如下报错：
> 检测到 #include 错误。请更新 includePath。已为此翻译单元(/home/zxz/Project/System/final-src-osc10e/ch3/homework/pid_new.c)禁用波形曲线。C/C++(1696)
>无法打开 源 文件 "asm/bug.h" (dependency of "linux/slab.h")C/C++(1696)

## 原因
通常我们编译内核模块是用 `Makefile` 作为编译系统的，而 vscode 并不能自动从 `Makefile` 里读取出需要的信息，也就是说 vscode 不知道我们使用的这些头文件的目录在哪里。所以需要我们手动在 `.vscode` 目录下写一些配置文件。

## 解决方法
### 查找路径
首先查找这些无法被 vscode 找到的头文件的路径。比如前面提到的报错信息，表示无法找到 `"asm/bug.h"`，那么可以在 Linux 终端输入
```bash
find / -name "bug.h" 2>/dev/null
```

由于这里的 `"bug.h"` 文件是一个虚拟的 Linux 头文件，所以会返回比较多的结果。不过在这里正确的路径应该是 `/usr/src/linux-headers-5.15.0-69-generic/arch/x86/include/asm/bug.h`。筛选的方式为：
* Linux 源码中的一般头文件： 内核源码根目录/include/linux
* Linux 源码中的与架构相关的头文件： 内核源码根目录/arch/架构名/include

而对于某些 Linux 内核头文件的缺失，比如如下报错：
> 无法打开 源 文件 "linux/proc_fs.h"C/C++(1696)

那么通过查找可以得到唯一路径 `/usr/src/linux-headers-5.15.0-69-generic/include/linux/proc_fs.h`。

### 修改 vscode 配置文件
在 vscode 中使用 `Ctrl + Shift + P` 调出命令面板，输入 `C/C++:Edit Configuration(JSON)`，打开配置文件。

对于文件 `/usr/src/linux-headers-5.15.0-69-generic/arch/x86/include/asm/bug.h`，那么就需要把文件夹 `/usr/src/linux-headers-5.15.0-69-generic/arch/x86/include/` 放到 `"inlcudePath"` 里。
同样的，对于文件 `/usr/src/linux-headers-5.15.0-69-generic/include/linux/proc_fs.h`，需要把 ` "/usr/src/linux-headers-5.15.0-69-generic/include"` 放到路径里。

### 配置文件示例
```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "${workspaceFolder}/**",
                "/usr/src/linux-headers-5.15.0-69-generic/include",
                "/usr/src/linux-headers-5.15.0-69-generic/include/uapi/",
                "/usr/src/linux-headers-5.15.0-69-generic/arch/x86/include",
                "/usr/src/linux-headers-5.15.0-69-generic/arch/x86/include/generated"
            ],
            "defines": [
                "__KERNEL__=1",
                "KBUILD_MODNAME=\"mod_hello\"",
                "MODULE=1"
            ],
            "compilerPath": "/usr/bin/gcc",
            "cStandard": "c17",
            "cppStandard": "gnu++14",
            "intelliSenseMode": "linux-gcc-x64"
        }
    ],
    "version": 4
}
```

下面 `"define"` 还不清楚干啥用，是直接从[这里](https://www.joyk.com/dig/detail/1620497242851117)复制过来的。