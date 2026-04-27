---
title: yazi 文件管理器
tags:
  - yazi
  - tui
description: 介绍一个非常好用的终端文件管理器
cover: 'https://source.fomal.cc/img/default_cover_193.webp'
categories:
  - Dev Tools
  - Software
abbrlink: c55202f6
date: 2026-02-08 00:45:51
---

{% note info %}
基本的安装与配置直接参考[官方文档](https://yazi-rs.github.io/docs/installation)即可，快捷键记不住的时候也可以直接按 `F1` 查询。本篇文章主要记录在默认配置下做的一些修改。
{% endnote %}

### 增加快捷键
根据官方文档 [keymap.toml](https://yazi-rs.github.io/docs/configuration/keymap) 中的说明，当我们需要在默认快捷键的基础上增加快捷键时，可以使用 `prepend_keymap` 或者 `append_keymap` 增加前置或是后置快捷键。由于 Yazi 选择第一个匹配的键来运行，因此前置键始终比默认键具有更高的优先级，而后置键始终比默认键具有较低的优先级。

增加前置和后置快捷键的配置文件形如：
```toml
[mgr]
prepend_keymap = [
	{ on = "<C-a>", run = "my-cmd1", desc = "Single command with `Ctrl + a`" },
]
keymap = [
    {……},
]
append_keymap = [
	{ on = [ "g", "b" ], run = "my-cmd2",          desc = "Single command with `g => b`" },
	{ on = "c",          run = [ "cmd1", "cmd2" ], desc = "Multiple commands with `c`" }
]
```

### 文件拖拽支持
命令行的文件选择器不支持拖拽，这就导致在某些情况下选择文件没那么方便（比如在 localsend 中选择本地文件）。这种情况下可以使用 [dragon-drop](https://github.com/mwh/dragon)。首先安装软件：
```bash
sudo pacman -S dragon-drop
```

然后在 `~/.config/yazi/keymap.toml` 的 `[mgr]` 中加入前置快捷键：
```toml
{ on  = "<C-n>", run = 'shell -- dragon-drop -a -x -i -T "$@"'}
```

完成之后在 yazi 中可以一次选中一个或多个文件，按下 `<C-n>` 后就会有一个包含了选中文件的支持拖拽的弹窗。

### 复制时将文件放入剪切板
原本使用 `y` 在 yazi 中复制选中的文件、文件夹，只能在 yazi 中粘贴，因此我们希望能够将文件一并复制到系统剪切板上。首先安装 `wl-clipboard` 以支持 `wl-copy` 命令 (适用于 Wayland)：
```bash
sudo pacman -S wl-clipboard
```

然后同样在 `~/.config/yazi/keymap.toml` 的 `[mgr]` 中加入前置快捷键：
```toml
{ on  = "y", run = [ 'shell -- for path in %s; do echo "file://$path"; done | wl-copy -t text/uri-list', "yank" ],
  desc = "Yank selected files (copy) and send to system clipboard"},
```

该前置快捷键可以覆盖默认的 `y`，从而使得 `y` 能够在 yazi 内复制的同时也把文件复制到系统剪切板。

### 压缩包支持树形预览
原本压缩文件的预览会比较乱，可以使用 [ouch 插件](https://github.com/ndtoan96/ouch.yazi)实现树形预览。安装软件以及插件：
```bash
sudo pacman -S ouch
ya pkg add ndtoan96/ouch
```

然后在 `~/.config/yazi/yazi.toml` 下 `[plugin]` 的前置预览配置 `prepend_previewers` 中加入：
```toml
{ mime = "application/{*zip,tar,bzip2,7z*,rar,xz,zstd,java-archive}", run  = "ouch"},
```

### 将 Yazi 设为系统文件选择器
这里需要使用 [xdg-desktop-portal-termfilechooser](https://github.com/hunkyburrito/xdg-desktop-portal-termfilechooser?)。首先进行安装：
```bash
yay -S xdg-desktop-portal-termfilechooser-hunkyburrito-git
```

安装完成后 `/usr/share/xdg-desktop-portal-termfilechooser/` 下会有一系列配置所需文件。复制 `config` 到 `~/.config/xdg-desktop-portal-termfilechooser/` 并修改为以下内容：
```conf
[filechooser]
cmd=yazi-wrapper.sh
default_dir=$HOME
; Uncomment to skip creating destination save files with instructions in them
; create_help_file=0
; Uncomment and edit the line below to change the terminal emulator command
env=TERMCMD=ghostty -e

; Mode must be one of 'suggested', 'default', or 'last'.
open_mode=suggested
save_mode=suggested
```
其中 `yazi-wrapper.sh` 也可以复制到 `~/.local/bin/` 中，这样方便调用。

再到 `~/.config/xdg-desktop-portal/portals.conf` 中加入如下内容，将 `termfilechooser` 设为默认文件选择器：
```conf
[preferred]
org.freedesktop.impl.portal.FileChooser=termfilechooser
```

然后重启一下 portal即可使用：
```bash
systemctl --user restart xdg-desktop-portal.service
```

