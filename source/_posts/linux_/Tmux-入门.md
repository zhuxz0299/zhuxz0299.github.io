---
title: Tmux 入门
cover: https://source.fomal.cc/img/default_cover_19.webp
tags:
  - linux
  - tmux
description: 介绍 tmux 的一些基本用法
abbrlink: 88c12565
date: 2024-08-12 17:32:26
---

> 参考文章：[Tmux使用手册](https://louiszhai.github.io/2017/09/30/tmux/)以及[A Quick and Easy Guide to tmux](https://hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)


## 基本概念
tmux 采用C/S模型构建，输入 tmux 命令就相当于开启了一个服务器，此时默认将新建一个会话，然后会话中默认新建一个窗口，窗口中默认新建一个面板。会话、窗口、面板之间的联系如下：
* 一个 tmux session（会话）可以包含多个 window（窗口），窗口默认充满会话界面
* 一个window又可以包含多个pane（面板），窗口下的面板，都处于同一界面下

<img src='http://louiszhai.github.io/docImages/tmux01.png' width=800 style="display: block; margin-left: auto; margin-right: auto;">

## 基本操作
### 会话 (session)
#### 新建会话
在终端输入
```bash
tmux # 新建一个无名称的会话
tmux new -s demo # 新建一个名称为demo的会话
```

#### 断开当前会话
在会话中输入
```bash
tmux detach
```

或者使用快捷键：Ctrl+b + d

#### 查看所有会话
```bash
tmux list-session # 查看所有会话
tmux ls # 查看所有会话，提倡使用简写形式
```

如果此时恰好在 tmux 会话中，还可以使用快捷键 Ctrl+b + s，此时 tmux 将打开一个会话列表，按上下键 (⬆︎⬇︎) 或者鼠标滚轮，可选中目标会话，按左右键 (⬅︎➜) 可收起或展开会话的窗口，选中目标会话或窗口后，按回车键即可完成切换。

#### 进入之前的会话
断开会话后，想要接着上次留下的现场继续工作，可以使用tmux的attach命令
```bash
tmux attach-session -t demo # 完整写法，进入到名称为demo的会话
tmux a -t demo # 简写
tmux a # 默认进入第一个会话
```

#### 会话重命名
```bash
tmux rename-session -t 0 database # 将原来名为 0 的 session 重命名为 database
```

#### 关闭会话
可以使用tmux的kill命令，kill命令有 kill-pane、kill-server、kill-session 和 kill-window 共四种，这里使用 kill-session。如下：
```bash
tmux kill-session -t demo # 关闭demo会话
tmux kill-server # 关闭服务器，所有的会话都将关闭
```

### 窗口 (window)
<table>
	<tbody>
    	<tr>
			<td>前缀</td>
			<td>指令</td>
			<td>描述</td>
		</tr>
		<tr>
			<td>Ctrl+b</td>
			<td>c</td>
			<td>新建窗口</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>&</td>
			<td>关闭当前窗口(关闭前需输入yor n确认)</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td> 0 ~ 9 </td>
			<td>切换到指定窗口</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>p</td>
			<td>切换到上一窗口</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>n</td>
			<td>切换到下一窗口</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>w</td>
			<td>打开窗口列表，用于且切换窗口</td>
		</tr>
	</tbody>
</table>

### 面板 (pane)
<table>
	<tbody>
		<tr>
			<td>前缀</td>
			<td>指令</td>
			<td>描述</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>"</td>
			<td>当前面板上下 下侧新建面板 分为</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>%</td>
			<td>当前面板左右 右侧新建面板</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>x</td>
			<td>关闭当前面板 (y or n确认)，或者直接 Ctrl + d，或者输入 exit</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>z</td>
			<td>最大化当前面板，再重复一次按键后恢复原状(v1.8版本新增)</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>q</td>
			<td>显示面板编号，在编号消失前输入对应的数字可切换到相应的面板</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>方向键</td>
			<td>移动光标切换面板</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>o</td>
			<td>选择下一面板</td>
		</tr>
		<tr>
			<td>Ctrl + b</td>
			<td>空格键</td>
			<td>在自带的面板布局中循环切换</td>
		</tr>
	</tbody>
</table>


