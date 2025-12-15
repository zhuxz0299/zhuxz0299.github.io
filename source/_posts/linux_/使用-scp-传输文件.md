---
title: 使用 scp 传输文件
cover: https://source.fomal.cc/img/default_cover_21.webp
tags:
  - linux
  - scp
description: 关于 scp 的基本用法以及一些特殊场景的使用
abbrlink: fdcecd69
date: 2024-03-15 15:15:17
categories: [System & Hardware, Linux]

---

scp 是 secure copy 的缩写, scp 是 linux 系统下基于 ssh 登陆进行安全的远程文件拷贝命令。

## 基本用法
### 语法
参考[菜鸟教程](https://www.runoob.com/linux/linux-comm-scp.html)

```bash
scp [可选参数] file_source file_target 
```

常用的参数有：
* -p：保留原文件的修改时间，访问时间和访问权限。
* -q： 不显示传输进度条。
* -r： 递归复制整个目录。
* -v：详细方式显示输出。scp和ssh(1)会显示出整个过程的调试信息。这些信息用于调试连接，验证和配置问题。
* -P port：注意是大写的P, port是指定数据传输用到的端口号

### 使用示例
将 `/home/space/music/1.mp3` 复制到服务器的 `/home/root/others/music` 文件夹下：
```bash
scp /home/space/music/1.mp3 root@www.runoob.com:/home/root/others/music 
```

将 `/home/space/music/1.mp3` 复制到服务器的 `/home/root/others/music` 文件夹下并重命名：
```bash
scp /home/space/music/1.mp3 root@www.runoob.com:/home/root/others/music/001.mp3
```

如果远程服务器防火墙有为scp命令设置了指定的端口，我们需要使用 -P 参数来设置命令的端口号：
```bash
scp -P 4588 remote@www.runoob.com:/usr/local/sin.sh /home/administrator
```

## 在同一局域网内并且IP使用了NAT
如果两台计算机在同一局域网内，并且IP使用了NAT技术，公网IP相同，那么如果依然指定端口号并且使用公网IP，则会无法连接。此时需要使用私有IP。

可以通过 `ifconfig` 命令查询网络情况，找到IP地址：
```
eno1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
    inet 192.168.1.65  netmask 255.255.255.0  broadcast 192.168.1.255
    inet6 fe80::6934:bdca:ea9f:a54c  prefixlen 64  scopeid 0x20<link>
    ether 3c:ec:ef:af:8b:c8  txqueuelen 1000  (以太网)
    RX packets 219744940  bytes 321364062938 (321.3 GB)
    RX errors 0  dropped 119923  overruns 0  frame 0
    TX packets 30847625  bytes 2581137691 (2.5 GB)
    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

然后在使用 scp 时使用私有IP，并且不用指定端口。