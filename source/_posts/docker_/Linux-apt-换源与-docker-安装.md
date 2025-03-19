---
title: Linux apt 换源与 docker 安装
cover: https://source.fomal.cc/img/default_cover_4.webp
tags:
  - linux
  - apt
  - docker
description: 解决因为 docker 被墙无法使用官网方法安装的问题
abbrlink: '45029051'
date: 2024-06-27 22:16:56
---

## Linux apt/apt-get 换源
参考[CSDN](https://blog.csdn.net/qq_33806001/article/details/124814995)

这里考虑 Ubuntu 发行版。在 Ubuntu 中，安装软件的源储存在文件 `/etc/apt/sources.list` 中，因此改变该文件内的内容即可实现换源。

1. 备份官方源
   ```bash
   sudo cp /etc/apt/sources.list /etc/apt/sources.list_backup
   ```
2. 修改文件 `/etc/apt/sources.list`
   ```bash
   sudo vim /etc/apt/sources.list
   ```
   清除其中原本的内容，然后加入镜像源。这里使用清华源，以 Ubuntu 20.04 为例
   ```
    # 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse

    # 以下安全更新软件源包含了官方源与镜像站配置，如有需要可自行修改注释切换
    deb http://security.ubuntu.com/ubuntu/ focal-security main restricted universe multiverse
    # deb-src http://security.ubuntu.com/ubuntu/ focal-security main restricted universe multiverse

    # 预发布软件源，不建议启用
    # deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
    # # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
   ```
   其他版本也可在 https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/ 下找到。
3. 更新列表
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   sudo apt-get install build-essential
   ```

同时需要注意，除了文件 `/etc/apt/sources.list` 之外，文件夹 `/etc/apt/sources.list.d` 里面的文件同样能够添加软件源，且其中文件的格式需要与 `sources.list` 相同。这样的设计是为了在添加一些新的软件源时不需要修改 `sources.list` 文件。(参考[stackoverflow: what is the function of /etc/apt/sources.list.d?](https://stackoverflow.com/questions/26020917/what-is-the-function-of-etc-apt-sources-list-d))

各个软件源之间不能重复，否则在运行 `sudo apt-get update` 的时候会警告多次配置问题。例如：
```
W:日标 DEP-11 (stable/dep11/components-amd64.yml) 
在/etc/apt/sources.list:10 和 /etc/apt/sources.list.d/docker-tsinghua.list:1 中被配置了多次
```

## docker 安装
按照[官方文档](https://docs.docker.com/engine/install/ubuntu/)，第一步为设置 apt 的源(存储库，repository)。

```bash
# Add Docker's official GPG key:
# 更新系统的包管理器缓存，确保后续安装的软件包信息是最新的。
sudo apt-get update 
# 安装 ca-certificates（用于验证 HTTPS 连接的 SSL 证书）和 curl（用于从命令行进行数据传输）。
sudo apt-get install ca-certificates curl 
# 创建 /etc/apt/keyrings 目录，并设置权限为 0755（即所有用户可读，所有者可写和执行）。
sudo install -m 0755 -d /etc/apt/keyrings
# 使用 curl 从 Docker 官方网站下载 GPG 密钥，并保存到 /etc/apt/keyrings/docker.asc。这个密钥用于验证 Docker 软件包的签名。
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
# 设置 /etc/apt/keyrings/docker.asc 文件的权限，使所有用户可读
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

最后一步通过 `echo` 和 `tee` 将 Docker 软件源信息添加到 `/etc/apt/sources.list.d/docker.list` 文件中。
* `dpkg --print-architecture` 获取系统的架构（如 amd64），`./etc/os-release`  
* `echo "$VERSION_CODENAME"` 获取当前系统的代号（如 focal）。
* `signed-by=/etc/apt/keyrings/docker.asc` 指定使用之前下载的 GPG 密钥来验证软件包。

但是由于 docker 被墙，因此上述步骤会在访问 download.docker.com 时出问题，此时需要将这个网址换成国内镜像源。这里同样以清华源为例，修改后面几步
```bash
# 这里使用 docker-tsinghua.asc 防止和官网混淆，但直接覆盖掉原来的 docker.asc 也没问题，只是个文件名
sudo curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker-tsinghua.asc
sudo chmod a+r /etc/apt/keyrings/docker-tsinghua.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker-tsinghua.asc] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

此时我们可以得到文件 `/etc/apt/sources.list.d/docker.list`，其中内容为：
```
deb [arch=amd64 signed-by=/etc/apt/keyrings/docker-tsinghua.asc] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu focal stable
```

的形式。

接下来可以直接安装 docker：
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 关于 GPG 密钥的问题
如果没有正确下载以及设置 `gpg`，即这里的 `.asc` 文件，可能会出现类似下面的报错：
```
由于没有公钥，无法验证下列签名： NO_PUBKEY 7EA0A9C3F273FCD8
```

因为我们下载的 Docker GPG 文件(`gpg` 或 `.asc`)是 Docker 软件包的公钥(Public Key)，用于验证从 Docker 官方软件源下载的软件包的签名。每个软件包都有一个数字签名，这个签名是使用 Docker 私钥生成的。公钥和私钥成对使用，确保软件包的完整性和来源的真实性。
```
deb [arch=amd64 signed-by=/etc/apt/keyrings/docker-tsinghua.asc] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu focal stable
```

就相当于对 https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu 这个源使用密钥 `/etc/apt/keyrings/docker-tsinghua.asc`。