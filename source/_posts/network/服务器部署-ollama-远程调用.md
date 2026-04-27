---
title: 服务器部署 ollama 远程调用
cover: 'https://source.fomal.cc/img/default_cover_148.webp'
description: 在Linux服务器上部署ollama，并且在Windows主机上调用模型
tags:
  - ollama
  - tunnel
  - 端口转发
abbrlink: 98de85d5
date: 2025-07-10 11:09:33
categories: [System & Hardware, Network Practice]

---

## 工作原理
* Linux 服务器：Ollama 默认启动一个 HTTP 服务（通常是 127.0.0.1:11434），但这个地址只允许服务器本机访问。
* 目标：让 Windows 主机能连接到服务器的 11434 端口。
* 挑战：外部通过公网访问服务器需要使用 NAT，Ollama 默认只监听本地回环地址 (127.0.0.1)。

## 使用 SSH 端口转发
利用已有的 SSH 访问权限，在本地 Windows 和远程 Linux 服务器之间建立一个加密隧道，将本地端口的流量转发到服务器上 Ollama 的端口。

###  Linux 服务器上正常启动 Ollama
```bash
ollama serve &  # 后台运行服务，默认监听 127.0.0.1:11434
ollama run llama3 & # 或者运行一个模型，这会隐含启动服务
```

然后使用 `netstat -tulpn | grep 11434` 或 `ps aux | grep ollama` 确认 Ollama 服务是否在运行。


### 在 Windows 主机上建立 SSH 隧道 (本地端口转发)
```bash
ssh -N -L 11434:localhost:11434 <username>@<server_ip> -p <ssh_port>
```

* `-N`：告诉 SSH 不执行远程命令，只做端口转发。
* `-L 11434:localhost:11434`：本地端口转发的关键参数。
  * 第一个 11434：**Windows 本地**将要监听的端口号（可以改成其他未被占用的端口，比如 41134）。
  * localhost:11434：这是从**服务器的视角**来看的目标地址和端口。localhost 指的是服务器本身，11434 是服务器上 Ollama 监听的端口。
* `<username>@<server_ip>`：SSH 登录凭证。
* `-p <ssh_port>`：因为用了 NAT，所以需要指定一个端口。

### 端口转发开机后台自启动
#### 创建 `ssh_tunnel_ollama.bat` 脚本
```batch
@echo off
:loop
ssh -N -L 11434:localhost:11434 <username>@<server_ip> -p <ssh_port>
timeout /t 5 > nul
goto loop
```

#### 创建 `start_tunnel_ollama.vbs` 脚本
将脚本放在 `C:\Users\<username>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` 目录下（使用 `Win+R`，输入 `shell:startup` 即可打开目录），内容为：
```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c <C:\PATH\TO>\ssh_tunnel_ollama.bat", 0, False
```

脚本说明：
* VBS (VBScript) 是 Windows 平台的一种脚本语言（Visual Basic Scripting Edition），无需编译，由 Windows 脚本宿主 (`wscript.exe`/`cscript.exe`) 直接解释执行。
* `Set WshShell = CreateObject("WScript.Shell")`
  * 创建 Windows 脚本宿主的核心对象 `WScript.Shell`，将创建的对象赋给变量 `WshShell`
* `WshShell.Run "cmd /c C:\PATH\TO\ssh_tunnel.bat", 0, False`
  * 使用 `Run` 方法执行命令
  * `cmd /c`：启动新 CMD 进程执行命令，执行后立即退出
  * 窗口模式 `0`
  * 等待结束标志 `False`

窗口模式参数
| 值 | 含义               | 效果                     |
|---|--------------------|--------------------------|
| 0 | 隐藏窗口           | 完全后台运行，无界面     |
| 1 | 正常显示窗口       | 默认模式（会弹出黑窗口） |
| 2 | 最小化窗口         | 任务栏可见最小化按钮     |
| 3 | 最大化窗口         | 全屏显示                 |

等待结束标志参数
| 值    | 含义                     |
|-------|--------------------------|
| True  | VBS 暂停直到命令执行完成 |
| False | VBS 立即退出不等待       |

#### ssh 密钥登录
同时为了不用每次在 ssh 连接时输入密码，[需要配置 ssh 密钥](https://zhuxz0299.github.io/posts/7ddfa635.html#:~:text=code%20/etc/sudoers-,vscode%E5%85%8D%E5%AF%86%E7%A0%81%E7%99%BB%E5%BD%95%E8%BF%9C%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8,-%E9%A6%96%E5%85%88%E5%9C%A8%E5%9C%A8)。

## 在 Windows 主机上访问 Ollama
### 命令行测试
首先在服务器上测试模型是否能正常工作：
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen3",
  "prompt": "为什么天空是蓝色的？"
}'
```

然后在 Windows 的 PowerShell 上运行
```bash
$body = @{
  model = "qwen3"
  prompt = "为什么天空是蓝色的？"
  stream = $false  # 非流式响应更易调试
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:11434/api/generate `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### CherryStudio 上使用
在“设置”--“模型服务”板块找到 Ollama，API 默认即为 `http://localhost:11434`，不需要 API 密钥。点开“模型管理”即可看到服务器上已经部署的模型。