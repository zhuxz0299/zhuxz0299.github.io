---
title: Makefile编写
cover: https://source.fomal.cc/img/default_cover_30.webp
tags:
  - makefile
  - gcc
abbrlink: f353ec85
date: 2023-05-13 15:58:06
description: 系统介绍 Makefile 的工作机制与编写方法，涵盖显式规则、依赖与文件搜索、伪目标、命令执行、变量、隐含规则、模式规则及自动化变量。
categories: [Dev Tools, Makefile]

---

{% note info %}
内容来自[跟我一起写Makefile](https://seisman.github.io/how-to-write-makefile/index.html)
{% endnote %}

## Makefile 介绍
Makefile 文件用于告诉 `make` 命令需要怎么样的去编译和链接程序。Makefile 希望：
- 如果这个工程没有编译过，那么我们的所有 c 文件都要编译并被链接。
- 如果这个工程的某几个 c 文件被修改，那么我们只编译被修改的 c 文件，并链接目标程序。
- 如果这个工程的头文件被改变了，那么我们需要编译引用了这几个头文件的 c 文件，并链接目标程序。

并且通过一个 `make` 命令实现这些能力。

假如文件夹下存在 `Makefile` 内容如下：
```makefile
edit : main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
    cc -o edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o

main.o : main.c defs.h
    cc -c main.c
kbd.o : kbd.c defs.h command.h
    cc -c kbd.c
command.o : command.c defs.h command.h
    cc -c command.c
display.o : display.c defs.h buffer.h
    cc -c display.c
insert.o : insert.c defs.h buffer.h
    cc -c insert.c
search.o : search.c defs.h buffer.h
    cc -c search.c
files.o : files.c defs.h buffer.h command.h
    cc -c files.c
utils.o : utils.c defs.h
    cc -c utils.c
clean :
    rm edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
```

反斜杠（ `\` ）是换行符，便于 Makefile 的阅读。

输入 `make` 命令后：
1. `make` 会在当前目录下找名字叫 `Makefile` 或 `makefile` 的文件。
2. 如果找到，它会找文件中的第一个目标文件（target），在上面的例子中，他会找到 `edit`，并把这个文件作为最终的目标文件。
3. 如果 `edit` 文件不存在，或是 `edit` 所依赖的后面的 `.o` 文件的文件修改时间要比 `edit` 这个文件新，那么，他就会执行后面所定义的命令来生成 `edit` 这个文件。
4. 如果 `edit` 所依赖的 `.o` 文件也不存在，那么 `make` 会在当前文件中找目标为 `.o` 文件的依赖性，如果找到则再根据那一个规则生成 `.o` 文件。（这有点像一个堆栈的过程）


## Makefile 规则书写
最普通易懂的规则为：

```makefile
target ... : prerequisites ...
    recipe
    ...
```

除此之外也有这样的写法：
```makefile
targets : prerequisites ; command
    command
    ...
```

- target：可以是一个 object file（目标文件），也可以是一个可执行文件，还可以是一个标签（label）
- prerequisites：生成该 target 所依赖的文件和/或 target
- recipe：该 target 要执行的命令（任意的 shell 命令）

按照上述规则，prerequisites 中如果有一个以上的文件比 target 文件要新的话，recipe 所定义的命令就会被执行。


### 在规则中使用通配符
在 GNU make 中，常见的文件名通配符主要是：
- `*`：匹配任意长度的字符串
- `?`：匹配任意一个字符
- `[...]`：匹配括号中的一个字符

同时通配符出现的位置不同，处理方式也不同
- 出现在目标或者依赖中
  - 例如目录下有 `main.c`, `foo.c`
    ```makefile
    program: *.c
	    gcc *.c -o program
    ```
  - 则 make 会展开得到 `program: main.c, foo.c`
- 出现在命令中
  - 还是上面的例子，但是底下的 `gcc *.c -o program` 会由 shell 展开
- 出现在变量赋值中
  - 不会自动展开，因此要使用 `wildcard`
  - 例如 `sources := $(wildcard src/*.c)`

### 文件搜索
在大的工程中，会有大量的源文件被存放在不同的目录中。当 make 需要去找这些文件时，可以写出文件的完整路径，也可以把一个路径告诉 make，让 make 自动去找。

Makefile 的 `VPATH` 变量用于完成这一工作。
- 若未设置该变量，则 make 默认在当前目录找文件
- 若设置了改变量，例如 `VPATH = src:../headers`，则 make 会按照 `./`->`src`->`../headers` 的顺序在目录中搜索文件，即当前目录依然是最高优先级

或者也可以使用 `vpath` 关键字（也是写在 Makefile 中）
- `vpath <pattern> <directories>`
  - 为符合模式 `<pattern>` 的文件指定搜索目录 `<directories>`。
- `vpath <pattern>`
  - 清除符合模式 `<pattern>` 的文件的搜索目录。
  - 例如使用了 `vpath %.c` 之后，之前设置的 `vpath %.c src` 就会被清除掉
- `vpath`
  - 清除所有已被设置好了的文件搜索目录。

上述 `vpath` 使用方法中的 `<pattern>` 需要包含 `%` 字符，意为匹配零或若干字符。例如，`%.h` 表示所有以 `.h` 结尾的文件。


### 伪目标
某些时候并不需要生成文件，而仅仅是为了执行命令，此时的 target 就不是文件名，而是一个标签。例如
```makefile
clean:
    rm *.o temp
```

这里的 `clean` 就是一个标签。正因为不生成文件，make 无法生成它的依赖关系和决定它是否要执行，所以只有通过显式地指明这个“目标”才能让其生效。例如上面就是需要运行 `make clean`。

伪目标的名称通常不要和文件名重名，否则可能会让 make 误解。如果确实有重名，则可以使用 `.PHONY` 来标记：
```makefile
.PHONY : clean
clean :
    rm *.o temp
```

此时无论是否有 `clean` 这个文件，make 都知道这值是个标签。

伪目标的其他性质：
- 伪目标一般没有依赖的文件，但也可以手动指定
- 伪目标同样可以作为“默认目标”，只要它是 Makefile 文件的第一个目标
```makefile
all : prog1 prog2 prog3
.PHONY : all

prog1 : prog1.o utils.o
    cc -o prog1 prog1.o utils.o

prog2 : prog2.o
    cc -o prog2 prog2.o

prog3 : prog3.o sort.o utils.o
    cc -o prog3 prog3.o sort.o utils.o
```

这个例子可以说明上面两点：直接运行 `make` 命令，可以同时得到 `prog1, prog2, prog3` 程序。

- 伪目标本身同样也可成为依赖
```makefile
.PHONY : cleanall cleanobj cleandiff

cleanall : cleanobj cleandiff
    rm program

cleanobj :
    rm *.o

cleandiff :
    rm *.diff
```

这个例子中运行 `cleanall` 会自动调用 `cleanobj` 以及 `cleandiff`。

### 静态模式
能更容易的定义多目标的规则。语法为：

```makefile
<targets ...> : <target-pattern> : <prereq-patterns ...>
    <commands>
    ...
```

- `target` 为目标集合
- `target-pattern` 为目标的模式
- `prereq-patterns` 为依赖的模式，该模式取决于 `target-pattern`

例如：
```makefile
objects = foo.o bar.o

all: $(objects)

$(objects): %.o: %.c
    $(CC) -c $(CFLAGS) $< -o $@
```

规则展开后相当于
```makefile
foo.o : foo.c
    $(CC) -c $(CFLAGS) foo.c -o foo.o
bar.o : bar.c
    $(CC) -c $(CFLAGS) bar.c -o bar.o
```


## Makefile 命令书写
每条规则中的命令和操作系统 shell 的命令行一致。make 会一按顺序一条一条的执行命令，每条命令的开头必须以 `Tab` 键开头，除非命令紧跟在依赖规则后面的分号后。

make 的命令默认被 `/bin/sh` —— UNIX 的标准 shell 解释执行的。`/bin/sh` 通常是个软链接，可能指向 `/usr/bin/dash` 或者 `/usr/bin/bash` 之类的 shell。

### 命令的打印
make 通常会把其要执行的命令行在执行前打印到屏幕上。但如果将 `@` 字符放在命令行前，则该命令本身将不被打印。例如：
```makefile
@echo 正在编译XXX模块......
```

当 make 执行时，会输出`正在编译XXX模块……`字符串；如果没有前面的 `@`，则会输出 `echo 正在编译XXX模块......\n 正在编译XXX模块......`。

make 可以通过参数 `-n` 或 `--just-print` 只打印命令而不执行，便于调试 Makefile；还可以通过 `-s` 或 `--silent` 或 `--quiet` 全面禁止命令的显示。

### 命令的执行
当某条规则的目标需要被更新时，make 会一条一条的执行其后的命令。但是在默认情况下，make 会把配方中的每一行命令交给一个新的 shell 进程执行。因此对于如下命令：
```makefile
exec:
    cd /home/hchen
    pwd
```

pwd会打印出当前的 Makefile 所在目录而非 `/home/hchen`。如果希望上一条命令的结果应用在下一条命令时，需要将两个命令写在同一行，即：
```makefile
exec:
    cd /home/hchen; pwd
# 或者
exec:
    cd /home/hchen && pwd
```

其中 `;` 和 `&&` 都是 shell 的语法。`;` 表示依次执行两条命令，无论第一条命令是否成功，第二条都执行；`&&` 则只有第一条命令成功时，第二条才会继续执行。

### 嵌套执行 make
在大的工程中，考虑到不同模块或是不同功能的源文件通常会被放在不同的目录中，给每个目录写一个 Makefile 也是合理的做法，这样能防止所有规则都放到同一个 Makefile 里面过于臃肿。

例如，项目有一个子目录叫 `subdir`，其中有个 Makefile 文件用于指明该目录下文件的编译规则。那么总控的 Makefile 可以这样书写：
```makefile
subsystem:
    cd subdir && $(MAKE)
# 或者
subsystem:
    $(MAKE) -C subdir
```

宏变量 `$(MAKE)` 中可以包含一些 make 的参数，这样便于统一维护参数。


## Makefile 的变量
Makefile 中的变量是一个字符串，使用时与 C 语言中的宏有点相似，做文本层面的展开。

变量在声明时需要给予初值，而在使用时，需要给在变量名前加上 `$` 符号，但最好用小括号 `()` 或是大括号 `{}` 把变量给包括起来。如果你要使用真实的 `$` 字符，那么你需要用 `$$` 来表示。

例如最初的例子，对于
```makefile
edit : main.o kbd.o command.o display.o insert.o search.o files.o utils.o
    cc -o edit main.o kbd.o command.o display.o insert.o search.o files.o utils.o
```

可以写成
```makefile
objects = main.o kbd.o command.o display.o insert.o search.o files.o utils.o

edit : $(objects)
    cc -o edit $(objects)
```

### 变量中的变量
在定义变量的值时，我们可以使用其它变量来构造变量的值。第一种方式，也就是简单的使用 = 号，在 = 左侧是变量，右侧是变量的值，右侧变量的值可以定义在文件的任何一处，例如：

```makefile
CFLAGS = $(include_dirs) -O
include_dirs = -Ifoo -Ibar
```

当 `CFLAGS` 在命令中被展开时，会是 `-Ifoo -Ibar -O` 。但这种形式也有不好的地方，那就是递归定义，如：
```makefile
CFLAGS = $(CFLAGS) -O
```

这会让 make 陷入无限的变量展开过程中去，当然 make 是有能力检测这样的定义，并会报错。

为了避免上面的这种方法，我们可以使用 make 中的另一种用变量来定义变量的方法。这种方法使用的是 `:=` 操作符，如：

```makefile
ifeq (0,${MAKELEVEL})
cur-dir   := $(shell pwd)
whoami    := $(shell whoami)
host-type := $(shell arch)
MAKE := ${MAKE} host-type=${host-type} whoami=${whoami}
endif
```

这里就避免了递归定义。对于系统变量 `MAKELEVEL`，其意思是，如果 make 有一个嵌套执行的动作，那么这个变量会记录当前 Makefile 的调用层数。

### 追加变量值
可以使用 `+=` 操作符给变量追加值，如：

```makefile
objects = main.o foo.o bar.o utils.o
objects += another.o
```

于是 `$(objects)` 值变成：`main.o foo.o bar.o utils.o another.o`。如果变量之前没有定义过，那么， `+=` 会自动变成 `=`。	

### 替换引用
如果希望在引用变量时，对变量值中的文件名进行一定的替换，可以使用替换引用：
```makefile
$(var:<old-suffix>=<new-suffix>)
# 或者
$(var:<old-pattern>=<new-pattern>)
```

例如：
```makefile
SRCS := main.c foo.c
OBJS := $(SRCS:.c=.o)
# 或者
OBJS := $(SRCS:%.c=%.o)
```

- `$(SRCS:.c=.o)` 为后缀写法，它会检查 `SRCS` 中的每个单词，并把单词末尾的 `.c` 替换为 `.o`，因此 `OBJS` 的值为 `main.o foo.o`。
- `$(SRCS:%.c=%.o)` 为更加一般的模式匹配写法，显示使用 `%` 表示需要保留的部分。在这个例子中与后缀写法效果效果相同。


## Makefile 中的函数
类似变量的使用，函数的调用同样通过 `$` 进行，其语法如下：
```makefile
$(<function> <arguments>)
# 或者
${<function> <arguments>}
```

`<function>` 为函数名， `<arguments>` 为函数的参数，参数间以逗号 `,` 分隔，而函数名和参数之间以空格分隔。

下面介绍一些最常用的处理函数。

### 字符串处理函数

#### patsubst
```makefile
$(patsubst <pattern>,<replacement>,<text>)
```
 
- 功能：查找 `<text>` 中的单词是否符合模式 `<pattern>` ，如果匹配的话，则以 `<replacement>` 替换。
- 返回：函数返回被替换过后的字符串。
- 示例：`$(patsubst %.c,%.o,x.c.c bar.c)`
  - 把字串 `x.c.c bar.c` 符合模式 `%.c` 的单词替换成 `%.o` ，返回结果是 `x.c.o bar.o`

- 备注：这和我们前面“变量章节”说过的相关知识有点相似。如 `$(var:<pattern>=<replacement>;)` 相当于 `$(patsubst <pattern>,<replacement>,$(var))` ，而 `$(var: <suffix>=<replacement>)` 则相当于 `$(patsubst %<suffix>,%<replacement>,$(var))` 。
    
    例如有:
    
    objects = foo.o bar.o baz.o，
    
    那么， `$(objects:.o=.c)` 和 `$(patsubst %.o,%.c,$(objects))` 是一样的。
    

#### strip
```makefile
$(strip <string>)
```

- 功能：去掉 `<string>` 字串中开头和结尾的空字符。
- 返回：返回被去掉空格的字符串值。
- 示例：
    ```makefile
    ifeq ($(strip $(CC)),)
        $(error CC is empty)
    endif
    ```
  - 这里就是在判断变量是否为空（可以避免只有空格导致没判断不为空的情况）


#### filter/filter-out
```makefile
$(filter <pattern...>,<text>)
```

- 功能：以 `<pattern>` 模式过滤 `<text>` 字符串中的单词，保留符合模式 `<pattern>` 的单词。可以有多个模式。
- 返回：返回符合模式 `<pattern>` 的字串。
- 示例：
    ```makefile
    sources := foo.c bar.c baz.s ugh.h
    foo: $(sources)
        cc $(filter %.c %.s,$(sources)) -o foo
    ```
  - `$(filter %.c %.s,$(sources))` 返回的值是 `foo.c bar.c baz.s` 。
    
`filter-out` 就是 `filter` 取补集，返回不匹配 pattern 的项。

    
### 文件名操作函数

以下函数主要用于处理文件名。每个函数的参数字符串都会被当做一个或是一系列的文件名来对待。

#### dir/notdir

```makefile
$(dir <names...>)
```
 
- 功能：从文件名序列 `<names>` 中取出目录部分。目录部分是指最后一个 `/` 之前的部分。如果没有，那么返回 `./` 。
- 返回：返回文件名序列 `<names>` 的目录部分。
- 示例： `$(dir src/foo.c hacks)` 返回值是 `src/ ./` 。

`notdir` 是 `dir` 的补集，取非目录部分，例如 `$(dir src/foo.c hacks)` 返回值是 `foo.c hacks`

#### suffix/basename
```makefile
$(suffix <names...>)
```

- 功能：从文件名序列 `<names>` 中取出各个文件名的后缀。
- 返回：返回文件名序列 `<names>` 的后缀序列，如果文件没有后缀，则返回空字串。
- 示例： `$(suffix src/foo.c src-1.0/bar.c hacks)` 返回值是 `.c .c`。

`basename` 是 `suffix` 的补集，取文件名的前缀。例如 `$(basename src/foo.c src-1.0/bar.c hacks)` 返回值是 `src/foo src-1.0/bar hacks`。


#### addsuffix/addprefix
```makefile
$(addsuffix <suffix>,<names...>)
```
- 功能：把后缀 `<suffix>` 加到 `<names>` 中的每个单词后面。
- 返回：返回加过后缀的文件名序列。
- 示例： `$(addsuffix .c,foo bar)` 返回值是 `foo.c bar.c` 。
    
`addprefix` 类似，不过加的是前缀。例如 `$(addprefix src/,foo bar)` 返回值是 `src/foo src/bar` 。
    

### foreach 函数

用于循环执行，Makefile 中的 `foreach` 函数基本仿照 Unix 标准 Shell（`/bin/sh`）中的 for 语句，其语法为：

```makefile
$(foreach <var>,<list>,<text>)
```

有点类似 python 的：
```python
for var in list:
    text (var)
```

例如
```makefile
names := a b c d
files := $(foreach n,$(names),$(n).o)
```

`file` 的结果为 `a.o b.o c.o d.o` 。

### if 函数

```makefile
$(if <condition>,<then-part>)
# 或者
$(if <condition>,<then-part>,<else-part>)
```

- 如果 `<condition>` 为真（返回非空字符串），那个 `<then-part>` 会是整个函数的返回值
- 如果 `<condition>` 为假（返回空字符串），那么 `<else-part>` 会是整个函数的返回值，此时如果 `<else-part>` 没有被定义，那么，整个函数返回空字串。

所以， `<then-part>` 和 `<else-part>` 只会有一个被计算。


## Makefile 的其他规则
### 隐含规则 (implicit rule)
上面直接写出来的是显式规则 (explicit rule)，事实上 Makefile 也有隐含规则。例如有这样一个 Makefile：
```makefile
foo : foo.o bar.o
    cc –o foo foo.o bar.o $(CFLAGS) $(LDFLAGS)
```

注意到其中没有如何生成 `foo.o` 和 `bar.o` 这两目标的规则和命令，这是因为 make 的“隐含规则”功能会自动为我们推导得到：
```makefile
foo.o : foo.c
    cc –c foo.c $(CFLAGS)
bar.o : bar.c
    cc –c bar.c $(CFLAGS)
```

#### 常用隐含规则

- 编译 C 程序的隐含规则
  - `<n>.o` 的目标的依赖目标会自动推导为 `<n>.c `，并且其生成命令是 `$(CC) –c $(CPPFLAGS) $(CFLAGS)`
- 编译 C++ 程序的隐含规则
  - `<n>.o` 的目标的依赖目标会自动推导为 `<n>.cc` 或 `<n>.cpp`，并且其生成命令是 `$(CXX) –c $(CPPFLAGS) $(CXXFLAGS)` 
- 链接 Object 文件的隐含规则
  - `<n>` 目标依赖于 `<n>.o` ，通过运行C的编译器来运行链接程序生成（一般是 `ld` ），其生成命令是：`$(CC) $(LDFLAGS) <n>.o $(LOADLIBES) $(LDLIBS)` 

#### 隐含规则使用的变量
在隐含规则中的命令中，基本上都是使用了一些预先设置的变量。你可以在 
- Makefile 中改变这些变量的值
- 在 `make` 的命令行中传入这些值
- 在你的环境变量中设置这些值

无论怎么样，只要设置了这些特定的变量，那么其就会对隐含规则起作用。例如编译 C 程序的隐含规则的命令是 `$(CC) –c $(CFLAGS) $(CPPFLAGS)` 。Make默认的编译命令是 `cc` ，如果你把变量 `$(CC)` 重定义成 `gcc` ，把变量 `$(CFLAGS)` 重定义成 `-g` ，那么，隐含规则中的命令全部会以 `gcc –c -g $(CPPFLAGS)` 的样子来执行了。

常用的关于命令的变量
- `AR` : 函数库打包程序。默认命令是 `ar`
- `AS` : 汇编语言编译程序。默认命令是 `as`
- `CC` : C语言编译程序。默认命令是 `cc`
- `CXX` : C++语言编译程序。默认命令是 `g++`
- `CPP` : C程序的预处理器（输出是标准输出设备）。默认命令是 `$(CC) –E` 
- `TEX` : 从TeX源文件创建TeX DVI文件的程序。默认命令是 `tex`
- `RM` : 删除文件命令。默认命令是 `rm –f`

常用的关于命令参数的变量
- `ARFLAGS` : 函数库打包程序AR命令的参数。默认值是 `rv`
- `ASFLAGS` : 汇编语言编译器参数。（当明显地调用 `.s` 或 `.S` 文件时）
- `CFLAGS` : C语言编译器参数。
- `CXXFLAGS` : C++语言编译器参数。
- `CPPFLAGS` : C预处理器参数。（ C 和 Fortran 编译器也会用到）。
- `LDFLAGS` : 链接器参数。（如： `ld` ）


### 模式规则
模式规则相当于是自己定义隐含规则。

假设项目中有一些 `.txt` 文件，需要通过自己写的程序 `encrypt` 转换成 `.enc` 文件：
```
report.txt  → report.enc
secret.txt  → secret.enc
config.txt  → config.enc
```

如果不使用模式规则，则应当为：
```makefile
all: report.enc secret.enc config.enc

report.enc: report.txt
	./encrypt report.txt report.enc

secret.enc: secret.txt
	./encrypt secret.txt secret.enc

config.enc: config.txt
	./encrypt config.txt config.enc
```

如果使用模式规则，则可以简化为：
```makefile
all: report.enc secret.enc config.enc

%.enc: %.txt
	./encrypt $< $@
```

其中 `%.enc: %.txt; ./encrypt $< $@` 这一项即为模式规则。前面讲的隐含规则，例如 `%.o: %.c: $(CC) –c $(CPPFLAGS) $(CFLAGS) $< -o $@` 相当于是 make 预先设定的隐含规则。


#### 自动化变量
写模式规则通常要用到自动化变量。自动化变量是在某一条规则的命令执行时，由 make 临时填入的变量。常用的自动化变量有：
- `$@`：当前正在生成的目标
- `$<`：第一个依赖
- `$^`：所有依赖，自动去重
- `$?`：所有比目标新的依赖

一个直观的例子：
```makefile
main.o: main.c common.h config.h
	gcc -c $< -o $@
```

此时 `$@ = main.o $< = main.c`

在模式规则中：
```makefile
%.o: %.c
	gcc -c $< -o $@
```

假如 make 正在使用这个规则生成 `foo.o`，那么有 `$@ = foo.o, $< = foo.c`

`$^` 在链接命令中比较常见：
```makefile
program: main.o utils.o math.o mian.o
	gcc $^ -o $@
```

此时底下的命令相当于：`gcc main.o utils.o math.o -o program`

`$?` 适用于只处理发生变化的依赖：
```makefile
backup.tar: a.txt b.txt c.txt
	tar -uf $@ $?
```

假如 `b.txt` 和 `c.txt` 比 `backup.tar` 新，那么 `$? = b.txt c.txt`
