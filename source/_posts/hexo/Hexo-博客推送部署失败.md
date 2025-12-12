---
title: Hexo 博客推送部署失败
tags: hexo
description: 将 Hexo 博客生成的静态文件推送部署到 Github Page 时遇到的问题
cover: 'https://source.fomal.cc/img/default_cover_158.webp'
abbrlink: 5901a609
date: 2025-08-17 22:21:10
---

## 问题
```
FATAL Something's wrong. Maybe you can find the solution here: https://hexo.io/docs/troubleshooting.html
Error: Spawn failed
    at ChildProcess.<anonymous> (C:\Data\Blog\zhuxz0299.github.io\node_modules\hexo-util\lib\spawn.js:51:21)
    at ChildProcess.emit (node:events:517:28)
    at cp.emit (C:\Data\Blog\zhuxz0299.github.io\node_modules\cross-spawn\lib\enoent.js:34:29)
    at ChildProcess._handle.onexit (node:internal/child_process:292:12)
```

## 解决方法
问题由网络因素导致，通过给 git 使用代理解决
```bash
git config  --global http.proxy http://127.0.0.1:10809
git config  --global https.proxy http://127.0.0.1:10809
```

最后的端口号 `10809` 应当填为代理软件监听的本地端口。