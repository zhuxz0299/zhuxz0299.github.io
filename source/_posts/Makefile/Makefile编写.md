---
title: Makefile编写
cover: https://source.fomal.cc/img/default_cover_22.webp
tags:
  - makefile
  - C语言
abbrlink: f353ec85
date: 2023-05-13 15:58:06
description: 通过现有例子总结的Makefile的简单写法
---

## 示例1
```makefile
CC=gcc
CFLAGS=-Wall

clean:
	rm -rf *.o
	rm -rf fcfs
	rm -rf sjf
	rm -rf rr
	rm -rf priority
	rm -rf priority_rr

rr: driver.o list.o CPU.o schedule_rr.o
	$(CC) $(CFLAGS) -o rr driver.o schedule_rr.o list.o CPU.o

sjf: driver.o list.o CPU.o schedule_sjf.o
	$(CC) $(CFLAGS) -o sjf driver.o schedule_sjf.o list.o CPU.o

fcfs: driver.o list.o CPU.o schedule_fcfs.o
	$(CC) $(CFLAGS) -o fcfs driver.o schedule_fcfs.o list.o CPU.o

priority: driver.o list.o CPU.o schedule_priority.o
	$(CC) $(CFLAGS) -o priority driver.o schedule_priority.o list.o CPU.o

schedule_fcfs.o: schedule_fcfs.c
	$(CC) $(CFLAGS) -c schedule_fcfs.c

priority_rr: driver.o list.o CPU.o schedule_priority_rr.o
	$(CC) $(CFLAGS) -o priority_rr driver.o schedule_priority_rr.o list.o CPU.o

driver.o: driver.c
	$(CC) $(CFLAGS) -c driver.c

schedule_sjf.o: schedule_sjf.c
	$(CC) $(CFLAGS) -c schedule_sjf.c

schedule_priority.o: schedule_priority.c
	$(CC) $(CFLAGS) -c schedule_priority.c

schedule_rr.o: schedule_rr.c
	$(CC) $(CFLAGS) -c schedule_rr.c

list.o: list.c list.h
	$(CC) $(CFLAGS) -c list.c

CPU.o: CPU.c cpu.h
	$(CC) $(CFLAGS) -c CPU.c

```

### 变量定义
```c
CC=gcc
CFLAGS=-Wall
```

这两行代码定义了变量 `CC` 和 `CFLAGS`。
* `CC=gcc`：定义变量 `CC` 为 gcc，指定使用 gcc 编译器进行编译。
`CFLAGS=-Wall`：定义变量 `CFLAGS` 为 `-Wall`，指定编译时使用的选项，其中 `-Wall` 表示显示所有警告信息。

### Makefile执行规则
对于
```makefile
rr: driver.o list.o CPU.o schedule_rr.o
	$(CC) $(CFLAGS) -o rr driver.o schedule_rr.o list.o CPU.o
```

开头的 `rr` 表示后面的命令行代码可以用 `make rr` 来执行。而 `rr` 后面的 `driver.o list.o CPU.o schedule_rr.o` 指的是**文件依赖项**，文件依赖项的作用在于，在执行下面的编译命令 
```bash
gcc -Wall -o rr driver.o schedule_rr.o list.o CPU.o
```

时，假如编译器发现找不到 `schedule_rr.o` 文件，那么它会找到 Makefile 中的这一行代码
```makefile
schedule_rr.o: schedule_rr.c
	$(CC) $(CFLAGS) -c schedule_rr.c
```

先生成 `schedule_rr.o` 文件后再继续执行。
### 文件依赖项作用
* 构建顺序控制：依赖项指定了目标构建所依赖的文件或目标。如果依赖项中的文件发生变化或不存在，则目标会被重新构建。依赖项的存在可以确保在构建目标之前先构建其所依赖的文件或目标。
* 增量构建优化，避免重复构建：依赖项允许 make 工具进行增量构建优化。只有发生变化的文件及其相关依赖项会被重新构建，而不需要重新构建所有目标。这样可以提高构建效率。

### 头文件的依赖关系
```makefile
list.o: list.c list.h
	$(CC) $(CFLAGS) -c list.c
```

这段代码中只指明了 `list.o` 和 `list.h` 之间的依赖关系，而事实上 `list.c` 文件中还用到了头文件 `task.h`。这样可行是因为 Makefile 文件其实并不需要显式的包含源文件和头文件的依赖关系，这个关系在编译的时候会自动读取。所以将 `list.o` 后面的 `list.h` 去掉也是可行的。

## 示例2
```makefile
obj-m += seconds.o jiffies.o
all:
	make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd) modules
clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd) clean
```

### 目标文件选择
`obj-m += seconds.o jiffies.o` 指要构建的目标文件为 `seconds.o` 和 `jiffies.o`，最后将构建名为 `seconds` 和 `jiffies` 的模块。

### Makefile执行规则
对于
```makefile
all:
	make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd) modules
```

开头的 `all` 表示后面的命令行代码可以用 `make` 来执行。接下来对后面的命令行进行解释：
* 这里直接使用的是 `make` 命令而非之前那样的 `gcc`，这是因为这是因为构建 Linux 内核模块的过程通常不仅仅涉及到 C 代码的编译，还包括了其他的操作，例如链接、处理符号表、生成模块文件等。这些操作超出了单纯的 C 代码编译所需的步骤。因此，在构建内核模块时，`make` 命令会负责执行整个构建过程，其中也包含了调用 `gcc`。
* 后面的 `-C /lib/modules/$(shell uname -r)/build` 表示指定工作目录。如果不这么做，会导致工作目录不正确，`make` 无法找到正确的库来编译生成模块。
* `M` 参数用于指定内核模块构建过程中的路径，这里 `M=$(shell pwd)` 指指定构建过程中的路径为当前工作目录。如果不这样做同样可以生成模块（因为上一步已经进入了正确的工作目录），但是从实践来看会出现一些权限上的问题，需要使用 `sudo make` 才能正常生成内核模块。
* 最后的 `modules` 是 `make` 命令的目标，表示要构建的目标是内核模块。

### obj-m
在示例1中，我们的 Makefile 文件并没有用到 `obj-m`，这是因为 `obj-m` 是用于编译内核模块的特定变量，而在编译普通的用户空间程序时不会被用到。

在编写一个内核模块时，我们需要使用 `obj-m` 变量来定义的模块对象（.o 文件），以便在构建过程中让 `make` 工具会编译和链接相应的内核模块。
对于普通的用户空间程序，我们可以直接在 Makefile 中指定你的源文件和目标文件，而无需使用 `obj-m` 变量。