---
title: Latex插入代码块
cover: https://source.fomal.cc/img/default_cover_10.webp
categories: latex
tags: latex
abbrlink: 1bc4beea
date: 2023-04-09 09:14:14
description: 关于如何在latex中插入代码块
---

## 引言部分
首先导入宏包
```latex
\usepackage{listings}
\usepackage{xcolor}
```

* `xcolor`：这个宏包用于支持使用颜色。它提供了一些命令和选项，可以定义和使用颜色，例如`\color`命令可以在文本中改变字体颜色，`\pagecolor`命令可以改变页面背景颜色等。

同时对代码样式做出设置
```latex
\lstset{
  language=verilog,  %代码语言使用的是verilog
  frame=shadowbox, %把代码用带有阴影的框圈起来
  rulesepcolor=\color{red!20!green!20!blue!20},%代码块边框为淡青色
  keywordstyle=\color{blue!90}\bfseries, %代码关键字的颜色为蓝色，粗体
  commentstyle=\color{red!10!green!70}\textit,    % 设置代码注释的颜色
  showstringspaces=false,%不显示代码字符串中间的空格标记
  numbers=left, % 显示行号
  numberstyle=\tiny,    % 行号字体
  stringstyle=\ttfamily, % 代码字符串的特殊格式
  breaklines=true, %对过长的代码自动换行
  extendedchars=false,  %解决代码跨页时，章节标题，页眉等汉字不显示的问题
  escapebegin=\begin{CJK*},escapeend=\end{CJK*},      % 代码中出现中文必须加上，否则报错
  texcl=true
}
```

## 代码部分
在插入代码块时，使用如下代码（以Verilog为例）
```latex
\begin{lstlisting}
    flowing_light u0(
        .clock(clock),
        .reset(reset),
        .led(led)
    );

    parameter PERIOD = 10;

    always #(PERIOD*2) clock=!clock;

    initial begin
        clock=1'b0;
        reset=1'b0;
        #(PERIOD*2)reset=1'b1;
        #(PERIOD*4)reset=1'b0;
    end
\end{lstlisting}
```

同时在插入代码块的地方也可以指定语言，如要插入c语言代码
```latex
\begin{lstlisting}[language=C]
    // A C program to print "Hello, world!"
    #include <stdio.h>

    int main() {
        printf("Hello, world!");
        return 0;
    }
\end{lstlisting}
```

如果同时在引言部分和插入代码块的地方指定了语言，那么在插入代码块的地方优先级更高。

