---
title: Clash Verge rev 使用与配置
tags:
  - proxy
  - software
  - clash
description: 介绍 Clash 配置文件的部分写法以及 Clash Verge rev 软件使用时需要注意的一点问题
cover: https://source.fomal.cc/img/default_cover_144.webp
categories:
  - Dev Tools
  - Software
abbrlink: 9b558b7c
date: 2026-01-17 19:11:10
---

## 名词解释
{% note info %}
来自 [Clash Verge Rev Docs](https://www.clashverge.dev/guide/term.html)
{% endnote %}

### 系统代理 / Tun 模式
系统代理：
* 说明
  1. 代理程序会在系统“约定”的特定位置（如注册表、系统变量等）**设置好代理程序监听请求的端口信息**，进行网络请求的应用会自发性地尝试读取这部分信息，并将请求发送至代理程序。不同操作系统的“约定”方式各异。
  2. 系统代理更像是一种行业内的“约定”，并非所有程序都遵守这种非强制性的“约定”，最终采取哪种方式发生请求往往取决于开发人员的意愿。（就比如说 Chrome, Firefox 等浏览器可能默认会走系统代理，但是命令行的一些工具则需要单独配置代理。）
* 特点
  1. 具有自发性，网络请求程序尝试使用“约定”配置或使用网络请求程序里额外指定的配置。
  2. 不能代理UDP流量（如游戏数据包）。

Tun 模式（实现透明代理的一种重要方式）
* 说明
  * 代理程序会创建一张虚拟网卡，通过**配置操作系统的路由**将网络请求重定向到这张虚拟网卡，代理程序从虚拟网卡中读取并处理这些网络请求。
* 特点
  1. 拦截和处理所有流量(TCP/UDP)重定向到本地的代理程序。
  2. 网络请求程序无需额外配置。

### Meta 内核
一般指 Clash Meta，也称 `Meta`、 `Mihomo` 内核。区别于 `Clash Premium` 为闭源内核，`Mihomo` 为开源内核。

### CFW
一般指 Clash For Windows，是一款的基于 `Clash Premium` 内核的全平台代理软件（虽然叫做 For Windows）。2023 年 11 月 2 日宣布停止更新，并删除发布仓库。


## 使用注意事项
{% note primary %}
以下讨论基于的 Clash Verge rev 版本为 v2.4.0。
{% endnote %}

### 配置文件
#### 修改配置文件
虽然通过“设置”-“Verge 高级设置”-“配置目录”可以打开一个有很多配置文件的目录，但是这里面的文件是会在订阅更新的时候自动更新的，所以不要在这里面修改配置。

如果需要修改配置，比较直接的方式是在“订阅”中找到目前在用的订阅，然后右键并点击“编辑文件”，在这个配置文件里进行修改。需要修改的内容比较多的话，也可以重新写一个 `.yaml` 文件上传。

#### 上传配置文件
不知道是不是软件 bug，有时候配置文件无论是通过拖动还是点击“新建”都无法上传到软件中，这个时候关闭软件重新打开自己好了。

### Gemini 代理
尝试过 blackmatrix7 的 [Gemini 代理规则](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Gemini/Gemini.yaml)，会遇到 `ip A≠B` 这种问题。已经有用户提出了 [issue](https://github.com/blackmatrix7/ios_rule_script/issues/1600)，但是依照 issue 里的方法依然会遇到这个问题。

最后没招了，只能把 `www.google.com` 加到 Gemini 代理组里面。

## 配置文件
目前参考的是 [Rabbit-Spec](https://github.com/Rabbit-Spec/Clash) 的配置文件，除此之外还有一个 [lazy_script.js](https://gist.github.com/dahaha-365/0b8beb613f8d1ee656fe1f21e1a07959) 挺全面的，以后可以试试。

### 语法基础
首先 yaml 是 json 的超集，所以配置文件中会出现一些 json 语法

其次 yaml 中有一个语法会在配置文件中经常使用：“锚点”（Anchor `&`）和“引用”（Alias `*`），加上经常配合使用的“合并”（Merge `<<`）。

举例：
* `&` 锚点 (Anchor) —— 定义变量
  ```yaml
  # 就像编程里的：var my_setting = { interval: 300, url: '...' }
  基本设置: &my_setting
    interval: 300
    url: "http://google.com"
  ```
* `*` 引用 (Alias) —— 使用变量
  ```yaml
  # 就像编程里的：use(my_setting)
  下载任务:
    *my_setting  # <--- 这里等同于把上面那两行直接写在这里
  ```
* `<<` 合并 (Merge Key) —— 继承并修改
  ```yaml
  下载任务2:
    <<: *my_setting  # 先继承上面的 interval: 300 和 url
    interval: 600    # 然后把 interval 改成 600 (覆盖)
    new_item: true   # 再加个新属性
  ```

### 多订阅链接
在 `proxy-providers` 底下加上多个 provider，就能把多个机场的节点放到一起来用。参数 `proxy: DIRECT` 能够让代理软件在更新订阅的时候直连访问订阅链接，这个参数有时候不能落掉，否则会无法正常更新订阅。

```yaml
proxies:

# 锚点 - 节点订阅的参数
NodeParam: &NodeParam {type: http, interval: 86400, health-check: {enable: true, url: 'http://connectivitycheck.gstatic.com/generate_204', interval: 60}, proxy: DIRECT}

# 锚点 - 节点订阅 (在这里填你的机场链接)
proxy-providers: 
  provider1:
    url:  # 订阅链接
    <<: *NodeParam
    path: './proxy_provider/Provider1.yaml'
  provider2:
    url:  # 订阅链接2
    <<: *NodeParam
    path: './proxy_provider/Provider2.yaml'
```

### 节点筛选
如果机场管理员给各个节点提供了比较规范的名字，那么可以使用一些筛选逻辑进行筛选。

```yaml
# 锚点 - 节点筛选组
FilterHK: &FilterHK '^(?=.*((?i)🇭🇰|香港|(\b(HK|Hong)\b))).*$'
FilterJP: &FilterJP '^(?=.*((?i)🇯🇵|日本|川日|东京|大阪|泉日|埼玉|(\b(JP|Japan)\b))).*$'
# ... 太长了，中间省略一部分
FilterAll: &FilterAll '^(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|(\b(USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$'
```

### 策略组
下面的部分决定了软件的“代理”栏最后呈现出来的是怎样的。

首先最底下的部分就利用了节点筛选规则，把名字为不同国家的节点筛选到不同的策略组里面，例如 `{name: 🇭🇰 香港节点, <<: *FallBack, filter: *FilterHK}`，这个策略组由于使用了预定义 `*FallBack`，其中包含 `type: fallback`，因此会自动选择延时最短的节点，无法手动选择。

如果希望在软件的“代理”栏中可以手动选择，那应当设置 `type: select`。

```yaml
# 锚点 - 故障转移参数
FallBack: &FallBack {type: fallback, interval: 10, lazy: true, url: 'http://connectivitycheck.gstatic.com/generate_204', disable-udp: false, timeout: 3000, max-failed-times: 3, hidden: true, include-all-providers: true}
Manual: &Manual {type: select, include-all-providers: true}
# 锚点 - 规则参数
RuleSet: &RuleSet {type: http, behavior: classical, interval: 86400, format: yaml, proxy: Proxy}

# 策略组
proxy-groups: 
  - {name: 🦈 JMS 专用, type: select, include-all: true, filter: '(?i)JMS', icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png'}
  - {name: Proxy, type: select, proxies: [🦈 JMS 专用, 🇭🇰 香港节点, 🇯🇵 日本节点, 🇰🇷 韩国节点, 🇸🇬 新加坡节点, 🇺🇸 美国节点, 🇬🇧 英国节点, 🇫🇷 法国节点, 🇩🇪 德国节点], icon: 'https://raw.githubusercontent.com/pompurin404/mihomo-party/master/resources/icon.png'}
  - {name: Apple, type: select, proxies: [DIRECT, Proxy, 🦈 JMS 专用, 🇭🇰 香港节点, 🇯🇵 日本节点, 🇰🇷 韩国节点, 🇸🇬 新加坡节点, 🇺🇸 美国节点, 🇬🇧 英国节点, 🇫🇷 法国节点, 🇩🇪 德国节点], icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_1.png'}
  # ... 太长了，中间省略一部分
  - {name: GlobalMedia, type: select, proxies: [Proxy, 🦈 JMS 专用, 🇭🇰 香港节点, 🇯🇵 日本节点, 🇰🇷 韩国节点, 🇸🇬 新加坡节点, 🇺🇸 美国节点, 🇬🇧 英国节点, 🇫🇷 法国节点, 🇩🇪 德国节点], icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ForeignMedia.png'}

  - {name: 🇭🇰 香港节点, <<: *FallBack, filter: *FilterHK}
  - {name: 🇯🇵 日本节点, <<: *FallBack, filter: *FilterJP}
  - {name: 🇰🇷 韩国节点, <<: *FallBack, filter: *FilterKR}
  - {name: 🇸🇬 新加坡节点, <<: *FallBack, filter: *FilterSG}
  - {name: 🇺🇸 美国节点, <<: *Manual, filter: *FilterUS}
  - {name: 🇬🇧 英国节点, <<: *FallBack, filter: *FilterUK}
  - {name: 🇫🇷 法国节点, <<: *FallBack, filter: *FilterFR}
  - {name: 🇩🇪 德国节点, <<: *FallBack, filter: *FilterDE}
```

### 分流规则
* `rule-providers` 底下包含的是订阅得到的分流规则，这样可以避免在 `rules` 底下自己写一大堆东西。
* `rules` 底下是生效的规则。需要注意：
  * `rule-providers` 必须在 `rules` 里面使用，否则不会生效。
    * 例如 `RULE-SET,Apple,Apple`：`RULE-SET` 表示使用订阅得到的规则，第一个 `Apple` 为 `rule-providers` 底下的名称，第二个 `Apple` 为 `proxy-groups` 底下的名称。
    * 这就完成了一个“节点”→“策略组”→“分流规则”的绑定。
  * 规则生效优先级：最前面的优先生效。
    * 例如最前面是 `"DOMAIN, www.google.com, Gemini"`，后面有一个 `RULE-SET,GlobalMedia,GlobalMedia`。而 `www.google.com` 同样被包含到 `GlobalMedia` 的订阅规则中。
    * `www.google.com` 会被绑到 `Gemini` 策略组里，而非 `GlobalMedia` 策略组。

```yaml
rule-providers:
  Gemini:
    url: https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/5ad04fab096f94224879c77c4bf50ace8a393fb0/rule/Clash/Gemini/Gemini.list
    path: ./ruleset/Gemini.list
    behavior: classical
    interval: 86400
    format: text
    type: http

  GlobalMedia:
    <<: *RuleSet
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GlobalMedia/GlobalMedia_Classical.yaml'
    path: './RuleSet/GlobalMedia.yaml'

  # ... 太长了，中间省略一部分

  LAN:
    <<: *RuleSet
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Lan/Lan.yaml'
    path: './RuleSet/LAN.yaml'

# 分流规则指向
rules:
 - "DOMAIN, www.google.com, Gemini"
 - RULE-SET,Gemini,Gemini
 - RULE-SET,Apple,Apple
 # ... 太长了，中间省略一部分
 - GEOIP,CN,DIRECT
 - MATCH,Proxy
```

## 版本更新故障
某次更新之后，在 Arch Linux 系统下遇到界面无法显示节点问题，和 [这个 issue](https://github.com/clash-verge-rev/clash-verge-rev/issues/6257) 中情况相同。

### 原因分析
#### Clash Verge Rev 的前后端分离式设计
报错 `Connection failed, I/O error: Permission denied (os error 13)` 本质上是 Clash Verge Rev 的前端界面（普通用户权限）与它的后台高权限服务（Root 权限）之间的 IPC 出了问题，

Clash Verge Rev 为了能无感地修改系统的全局代理设置、操作底层网络或读写受保护的目录，它需要一定的特权。为了安全，Clash Verge Rev 不会让用户用 sudo 去运行整个图形界面，而是采用了一种前后端分离的安全设计：
  * 前端（GUI）：以普通用户身份运行。
  * 后端（Service）：向系统注册一个拥有 Root 权限的后台守护进程（即 `clash-verge-service`）。
前端在需要高权限操作时，会通过 IPC（通常是 Socket）发送指令给后端服务代为执行。

但是在 v2.4.5 版本，Clash Verge Rev 为了提升安全性，对 macOS 和 Linux 系统下的服务 IPC 权限进行了进一步的严格限制。官方在 [Release 页面](https://github.com/clash-verge-rev/clash-verge-rev/releases/tag/v2.4.5)对此情况进行了说明。

#### 包管理器不管动态配置
用 `yay -Syu` 更新 Arch 的时候，包管理器把新版本的 `clash-verge-rev` 二进制文件替换了。但是负责提权和后台通信的配置文件（比如 Polkit 规则和 Systemd service 文件）是当初通过安装脚本动态生成的。包管理器在升级时，不会自动去覆写或重置这些安全规则文件。

### 解决方案
根据[官方说明](https://github.com/clash-verge-rev/clash-verge-rev/releases/tag/v2.4.5) 运行
```bash
sudo clash-verge-service-uninstall
sudo clash-verge-service-install
```

即可。

## 服务器使用 mihomo 内核
Clash Verge rev 只是一个 GUI 客户端，其代理功能以及 `proxy-providers`、`proxy-groups`、`rule-providers`、`rules` 等配置功能都是 mihomo 内核提供的，所以在服务器这种非 GUI 的环境下就可以直接使用 mihomo 内核，且基本可以继承 Clash Verge rev 的配置文件。

### 下载与安装
比较直接的方式是直接从 GitHub 的 release 页面下载编译好的二进制文件，我这次下载的是 `mihomo-linux-amd64-v1-v1.19.21.gz`，下载到本地保存为 `mihomo.gz`，然后执行以下操作：
```bash
gunzip -f mihomo.gz
chmod +x mihomo
mv mihomo ~/.local/bin/mihomo
~/.local/bin/mihomo -v
```

接下来再到 `~/.config/mihomo/config.yaml` 中加上配置文件。由于配置文件提到了 `proxy_provider,ruleset,RuleSet` 等路径，所以也需要提前创建：
```bash
mkdir -p ~/.config/mihomo/{proxy_provider,ruleset,RuleSet}
```

此时就可以通过 `~/.local/bin/mihomo -d ~/.config/mihomo` 前台运行软件。

### systemd 服务
希望代理能够在后台稳定运行，所以创建一个用户身份运行的系统服务。实践时发现 `/etc/systemd/system/mihomo.service` 已经被其他用户创建并且使用了，所以换一个路径：`/etc/systemd/system/mihomo-zxz.service`，内容为：
```toml
[Unit]
Description=mihomo for zxz
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=zxz
Group=zxz
ExecStart=/home/zxz/.local/bin/mihomo -d /home/zxz/.config/mihomo
Restart=on-failure
RestartSec=2

[Install]
WantedBy=multi-user.target
```

然后执行下列命令启动服务以及查看状态：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mihomo-zxz
sudo systemctl status mihomo-zxz
journalctl -u mihomo-zxz -f
```

### 配置文件调整
由于和其他用户使用了同一个内核，所以端口就有可能冲突。运行
```bash
sudo ss -lntup | grep -E ':(10809|9090|1053)\b'
```

结果为：
```
udp UNCONN 0 0 *:1053 *:* users:(("mihomo",pid=2427,fd=10)) 
tcp LISTEN 0 4096 *:1053 *:* users:(("mihomo",pid=2427,fd=9)) 
tcp LISTEN 0 4096 *:9090 *:* users:(("mihomo",pid=2427,fd=3))
```

所以确实存在端口冲突。这里在配置文件里面修改一下即可。

然后对上面没有解释的配置内容进行一些补充：
```yaml
# --- 端口设置  ---
mixed-port: 10809        # 混合端口：HTTP + SOCKS5 

# --- 基础设置 (保留原有的 allow-lan) ---
allow-lan: false         # 允许局域网连接 (手机连电脑代理)
mode: rule              # 规则模式
log-level: info         # 日志等级
ipv6: true              # 开启 IPv6 支持
udp: true               # 开启 UDP (打游戏/QUIC 必须)
```
`allow-lan: false`:
  * 意思是：不允许别的设备通过本机器的代理端口接入。只有把它改成 `true`，其他机器才能通过 Clash 的代理端口上网


```yaml
# --- 控制器设置 ---
external-controller: 127.0.0.1:9091 # 允许所有 IP 控制 (比 :9091 更通用)
secret: xxx
external-controller-cors:
  allow-origins:
    - '*'
  allow-private-network: true
```

`external-controller: 127.0.0.1:9091`
* mihomo 的 REST API 控制端口。面板选节点、更新订阅、看连接、看日志，本质上都是在调这个 API。
* 现在绑本机回环地址，意味着只能本机访问，配合 SSH 端口转发来从本地浏览器管理，正合适。

`secret`:
* API 的访问密钥。
* 面板和 curl 调 API 时都要带这个 Bearer token。留空理论上也能工作，但安全性会差很多

`external-controller-cors`
* 给浏览器跨域访问 controller 用的。
* `allow-origins: ['*']` 表示允许任意来源
* `allow-private-network: true` 允许访问私网/本机地址时的相关私有网络请求。用在线 dashboard 连本地转发出来的 controller，这个配置通常有帮助。

```yaml
# 缓存设置
profile:
  store-selected: true
  store-fake-ip: true
```
`profile.store-selected: true`
* 保存 API 对策略组的选择结果，下次启动继续用。比如在面板里把 OpenAI 组切到某个节点，下次重启还能记住。

`profile.store-fake-ip: true`
* 保存 fake-ip 映射表。官方说明是：某个域名下次再次连接时，尽量继续使用原来的映射地址。

```yaml
# 流量嗅探 (必须保留，否则无法精准分流)
sniffer:
  enable: true
  force-dns-mapping: true
  parse-pure-ip: true
  override-destination: true
  sniff:
    HTTP:
      ports: [80, 8080-8880]
      override-destination: true
    TLS:
      ports: [443, 8443]
    QUIC:
      ports: [443, 8443]
```
`sniffer.enable: true`
* 开启域名嗅探。作用：当连接本身没有明确给出“这个流量属于哪个域名”，或者 DNS / 目标地址不足以精确分流时，mihomo 会尝试从 HTTP/TLS/QUIC 流量里“闻”出域名，再按域名规则分流。

`force-dns-mapping: true`
* 官方说明：对 redir-host 类型识别的流量进行强制嗅探。

`parse-pure-ip: true`
* 官方说明：对所有没拿到域名的流量强制嗅探。意思是：哪怕连接目标看起来只是一个 IP，也尽量从握手内容里识别真实域名。

`override-destination: true`
* 使用嗅探结果作为实际访问目标。

`sniff.HTTP / TLS / QUIC`
* 这几段表示：只对这些协议、这些端口范围做嗅探。HTTP 默认是 80 和 8080-8880，TLS/QUIC 是 443 和 8443。

### 使用 dashboard 选择节点
节点选择通常还是有个 GUI 会方便一些。这个时候可以先用 ssh 做端口转发：
```bash
ssh -L 9190:127.0.0.1:9190 你的用户名@你的服务器IP
```

然后到任意一个 dashboard：
* d.metacubex.one
* yacd.metacubex.one
* board.zash.run.place

填写前面 `external-controller` 与 `secret` 指定的内容，即可看到一个类似 Clash Verge rev 的 GUI 页面。

### 订阅内容与规则文件更新
可以写一个脚本然后运行
```bash
#!/usr/bin/env bash
SECRET='你的secret'
API='http://127.0.0.1:9091'

for p in provider1 provider2; do
  curl -fsS -X PUT -H "Authorization: Bearer $SECRET" \
    "$API/providers/proxies/$p"
  echo "updated proxy provider: $p"
done

for r in OpenAI Proxy China LAN GlobalMedia Apple Microsoft Netflix Disney+ YouTube TikTok Spotify Gemini; do
  curl -fsS -X PUT -H "Authorization: Bearer $SECRET" \
    "$API/providers/rules/$r"
  echo "updated rule provider: $r"
done
```