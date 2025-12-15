---
title: docker 使用 GPU
cover: https://source.fomal.cc/img/default_cover_2.webp
tags:
  - linux
  - docker
  - cuda
description: 解决使用 docker 时无法调用 GPU 问题
abbrlink: 4f30936b
date: 2024-06-29 23:04:14
categories: [Dev Tools, Docker]

---

参考 [stackoverflow](https://stackoverflow.com/questions/25185405/using-gpu-from-a-docker-container)

对于版本早于 `Docker 19.03` 情况，需要 `nvidia-docker2`；而在 `Docker 19.03` 以及之后，则需要安装 `nvidia-container-toolkit`。

### `nvidia-container-toolkit` 安装
这里以 Ubuntu 系统为例：
```bash
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### docker 运行
假如想让 docker 容器使用所有 GPU，则运行 docker 如下：
```bash
docker run --name my_all_gpu_container --gpus all -t nvidia/cuda
```

即加上 `--gpus all` 即可。如果只是希望让 docker 使用某个 GPU，那么可以指定 GPU：
```bash
docker run --name my_first_gpu_container --gpus device=0 nvidia/cuda
```