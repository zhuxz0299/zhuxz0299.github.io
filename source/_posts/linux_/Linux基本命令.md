---
title: Linux基本命令
cover: https://source.fomal.cc/img/default_cover_14.webp
tags: linux
categories: linux
abbrlink: 4b6ea061
date: 2023-03-08 16:45:40
description: 熟悉一下一些基本命令
---

内容来源：[这个网站](https://gnu-linux.readthedocs.io/zh/latest/index.html)

### cat 查看和连接文件内容
cat 命令用于连接文件并打印到标准输出设备上。

命令格式：`cat [OPTION]... [FILE]...`

常用选项：
* `-b, --number-nonblank`：和 `-n` 相似，只不过对于空白行不编号。
* `-n, --number`：由 1 开始对所有输出的行数编号
* `-s, --squeeze-blank`：当遇到有连续两行以上的空白行，就代换为一行的空白行

使用实例：
```console
[Linux]$ cat a.sh
#! /usr/bin/bash
echo "Hello world !"


[Linux]$ cat a.sh b.sh
#! /usr/bin/bash
echo "Hello world !"
#! /usr/bin/bash
name="Linus Benedict Torvalds"
echo $name


[Linux]$ cat -n a.sh b.sh
     1      #! /usr/bin/bash
     2      echo "Hello world !"
     3      #! /usr/bin/bash
     4      name="Linus Benedict Torvalds"
     5      echo $name

# 利用重定向功能，另存为拼接文件
[Linux]$ cat -n a.sh b.sh > all.sh
```

### cp 复制文件或目录
cp（copy）用来复制文件（或目录）到指定的路径，可同时复制多个文件和目录。

命令格式：`cp [OPTION]... [-T] SOURCE DEST`

常用选项：
* `-f, --force`：强制复制，覆盖已经存在的文件时不提示
* `-i, --interactive`：在覆盖已经存在的文件时给出提示，要求用户确认是否覆盖
* `-n, --no-clobber`：不覆盖已经存在的文件
* `-R, -r, --recursive`：递归处理，将指定目录下的文件与子目录一并复制

使用实例：
```console
[Linux]$ ls
a.sh  demo.md   example.sh  hello1.txt  hello_rep.txt  nohup.out  sigint.py
b.sh  demo_dir  gituse      hello2.txt  mcd.sh         remote
# 复制文件并重命名
[Linux]$ cp a.sh demo_dir/aaa.sh
[Linux]$ ls demo_dir/
aaa.sh

# 复制多个文件到文件夹
[Linux]$ cp a.sh example.sh demo_dir/
[Linux]$ ls demo_dir/
a.sh  aaa.sh  example.sh

# 递归复制整个文件目录
[Linux]$ cp -r remote/ demo_dir/
[Linux]$ ls demo_dir/
a.sh  aaa.sh  example.sh  remote

# 交互式地复制文件
[Linux]$ cp -i a.sh demo_dir/
cp: overwrite 'demo_dir/a.sh'? n
```

### rm 删除文件或目录
rm（remove）删除文件或目录，也可以将某个目录及其下属的所有文件及其子目录均删除。

***使用 rm 命令要格外小心。因为一旦删除了一个文件，就无法再恢复它。***

命令格式：`rm [OPTION]... FILE...`

常用选项：
* `-d, --dir`：删除空目录
* `-f, --force`：强制删除文件或目录，不给出提示
* `-i`：删除文件或目录之前先询问用户
* `-r, -R, --recursive`：递归处理，将指定目录下的所有文件与子目录一并删除

使用实例：
```console
[Linux]$ ls
a.sh  demo.md   example.sh  hello1.txt  hello_rep.txt  nohup.out  sigint.py
b.sh  demo_dir  gituse      hello2.txt  mcd.sh         remote

# 删除文件
[Linux]$ rm a.sh 

# 删除文件前先确认
[Linux]$ rm -i b.sh
rm: remove regular file 'b.sh'? n

# 递归删除文件夹
[Linux]$ ls -F
b.sh*     demo_dir/    gituse/      hello2.txt*     mcd.sh*     remote/
demo.md*  example.sh*  hello1.txt*  hello_rep.txt*  nohup.out*  sigint.py*
[Linux]$ rm -r demo_dir/
[Linux]$ ls
b.sh     example.sh  hello1.txt  hello_rep.txt  nohup.out  sigint.py
demo.md  gituse      hello2.txt  mcd.sh         remote

# 强制递归删除文件夹（非常危险的命令）
[Linux]$ rm -rf remote/
```

### ls 显示目录中的文件
ls（list）用来显示目录所含的文件及子目录，在 Linux 中是使用率较高的命令。

命令格式：`ls [OPTION]... [FILE]...`
常用选项：
* `-a, --all`：显示所有的文件，包括隐藏文件（以 ``.`` 开头的文件）
* `-F, --classify`
  在每个输出项后追加文件的类型标识符
  * “*”表示具有可执行权限的普通文件
  * “/”表示目录
  *  “@”表示符号链接
  *  “|”表示命令管道 FIFO
  *  “=”表示 sockets 套接字
  *  当文件为普通文件时，不输出任何标识符
* `-i, --inode`：列出文件的索引节点号（inode）
* `-l`：以长格式显示目录下的内容列表。
* `-R, --recursive`：递归处理，将指定目录下的所有文件及子目录一并处理

```console
[Linux]$ ls
b.sh     example.sh  hello1.txt  hello_rep.txt  nohup.out  sigint.py
demo.md  gituse      hello2.txt  mcd.sh         remote

# 显示所有的文件，包括隐藏文件
[Linux]$ ls -a
.   b.sh     example.sh  hello1.txt  hello_rep.txt  nohup.out  sigint.py
..  demo.md  gituse      hello2.txt  mcd.sh         remote

# 在每个输出项后追加文件的类型标识符
[Linux]$ ls -F
b.sh*     example.sh*  hello1.txt*  hello_rep.txt*  nohup.out*  sigint.py*
demo.md*  gituse/      hello2.txt*  mcd.sh*         remote/

# 显示文件的索引节点号
[Linux]$ ls -i
 1970324838295833 b.sh         2251799814827352 hello1.txt      7318349395395220 nohup.out
 5629499535130883 demo.md       844424931274074 hello2.txt      3659174697243803 remote
 9570149209075706 example.sh   1125899907984731 hello_rep.txt  13510798883029637 sigint.py
 6755399441974060 gituse       5066549581705135 mcd.sh

 # 显示长格式列表,并将文件大小转换为更加人性化的表示方法（默认的以字节为单位）
[Linux]$ ls -lh
total 0
-rwxrwxrwx 1 root root   59 Mar  8 17:03 b.sh
-rwxrwxrwx 1 root root  385 Sep 25 23:38 demo.md
-rwxrwxrwx 1 root root  282 Sep 25 19:53 example.sh
drwxrwxrwx 1 root root 4.0K Feb 20 08:43 gituse
-rwxrwxrwx 1 root root   12 Feb 21 19:16 hello1.txt
-rwxrwxrwx 1 root root    6 Feb 21 19:15 hello2.txt
-rwxrwxrwx 1 root root   24 Feb 21 19:17 hello_rep.txt
-rwxrwxrwx 1 root root   41 Sep 25 19:53 mcd.sh
-rwxrwxrwx 1 root root    0 Sep 27 13:59 nohup.out
drwxrwxrwx 1 root root 4.0K Feb 20 08:20 remote
-rwxrwxrwx 1 root root  246 Sep 27 13:28 sigint.py

# 显示目录下所有的 txt 文件
[Linux]$ ls -l *txt
-rwxrwxrwx 1 root root 12 Feb 21 19:16 hello1.txt
-rwxrwxrwx 1 root root  6 Feb 21 19:15 hello2.txt
-rwxrwxrwx 1 root root 24 Feb 21 19:17 hello_rep.txt
```