---
title: latex插入图片
cover: https://source.fomal.cc/img/default_cover_11.webp
tags: latex
categories: latex
abbrlink: c56f9fd
date: 2023-04-09 09:37:10
description: 关于如何在latex中插入图片
---

## 引言部分
```latex
\usepackage{graphicx}
\usepackage{float}
```

* `graphicx`：这个宏包用于支持插入和操作图形文件。它提供了一些命令和选项，可以插入各种格式的图像文件，例如`\includegraphics`命令可以插入图片文件，`\scalebox`命令可以调整图片的大小等。
* `float`：这个宏包用于控制浮动体的位置和格式。它提供了一些命令和选项，可以将图片、表格等浮动体放置在适当的位置，并设置其标题、标签等格式，例如[H]选项可以将浮动体固定在当前位置，`\caption`命令可以设置浮动体的标题等。

## 插入图片
```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=1.0\textwidth]{figure/模拟波形.png}
    \caption{仿真波形图}
    \label{fig:example}
\end{figure}
```

* `\begin{figure}[H]` 指定了将图片固定在当前位置，不到处乱跑
* `[width=1.0\textwidth]` 将插入的图片宽度设置为当前页面的宽度，即将图片的宽度设置为文本宽度的100%。这样做可以确保图片的宽度与当前页面的宽度相同。


