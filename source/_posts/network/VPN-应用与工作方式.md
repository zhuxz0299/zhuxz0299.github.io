---
title: VPN 应用与工作方式
cover: 'https://source.fomal.cc/img/default_cover_191.webp'
tags:
  - tailscale
  - wireguard
  - vpn
  - strongswan
  - ikev2
categories:
  - System & Hardware
  - Network Practice
description: 由于同时有使用交大 VPN 连接校园网以及 Tailscale 实现异地组网的需求，因此研究一下 VPN 的配置以及工作方式。
abbrlink: 2415e5a2
date: 2026-01-25 01:22:10
---

基本的工作原理其实非常简单，就是利用隧道技术实现数据的加密与传输，参见[网络层-VPN(Virtual Private Network)](https://zhuxz0299.github.io/posts/769365ef.html#VPN-Virtual-Private-Network)。

## Linux 下 VPN 配置与工作
### StrongSwan 配置
交大 VPN 的[官方文档](https://net.sjtu.edu.cn/info/1200/3296.htm)推荐使用 strongswan 软件配置 VPN 协议 IKEv2，配置文件需要在 `/etc/swanctl/conf.d/` 下创建，这里创建一个名为 `sjtuvpn.conf` 的文件，内容为：
```conf
connections {
 vpn-staff {
  vips = 0.0.0.0,::
  remote_addrs = vpn.sjtu.edu.cn
  send_certreq = no
  local {
   auth = eap-peap
   eap_id = myname
   aaa_id = @radius.net.sjtu.edu.cn
  }
  remote {
   auth = pubkey
   id = %any
  }
  children {
   vpn-staff {
    remote_ts = 202.120.0.0/16, 10.0.0.0/8, 111.186.0.0/16
    esp_proposals = aes128-sha1-modp1024, aes128-sha2_256-modp1024, 3des-sha1-modp1024,default
   }
  }
  version = 2
  mobike = no
  proposals = aes128-sha1-modp1024, aes256-sha1-modp1024,3des-sha1-modp1024,default
 }
 
 vpn-student {
  vips = 0.0.0.0,::
  remote_addrs = stu.vpn.sjtu.edu.cn
  send_certreq = no
  local {
   auth = eap-peap
   eap_id = myname 
   aaa_id = @radius.net.sjtu.edu.cn
  }
  remote {
   auth = pubkey
   id = @stu.vpn.sjtu.edu.cn
  }
  children {
   vpn-student {
    remote_ts = 202.120.0.0/16, 10.0.0.0/8, 111.186.0.0/16
   }
  }
  version = 2
  mobike = no
 } 
}
secrets {
 eap-jaccount {
  id = myname
  secret = "mypassword"
 }
}
```
其中用户 jAccount 账号名假定为 myname，密码假定为 mypassword。

完成配置之后再到 `/etc/strongswan.d/charon` 底下找到 `revocation.conf` 以及其他几个和 sql 相关的插件配置，在里面设置 `load=no`，免得运行 VPN 的时候报错。

然后运行以下命令设置开机自启
```bash
sudo systemctl start strongswan
sudo systemctl enable strongswan  # 开机自启
```

如果修改了插件加载情况，则运行
```bash
sudo systemctl restart strongswan
```

重新加载。

{% note warning %}
[官方文档](https://net.sjtu.edu.cn/info/1200/3296.htm)在这里使用的是 `sudo ipsec restart` 命令，但是这个东西实在有些过时了，也不支持自启动；还有就是之前都在配置 StrongSwan，这里又跑回来使用 `ipsec` 命令，有点割裂。感觉还是使用 `strongswan` 服务靠谱一些。
{% endnote %}

再加载 `/etc/swanctl/conf.d/` 下的配置：
```bash
sudo swanctl --load-all
```

最后，如果开关 VPN 的命令记不住的话，可以写一个别名放在 `.zshrc` 里面：
```bash
alias sjtu-vpnup='sudo swanctl -i --child vpn-student'
alias sjtu-vpndown='sudo swanctl -t --ike vpn-student'
```

### StrongSwan 工作方式
StrongSwan 默认是隐形的——它直接挂在物理网卡上，用内核的 XFRM 框架来截获数据包。

同时在上面的 `/etc/swanctl/conf.d/sjtuvpn.conf` 配置中，有一行 `remote_ts = 202.120.0.0/16, 10.0.0.0/8, 111.186.0.0/16`，这个就是 StrongSwan 设置的分流规则。[官方文档](https://net.sjtu.edu.cn/info/1200/3296.htm)为了方便，原本直接设置 `remote_ts = 0.0.0.0/0,::/0` 让 VPN 代理所有流量，但是这会导致不同 VPN 之间的冲突，以及访问非校园网信息的卡顿。

#### 无线网卡新 IP
通过 `ip addr show` 可以看到无线网卡上有两个 IP 地址：
```
2: wlp0s20f3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 34:cf:f6:90:e7:c3 brd ff:ff:ff:ff:ff:ff
    altname wlx34cff690e7c3
    inet 10.131.147.51/24 brd 10.131.147.255 scope global dynamic noprefixroute wlp0s20f3
       valid_lft 1875sec preferred_lft 1875sec
    inet 111.186.54.51/32 scope global wlp0s20f3
       valid_lft forever preferred_lft forever
    inet6 2001:da8:8000:7100::3:31/128 scope global nodad
       valid_lft forever preferred_lft forever
    inet6 2409:891f:6b44:97e8:ba2e:f936:a167:2654/64 scope global dynamic noprefixroute
       valid_lft 6365sec preferred_lft 6365sec
    inet6 fe80::533e:d19:167a:b068/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```

可以看到既有连接了手机点的地址 `10.131.147.51/24`，又有通过 VPN 获得的虚拟地址 `111.186.54.51/32`，这两个地址的选择依赖于路由表。

#### 路由表
运行 `ip rule list` 可以查看系统中用到的路由表：
```
0:      from all lookup local
220:    from all lookup 220
5210:   from all fwmark 0x80000/0xff0000 lookup main
5230:   from all fwmark 0x80000/0xff0000 lookup default
5250:   from all fwmark 0x80000/0xff0000 unreachable
5270:   from all lookup 52
32766:  from all lookup main
32767:  from all lookup default
```

左边数字越小，优先级越高。其中路由表 220 即为 StrongSwan 使用的路由表。

查看路由表：`ip route show table 220`
```
10.0.0.0/8 dev wlp0s20f3 proto static src 111.186.54.51
throw 10.131.147.0/24 proto static
throw 100.90.131.9 proto static
throw 100.94.155.95 proto static
throw 100.100.100.100 proto static
throw 100.108.53.75 proto static
throw 100.118.249.39 proto static
111.186.0.0/16 dev wlp0s20f3 proto static src 111.186.54.51
throw 172.17.0.0/16 proto static
throw 172.18.0.0/16 proto static
202.120.0.0/16 dev wlp0s20f3 proto static src 111.186.54.51
```

可以看出发往几个校内地址的流量都走了 `111.186.54.51`，而几个 `throw` 则是 StrongSwan 先查询了本机的其他网卡占用的网段，将其扔到后续的路由表中处理。

#### XFRM 策略
运行
```bash
sudo ip xfrm policy
```

然后在输出结果中可以找到：
```
src 111.186.54.51/32 dst 202.120.0.0/16
        dir out priority 375423 ptype main
        tmpl src 2409:891f:6b44:97e8:ba2e:f936:a167:2654 dst 2001:da8:8000:7100::7
                proto esp spi 0xceb844a4 reqid 1 mode tunnel
src 202.120.0.0/16 dst 111.186.54.51/32
        dir fwd priority 375423 ptype main
        tmpl src 2001:da8:8000:7100::7 dst 2409:891f:6b44:97e8:ba2e:f936:a167:2654
                proto esp reqid 1 mode tunnel
src 202.120.0.0/16 dst 111.186.54.51/32
        dir in priority 375423 ptype main
        tmpl src 2001:da8:8000:7100::7 dst 2409:891f:6b44:97e8:ba2e:f936:a167:2654
                proto esp reqid 1 mode tunnel
src 111.186.54.51/32 dst 111.186.0.0/16
        dir out priority 375423 ptype main
        tmpl src 2409:891f:6b44:97e8:ba2e:f936:a167:2654 dst 2001:da8:8000:7100::7
                proto esp spi 0xceb844a4 reqid 1 mode tunnel
src 111.186.0.0/16 dst 111.186.54.51/32
        dir fwd priority 375423 ptype main
        tmpl src 2001:da8:8000:7100::7 dst 2409:891f:6b44:97e8:ba2e:f936:a167:2654
                proto esp reqid 1 mode tunnel
src 111.186.0.0/16 dst 111.186.54.51/32
        dir in priority 375423 ptype main
        tmpl src 2001:da8:8000:7100::7 dst 2409:891f:6b44:97e8:ba2e:f936:a167:2654
                proto esp reqid 1 mode tunnel
src 111.186.54.51/32 dst 10.0.0.0/8
        dir out priority 379519 ptype main
        tmpl src 2409:891f:6b44:97e8:ba2e:f936:a167:2654 dst 2001:da8:8000:7100::7
                proto esp spi 0xceb844a4 reqid 1 mode tunnel
src 10.0.0.0/8 dst 111.186.54.51/32
        dir fwd priority 379519 ptype main
        tmpl src 2001:da8:8000:7100::7 dst 2409:891f:6b44:97e8:ba2e:f936:a167:2654
                proto esp reqid 1 mode tunnel
src 10.0.0.0/8 dst 111.186.54.51/32
        dir in priority 379519 ptype main
        tmpl src 2001:da8:8000:7100::7 dst 2409:891f:6b44:97e8:ba2e:f936:a167:2654
                proto esp reqid 1 mode tunnel
```

等内容，`tmpl` 表示对数据进行加密/解密操作。例如：
```
src 111.186.54.51/32 dst 202.120.0.0/16
        dir out priority 375423 ptype main
        tmpl src 2409:891f:6b44:97e8:ba2e:f936:a167:2654 dst 2001:da8:8000:7100::7
                proto esp spi 0xceb844a4 reqid 1 mode tunnel
```

指的就是从本机 (111.186.54.51/32) 发往校园网公网 (202.120.0.0/16) 的内容，需要进行加密，并且通过 ipv6 传输。

#### 整体流程概述
{% note info %}
以下内容由 Gemini 3 Pro 整理生成 
{% endnote %}

第一幕：诞生与寻路 (The Application & Routing I)
1. 应用程序发起请求：你的浏览器创建一个 TCP 连接请求（SYN 包）。
    * 内容：“你好，我想连 `202.120.1.1` 的 `80` 端口。”
    * 此时的状态：这是一个裸数据包，还没有确定源 IP。
2. 询问路由管理员 (`ip rule`)：内核网络栈接手这个包，开始查路由。
    * 内核问：“这个包该怎么走？”
    * IP Rule（管理员）看了一眼规则表：“优先级 220 说，先去查 Table 220。”
3. 查阅 Table 220 (`ip route show table 220`) 内核打开 220 号路由表：
    * 第一步（避让）：先看有没有 `throw` 规则（Tailscale, 本地 Wi-Fi）。
        * 目标是 `202.120.1.1`，不属于 `10.131.x.x`，也不属于 `100.x.x.x`。没有被扔出去。
    * 第二步（匹配）：找到了规则 `202.120.0.0/16 ... src 111.186.54.51`。
    * 结论：“要去学校，得用虚拟身份（源 IP `111.186.54.51`），并准备从物理网卡 `wlp0s20f3` 出去。”

    此时数据包头部定型：
    * Source: `111.186.54.51` (你的校内虚拟 IP)
    * Dest: `202.120.1.1` (教务处)
    * Payload: HTTP 请求 (明文)

第二幕：拦截与易容 (XFRM Interception & Encapsulation)

4. 撞上安检口 (XFRM Policy Check)：就在数据包准备交给网卡驱动发送的前一微秒，它经过了 XFRM 检查点。
    * 内核拿着数据包的头部（源 `111.x`, 目的 `202.x`）去比对 XFRM 策略库。
    * 命中！发现一条策略：`src 111.186.54.51 dst 202.120.0.0/16 dir out tmpl ...`
    * 动作：拦截！策略要求必须使用 ESP 隧道模式封装。
5. 封装与加密 (Transformation) 内核把这个明文包扣下，开始“打包”：
    * 加密：使用协商好的密钥（`AES-256-GCM`）把整个原始包（连头带尾）加密成一堆乱码。
    * 加头：在乱码前面加上 ESP 头（IPsec 协议号 50）。
    * 换皮（关键）：StrongSwan 根据连接配置，给这堆加密数据套上了一个全新的 IP 头部。

    此时数据包变成了“新包”：
      * New Source: `2409:891f...` (你的物理 IPv6 地址，来自 Wi-Fi)
      * New Dest: `2001:da8...` (学校 VPN 服务器的 IPv6 地址)
      * Protocol: IPv6 (Next Header: ESP)
      * Payload: [ 加密后的乱码 (里面藏着刚才那个去教务处的包) ]

第三幕：二次寻路与发射 (Routing II & Transmission)

6. 第二次询问路由 (`ip rule & Main Table`) 现在内核手里拿的是一个要去“学校 VPN 服务器（公网 IPv6）”的包。它必须重新查一次路由。
    * Table 220：里查不到去 `2001:da8...` 的路。
    * Table Main：查到了！这是公网流量，走默认网关（IPv6网关）。
    * 结论：“从 `wlp0s20f3` 发给下一跳路由器。”

7. 物理发射
    * 数据包再次经过网卡出口。
    * XFRM 再次检查：源是物理 IP，目的是 VPN 服务器 IP。没有策略要求拦截这个公网包。
    * 放行：网卡驱动将电信号（或无线电波）发射出去。

第四幕：彼岸 (The Other Side)

8. 在学校服务器端
    * 学校服务器收到这个 IPv6 包。
    * 拆开 ESP 信封，解密，拿出了里面的 原始包（源 `111.x`，去 `202.x`）。
    * 学校服务器发现你是自己人（源 IP 是合法的校内虚拟 IP），于是把它转发给教务处。

9. 回程（Reply）
    * 教务处回复数据给 `111.186.54.51`。
    * 学校 VPN 服务器截获回复，加密，封包，发回给你的物理 IPv6 地址。
    * 你的电脑收到包，XFRM 解密 (`dir in`)，露出原始数据。
    * 浏览器收到 HTTP 响应，页面加载成功。

### Tailscale 工作方式
Tailscale 基本不需要手动配置，用户登录之后 Tailscale 会自动把 Wireguard 配置好。因此直接研究其工作方式。

#### 虚拟网卡 TUN
相比 StrongSwan 在内核层工作，Tailscale 会创建一个虚拟网卡 `tailscale0`，凡是发给这个虚拟网卡的流量后续都会交给 Tailscale 软件处理。

```
3: tailscale0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1280 qdisc fq_codel state UNKNOWN group default qlen 500
    link/none
    inet 100.91.189.19/32 scope global tailscale0
       valid_lft forever preferred_lft forever
    inet6 fd7a:115c:a1e0::2132:bd13/128 scope global
       valid_lft forever preferred_lft forever
    inet6 fe80::5147:5beb:2ebc:ab9a/64 scope link stable-privacy proto kernel_ll
       valid_lft forever preferred_lft forever
```

#### 路由表
运行 `ip rule list` 得到的路由表中，优先级为 `5210`, `5230`, `5250`, `5270` 的几个都属于 Tailscale。
```
0:      from all lookup local
220:    from all lookup 220
5210:   from all fwmark 0x80000/0xff0000 lookup main
5230:   from all fwmark 0x80000/0xff0000 lookup default
5250:   from all fwmark 0x80000/0xff0000 unreachable
5270:   from all lookup 52
32766:  from all lookup main
32767:  from all lookup default
```

{% note primary %}
Tailscale 的 rule 逻辑比较复杂，目的是为了配合 MagicDNS 和 Exit Node，不过我没有到，这里暂时先不深究。
{% endnote %}


运行 `ip route show table 52` 得到
```
100.90.131.9 dev tailscale0
100.94.155.95 dev tailscale0
100.100.100.100 dev tailscale0
100.108.53.75 dev tailscale0
100.118.249.39 dev tailscale0
```

这里的几个 IP 就是用户拥有的设备的 Tailscale 的虚拟地址。（除了 `100.100.100.100` 是 MagicDNS）

#### 整体流程概述
{% note info %}
以下内容由 Gemini 3 Pro 整理生成 
{% endnote %}

第一幕：被踢皮球的寻路

1. 应用程序发起
ping 程序请求连接 `100.90.131.9`。此时这是一个裸的 ICMP 数据包。

2. 第一次过安检 (ip rule)
内核网络栈接手，开始查路由策略：
   * 优先级 `220` (StrongSwan)：先查 Table 220。由于 StrongSwan 的 bypass-lan 机制，发现针对该 IP 的 `throw` 规则，将包扔回，不予处理。
   * 优先级 `5270` (Tailscale)：继续向下查，命中 Table 52。
   * 查 Table 52：发现规则指向 `tailscale0` 设备。结论是将包发送至虚拟网卡。

第二幕：穿越传送门

3. 进入虚拟网卡 (TUN Interface)
数据包进入 tailscale0 接口。StrongSwan 是直接在物理网卡操作，而 Tailscale 使用 TUN 设备。

4. 惊险一跃 (Context Switch)
数据包从内核空间转移到用户空间。后台运行的 `tailscaled` 进程接手该数据包。

第三幕：暗房操作

5. 查表与加密
`tailscaled` 进程在内存中处理数据：
   * 查通讯录：确认目标 IP 对应的物理地址和端口。
   * 加密：使用 ChaCha20-Poly1305 算法加密 ICMP 包。
   * 封装：将密文装进一个新的 UDP 数据包中。

6. 关键动作：打标记 (Fwmark)
在发送 UDP 包回内核前，`tailscaled` 给 socket 打上 `0x80000` 标记。这意味着这是已处理的合法包，要求系统直接放行。

第四幕：持证通关

7. 重新注入内核
`tailscaled` 将带有标记的 UDP 包交给操作系统发送。内核将其视为新包，重新进行路由查询。

8. 触发 VIP 规则 (Rule 5210)
内核再次遍历 `ip rule`：
   * 优先级 5210 抢答：规则匹配到 `0x80000` 标记。
   * 动作：指示直接查询 Main 表，跳过 StrongSwan 的 Table 220 和 Tailscale 的 Table 52。

9. 物理发送
   * 查 Main 表：找到默认网关。
   * 防火墙：Netfilter/IPTables 识别标记，放行。
   * 离去：UDP 包通过物理网卡发送至互联网。

第五幕：彼岸的镜像

10. 对方接收与还原
    * 接收：对方物理网卡收到 UDP 包，转交 `tailscaled`。
    * 解密：还原出原始 ICMP 请求，写入对方的 `tailscale0` 接口。
    * 交付：操作系统从虚拟网卡读取数据，交给应用层处理。

## Windows 下 VPN 配置与工作

### Windows 系统内置 VPN 配置
这里的配置相对简单：“连接名称”自己随便写一个；“服务器名称或地址”填写 `stu.vpn.sjtu.edu.cn`；“VPN 类型”选择 `IKEv2`；“登陆信息的类型”选择“用户名和密码”；最后的用户名和密码填写自己的 jAccount。

这里官方同样默认让所有流量走 VPN，因此需要额外的操作手动设置分流。首先运行：
```powershell
# 开启拆分隧道 (Split Tunneling)
Set-VpnConnection -Name "SJTU VPN" -SplitTunneling $true
```

让 VPN 支持路由。然后添加学校的路由网段：
```powershell
# 添加静态路由 (重启后依然有效)
# -DestinationPrefix: 学校网段
# -PassThru: 显示结果

Add-VpnConnectionRoute -ConnectionName "SJTU VPN" -DestinationPrefix 202.120.0.0/16 -PassThru
Add-VpnConnectionRoute -ConnectionName "SJTU VPN" -DestinationPrefix 10.0.0.0/8 -PassThru
Add-VpnConnectionRoute -ConnectionName "SJTU VPN" -DestinationPrefix 111.186.0.0/16 -PassThru
```

### Windows 内置 VPN 工作方式
#### PPP 适配器
运行 `ipconfig`，会看到多出来一个叫 `PPP 适配器` 的东西：
```
PPP 适配器 SJTU VPN:

   连接特定的 DNS 后缀 . . . . . . . :
   IPv6 地址 . . . . . . . . . . . . : 2001:da8:8000:7100::5:204
   本地链接 IPv6 地址. . . . . . . . : fe80::5:204%62
   IPv4 地址 . . . . . . . . . . . . : 111.186.44.11
   子网掩码  . . . . . . . . . . . . : 255.255.255.255
   默认网关. . . . . . . . . . . . . : 0.0.0.0
```

这里可以看到获得的学校内网的 IP。

{% note info %}
为什么叫 "PPP"？ 这是一个历史遗留问题。早期的拨号上网（Modem）和老式 VPN（PPTP/L2TP）都使用 PPP 协议。虽然现在的 IKEv2 协议底层其实不一定跑 PPP 封装，但因为它们都归 Windows 的 RAS (Remote Access Service) 子系统管理，所以 ipconfig 为了省事，经常统称它们为“PPP 适配器”。这只是个名字，不代表它真的在用古老的 PPP 协议传输。
{% endnote %}

从 `ipconfig` 的信息可以看出，与 StrongSwan 使用 XFRM 策略在物理网卡处直接拦截流量不同，Windows 创建了一个新的虚拟网卡。但是这个策略与 TUN 模式存在不同：
* Tailscale 的 TUN 模式：当内核把数据包扔进 TUN 时，运行在用户态的应用程序 Tailscale 会从 TUN 里面把数据读出来，然后进行加密处理，再发送出去。
* Windows 内置 VPN 的 PPP 适配器：内核把数据包扔给 PPP 适配器时，Windows 的 TCP/IP 协议栈和 IPsec 驱动可以直接在内核里截获这个包，再利用内核驱动进行加密封装，节省了“内核态”-“用户态”的切换过程。

#### 路由表
运行 `route print`，可以得到一张很大的路由表。与 Linux 分出很多张路由表不同，Windows 的这张路由表基本包含了所有路由。为简洁与方便理解，这里只放出 IPV4 的路由表：
```
IPv4 路由表
===========================================================================
活动路由:
          网络目标         网络掩码                网关             接口   跃点数
          0.0.0.0          0.0.0.0      10.131.147.110    10.131.147.78     35
         10.0.0.0        255.0.0.0            在链路上     111.186.44.11     26
     10.131.147.0    255.255.255.0            在链路上     10.131.147.78    291
    10.131.147.78  255.255.255.255            在链路上     10.131.147.78    291
   10.131.147.255  255.255.255.255            在链路上     10.131.147.78    291
   10.255.255.255  255.255.255.255            在链路上     111.186.44.11    281
     100.90.131.9  255.255.255.255            在链路上      100.90.131.9    261
    100.91.189.19  255.255.255.255            在链路上      100.90.131.9      5
    100.94.155.95  255.255.255.255            在链路上      100.90.131.9      5
  100.100.100.100  255.255.255.255            在链路上      100.90.131.9      5
    100.108.53.75  255.255.255.255            在链路上      100.90.131.9      5
   100.118.249.39  255.255.255.255            在链路上      100.90.131.9      5
        111.0.0.0        255.0.0.0            在链路上     111.186.44.11     26
      111.186.0.0      255.255.0.0            在链路上     111.186.44.11     26
     111.186.44.0  255.255.255.255      10.131.147.110    10.131.147.78     36
    111.186.44.11  255.255.255.255            在链路上     111.186.44.11    281
  111.186.255.255  255.255.255.255            在链路上     111.186.44.11    281
  111.255.255.255  255.255.255.255            在链路上     111.186.44.11    281
        127.0.0.0        255.0.0.0            在链路上         127.0.0.1    331
        127.0.0.1  255.255.255.255            在链路上         127.0.0.1    331
  127.255.255.255  255.255.255.255            在链路上         127.0.0.1    331
      172.30.32.0    255.255.240.0            在链路上       172.30.32.1    271
      172.30.32.1  255.255.255.255            在链路上       172.30.32.1    271
    172.30.47.255  255.255.255.255            在链路上       172.30.32.1    271
      202.120.0.0      255.255.0.0            在链路上     111.186.44.11     26
  202.120.255.255  255.255.255.255            在链路上     111.186.44.11    281
        224.0.0.0        240.0.0.0            在链路上         127.0.0.1    331
        224.0.0.0        240.0.0.0            在链路上     10.131.147.78    291
        224.0.0.0        240.0.0.0            在链路上       172.30.32.1    271
        224.0.0.0        240.0.0.0            在链路上     111.186.44.11    281
  255.255.255.255  255.255.255.255            在链路上         127.0.0.1    331
  255.255.255.255  255.255.255.255            在链路上     10.131.147.78    291
  255.255.255.255  255.255.255.255            在链路上       172.30.32.1    271
  255.255.255.255  255.255.255.255            在链路上     111.186.44.11    281
===========================================================================
永久路由:
  无
```

信息解释：
* **跃点数**：跃点数代表“成本”或“距离”，越小越优先。
  * 虽然默认路由 `0.0.0.0` 的跃点数很低，但是路由匹配优先使用最长前缀匹配原则，因此不用担心那些跃点数特别大的路由无法生效。
* **接口**：与 Linux 直接告知网卡名称不同，Windows 用这张网卡此时此刻拥有的 IP 地址代指网卡。例如接口 `111.186.44.11` 指代了 SJTU VPN 的虚拟适配器。
* **在链路上**：表示直连，不需要经过路由器（网关）。例如 `10.131.147.0    255.255.255.0    在链路上    10.131.147.78`，表示凡是发给 `10.131.147.xxx` 的数据，因为就在局域网里（这个 IP 应该是 5G 基站发的，和常规的局域网或许也有点区别），直接发，不用找路由器转发。

Windows 中特殊 IP 说明：
下面是 Windows 系统中常见的特殊 IP 地址及其用途总结。

| IP 网段 / 地址 | 常见名称 / 归属 | 详细解释 |
| :--- | :--- | :--- |
| `0.0.0.0` | 未指定 / 默认路由 | 在路由表中代表“所有其他不匹配的流量”（默认网关）。在监听端口时，代表“监听本机所有网卡”。 |
| `127.0.0.0/8` | 回环地址 (Loopback) | 最常见的是 `127.0.0.1` (`localhost`)。代表“本机自己”。流量不会经过物理网卡，直接在内核被接收。即便断网也能 ping 通。 |
| `172.17.x.x - 172.31.x.x` | Hyper-V / WSL2 / Docker | Windows 的虚拟化组件（Hyper-V）默认会从 B 类私有地址中随机抽取一个 `/20` 或 `/24` 的网段作为虚拟交换机的地址。每次重启或重置网络，这个段可能会变。 |
| `224.0.0.0 - 239.255.255.255` | 组播地址 (Multicast) | 用于局域网内的一对多通信。比如 SSDP (智能家居发现)、LLMNR (主机名解析) 等后台服务都会用到。 |
| `255.255.255.255` | 受限广播地址 | 代表“当前局域网内的所有主机”。发往这里的包会被广播给同一网段的所有设备。 |
