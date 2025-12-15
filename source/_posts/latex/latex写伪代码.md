---
title: latex写伪代码
cover: https://source.fomal.cc/img/default_cover_9.webp
tags: latex
categories: [Dev Tools, LaTeX]
abbrlink: 861f8bbe
date: 2023-04-09 09:59:10
description: 关于如何在latex中写伪代码
---

## 引言部分

```latex
\usepackage[linesnumbered,ruled,vlined]{algorithm2e}
```

这个宏包用于排版算法，提供了一些命令和环境，可以生成带有行号、注释、缩进等的算法代码。其中，`linesnumbered`选项可以添加行号，`ruled`选项可以生成横线，`vlined`选项可以在每个语句前面添加竖线，使得排版的算法代码更加美观和易读。


## 伪代码写作
```latex
\IncMargin{1em}
\begin{algorithm}[H] 
\SetKwData{Left}{left}\SetKwData{This}{this}\SetKwData{Up}{up} \SetKwFunction{Union}{Union}
\SetKwFunction{FindCompress}{FindCompress} \SetKwInOut{Input}{input}\SetKwInOut{Output}{output}

    \Input{A directed graph $G=(V,E)$}
    \Output{A reversed graph $G^R=(V,E^R)$}
    \BlankLine
    \For{$v \in V$}{$G^{R}$.adj\_list[v]=[]}
    \For{$u \in V$}{
        \For{$v \in G.adj\_list[u]$}{
            $G^{R}$.adj\_list[v].append(u)
        }
    }
    \caption{Graph reversal algorithm}
    \label{alg:graph-reversal}
\end{algorithm}
\DecMargin{1em}
```

### 基本设置
* `\IncMargin{1em}`和`\DecMargin{1em}`是`algorithm2e`宏包提供的命令，用于控制算法环境中的缩进，`\IncMargin`用于增加缩进，`\DecMargin`用于减少缩进，参数1em表示缩进的距离为1个字号的宽度。
* `\begin{algorithm}[H]`和`\end{algorithm}`是算法环境的开始和结束标记，其中选项[H]表示强制将算法排版在当前位置，不浮动到其他页面或位置。
* `\caption{Graph reversal algorithm}`命令用于设置算法的标题，`\label{alg:graph-reversal}`命令用于为算法添加标签，方便在文中引用该算法。
* `\SetKwData{Left}{left}\SetKwData{This}{this}\SetKwData{Up}{up}`和`\SetKwFunction{Union}{Union}\SetKwFunction{FindCompress}{FindCompress}`分别定义了三个变量和两个函数，用于在算法中使用。`\SetKwInOut{Input}{input}\SetKwInOut{Output}{output}`定义了两个输入输出命令，用于说明算法的输入和输出。

`\SetKwInOut{Input}{input}` 这段代码表示，在代码的输入部分使用 `\Input` 进行输入:`\Input{A directed graph $G=(V,E)$}`。同时在伪代码显示时显示 'input' 如图


### 伪代码语法
