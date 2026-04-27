---
title: WPS 打开时卡住
tags:
  - wps
  - font
categories:
  - System & Hardware
  - System Knowledge
cover: https://source.fomal.cc/img/default_cover_152.webp
description: 解决用 WPS 打开 PPT 时加载时间过长的问题
abbrlink: cae0e3e1
date: 2026-03-02 17:37:09
---

## 问题描述
如果使用 WPS 打开 `.pptx` 文件，在打开第一个页面时会卡住将近一分钟：页面框架成功加载，但是 PPT 内容不显示，且无法关闭 WPS 页面。但是如果仅仅是打开 WPS 软件本身，加载速度却很快。除此之外，在打开某个 `.pptx` 文件之后再打开另一个 `.pptx` 文件，加载同样很快。

## 问题分析
### strace 底层监视
想要找到哪里出了问题，可以使用 `strace` 监视底层调用情况。首先运行：
```bash
strace -T -e trace=connect,poll,openat,recvmsg wpp 1.22-进展汇报.pptx
```

结果输出以下结果之后戛然而止：
```
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3 <0.000014>

... (省略中间无关内容)

openat(AT_FDCWD, "/usr/bin/wpp", O_RDONLY) = 3 <0.000007>

--- SIGCHLD {si_signo=SIGCHLD, si_code=CLD_EXITED, si_pid=18891, si_uid=1000, si_status=0, si_utime=0, si_stime=0} ---

--- SIGCHLD {si_signo=SIGCHLD, si_code=CLD_EXITED, si_pid=18892, si_uid=1000, si_status=0, si_utime=0, si_stime=0} ---

openat(AT_FDCWD, "/dev/null", O_WRONLY|O_CREAT|O_TRUNC, 0666) = 3 <0.000027>
```

根据 `openat(AT_FDCWD, "/usr/bin/wpp", O_RDONLY) = 3` 加上后面的 `SIGCHLD`（子进程退出信号），说明 `/usr/bin/wpp` 不是 WPS 的核心主程序，它只是一个用 bash 写的启动外壳（Wrapper Script）。这就导致当这个 bash 脚本在底层启动真正的 WPS 二进制文件时，`strace` 直接跟丢了。

因此加上 `-f` (follow forks) 参数，跟踪子进程：
```bash
strace -f -T -e trace=connect,poll,openat,recvmsg wpp 1.22-进展汇报.pptx
```

在 WPS 卡住的时候观察输出内容，发现基本形如：
```
...
[pid 20129] openat(AT_FDCWD, "/usr/local/texlive/2025/texmf-dist/fonts/type1/uhc/umj/umj16.pfb", O_RDONLY) = 28 <0.000101>
[pid 20129] openat(AT_FDCWD, "/usr/local/texlive/2025/texmf-dist/fonts/type1/uhc/umj/umj17.pfb", O_RDONLY) = 28<0.000028>
...
```

得知 WPS 在打开 PPT 文件时大量的时间都在从系统中加载字体，且字体大部分来自于 TeX Live。

### WPS 字体引擎逻辑
WPS 的字体引擎在首次打开文件时，它不完全信任系统 fontconfig 的缓存，而是会去物理遍历并逐个读取系统字体目录下的每一个文件来构建自己的内部内存树，而 TeX Live 自带了上万个极为零碎的专业排版字体文件，因此花了大量时间进行加载。

## 解决方法
可以把 TeX Live 的字体从系统的全局字体搜索路径中踢出去，LaTeX 引擎（如 `xelatex`, `pdflatex`）有自己独立的路径搜索机制（Kpathsea），不需要把字体注册进系统也能正常编译文档。

因此首先找出 TeX Live 的系统字体配置：
```bash
grep -ir "texlive" /etc/fonts/
```

发现为 `/etc/fonts/conf.d/09-texlive.conf`，然后将其删除或重命名为 `09-texlive.conf_backup`，再执行 `fc-cache -fv` 把 TeX 字体从缓存中清除。

