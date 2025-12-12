---
title: C# 基础学习以及 VS 使用
tags:
  - c#
  - vs2022
description: 初次使用 VS2022 构建 C# 项目了解到的知识
cover: 'https://source.fomal.cc/img/default_cover_153.webp'
abbrlink: 2950997e
date: 2025-07-25 22:20:39
---

## VS2022
### 解决方案与项目
* 解决方案
  * 能包含多个项目
  * 解决方案文件可以不和项目文件在同一个文件夹下，从而使得一个解决方案文件夹下有多个项目文件夹
* 启动项目
  * 打开 VS2022，解决方案下能看到多个项目
  * 显示粗体的为启动项目，VS 进行编译的时候会处理该项目下的代码与配置
* 为项目添加新的文件
  * 右键项目——添加——类
* 解决方案与项目文件
  * `.sln` 是解决方案对应的文件
  * `.csproj` 文件是项目管理文件。用 VS 双击打开该文件，就能直接打开当前项目。

### 库打包
为了方便别人使用自己写的库，可以将其打包为打包成 `.dll` 文件。

工作流程：
* 右键解决方案——添加——新建项目——类库
* 在类库项目点击“生成”或者“重新生成”，可以生成 `.dll` 文件。该项目中的 `.cs` 文件都会被放到 `.dll` 中。

注：
* 在“设置”——“输出类型”中，也可以将“类库”改为“控制台程序”，这样生成的就会是 `.exe`。
* 类库项目不能设为启动项目。

库的引用
* 写程序的时候想要引用 `.dll`，需要在项目文件夹下右键“引用”——“添加引用”
  * 同一个解决方案下的 `.dll` 可以在“项目”——“解决方案”中找到
  * 不在同一解决方案下时，可以直接“浏览”找到 `.dll` 的路径
* `.dll` 中包含的 `.cs` 中的 `class` 需要是 `public` 才能访问
* 如果一个 C# 项目编译得到的 `.exe` 文件调用了别的 `.dll`，那么这个时候单独把 `.exe` 拿出来，无法正常运行。



## C# 基础知识
### 控制台 IO 基本命令
`System.Console.WriteLine()`：在控制台中打印
`System.Console.ReadKey()`：读取任意键
`System.Console.ReadLine()`：读取输入，得到的是 string


### 依赖管理
C# 有两种包管理格式：Packages.config 与 PackageReference

#### Packages.config
是一种比较旧的 NuGet 引用管理方式

* 项目类型：例如项目目标框架为 .NET Framework 4.7.2 (net472)。很多传统的 .NET Framework 项目（尤其是非 SDK 风格的项目）默认使用 packages.config。
* 项目格式： 检查 `.csproj` 文件：
  * 如果开头是类似 `<Project ToolsVersion="15.0" ...>`，这通常是旧格式项目，默认使用 packages.config。
  * 如果开头是 `<Project Sdk="Microsoft.NET.Sdk">` 或 `<Project Sdk="Microsoft.NET.Sdk.Web">`，这是 SDK 风格项目，默认使用 PackageReference。

`Packages.config` 文件需要放到项目文件夹根目录下，然后当项目迁移到别的电脑时，右键“解决方案”——“还原 NuGet 包”即可根据 `Packages.config` 文件自动下载依赖。