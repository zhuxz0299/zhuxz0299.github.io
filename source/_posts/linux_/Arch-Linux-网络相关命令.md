---
title: Arch Linux 网络相关命令
cover: 'https://source.fomal.cc/img/default_cover_177.webp'
tags:
  - arch linux
  - network manager
abbrlink: 488724ec
date: 2025-11-05 18:51:52
description:
---

## NetworkManager
`NetworkManager` (NM) 是现代 Linux 桌面网络管理的基石。它是一个系统后台服务 (daemon)，因此可以通过
```bash
systemctl status NetworkManager
```

查看工作状态。

`NetworkManager` 的核心工作是让网络“自动工作”，它会自动检测硬件（“发现了一张 Wi-Fi 网卡”、“一根网线插进来了”），自动扫描，自动连接到你配置好的网络，并自动从 DHCP 服务器获取 IP、网关和 DNS。

### nmcli
`NetworkManager` 的命令行工具。

#### WiFi 连接命令
下述常用命令能够在图形界面抽风的时候解决 WiFi 连接的问题。
```bash
nmcli device status # 列出所有网络硬件（网卡）及其状态
nmcli device wifi list # 列出扫描到的所有 Wi-Fi
nmcli device wifi rescan # 强制重新扫描 Wi-Fi
nmcli device wifi connect <SSID> password <password> # 连接到 Wi-Fi
nmcli device disconnect <device> # 断开某个接口的连接 (比如 Wi-Fi 网卡 wlp0s20f3)
```

除此之外还有开启和关闭网络的命令：
```bash
# 彻底关闭/开启 NetworkManager 的网络管理（总开关）
nmcli networking off
nmcli networking on

# 单独关闭/开启 Wi-Fi 硬件
nmcli radio wifi off
nmcli radio wifi on
```

#### 连接信息查看
运行
```bash
nmcli device show <device>
```

可以得到类似下文的输出，基本包含了连接的所有信息：
```
 nmcli device show wlp0s20f3
GENERAL.DEVICE:                         wlp0s20f3
GENERAL.TYPE:                           wifi
GENERAL.HWADDR:                         34:CF:F6:90:E7:C3
GENERAL.MTU:                            1500
GENERAL.STATE:                          100（已连接）
GENERAL.CONNECTION:                     SJTU
GENERAL.CON-PATH:                       /org/freedesktop/NetworkManager/ActiveConnection/4
IP4.ADDRESS[1]:                         10.181.226.126/15
IP4.GATEWAY:                            10.180.0.1
IP4.ROUTE[1]:                           dst = 10.180.0.0/15, nh = 0.0.0.0, mt = 600
IP4.ROUTE[2]:                           dst = 0.0.0.0/0, nh = 10.180.0.1, mt = 600
IP4.DNS[1]:                             202.120.2.101
IP4.DNS[2]:                             202.120.2.100
IP6.ADDRESS[1]:                         2403:d400:1000:12:8190:209b:c7e4:5ea9/64
IP6.ADDRESS[2]:                         fe80::2cd8:f81e:3dfc:93e5/64
IP6.GATEWAY:                            fe80::56c6:ffff:fe7b:5802
IP6.ROUTE[1]:                           dst = fe80::/64, nh = ::, mt = 1024
IP6.ROUTE[2]:                           dst = 2403:d400:1000:12::/64, nh = ::, mt = 600
IP6.ROUTE[3]:                           dst = ::/0, nh = fe80::56c6:ffff:fe7b:5802, mt = 600
IP6.DNS[1]:                             2001:da8:8000:1:202:112:26:40
IP6.DNS[2]:                             2001:da8:8000:1:202:120:2:101
```

如果连接的是以太网，还会有一个 `GENERAL.SPEED` 字段表示协商速率；对于 WiFi 来说，`nmcli device wifi list` 中会给出各个 WiFi 的一个估算速率。

如果想要知道 IP 地址的获取方式（自动还是手动），可以运行
```bash
nmcli connection show <SSID> | grep method
```

输出信息类似下文：
```
 nmcli connection show SJTU | grep method
802-11-wireless-security.wps-method:    0x0（default）
ipv4.method:                            auto
ipv6.method:                            auto
proxy.method:                           none
```

### 图形界面
`nm-connection-editor` 和 `gnome-control-center` 等都是常用的图形界面，这些提供的都是前台的交互，实际的工作依然由 `NetworkManager` 执行。


## iproute2
`iproute2` 是现代 Linux 内核中用于网络配置的核心工具包。它取代了上一代的老工具（统称为 `net-tools`），比如 `ifconfig`, `route`, `arp`, `netstat` 等。

### ip 命令

#### ip link (管理网络设备)
这组命令用于查看和管理你的网络接口（网卡）本身。

```bash
ip link show # 列出系统上所有的网络接口（wlp0s20f3, enp3s0, lo 等）
ip l # 同上
ip link set dev <device> up # 启动一个网络接口。
ip link set dev <device> down # 关闭一个网络接口。
```

#### ip addr (管理 IP 地址)
这组命令用于管理接口上的 IP 地址。这是 `ip` 命令最常用的功能之一。

```bash
ip addr show # 显示所有接口及其绑定的所有 IP 地址
ip a # 同上
ip addr show dev <device> # 只显示特定接口（例如 wlp0s20f3）的 IP 地址信息。
ip addr add <ip/mask> dev <device> # 为一个接口添加一个 IP 地址
# 注：ip 允许一个接口拥有多个 IP 地址
ip addr del <ip/mask> dev <device> # 为一个接口删除一个 IP 地址
ip addr flush dev <device> # 清空一个接口上的所有 IP 地址（常用于重置）
```

输出信息解释：
```
 ip addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute
       valid_lft forever preferred_lft forever
2: wlp0s20f3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 34:cf:f6:90:e7:c3 brd ff:ff:ff:ff:ff:ff
    altname wlx34cff690e7c3
    inet 192.168.1.120/24 brd 192.168.1.255 scope global dynamic noprefixroute wlp0s20f3
       valid_lft 6036sec preferred_lft 6036sec
    inet6 fe80::43e1:ac02:ff76:b716/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```
* `lo (Loopback)`: 表示一个虚拟的网络接口，不对应任何物理硬件。访问 `127.0.0.1` 或 `localhost` 时，就是在和这个接口通信。主要用于程序测试和内部服务。
  * `<LOOPBACK,UP,LOWER_UP>`:
    * `LOOPBACK`: 回环接口。
    * `UP, LOWER_UP`: 接口是激活的（`lo` 总是激活的）。
  * `inet 127.0.0.1/8`: IPv4 地址。
  * `inet6 ::1/128`: IPv6 地址，是 `localhost` 的 IPv6 版本。
  * `valid_lft forever`: `lft` (lifetime) 指的是租期。`forever` 表示这个地址永不过期。
* `wlp0s20f3`: 物理 Wi-Fi 网卡在 Linux 上的名称。
  * `<BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000`
    * `BROADCAST,MULTICAST` 表示网卡有能力发送“广播”和“多播”数据包
    * `UP` 表示接口启用（`ip link set ... up`）
    * `LOWER_UP` 表示物理层已接通（WiFi：成功连接并认证；有线网：网线插好并协商成功）。
    * `mtu 1500`: MTU (Maximum Transmission Unit)。网卡能发送的最大数据包大小。1500 字节是 Wi-Fi 和以太网的标准值。
    * `qdisc noqueue`
      * `qdisc`: (Queueing Discipline)，排队规则，决定内核接收数据包的顺序。
      * `noqueue`: 表示内核层面不排队。常见于 Wi-Fi 设备，内核只是简单地把包扔给硬件，由硬件自己去管理队列。
    * `state UP`: 一个综合状态，是 `UP` 和 `LOWER_UP` 都为 `true` 时的结果
    * `qlen 1000`: (Queue Length)，传输队列的长度。如果 `qdisc` 不是 `noqueue`，这里就定义了队列能缓存多少个包。
  * `link/ether 34:cf:f6:90:e7:c3 brd ff:ff:ff:ff:ff:ff`
    * `34:cf:f6:90:e7:c3`: 网卡的 MAC 地址 (硬件地址)。
    * `brd ff:ff:ff:ff:ff:ff`: 物理层的广播地址。所有发往这个 MAC 地址的包，都会被局域网上的设备接收（`BROADCAST` 标志的实际应用）。
  * `inet 192.168.1.120/24 brd 192.168.1.255 scope global dynamic noprefixroute wlp0s20f3`
    * `inet`: 表示 IPv4 地址。
    * `192.168.1.120/24`: IP 地址和子网掩码。
    * `brd 192.168.1.255`: `192.168.1.0/24` 这个子网的广播地址。
    * `scope global`: `global` 表示这个 IP 是一个标准的公网或私网 IP，可以用来和局域网及（通过网关）互联网通信。
    * `dynamic`: 表示这个 IP 是动态获取的 (通过 DHCP)。
    * `noprefixroute`: 一个内核标志，告诉系统不要自动为这个 IP 的子网 (192.168.1.0/24) 创建路由。
  * `valid_lft 6036sec preferred_lft 6036sec`
    * `link/ether`: 一个使用以太网 MAC 地址的接口
    * `valid_lft` (Valid Lifetime): 租期有效时间。这个 IP 在 6036 秒后会失效
    * `preferred_lft` (Preferred Lifetime): 在这段时间内，系统会用这个 IP 发起新连接。
  * `inet6 fe80::43e1:ac02:ff76:b716/64 scope link noprefixroute`
    * `inet6`: 表示 IPv6 地址。
    * `scope link`: `link` 表示这是一个“链路本地地址”(Link-Local)，不能用于访问互联网，仅用于局域网内部通信


#### ip route (管理路由表)
```bash
ip route show # 显示当前的路由表
ip route add <target_ip/mask> via <gateway> # 见下面的例子
sudo ip route add 10.0.0.0/8 via 192.168.1.1 # 所有发往 10.x.x.x 的包都扔给 192.168.1.1
ip route add default via <gateway> # 添加默认网关
ip route del default # 删除默认网关
ip route get <target_ip> # 查询内核会如何路由一个去往特定 IP 的数据包（基本就是返回网关）
```

输出信息解释：
```
 ip route show
default via 192.168.1.1 dev wlp0s20f3 proto dhcp src 192.168.1.120 metric 600
192.168.1.0/24 dev wlp0s20f3 proto kernel scope link src 192.168.1.120 metric 600
```

### ip 和 nmcli 的关系
`nmcli` 是上层的网络管理工具；ip 是底层的配置工具。`nmcli` 在幕后会使用 `ip` (或类似的功能) 来完成实际的工作。