---
title: Linux文件压缩与解压
cover: 'https://source.fomal.cc/img/default_cover_128.webp'
tags: linux
description: 介绍一些在Linux中压缩与解压文件夹的方法
abbrlink: b0f85331
date: 2024-08-24 15:05:59
---

## tar
`tar` 是 Linux 中一个常用的打包工具，可以将多个文件和文件夹打包成一个单一的文件，通常与压缩工具(如 `gzip` 或 `bzip2`)结合使用。

### 打包与解包文件(不压缩)
```bash
tar -cvf demo-tar.tar demo-folder/ # 打包文件
tar -xvf demo-tar.tar # 解包文件
tar -xvf demo-tar.tar -C ./new-folder # 解包文件到特定文件夹下
```

* `-c`：创建一个新的归档文件(create)。
* `-v`：详细模式，显示处理的文件(verbose)。
* `-f`：指定输出的归档文件名。
* `-x`：解包归档文件(extract)。
* `-C`：指定解包后的位置。

使用 `tar` 解包之后，所有文件夹都会保留被打包时的名称，如将 `demo-folder/` 打包成 `demo-tar.tar`，那么解包之后得到的就是文件夹 `demo-folder/`，且该文件夹在工作目录下。但是如果打包时进入文件夹，对全部文件进行打包：
```bash
tar -cvf demo-tar.tar ./* # 打包文件
tar -xvf demo-tar.tar # 解包文件
```

那么解包之后所有文件/文件夹都会直接在当前工作目录下，而非在某个文件夹中(如果不使用 `-C` 指定)，所以解包前最好先查看一下 `.tar` 文件中是仅有一个文件夹或是有很多文件。

### 打包与解包文件(压缩)
```bash
tar -czvf demo.tar.gz demo-folder/ # 打包并压缩文件，使用 gzip
tar -xzvf demo.tar.gz # 解包并解压文件，使用 gzip
tar -cjvf demo.tar.bz2 demo-folder/ # 打包并压缩文件，使用 bzip2
tar -xjvf demo.tar.bz2 # 解包并解压文件，使用 bzip2
```

* `-z`：使用 `gzip`
* `-j`：使用 `bzip2`

### 查看打包文件内容(不解包或解压)
```bash
tar -tvf demo-tar.tar
tar -tzvf demo.tar.gz
```

* `-t`：列举全部内容(list)。
* `-v`：查看每个文件的详细信息，比如权限、大小、修改时间等(verbose)。

## zip, unzip
```bash
zip -r demo.zip demo-folder/ # 压缩
unzip demo.zip # 解压
unzip demo.zip -d new-folder # 解压并指定位置
unzip -l demo.zip # 不解压，进查看打包内容
```

* `-r`：递归地压缩文件夹中的所有文件和子文件夹。
* `-d`：指定解压后的位置