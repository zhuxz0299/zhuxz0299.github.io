---
title: VS 中 C# 依赖管理
date: 2025-07-26 15:12:19
tags:
description: 
cover: 'https://source.fomal.cc/img/default_cover_154.webp'
---

C# 有两种包管理格式：Packages.config 与 PackageReference

## Packages.config
是一种比较旧的 NuGet 引用管理方式

* 项目类型： 你的项目目标框架是 .NET Framework 4.7.2 (net472)。很多传统的 .NET Framework 项目（尤其是非 SDK 风格的项目）默认使用 packages.config。
* 项目格式： 检查你的 .csproj 文件：
  * 如果开头是类似 <Project ToolsVersion="15.0" ...>，这通常是旧格式项目，默认使用 packages.config。
  * 如果开头是 <Project Sdk="Microsoft.NET.Sdk"> 或 <Project Sdk="Microsoft.NET.Sdk.Web">，这是 SDK 风格项目，默认使用 PackageReference。

Packages.config 文件需要放到项目文件夹根目录下，然后当项目迁移到别的电脑时，右键“解决方案”——“还原 NuGet 包”即可根据 Packages.config 文件自动下载依赖。