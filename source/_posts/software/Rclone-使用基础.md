---
title: Rclone 使用基础
tags:
  - rclone
  - webdav
categories:
  - Dev Tools
  - Software
cover: 'https://source.fomal.cc/img/default_cover_196.webp'
description: 记录一下 Rclone 的配置方式与用法
abbrlink: 811636f
date: 2026-03-03 20:02:55
---

## 云存储配置
如果希望配置云存储，可以先运行 `rclone config`，得到输出为：
```
Current remotes:

Name                 Type
====                 ====
Tbox                 webdav
cxftp                ftp

e) Edit existing remote
n) New remote
d) Delete remote
r) Rename remote
c) Copy remote
s) Set configuration password
q) Quit config
e/n/d/r/c/s/q>
```

`Current remotes` 即为当前已经创建过的云存储配置；在下方的 prompt 输入相应的字母即可进入下一步。

### 创建新配置
* 选择 `n` （新建 remote）。
* 输入名称（如 `Tbox`）。
* 然后会跳出来超级多存储类型选项，从中选择需要配置的云存储类型，（例如选择 WebDAV，则在 `Storage>` prompt 后面输入 `62`）
```
 1 / 1Fichier
   \ (fichier)
 2 / Akamai NetStorage
   \ (netstorage)
 3 / Alias for an existing remote
   \ (alias)
 4 / Amazon S3 Compliant Storage Providers including AWS, Alibaba, ArvanCloud, BizflyCloud, Ceph, ChinaMobile, Cloudflare, Cubbit, DigitalOcean, Dreamhost, Exaba, FileLu, FlashBlade, GCS, Hetzner, HuaweiOBS, IBMCOS, IDrive, Intercolo, IONOS, Leviia, Liara, Linode, LyveCloud, Magalu, Mega, Minio, Netease, Outscale, OVHcloud, Petabox, Qiniu, Rabata, RackCorp, Rclone, Scaleway, SeaweedFS, Selectel, Servercore, SpectraLogic, StackPath, Storj, Synology, TencentCOS, Wasabi, Zata, Other
   \ (s3)
 5 / Backblaze B2
   \ (b2)
 6 / Better checksums for other remotes
   \ (hasher)
 7 / Box
   \ (box)
... (中间省略一些)
61 / Union merges the contents of several upstream fs
   \ (union)
62 / WebDAV
   \ (webdav)
63 / Yandex Disk
   \ (yandex)
64 / Zoho
   \ (zoho)
65 / iCloud Drive
   \ (iclouddrive)
66 / premiumize.me
   \ (premiumizeme)
67 / seafile
   \ (seafile)
Storage> 
```

* 根据提示输入 WebDAV 服务器的地址 (`url`)、用户名 (`user`)、密码 (`pass`)。
* 对于其他高级设置，如果不确定，通常可以直接按回车使用默认值。
* 配置完成后，确认保存 (`y`)。

此时就可以对云存储的内容进行操作了。例如运行 `rclone lsd Tbox:/` 查看云存储中的内容。

### 已有配置查看
直接运行 `rclone config` 看到的信息比较简陋，因此可以运行 `rclone config show`，输出更加详细的信息：
```toml
[Tbox]
type = webdav
url = http://127.0.0.1:65472/
vendor = other
user = zxz
pass = 4tJdukYexWERg8oexoZ4iiv4r_2aDZMepH1Bqbi4b2BqLo

[cxftp]
type = ftp
port = 1484
user = pc
pass = 31mvT_D6sImcYOnHThoDe_tJA
host = 10.85.33.68
```

该信息和 `cat ~/.config/rclone/rclone.conf` 得到的结果完全一致。

{% note warning %}
`~/.config/rclone/rclone.conf` 里面记录的密码 `pass` 都是加密之后的结果，因此不要通过直接编辑该配置文件的方式添加或修改云存储配置，否则密码不可用。
{% endnote %}

## WebDAV 挂载
{% note info %}
[官方文档 rclone mount](https://rclone.org/commands/rclone_mount/)
{% endnote %}

在 Linux 中，如果希望将云存储挂载到本地，可以运行 
```bash
rclone mount remote:path/to/files /path/to/local/mount
```

其中 `/path/to/local/mount` 是一个空现有目录。例如
```bash
rclone mount Tbox:/ /mnt/Tbox/
```

就是将整个 `Tbox` 云存储的内容挂载到挂载点 `/mnt/Tbox/`。

如果需要从本地卸载该云存储，则需使用 `fusermount`：
```bash
fusermount -u /path/to/local/mount
```

### 挂载参数
为了实现比较好的挂载效果，需要进行一些设置，尤其是 VFS 文件缓存的设置：
> File systems expect things to be 100% reliable, whereas cloud storage systems are a long way from 100% reliable. The rclone sync/copy commands cope with this with lots of retries. However rclone mount can't use retries in the same way without making local copies of the uploads. Look at the VFS File Caching for solutions to make mount more reliable.

| 参数名称 | 说明与用途 | 常见值/示例 |
| :--- | :--- | :--- |
| **基本挂载参数** | | |
| `<remote>:<path>` | 远程存储名称和路径 | `dav:/` |
| `<local_path>` | 本地挂载点路径 | `/webdav` |
| `--daemon` | **后台守护进程**模式，允许命令在后台运行，关闭终端也不中断。 | |
| **权限与访问控制** | | |
| `--allow-non-empty` | 允许挂载到**非空目录**上。 | |
| `--log-level <LEVEL>` | 设置日志详细程度，调试时有用。 | `INFO`, `DEBUG` |
| `--log-file <FILE>` | 将日志输出到指定文件。 | `--log-file /var/log/rclone.log` |
| `--read-only` | **以只读模式挂载**，防止意外修改或删除远程文件。 | |

VFS 文件缓存设置：
| 参数 (Flags) | 默认值 | 作用描述 (Description) |
| :--- | :--- | :--- |
| `--vfs-cache-mode` | `off` | **VFS 缓存模式（WebDAV 必备参数）**。可选值：`off`、`minimal`、`writes`、`full`。为了使 VFS 层表现得像普通文件系统（尤其是处理需要同时读写、随机写入的应用程序），**强烈建议将 WebDAV 挂载设置为 `writes` 或 `full`**，否则许多常规文件操作会报错。 |
| `--vfs-cache-max-age` | `1h0m0s` | **缓存最大存活时间**。指定缓存中的文件对象在最后一次被访问后，能在本地磁盘保留的最长时间。 |
| `--vfs-cache-max-size` | `off` | **缓存最大容量**。限制本地 VFS 缓存所能占用的最大磁盘空间总大小（例如设置为 `10G`）。当达到上限时，rclone 会自动清理最旧的缓存文件。 |
| `--dir-cache-time` | `5m0s` | **目录缓存时间**。将目录条目（文件列表）在本地缓存的时间。在这段时间内，rclone 不会向 WebDAV 服务器发起重复请求，这能显著提高 `ls` 等目录列出命令的响应速度。 |
| `--buffer-size` | 系统限制 | **VFS 文件缓冲大小**。决定在内存中预先缓冲数据的大小。每个打开的文件会尝试在内存中保留这么多数据以加速读取。注意总内存使用量最高可达 `--buffer-size * 打开的文件数`。 |
| `--vfs-read-chunk-size` | `128M` | **分块读取大小**。从远程存储读取文件时按指定的块大小进行请求，而不是直接请求整个文件。这能减少不必要的数据下载和带宽消耗。 |
| `--vfs-read-ahead` | (未启用) | **VFS 预读大小**。在使用 `full` 缓存模式时，rclone 读取文件时除了在内存中缓冲外，还会在磁盘上提前预读指定大小的数据，以提高大文件顺序读取的性能。 |


运行示例：
```bash
rclone mount Tbox:/ /mnt/Tbox/ --cache-dir /mnt/Tbox_cache --allow-non-empty --vfs-cache-mode full --vfs-cache-max-size 10G --vfs-read-chunk-size 32M --dir-cache-time 30m
```

## 双向同步
{% note info %}
[官方文档 rclone bisync](https://rclone.org/commands/rclone_bisync/)
{% endnote %}

如果希望执行远程存储和本地的双向同步，可以运行：
```bash
rclone bisync remote1:path1 remote2:path2 [flags]
```

例如：
```bash
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory
```

### 参数说明

经常用到的重要参数：
| 参数 / 指令 | 可选值 / 示例 | 默认值 | 官方文档说明与实际作用 |
| :--- | :--- | :--- | :--- |
| `--dry-run` 或 `-n` | (作为开关参数，无值) | (不启用) | **测试运行（演练）。** 只在终端输出计划要执行的操作列表，绝对不会对本地或远端的文件进行任何实际的增删改。强烈建议在执行 `--resync` 前使用。 |
| `--verbose` 或 `-v` | (作为开关参数，无值) | (不启用) | **输出详细日志。** rclone 默认非常安静。加上此参数会输出 INFO 级别的日志，让你清楚地看到文件的扫描进度、比对逻辑和传输统计。 |


其他用到过的参数：
| 参数 / 指令 | 可选值 / 示例 | 默认值 | 官方文档说明与实际作用 |
| :--- | :--- | :--- | :--- |
| `--resync` | (作为开关参数，无值) | (不启用) | **执行强制重对齐。** 通常用于首次运行、更改了过滤规则或发生致命错误后修复数据库。如果不额外指定模式，它的行为等同于 `--resync-mode path1`。 |
| `--resync-mode` | `none`, `path1`, `path2`, `newer`, `older`, `larger`, `smaller` | `none` (若带有 `--resync` 则默认为 `path1`) | **指定重对齐 (Resync) 期间的覆盖策略。** 当两端不一致时，决定以哪一边为基准。例如 `path2` 表示无条件让远端（Path2）覆盖本地（Path1）。*注：只要指定了非 none 的值，就会隐式触发 `--resync`。* |
| `--conflict-resolve` | `none`, `path1`, `path2`, `newer`, `older`, `larger`, `smaller` | `none` | **自动处理日常同步中的冲突。** 当一个文件在两端同时被修改产生冲突时，决定保留哪个版本。默认 `none` 会保留冲突文件（加后缀）并报错退出；设置为 `newer` 会自动保留最后修改时间更近的版本。 |
| `--create-empty-src-dirs` | (作为开关参数，无值) | (不启用) | **同步空目录。** rclone 默认为了效率会忽略空文件夹。加上此参数后，一方创建或删除空文件夹的行为也会同步到另一方。 |

### 实际同步流程
在第一次运行的时候，需要进行一次强制对齐：
```bash
# 测试运行（不会真正修改文件）
# 第一个是本地同步到云端；第二个是云端同步到本地
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --resync --dry-run -v 
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --resync --resync-mode path2 --dry-run -v

# 实际运行（建立初始同步）
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --resync -v
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --resync --resync-mode path2 -v
```

后续同步正常运行即可
```bash
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory -v
```

如果某次同步遇到冲突，在不设置 `--conflict-resolve` 的情况下，rclone 会将产生冲突的文件重命名，通常会加上 `..path1` 和 `..path2` 的后缀保留在文件夹里。用户需要手动解决冲突，然后运行f
```bash
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --resync -v
```

重新对齐数据库，才能恢复正常的日常自动同步。

{% note warning %}
如果不加 `--resync-mode` 参数，`--resync` 的默认行为是以 Path1（即本地）为准去覆盖 Path2（即远端）。
不过考虑到用户通常在本地电脑上处理冲突，所以直接运行上面的命令是合理的。
{% endnote %}

### 创建 systemd 服务以实现自动同步
在 Arch Linux 上，个人用户目录下的文件同步推荐使用 Systemd User Service (用户级服务)。这样不需要 root 权限，且在用户登录后才会运行，较为安全。

#### 新建与使用 Service
首先创建 Service 文件：
```bash
vim ~/.config/systemd/user/rclone-laboratory-sync.service
```

写入
```toml
[Unit]
Description=Rclone Bisync for Laboratory Folder
# 确保在网络连接建立后才运行
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
# 这里是你日常双向同步的命令，加入了 --conflict-resolve newer 自动处理冲突
ExecStart=/usr/bin/rclone bisync /home/zxz/Data/laboratory Tbox:laboratory -v
# 限制重试次数，避免网络不好时无限卡住
ExecStartPost=/bin/sleep 1
```

再设置定时器文件以支持定时自动同步：
```bash
nano ~/.config/systemd/user/rclone-laboratory-sync.timer
```

```toml
[Unit]
Description=Timer for Rclone Laboratory Bisync

[Timer]
# 开机/用户登录后等待 3 分钟执行第一次（留出时间给 WebDAV 服务启动和网络连接）
OnBootSec=3min
# 之后每隔 15 分钟执行一次（你可以根据需要把 15min 改成 5min 或 30min）
OnUnitActiveSec=15min
# 即使错过了任务（比如电脑休眠了），唤醒后也会补全执行
Persistent=true

[Install]
WantedBy=timers.target
```

最后加载配置并使用定时器：
```bash
systemctl --user daemon-reload # 重新加载 systemd 用户配置
systemctl --user enable --now rclone-laboratory-sync.timer # 启用并立即启动 Timer
```

#### 常用维护命令
用于查看 systemd 模块的运行情况：
```bash
# 查看定时器下次运行的时间
systemctl --user list-timers --all | grep rclone
# 查看服务最近一次的运行日志，如果同步出错这里能看到 rclone 的报错
journalctl --user -u rclone-laboratory-sync.service -e
# 立刻手动触发一次同步
systemctl --user start rclone-laboratory-sync.service
```

### 同步时忽略特定文件夹
像 `.git`, `.venv` 这种文件夹里面包含大量小文件，不方便同步；同时里面的这些小文件在不同的设备中也不兼容。因此，使用 Rclone 做同步的时候推荐将这些文件夹忽略。同时为了方便后续维护，可以设置一个专门的规则文件用于过滤（类似 `.gitignore`）
```
mkdir -p ~/.config/rclone
nano ~/.config/rclone/filter-lab.txt
```

加入需要忽略的文件：
```
# === 版本控制 ===
- .git/**
- .svn/**

# === 依赖与虚拟环境 ===
- .venv/**
- node_modules/**

# === 缓存与构建产物 ===
- __pycache__/**
- *.py[cod]
- .pytest_cache/**
- *.class
- *.o
- *.out

# === 编辑器与系统垃圾 ===
- .vscode/**
- .idea/**
- *.swp
- *~
- .DS_Store
- Thumbs.db

# === 日志 ===
- *.log
```

用新规则重新建立连接：
```bash
rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --filter-from /home/zxz/.config/rclone/filter-lab.txt --resync --resync-mode path1 -v
```

修改 `~/.config/systemd/user/rclone-laboratory-sync.service` 文件，将 `ExecStart` 行改为：
```toml
ExecStart=/usr/bin/rclone bisync /home/zxz/Data/laboratory Tbox:laboratory --filter-from /home/zxz/.config/rclone/filter-lab.txt -v
```

重新加载 systemd 配置：
```bash
systemctl --user daemon-reload
```