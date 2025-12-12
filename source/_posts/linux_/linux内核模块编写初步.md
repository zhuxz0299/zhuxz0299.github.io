---
title: linux内核模块编写初步
cover: https://source.fomal.cc/img/default_cover_13.webp
tags:
  - linux
  - operating system
  - kernel
categories: linux
abbrlink: afd0741b
date: 2023-04-29 22:03:53
description: 介绍一下一个简单的内核模块是如何写出来的
---

此处内核模块代码以《操作系统概念》第二章的 Programming Project为例。
## 模块需求
设计一个内核模块：创建一个名为 `/proc/jiffies` 的 `/proc` 文件。在读取 `/proc/jiffies` 文件时报告 `jiffies` 的当前值。结果可使用 `cat` 获取，命令如下：
```bash
cat /proc/jiffies
```

并确保在删除模块时删除 `/proc/jiffies`。

注：`jiffies` 是Linux内核中用于跟踪系统运行时间的变量，表示自系统启动以来的时钟滴答数。

## 模块实现
### 头文件和宏定义
```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/proc_fs.h>
#include <asm/uaccess.h>
#include <linux/jiffies.h>
#define BUFFER_SIZE 128
#define PROC_NAME "jiffies"
```

### `proc_ops` 结构体对象
`proc_ops` 结构体对象用于定义对于 `/proc` 文件的操作函数。在这段代码中,将 `proc_ops` 对象中的 `proc_read` 字段设置为 `proc_read` 函数，将该对象与后面要创建的 `/proc/jiffies` 文件关联起来。这样，在读取 `/proc/jiffies` 文件时，内核将调用 `proc_read` 函数来处理读取操作。
```c
static ssize_t proc_read(struct file *file, char *buf, size_t count, loff_t *pos);
static struct proc_ops proc_ops = {
    .proc_read = proc_read,
};
```

### `proc_init` 和 `proc_exit`
定义在模块加载时要调用的函数 `proc_init` ，使用 `proc_create` 函数创建了一个名为 `"/proc/jiffies"` 的文件，并将 `proc_ops` 结构体对象传递给它。然后使用 `printk` 函数在内核日志中打印一条信息,内核日志可以通过linux中的 `sudo dmesg` 命令读取和显示，`printk` 中 `KERN_INFO` 是一个宏定义，表示内核日志消息的级别为信息级别。不同的日志级别有不同的前缀，用于区分不同类型的日志消息。
```c
static int proc_init(void)
{
    proc_create(PROC_NAME, 0, NULL, &proc_ops);
    printk(KERN_INFO "/proc/%s created\n", PROC_NAME);
    return 0;
}
```

定义在模块卸载时调用的函数 `proc_exit` ，使用 `remove_proc_entry` 函数删除之前创建的 `"/proc/jiffies"` 文件，并使用 `printk` 函数在内核日志中打印一条信息。
```c
static void proc_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "/proc/%s removed\n", PROC_NAME);
}
```

### `proc_read` 函数
定义 `proc_read` 函数，该函数在读取 `/proc/jiffies` 文件时被调用。函数的返回值类型为 `ssize_t`，这个类型类似于 `int`，但是 `ssize_t` 类型是专门为了在不同平台和操作系统上保持一致的数据类型，能够避免 `int` 在不同平台中大小和符号不同的问题。函数参数解释如下：
* `struct file *file`：表示正在进行读取操作的文件的指针。在 `/proc` 文件系统中，该参数通常不会被使用，可以忽略。
* `char *buf`：表示用户空间的缓冲区指针，用于存储从文件中读取的数据。读取的内容将被复制到这个缓冲区中。用户缓冲区中的数据可以用 `cat` 命令读取。
* `size_t count`：表示要读取的最大字节数。读取的内容不能超过这个数值。
* `loff_t *pos`：表示文件的当前位置指针。在多次读取的情况下，可以使用该参数来跟踪文件读取的位置。

函数内部首先定义了一些变量，包括一个字符数组 `buffer` 用于存储要输出的内容，以及一个静态变量 `completed` 用于追踪是否已经读取完成。
如果 `completed` 为真，则表示已经读取完成，直接返回 $0$。否则，将 `completed` 设置为真，并使用 `sprintf` 函数将当前的 `jiffies` 值格式化为字符串并存储在 `buffer` 中。`sprintf()` 函数是C语言标准库中的一个函数，该函数的第一个参数是要存储结果的字符数组，第二个参数是格式化字符串，后面的参数根据格式化字符串中的占位符进行替换，它的工作方式类似于 `printf()` 函数，但不会将输出发送到标准输出流（如控制台），而是将结果存储在字符数组中。
接下来，使用 `copy_to_user` 函数将 `buffer` 的内容复制到用户空间的 `usr_buf` 中，并返回 `rv` 作为读取的字节数。
```c
static ssize_t proc_read(struct file *file, char __user *usr_buf, size_t count, loff_t *pos)
{
    int rv = 0;
    char buffer[BUFFER_SIZE];
    static int completed = 0;

    if (completed) {
        completed = 0;
        return 0;
    }

    completed = 1;

    rv = sprintf(buffer, "jiffies= %lu\n", jiffies);
    copy_to_user(usr_buf, buffer, rv);

    return rv;
}
```

### 模块入口出口点
使用 `module_init` 宏将 `proc_init` 函数指定为模块的入口点，即在模块加载时调用该函数。使用 `module_exit` 宏将 `proc_exit` 函数指定为模块的出口点，即在模块卸载时调用该函数。
```c
module_init(proc_init);
module_exit(proc_exit);
```

### 其他信息
最后使用MODULE_LICENSE、MODULE_DESCRIPTION和MODULE_AUTHOR宏设置模块的许可证、描述和作者信息。（这段代码应该不是很重要）
```c
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Hello Module");
MODULE_AUTHOR("SGG");
```

## `/proc` 文件系统
在这个project中，`/proc` 文件系统用于与内核模块的交互。内核模块在 `/proc` 文件系统中创建文件，通过读写这些文件来与用户空间程序通信，传递信息或接收命令。

"proc"在Linux中是"process"的缩写，在 `/proc` 文件系统中，每个运行中的进程都有一个对应的目录，以进程ID（PID）为名称。进程相关的信息可以在相应的目录中找到，例如 `/proc/<PID>/status` 和 `/proc/<PID>/stat` 文件用于获取特定进程的状态信息。

但事实上，`/proc` 提供了更广泛的功能，不仅仅用于进程相关的信息。它的主要作用如下：
* 提供内核信息访问接口：`/proc` 文件系统提供了一种访问内核信息的机制，允许用户空间程序读取和操作内核数据。通过读取 `/proc` 文件系统中的文件，可以获取关于系统硬件、内核参数、进程信息、设备信息等多种内核数据。
* 运行时数据的监控和调试：`/proc` 文件系统为系统管理员和开发人员提供了一种监控和调试系统的手段。例如，可以通过读取 `/proc` 中的文件获取CPU使用情况、内存使用情况、网络状态等运行时数据，用于性能分析、故障排查和系统调优。
* 与内核模块的交互：内核模块可以通过创建自己的 `/proc` 文件来与用户空间进行交互。模块可以在 `/proc` 文件系统中创建文件，通过读写这些文件来与用户空间程序通信，传递信息或接收命令。
* 动态配置和控制：一些系统参数和配置选项可以通过 `/proc` 文件系统进行动态调整。通过修改相关文件中的值，可以实时更改内核的某些行为或配置选项，而无需重新启动系统。