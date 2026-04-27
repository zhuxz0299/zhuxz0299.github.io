---
title: Arch Linux 软件安装与管理
cover: 'https://source.fomal.cc/img/default_cover_166.webp'
tags:
  - arch linux
  - pacman
  - aur
  - flatpak
  - appimage
description: Arch Linux 如何安装、卸载软件及其依赖，以及如何进行滚动更新
abbrlink: 59eaf47c
date: 2025-09-07 15:11:59
categories: [System & Hardware, Linux]

---

## Arch Linux 包管理器
Arch Linux 遵循 K.I.S.S. (Keep It Simple, Stupid) 原则，其包管理系统也是如此。

* 官方软件源 (Official Repositories)： 由 Arch Linux 官方团队和维护者打理的软件库，包含了核心的系统软件和大量流行软件。所有包都经过严格的依赖和安全性检查。
* Arch 用户软件源 (AUR - Arch User Repository)： 这是一个由社区驱动的软件库，包含了用户提交的成千上万的软件包构建脚本（称为 PKGBUILD）。AUR 中的软件没有经过官方审查，使用需要自行承担风险，但它是 Arch Linux 软件生态极其重要的一部分，几乎所有你能想到的软件都能在这里找到。

### pacman
pacman (package manager) 是 Arch Linux 官方、核心的包管理工具。它用于管理来自官方软件源 (core, extra, community) 的软件包。

#### 工作流程
1. 同步本地数据库：pacman 首先会从远程镜像服务器下载最新的软件包数据库（`/var/lib/pacman/sync/`），以便知道远程有哪些软件包及其版本。
   * 里面会包含例如 `archlinuxcn.db`, `core.db`, `extra.db`, `multilib.db` 这样的数据库文件。
2. 解决依赖关系：自动计算并列出所有需要安装的依赖项。
3. 下载软件包：从配置的镜像服务器（在 `/etc/pacman.d/mirrorlist` 中设置）下载所需的 `.pkg.tar.zst` 文件到缓存目录（`/var/cache/pacman/pkg/`）。
   * 这个缓存目录的作用为
     * 允许降级软件包 (Downgrade)：如果一个新版本的软件包出现了 Bug，或者与系统不兼容，用户可以轻松地从缓存中重新安装旧版本，而无需去其他地方寻找。
     * 加快重复安装速度、节省带宽
   * 清理缓存：
     * `sudo pacman -Sc`：只删除那些当前已安装软件包的旧版本，所有软件包的最新缓存版本仍然会被保留。
     * `sudo pacman -Scc`：清空整个缓存目录，删除所有软件包文件
4. 安装软件包：解压下载的包文件，将文件放置到系统的正确位置，并运行必要的安装后脚本。
5. 更新数据库：将已安装的软件包信息记录到本地数据库（`/var/lib/pacman/local/`），以便进行依赖查询、更新和卸载。

#### 命令参数大致含义
pacman 的命令结构可以看作是一个"主操作"后面跟着"子选项"的模式。

主操作 (Primary Operations)：命令的核心，通常是一个大写字母，且互斥（一次只能用一个）。
| 参数 | 来源 | 含义 |
| :--- | :--- | :--- |
| **`-S`** | **S**ync | **同步**。让本地系统与软件仓库同步，用于安装、更新软件。 |
| **`-Q`** | **Q**uery | **查询**。用于查询本地已安装的软件包数据库。 |
| **`-R`** | **R**emove | **删除**。从本地系统中移除软件包。 |
| **`-F`** | **F**iles | **文件**。查询远程软件包数据库中的文件（例如某个命令由哪个包提供）。 |
| **`-U`** | **U**pgrade | **升级**。安装一个本地的包文件（而非从仓库下载）。 |
| **`-V`** | **V**ersion | 显示 `pacman` 的版本信息。 |

子选项/修饰符 (Options/Modifiers)：这些是小写字母，用来修饰主操作，它们可以组合使用。
| 参数 | 来源 | 含义 | 常用组合示例 |
| :--- | :--- | :--- | :--- |
| **`-s`** | **S**earch | **搜索**。在包名和描述中进行搜索。 | `-Ss` (在仓库中搜索), `-Qs` (在已安装包中搜索) |
| **`-y`** | **Y**es | **是/刷新**。在操作前刷新远程软件包数据库。 | `-Sy` (刷新数据库), `-Syu` (刷新并更新系统) |
| **`-u`** | **U**pgrade | **升级**。列出或执行更新（列出可用的升级）。 | `-Syu` (执行全面系统更新), `-Qu` (列出可更新的包) |
| **`-c`** | **C**ache | **缓存**。对缓存进行操作。 | `-Sc` (清理缓存), `-Scc` (彻底清理缓存) |
| **`-s`** | Recur**s**ive | **递归**。通常指递归地处理依赖关系。 | `-Rs` (删除时同时删除不再需要的依赖) |
| **`-d`** | **D**ependencies | **依赖**。绕过依赖检查或操作依赖。 | `-Rdd` (强制删除一个包，即使它是其他包的依赖) |
| **`-n`** | **N**o | **不/否定**。通常指不操作或同时操作配置文件。 | `-Rns` (删除包、依赖以及配置文件) |

#### 常用命令
安装：
```bash
# 安装单个或者一系列软件包
sudo pacman -S package_name_1 package_name_2 ... 
# 安装软件包组，例如 sudo pacman -S gnome
sudo pacman -S package_group 
```

删除：
```bash
# 删除单个软件包，保留其全部已经安装的依赖关系
sudo pacman -R package_name 
# 删除指定软件包，及其所有没有被其他已安装软件包使用的依赖关系
sudo pacman -Rs package_name 
# 要删除软件包和所有依赖这个软件包的程序 (此操作是递归的，请小心检查，可能会一次删除大量的软件包)
sudo pacman -Rsc package_name
# pacman 删除某些程序时会备份重要配置文件，在其后面加上*.pacsave扩展名。-n 选项可以避免备份这些文件
sudo pacman -Rn package_name
```

升级：
```bash
sudo pacman -Syu
```

查询：
```bash
# 在包数据库中查询软件包，查询内容包含了软件包的名字和描述
sudo pacman -Ss string1 string2 ...
# 有时，-s的内置正则会匹配很多不需要的结果，所以可以自己设定正则
sudo pacman -Ss '^vim-'
# 要查询已安装的软件包
sudo pacman -Qs string1 string2 ...
# 显示软件包的详尽的信息
sudo pacman -Si package_name
# 查询本地安装包的详细信息
sudo pacman -Qi package_name
# 按文件名查找软件库 （例如有一个命令叫wg，该方法可以查到哪个软件包包含了该命令）
sudo pacman -F string1 string2 ...
```

### yay
yay (Yet another Yogurt) 是一个流行的 AUR 助手。它本身就是一个来自 AUR 的软件包。它不是 pacman 的替代品，而是一个封装了 pacman 功能的智能 wrapper。同时 yay 与 pacman 的参数基本类似，只是作用域除了官方仓库之外还包含了 AUR。

#### 工作流程：
1. 与 AUR 交互：yay 通过 AUR 的 RPC 接口查询和搜索软件包。
2. 下载 PKGBUILD：当选择安装一个 AUR 包时，yay 会从 AUR 下载该软件的 PKGBUILD（一个构建脚本）和一些必要的文件（如补丁）。
3. 验证与构建：它会在一个临时目录中检查文件的完整性，然后使用 `makepkg` 工具按照 PKGBUILD 的指示自动编译源代码。
4. 调用 Pacman：构建成功后，会生成一个标准的 `.pkg.tar.zst` 包。yay 随后会调用 pacman 来安装这个新生成的包，就像安装官方软件源中的包一样。
5. 依赖处理：yay 会自动处理 AUR 包可能依赖的其他 AUR 包。

可以注意到，由于 yay 最后依然是使用 pacman 安装的包，因此通过 yay 安装到本地的软件也是可以通过 `sudo pacman -Q` 来查询的。


## Flatpak 与 AppImage
Flatpak 和 AppImage 都是被设计为跨发行版的软件打包和分发格式。

### Flatpak
Flatpak 通过两个关键概念实现跨平台：
* 运行时 (Runtime)：这是一个包含基础依赖（如 glibc、GTK、Qt 等）的独立环境 （如 `Freedesktop`, `GNOME`, `KDE`）。应用开发者指定其应用需要哪个运行时（例如 `org.freedesktop.Platform`）。
* 沙盒 (Sandbox)：应用在运行时内部的一个受控环境中运行，与主机系统隔离。

这意味着：只要目标 Linux 发行版安装了 Flatpak 和所需的运行时，任何为该运行时构建的 Flatpak 应用就都能运行。用户不需要担心系统上是 Ubuntu 22.04 还是 Arch Linux，或是 Fedora 39，只要运行时版本一致，应用的行为就是一致的。不过 Flatpak 应用及其运行时可能占用较多空间，建议定期执行 `flatpak uninstall --unused` 清理。

#### Flatpak 常用命令
| 功能类别         | 常用命令                                                                 | 说明                                                                         |
| :--------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **配置**    | `flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo` | 添加主要的 Flathub 远程仓库。                                                |
| **应用管理**     | `flatpak search <应用名>`                                                | 搜索应用（例如 `flatpak search gimp`）。                                     |
|                  | `flatpak install <仓库名> <应用ID>` 或 `flatpak install <应用ID>`        | 从指定仓库（如 flathub）或默认仓库安装应用。                                 |
|                  | `flatpak run <应用ID>`                                                   | 运行已安装的应用。                                                           |
|                  | `flatpak update`                                                         | 更新所有已安装的应用和运行时。                                               |
|                  | `flatpak update <应用ID>`                                                | 更新特定应用。                                                               |
|                  | `flatpak list`                                                           | 列出所有已安装的应用和运行时。                                               |
|                  | `flatpak uninstall <应用ID>`                                             | 卸载特定应用。                                                               |
|                  | `flatpak uninstall --unused`                                             | **清理空间**：卸载所有未使用的运行时和扩展。                                 |
| **信息查询**     | `flatpak info <应用ID>`                                                  | 显示已安装应用的详细信息（版本、分支、权限等）。                             |
|                  | `flatpak history`                                                        | 查看 Flatpak 的操作历史（安装、更新、卸载等）。                               |
| **权限与管理**   | `flatpak override <应用ID> --nofilesystem=home`                          | 示例：撤销应用对 home 目录的访问权限。                                        |
|                  | `flatpak permissions`                                                    | 列出应用的权限设置。                                                         |


#### Flatpak 运行时
由于不同的 Flatpak 应用可能会依赖于同一个运行时的不同版本，因此出现安装了多个相同运行时是正常的。例如：
```
# flatpak list
名称                                         应用程序 ID                                         版本                           分支             安装
Gradia                                       be.alexandervanhee.gradia                           1.10.1                         stable           system
Google Chrome                                com.google.Chrome                                   140.0.7339.80-1                stable           system
扩展管理器                                    com.mattjakeman.ExtensionManager                    0.6.3                          stable           system
Moonlight                                    com.moonlight_stream.Moonlight                      6.1.0                          stable           system
OBS Studio                                   com.obsproject.Studio                               31.1.2                         stable           system
Pins                                         io.github.fabrialberio.pinapp                       2.4.2                          stable           system
Freedesktop Platform                         org.freedesktop.Platform                            freedesktop-sdk-24.08.24       24.08            system
Mesa                                         org.freedesktop.Platform.GL.default                 25.2.1                         24.08            system
Mesa (Extra)                                 org.freedesktop.Platform.GL.default                 25.2.1                         24.08extra       system
nvidia-580-82-07                             org.freedesktop.Platform.GL.nvidia-580-82-07                                       1.4              system
Intel VAAPI driver                           org.freedesktop.Platform.VAAPI.Intel                                               24.08            system
openh264                                     org.freedesktop.Platform.openh264                   2.5.1                          2.5.1            system
Freedesktop SDK                              org.freedesktop.Sdk                                 freedesktop-sdk-24.08.24       24.08            system
GNOME Application Platform version 48        org.gnome.Platform                                                                 48               system
Adwaita theme                                org.kde.KStyle.Adwaita                                                             6.8              system
Adwaita theme                                org.kde.KStyle.Adwaita                                                             6.9              system
KDE Application Platform                     org.kde.Platform                                                                   6.8              system
KDE Application Platform                     org.kde.Platform                                                                   6.9              system
Okular                                       org.kde.okular                                      25.08.0                        stable           system
Firefox                                      org.mozilla.firefox                                 142.0.1                        stable           system
Refine                                       page.tesk.Refine                                    0.5.10                         stable           system
```

可以发现其中有两个相同的 `KDE Application Platform`。

### AppImage
一个文件 = 一个应用：
* 开发者将应用本身及其所有依赖库全部打包进一个单独的可执行文件。
* 这个文件不依赖于系统安装的任何库（除了最最基础的，如 fuse2，或者它也可以自带）。
* 用户下载后，不需要“安装”，只需赋予它执行权限 (chmod +x)，然后双击或通过终端即可运行。

## GNOME Software
GNOME Software 是一个聚合中心，它的"已安装"标签页会显示来自多个不同来源的软件，主要包括：
* 系统原生包：通过 `apt` (Debian/Ubuntu)、`dnf` (Fedora/RHEL)、`pacman` (Arch) 等系统自带的包管理器安装的软件。这些是传统、最常见的软件安装方式。
* Flatpak 包：通过 Flathub 或其他 Flatpak 仓库安装的软件。
  * 例如：在 GNOME Software 里安装了 Firefox 的 Flatpak 版，它会出现在这里。
* Snap 包：如果发行版支持 Snap（如 Ubuntu），那么通过 Snap 安装的软件也会显示在这里。

### 如何找到应用程序
GNOME Software 依赖于 `.desktop` 文件来识别应用程序。当你用 pacman 卸载软件时，如果某个 `.desktop` 文件没有被正确清理，它就会继续显示在软件中心里，尽管软件本身已经被移除。

除此之外，如果使用命令行删除了某个软件，却发现 GNOME Software 中依然存在，还有可能是缓存的问题：GNOME Software 可能没有及时更新它的应用程序列表缓存，导致仍然显示已卸载的软件。可以运行
```bash
sudo update-desktop-database
```

来解决问题。