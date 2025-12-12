---
title: Linux 默认应用程序
cover: 'https://source.fomal.cc/img/default_cover_178.webp'
tags:
  - linux
  - xdg
  - d-bus
description: 通过解决 Linux 打开文件时使用默认程序的问题，了解了一些 Linux 的工作机制。
abbrlink: b8ade17a
date: 2025-11-06 22:27:08
---

## 系统默认使用音乐播放器打开文件夹
### 问题描述
在某些应用中（比如 Local Send）中试图打开一个文件夹，跳出来的是音乐播放器而非文件管理器。

### 问题分析
Linux 系统（以及其他类 Unix 系统）并不主要依赖文件扩展名（比如 `.txt` 或 `.mp3`）来决定用什么程序打开一个文件，而是使用 MIME 类型。

问题的根源：
* MIME 类型： 在 Linux 中，一个文件夹（目录）也有它自己的 MIME 类型，即 `inode/directory`。
* 错误关联： 系统将 `inode/directory` 这个 MIME 类型错误地与你的音乐播放器 Amberol 的 `.desktop` 启动文件关联了起来。

因此试图打开一个文件夹时，系统查询 `inode/directory` 的默认程序，找到了音乐播放器并启动。

### 解决方法
首先查询当前默认的文件夹打开程序：
```bash
xdg-mime query default inode/directory
```

发现确实不是文件管理器。然后使用
```bash
xdg-mime default thunar.desktop inode/directory
```

将其设置为正在使用的文件管理器。

## 微信不使用默认文件管理器打开文件夹
### 问题描述
目前在 `xdg-mime` 中已经将 `inode/directory` 的默认打开方式改成了 Thunar，但是在微信中打开文件夹时，默认跳出来的依然是 Nautilus。

### 问题分析
#### xdg-desktop-portal 错误转交请求
首先微信运行在沙盒环境中，可能并没有读取系统的 `~/.config/mimeapps.list` 文件。发现这点是成立的：
```
→ yay -Qs wechat
local/wechat-universal-bwrap 4.1.0.13-1
WeChat (Universal)with bwrap sandbox
```

接下来考虑微信如何启动 Nautilus 打开文件夹。首先猜测可能是 `xdg-desktop-portal` 接管了请求，然后激活了 `xdg-desktop-portal-gnome` 来执行请求，从而启动 Nautilus。但是通过监听：
```bash
journalctl --user -f -u xdg-desktop-portal.service
```

发现微信在启动 Nautilus 时，监听程序没有任何输出，因此排除了这个工作流程。

#### D-bus 直接调用
既然微信没有使用 Portal，那么有可能它直接向 D-Bus发送了一个广播消息请求文件管理器，这个广播消息的名称是 `org.freedesktop.FileManager1`。因此运行 D-Bus 监听程序：
```bash
dbus-monitor --session "interface='org.freedesktop.FileManager1'"
```

可以得到输出：
```
methodcalltime=1762434730.696711 sender=:1.168 ->destination=org.freedesktop.FileManager1 serial=2 path=/org/freedesktop/FileManagerl;interface=org.freedesktop.FileManagerl;member=ShowItems
    array[
        string"file:///home/zxz/Documents/WeChat_Data/xwechat_files/wxid_evhqb40zoj3b22_a1a8/msg/file/2025-11/proxy-providers.yaml"
    ]
string "fake-dde-file-manager-show-items"
```

这些内容表明：
* `sender=:1.168`: 这是微信沙盒
* `destination=org.freedesktop.FileManager1`: 它向 D-Bus 总机 (`dbus-daemon`) 发送了一个通用请求：“请接通默认文件管理器”
* `member=ShowItems`: 它请求的操作是“显示这些文件”

接下来 `dbus-daemon` 开始工作：
1. 它首先会检查是否已经有一个程序在运行，并且认领了 `org.freedesktop.FileManager1` 这个名字。
   * 正在运行的程序可以用 `busctl --user list | grep org.freedesktop.FileManager1` 查看
   * Nautilus 如果正在运行，会有如下结果：
        ```
        org.freedesktop.FileManager1    8928    nautilus    zxz :1.183  session-3.scope 3
        ```
     1. 如果已经有程序认领了（比如上面展示的 Nautilus 已经在运行），`dbus-daemon` 会跳过第 2 步，直接把消息转发给那个正在运行的程序。
     2. 如果没有程序认领，进入第 2 步
2. `dbus-daemon` 会在它的配置目录中（主要是 `/usr/share/dbus-1/services/` 和 `~/.local/share/dbus-1/services/`）查找一个同名的 `.service` 文件。
3. `dbus-daemon` 会读取这个文件里的指令（`Exec=` 或 `SystemdService=`）来启动一个新程序，让这个新程序来处理该消息。

通过检查 `/usr/share/dbus-1/services/org.freedesktop.FileManager1.service` 内容，发现：
```
 cat /usr/share/dbus-1/services/org.freedesktop.FileManager1.service
[D-BUS Service]
Name=org.freedesktop.FileManager1
Exec=/usr/bin/nautilus --gapplication-service
```

找到了问题所在。接下来将 `Exec` 后面的路径修正就能解决问题。