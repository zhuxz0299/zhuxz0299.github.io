---
title: Windows Terminal 的一个小 Bug
cover: https://source.fomal.cc/img/default_cover_136.webp
description: 使用 Windows terminal 的时候发现按下空格之后，字体背景会变黑的问题。
tags:
  - windows terminal
  - windows
abbrlink: 179fe542
date: 2025-04-02 16:33:19
---

### 问题
最近在使用 Windows terminal 的时候发现按下空格之后，字体背景会变黑。效果和[这个 issue](https://github.com/microsoft/terminal/issues/6767) 相同。根据这个 issue 下面的回答，问题是 PSReadline 导致的，并且已经在之后发布的版本中解决。

但是这个 issue 是五年前的，并且由于我的 Windows terminal 是从 Microsoft Store 中下载的，因此始终是保持最新的。由此可以猜测是最新的版本再次出现了这个问题。

### 解决方案
卸载原本的 Windows terminal，并且从 [Github release](https://github.com/microsoft/terminal/releases) 中下载之前的版本。并且从 Github 中下载的软件不会自动更新：
> Terminal will not auto-update when new builds are released so you will need to regularly install the latest Terminal release to receive all the latest fixes and improvements!

因此可以避免某天打开软件发现突然出问题的情况。

### Assets 下的多个文件
在 release page 的 assets 中可以看见提供了多个文件：
* GroupPolicyTemplates_1.22.10352.0.zip
* Microsoft.WindowsTerminal_1.22.10352.0_8wekyb3d8bbwe.msixbundle
* Microsoft.WindowsTerminal_1.22.10352.0_8wekyb3d8bbwe.msixbundle_Windows10_PreinstallKit.zip
* Microsoft.WindowsTerminal_1.22.10352.0_arm64.zip
* Microsoft.WindowsTerminal_1.22.10352.0_x64.zip
* Microsoft.WindowsTerminal_1.22.10352.0_x86.zip
* Source code(zip)
* Source code(tar.gz)

文件说明
* 其中推荐使用的安装程序为：Microsoft.WindowsTerminal_1.22.10352.0_8wekyb3d8bbwe.msixbundle，下载之后双击即可安装软件。
* 几个 `.zip` 文件里面可能有便携版软件以及一些调试用的工具。
* Microsoft.WindowsTerminal_1.22.10352.0_8wekyb3d8bbwe.msixbundle_Windows10_PreinstallKit.zip 通常是给 **系统厂商、企业管理员或开发者** 批量部署用的。