---
title: Linux插入内核模块报错
cover: https://source.fomal.cc/img/default_cover_15.webp
tags:
  - linux
  - operating system
abbrlink: 5aac262c
date: 2023-04-12 23:44:34
description: 完成操作系统课程设计的过程中遇到了内核模块插入失败的问题，费了好大劲解决，遂作此文
---

## 问题
```shell
sudo insmod simple.ko
```

输出 `insmod: ERROR: could not insert module simple.ko: Invalid module format`。

## 可能原因
根据chatgpt的回复，可能的原因有：
1. 内核版本不匹配：该模块是在另一个内核版本中编译的，与当前运行的内核版本不兼容。检查一下该模块所支持的内核版本，确保它与当前运行的内核版本相匹配。
2. 架构不匹配：该模块是为另一个 CPU 架构编译的，与当前 CPU 架构不兼容。例如，在 x86 平台上编译的模块无法在 ARM 平台上加载。检查一下该模块所支持的 CPU 架构，确保它与当前的 CPU 架构相匹配。
3. 编译错误：该模块编译时出现了错误，可能是由于编译器版本不兼容或编译选项不正确等原因导致。检查一下该模块的编译日志，查找任何编译错误或警告。

### 查询内核版本
首先查询当前Linux的运行的内核版本：
```shell
uname -r
```

得到 `5.15.0-69-generic`。然后查询`.ko`文件所支持的内核版本
```shell
modinfo simple.ko
```

得到
```console
filename:       /home/zxz/final-src-osc10e/ch2/simple.ko
author:         SGG
description:    Simple Module
license:        GPL
srcversion:     864167AB1A7021659306236
depends:        
retpoline:      Y
name:           simple
vermagic:       5.15.0-69-generic SMP mod_unload modversions 
```

说明内核版本没有问题。

### 查询CPU架构
首先查询模块文件的对应架构
```shell
file simple.ko
```

得到 `simple.ko: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), BuildID[sha1]=b56d8837eacb05001d12de71890131fa97b8902f, with debug_info, not stripped
`

然后再查询内核对应的CPU架构
```shell
uname -m
```

然后得到 `x86_64`。说明架构一致。

### 编译情况
再次运行
```shell
sudo make
```

得到输出
```console
make -C /lib/modules/5.15.0-69-generic/build M=/home/zxz/final-src-osc10e/ch2 modules
make[1]: Entering directory '/usr/src/linux-headers-5.15.0-69-generic'
  CC [M]  /home/zxz/final-src-osc10e/ch2/simple.o
  MODPOST /home/zxz/final-src-osc10e/ch2/Module.symvers
  CC [M]  /home/zxz/final-src-osc10e/ch2/simple.mod.o
  LD [M]  /home/zxz/final-src-osc10e/ch2/simple.ko
make[1]: Leaving directory '/usr/src/linux-headers-5.15.0-69-generic'
```

可以看出编译过程正常。

## 问题解决
参考了[stackoverflow](https://stackoverflow.com/questions/71746914/linux-kernel-module-development-module-x86-modules-skipping-invalid-relocatio?noredirect=1)中的一个回答。需要运行如下指令：
```shell
sudo apt update # 更新系统的软件包列表
sudo apt upgrade # 升级已经安装的软件包和系统
sudo apt remove --purge linux-headers-* # 删除现有的所有linux-headers
sudo apt autoremove # 自动删除系统中已经不再需要的软件包及其依赖项
sudo apt autoclean # 会删除系统中已经过期的软件包缓存文件
# sudo apt install linux-headers-generic
sudo apt-get install linux-headers-$(uname -r) # 安装与当前运行内核相一致的linux-header
```

然而之前的操作似乎删除了 `linux-source`，因此我又重新装了一遍。
```shell
sudo apt-get install linux-source
```

之后再运行
```shell
sudo make
sudo insmod simple.ko
```

就没有再出现问题。

## 疑惑
尽管最后成功了，但还是很奇怪，因为现在的 `linux-source` 模块和 `uname -r` 输出的当前运行模块是不相符的。