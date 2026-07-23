---
title: FHS-Filesystem Hierarchy Standard
abbrlink: ca5c3d69
date: 2026-07-22 18:25:26
cover: https://source.fomal.cc/img/default_cover_153.webp
categories:
  - System & Hardware
  - Linux
tags:
  - linux
  - fhs
  - filesystem
  - directory
description: 介绍 FHS 对 Unix-like 系统目录结构的分类原则、三种软件布局，以及 Linux 根目录下各主要目录的用途。
---

{% note info %}
官方文档：[HFS 3.0](https://specifications.freedesktop.org/fhs/latest/index.html)，[HFS 4.0 草案](https://fhs.pages.freedesktop.org/-/fhs-spec/-/jobs/93479708/artifacts/build/fhs/xmlto-html/fhs-multipage.html)。前者的内容部分有些过时，后者还未完成，因此本文同时参考两者。
{% endnote %}

## FHS 的内容与目的
FHS 是 Filesystem Hierarchy Standard，它规定了在 UNIX-like 操作系统中，各类文件和目录原则上应当放在哪里，即 `/run`、`/tmp`、`/opt`、`/srv` 等目录各自承担什么职责。其官网定义为：
> This standard consists of a set of requirements and guidelines for file and directory placement under UNIX-like operating systems. 

FHS 希望让用户或者程序看到一个文件的用途，大致就能知道它应该在哪里；看到一个目录，也能大致知道里面是什么。其官网描述为：
> This standard enables:
> * Software to predict the location of installed files and directories, and
> * Users to predict the location of installed files and directories.

## FHS 划分的基本思路
以下为 FHS 4.0 草案的划分规则：
| 分类                                   | 含义               |
| ------------------------------------ | ---------------- |
| Shareable / machine-specific         | 能否被多台机器共同使用      |
| Executable / data                    | 能否直接作为程序执行       |
| Architecture-dependent / independent | 是否依赖 CPU 架构或 ABI |
| Static / mutable                     | 正常运行过程中是否会变化     |


其中：
* static 又分为固定文件(fixed)和管理员可编辑(editable)的配置
  * 由这个划分规则：`/usr` 里面主要是静态且不应当手动编辑的文件；`/etc` 里面则是静态的且可以由系统管理员配置的文件
* mutable 又分为持久状态(persistent)、短暂运行状态( transient)和临时文件(temporary)
  * 由这个划分规则：可变的长期状态放在 `/var`（例如安装包 cache）；本次启动的状态放在 `/run`；普通临时文件放在 `/tmp`

## 三种软件布局
这个是 FHS 4.0 草案相比 3.0 的改进：不再假设所有 Unix 系统必须使用同一棵软件目录树，而是引入了 profile。发行版可以选择不同的软件安装布局，但仍遵循相同的文件分类原则。

### Merged `/usr`
应该是现代 Linux 发行版最常见的布局。

Merged `/usr` 将发行版提供的软件统一安装到 `/usr`：

```
/usr/bin
/usr/sbin
/usr/libexec
/usr/include
/usr/lib
/usr/share
```

为了兼容旧程序，发行版可以继续提供 `/bin`、`/sbin` 和 `/lib`，但通常是软链接：

```
/bin   -> usr/bin
/sbin  -> usr/sbin
/lib   -> usr/lib
```

某些发行版还会进一步合并：

```
/usr/sbin    -> bin
/usr/libexec -> lib
```

### Split `/usr`
传统布局，FHS 3.0 里面默认就是这种布局。

```
/bin       启动早期和救援所需程序
/usr/bin   其余普通程序

/sbin      启动早期和救援所需管理程序
/usr/sbin  其余管理程序

/lib       /bin、/sbin 所需基础库
/usr/lib   其余库
```

这种布局主要源于早期系统没有初始内存盘（initial ramdisk，应该就是 `initramfs`），因此在 `/usr` 尚未挂载时，根文件系统必须包含足够的命令和库来完成启动和挂载操作。（来源：[Rationale](https://fhs.pages.freedesktop.org/-/fhs-spec/-/jobs/93479708/artifacts/build/fhs/xmlto-html/ch05s03.html#:~:text=Rationale)）


### Store-based
相对比较小众，典型代表为 `NixOS`。

Store-based 布局给每个软件包分配独立的安装前缀，例如：

```
/nix/store/<hash>-package
/gnu/store/<hash>-package
/store/<package>
```

不同版本或不同构建参数的软件可以同时存在：

```
/nix/store/abc123-gcc-14
/nix/store/def456-gcc-15
```

系统再通过：

* `PATH`；
* 库搜索路径；
* 符号链接集合，即 symlink farm；
* 每个服务或用户的独立环境；

向程序和用户提供统一的软件视图。

## 根目录中的主要目录
{% note primary %}
这一章主要基于 Merged `/usr` 布局考虑。
{% endnote %}

### `/boot`：启动所需文件
保存 bootloader 在启动过程中需要读取的内容，具体内容在 [boot 文件夹与 EFI 分区](https://zhuxz0299.github.io/posts/36b44dc6.html) 这篇文章中有非常详细的讨论。

### `/dev`：设备和类似设备的接口

`/dev` 通过文件形式向程序提供设备和部分内核接口，这个接口使得各个设备可以像文件一样被读取写入。假设有一个串口 `/dev/ttyUSB0`，可以像写入文件一样往里面写东西：
```c
int main(void)
{
    FILE *fp = fopen("/dev/ttyUSB0", "r+");
    char buf[100];
    fread(buf, 1, sizeof(buf), fp);
    fclose(fp);
}
```

或者也可以调用更底层的 POSIX 接口：
```c
int main()
{
    int fd = open("/dev/ttyUSB0", O_RDWR);
    char buf[100];
    read(fd, buf, 100);
    close(fd);
}
```

`/dev` 底下的常见条目包括（底下只列了一点，事实上非常多）：

```
/dev/null
/dev/zero
/dev/full
/dev/urandom
/dev/tty
/dev/nvme0n1
/dev/sda
```

现代 Linux 通常由内核、`devtmpfs` 和设备管理服务动态维护 `/dev`。应用程序不应随意在 `/dev` 中创建普通文件或 socket；运行时 socket 更适合放在 `/run`。


### `/proc`：进程和内核运行信息

`/proc` 通常挂载 procfs，是一个 API 文件系统，即将一部分信息和控制接口以文件和目录的形式暴露给用户空间，而非存储介质上真的有这些文件。

常见内容：

```
/proc/<pid>/       某个进程的信息
/proc/cpuinfo      CPU 信息
/proc/meminfo      内存信息
/proc/cmdline      内核启动参数
/proc/mounts       当前挂载信息
/proc/sys/         可调节的内核参数
```

这些“文件”的内容通常由内核实时生成。

### `/sys`：设备和内核对象信息
`/sys` 和 `/proc` 非常类似，只是挂载的是 sysfs。两者以及 `/dev` 的区别为：
| 目录      | 主要内容           | 典型用途                       |
| ------- | -------------- | -------------------------- |
| `/proc` | 进程、系统运行状态、内核参数 | 查看进程内存、CPU 信息、修改 sysctl 参数 |
| `/sys`  | 设备、驱动、总线、内核对象  | 查看硬件属性、绑定驱动、控制设备           |
| `/dev`  | 设备节点           | 实际与设备进行数据传输或操作             |



### `/etc`：系统级配置
{% note default %}
`/etc` 最初来自拉丁语 et cetera，意思是“等等、其他杂项”，后续逐渐演进成当前用途，可以记忆为 Editable Text Configuration。
{% endnote %}

`/etc` 保存：当前主机的、系统范围的、管理员可编辑的配置。

例如：

```
/etc/fstab
/etc/hostname
/etc/passwd
/etc/ssh/
/etc/systemd/
/etc/pacman.conf
```

判断某个文件是否应该放在 `/etc`，可以考虑：

* 它是否影响整台机器？
* 它是否应当由管理员编辑？
* 它是否属于配置，而不是程序自动产生的状态？

如果答案是肯定的，它通常属于 `/etc`。

### `/home`：普通用户主目录

通常每个交互用户拥有一个 home：`/home/<user_name>`，其中保存：

* 用户文档；
* 下载内容；
* 用户自己的程序；
* 用户级配置；
* 用户级缓存和状态。

### `/media`：可移动介质挂载点

用于挂载用户插入的可移动介质，例如：`/media/<user>/<volume>`。常见对象包括：
* U 盘；
* 移动硬盘；
* 光盘；

实际桌面 Linux 也经常使用：`/run/media/<user>/<volume>`


### `/mnt`：管理员临时挂载点
{% note default %}
`/mnt` 是 mount 的缩写。
{% endnote %}

`/mnt` 用于管理员临时挂载某个文件系统，比较常见的用途为：

```
mount /dev/nvme0n1p3 /mnt
```

以此安装系统、进入 chroot 或手工检查分区。

### `/srv`：系统服务直接提供的数据
{% note default %}
`/srv` 是 service 的缩写。感觉这个东西在个人电脑上不太常用。
{% endnote %}

`/srv` 保存由当前机器上的服务使用，而且管理员或用户需要直接理解其目录结构的数据。例如：

```
/srv/www/
/srv/ftp/
/srv/example.com/
```

### `/tmp`：短期临时文件

`/tmp` 用于程序的普通临时文件，默认随时都可能被清理掉。而且这个目录通常对所有用户可写，Codex 就很喜欢在权限不够的时候在这里面操作。

### `/run`：本次启动的运行状态

`/run` 保存 transient mutable data，即：

* 会在运行过程中变化；
* 只在当前启动周期内有效；

常见内容：
```
/run/<daemon>.pid
/run/<application>/
/run/user/<uid>/
/run/systemd/
/run/dbus/
/run/lock/
```

#### `/run/lock`

用于保存系统级资源锁文件。例如多个程序共享串口或某个物理设备时，可以用锁文件表示该资源当前被占用。锁文件是当前运行状态，不应跨重启保留，因此它们应位于 `/run/lock`，而不是旧式的 `/var/lock`。

### `/var`：持久可变数据

保存会在正常运行中改变，并且需要跨进程运行或系统重启保留的数据。

#### `/var/cache`：可重新生成的缓存

缓存具有两个关键性质：
* 删除它不会造成真正的数据丢失；
* 程序能够重新计算或重新下载。

常见文件夹有：
```
/var/cache/pacman/
/var/cache/dnf/
/var/cache/fontconfig/
/var/cache/man/
```

由于某些包管理器不会自动删除之前的包，所以这个文件夹可能会非常大。这些东西可以手动清理掉，问题不大，后续可以重新下载。

#### `/var/lib`：应用和系统的持久状态

保存程序内部使用、跨重启保留的状态，例如：
```
/var/lib/systemd/
/var/lib/bluetooth/
/var/lib/docker/
/var/lib/libvirt/
/var/lib/NetworkManager/
```

每个应用通常使用 `/var/lib/<application>/`。

#### `/var/log`：日志

保存系统和应用的日志。例如：
```
/var/log/pacman.log
/var/log/audit/
/var/log/nginx/
```

如果应用自己维护日志文件，应使用 `/var/log/<application>/`；如果应用只把日志发送给 syslog、journald 或其他集中式日志服务，则不需要另外创建自己的 `/var/log` 目录。


#### `/var/spool`：等待处理的任务

spool 数据是已经提交、尚未处理完的真实工作。例如：
* 等待打印的文档；
* 等待发送的邮件；
* 等待执行的定时任务；

一般结构为：`/var/spool/<application>/`

缓存与 spool 的关键区别：

| 类型    | 能否随意删除              |
| ----- | ------------------- |
| cache | 通常可以，之后能重新生成        |
| spool | 通常不可以，删除可能丢失尚未完成的任务 |


#### `/var/run` 与 `/var/lock`
主要作为兼容路径存在：
```
/var/run  -> /run
/var/lock -> /run/lock
```

### `/usr`：发行版提供的静态软件层次
{% note default %}
`/usr` 最初通常解释为 user，因为在早期 Unix 中，`/usr` 用来存放用户的主目录，作用相当于现在的 `/home`。而在现代语境下，可以将 `/usr` 解释为 Unix System Resources。
{% endnote %}

在 Merged `/usr` 模型中，`/usr` 是发行版提供的软件和静态数据的主要位置。它通常具有以下特征：
* 正常运行过程中基本不改变(static)；
* 可由包管理器统一维护；
* 原则上可以只读挂载(fixed)；
* 同一发行版和版本的兼容机器可以共享(Shareable)；

#### `/usr/bin` 与 `/usr/sbin`：普通命令与系统管理命令

`/usr/bin` 保存大多数可以由用户直接执行的命令。草案要求：
* 文件必须是真正可由 execve 执行的程序；
* 不得存放运行时不断变化的数据；
* 不得在其中创建子目录。

不能创建子目录的原因之一是 shell 通过 `PATH` 搜索命令时只匹配直接条目，不会递归搜索。

在 Merged `/usr` 系统中为了兼容一些旧程序，会有软链接：`/bin -> usr/bin`

`/usr/sbin` 放：
* 只对管理员有实际用途的命令；
* 实现系统服务的可执行程序。

`/usr/sbin` 程序通常对普通用户没有用途，因此历史上不一定进入普通用户的 `PATH`。但实际上有些发行版直接将两者合一 `/usr/sbin -> bin`。

#### `/usr/lib` 与 `/usr/lib<qual>`：库和架构相关数据

主要保存各种库，还有软件包架构数据、某些程序内部使用文件。例如：
```
/usr/lib/libc.so
/usr/lib/libssl.so
/usr/lib/<application>/
/usr/lib/modules/
```

#### `/usr/libexec`：程序内部使用的可执行文件

保存主要由其他程序调用，而不是由用户直接运行的辅助程序。例如，一个大型应用可能具有：
```
/usr/libexec/<application>/<helper>
```

与 `/usr/bin` 不同，`/usr/libexec` 允许创建子目录，因为其中的程序通常通过完整路径启动，而不是通过 `PATH` 搜索。某些发行版使用软链接将其链接到 `lib`。

#### `/usr/include`：开发头文件

该文件夹下内容可以理解为 Linux 系统中面向编译器的公共接口说明书；由于 Unix 的底层接口主要采用 C ABI，所以其中绝大多数内容表现为 C/C++ 头文件：
```
/usr/include/stdio.h
/usr/include/linux/
/usr/include/c++/
```

这些文件用于编译程序。头文件可能与架构有关，因此 `/usr/include` 属于 Architecture-dependent。

#### `/usr/share`：架构无关的静态数据

保存数据为：
* 与 CPU 架构无关；
* 正常运行过程中不变化；
* 可以在兼容机器之间共享；

例如：
* `/usr/share/doc`：软件包的普通文档
* `/usr/share/color`：软件包提供的色彩管理数据，例如 ICC profile
* `/usr/share/locale`：保存本地化数据，例如程序的翻译消息等

#### `/usr/local`：管理员本地安装的软件
是未由发行版包管理器管理、由本机管理员自行编译安装的软件的默认前缀。比如执行
```bash
./configure
make
sudo make install
```

如果没有指定其他 prefix，许多构建系统默认安装到 `/usr/local`

### `/opt`：按软件包隔离的本地软件
* FHS 3.0 将 `/opt` 定义为第三方附加软件包的位置。
* FHS 4.0 草案重新解释：现在第三方软件更常通过发行版附加仓库安装，因此 `/opt` 更适合保存“本地构建、未纳入包管理器，并希望每个软件包独立管理的软件”。

目前 QQ、微信、WPS 这种软件会把自己放到 `/opt` 底下。

## 传统兼容符号链接
现代 Merged `/usr` 布局的系统仍然保留大量 Split `/usr` 布局的旧路径，用于兼容已有程序，主要为：
```
/bin       -> usr/bin
/sbin      -> usr/sbin 或 usr/bin
/lib       -> usr/lib
/var/run   -> /run
/var/lock  -> /run/lock
```
