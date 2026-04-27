---
title: Nvidia NVML Driver/library version mismatch
cover: https://source.fomal.cc/img/default_cover_17.webp
tags:
  - linux
  - cuda
  - nvidia-smi
description: 解决在运行 nvidia-smi 之后报错 Failed to initialize NVML, Driver/library version mismatch 的问题
abbrlink: 4fdabebb
date: 2024-06-28 15:37:25
categories: [System & Hardware, System Knowledge]

---

## 问题描述
命令行运行
```bash
nvidia-smi
```

输出报错：
```
Failed to initialize NVML: Driver/library version mismatch.
```

## 解决方案
### 重启
根据 [stackoverflow](https://stackoverflow.com/questions/43022843/nvidia-nvml-driver-library-version-mismatch#comment73133147_43022843) 中的说法，这个问题可以直接通过重启机器解决。

### 不重启
但是对于远程连接的服务器而言，重启可能并不合适。因此解决方案参考了 [Comzyh的博客](https://comzyh.com/blog/archives/967/)。

这个问题出现的原因是 kernel mod 的 Nvidia driver 的版本没有更新，因此需要将 kernel 先 unload，然后重新 reload。

#### unload kernel
想要 unload kernel，需要执行
```bash
sudo rmmod nvidia
```

但通常会遇到问题：
```
rmmod: ERROR: Module nvidia is in use by: nvidia_modeset nvidia_uvm
```

此时需要将 nvidia 的依赖项 unload。可以通过运行
```bash
$lsmod | grep nvidia
```

来查看结果。
* 结果形式如下：
    ```
    nvidia_uvm            647168  0
    nvidia_drm             53248  0
    nvidia_modeset        790528  1 nvidia_drm
    nvidia              12144640  152 nvidia_modeset,nvidia_uvm
    ```

    在这里，可以发现 `nvidia` 在被进程使用了 152 次，而没有进程在使用 `nvidia_uvm` 和 `nvidia_drm`，因此可以执行
    ```bash
    sudo rmmod nvidia_uvm
    sudo rmmod nvidia_modeset
    ```

* 但如果依赖项仍被占用，比如
    ```
    nvidia_drm             53248  4
    ```

    那么可以运行
    ```bash
    sudo lsof -n -w  /dev/nvidia*
    ```

    查看相关进程。进程情况大致如下：
    ```
    COMMAND    PID USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
    python  244299 root  mem    CHR   195,0           913 /dev/nvidia0
    python  244299 root  mem    CHR 195,255           912 /dev/nvidiactl
    python  244299 root  mem    CHR   507,0           915 /dev/nvidia-uvm
    python  244299 root    4u   CHR 195,255      0t0  912 /dev/nvidiactl
    python  244299 root    5u   CHR   507,0      0t0  915 /dev/nvidia-uvm
    python  244299 root    6u   CHR   195,0      0t0  913 /dev/nvidia0
    python  244299 root    8u   CHR   195,0      0t0  913 /dev/nvidia0
    python  244299 root    9u   CHR   195,0      0t0  913 /dev/nvidia0
    ···
    ```

    然后使用
    ```bash
    sudo kill -9 <pid>
    ```
    来 kill 相关进程，解决依赖项被占用问题。

处理完依赖项，再使用 `lsof` 一次，如果 `nvidia` 的使用 Used by 还没有降到 0，`kill` 相关进程。

最后执行
```bash
sudo rmmod nvidia
```

即可

#### reload kernel
运行
```bash
sudo nvidia-smi
```

nvidia-smi 发现没有 kernel mod 会将其自动装载。