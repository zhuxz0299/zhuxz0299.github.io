---
title: Ubuntu 命令行与 vim 取消 beep 提示音
cover: https://source.fomal.cc/img/default_cover_20.webp
tags:
  - linux
  - vim
abbrlink: 22a9932d
date: 2024-06-30 18:54:42
categories: [System & Hardware, Linux]

---

关闭 Linux bash 中使用 tab 以及 vim 中操作错误的提示音。

### bash
修改文件 `/etc/inputrc`，加入
```bash
set bell-style none
```

### vim
修改文件 `/etc/vim/vimrc`，加入
```vi
:set vb t_vb=
```