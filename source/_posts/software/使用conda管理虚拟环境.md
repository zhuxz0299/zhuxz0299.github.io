---
title: 使用conda管理虚拟环境
cover: https://source.fomal.cc/img/default_cover_1.webp
tags:
  - conda
  - python
  - 虚拟环境
abbrlink: 757571af
date: 2023-03-08 10:11:16
description: 使用anaconda来进行虚拟环境的安装、卸载，以及相关包的下载和卸载。
categories: [Dev Tools, Software]

---

### 常用指令
1. `conda list`查看安装了哪些包
	```console
	Blog> conda list
	# packages in environment at D:\anaconda3:
	#
	# Name                    Version                   Build  Channel   
	_anaconda_depends         2022.10                  py39_2    defaults
	_ipyw_jlab_nb_ext_conf    0.1.0            py39haa95532_0    defaults
	_tflow_select             2.3.0                       mkl    defaults
	absl-py                   1.3.0            py39haa95532_0    defaults
	...
	```
	注：文中的`...`表示此处只截取了控制台中的部分内容。

2. `conda env list` 或 `conda info -e` 查看存在哪些虚拟环境
	```console
	conda env list
	# conda environments:
	#
	base                  *  D:\anaconda3
	pyforcvx                 D:\anaconda3\envs\pyforcvx   
	sklearn-env              D:\anaconda3\envs\sklearn-env
	```
	其中*表示正在使用的环境。

3. `conda update conda` 检查更新当前conda

### 创建python虚拟环境
#### 直接创建一个新的环境
创建python版本为X.X、名字为your_env_name的虚拟环境。
```bash
conda create -n <your_env_name> python=X.X
```

例如：
```console
Blog> conda create -n demo1 python=3.7
```

#### 利用yaml文件从其他地方转移环境
首先需要导出 conda 环境，可以运行以下命令导出当前环境。
```bash
conda env export > <env>.yml
```

然后再利用该文件创建环境。
```bash
conda env create -n <your_env_name> -f <env>.yaml
```

### 删除虚拟环境
`conda remove -n  <your_env_name> --all`

```console
Blog> conda remove -n demo1 --all
```

### 激活、退出虚拟环境
使用 `conda activate <your_env_name>` 激活虚拟环境，例如：
```bash
conda activete demo1
```

使用 `conda deactivate` 退出当前虚拟环境

### 在虚拟环境中安装、删除包
可以使用 `conda install <package_name>` 安装包，例如：
```console
Blog> conda install numpy
```

安装时也可以指定包的版本号 `conda install <package_name>==<version>`，安装流程同上。

安装包的时候还可以指定环境名称。`conda install -n <your_env_name> [package]`，例如：
```console
Blog> conda install -n demo2 numpy
```
虽然使用命令是这里的环境还是`demo1`,但是`numpy`包被装到了`demo2`中。

想要删除包，可以使用 `conda remove <package_name>`；如果想一次同时删除多个包，则使用形如 `conda remove <package_name1> <package_name2> <package_name3>` 的命令。
```console
Blog> conda remove numpy
```

同样也可以删除其他环境中的包 `conda remove --name <your_env_name> <package_name>`
```console
Blog> conda remove --name demo1 numpy
```
(使用这段代码是处于`demo2`环境下)

### 一些命令参数解释
* `-n` 是 `--name` 的简写，表示指定名字
* `-f` 是 `--file` 的简写，表示指定环境
* `conda` 的子命令 `env` 是一个模块，用于 管理环境的高级功能，如：
  * 使用 `conda env export` 导出环境。
  * 使用 `conda env create` 基于配置文件创建环境。
  * 使用 `conda env remove` 删除环境。