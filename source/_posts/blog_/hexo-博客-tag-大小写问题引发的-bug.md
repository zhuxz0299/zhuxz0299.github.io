---
title: hexo 博客 tag 大小写问题引发的 bug
tags: hexo
description: 为 hexo 博客加 tag 时应当保持同一个单词大小写一致
cover: 'https://source.fomal.cc/img/default_cover_160.webp'
abbrlink: c2f8d7d1
date: 2025-08-20 21:11:43
categories: [Dev Tools, Hexo]

---

## 问题
在通过 tag 找之前写的一篇博客时，发现点击进入 "linux" 这个 tag，里面仅有一篇文章。同时还存在 "Linux" 这个 tag，点击进入显示 "404 File not found"。

## 解决办法
通过浏览博客源码发现，虽然多篇文章的 tag 都包含 linux，但是有一篇是 "Linux"，其余为 "linux"，博客网页中看到的正是 tag 中包含 "Linux" 的文章。

由此推测是 tag 大小写的问题。此后可以将 tag 字母统一小写防止该问题。
