---
title: 在Jetson设备上安装Pytorch
cover: 'https://source.fomal.cc/img/default_cover_131.webp'
tags:
  - pytorch
  - jetson
description: 在 Jetson Xavier NX 上安装 Pytorch 遇到了问题，发现只能使用 NVIDIA 编译好的 .whl 文件安装
abbrlink: e5733f44
date: 2024-12-02 21:08:06
---

Jetson 设备由于其架构，需要使用 NVIDIA 提供的 Pytorch。

* 对于安装了 4.2 以及更新版本的 JetPack 的  Jetson Nano, TX1/TX2, Xavier, 和 Orin 等设备，可以参考 [Pytorch for Jetson](https://forums.developer.nvidia.com/t/pytorch-for-jetson/72048)，里面同样包含了 torchvision 的安装方法。
* 对于更新的设备，安装 Pytorch 时可以参考 [Installing PyTorch for Jetson Platform](https://docs.nvidia.com/deeplearning/frameworks/install-pytorch-jetson-platform/index.html#)，而 torchvision 可以参考 PyTorch 官网上的 [Building on Jetson](https://pytorch.org/audio/stable/build.jetson.html)。

关于架构：
* 大多数个人计算机和服务器使用的是 amd64(或者叫x64，基本上是一个东西)
* Jetson 系列设备上用的是 arm64(或者叫aarch64，也基本是一个东西)