---
title: docker 入门
cover: https://source.fomal.cc/img/default_cover_3.webp
tags:
  - linux
  - docker
description: 关于 docker 的一些基本概念的介绍，以及简单的操作
abbrlink: 49f1e1db
date: 2024-06-30 19:16:44
categories: [Dev Tools, Docker]

---

> 主要参考文章：[Docker 简易入门教程](https://iphysresearch.github.io/blog/post/programing/docker-tutorial)

## docker 安装与启动
Linux 安装 docker 可以参考 [这篇博客](https://zhuxz0299.github.io/posts/45029051.html)。安装完成之后，由于 docker 需要用户具有 `sudo` 权限，为了避免每次命令都输入 `sudo`，可以把用户加入 docker 用户组(参考[stackoverflow](https://stackoverflow.com/questions/48957195/how-to-fix-docker-got-permission-denied-issue)):
```bash
sudo groupadd docker # 如果没有docker用户组，先创建一个
sudo usermod -aG docker $USER # 将自己加入docker用户组
newgrp docker # 进入新的docker用户组
```

docker 是服务器—-客户端架构。命令行运行docker命令的时候，需要本机有 docker 服务。如果这项服务没有启动，可以运行：
```bash
# service 命令的用法
sudo service docker start
# systemctl 命令的用法 (RHEL7/Centos7)
sudo systemctl start docker
```

而在 Windows 中，则先安装 WSL，然后下载并打开 [docker desktop](https://www.docker.com/products/docker-desktop/)，即可在 powershell 或 WSL 中使用 docker。

## image 与 container
镜像 (image) 是用来创建 docker 容器 (container) 的。

### docker image
#### 获取 image
docker 官方提供的 image 文件都存放在 dockerhub 的 [library](https://hub.docker.com/u/library) 中，想要获取，可以直接运行 `docker image pull`。下面以 hello-world 为例展示 image 的操作：
```bash
docker image pull hello-world
```

#### 查看 image
如果想查看本地有哪些 image 文件，可以运行
```bash
docker image list
```

然后回得到如下形式输出：
```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
hello-world   latest    d2c94e258dcb   14 months ago   13.3kB
```

可以看到此时有一个 hello-world 文件，其 id 为 `d2c94e258dcb`。

#### 删除 image
想要删除这个 image，则可以运行
```bash
docker image rm d2c94e258dcb # or docker rmi d2c94e258dcb
```

但是需要注意，如果当前存在该 image 创建得到的 container 实例，docker 会提示：
```
Error response from daemon: conflict: 
unable to delete d2c94e258dcb (must be forced) - image is being used by stopped container 36b28aa4086a
```

则此时需要强制删除。

### docker container
container 是 image 文件生成的实例，其本身也是一个文件。一个 image 文件可以生成多个 container 文件。下面同样以 hello-world 为例进行演示。

#### 生成 container
想要生成容器，可以运行
```bash
docker container run hello-world
```

此时就可以利用 hello-world 的 image 文件生成一个 container 实例。如果 docker 在本地找不到名为 hello-world 的 image 文件，则会去 dockerhub 的仓库中寻找，因此理论上 `docker image pull` 的步骤可以省去。除此之外，`docker container run` 命令也可以写成 `docker run`，这是 docker 新老版本的不同写法 [stackoverflow](https://stackoverflow.com/questions/51247609/difference-between-docker-run-and-docker-container-run)，`docker container run` 是 docker 在 1.13 之后的新的写法，更加清晰规范。

`docker container run` 还有可选参数，这里以下面的指令为例，介绍一些常见参数
```bash
docker container run --name yolov7 -it -v your_code_path/:/yolov7 nvcr.io/nvidia/pytorch:21.08-py3
```

* `--name yolov7` 表示将生成的 container 命名为 `yolov7`
* `-it` 是 `-i` 和 `-t` 的合并，这两个参数经常一起使用。
  * `-i` 表示保持标准输入打开，即让 container 处于可交互的模式
  * `-t` 表示分配一个伪终端
* `-v your_code_path/:/yolov7` 用于将宿主机的 `your_code_path/` 文件夹挂载到 container 中的 `/yolov7` 目录，此时 container 中对 `/yolov7` 目录的所有操作都会反映到宿主机的 `your_code_path/` 目录。

#### 退出 container
对于像 hello-world 生成的这种 container，运行完毕后会自动退出；但如果是进入了交互状态的 container，想要退出时则需要输入
```bash
exit
```

#### 查看 container
回到 hello-world 的例子，接着我们运行
```bash
docker container list
```

就可以得到
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

发现什么也没有。这是因为 hello-world 生成的 container 运行之后就自动停止了，而 `docker container list` 只会显示正在运行的。因此需要运行
```bash
docker container list --all
```

此时得到
```
CONTAINER ID   IMAGE         COMMAND    CREATED         STATUS                     PORTS     NAMES
684b646ebe5f   hello-world   "/hello"   4 minutes ago   Exited (0) 4 minutes ago             lucid_mcnulty
```

那些已经停止运行的 container 也会被显示。

#### 启动 container
前面的 `docker container run` 命令是新建容器，每运行一次，就会新建一个容器。同样的命令运行两次，就会生成两个一模一样的容器文件。如果希望重复使用容器，就要使用 `docker container start` 命令，它用来启动已经生成、已经停止运行的容器文件。例如
```bash
docker container start yolov7
```

#### 进入 container
假如有容器正在后台工作，可以形如使用
```bash
docker container exec -it yolov7 /bin/bash
```

的命令进入容器。

#### 删除 container
同样的，想要删除 container 文件，运行
```bash
docker container rm 684b646ebe5f
```

即可。

## docker 使用代理
假如使用 docker 拉取 image 的时候遇到形如以下的问题：
```
docker: Error response from daemon: failed to resolve reference "docker.io/library/hello-world:latest": failed to do request: Head "https://registry-1.docker.io/v2/library/hello-world/manifests/latest": read tcp [2001:da8:8000:6085:15db:75db:6e6b:5c21]:37210->[2600:1f18:2148:bc02:d471:330e:de3:f545]:443: read: connection reset by peer 
```

这说明 Docker Hub 被墙了。之前推荐换源（国内镜像），2024年后[据说](https://zhuanlan.zhihu.com/p/709896100)国内大部分 Docker 镜像源都失效或需要认证了。所以还是直接用代理。

### 创建配置文件夹与代理配置文件
关于 systemd 系统的配置文件夹以及配置文件的工作原理，可以看[这篇文章](https://zhuxz0299.github.io/posts/5bfe7acf.html)

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo vim /etc/systemd/system/docker.service.d/http-proxy.conf
```

代理配置文件写入：
```toml
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:10808"
Environment="HTTPS_PROXY=http://127.0.0.1:10808"
Environment="NO_PROXY=localhost,127.0.0.1,docker-registry.somecorporation.com"
```

### 重新加载配置并重启 Docker
```bash
sudo systemctl daemon-reload # 重载 systemd 配置
sudo systemctl restart docker # 重启 docker 服务
```

### 验证配置
```bash
sudo systemctl show --property=Environment docker
docker run hello-world
```