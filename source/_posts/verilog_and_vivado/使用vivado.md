---
title: 使用vivado
cover: https://source.fomal.cc/img/default_cover_42.webp
tags: vivado
abbrlink: c8f9a135
date: 2023-03-15 15:12:05
description: 关于vivado基本使用方法，主要是应付课程需要
---
## 创建project
确定项目地址与名称：路径中不能出现中文，空格也应当避免
![](../../figure/使用vivado/project_name.png)

选择项目类型：
RTL Project 能自主编辑source，创建、修改IP，支持各种功能。
![](../../figure/使用vivado/project_type.png)

选择板子型号（应该是）：
![](../../figure/使用vivado/default_part.png)
从图中看出，可以选择Family,Package(应该指的是型号的一个归类方式),Speed。最后在下面方框中可以选择具体型号(Part)。

## 页面概览
1. 左侧区 Flow Navigator 包含整个开发流程，像 Project Settings、Run Simulation、Run Synthesized 和 Generate Bitstream 等；
2. 中间区 通常显示当前工程包含的文件树结构，提供工程文件的管理；
3. 右侧区 会显示工程信息、打开的编辑文件等；
4. 下部区 显示各种信息状态。

![](../../figure/使用vivado/overall_view.png)

## 添加源文件
可以在左侧 Flow Navigator->PROJECT MANAGER->Add Scource处或者在中间的Sources下按“+”号。
![](../../figure/使用vivado/add_source_file.png)
然后可以选择添加文件的类型
![](../../figure/使用vivado/add_source_cat.png)
* constraints应该是管脚约束文件
* design source文件就是写Verilog的地方
* simulation source也是创建.v文件，但这个应该还与run simulation有关

![](../../figure/使用vivado/add_source_choice.png)
然后可以选择从其他地方添加文件、文件夹，或者直接新建文件。

## 代码编辑
双击左侧的source中的文件，就能在右侧的编辑器中打开文件。
![](../../figure/使用vivado/code_edit.png)
同时这些生成的文件路径就在项目文件夹的.srcs文件夹中。可以用其他文本编辑器打开文件进行编辑，保存后在vivado中也会显示。
![](../../figure/使用vivado/file_path.png)

## 代码仿真(Simulation)
点击SIMUALTION->Run Simulation->Behavioral Simulation就可以展示图右图simulation的窗口。
![](../../figure/使用vivado/run_simulation.png)

## 添加管脚约束文件
### 通过图形化界面添加
点击左侧Flow Navigator->SYNTHESIS->Run Synthesis

Synthesis完成后出现如图界面，选择Open Synthesis Design.
![](../../figure/使用vivado/synthesis_completed.png)

完成后在右上角选择I/O Planning，下方会出现如图管脚信息。然后选择Package Pin和I/O Std完成设置。点击保存，即可保存管脚信息。
![](../../figure/使用vivado/IO_prots_gui.png)
### 通过代码添加
和添加源文件的方式相同，选择create constraints就行。然后新建的.xdc文件同样可以用文本编辑器进行编辑。