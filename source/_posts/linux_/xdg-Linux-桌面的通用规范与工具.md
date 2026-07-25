---
title: XDG-Linux 桌面的通用规范与工具
abbrlink: fc95dfca
date: 2026-07-24 14:35:22
cover: https://source.fomal.cc/img/default_cover_154.webp
categories:
  - System & Hardware
  - Linux
tags:
  - linux
  - xdg
  - freedesktop
  - xdg-utils
  - mime
description: 介绍 XDG 的由来与 Base Directory 目录规范，并梳理 xdg-utils 如何在不同 Linux 桌面环境中管理 MIME 类型、默认应用和文件打开方式。
---

{% note info %}
主要参考：
- [XDG-gentoo wiki](https://wiki.gentoo.org/wiki/XDG)
- [Welcome to freedesktop.org](https://www.freedesktop.org/wiki/)
- [ArchWiki - XDG Base Directory](https://wiki.archlinux.org/title/XDG_Base_Directory)
- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/latest/)
- [ArchWiki - XDG user directories](https://wiki.archlinux.org/title/XDG_user_directories)
- [ArchWiki - xdg-utils](https://wiki.archlinux.org/title/Xdg-utils)
- [ArchWiki - XDG Desktop Portal](https://wiki.archlinux.org/title/XDG_Desktop_Portal)
{% endnote %}

## XDG 是什么
XDG 是 X Desktop Group 的缩写，目前是 freedesktop.org 体系下的一组跨桌面规范、约定和工具的统称。由于当前的桌面协议不仅仅有 X11，Wayland 也被更加广泛的使用，因此 freedesktop.org 现在将 XDG 解释为 Cross-Desktop Group。

## XDG Base Directory
这个规范和 FHS 有点类似，不过它主要是在用户的层级规定各种文件应该放在哪些文件夹下。XDG Base Directory Specification 的总体思路为，将文件进行分类，每种类别对应一个环境变量，而每个环境变量通常有默认值，这个默认值就是 XDG 设定的默认路径；同时还有一些环境变量定义的是搜索路径。

### 用户文件夹

- `$XDG_CONFIG_HOME`
    - 用户级别的配置文件写入的地方 (类似于 `/etc`).
    - 默认为 `$HOME/.config`
    - 早期的应用通常直接将配置文件作为 dotfile 放在 `$HOME` 目录下，目前很多应用已经转向 XDG 标准
- `$XDG_CACHE_HOME`
    - 用户级别的缓存写入的地方 (类似于 `/var/cache`).
    - 默认为 `$HOME/.cache`
- `$XDG_DATA_HOME`
    - 用户级别的数据文件写入的地方 (类似于 `/usr/share`).
    - 默认为 `$HOME/.local/share`
    - 例如由 `uv` 下载的 python 就会放到这底下；从 Windows 复制过来的字体文件也通常推荐放到这底下
- `$XDG_STATE_HOME`
    - 用户级别的状态文件写入的地方 (类似于 `/var/lib`).
    - 默认为 `$HOME/.local/state`
- `$XDG_RUNTIME_DIR`
    - 用来放一些用户级的运行时数据，默认由 `pam_systemd` 设置
    - `pam_systemd` 将其设置为 `/run/user/$UID`
- `$HOME/.local/bin`
    - 存放用户级别的可执行文件的地方
    - Note: 没有 `$XDG_BIN_HOME` 这个环境变量

### 系统文件夹

- `$XDG_DATA_DIRS`
  - 定义了在 `$XDG_DATA_HOME` 基础目录之外搜索数据文件时按优先级排序的基础目录集合
  - 默认为 `/usr/local/share/:/usr/share/`
- 定义了在 `$XDG_CONFIG_HOME` 基础目录之外搜索配置文件的偏好顺序基础目录集合
  - 默认为 `/etc/xdg`

## xdg-utils
xdg-utils 提供了用于管理 XDG MIME 应用程序的官方工具集。

{% note info %}
MIME 是什么：MIME 的全称是 Multipurpose Internet Mail Extensions，直译为 多用途互联网邮件扩展。

它最初是为电子邮件设计的，用来描述附件或正文内容的类型，例如：`text/plain`, `text/html`, `image/png`, `application/pdf`。后来 MIME 类型被广泛用于 Web、桌面系统和文件管理器，不再只和邮件有关。它现在可以理解为一种标准化的“内容类型标识”。
{% endnote %}

### xdg-utils 下的具体工具
- xdg-desktop-menu - 安装桌面菜单项
- xdg-desktop-icon - 将桌面条目复制到用户的桌面
- xdg-email - 在用户首选的电子邮件客户端中撰写新邮件，可预先填写主题及其他信息
- xdg-icon-resource - 安装图标资源
- xdg-mime - 查询与安装 MIME 类型及关联
- xdg-open - 在用户首选应用程序中打开文件或 URI
- xdg-screensaver - 启用、禁用或暂停屏幕保护程序
- xdg-settings - 获取或设置默认网页浏览器及 URL 处理器

大部分工具平时基本不会手动调用，例如安装桌面菜单、复制 `.desktop` 文件到桌面、安装图标资源等工作通常会由安装程序自动执行。 

### 识别桌面使用的环境变量

xdg-utils 通过以下顺序检查桌面环境变量来判断当前使用的桌面，用于后续调用特定桌面工具（例如在 GNOME 中 `xdg-mime` 和 `xdg-open` 调用的工具都是 `gio`）：
1. 检查标准环境变量 `XDG_CURRENT_DESKTOP`
2. 检查传统的 fallback 或者查看是否存在某些桌面自定义的专有环境变量
   * 例如 KDE 会设置 `KDE_FULL_SESSION=true`
3. 检查遗留变量 `DESKTOP_SESSION`

如果上述变量被检测到，xdg-utils 会设置变量 `DE` 为对应桌面；若上述变量均未被检测到，则用户可以手动设置 `DE`。

各个桌面与环境变量的对应关系如下表：

| Desktop Environment    | `XDG_CURRENT_DESKTOP`                      | `DE`            | `DESKTOP_SESSION`               |
| ---------------------- | ------------------------------------------ | --------------- | ------------------------------- |
| –                      | `X-Generic`                                | `generic`       | –                               |
| Cinnamon               | `Cinnamon`, `X-Cinnamon`                   | `cinnamon`      | –                               |
| Deepin                 | `Deepin`, `DEEPIN`, `deepin`               | `deepin`        | –                               |
| Enlightenment          | `ENLIGHTENMENT`                            | `enlightenment` | –                               |
| GNOME                  | `GNOME`                                    | `gnome`         | `gnome`                         |
| GNOME Flashbackashback | `GNOME-Flashback`, `GNOME-Flashback:GNOME` | `gnome`         | `gnome`                         |
| KDE Plasmaasma         | `KDE`                                      | `kde`           | –                               |
| LXDE                   | `LXDE`                                     | `lxde`          | `LXDE`                          |
| LXQt                   | `LXQt`                                     | `lxqt`          | –                               |
| MATE                   | `MATE`                                     | `mate`          | `mate`                          |
| Xfce                   | `XFCE`                                     | `xfce`          | `xfce`, `xfce4`, `Xfce Session` |

### xdg-mime
`xdg-mime` 支持：
1. 查询文件属于什么 MIME 类型
   * 例如 `xdg-mime query filetype photo.jpg`，输出可能为 `image/jpeg`
2. 查询某种 MIME 类型的默认应用
   * 例如 `xdg-mime query default image/jpeg`，输出可能为 `org.kde.gwenview.desktop`
3. 设置某种 MIME 类型的默认应用
   * 例如 `xdg-mime default org.kde.dolphin.desktop inode/directory`

`xdg-mime` 建立的是 MIME 类型与 `.desktop` 应用入口之间的关联，而非直接把文件扩展名绑定到可执行程序。
* 例如 `org.kde.gwenview.desktop` 就是一个 `.desktop` 文件的文件名，也是其 Desktop File ID
* 上述 `.desktop` 文件的搜索路径是 `$XDG_DATA_HOME/applications/` 以及 `$XDG_DATA_DIRS` 中每个目录的 `applications/` 子目录，展开默认环境变量之后有搜索顺序：
  1. `~/.local/share/applications/`
  2. `/usr/local/share/applications/`
  3. `/usr/share/applications/`

#### xdg-mime 的实际调用工具
`xdg-mime` 在查询某个文件的 MIME 类型时，会调用桌面环境下对应的工具：


| Desktop Environment    | Program           |
| ---------------------- | ----------------- |
| Cinnamon               | `gio`             |
| GNOME                  | `gio`             |
| GNOME Flashbackashback | `gio`             |
| LXDE                   | `gio`             |
| MATE                   | `gio`             |
| Xfce                   | `gio`             |
| Deepin                 | -                 |
| Enlightenment          | -                 |
| LXQt                   | -                 |
| KDE Plasmaasma         | `kmimetypefinder` |

如果没有专用工具，会进入通用处理路径：
1. 如果系统中存在 `mimetype`，则使用
2. 如果系统中存在 `file`，则使用

### xdg-open
`xdg-open` 同样也是调用底层的工具工作：

| Desktop Environment | Program              |
| ------------------- | -------------------- |
| Cinnamon            | `gio`                |
| GNOME               | `gio`                |
| GNOME Flashback     | `gio`                |
| MATE                | `gio`                |
| Deepin              | `dde-open`           |
| Enlightenment       | `enlightenment_open` |
| KDE Plasma          | `kde-open`           |
| LXDE                | `pcmanfm`            |
| LXQt                | –                    |
| Xfce                | `exo-open`           |

假如没有专用打开工具，同样也进入通用路径：
1. 通过 `xdg-mime` 查询该文件类型对应的默认 `.desktop` 应用，运行 `.desktop` 文件中的启动命令
2. 使用 `run-mailcap` 工具
3. 使用 `mimeopen` 工具

### xdg-settings
用于设置默认浏览器以及某个 URI scheme 的默认处理应用：
- `xdg-settings set default-web-browser org.mozilla.firefox.desktop`
- `xdg-settings set default-url-scheme-handler mailto net.thunderbird.Thunderbird.desktop`
