---
title: Linux 桌面图标显示
tags:
  - linux
  - gnome
  - desktop-entry
  - icon
  - wayland
categories:
  - System & Hardware
  - Linux
description: >-
  从 desktop 启动项、图标主题与窗口身份匹配解释 Linux 应用图标的显示过程，并记录 GNOME 下 Eudic 和 LocalSend
  图标异常的排查方法。
cover: 'https://source.fomal.cc/img/default_cover_157.webp'
abbrlink: 8b8a9be8
date: 2026-09-05 10:59:35
---

之前在 GNOME 中遇到过两次应用图标异常：一次是欧路词典 Eudic，另一次是 LocalSend。软件可以正常打开，图标文件也存在，但运行后 Dock 中显示的却是默认齿轮图标。尤其是 Eudic，即使把 `.desktop` 中的 `Icon=` 改成图标的绝对路径，再重启系统，问题依然存在。

要解释这种现象，需要先弄清楚两个过程：桌面环境如何找到应用的图标，以及如何知道一个窗口属于哪个应用。

{% note info %}
本文主要讨论应用列表、GNOME Dash / Dock 中的应用图标。桌面背景上的文件图标、文件管理器中的文件类型图标，以及系统托盘图标，还有各自的显示机制，不能完全套用本文的排查方法。
{% endnote %}

## 应用图标的显示过程

一个 Linux 图形应用通常涉及下面三个相互独立的对象：

| 对象 | 作用 | 例子 |
| --- | --- | --- |
| 可执行程序 | 运行应用、创建窗口 | `/usr/bin/localsend_app` |
| Desktop Entry，即 `.desktop` 文件 | 描述如何启动应用，以及名称、图标等信息 | `/usr/share/applications/localsend.desktop` |
| 图标文件 | 提供最终显示的图片 | 图标主题目录中的 PNG、SVG 文件 |

可执行文件能运行，只能说明程序本身可以启动；它并不保证桌面环境能找到正确的启动项和图标。

对于应用列表中的启动器，显示过程可以简化为：

```text
读取 .desktop 文件 → 读取 Icon 字段 → 查找图标文件 → 显示图标
```

对于 Dock 中运行着的应用，还要多做一次窗口归属判断：

```text
程序创建窗口
    ↓
桌面环境读取窗口的身份信息
    ↓
匹配到对应的 .desktop 文件
    ↓
读取 Icon 字段 → 查找图标文件 → 显示图标
```

因此，启动器图标正常，但打开后变成齿轮，或者 Dock 中又多出一个图标时，应当优先检查窗口匹配。此时即使修改了正确启动项中的 `Icon=`，运行中的窗口也可能根本没有关联到这个启动项。

## Desktop Entry：应用在桌面环境中的入口

### `.desktop` 文件的内容

以 Eudic 为例，一个启动项可以写成：

```ini
[Desktop Entry]
Type=Application
Name=Eudic
Exec=/usr/share/eusoft-eudic/AppRun %F
Icon=com.eusoft.eudic
StartupWMClass=eudic
Terminal=false
Categories=Dictionary;Education;
```

其中与本文直接相关的字段是：

| 字段 | 含义 |
| --- | --- |
| `Name` | 显示给用户看的应用名称 |
| `Exec` | 启动命令；这里的 `%F` 表示传入多个本地文件 |
| `Icon` | 图标名称或者绝对路径 |
| `StartupWMClass` | 为桌面环境提供窗口匹配提示 |


### 启动项所处位置

在默认 XDG 目录配置下（见[该文章](https://zhuxz0299.github.io/posts/fc95dfca.html)的 XDG Base Directory 章节），常见的查找位置按优先级排列为：

```text
~/.local/share/applications/    当前用户
/usr/local/share/applications/ 本机管理员安装
/usr/share/applications/       系统软件包安装
```

桌面环境用 **desktop file ID** 区分启动项。对于直接放在 `applications` 下的文件，这个 ID 就是文件名，例如 `localsend.desktop`。位于子目录时，还需要把相对路径中的 `/` 换成 `-`，详见 [Desktop File ID](https://specifications.freedesktop.org/desktop-entry/latest-single/#desktop-file-id)。

因此，把系统文件复制到用户目录并保留同名，能够覆盖系统启动项：

```bash
mkdir -p ~/.local/share/applications
cp -i /usr/share/applications/localsend.desktop ~/.local/share/applications/localsend.desktop
```

{% note warning %}
这里的覆盖是选择整份用户文件，不是把两份文件的字段合并。如果改成另一个文件名，就可能变成另一个启动项，导致应用列表中出现重复入口。
{% endnote %}

## Icon：如何找到图片

### 绝对路径与图标名称

`Icon` 有两种常见写法：

```ini
Icon=/usr/share/pixmaps/com.eusoft.eudic.png
; 或者
Icon=com.eusoft.eudic
```


前者直接指定文件，后者交给图标主题机制查找。使用图标名时通常省略 `.png`、`.svg` 等扩展名；使用绝对路径时需要写出完整文件名。

{% note warning %}
因为`.desktop` 不是 Shell 脚本，不能指望 `Icon=~/Pictures/icon.png` 或 `Icon=$HOME/Pictures/icon.png` 自动展开。
{% endnote %}

### 图标主题与 hicolor

图标主题把图片按尺寸、用途等组织起来，例如：

```text
/usr/share/icons/hicolor/
├── index.theme
├── 48x48/apps/com.eusoft.eudic.png
├── 256x256/apps/com.eusoft.eudic.png
└── scalable/apps/com.eusoft.eudic.svg
```

上面是目录结构示意，不要求一个应用同时提供这些文件。`apps` 表示应用图标，`256x256` 表示相应尺寸，`scalable` 通常用于 SVG 等可缩放图片。

按图标名查找时，桌面环境先查询当前主题，再查询继承的主题，并以 `hicolor` 作为必需的兜底主题；主题中仍找不到时，还会尝试非主题图标位置，其中包括 `/usr/share/pixmaps`。

如果要给当前用户补充图标，可以放在：

```text
~/.local/share/icons/hicolor/256x256/apps/com.eusoft.eudic.png
```

尺寸目录应当与实际图片尺寸相符。把图片复制到 `256x256` 目录，并不会自动把它缩放到 256 × 256。

## 窗口如何对应到启动项

### X11 与 XWayland：WM_CLASS

X11 窗口通过 `WM_CLASS` 提供身份信息，其中包含两个字符串，分别是 instance 和 class，用于标识应用实例和应用类别。

在终端运行：

```bash
xprop WM_CLASS
```

然后点击目标窗口，就能读取这个属性。典型输出形如：

```text
WM_CLASS(STRING) = "example", "Example"
```

GNOME 可以用这些值查找启动项文件名，也可以匹配 `.desktop` 中的 `StartupWMClass`。例如 Eudic 的那次问题中，实际确认有效的配置是：

```ini
StartupWMClass=eudic
```

它的意思是为具有这个身份的窗口提供启动项匹配线索，并不会修改窗口自身的 `WM_CLASS`。填写时应保留实际值的大小写，不要根据应用的显示名称猜测。

还需要区分**桌面会话使用的协议**与**某个应用使用的协议**。即使登录的是 GNOME Wayland，会话中的旧应用仍可以通过 XWayland 运行。这些应用依然使用 X11 的窗口属性，所以 `xprop` 仍然有效；Eudic 当时就是这种情况。

### 原生 Wayland：app_id

原生 Wayland 窗口不能用 `xprop` 查询。对于常见的 `xdg-shell` 窗口，应用通过 `xdg_toplevel.set_app_id` 设置身份。协议建议这个 `app_id` 与 `.desktop` 文件去掉扩展名后的名称一致，例如：

```text
窗口 app_id：org.example.Viewer
启动项文件：org.example.Viewer.desktop
```

这样合成器就可以把窗口与桌面入口对应起来。协议说明见 [xdg_toplevel.set_app_id](https://wayland.app/protocols/xdg-shell#xdg_toplevel:request:set_app_id)。

在 GNOME 中可以按 `Alt+F2`，输入 `lg`，打开内置调试工具 Looking Glass，可以在 Windows 页检查目标窗口及其关联的应用。

{% note info %}
如果不方便修改 `.desktop` 文件名称，在 GNOME 中也可以使用 `StartupWMClass=<app_id>` 进行设置。这个与 GNOME 使用的 Mutter 的实现方式有关，并非 Wayland 桌面通用的解决方案。
{% endnote %}


### 为什么名称不一致也可能正常
桌面环境通常并非只检查一个字段。它还会利用应用 ID、已知进程、启动通知、相关窗口等信息判断归属；如果始终找不到对应的桌面入口，则会为窗口建立临时的应用对象。这可以解释为什么同一软件从不同入口启动，或者升级后，图标会不同。

因此，`.desktop` 没有 `StartupWMClass` 本身不代表有问题。名称和身份原本能正确对应的应用，通常不需要额外补这个字段。


## 两次问题的修复

### Eudic：改了 Icon 仍然显示齿轮

当时系统中已经有：

```text
/usr/share/applications/eusoft-eudic.desktop
/usr/share/pixmaps/com.eusoft.eudic.png
```

把 `Icon=` 改成图片的绝对路径，并重启系统，运行后的图标仍然异常。后来确认 Eudic 通过 XWayland 运行，窗口匹配需要使用 `eudic`。

最后在用户启动项的 `[Desktop Entry]` 分组中添加 `StartupWMClass=eudic` 解决了问题。


### LocalSend：启动项名称与应用 ID 不一致

在 GNOME Wayland + Dash to Dock 环境中，通过 pacman 更新 archlinuxcn 软件包 `localsend 1.18.2-1` 打开后显示通用齿轮图标。排查记录中确认的情况是：

| 项目 | 实际值 |
| --- | --- |
| 系统启动项 | `/usr/share/applications/localsend.desktop` |
| 程序内置应用 ID | `org.localsend.localsend_app` |
| 图标文件 | 存在且正常 |
| 原启动项的 `StartupWMClass` | 未设置 |

解决方式：保留启动项文件名，创建用户启动项覆盖，然后在 `[Desktop Entry]` 分组中添加：

```ini
StartupWMClass=org.localsend.localsend_app
```

这里保留原文件名，是为了继续覆盖 `localsend.desktop`，避免额外创建第二个入口。对于应用开发者和打包者，更一致的做法是让应用报告的身份与安装的桌面入口名称相互对应。

## 排查顺序

| 现象 | 优先检查 |
| --- | --- |
| 应用列表中没有入口 | 启动项路径、格式，以及 `Hidden`、`NoDisplay` 等字段 |
| 应用列表中的图标就不正确 | 实际生效的启动项、`Icon` 和图片查找 |
| 启动器正常，运行后变成齿轮或多一个图标 | 窗口身份与启动项的匹配 |
| 应用识别正常，但换图后仍显示旧图片 | 图标主题缓存及桌面环境的内存状态 |

这个表是排查入口，不是仅凭外观就能得出的诊断。例如，应用列表与 Dock 都显示齿轮，可能同时涉及图片缺失和匹配失败。


