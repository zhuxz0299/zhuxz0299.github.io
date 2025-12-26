---
title: Linux创建新用户，以及登录设置
cover: https://source.fomal.cc/img/default_cover_16.webp
categories: [System & Hardware, Linux]
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

## ssh 免密码登录远程服务器
1. 首先在在本地运行
    ```bash
    ssh-keygen
    ```
    生成公钥-私钥对。文件会存储在 `~\.ssh\` 文件夹下。
2. 然后将公钥传给远端服务器，可以使用 `scp` 指令:
    ```bash
    scp C:\Users\ZhuXiaozhi\.ssh\id_rsa.pub root@1.94.43.249:/root/.ssh
    ```
    这里将文件传给了 `root` 用户，并且存在了 `/root/.ssh` 文件夹下。
3. 进入服务器的 `~/.ssh` 文件夹，将公钥加入 `authorized_keyss` 文件中。
    ```bash
    cat id_rsa.pub >> authorized_keys
    ```
4. 如果还需要通过 vscode 快捷登录服务器，在 vscode 的远程连接配置文件中进行设置，格式形如：
    ```yaml
    Host <name>
        HostName <id address>
        Port <port>
        User <username>
    ```
    其中 `Host` 后面那个名称可以随便填。

## 设置禁止使用密码登录服务器
1. 备份原有配置文件
   ```bash
   sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
   ```
2. 编辑配置文件
    ```bash
    sudo vim /etc/ssh/sshd_config
    ```
3. 修改参数
    ```config
    # 1. 开启公钥验证 (通常默认就是 yes，确认一下)
    PubkeyAuthentication yes

    # 2. 全局禁止密码验证 (这是关键，先对所有人关门)
    PasswordAuthentication no

    # 3. 建议同时也关闭 ChallengeResponseAuthentication，防止通过 PAM 绕过
    ChallengeResponseAuthentication no
    ```
4. 添加特例：假如希望某个用户（比如 `root`）依然可以通过密码登录，可以在配置文件末尾加入
    ```
    # 允许 root 用户使用密码登录
    Match User root
        PasswordAuthentication yes
    ```
5. 验证语法并重启服务
    ```bash
    # 检查语法（如果没有输出，说明语法正确）
    sudo sshd -t

    # 重启 SSH 服务 (麒麟/CentOS 使用 systemctl)
    sudo systemctl restart sshd
    ```

设置成功之后，如果遇到没有密钥之类验证的设备想要登录该服务器的账号，会遇到如下报错：
```
Authorized users only. All activities may be monitored and reported.
sjtu@202.120.39.14: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).
```