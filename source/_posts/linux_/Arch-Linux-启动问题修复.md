---
title: Arch Linux 启动问题修复
cover: https://source.fomal.cc/img/default_cover_127.webp
tags:
  - arch-linux
  - linux
  - grub
  - uefi
  - initramfs
  - swap
  - wayland
  - esp
description: 记录 Arch Linux 无法开机问题的修复过程
abbrlink: 91c6fd1a
date: 2025-10-27 21:17:07
categories: [System & Hardware, Linux]

---
## 内存盘镜像故障
### 问题描述
Arch Linux 开机卡在“加载初始化内存盘” (Loading initial ramdisk)

### 问题分析
这个问题最常见的原因是：在系统更新（尤其是内核更新）后，initramfs（初始化内存盘镜像）没有被正确生成，或者引导加载程序（GRUB 等）的配置没有被正确更新。这导致引导程序加载了旧的或损坏的镜像文件，从而卡住。

考虑一个简化的 Linux 启动顺序：
1. BIOS/UEFI (电脑固件) -> 
2. GRUB (引导加载程序) -> 
3. Kernel (Linux 内核) + initramfs (临时根文件系统) -> 
4. 真正的根文件系统 (和 `systemd` 等 `init` 进程)

关于 Linux 启动以及 `/boot` 文件夹下各个组件的具体作用，可以参考文章[boot 文件夹与 EFI 分区](https://zhuxz0299.github.io/posts/36b44dc6.html)

### 修复方法
从 U 盘启动 Arch Linux 的 live 环境。运行 `lsblk` 查看硬盘分区情况，方便后续挂载。其情况可能如下：
```
root@archiso ~ # lsblk
NAME          MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0           7:0    0 959.8M  1 loop /run/archiso/airootfs
sda             8:0    1  57.7G  0 disk
└─sda1          8:1    1  57.7G  0 part
  ├─ventoy    253:0    0   1.3G  1 dm
  └─sda1      253:1    0  57.7G  0 dm
sda2            8:2    1   32M  0 part
nvme0n1       259:0    0 476.9G  0 disk
├─nvme0n1p1   259:1    0  512M  0 part
├─nvme0n1p2   259:2    0   16G  0 part
└─nvme0n1p3   259:3    0 460.4G  0 part
```

然后对于某些分了子卷的分区，可以先挂载，然后查看
```bash
mount /dev/nvme0n1p3 /mnt
btrfs subvolume list /mnt
```

其结果可能如下：
```
root@archiso ~ # btrfs subvolume list /mnt
ID 256 gen 8250 top level 5 path @
ID 257 gen 8280 top level 5 path @home
ID 258 gen 3064 top level 256 path @/var/lib/portables
ID 259 gen 3064 top level 256 path @/var/lib/machines
ID 260 gen 7526 top level 5 path timeshift-btrfs/snapshots/2025-09-02_14-08-41/@
ID 261 gen 247 top level 5 path timeshift-btrfs/snapshots/2025-09-02_14-08-41/@home
...（后面是一堆 timeshift 备份）
```

然后开始执行挂载操作，并且进入系统（相当于通过 live 环境解决了无法直接通过开机进入系统的问题）：
```bash
umount /mnt
mount -o subvol=@ /dev/nvme0n1p3 /mnt # 挂载 Btrfs 根子卷
mount /dev/nvme0n1p1 /mnt/boot # 挂载 /boot 分区
mount -o subvol=@home /dev/nvme0n1p3 /mnt/home # 挂载 /home 子卷
arch-chroot /mnt # 进入系统环境
```

然后可以检查 Initramfs 所在分区硬盘空间占用情况
```bash
df -h /boot # 查看 efi 分区占用百分比
ls -lh /boot # 查看 efi 分区文件大小
```

以下就是该分区被某些垃圾文件占满的情况：
```
[root@archiso /]# ls -lh /boot
total 497M
drwxr-xr-x 3 root root 4.0K Sep  2 11:13 EFI
drwxr-xr-x 6 root root 4.0K Oct 20 19:00 grub
-rwxr-xr-x 1 root root 121M Oct 27 15:18 initramfs-linux-fallback.img
-rwxr-xr-x 1 root root 121M Oct 27 15:17 initramfs-linux.img
-rwxr-xr-x 1 root root 227M Oct 21 08:41 initramfs-linux.img.tmp
-rwxr-xr-x 1 root root  13M Aug 13 01:02 intel-ucode.img
-rwxr-xr-x 1 root root  16M Oct 21 08:38 vmlinuz-linux
```

此时删除掉 `initramfs-linux.img.tmp` 即可。如果还是不放心，还可以删掉 `initramfs-linux-fallback.img` 以及 `initramfs-linux.img`，这两个会在后续生成。


最后重新生成 Initramfs，更新 GRUB 配置确保它能找到新的 `initramfs` 文件，重启。
```bash
mkinitcpio -P # 重新生成所有内核的初始化内存盘
grub-mkconfig -o /boot/grub/grub.cfg # 重新生成 GRUB 配置文件
exit # 退出 chroot
umount -R /mnt # 卸载所有分区
reboot
```

## 未找到恢复设备
### 问题描述
开机时卡在 `No resume device found, exiting.`

### 问题分析
系统被配置为在启动时尝试从“休眠”（suspend-to-disk）中恢复。此时系统需要一个 `swap`（交换）分区来执行此操作，但它要么找不到这个分区，要么被告知了错误的位置 (UUID)。

#### 开机时检查 resume device
检查 "resume device"发生在启动过程中非常早的 initramfs 阶段，这个过程由 GRUB 和 initramfs 共同控制。
* GRUB 并不检查设备，它仅仅通过内核参数传递信息。
  * 配置系统支持休眠 (Hibernation) 时，GRUB 配置文件（`/boot/grub/grub.cfg`）中 `linux` 开头的那一行里，会被添加上一个 `resume=...` 参数。这个参数会指向你的 swap 分区（或 swap 文件）的 UUID 或设备路径
  * GRUB 的工作就是在启动内核时，把这个 `resume=UUID=...` 参数（连同 `root=...` 等其他参数）一起传递给内核。
* initramfs 控制方式：通过 `mkinitcpio.conf` 中的 `HOOKS` 执行工作。
  * 内核启动后，挂载 `initramfs` 作为临时根目录。`initramfs` 中的 `init` 脚本开始运行。
  * 一个特定的钩子（hook），在 Arch 中通常就是 `resume` 钩子，会被触发。这个 `resume` 脚本会读取内核收到的 `resume=...` 参数，从而知道它应该去检查哪个设备。
  * initramfs 加载访问该设备所需的驱动（比如 Btrfs、LVM、NVMe 驱动，这些都是 initramfs 的核心功能）。
  * 它会探测该设备，检查是否存在一个有效的、匹配当前内核的休眠镜像（system snapshot）。

### 修复方法
已知 swap 分区是 `nvme0n1p2`，因此重新进入 live 环境配置：
```bash
mount -o subvol=@ /dev/nvme0n1p3 /mnt
mount /dev/nvme0n1p1 /mnt/boot
mount -o subvol=@home /dev/nvme0n1p3 /mnt/home
arch-chroot /mnt
```

然后查看 swap 分区的 UUID：`blkid /dev/nvme0n1p2`，得到结果为：
```
[root@archiso /]# blkid /dev/nvme0n1p2
/dev/nvme0n1p2: UUID="455e3566-b69f-4cb7-9083-d31f3f7adf1f" TYPE="swap" PARTUUID="a4887028-e665-4c5a-a639-70d8082f8b66"
```

然后编辑 GRUB 配置文件：`vim /etc/default/grub`，找到 `GRUB_CMDLINE_LINUX_DEFAULT=` 开头的一行，在引号内加上 `resume=UUID=455e3566-b69f-4cb7-9083-d31f3f7adf1f`，

最后重新生成 grub 配置，退出并重启：
```bash
grub-mkconfig -o /boot/grub/grub.cfg
exit
umount -R /mnt
reboot
```

## 无法进入图形界面
### 问题描述
开机时卡在
```
Unable to resume from device '/dev/disk/by-uuid/455e3566-b69f-4cb7-9083-d31f3f7adf1f' (259:2) offset 0, continuing boot process.
```

并且下方光标一直在闪烁。按下 `Ctrl+Alt+F2` 可以进入 tty，可以在 tty 中正常登录账户。

### 问题分析
`Unable to resume from device ... continuing boot process.` 说明系统找到了我们指定的 swap 分区 (UUID是对的)，尝试从它恢复休眠（失败了，这是正常的，因为这是电脑关机后开机），然后它放弃了恢复，并继续正常启动。同时可以从 tty 登录，说明系统启动本身没有问题，只是图形桌面坏了。

这时候问题可以被定位到显卡驱动或者是显示服务协议上（Wayland 和 X11 的选择）。

### 修复方法
最后首先通过运行
```bash
systemctl status gdm.service
journalctl -u gdm.service -b
```

发现无异常，说明 GDM 本身可以正常工作。然后在 `/etc/gdm/custom.conf` 文件中注释掉了 `WaylandEnable=false`，重启后成功进入图形界面。原因大概是最新的 `gnome-session` 已经不提供 X11 会话文件，只支持 Wayland，所以禁掉了 Wayland 之后就进不去了。