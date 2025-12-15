---
title: Linux 中的 systemd 模块
cover: 'https://source.fomal.cc/img/default_cover_167.webp'
tags:
  - linux
  - systemd
description: Linux 中 systemd 模块的基本用法
abbrlink: 5bfe7acf
date: 2025-09-08 13:51:28
categories: [System & Hardware, Linux]

---

{% note info %}
部分参考：[ArchWiki-systemd](https://wiki.archlinux.org/title/Systemd)
{% endnote %}

简单来说，systemd 是一个现代化的系统和服务管理器，它已经成为了绝大多数主流 Linux 发行版的默认初始化系统。在 systemd 出现之前，大多数 Linux 系统使用一个叫做 SysVinit（通常简称为 “init”）的系统。SysVinit 的核心思想是顺序、串行地启动一系列脚本（位于 `/etc/init.d/`），这导致系统启动速度较慢，且难以管理复杂的服务依赖关系。

systemd 所称的 service 就是守护进程（daemon）：作为后台进程运行的程序（没有终端或用户界面），通常等待事件发生并提供服务。典型的例子包括等待请求以传递页面的 Web 服务器，或是等待有人尝试登录的 SSH 服务器。还有的守护进程负责诸如将消息写入日志文件（例如 `syslog` 、 `metalog` ）或保持系统时间准确（例如 ntpd）等任务。

## 主要特点与使用方法
### 主要特点
* 并行启动，提高速度：它可以并行启动尽可能多的服务，而不是像 SysVinit 那样一个接一个地等待。这极大地加快了系统的启动过程。
* 基于依赖关系的服务管理：例如，服务 A 需要网络先启动，systemd 就会先满足网络的需求，然后再启动服务 A。这使得服务管理更加智能和可靠。
* 更精细的管理单元（Units）：systemd 管理的对象不仅仅是服务（`.service`），还包括了许多其他类型的单元（Unit），每种都有对应的配置文件
  * 服务（`.service`）：后台服务程序。
  * 挂载点（`.mount`）：管理文件系统挂载。
  * 定时器（`.timer`）：替代 cron 的计划任务。
  * 套接字（`.socket`）：按需激活服务（当有连接到来时才启动服务）。
  * 路径（`.path`）：监控文件或目录的变化来触发服务。

### 使用方法
服务管理命令：`systemctl`
```bash
sudo systemctl start nginx.service    # 启动
sudo systemctl stop nginx.service     # 停止
sudo systemctl restart nginx.service  # 重启
sudo systemctl enable nginx.service   # 启用开机自启
sudo systemctl disable nginx.service  # 禁用开机自启
sudo systemctl status nginx.service   # 查看服务状态
```


系统日志中心：`journalctl`
```bash
journalctl -u nginx.service   # 查看某个服务的日志
journalctl -f                 # 实时追踪最新日志
```

## `.service` 单元文件
### 文件存放位置
systemd 会在多个目录中查找单元文件（比如 `.service` 文件）
* 系统核心目录
  * `/usr/lib/systemd/system/`
  * 这里是软件包管理器（如 pacman）在安装软件时存放其默认服务文件的地方。用户不应该直接修改这里的文件，因为软件包更新时可能会覆盖更改。
  * 关于 `/lib/systemd/system/`
    * 由于系统启动的引导流程问题，传统的 `/` 和 `/usr` 被认为是不同的分区，具有不同的用途。但是由于启动引导流程的改进，`/bin`, `/sbin`, `/lib` 全部合并到 `/usr` 目录下对应的位置。因此目前包管理器处理的所有的 systemd 单元文件实际上都存放在 `/usr/lib/systemd/system/`
    * 但是为了防止某些古早程序由于硬编码路径导致出错，系统会在根目录的 `/bin`, `/sbin`, `/lib` 位置创建指向 `/usr` 下对应文件的符号链接（symlink）。
* 系统管理员目录（推荐修改的位置）
  * `/etc/systemd/system/`
  * 这是系统管理员用于自定义和覆盖服务配置的主要目录。当用户想修改某个服务的默认行为或者想要创建一个新的服务时，应该在这里创建文件或子目录。
  * 修改服务服务的默认行为的配置覆盖问题：
    * 直接创建同名文件：在 `/etc/systemd/system/` 下创建一个与核心目录中同名的 `.service` 文件（例如 `nginx.service`），这将完全覆盖核心目录中的文件。
    * 创建附加配置目录：在 `/etc/systemd/system/<service_name>.service.d/` 目录下创建以 `.conf` 结尾的文件（例如 `override.conf`）。这是更推荐的做法，因为它只覆盖用户指定的参数，而其他参数依然继承自核心目录的原始文件。
* 运行时动态目录（内存中，重启失效）
  * `/run/systemd/system/`
  * 这个目录用于在系统运行时由其他程序动态生成的单元文件。这些文件在重启后就会消失。

### 文件结构与常用参数
`.service` 文件是一个基于文本的配置文件，遵循 INI 文件格式。它由几个部分组成，每个部分以 `[Section_Name]` 开头，包含一系列的 `Key=Value` 参数。

1. `[Unit]`：这一节定义了服务的元数据以及与其他单元之间的依赖关系。
   * `Description=`：服务的描述信息，用于 `systemctl status` 等命令的显示。
     * e.g. `Description=My Awesome Web Service`
   * `Documentation=`：提供服务的文档链接（如 man 手册或网址）。
     * e.g. `Documentation=man:nginx(8)`
   * `After=`：定义在哪些目标（target）或服务之后启动当前服务。这并不构成强依赖，只是调整启动顺序。
     * e.g. `After=network.target nss-lookup.target` （确保在网络就绪后启动）
   * `Before=`：定义在哪些目标或服务之前启动当前服务。
   * `Requires=`：定义强依赖关系。如果指定的单元启动失败或停止，当前服务也会失败或停止。
   * `Wants=`：定义弱依赖关系。希望指定的单元启动，但即使那些单元启动失败，当前服务也不会失败。这是最常用的依赖类型。
   * `Conflicts=`：定义冲突关系。如果指定的单元启动，当前服务就不能运行，反之亦然。
2. `[Service]`：这是服务定义的核心部分，定义了如何启动、停止和管理服务进程。
   * `Type=`：定义进程的启动类型，非常重要！
     * `Type=simple`：（默认值）systemd 认为你启动的进程就是主服务进程。
     * `Type=forking`：程序将自己 fork 到后台（daemonize）。systemd 需要追踪派生出来的子进程。传统守护进程常用此类型。
     * `Type=oneshot`：进程退出后服务才被认为启动成功。适用于只执行一次就退出的脚本。
     * `Type=notify`：服务在就绪后会通过 libsystemd 发送一个通知信号。推荐给支持此功能的新式守护进程使用。
   * `ExecStart=`：启动 (`systemctl start`) 服务时执行的命令和参数。必须使用绝对路径。
     * e.g. `ExecStart=/usr/sbin/nginx -g 'daemon off;'`
   * `ExecStop=`：停止 (`systemctl stop`) 服务时执行的命令。
     * e.g. `ExecStop=/usr/sbin/nginx -s stop`
   * `ExecReload=`：重载 (`systemctl restart`) 服务配置时执行的命令。
     * e.g. `ExecReload=/usr/sbin/nginx -s reload`
   * `Restart=`：定义在什么情况下服务失败后自动重启。
     * `Restart=always`：总是重启。
     * `Restart=on-failure`：仅在非正常退出时重启（退出码非0或被信号终止）。
     * `Restart=no`：（默认值）不自动重启。
   * `RestartSec=`：在重启服务前，等待的秒数。
     * e.g. `RestartSec=5`
   * `User=` 和 `Group=`：指定运行进程的用户和用户组，用于降权，增强安全。
     * e.g. `User=nginx` `Group=nginx`
   * `Environment=`：设置环境变量。
     * e.g. `Environment="VAR1=value1" "VAR2=value2"`
   * `WorkingDirectory=`：设置进程的工作目录。
3. `[Install]`：这一节定义了如何使用 `systemctl enable` 和 `systemctl disable` 命令来启用或禁用服务（即安装到某个启动目标）。
   * `WantedBy=`：最常用的参数。当使用 `systemctl enable` 时，会创建一个符号链接，将服务添加到指定的目标（target）的 `.wants` 目录中。最常见的就是 `multi-user.target`，表示多用户命令行界面。
     * e.g. `WantedBy=multi-user.target`
   * `RequiredBy=`：类似于 `WantedBy`，但建立的是强依赖关系。
   * `Alias=`：为服务启用一个别名。

### 示例
`tbox-webdav.service`：用于将 Tbox 提供的 API 转为 WebDAV 协议
```ini
[Unit]
Description=Tbox WebDAV Server
After=network.target

[Service]
ExecStart=/home/zxz/Applications/TboxWebdav/TboxWebdav.Server.AspNetCore

User=zxz
Group=wheel

Type=simple

Restart=on-failure
RestartSec=5s

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

`rclone-tbox-webdav.service`：使用 rclone 将 WebDAV 服务挂载到本地
```ini
[Unit]
Description=Mount WebDAV directory using rclone
After=network-online.target tbox-webdav.service
Requires=network-online.target tbox-webdav.service

[Service]
User=zxz
Group=wheel
Type=notify
ExecStart=/usr/bin/rclone mount Tbox:/ /mnt/Tbox/ --cache-dir /mnt/Tbox_cache --allow-non-empty --vfs-cache-mode full --vfs-cache-max-age 2h --vfs-cache-max-size 5G --vfs-read-chunk-size 64M --buffer-size 64M
ExecStop=/usr/bin/fusermount -u /mnt/Tbox

[Install]
WantedBy=multi-user.target
```
