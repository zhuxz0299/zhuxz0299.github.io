---
title: Linux 工作与进程管理
cover: 'https://source.fomal.cc/img/default_cover_149.webp'
tags:
  - Linux
  - process
  - job
abbrlink: b69ef682
date: 2025-07-10 14:52:30
description: 查询在后台运行的进程，并且使用命令处理这些进程
---

{% note info %}
参考文章：[Linux 基础篇（鸟哥私房菜）](https://zq99299.github.io/linux-tutorial/tutorial-basis)
{% endnote %}

## Job Control（工作管理）
是在 bash 环境下的概念，当我们登录系统开启 bash shell 后，在单一 terminal 下同时进行多个工作的行为管理。进行工作管理的行为中，其实每个工作都是目前 bash 的子进程，彼此之间是有相关性的。因此我们无法以 job control 的方式由 tty1 的环境去管理 tty2 的 bash。

进行 bash 的 job control 必须要注意的限制是：
* 这些工作所触发的进程必须来自于你的 shell 的子进程（**只管理自己的 bash**）
* foreground（前景）：你可以控制与下达指令的环境
* background（背景）：可以自动运行的工作，你无法使用 ctrl + c 终止它，可以使用 bg、fg 呼叫该工作
* background 中执行的进程不能等待 terminal/shell 的输入（input）

### 直接将指令丢到 background 中执行：`&`
例如运行
```bash
tar -czvf course-project.tar.gz course-project/ &
```

然后终端会立即返回一个形如 `[2] 1428644` 的输出，告知 job number 以及 PID。同时虽然指令在后台运行，但是输出了信息，stdout 和 stderr 都会输出到屏幕上，会使得 foreground 上一直在打印信息。解决方法通常是把输出重定向到文件中，例如
```bash
tar -czvf course-project.tar.gz course-project/ > /tmp/log.txt 2>&1 &
```
* `> /tmp/log.txt`：表示将标准输出（stdout，文件描述符 `1`）重定向到 `/tmp/log.txt` 文件。如果文件不存在会创建，如果存在会覆盖原内容
* `2>&1`：`2` 表示标准错误输出（stderr，文件描述符 `2`）`>&1` 表示重定向到文件描述符 `1`（即标准输出）。由于标准输出已经重定向到 `/tmp/log.txt`，所以错误信息也会写入该文件

如果将该 job 对应的进程 kill 掉，那么在下一次输入指令之后，terminal 中会有形如以下的输出
```
[2]-  已终止               tar -czvf course-project.tar.gz course-project/
```

如果 job 正常结束，那么输出则形如
```
[2]-  已完成               tar -czvf test.tar.gz test/ > /tmp/log.txt 2>&1
```

### 将目前的工作丢到 background 中暂停：`ctrl+z`
考虑这个场景，我正在使用 vim，却发现某个文件的路径不记得了，需要到 bash 环境下进程搜索，此时不需要结束 vim，可以把它丢到 background 中等待
```
zxz@gdp:~/course-project$ vim ~/.bashrc 
# 在 vim 环境下按 ctrl + z 组合键
[2]+  已停止               vim ~/.bashrc
```

### 查看在 background 中运行的 job：`jobs`
```bash
jobs [-lrs]

# 选项与参数：
# 	-l：除了列出 job number 与指令之外，同时列出 PID 的号码
# 	-r：仅列出正在背景 run 的工作
# 	-s：仅列出正在背景中暂停 stop 的工作
```

例如：
```
zxz@gdp:~/course-project$ jobs -l
[1]- 1410082 停止                  vim  (工作目录: ~)
[2]+ 1432137 停止                  vim ~/.bashrc
```

* +：表示最近被放到背景的工作；如果只输入 `fg` 指令，那么 [2] 会被拿到前景中来处理
* -：表示最近最后第二个被放置到背景中的工作。如果超过最后第三个以后的工作，就不会有 -、+ 符号了

### 将 background 的工作拿到 foreground 来处理：`fg`
```bash
fg %jobnumber
# $jobnumber: jobnumber 是工作号码（数字），% 是可有可无的
```

例如运行
```bash
fg # 取出 + 号的 job
fg 1 # 取出 [1] 的 job 放到 foreground 中
```

## 进程管理
### 查看进程
#### 使用 `ps` 查看完整进程
```bash
ps aux		# 观察系统所有的进程数据
ps -l 		# 观察与当前终端机相关的进程
ps -lA 		# 观察系统所有的进程数据（显示内容项同 ps -l 的项一样，只不过是系统所有进程）
ps axjf		# 连同部分进程树状态

# 选项与参数：
# 	-A：所有的 process 都显示出来，与 -e 具有同样的效果
# 	-a：不与 terminal 有关的所有 process
# 	-u：有效使用者（effective user）相关的 process
# 	x：通常与 a 一起使用，可列出完整信息
# 输出格式规划：
# 	l：较长、较详细的将该 PID 的信息列出
# 	j：工作的格式（jobs format）
# 	-f：做一个更为完整的输出
```

其中最常用的为 `ps aux`，通常搭配 `grep` 命令查询某个进程的运行情况。例如
```bash
ps aux | grep ollama
```

得到结果
```
ollama   1259539  0.0  0.1 12277000 350756 ?     Ssl  7月09   0:57 /usr/local/bin/ollama serve
zxz      1437771  0.0  0.0  12132  2624 pts/18   S+   18:24   0:00 grep --color=auto ollama
```

#### 使用 `pgrep` 查找进程 PID
`pgrep` 相比 `ps aux | grep` 的组合，能够更加方便地按照条件查询进程。基本语法为：
```bash
pgrep [option] <mode>
```

* `<mode>`：支持正则表达式（如 nginx、"python.*script"）

| 选项 | 作用                             | 示例                                              |
|------|----------------------------------|---------------------------------------------------|
| `-l` | 显示进程名 + PID                 | `pgrep -l nginx` → `1234 nginx`                   |
| `-a` | 显示完整命令行                   | `pgrep -a python` → `5678 /usr/bin/python app.py` |
| `-f` | 匹配整个命令行（而非仅进程名）   | `pgrep -f "python.*log"`                         |
| `-x` | 精确匹配进程名                   | `pgrep -x bash`（不匹配 `bashrc` 等）             |
| `-u` | 按用户过滤                       | `pgrep -u root`（root用户的进程）                 |
| `-c` | 仅输出匹配数量                   | `pgrep -c chrome` → `8`                           |
| `-n` | 只显示最新启动的进程             | `pgrep -n node`                                  |
| `-o` | 只显示最早启动的进程             | `pgrep -o java`                                  |
| `-v` | 反向匹配（排除模式）             | `pgrep -v systemd`（非systemd进程）               |


### 管理进程
进程相互管理是通过一个信号（signal）去告知该进程你要它做什么。主要信号代号与名称含义如下：
| 代号 | 名称    | 含义       |
|------|---------|----------------------------------|
| 1    | SIGHUP  | 启动被终止的进程，可让该 PID 重新读取自己的配置文件，类似重新启动                                         |
| 2    | SIGINT  | 相当于用键盘输入 ctrl + c 来终端一个进程的运行                                                         |
| 9    | SIGKILL | 强制终端一个进程的运行，如果该进程进行到一半，那么尚未完成的部分可能会有半成品产生，类似 vim 会有 .filename.swp 保留下来 |
| 15   | SIGTERM | 以正常的结束进程来终止该进程。由于是正常的终止，后续动作会完成。若进程已发生问题则无法用此方法终止               |
| 19   | SIGSTOP | 相当于用键盘输入 ctrl-z 来暂停一个进行的运行                                                          |

可以使用 `kill` 或 `killall` 把信号传递给进程

#### kill -signal PID
`kill` 的基本语法：
```bash
kill [signal] <PID>...
```

* `<PID>`：目标进程的 ID（可用 `ps/top/pgrep` 查询）
* `[signal]`：数字代号（如 9）或信号名（如 SIGKILL），默认发送 SIGTERM(15)

```
# 范例 1：以 ps 找出 rsyslogd 这个进程 PID 后，再使用 kill 传递信号，让它可以重新读取配置文件
[root@study ~]# ps aux | grep 'rsyslogd' | grep -v 'grep'
root      1273  0.0  0.3 215672  3728 ?        Ssl  21:15   0:00 /usr/sbin/rsyslogd -n

# 最终的指令是如下的
[root@study ~]# kill -SIGHUP $(ps aux | grep 'rsyslogd' | grep -v 'grep' | awk '{print $2}') 
# 是否重启无法看通过看进程来知道，可以看日志
[root@study ~]# tail -5 /var/log/messages
Mar  9 23:20:01 study systemd: Removed slice User Slice of root.
Mar  9 23:30:01 study systemd: Created slice User Slice of root.
Mar  9 23:30:01 study systemd: Started Session 19 of user root.
Mar  9 23:30:01 study systemd: Removed slice User Slice of root.
Mar  9 23:35:20 study rsyslogd: [origin software="rsyslogd" swVersion="8.24.0-38.el7" x-pid="1273" x-info="http://www.rsyslog.com"] rsyslogd was HUPed
# 看上面，rsyslogd was HUPed 的字样，表示有重新启动
```