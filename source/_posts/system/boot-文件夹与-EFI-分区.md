---
title: boot 文件夹与 EFI 分区
cover: 'https://source.fomal.cc/img/default_cover_150.webp'
tags:
  - file-system
  - esp
  - linux
categories:
  - System & Hardware
  - System Knowledge
abbrlink: 36b44dc6
date: 2026-05-04 11:26:50
description:
---

{% note info %}
本文基于我当前这台 **Win11 + Arch Linux** 双系统电脑上的 `/boot` 与 `/boot/efi` 目录进行分析。  
参考资料包括：

* [GNU GRUB Manual](https://www.gnu.org/software/grub/manual/grub/grub.html)
* [ArchWiki: Arch boot process](https://wiki.archlinux.org/title/Arch_boot_process)
* [ArchWiki: GRUB](https://wiki.archlinux.org/title/GRUB)
* [Pykickstart Documentation](https://pykickstart.readthedocs.io/en/latest/kickstart-docs.html)
* [UEFI Specification 2.11: Boot Manager](https://uefi.org/specs/UEFI/2.11/03_Boot_Manager.html)
* [Microsoft Learn: BCDBoot Command-Line Options](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di?view=windows-11)
* [Microsoft Learn: BCD System Store Settings for UEFI](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcd-system-store-settings-for-uefi?view=windows-11)
* [rhboot/shim: README.fallback](https://github.com/rhboot/shim/blob/main/README.fallback)
{% endnote %}

## 总体结构

```bash
ls -lh /boot
```

输出大致如下：

```text
total 86M
drwxr-xr-x 5 nobody nobody 4.0K Jan  1  1970 efi
drwxr-xr-x 1 nobody nobody  112 May  1 21:23 grub
-rw------- 1 nobody nobody  20M May  3 12:22 initramfs-linux-lts.img
-rw------- 1 nobody nobody  21M May  3 12:22 initramfs-linux.img
-rw-r--r-- 1 nobody nobody  15M Feb 28 01:22 intel-ucode.img
-rw-r--r-- 1 nobody nobody  17M May  3 12:22 vmlinuz-linux
-rw-r--r-- 1 nobody nobody  16M May  3 12:22 vmlinuz-linux-lts
```

这里主要有三类内容：

* `/boot` 自身存放 Linux 启动早期需要的文件，例如内核、initramfs、CPU 微码等。
* `/boot/grub` 存放 GRUB 的配置、模块、字体、主题以及和启动菜单有关的文件。
* `/boot/efi` 存放 UEFI 启动相关文件，例如 GRUB、Windows Boot Manager 等 `.efi` 启动程序。


### `/boot` 与 `/boot/efi` 的挂载问题
`/boot/efi` 与 `/boot` 可能挂载到不同的地方：
```bash
findmnt -T /boot
findmnt -T /boot/efi
```

输出：
```text
TARGET SOURCE             FSTYPE OPTIONS
/      /dev/nvme0n1p6[/@] btrfs  ro,nosuid,nodev,relatime,ssd,discard=async,space_cache=v2,subvolid=256,subvol=/@

TARGET    SOURCE         FSTYPE OPTIONS
/boot/efi /dev/nvme0n1p1 vfat   ro,nosuid,nodev,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro
```

也就是说，当前机器的 `/boot` 并不是一个单独的分区，而是位于 Linux 根文件系统所在的 Btrfs 子卷中；`/boot/efi` 才是单独挂载的 vfat 分区。

对于 `/boot` 与 EFI 分区的关系，常见情况大致有下面几种：
* 像当前这台机器一样，`/boot` 跟随根文件系统一起挂载，位于 Btrfs 子卷 `@` 中；`/boot/efi` 单独挂载到 EFI 系统分区。
* 某些 Arch Linux 安装教程会建议把整个 `/boot` 都放到 EFI 分区里。这样内核、initramfs、GRUB 入口等都会位于同一个 FAT 格式的 ESP 中，路径上看起来会更集中。
* Fedora/Anaconda 这类安装器也存在把启动相关分区单独处理的操作：`/boot` 可以是一个标准 Linux 分区，而 `/boot/efi` 依然挂载到 EFI 系统分区。 信息来源：[Pykickstart 文档](https://pykickstart.readthedocs.io/en/latest/kickstart-docs.html)。

{% note default %}
`/boot` 和 `/boot/efi` 服务的对象并不一样：`/boot/efi` 主要服务于 UEFI 固件，`/boot` 中的内核、initramfs、GRUB 配置则主要服务于 Linux 启动流程。
{% endnote %}


## `/boot` 文件夹

### `/boot/vmlinuz-linux` 与 `/boot/vmlinuz-linux-lts`

这两个文件都是 Linux 内核镜像，只是对应的内核版本不同：

通过 `file` 命令可以看到：

```bash
file /boot/vmlinuz-linux /boot/vmlinuz-linux-lts
```

输出中比较关键的部分是：

```text
/boot/vmlinuz-linux:     Linux kernel x86 boot executable, bzImage, version 7.0.3-arch1-2
/boot/vmlinuz-linux-lts: Linux kernel x86 boot executable, bzImage, version 6.18.26-2-lts
```

也就是说，二者本质上都是可被引导加载程序加载的 Linux 内核镜像。其中 `vmlinuz-linux` 是 Arch Linux 的普通内核，`vmlinuz-linux-lts` 是 LTS 内核。

当前系统实际运行的是普通内核：

```bash
uname -a
```

```text
Linux archll 7.0.3-arch1-2 #1 SMP PREEMPT_DYNAMIC Fri, 01 May 2026 15:49:22 +0000 x86_64 GNU/Linux
```

LTS 内核可以在普通内核更新出现问题的时候作为备用选项。


### `/boot/initramfs-linux.img` 与 `/boot/initramfs-linux-lts.img`

这两个文件是对应内核使用的 initramfs：

```text
vmlinuz-linux      <-> initramfs-linux.img
vmlinuz-linux-lts  <-> initramfs-linux-lts.img
```

initramfs 可以理解为“内核刚启动时使用的临时根文件系统”。

> 来源：[Arch boot process - ArchWiki](https://wiki.archlinux.org/title/Arch_boot_process#initramfs)
>
> An initramfs (initial RAM file system) image is a cpio archive providing the necessary files for early userspace to successfully start the late userspace.

也就是说，initramfs 本质上是一个 cpio 归档，它为“早期用户空间”提供必要文件。内核先进入这个临时环境，完成一些真正进入系统前必须做的事情，然后再切换到正常启动后的用户空间。

为什么需要这个临时小系统？因为内核刚被加载时，还不一定能直接挂载真正的根文件系统。

比如当前机器的根文件系统位于 Btrfs 子卷 `@`：

```text
root=UUID=dccef9f1-ac99-48c0-aca6-9c6d96bdef9c
rootflags=subvol=@
```

内核需要先准备好块设备、文件系统、udev 规则、可能的休眠恢复逻辑等，才能顺利找到并挂载真正的 `/`。

> 来源：[Arch boot process - ArchWiki](https://wiki.archlinux.org/title/Arch_boot_process#initramfs)
>
> With the concept of initramfs it is possible to handle even more complex setups, like e.g. booting from an external drive, stacked devices (logical volumes, software RAIDs, compression, encryption) or running a tiny SSH server in early userspace for remote unlocking or maintenance tasks of the root file system.

也就是说，寻找根文件系统这件事可能很复杂：根分区可能位于外接硬盘、LVM、软件 RAID、加密设备、压缩文件系统等环境中。把这些逻辑放进 initramfs，就可以在真正的根文件系统挂载之前，先由早期用户空间处理这些准备工作。

{% note default %}
有些 Arch 机器的 `/boot` 里还会看到 `initramfs-linux-fallback.img`。它是更通用的备用 initramfs，通常会包含更多模块，所以体积可能比普通 `initramfs-linux.img` 大很多。它主要用于默认 initramfs 缺模块或生成异常时临时救急；但如果已经有 LTS 内核、Btrfs 快照，或者能用 Arch live 系统进去 `arch-chroot` 后重新执行 `mkinitcpio -P`，它的日常存在感就没那么强。当前这台机器没有 fallback 文件，是因为 `/etc/mkinitcpio.d/linux.preset` 里只启用了 `default` preset，没有启用 `fallback`。
{% endnote %}


### `/boot/intel-ucode.img`

`intel-ucode.img` 是 Intel CPU 的 microcode 文件。

```bash
file /boot/intel-ucode.img
```

```text
ASCII cpio archive (SVR4 with no CRC)
```

CPU microcode 可以理解为 CPU 内部执行某些底层操作时使用的“微型固件”。厂商可以通过 microcode 更新修复处理器层面的问题，例如硬件 bug、安全漏洞或兼容性问题。

它通常会在普通 initramfs 之前被加载。如果是 AMD 平台，这里一般会看到 `amd-ucode.img`。

## `/boot/grub/` 文件夹

`/boot/grub` 是 GRUB 的配置、模块、字体、主题等文件所在的位置。

[GNU GRUB 手册](https://www.gnu.org/software/grub/manual/grub/grub.html)对 GRUB 的定位是：它是一个引导加载程序，负责加载并把控制权交给操作系统内核。当前这个目录大致如下：

```text
/boot/grub
├── fonts
├── grub-btrfs.cfg
├── grub.cfg
├── grubenv
├── locale
├── themes
└── x86_64-efi
```

### `grub.cfg`

`grub.cfg` 是 GRUB 的主配置文件，里面记录启动菜单、内核路径、initramfs 路径、内核参数等。

在 Arch 系系统上，这个文件通常由 `grub-mkconfig` 生成，而不是手写。典型命令类似：

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

这个文件会告诉 GRUB：菜单里有哪些系统或内核可选；选中某一项时，应该加载哪个 `vmlinuz-*` 文件、哪个 `initramfs-*` 文件，以及传给内核哪些参数。这个文件并不建议手动编辑，应当使用上面的命令生成。其内容来源为：
* `/etc/default/grub`：控制 GRUB 的全局设置，例如默认启动项、菜单等待时间、内核参数、字体、是否启用 `os-prober` 等。
* `/etc/grub.d/`：一组生成菜单项的脚本。`grub-mkconfig` 会按编号顺序执行这些脚本，并把它们的输出拼成最终的 `grub.cfg`。

当前这台机器的 `/etc/default/grub` 中比较关键的几项是：

```bash
GRUB_DEFAULT=0
GRUB_TOP_LEVEL="/boot/vmlinuz-linux"
GRUB_TIMEOUT=5
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 quiet resume=UUID=9e09ab44-748d-4905-8d09-fe92243ae6f5"
GRUB_FONT="/boot/grub/fonts/NotoSansMono32.pf2"
GRUB_PRELOAD_MODULES="part_gpt part_msdos"
GRUB_TIMEOUT_STYLE=menu
GRUB_GFXMODE=auto
GRUB_GFXPAYLOAD_LINUX=keep
GRUB_DISABLE_RECOVERY=true
GRUB_DISABLE_OS_PROBER=false
```

这些配置会反映到生成后的 `grub.cfg` 中。

#### 字体与屏幕显示

GRUB 菜单字体为手动设置：

```bash
GRUB_FONT="/boot/grub/fonts/NotoSansMono32.pf2"
```

因为之前的 GRUB 默认字体在高分辨率屏幕上可能显得太小，启动菜单看不清。这个配置对应到 `grub.cfg` 的内容为：

```text
if loadfont /@/boot/grub/fonts/NotoSansMono32.pf2 ; then
  set gfxmode=auto
  load_video
  insmod gfxterm
fi
```

和显示相关的还有：

```bash
GRUB_GFXMODE=auto
GRUB_GFXPAYLOAD_LINUX=keep
```

`GRUB_GFXMODE=auto` 表示 GRUB 菜单阶段的图形模式自动选择；`GRUB_GFXPAYLOAD_LINUX=keep` 表示进入 Linux 内核后尽量沿用 GRUB 阶段的图形模式。它们主要影响启动菜单和内核早期输出阶段的显示效果。

#### 顶层 Arch Linux 启动项

进入 GRUB 选择系统的界面时，最上层的 `menuentry 'Arch Linux'` 来自 `/etc/grub.d/10_linux`：

```text
menuentry 'Arch Linux' {
        linux   /@/boot/vmlinuz-linux root=UUID=dccef9f1-ac99-48c0-aca6-9c6d96bdef9c rw rootflags=subvol=@  loglevel=3 quiet resume=UUID=9e09ab44-748d-4905-8d09-fe92243ae6f5
        initrd  /@/boot/intel-ucode.img /@/boot/initramfs-linux.img
}
```

这两行基本就是 Linux 启动项的核心：

* `linux ...` 指定要加载的内核，也就是 `/boot/vmlinuz-linux`。后面跟着的参数来自 `GRUB_CMDLINE_LINUX_DEFAULT`。
* `initrd ...` 指定启动早期要加载的镜像。可以看出这里先加载 `intel-ucode.img`，再加载 `initramfs-linux.img`。

这里之所以顶层菜单是普通内核，和 `/etc/default/grub` 中的这行配置有关：

```bash
GRUB_TOP_LEVEL="/boot/vmlinuz-linux"
```

[ArchWiki 的 GRUB 页面](https://wiki.archlinux.org/title/GRUB#Setting_the_top-level_menu_entry)提到，`grub-mkconfig` 默认会用 `sort -V` 对内核列表排序，并把排在最前面的内核作为 top-level entry。因为 `/boot/vmlinuz-linux-lts` 会排在 `/boot/vmlinuz-linux` 前面，导致默认会使用 LTS 内核。设置 `GRUB_TOP_LEVEL="/boot/vmlinuz-linux"` 后，就可以明确指定普通内核作为最上层的 Arch 启动项。

#### Advanced options for Arch Linux

第二个启动选项是一个子菜单，类似：

```text
submenu 'Advanced options for Arch Linux' {
    ...
}
```

这个目录里会同时放普通内核和 LTS 内核。普通内核启动项和顶层 `Arch Linux` 基本一致；另一个则是 LTS 内核：

```text
menuentry 'Arch Linux, with Linux linux-lts' {
        linux   /@/boot/vmlinuz-linux-lts root=UUID=dccef9f1-ac99-48c0-aca6-9c6d96bdef9c rw rootflags=subvol=@  loglevel=3 quiet resume=UUID=9e09ab44-748d-4905-8d09-fe92243ae6f5
        initrd  /@/boot/intel-ucode.img /@/boot/initramfs-linux-lts.img
}
```

这就对应了前面说的普通内核与 LTS 内核两套文件。

#### Windows Boot Manager

因为 `/etc/default/grub` 中设置了：

```bash
GRUB_DISABLE_OS_PROBER=false
```

所以 `grub-mkconfig` 会通过 `/etc/grub.d/30_os-prober` 生成 Windows 启动项：

```text
menuentry 'Windows Boot Manager (on /dev/nvme0n1p1)' {
        insmod part_gpt
        insmod fat
        search --no-floppy --fs-uuid --set=root 58A4-CF48
        chainloader /EFI/Microsoft/Boot/bootmgfw.efi
}
```

这里的 `chainloader` 表示 GRUB 不直接启动 Windows 内核，而是把控制权交给 Windows 自己的 Boot Manager，也就是 EFI 分区里的 `\EFI\Microsoft\Boot\bootmgfw.efi`。

#### UEFI Firmware Settings

```text
menuentry 'UEFI Firmware Settings' {
        fwsetup
}
```

这个入口可以从 GRUB 菜单直接进入主板 UEFI 设置界面。

{% note default %}
这里说的主板 UEFI 设置界面就是俗称的 BIOS。老机器的主板固件通常是 BIOS，而新机器的主板固件已经基本是 UEFI，大家依然习惯叫那个设置界面 BIOS 是出于习惯。
{% endnote %}

#### Arch Linux snapshots

```text
submenu 'Arch Linux snapshots' {
    configfile "${prefix}/grub-btrfs.cfg"
}
```

这个入口来自 `/etc/grub.d/41_snapshots-btrfs`，它会继续读取 `/boot/grub/grub-btrfs.cfg`，把 Btrfs 快照启动项挂到 GRUB 菜单里。

#### GRUB 命令行

除了这些显式的 `menuentry` 和 `submenu`，GRUB 菜单本身还提供命令行环境。这个不是某个 Linux 或 Windows 启动项，而是 GRUB 自己提供的交互界面。在菜单界面按 `c` 通常可以进入 GRUB command-line，按 `e` 则可以临时编辑当前选中的启动项。

这个命令行可以手动执行 `ls`、`set`、`linux`、`initrd`、`boot`、`chainloader` 等 GRUB 命令，用于查看磁盘、手动指定内核/initramfs，或者在启动项配置损坏时临时把系统拉起来。它属于排错工具，日常正常启动一般不会用到。


### `grub-btrfs.cfg`

`grub-btrfs.cfg` 就是前面 `Arch Linux snapshots` 子菜单实际读取的配置文件。它里面列出了 Timeshift/Btrfs 快照对应的启动项，并且每个快照下通常也会提供普通内核和 LTS 内核两种入口。

这些快照可以用于滚挂之后的系统回滚。

### `grubenv`

`grubenv` 是 GRUB 的环境块文件，用来在多次启动之间保存少量状态。

> 来源：[The GRUB environment block - GNU GRUB Manual](https://www.gnu.org/software/grub/manual/grub/html_node/Environment-block.html)
>
> The environment block is a preallocated 1024-byte file, which normally lives in `/boot/grub/grubenv`.
>
> GRUB provides an “environment block” which can be used to save a small amount of state.

这个文件平时基本不用手动关心。它主要服务于一些“记住状态”的功能，例如保存上次选择的启动项、设置下一次启动临时进入某个菜单项等。


### `x86_64-efi/`

`x86_64-efi/` 目录中放的是 GRUB 在 x86_64 UEFI 平台下使用的模块。例如当前能看到：

```text
acpi.mod
ahci.mod
all_video.mod
btrfs.mod
boot.mod
...
```

> 来源：[Modules - GNU GRUB Manual](https://www.gnu.org/software/grub/manual/grub/html_node/Modules.html) 与 [insmod - GNU GRUB Manual](https://www.gnu.org/software/grub/manual/grub/html_node/insmod.html)
>
> Modules can be loaded via the `insmod` command.
>
> Insert the dynamic GRUB module called `module`.

也就是说，`insmod` 就是 GRUB 用来加载动态模块的命令。这个命令和前面 `grub.cfg` 里看到的是同一件事：

```text
insmod part_gpt
insmod btrfs
insmod fat
insmod gfxterm
```

这些命令会从类似 `x86_64-efi/` 这样的模块目录中加载对应模块。比如 `insmod btrfs` 让 GRUB 能读取 Btrfs 文件系统，`insmod fat` 用于读取 EFI 分区所在的 FAT 文件系统，`insmod gfxterm` 则和图形菜单显示有关。GRUB 之所以能识别分区、读取不同文件系统、显示图形菜单、加载 Linux 内核，背后靠的就是这些平台模块和文件系统模块。

### `fonts/`、`locale/`、`themes/`

这几个目录主要服务于 GRUB 菜单显示：

* `fonts/`：字体文件，例如 `unicode.pf2`、`NotoSansMono32.pf2`
* `locale/`：语言翻译文件，例如 `zh_CN.mo`、`en@cyrillic.mo`
* `themes/`：主题资源

它们不是 Linux 内核启动的核心，但会影响 GRUB 菜单的显示效果。例如如果觉得GRUB菜单中原本的 `unicode.pf2` 字体太小导致看不清，就可以塞一个 `NotoSansMono32.pf2` 这样的更大的字体进去。


## `/boot/efi` 文件夹

`/boot/efi` 是 EFI System Partition，也就是 ESP 的挂载点。当前机器上它来自 `/dev/nvme0n1p1`，文件系统是 vfat：

```text
/boot/efi /dev/nvme0n1p1 vfat
```

它和普通 Linux 目录最大的区别是：**UEFI 固件可以直接读取它**。

固件刚启动时，还没有进入 Linux，也不认识 Linux 的 Btrfs 子卷布局，更不会直接去加载 `/boot/vmlinuz-linux`。它首先会从 NVRAM 启动项或者默认路径（可以在 UEFI 固件设置里面调整）中找到某个 `.efi` 程序，然后把控制权交给这个 EFI 程序。

对当前这台机器来说，`/boot/efi` 顶层结构大致如下：

```text
/boot/efi
├── Boot
├── bootmgr
├── BOOTNXT
├── EFI
└── System Volume Information
```

### `/boot/efi/EFI`
这是 ESP 中最核心的内容。结构为：

```text
/boot/efi/EFI
├── Boot
│   └── bootx64.efi
├── GRUB
│   └── grubx64.efi
├── Microsoft
│   ├── Boot
│   └── Recovery
└── OEM
    ├── Boot
    └── Recovery
```

#### `/boot/efi/EFI/GRUB/`

这是 Arch 的 GRUB 在 EFI 分区里的目录。当前里面的关键文件是 `grubx64.efi`，可以把它理解成 UEFI 世界里的“GRUB 启动程序本体”。UEFI 固件先执行这个 `.efi` 文件，然后 GRUB 再读取 `/boot/grub/grub.cfg`，显示启动菜单，并继续加载 Linux 内核和 initramfs。

它通常来自类似下面的安装命令：

```bash
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
```

其中：

* `--target=x86_64-efi` 表示安装 UEFI x86_64 平台的 GRUB。
* `--efi-directory=/boot/efi` 表示 EFI 分区挂载点是 `/boot/efi`。
* `--bootloader-id=GRUB` 通常会对应到 ESP 中的 `EFI/GRUB/` 目录。

所以 Linux 这边的启动主线可以写成：

```text
UEFI 固件
  -> /boot/efi/EFI/GRUB/grubx64.efi
  -> /boot/grub/grub.cfg
  -> /boot/vmlinuz-linux
  -> /boot/intel-ucode.img + /boot/initramfs-linux.img
  -> Linux 根文件系统
```

#### `/boot/efi/EFI/Boot/`

这是 UEFI 的默认/后备启动目录。简单说，当正式的 NVRAM 启动项不可用时，固件可能会尝试从这里找一个通用 fallback 入口。当前这台机器里面只有一个 `bootx64.efi`。

这套路径是 UEFI 规范层面的约定，UEFI 规范中按机器架构定义了不同的默认文件名，例如 x86_64 使用 `BOOTX64.EFI`，IA32 使用 `BOOTIA32.EFI`：

> 来源：[UEFI Specification 2.11 - Boot Manager](https://uefi.org/specs/UEFI/2.11/03_Boot_Manager.html)
>
> x64 | `BOOTx64.EFI`
> 32-bit | `BOOTIA32.EFI`

> 来源：[BCDBoot Command-Line Options - Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di?view=windows-11)
>
> The default firmware settings should open the file: `\efi\boot\bootx64.efi` in the ESP.

不过在另一台电脑中，文件夹下有：
```text
BOOTIA32.EFI
BOOTX64.EFI
fbia32.efi
fbx64.efi
```

其中 `BOOTX64.EFI` 和 `BOOTIA32.EFI` 对应的就是 UEFI fallback 路径中不同架构的默认入口；`fbx64.efi`、`fbia32.efi` 则通常和 shim/fallback 机制有关。

> 来源：[README.fallback - rhboot/shim](https://github.com/rhboot/shim/blob/main/README.fallback)
>
> fallback will look for every directory in `\EFI\` with a `BOOT${ARCH}.CSV` in it.

也就是说，`fbx64.efi` 这类文件会在启动项丢失时扫描 ESP 里的 `BOOT.CSV` 之类的文件，并尝试重新创建 NVRAM 启动项。它们更多是发行版或引导器安装过程写入 ESP 的结果，而不是主板固件出厂时就固定存在的文件。


#### `/boot/efi/EFI/Microsoft/`

这是 Windows 在 UEFI 模式下的启动目录。当前下面主要有 `Boot/` 和 `Recovery/` 两个子目录：

```text
/boot/efi/EFI/Microsoft
├── Boot
└── Recovery
```

其中最重要的是 `Boot/` 里的 `bootmgfw.efi`。UEFI 固件启动 Windows 时，通常会先找到这个 `.efi` 文件：

> 来源：[BCD System Store Settings for UEFI - Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcd-system-store-settings-for-uefi?view=windows-11)
>
> The path to the Windows Boot Manager is `\EFI\Microsoft\Boot\bootmgfw.efi`.

也就是说，Windows 这边的启动主线可以概括为：

```text
UEFI 固件
  -> /boot/efi/EFI/Microsoft/Boot/bootmgfw.efi
  -> BCD 启动配置
  -> Windows Boot Loader
  -> Windows
```

`Boot/` 目录里还会有一些配套文件，例如：

```text
BCD
BCD.LOG
BOOTSTAT.DAT
bootmgfw.efi
bootmgr.efi
memtest.efi
SecureBootRecovery.efi
winsipolicy.p7b
...
```

其中 `bootmgfw.efi` 是 Windows Boot Manager 入口，`BCD` 是 Windows 启动配置数据库，`BCD.LOG*` 是 BCD 日志，`memtest.efi`、`SecureBootRecovery.efi` 等是测试或恢复相关工具，其它字体、语言目录、`kd_*.dll` 这类文件更多是启动界面、恢复环境或底层诊断支持文件。

`Recovery/` 对应 Windows 恢复链，当前里面主要也是 `BCD` 和 `BCD.LOG*`。它不是完整复制一套正常启动目录，更像是恢复环境使用的启动配置，这里知道有这么一层即可。

#### `/boot/efi/EFI/OEM/`

`OEM/` 通常是整机厂商留下的启动或恢复目录。看起来和 `/boot/efi/EFI/Microsoft/` 大差不差。

### 其它顶层文件与目录

除了最核心的 `EFI/` 目录，ESP 顶层还有一些不太影响当前启动主线的文件和目录：

```text
/boot/efi/Boot
/boot/efi/bootmgr
/boot/efi/BOOTNXT
/boot/efi/System Volume Information
```

其中 `Boot/` 和 `bootmgr` 更像是 Windows BIOS/legacy 兼容布局，或者某次部署、修复、OEM 过程留下的启动环境文件。Microsoft 的 BCDBoot 文档对不同固件类型下的文件布局有这样的说明：

> 来源：[BCDBoot Command-Line Options - Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di?view=windows-11)
>
> BIOS: Copies the boot files to either the `\Boot` directory on the system partition, or the partition specified by the `/s` option.
>
> UEFI: Copies the boot files to either the `\EFI\Microsoft\Boot` directory, or the partition specified by the `/s` option.
>
> ALL: Copies both the BIOS and UEFI files to the system partition or the partition specified by the `/s` option.

所以，ESP 顶层的 `Boot/` 和 `bootmgr` 与 `EFI/Microsoft/Boot` 本来都属于 Windows boot-environment 文件，只是面向的启动布局不同，这也导致 `Boot/` 和 `EFI/Microsoft/Boot` 里面的东西基本一样。`BOOTNXT` 可以先理解为 Windows 维护的下一次启动/临时启动状态痕迹；`System Volume Information` 则是 Windows 常见的卷级系统信息目录，目前里面也没什么内容。

## 小结

最终，当前这台机器的双系统启动关系大概是：

```text
Arch:
UEFI -> EFI/GRUB/grubx64.efi -> /boot/grub/grub.cfg -> vmlinuz-linux + initramfs-linux.img

Windows 直接启动:
UEFI -> EFI/Microsoft/Boot/bootmgfw.efi -> BCD -> Windows Boot Loader
Windows 通过 GRUB 启动:
UEFI -> EFI/GRUB/grubx64.efi -> /boot/grub/grub.cfg -> EFI/Microsoft/Boot/bootmgfw.efi -> BCD -> Windows Boot Loader
```
