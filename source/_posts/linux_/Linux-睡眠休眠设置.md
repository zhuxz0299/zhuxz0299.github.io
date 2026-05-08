---
title: Linux 睡眠休眠设置
cover: https://source.fomal.cc/img/default_cover_151.webp
date: 2026-05-08 20:12:53
tags:
  - linux
  - systemd
  - suspend
  - hibernate
  - s2idle
  - swap
categories:
  - System & Hardware
  - Linux
description: 整理 Linux 下睡眠、休眠、s2idle、S3/deep 的区别，并以 Arch Linux 为例配置休眠和合盖后先睡眠再休眠。
abbrlink: 7e0b85a4
---

{% note info %}
主要参考：
- [Linux Kernel 文档 - System Sleep States](https://docs.kernel.org/admin-guide/pm/sleep-states.html)
- [systemd-sleep.conf](https://www.freedesktop.org/software/systemd/man/latest/systemd-sleep.conf.html)：睡眠、休眠等动作本身的策略配置。
- [logind.conf](https://man7.org/linux/man-pages/man5/logind.conf.5.html)：合盖、电源键等事件触发什么动作。
- [ArchWiki - Power management/Suspend and hibernate](https://wiki.archlinux.org/title/Power_management/Suspend_and_hibernate)
{% endnote %}

本文分成两部分：前半部分解释睡眠、休眠、`s2idle`、`deep`、S3 等概念；后半部分以 Arch Linux 为例，整理一套实际配置流程。

默认场景如下：

- 使用 `systemd`
- 使用 `GRUB`
- 使用 `mkinitcpio`
- 使用独立 `swap` 分区，而不是 `swapfile`

如果使用的是 `swapfile`，休眠还需要额外配置 `resume_offset=`，本文不展开。

## 睡眠、休眠与 S 状态

### suspend 与 hibernate 的区别

日常说的“睡眠”一般对应 `suspend`：系统暂停用户态程序，把大部分设备切到低功耗状态，内存里的状态仍然保留。优点是进入和唤醒都快；缺点是断电后内存内容会丢失，所以没有保存的工作也会丢失。

日常说的“休眠”对应 `hibernate`：系统把内存镜像写入磁盘，通常写到 `swap`，然后关机或进入接近关机的低功耗状态。优点是彻底断电也能恢复；缺点是进入和恢复都更慢，而且要求磁盘上有足够空间保存休眠镜像。

还有两个组合模式：

- `hybrid-sleep`：同时把状态写入磁盘并保持内存供电。正常唤醒时像睡眠一样快，彻底断电后仍然可以从磁盘恢复。
- `suspend-then-hibernate`：先睡眠，过一段时间后自动唤醒一次，再转入休眠。笔记本合盖后常用这个模式，短时间打开时恢复很快，长时间放包里又不至于耗光电。

在 systemd 中，对应命令是：

```bash
sudo systemctl suspend
sudo systemctl hibernate
sudo systemctl hybrid-sleep
sudo systemctl suspend-then-hibernate
```

### ACPI 的 S0 到 S5

很多文章会把 Linux 睡眠问题和 ACPI S 状态混在一起说。它们有关系，但不是一回事。ACPI S 状态大致描述的是整机电源状态：

| 状态 | 常见含义 | 说明 |
| --- | --- | --- |
| S0 | Working | 正常运行状态 |
| S0ix | Modern Standby / Low Power Idle | 机器仍处在 S0 框架内，但尽量让 CPU 和设备进入很深的空闲状态 |
| S1 | Standby | CPU 停止执行，内存保留，平台仍保留较多供电 |
| S2 | 更深的 Standby | 比 S1 更深，CPU 上下文通常不保留，实际机器上很少见 |
| S3 | Suspend to RAM | 传统睡眠，内存自刷新，大多数设备断电或进入低功耗 |
| S4 | Suspend to Disk / Hibernate | 内存镜像写入磁盘，也就是休眠 |
| S5 | Soft Off | 软关机 |

现在经常看到的争论是 S0ix 和 S3：很多新笔记本更偏向 Windows Modern Standby，也就是 S0ix 这一套；传统 Linux 用户熟悉的“睡眠”则常常指 S3 Suspend to RAM。

### Linux 里看到的是 s2idle、shallow、deep

Linux 内核在 `/sys/power/mem_sleep` 里暴露的是另一组名字：

```bash
cat /sys/power/mem_sleep
```

可能看到：

```text
[s2idle] deep
```

方括号表示当前默认值。上面的输出表示机器支持 `s2idle` 和 `deep`，当前默认使用 `s2idle`。

几个名字的含义如下：

| Linux 名称 | 大致对应 | 说明 |
| --- | --- | --- |
| `s2idle` | suspend-to-idle / S0ix 路线 | 纯软件主导的浅睡眠。内核冻结用户态、暂停计时、挂起设备，然后让 CPU 进入深度 idle。是否省电非常依赖设备和驱动是否配合 |
| `shallow` | standby | 对应较浅的平台待机状态，常见机器上不一定出现 |
| `deep` | suspend-to-RAM / S3 | 传统 S3 睡眠。内存保留，大量设备和平台逻辑下电，通常更省电，但更依赖 BIOS/UEFI 和 ACPI 实现质量 |

{% note warning %}
`s2idle` 里的 `s2` 不是 ACPI S2。它是 suspend-to-idle 的缩写，和 ACPI 表里的 S2 状态不是同一个概念。Linux 里通常也不会显示 `s3deep`，而是显示 `deep`。
{% endnote %}

### 为什么会“睡死”

所谓“睡死”，通常指机器合盖或手动睡眠后无法正常唤醒：黑屏、键盘灯不亮、风扇异常、只能长按电源键重启。它不是一个单独的错误类型，而是睡眠和唤醒链路里某一段没有配合好。

常见原因有几类：

- 固件问题：有些机器的 BIOS/UEFI 主要按 Windows Modern Standby 测试，S3 路径没有被充分维护。Linux 强行使用 `deep` 时，平台可能进得去但回不来。
- 驱动问题：GPU、Wi-Fi、蓝牙、NVMe、USB 控制器等设备在 suspend/resume 时没有正确保存和恢复状态。
- 唤醒源配置异常：某些 USB、蓝牙、网卡或触摸板可能无法正确唤醒机器，或者反复把机器唤醒，表现出来也像“睡眠不正常”。
- 内核、固件、NVIDIA 驱动等版本组合问题：睡眠恢复是非常吃平台细节的路径，版本变化可能导致回归。


所以没有一个对所有机器都正确的选择。经验上：

- `s2idle` 唤醒通常更快，也更符合新平台设计，但可能耗电明显。
- `deep` 往往更省电，但如果固件 S3 实现有问题，更容易“睡死”。

正确做法不是盲目迷信某一种，而是先看机器支持什么，再分别测试。

## 实际配置

### 查看和切换睡眠模式

查看当前支持的 `mem_sleep` 模式：

```bash
cat /sys/power/mem_sleep
```

输出示例：

```text
[s2idle] deep
```

含义是：当前默认是 `s2idle`，同时支持 `deep`。

可以临时切换后测试，重启后会恢复默认值：

```bash
echo deep | sudo tee /sys/power/mem_sleep
echo s2idle | sudo tee /sys/power/mem_sleep
sudo systemctl suspend
```

如果某个模式下出现无法唤醒、明显发热、掉电异常，就不要急着写成永久配置。

永久配置推荐写 systemd drop-in：

```bash
sudo mkdir -p /etc/systemd/sleep.conf.d
sudoedit /etc/systemd/sleep.conf.d/90-sleep.conf
```

如果确认 `deep` 在这台机器上稳定：

```ini
[Sleep]
MemorySleepMode=deep
```

如果 `deep` 会睡死，或者机器本来就是按 Modern Standby 设计，可以用：

```ini
[Sleep]
MemorySleepMode=s2idle
```

如果 `cat /sys/power/mem_sleep` 里根本没有 `deep`，那 systemd 配置也变不出来。需要去 BIOS/UEFI 里找类似选项：

- `S3`
- `Linux S3`
- `Modern Standby`
- `Sleep State`

有些机器的固件直接不再暴露 S3，这时 Linux 侧只能使用 `s2idle`。

### 配置 Linux 支持休眠

休眠要解决两个问题：

1. 内存镜像写到哪里，通常是 `swap`。
2. 下次开机早期，initramfs 怎么知道去哪里找这份镜像。

先确认当前启用的 swap，并查看目标 swap 分区的 UUID：

```bash
swapon --show
sudo blkid /dev/你的swap分区
# 例如：
sudo blkid /dev/nvme0n1p5
```

输出里会有：

```text
UUID="9e09ab44-748d-4905-8d09-fe92243ae6f5" TYPE="swap"
```

把这个 UUID 写进 GRUB 内核参数：

```bash
sudoedit /etc/default/grub
```

在 `GRUB_CMDLINE_LINUX_DEFAULT` 里追加 `resume=UUID=...`，不要覆盖原来已有的参数：

```ini
GRUB_CMDLINE_LINUX_DEFAULT="quiet resume=UUID=9e09ab44-748d-4905-8d09-fe92243ae6f5"
```

然后重新生成 GRUB 配置：

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

然后检查 `mkinitcpio` 的 `HOOKS`：

```bash
grep '^HOOKS=' /etc/mkinitcpio.conf
```

如果 `HOOKS` 里已经有 `systemd`，通常不需要再单独加入 `resume` hook。例如：

```ini
HOOKS=(base systemd autodetect microcode modconf kms keyboard keymap sd-vconsole block filesystems fsck)
```

如果走的是传统 busybox 路线，也就是 `HOOKS` 里没有 `systemd`，则需要加入 `resume`。位置应当在相关磁盘、解密、LVM 等 hook 之后，并且在 `filesystems` 之前。例如：

```ini
HOOKS=(base udev autodetect microcode modconf kms keyboard keymap consolefont block resume filesystems fsck)
```

如果修改了 `mkinitcpio.conf`，记得重建 initramfs：

```bash
sudo mkinitcpio -P
```

{% note info %}
较新的 systemd 和 mkinitcpio 在 UEFI 环境下可以通过 EFI 变量记录休眠位置，某些情况下不再必须手写 `resume=`。但手动写 `resume=UUID=...` 更明确，也更方便排错和指定具体 swap 分区。
{% endnote %}

改完 GRUB 后必须重启。重启后检查当前内核参数，再单独测试休眠：

```bash
cat /proc/cmdline
sudo systemctl hibernate
```

`/proc/cmdline` 里应当能看到：

```text
resume=UUID=9e09ab44-748d-4905-8d09-fe92243ae6f5
```

`systemctl hibernate` 应当先测通。否则后面的“合盖后先睡眠再休眠”也很难稳定。

### 配置先睡眠再休眠

`suspend-then-hibernate` 的行为由 `/etc/systemd/sleep.conf.d/*.conf` 控制。比如希望先睡眠，30 分钟后进入休眠：

```bash
sudoedit /etc/systemd/sleep.conf.d/90-sleep.conf
```

```ini
[Sleep]
MemorySleepMode=deep
AllowSuspendThenHibernate=yes
HibernateDelaySec=30min
```

如果插着电源时也希望到点后进入休眠，再加 `HibernateOnACPower=yes`。几个参数的分工是：

- `MemorySleepMode=deep`：执行 suspend 阶段时使用哪种 `mem_sleep`。
- `AllowSuspendThenHibernate=yes`：允许使用 `suspend-then-hibernate`。
- `HibernateDelaySec=30min`：先睡眠多久，再自动转入休眠。
- `HibernateOnACPower=yes`：接通 AC 电源时也执行延时休眠。

最后手动测试：

```bash
sudo systemctl suspend-then-hibernate
```

### 配置合盖动作

`sleep.conf.d` 只决定“睡眠动作怎么执行”，不决定“什么时候触发”。笔记本合盖由 `systemd-logind` 处理。

创建 drop-in 后，根据需要选择一个动作：

```bash
sudo mkdir -p /etc/systemd/logind.conf.d
sudoedit /etc/systemd/logind.conf.d/90-lid.conf
```

```ini
[Login]
# 合盖后普通睡眠
HandleLidSwitch=suspend

# 合盖后直接休眠
# HandleLidSwitch=hibernate

# 合盖后先睡眠，过一段时间再休眠
# HandleLidSwitch=suspend-then-hibernate
```

如果选择 `suspend-then-hibernate`，还需要和前面的 sleep 配置配合使用：

```ini
[Sleep]
MemorySleepMode=deep
AllowSuspendThenHibernate=yes
HibernateDelaySec=30min
```

两者关系可以这样理解：

- `/etc/systemd/logind.conf.d/90-lid.conf`：合盖时触发什么动作。
- `/etc/systemd/sleep.conf.d/90-sleep.conf`：这个动作具体怎么执行。

修改后最省心的生效方式是重启。尤其是前面已经改过 GRUB，本来就需要重启。
