---
title: Windows 注册表
abbrlink: 5ef1aa76
date: 2025-08-01 16:53:50
tags:
---


{% note info %}
内容参考：[B站-为什么越来越多程序不使用注册表了](https://www.bilibili.com/video/BV1fi421v76i)与[B站-注册表是什么？怎么修改？](https://www.bilibili.com/video/BV11Y4y1n7wY)
{% endnote %}

## 注册表的起源
Windows 早期的配置文件存储在 `.ini` 文件中，例如 `C:\Windows` 路径下还存在一些 `.ini` 文件。但是 `.ini` 文件通常都很小，从几百字节到几 KB。当时的文件系统主要为 FAT16，该文件系统中最多只能有 65535 个簇，理论上如果硬盘空间为 500MB，那么一个簇的大小至少为 8KB，而事实上 FAT16 的一个簇的大小为 16KB。一个文件的大小即使小于一个簇，依然要占用一个簇的空间，这就导致空间浪费非常严重。

除此之外，当时的磁盘 I/O 能力非常差，如果小文件特别多，读写性能就更差了。因此微软设计了一个数据库，将所有的配置信息集中管理，这个数据库就叫注册表 (Registry)。目前的 Windows 将这些数据库文件存放在 `C:\Windows\System32\config` 路径下。


## 注册表内容
在注册表编辑软件 `regedit.exe` 的左侧栏中，有很多 key，每个 key 下面又有很多 subkey。对于每个 key，其中包含很多 value，value 显示在编辑软件的主界面。可以看出注册表结构和文件管理器类似，key 可以类比为文件夹，value 类比为文件。

每个 value 都有“名称”、“类型”、“数据”三个属性。

### 文件管理器右键菜单
注册表中路径为：`计算机\HKEY_CLASSES_ROOT\*\shell`。在 `shell` 之下的 subkey 就会出现在文件管理器右键菜单中。例如其中一个 subkey 为 `VSCode`，其中有两个 value，分别为
```
名称    类型            数据
(默认)  REG_EXPAND_SZ   通过 Code 打开
Icon    REG_EXPAND_SZ   D:\Microsoft VS Code\Code.exe
```

分别给出了右键菜单中的内容：“通过 Code 打开”，以及右键菜单中 icon 的路径。`VSCode` 之下还有一个 subkey，为 `command`，内容为：
```
名称    类型            数据
(默认)  REG_EXPAND_SZ   "D:\Microsoft VS Code\Code.exe" "%1"
```

`"%1"` 为命令行传递的参数。这里代表使用 VSCode 打开当前工作区。

### 任务管理器开机自启动项
路径为 `计算机\HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`，其中的 value 会出现在任务管理器的开机自启动项中。同时某些应用可以通过修改设置来影响注册表，从而选择是否开机自启动。

例如交大云盘，如果在系统设置中勾选开机自启动，那么就包含一条形如
```
com.tencent.cofile    REG_SZ   C:\Program Files (x86)\SJTU_Drive\交大云盘.exe
```

的 value，任务管理器的启动项中也会出现交大云盘。反之如果取消勾选，那么注册表中的这个 value 就会没掉。