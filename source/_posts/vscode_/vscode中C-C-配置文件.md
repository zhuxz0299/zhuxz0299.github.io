---
title: vscode中C/C++配置文件
cover: https://source.fomal.cc/img/default_cover_44.webp
tags: vscode
description: 对于vscode中C/C++配置文件的详细讲解
abbrlink: 8117db7e
date: 2023-09-24 14:04:34
---

参考[官方文档](https://code.visualstudio.com/docs/cpp/config-mingw)

{%note info%}
这里使用的是 [mingw-w64](http://mingw-w64.org/) 的 g++ 编译器和 gdb 调试器。
{%endnote%}

## task.json
该配置文件用于指定编译 `.cpp` 文件时的配置。
```json
{
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: g++.exe 生成活动文件",
            "command": "D:\\mingw64\\bin\\g++.exe",
            "args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\${fileBasenameNoExtension}.exe"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "调试器生成的任务。"
        }
    ],
    "version": "2.0.0"
}
```

* `label` 用于呈现该任务在任务列表中的名称
* `command` 用于指定使用的编译器
* `args` 用于指定传递给编译器的命令行参数
  * `-fdiagnostics-color=always` 是一个编译器选项，用于启用带颜色的诊断信息。
  * `-g` 是一个编译器选项，表示需要生成调试信息
  * `${file}` 是一个变量，表示当前文件的路径。这里指的就是需要编译当前的文件
  * `-o` 是一个编译器选项，用于指定输出文件的名称。
  * `${fileDirname}\${fileBasenameNoExtension}.exe` 是一个变量和字符串的组合，表示输出文件的路径和名称。
    * `${fileDirname}` 代表当前文件所在的目录路径，
    * `${fileBasenameNoExtension}` 代表当前文件的基本名称（不包含扩展名），`.exe` 表示输出文件的扩展名为.exe。
* `options` 字段用于指定任务的附加选项
  * `"cwd": "${fileDirname}"` 指定工作目录为当前文件所在的目录
* `problemMatcher` 用于识别任务输出中的错误、警告或其他特定的消息，并将其解析为可在编辑器中显示或处理的格式，从而让编辑器可以根据任务输出中的问题信息，如编译错误或警告，将其在源代码中进行高亮显示、导航到错误位置、生成错误列表等。
  * `$gcc` 表示用于解析GCC编译器的输出
* `detail` 中的内容是任务列表中作为描述的内容


## launch.json
该配置文件用于指定调试 `.cpp` 文件时的配置。
```json
{
    "configurations": [
        {
            "name": "C/C++: g++.exe 生成和调试活动文件",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "D:\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                },
                {
                    "description": "将反汇编风格设置为 Intel",
                    "text": "-gdb-set disassembly-flavor intel",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "C/C++: g++.exe 生成活动文件"
        }
    ],
    "version": "2.0.0"
}
```

* `name`: 配置项的名称，用于在调试器界面中显示。
* `type`: 调试器的类型。在这个示例中，使用的是 `cppdbg`，表示 C/C++ 调试器。
* `request`: 指定调试器的请求类型。
  * 在这个示例中，使用的是 `launch`，表示启动调试器。其他请求类型还有 `attach`(附加到正在运行的进程进行调试)和 `attachCore`(附加到核心转储文件进行调试)
* `program`: 指定要调试的可执行文件路径。`${fileDirname}\${fileBasenameNoExtension}.exe` 表示使用的是当前文件所在目录下的可执行文件路径
* `args`: 传递给可执行文件的命令行参数。
* `stopAtEntry`: 指定是否在程序入口处停止。
* `cwd`: 指定调试器的当前工作目录。
* `environment`: 指定调试器的环境变量。
* `externalConsole`: 指定是否在外部控制台中运行程序。
  * 在这个示例中，设置为 `false`，调试的时候就会直接使用vscode中的面板。
  * 如果设置为 `true`，就会跳出来一个黑窗口
* `MIMode`: 指定调试器的 MI(Machine Interface)模式，用于定义调试器和其他工具之间的交互方式。使用MI模式，外部工具可以向GDB发送各种命令，如设置断点、执行程序、单步执行、查询变量值等
  * 在这个示例中，使用的是 `gdb`，表示使用 GNU Debugger。
* `miDebuggerPath`: 指定调试器的可执行文件路径。在这个示例中，使用的是 `D:\mingw64\bin\gdb.exe`，表示使用 MinGW-w64 工具链下的 GDB。
* `setupCommands`: 配置调试器的附加命令。
* `preLaunchTask`: 在启动调试器之前执行的任务。在这个示例中，指定了一个名为 `C/C++: g++.exe 生成活动文件` 的任务。
* `version`: launch.json 文件的版本号。在这个示例中，使用的是 `2.0.0`。

## c_cpp_properties.json
```json
{
    "configurations": [
        {
            "name": "Win32",
            "includePath": [
                "${workspaceFolder}/**"
            ],
            "defines": [
                "_DEBUG",
                "UNICODE",
                "_UNICODE"
            ],
            "compilerPath": "D:\\mingw64\\bin\\g++.exe",
            "cStandard": "c17",
            "cppStandard": "c++17",
            "intelliSenseMode": "windows-gcc-x64"
        }
    ],
    "version": 4
}
```

* `name` 配置项的名称。
* `includePath` 指定编译器应该搜索头文件的路径。
  * `${workspaceFolder}/**` 表示在工作目录下搜索所有子目录。这样可以确保编译器在编译过程中能够找到所需的头文件。
* `defines` 定义预处理器宏。预处理器宏是在代码编译之前由预处理器处理的标识符。
* `compilerPath` 用来推断C++标准库头文件的路径。当扩展知道这些文件的位置时，它可以提供智能代码补全和跳转到定义等功能。
* `cStandard` 指定C语言的标准版本。
* `cppStandard` 指定C++语言的标准版本。
* `intelliSenseMode` 指定智能感知(IntelliSense)模式。IntelliSense是一个代码补全和代码分析功能，它可以提供代码提示、语法检查等功能。
  * `windows-gcc-x64` 表示使用适用于Windows平台的gcc编译器的智能感知模式。