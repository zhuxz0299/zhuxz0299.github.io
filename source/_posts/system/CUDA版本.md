---
title: CUDA版本
cover: 'https://source.fomal.cc/img/default_cover_132.webp'
tags:
  - cuda
  - pytorch
description: 关于`nvidia-smi`和nvcc显示的CUDA版本不同的问题
abbrlink: d1c883fc
date: 2024-12-03 13:59:55
---

> 参考 [stack overflow](https://stackoverflow.com/questions/53422407/different-cuda-versions-shown-by-nvcc-and-`nvidia-smi`)


## 问题
运行 `nvidia-smi`，得到结果为
```
Tue Dec  3 16:01:29 2024       
+---------------------------------------------------------------------------------------+
| `NVIDIA-SMI` 535.183.01             Driver Version: 535.183.01   CUDA Version: 12.2     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA GeForce RTX 4090        Off | 00000000:31:00.0 Off |                  Off |
|100%   60C    P2             409W / 450W |   5277MiB / 24564MiB |    100%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
|   1  NVIDIA GeForce RTX 4090        Off | 00000000:B1:00.0 Off |                  Off |
|100%   58C    P2             434W / 450W |   5281MiB / 24564MiB |    100%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
                                                                                         
+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|    0   N/A  N/A      3314      G   /usr/lib/xorg/Xorg                            4MiB |
|    1   N/A  N/A      3314      G   /usr/lib/xorg/Xorg                            4MiB |
+---------------------------------------------------------------------------------------+
```

但如果运行 `nvcc -V`，输出结果为
```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2022 NVIDIA Corporation
Built on Tue_Mar__8_18:18:20_PST_2022
Cuda compilation tools, release 11.6, V11.6.124
Build cuda_11.6.r11.6/compiler.31057947_0
```

可以看出一个 cuda 的版本是 12.2，另一个是 11.6

## 原因
CUDA有两个主要的API：运行时(runtime)API和驱动(driver)API。它们都有各自的版本。驱动API所需的支持（例如Linux上的`libcuda.so`）是通过GPU驱动安装程序安装的；运行时API所需的支持（例如Linux上的`libcudart.so`，以及nvcc）是通过CUDA工具包安装程序安装的（CUDA工具包安装程序可能还会捆绑一个GPU驱动安装程序）。因此已安装的驱动API版本和已安装的运行时API版本不一定匹配，尤其是在独立安装GPU驱动而不安装CUDA（即CUDA工具包）的情况下。

* `nvidia-smi`工具由GPU驱动安装程序安装，并通常显示GPU驱动的相关信息，而不涉及CUDA工具包安装程序安装的内容。
* nvcc是与CUDA工具包一起安装的CUDA编译器驱动工具，它将始终报告它所能识别的CUDA运行时版本。它不关心已安装的驱动版本，甚至不关心是否安装了GPU驱动。

因此，设计上，这两个版本号不一定匹配，因为它们反映的是两个不同的方面。而且在大多数情况下，如果``nvidia-smi``报告的CUDA版本数值上等于或高于`nvcc -V`报告的版本，这通常不需要担心。这是CUDA中的定义兼容路径（更新的驱动/驱动API支持较旧的CUDA工具包/运行时API）。例如，如果`nvidia-smi`报告CUDA 10.2，而`nvcc -V`报告CUDA 10.1，这通常不需要担心，它应该可以正常工作。

同样，在使用Docker时，`nvidia-smi`命令通常会报告宿主机上安装的驱动版本，而其他版本查询方法（如`nvcc --version`）则会报告Docker容器内安装的CUDA版本。


## PyTorch中的CUDA版本
> 以下内容来自 [PyTorch Forums](https://discuss.pytorch.org/t/would-pytorch-for-cuda-11-6-work-when-cuda-is-actually-12-0/169569)

当我们在 python 中运行 `print(torch.version.cuda)`，得到的结果可能会与 `nvcc -V` 不同，这是正常的。

因为 PyTorch 的二进制文件自带了自己的 CUDA 运行时（以及其他 CUDA 库，如 cuBLAS、cuDNN、NCCL 等）。本地安装的 CUDA 工具包（`nvcc -V` 得到的那个）只有在你从源代码构建 PyTorch 或使用自定义 CUDA 扩展时才会被使用。
