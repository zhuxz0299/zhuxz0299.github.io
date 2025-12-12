---
title: Arch Linux 安装
cover: 'https://source.fomal.cc/img/default_cover_165.webp'
tags:
  - linux
  - arch linux
  - file system
description: 讲解 Arch Linux 安装步骤背后的工作原理
abbrlink: 695424c6
date: 2025-09-03 14:42:41
---

{% note info %}
安装流程参考的是 [archlinux 简明教程 - archlinux 基础安装](https://arch.icekylin.online/guide/rookie/basic-install.html) 中的步骤
{% endnote %}

{% note warning %}
对操作步骤的解释大多来自 Gemini 2.5 Pro
{% endnote %}

## U盘启动安装程序
### U盘中的 Arch Linux ISO
在安装 Arch Linux 之前需要制作一个启动盘，并且将 ISO 文件放入其中。当计算机从U盘启动时，就会加载这个 ISO 文件。同时与 Windows 系统不同的是，Arch Linux ISO 中本身并不包含后续需要安装到计算机上的系统。

U盘中的 Arch Linux ISO 文件本身就是一个完整、可独立运行的、只是相对简易的 Linux 系统，通常称之为“Live 环境”或“Live 系统”。用户从U盘启动时，并不是直接开始安装，而是启动了这个存在于 U盘和内存中的迷你 Arch Linux 系统。

#### ISO 镜像里有什么？
一个典型的 Arch Linux 安装U盘 (ISO) 包含了一个可启动的操作系统所需的所有基本组件：
1. 引导加载程序 (Bootloader): 比如 GRUB 或 systemd-boot。当电脑的 BIOS/UEFI 从U盘启动时，首先会运行它。它的任务是加载 Linux 内核。
2. Linux 内核 (Kernel): 这是操作系统的核心，负责管理硬件（CPU、内存、硬盘等），并为其他程序提供运行环境。
3. 根文件系统 (Root Filesystem): 这是一个包含了所有基本命令行工具和程序的文件集合。
4. Shell: 用户看到的可以交互的命令行界面，通常是 Zsh 或 Bash。
5. 安装必需的工具: 比如用于磁盘分区的 fdisk/parted，用于格式化的 mkfs，用于连接网络的 iw/dhcpcd，以及最重要的安装脚本 pacstrap 和进入新系统的 arch-chroot 等。
6. 系统驱动和模块: 确保用户的硬件（如网卡、键盘、显卡）能被识别并正常工作。

#### 为什么需要一个 Live 系统？
采用这种方式，而不是一个简单的、菜单式的安装程序，是 Arch Linux “The Arch Way” 哲学的一种体现：
1. 提供强大的操作环境: 在安装系统之前，用户需要对硬盘进行分区、格式化。一个完整的命令行环境让用户可以随心所欲地执行这些高级操作，而不是被限制在预设的几个选项里。
2. 网络连接: Arch Linux 的安装过程需要从互联网上下载最新的软件包。这个 Live 环境内置了网络工具，让用户可以先连接到网络，再开始安装。这就保证了用户安装的系统从一开始就是最新的。
3. 系统修复和救援: 这个 Live U盘也是一个功能强大的系统救援盘。如果将来用户安装好的 Arch Linux 系统出了问题无法启动，用户可以再次用这个U盘启动，进入 Live 环境，然后挂载用户硬盘上的系统分区，进行检查和修复。

#### 启动流程总结
1. BIOS/UEFI 从U盘加载 Bootloader。
2. Bootloader 加载 Linux 内核和一个临时的初始文件系统 (initramfs) 到内存。
3. 内核启动，并利用初始文件系统中的工具，找到并挂载位于 ISO 中的主要根文件系统 (SquashFS)。
4. 系统完成初始化，最终启动一个 Shell，将控制权交给用户。

此时，用户就得到了一个运行在内存中、功能齐全的 Arch Linux 命令行环境。用户在这个环境里所做的一切操作（比如下载文件），都是在内存中进行的，不会影响U盘本身。

### 安装步骤
以下的安装步骤都是在 Live 系统中进行，主要是为了后续下载完整的 Arch Linux 系统做准备。
```bash
# 禁用reflector 服务，防止自动更新 mirrorlist 时误删某些有用的源信息
systemctl stop reflector.service
# 确认一下是否为 UEFI 模式
ls /sys/firmware/efi/efivars
# 使用无线连接
iwctl # 进入交互式命令行
device list # 列出无线网卡设备名，比如无线网卡看到叫 wlan0
station wlan0 scan # 扫描网络
station wlan0 get-networks # 列出所有 wifi 网络
station wlan0 connect wifi-name # 进行连接，注意这里无法输入中文。回车后输入密码即可
exit # 连接成功后退出
# 测试网络连通性
ping www.bilibili.com
# 更新系统时钟
timedatectl set-ntp true # 将系统时间与网络时间进行同步
timedatectl status # 检查服务状态
# 更换国内软件仓库镜像源加快下载速度
vim /etc/pacman.d/mirrorlist
```

加入
```mirrorlist
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch # 中国科学技术大学开源镜像站
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch # 清华大学开源软件镜像站
Server = https://repo.huaweicloud.com/archlinux/$repo/os/$arch # 华为开源镜像站
Server = http://mirror.lzu.edu.cn/archlinux/$repo/os/$arch # 兰州大学开源镜像站
```

## 分区与格式化
### 分区格式化
#### 安装步骤
```bash
lsblk # 显示当前分区情况
# 这一步需要创建 efi 分区，swap 分区以及用于挂载根目录的分区
cfdisk /dev/nvmexn1 # 使用 cfdisk 工具对安装 archlinux 的磁盘分区
fdisk -l # 复查磁盘情况
# 格式化分区
mkfs.fat -F32 /dev/nvmexn1pn # 格式化 EFI 分区
mkswap /dev/nvmexn1pn # 格式化 Swap 分区
mkfs.btrfs -L myArch /dev/nvmexn1pn # 格式化 Btrfs 分区
```

#### 命令解析
* `mkfs.fat -F32 /dev/nvmexn1p<N>`
  * 创建一个 FAT32 文件系统。
  * 在现代使用 UEFI 引导的电脑上，主板固件（UEFI）需要一个特殊的分区来存放引导加载程序（Bootloader，比如 GRUB）。这个分区被称为 EFI 系统分区 (ESP)。UEFI 规范规定，这个分区必须是 FAT 格式（通常是 FAT32）。因为主板的固件很“笨”，它只认识这种简单、兼容性极高的文件系统格式。
  * 命令解读：
    * `mkfs.fat` 是 mkfs (MaKe FileSystem) 工具集中专门用来创建 FAT 文件系统的工具。
    * `-F32` 是一个专属于 `mkfs.fat` 的选项，明确告诉它要创建 32 位版本的 FAT，即 FAT32。
* `mkswap /dev/nvmexn1p<N>`
  * 初始化一个分区作为 Swap（交换）空间。
  * 这是一个独立的命令。因为 Swap 空间不是一个文件系统
    * 用户不能在 Swap 分区里创建文件或文件夹，也不能 cd 进去。
    * 它的作用是作为物理内存 (RAM) 的“溢出区”。当 RAM 不够用时，Linux 内核会把一些暂时不用的内存数据（称为“页”）写入到 Swap 分区，以释放 RAM 空间。
    * 因此，它的内部数据结构完全是为了高效地进行这种内存页面交换而设计的，和文件系统那种树状目录结构完全不同。
  * 命令解读：
    * `mkswap` (MaKe Swap) 不做文件系统，只在分区上写入 Swap 签名和元数据，让内核知道“嘿，这块地方是我的虚拟内存”。
* `mkfs.btrfs -L myArch /dev/nvmexn1p<N>`
  * 创建一个 Btrfs 文件系统。
  * 这是用来存放 Arch Linux 操作系统本身（根目录 `/`）和用户数据（`/home`）的通用文件系统。与 FAT32 相比，Btrfs 是一种非常现代和高级的文件系统，支持快照、数据压缩、校验和、内置 RAID 等复杂功能。
  * 命令解读：
    * `mkfs.btrfs` 是专门用来构建 Btrfs 复杂内部结构（如 B-树、子卷等）的工具。
    * `-L myArch` 是一个适用于很多现代文件系统的通用选项，意思是给这个分区设置一个“标签”(Label) 叫 myArch，方便识别。


### 创建子卷
#### 安装步骤
```bash
# 在 Btrfs 分区下创建子卷
mount -t btrfs -o compress=zstd /dev/nvmexn1pn /mnt # 先将 Btrfs 分区挂载到 /mnt 下
df -h # 使用 df 命令复查挂载情况
btrfs subvolume create /mnt/@ # 创建 / 目录子卷
btrfs subvolume create /mnt/@home # 创建 /home 目录子卷
btrfs subvolume list -p /mnt # 复查子卷情况
umount /mnt # 卸载掉 /mnt 以挂载子卷
```
#### 格式化 vs. 挂载
* 格式化是在一个原始的分区（一块裸露的硬盘空间）上建立文件系统的结构。
* 挂载 (mount) 是将一个已经格式化好的文件系统，接入 Linux 系统的主目录树 (`/`) 中的某一个点上。这个连接点就叫做挂载点 (mount point)。

#### 为什么必须先挂载
挂在之后分区才变得可见和可访问了：
* 对于操作系统来说，这个分区不再是一个抽象的设备文件 (`/dev/xxx`)，而是变成了一个可以 `cd` 进去、可以 `ls` 查看内容的目录 (`/mnt`)。
* 文件系统驱动开始工作。挂载操作会告诉 Linux 内核：`/mnt` 这个目录背后是一个 Btrfs 文件系统，请使用 Btrfs 的驱动程序来管理。
* 命令有了操作对象：此时，运行 `btrfs subvolume create /mnt/@` 这样的命令：
  * `btrfs` 命令通过 `/mnt` 这个入口，找到了它需要操作的那个 Btrfs 文件系统。
  * 它调用 Btrfs 的驱动，在这个文件系统内部执行“创建子卷”的操作。子卷 `@` 就像是在仓库里用隔离网划分出了一个新的、独立的区域。

#### `/mnt` 目录作用
在 Arch Linux 的 Live 环境中，/mnt 目录是一个特意为用户预留的、空的挂载点。它的存在就是为了让用户在安装过程中，将硬盘（或 SSD）上的目标分区挂载到这里，以便进行操作。这是一种在 Linux/Unix 世界里长期形成的惯例：
* `/mnt`：用于临时、手动挂载文件系统。
* `/media`：通常用于系统自动挂载可移动设备（比如插入另一个U盘或光盘）。


### Live 系统的目录结构和挂载分区
那么，Live 系统本身的文件和目录（比如根目录 `/`、`/usr`、`/bin` 等）并不像常规的 Linux 系统一样挂载物理分区，它主要运行在内存（RAM）里，利用了一种叫做 OverlayFS 的技术：根目录 `/` 是一个虚拟文件系统。

```
root@archiso ~ # df -h
Filesystem      Size  Used Avail Use% Mounted on
dev             1.9G     0  1.9G   0% /dev
run             2.0G  156M  1.8G   8% /run
/dev/sr0        756M  756M     0 100% /run/archiso/bootmnt
cowspace        256M  768K  256M   1% /run/archiso/cowspace
/dev/loop0      621M  621M     0 100% /run/archiso/airootfs
airootfs        256M  768K  256M   1% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
tmpfs           2.0G     0  2.0G   0% /tmp
tmpfs           2.0G  2.1M  2.0G   1% /etc/pacman.d/gnupg
tmpfs           392M     0  392M   0% /run/user/0
/dev/sda5        58G  3.0M   56G   1% /mnt
```

overlay 文件系统像“三明治”一样，由两层组成：
* 下层 (Lower Layer)：这是一个只读的层，它来自U盘中的一个叫做 `squashfs` 的高度压缩文件。这个文件包含了 Live 环境所需的全部系统文件和工具。
  * 即上述 `/dev/loop0      621M  621M     0 100% /run/archiso/airootfs`。
* 上层 (Upper Layer)：这是一个可写的层，它是一个 `tmpfs`，也就是一个完全存在于内存中的文件系统。
  * 即上述 `cowspace        256M  768K  256M   1% /run/archiso/cowspace`
* 最终效果：overlayfs 将这两层合并在一起，呈现给您的就是一个完整的、看起来可读可写的根目录 `/`。
  * 即上述 `airootfs        256M  768K  256M   1% /`

当用户修改文件或创建新文件时，所有变动都发生在内存中的“上层”。因此可以注意到 `airootfs` 和 `cowspace` 的资源占用情况是完全一样的。U盘上存放启动文件和 `squashfs` 镜像的那个物理分区，通常会被只读地挂载到某个特定的运行目录，即 `/dev/sr0 756M 756M 0 100% /run/archiso/bootmnt`。系统从这里启动，并加载了核心组件后，就切换到上面说的内存文件系统了。

`dev, run, tmpfs` 等都是 tmpfs (内存文件系统)，它们也都在内存中，执行自己的工作。而最后面的 `/dev/sda5` 是被挂载到 `/mnt` 上的 Btrfs 文件系统，这个文件系统存在于硬盘上。

## 文件系统挂载与系统安装
### 文件系统挂载
#### 安装步骤
```bash
mount -t btrfs -o subvol=/@,compress=zstd /dev/nvmexn1pn /mnt # 挂载 / 目录
mkdir /mnt/home # 创建 /home 目录
mount -t btrfs -o subvol=/@home,compress=zstd /dev/nvmexn1pn /mnt/home # 挂载 /home 目录
mkdir -p /mnt/boot # 创建 /boot 目录
mount /dev/nvmexn1pn /mnt/boot # 挂载 /boot 目录
swapon /dev/nvmexn1pn # 挂载交换分区
```

#### 挂载顺序说明
挂载顺序是遵循了一个最基本的原则：必须先挂载父目录，才能在其之上挂载子目录。可以把 Linux 的目录树想象成一棵真实的大树：必须先有主树干 (`/`)，才能在树干上长出大的分支 (`/home, /boot`)。

1. 将 Btrfs 分区 (`/dev/nvmexn1p<N>`) 中的 `@` 子卷挂载到 `/mnt`
2. 将同一个 Btrfs 分区中的 `@home` 子卷挂载到 `/mnt/home` 目录上
3. 将您的 EFI 分区（`/dev/nvmexn1p<M>`）挂载到 `/mnt/boot`
4. `swapon` 命令的执行顺序相对独立，它不涉及目录树挂载，所以可以在挂载文件系统之后（或之前）的任何时间点执行。但通常习惯上在文件系统挂载完毕后统一处理。
 
### 安装系统
```bash
pacstrap /mnt base base-devel linux linux-firmware btrfs-progs
```

作用是在准备好的分区上构建一个全新的、基础的 Arch Linux 系统。
* `pacstrap`：这是一个 Arch Linux 特有的安装脚本。这个名字是 `pacman` 和 `bootstrap`（引导）的结合，意思是用 `pacman` 包管理器来引导、建立一个新系统。
* `/mnt`：这是目标目录。`pacstrap` 会将新系统的所有文件和目录都安装到这里。
* `base base-devel ...`：跟在目标目录后面的所有参数都是软件包或者软件包组的名字。`pacstrap` 会将这些包以及它们的所有依赖包全部下载并安装到 `/mnt` 中。

### 生成 fstab 文件
```bash
genfstab -U /mnt > /mnt/etc/fstab
```

`fstab` 用来定义磁盘分区。它是 Linux 系统中重要的文件之一。上述命令使用 `genfstab` 自动根据当前挂载情况生成并写入 `fstab` 文件。因为我们挂载文件系统是在 Live 系统上进行的，而安装在计算机硬盘中的 Arch Linux 系统后续想要知道文件系统如何挂载在自己的目录树上，就需要 `fstab` 文件用于参考。

## 系统后续设置
```bash
# 把系统环境切换到新系统下
# 此时，原来安装盘下的 /mnt 目录就变成了新系统的 / 目录
arch-chroot /mnt
# 设置主机名
vim /etc/hostname
# 设置时区
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 将系统时间同步到硬件时间
hwclock --systohc
# 设置 Locale。Locale 决定了软件使用的语言、书写习惯和字符集
vim /etc/locale.gen
# 生成 locale
locale-gen
# 向 /etc/locale.conf 输入内容
echo 'LANG=en_US.UTF-8'  > /etc/locale.conf
# 为 root 用户设置密码
passwd root
# 安装微码
pacman -S intel-ucode # Intel
pacman -S amd-ucode # AMD
# 安装引导程序
pacman -S grub efibootmgr # 安装相应的包
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH # 安装 GRUB 到 EFI 分区
vim /etc/default/grub # 编辑 /etc/default/grub 文件
grub-mkconfig -o /boot/grub/grub.cfg # 最后生成 GRUB 所需的配置文件
# 完成安装
exit # 退回安装环境
umount -R /mnt # 卸载新分区
reboot # 重启
```