---
title: 使用ssh下载GitHub上的repo
cover: https://source.fomal.cc/img/default_cover_6.webp
tags: 
   - github
   - git
   - ssh
description: 关于使用ssh来对GitHub上的repo进行git clone，这样下载更快
abbrlink: 4d4a0720
date: 2023-12-07 14:12:29
---
1. 首先在电脑上生成SSH key，可以运行
```bash
ssh-keygen -t rsa
```
表示指定 rsa 算法生成密钥。然后会生成 id_rsa （私钥）和 id_rsa.pub （公钥）。在Linux系统中，生成的两个文件默认会放在 `~/.ssh` 文件夹下。

2. 在GitHub上添加 SSH key
   1. 打开 GitHub，点击右上角的你的头像，点击设置 settings
   2. 点击左侧的 SSH and GPG keys，点击右上角的 New SSH key
   3. 把刚刚生成的公钥 （id_rsa.pub 文件中的内容）复制到 Key 所在框， Title 不用填，复制好点击下方的 Add SSH key 按钮即可。
   4. 添加完返回 SSH 页面就会出现你的本地信息

3. 验证绑定
在命令行输入
```bash
ssh -T git@github.com
```
假如成功，会返回：
```
Hi zhuxz0299! You've successfully authenticated, but GitHub does not provide shell access
```

假如出现了这种问题：
```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0664 for '/home/zhuxiaozhi/.ssh/id_rsa' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/home/zhuxiaozhi/.ssh/id_rsa": bad permissions
git@github.com: Permission denied (publickey).
```
则说明是权限设置出了问题，使用
```bash
chmod 600 ~/.ssh/id_rsa
```
修改私钥权限即可。

4. 此时就可以通过git下载代码了。例如：
```bash
git clone git@github.com:aim-uofa/AdelaiDepth.git
```