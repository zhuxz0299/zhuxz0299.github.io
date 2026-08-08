---
title: Linux 软件安装与管理
cover: https://source.fomal.cc/img/default_cover_121.webp
tags:
  - arch-linux
  - fedora
  - pacman
  - dnf
  - aur
  - flatpak
  - appimage
  - yay
description: Arch Linux 与 Fedora 如何使用 pacman、dnf 安装、卸载、查询及更新软件
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

#### 命令参数含义
pacman 的命令结构可以看作是一个"主操作"后面跟着"操作选项"的模式。主操作决定 pacman 要处理哪一类事务，后面的选项则在这个主操作的语境里生效。

日常常用的大致如下：

| 主操作 | 常用组合/子选项 | 官方长选项 | 含义 |
| :--- | :--- | :--- | :--- |
| **`-S`** | `pacman -S package` | `--sync` | 从软件仓库安装软件包。 |
|  | `-s` / `pacman -Ss keyword` | `--search` | 在仓库中搜索软件包。 |
|  | `-y` / `pacman -Sy` | `--refresh` | 刷新本地同步数据库；一般不要单独用，通常配合 `-u`。 |
|  | `-u` / `pacman -Syu` | `--sysupgrade` | 刷新数据库并升级整个系统，这是 Arch 上最常见的升级方式。 |
|  | `-c` / `pacman -Sc` | `--clean` | 清理缓存；`-Scc` 会清理得更彻底。 |
| **`-Q`** | `pacman -Q` | `--query` | 查询本地已安装的软件包。 |
|  | `-s` / `pacman -Qs keyword` | `--search` | 在已安装的软件包中搜索。 |
|  | `-i` / `pacman -Qi package` | `--info` | 查看已安装软件包的详细信息。 |
|  | `-l` / `pacman -Ql package` | `--list` | 列出某个已安装软件包包含的文件。 |
|  | `-o` / `pacman -Qo file` | `--owns` | 查询本机某个文件属于哪个已安装软件包。 |
|  | `-dt` / `pacman -Qdt` | `--deps` + `--unrequired` | 列出不再被需要的依赖包，常用于清理孤儿包。 |
| **`-R`** | `pacman -R package` | `--remove` | 删除软件包，但保留其依赖。 |
|  | `-s` / `pacman -Rs package` | `--recursive` | 删除软件包，并删除不再被其他包需要的依赖。 |
|  | `-n` / `pacman -Rns package` | `--nosave` | 删除时不保留 `.pacsave` 配置备份；常和 `-s` 一起用。 |
|  | `-c` / `pacman -Rsc package` | `--cascade` | 连同依赖目标包的其他包一起删除，影响范围可能很大，慎用。 |
| **`-F`** | `pacman -F file` | `--files` | 查询文件数据库，查某个文件由哪个仓库包提供。 |
|  | `-y` / `pacman -Fy` | `--refresh` | 刷新文件数据库，使用 `-F` 前可能需要先执行。 |
| **`-U`** | `pacman -U package_file` | `--upgrade` | 从本地包文件或 URL 安装、升级软件包。 |

官方说明见 `man pacman` 或 Arch 手册页：[pacman(8)](https://man.archlinux.org/man/pacman.8.en)。

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

## Fedora 包管理器 - dnf
Fedora 使用 RPM 软件包，默认的命令行包管理器是 DNF。标准 Fedora 系统主要从 `fedora` 和 `updates` 等官方仓库获取软件，也可以添加第三方仓库。仓库通常由 `/etc/yum.repos.d/` 下的 `.repo` 文件定义。


### 工作流程
1. 读取配置与仓库：DNF 读取主配置文件 `/etc/dnf/dnf.conf` 和已启用的仓库配置。
2. 更新元数据：仓库元数据过期时会自动刷新，也可以通过 `--refresh` 强制刷新。root 用户的系统级缓存默认位于 `/var/cache/libdnf5/`；普通用户进行查询时，默认使用 `~/.cache/libdnf5/`。
3. 解决依赖：计算需要安装、更新或删除的软件包，检查冲突，然后向用户展示完整的事务摘要。
4. 下载并执行事务：下载所需的 `.rpm` 文件，校验后一次性执行安装、更新或卸载。DNF5 默认设置 `keepcache=0`，成功完成事务后不会长期保留已下载的软件包，这一点与 pacman 不同。
5. 记录结果：已安装软件包的状态记录在 `/usr/lib/sysimage/rpm/` 中，DNF5 的事务历史则保存在 `/usr/lib/sysimage/libdnf5/transaction_history.sqlite`，可以使用 `dnf history` 查询。

### 命令结构
DNF 使用 `dnf <子命令> [选项] [软件包]` 的结构。查询操作通常不需要 root 权限，修改系统中的软件则需要使用 `sudo`。

日常常用的命令大致如下：

| 子命令 | 常用命令/选项 | 含义 |
| :--- | :--- | :--- |
| **`install`** | `dnf install package` | 从仓库安装软件包，也可安装本地 `.rpm` 文件。 |
| **`remove`** | `dnf remove package` | 卸载软件包；默认同时删除不再被需要、且原本作为依赖安装的包。 |
|  | `--no-autoremove` | 本次卸载保留不再被需要的依赖。 |
| **`upgrade`** | `dnf upgrade` | 更新所有已安装的软件包。 |
|  | `--refresh` | 在执行命令前强制刷新仓库元数据。 |
| **`search`** | `dnf search keyword` | 按名称和摘要搜索软件包；加 `--all` 还会搜索描述和 URL。 |
| **`list`** | `dnf list --installed` | 列出已安装的软件包。 |
|  | `dnf list --available` | 列出仓库中可用的软件包。 |
|  | `dnf list --upgrades` | 列出可更新的软件包。 |
| **`info`** | `dnf info package` | 查看已安装或仓库内软件包的详细信息。 |
| **`repoquery`** | `dnf repoquery --installed package` | 查询已安装的软件包。 |
|  | `dnf repoquery --installed --files package` | 列出某个已安装软件包包含的文件。 |
|  | `dnf repoquery --unneeded` | 列出不再被需要的依赖包。 |
| **`provides`** | `dnf provides '*/command'` | 查询哪个已安装或仓库内的包提供某个文件。 |
| **`autoremove`** | `dnf autoremove` | 删除所有不再被需要、且原本作为依赖安装的软件包。 |
| **`clean`** | `dnf clean packages` | 清理下载的软件包缓存。 |
|  | `dnf clean metadata` / `dnf clean all` | 清理仓库元数据，或清理所有 DNF 缓存。 |
| **`history`** | `dnf history list` / `dnf history info ID` | 列出事务历史，或查看某次事务的详情。 |
|  | `dnf history undo ID` | 尝试撤销指定事务；如果旧版软件已不在仓库中，可能无法完成。 |
| **`repo list`** | `dnf repo list --all` | 列出已启用和已禁用的软件仓库。 |

完整说明可以查看 `man dnf5`；每个子命令也有独立的帮助，例如 `dnf install --help`。

### 常用命令
安装：
```bash
# 安装单个或多个软件包
sudo dnf install package_name_1 package_name_2 ...
# 安装本地的 RPM 软件包，并自动解决仓库中的依赖
sudo dnf install ./package_name.rpm
# 安装软件包组
sudo dnf group install group_name
```

删除：
```bash
# 删除软件包，并自动删除不再需要的依赖
sudo dnf remove package_name
# 删除软件包，但保留其不再被需要的依赖
sudo dnf remove --no-autoremove package_name
# 清理所有不再被需要的依赖
sudo dnf autoremove
```

升级：
```bash
# 强制刷新仓库元数据，并更新所有已安装的软件包
sudo dnf upgrade --refresh
```

查询：
```bash
# 搜索软件包
dnf search keyword
# 查看软件包详细信息
dnf info package_name
# 列出已安装的软件包
dnf list --installed
# 列出某个已安装软件包包含的文件
dnf repoquery --installed --files package_name
# 查询哪个软件包提供指定命令，例如 wg
dnf provides '*/wg'
```


## Flatpak 与 AppImage
Flatpak 和 AppImage 都是被设计为跨发行版的软件打包和分发格式。

### Flatpak
Flatpak 通过两个关键概念实现跨平台：
* 运行时 (Runtime)：这是一个包含基础依赖（如 glibc、GTK、Qt 等）的独立环境 （如 `Freedesktop`, `GNOME`, `KDE`）。应用开发者指定其应用需要哪个运行时（例如 `org.freedesktop.Platform`）。
* 沙盒 (Sandbox)：应用在运行时内部的一个受控环境中运行，与主机系统隔离。

这意味着：只要目标 Linux 发行版安装了 Flatpak 和所需的运行时，任何为该运行时构建的 Flatpak 应用就都能运行。用户不需要担心系统上是 Ubuntu 22.04 还是 Arch Linux，或是 Fedora 39，只要运行时版本一致，应用的行为就是一致的。不过 Flatpak 应用及其运行时可能占用较多空间，建议定期执行 `flatpak uninstall --unused` 清理。

#### Flatpak remote 与软件源
Flatpak 中的 `remote` 可以理解为 Flatpak 的软件源或远程仓库。应用、运行时、扩展主题等内容都可以来自某个 remote。最常见的 remote 是 [Flathub](https://flathub.org/)，很多桌面应用都会优先发布到这里。

一个系统可以同时配置多个 remote，例如 Flathub、某个软件项目自己的仓库、公司内部仓库等。每个 remote 都有自己的名称和地址，例如常见的 remote 名称是 `flathub`，它背后对应一个仓库 URL。安装应用时可以显式指定来源：

```bash
flatpak install flathub org.mozilla.firefox
```

这里的 `flathub` 就是 remote 名称，`org.mozilla.firefox` 是应用 ID。如果不指定 remote，Flatpak 会根据已配置的软件源和搜索结果让你选择。

对于同一个 remote，还可以把它的 URL 改成镜像站地址。例如把 `flathub` 的下载地址换成中科大镜像：

```bash
flatpak remote-modify flathub --url=https://mirrors.ustc.edu.cn/flathub
```

这和“新增一个 remote”不是一回事。新增 remote 会让 Flatpak 把它当成另一个独立的软件源；而镜像通常只是同一个仓库内容的另一份同步副本，应用 ID、分支、commit 等信息仍然属于原来的 Flathub 仓库。把已有的 `flathub` remote 改成镜像 URL 后，原本从 `flathub` 安装的应用和运行时，后续搜索、安装、更新、回退版本时都会继续使用这个 remote 名称，只是实际下载地址换成了镜像站。

#### Flatpak 常用命令
| 功能类别         | 常用命令                                                                 | 说明                                                                         |
| :--------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **配置**    | `flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo` | 添加主要的 Flathub 远程仓库。                                                |
|                  | `flatpak remote-modify flathub --url=<镜像地址>`                         | 修改某个 remote 的 URL，例如把 Flathub 改为镜像源。                          |
|                  | `flatpak remotes`                                                        | 查看已经配置的 remote。                                                      |
|                  | `flatpak remotes --show-details`                                         | 查看 remote 的地址、优先级等详细信息。                                      |
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
... (省略掉一些)
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
