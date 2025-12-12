---
title: PowerShell中的`$PROFLE`
cover: 'https://source.fomal.cc/img/default_cover_147.webp'
description: PowerShell 中几个不同的 `$PROFLE` 指向了不同的位置
tags:
  - windows
  - powershell
abbrlink: 583cc842
date: 2025-05-19 19:09:53
---

### `$PROFLE`
1. `$PROFILE`
含义：指向当前用户、当前 PowerShell 主机（Host）的配置文件路径。

Windows PowerShell 中典型路径：
`C:\Users\<用户名>\Documents\WindowsPowerShell\profile.ps1`

用途：用户自定义的 PowerShell 启动脚本，每次启动时会自动运行。

2. 其他 `$PROFILE` 变体
PowerShell 还支持以下扩展变量，用于不同范围的配置文件：

|变量名|	适用场景|	示例路径 (Windows)|
|---|---|---|
| `$AllUsersAllHosts`  | 所有用户、所有 PowerShell 主机 | `C:\Windows\System32\WindowsPowerShell\v1.0\profile.ps1` |
| `$AllUsersCurrentHost` | 所有用户、当前 PowerShell 主机 | `C:\Windows\System32\WindowsPowerShell\v1.0\Microsoft.PowerShell_profile.ps1` |
| `$CurrentUserAllHosts` | 当前用户、所有 PowerShell 主机 | `C:\Users\<用户名>\Documents\WindowsPowerShell\profile.ps1` |
| `$CurrentUserCurrentHost` | 当前用户、当前 PowerShell 主机 | 与 `$PROFILE` 相同 |



### `conda init`
`conda init` 命令修改的是 `$CurrentUserAllHosts` 中的内容。
		