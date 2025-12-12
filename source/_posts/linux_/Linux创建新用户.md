---
title: Linux创建新用户，以及免密码远程登录
cover: https://source.fomal.cc/img/default_cover_16.webp
categories: linux
description: 在云计算project中的一些基本操作
abbrlink: 7ddfa635
date: 2023-12-05 21:00:08
tags: 
    - linux
    - scp
---

## 创建新用户
可以在root权限下使用 
```bash
sudo useradd -m -s /bin/bash <username>
```

* `-m` 选项表示创建用户时同时创建用户的主目录。
* `-s /bin/bash` 选项指定用户的默认shell为bash。你也可以使用其他shell，如/bin/sh或/bin/zsh。
* `<username>` 是你希望创建的新用户的用户名。你可以选择任何合适的用户名。

然后使用
```bash
sudo passwd <username>
```
设置密码

最后如果想要将该用户假如sudo用户组，可以输入
```bash
sudo visudo
```
在文件中在 `root    ALL=(ALL:ALL) ALL` 的下方加上 `<username>    ALL=(ALL:ALL) ALL`，其中 `<username>` 为你希望给予sudo权限的用户名。

以上命令会使用默认编辑器。如果希望指定编辑器编辑sudoer文件，比如使用vscode，则可以：
```bash
sudo code /etc/sudoers
```

## vscode免密码登录远程服务器
1. 首先在在本地运行
```bash
ssh-keygen
```
生成公钥-私钥对。文件会存储在 `C:\Users\ZhuXiaozhi\.ssh\` 文件夹下。

2. 然后将公钥传给远端服务器，可以使用 `scp` 指令:
```bash
scp C:\Users\ZhuXiaozhi\.ssh\id_rsa.pub root@1.94.43.249:/root/.ssh
```
这里将文件传给了 `root` 用户，并且存在了 `/root/.ssh` 文件夹下。

3. 进入服务器的 `~/.ssh` 文件夹，将公钥加入 `authorized_keyss` 文件中。
```bash
cat id_rsa.pub >> authorized_keys
```

4. 在 vscode 的远程连接配置文件中加入本地私钥路径。比如：