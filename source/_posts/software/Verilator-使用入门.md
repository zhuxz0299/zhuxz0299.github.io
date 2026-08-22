---
title: Verilator 使用入门
cover: 'https://source.fomal.cc/img/default_cover_156.webp'
tags:
  - verilator
  - verilog
  - systemverilog
  - hdl
description: 从 HDL 到 C++ 模型，介绍 Verilator 的基本工作流、常用参数、C++ testbench 与波形生成
categories:
  - Dev Tools
  - Software
abbrlink: 69ebbf1e
date: 2026-08-18 15:13:00
---

Verilator 可以将 Verilog/SystemVerilog 设计编译成 C++ 或 SystemC 模型，这个模型再与 testbench 一起由普通 C++ 编译器构建成原生可执行文件，运行该文件即为进行仿真。

本文以一个计数器为例，完整走一遍“检查 RTL → 生成 C++ 模型 → 编写 C++ testbench → 构建并运行 → 查看波形”的流程。

{% note info %}
本文主要参考 [It's Embedded! 的 Verilator 系列教程](https://www.itsembedded.com/dhd/verilator_1/)以及 [Verilator 官方文档](https://verilator.org/guide/latest/)。前者写于 2021 年，文中的总体思路仍然适用，但部分命令和功能边界已经发生变化，本文以当前 Verilator 5 的官方文档为准。

{% endnote %}

## Verilator 是什么

[官方文档](https://verilator.org/guide/latest/overview.html)将 Verilator 定义为编译器，而不是传统意义上的仿真器。它的典型工作流程是：

```text
Verilog/SystemVerilog RTL
          │
          │ Verilator：解析、lint、优化、生成代码
          ▼
    C++/SystemC 模型 + 构建文件
          │
          │ GCC/Clang + C++ testbench + Verilator runtime
          ▼
       原生仿真可执行文件
          │
          ├── 终端中的检查结果
          ├── VCD/FST 波形
          └── 覆盖率等数据
```

与传统 HDL 仿真器相比，Verilator 的特点为：

- 生成的模型经过优化并编译为本机代码，适合大型同步数字电路、高速回归测试和软硬件协同开发；
- testbench 可以直接使用 C++ 的类型、容器、文件 IO 和第三方库，也可以通过 DPI、VPI 等接口连接 HDL 与软件；
- `--lint-only` 可以只做静态检查，即使不使用 Verilator 仿真，也很适合放进编辑器或 CI；
- Verilator 是自由开源软件，不依赖商业仿真器许可证。

### 功能边界

Verilator 主要面向 RTL 功能验证。它不是综合工具，也不能代替静态时序分析或布局布线后的精确时序仿真。

{% note warning %}
网上常把 Verilator 简化为“不支持延时的周期级仿真器”。这对早期版本大体成立，但对现代 Verilator 5 已不准确：使用 `--timing` 时，它能够处理 `#` 延时、事件控制、`wait` 和 `fork` 等结构。不过，默认模式仍然[主要采用二态模型](https://verilator.org/guide/latest/languages.html#unknown-states)，不能完全复现传统四态事件驱动仿真器中 `X`、`Z` 的传播行为，并且部分 SystemVerilog 验证特性仍只得到有限支持。Verilator 5.050 开始提供实验性的 `--fourstate`，但官方将其标为仅供开发使用，暂时不应视为成熟的四态仿真替代方案。
{% endnote %}


## 一个完整的 C++ testbench 示例

示例目录中只有两个手写文件：

```text
verilator-counter/
├── counter.sv       # DUT
└── sim_main.cpp     # C++ testbench
```

### 编写 DUT

`counter.sv` 是一个带低有效异步复位和使能信号的 8 位计数器：

```verilog
module counter #(
    parameter int WIDTH = 8
) (
    input  logic             clk,
    input  logic             rst_n,
    input  logic             en,
    output logic [WIDTH-1:0] count
);

    timeunit 1ns;
    timeprecision 1ns;

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            count <= '0;
        else if (en)
            count <= count + 1'b1;
    end

endmodule
```

先单独进行 lint：

```bash
verilator --lint-only -Wall counter.sv
```

`--lint-only` 表示只检查、不生成模型；`-Wall` 会开启一组更严格的 Verilator 警告。若命令没有输出且返回值为 0，说明没有发现问题。

### 将 SystemVerilog 转换为 C++

最基本的转换命令是：

```bash
verilator --cc -Wall --top-module counter counter.sv
```

其中 `--cc` 选择 C++ 输出模式；`--top-module counter` 指定顶层模块，只有一个明确的顶层模块时可以省略，但在实际项目中显式指定通常更稳妥。命令默认把结果写入 `obj_dir/`。文件名的默认前缀为 `V` 加顶层模块名，因此这里是 `Vcounter`。

#### 需要关注的文件

| 文件 | 何时使用 |
| --- | --- |
| `Vcounter.h` | testbench 使用的主要头文件，包含顶层端口和模型 API |
| `Vcounter.mk` | 手动调用 GNU Make 时的构建入口 |
| `Vcounter` | 使用 `--exe` 构建出的仿真可执行文件 |
| `Vcounter___024unit.h` | `$unit` 作用域中已公开的类型或函数（可选） |
| `Vcounter__Dpi.h` | C++ 与 SystemVerilog 之间的 DPI 声明（可选） |

对本文的计数器而言，C++ testbench 实际只需包含 `Vcounter.h`。

{% note default %}
名称中的 `024` 是字符 `$` 的编码，所以 `___024unit` 表示 `$unit`。
{% endnote %}

#### Vcounter.h 文件

在本例生成的 `Vcounter.h` 中，可以看到类似的声明：

```cpp
class Vcounter : public VerilatedModel {
public:
    VL_IN8(&clk, 0, 0);
    VL_IN8(&rst_n, 0, 0);
    VL_IN8(&en, 0, 0);
    VL_OUT8(&count, 7, 0);

    void eval();
    void final();
    void trace(VerilatedTraceBaseC* tfp, int levels, int options = 0);
};
```

`VL_IN8`、`VL_OUT8` 是 Verilator 用来声明端口的宏。对 testbench 而言，需要关注上面代码提供的接口：
- 顶层端口成为了 C++ 对象的公开成员
  - DUT 是对象时可以写入 `dut.clk`、`dut.en`，并读取 `dut.count`
- `eval(), final(), trace()` 为最常用的类方法

上面是为了便于阅读而保留的精简声明。实际生成的 `Vcounter` 还提供以下公开接口：

- `Vcounter(VerilatedContext*, const char* name = "TOP")` 将模型绑定到指定 context，`Vcounter(const char* name = "TOP")` 使用默认 context，`~Vcounter()` 销毁模型；
- `eval_step()` 和 `eval_end_step()` 用于拆分一次求值，主要用于同一时间步联合求值多个模型；单模型通常直接调用 `eval()`；
- `eventsPending()` 和 `nextTimeSlot()` 用于查询延时产生的待处理事件，主要与 `--timing` 一起使用；
- `contextp()`、`name()`、`hierName()`、`modelName()` 和 `threads()` 用于获取 context 或模型元信息。


#### 其他生成文件

`Vcounter.cpp`、`Vcounter___024root.*`、各层模块对应的 `Vcounter_<模块名>.*`、`Vcounter__Syms.*` 和启用波形后出现的 `Vcounter__Trace*.*`，都是模型的内部实现。构建系统会自动编译它们，testbench 通常不应直接包含或访问。文件名带有 `__Slow` 表示其中存放初始化、收尾等不频繁执行的 cold routines。

`Vcounter_classes.mk`、`Vcounter__ALL.*`、`*.o`、`*.d`、`Vcounter__ver.d` 和 `Vcounter__verFiles.dat` 则属于构建中间产物、依赖关系或 Verilation 记录，一般只在排查构建问题时查看。

### 编写 C++ testbench

创建 `sim_main.cpp`：

```cpp
#include <cstdint>
#include <iostream>

#include "Vcounter.h"
#include "verilated.h"
#include "verilated_fst_c.h"

VerilatedContext context;
VerilatedFstC trace;
Vcounter* dut = nullptr;

void eval_and_dump() {
    dut->eval();
    trace.dump(context.time());
    context.timeInc(5);
}

void tick() {
    dut->clk = 0;
    eval_and_dump();

    dut->clk = 1;
    eval_and_dump();
}

int main(int argc, char** argv) {
    context.commandArgs(argc, argv);
    context.traceEverOn(true);

    dut = new Vcounter{&context};
    dut->trace(&trace, 0);
    trace.open("waveform.fst");

    dut->rst_n = 0;
    dut->en = 0;

    tick();
    tick();

    dut->rst_n = 1;
    dut->en = 1;

    int exit_code = 0;
    for (std::uint32_t expected = 1; expected <= 10; ++expected) {
        tick();

        if (dut->count != expected) {
            std::cerr << "FAIL: expected " << expected
                      << ", got " << +dut->count << '\n';
            exit_code = 1;
            break;
        }
    }

    if (exit_code == 0)
        std::cout << "PASS: count = " << +dut->count << '\n';

    dut->final();
    trace.close();
    delete dut;

    return exit_code;
}
```

头文件说明：

- `verilated.h`：Verilator runtime 的核心 API，包括 `VerilatedContext`；
- `verilated_fst_c.h`：FST 波形写入接口，只在需要 FST 波形时引入。

代码说明：

- DUT 使用指针并在 `main()` 中创建，是为了先执行 `context.commandArgs()`，再构造 Verilated 模型
- `Vcounter dut{&context}` 表示实例化 DUT 时将其显式绑定到仿真上下文
  - 实例化 DUT 时也可以直接写 `Vcounter dut`，此时会使用当前线程的默认 context，在示例这种简单的环境下也可以正常工作
- `context.commandArgs(argc, argv)` 表示将命令行参数交给 runtime，即让编译得到的二进制文件 `obj_dir/Vcounter` 支持接受参数
- `context.traceEverOn(true)` 也可以写成 `Verilated::traceEverOn(true)`，同样表示对当前线程的默认 context 操作
- `dut->trace(&trace, 0)` 中的参数 `0` 在新版本的 Verilator 中没啥用，随便填什么都一样
- `dut->eval()` 根据当前输入重新计算模型，调用该方法模型才会识别边沿并执行相应的时序逻辑
- `context.timeInc(5)` 将仿真时间推进 5 个 time precision 单位，推进时间本身不会求值
- `trace.dump(context.time())` 把最近一次求值后的信号状态写入当前时间点
- `dut->final()` 执行 HDL 中的 `final` 块并完成断言等收尾工作
  - 例如 RTL 或 SystemVerilog testbench 中存在以下代码：
    ```verilog
    final begin
        $display("simulation finished");
    end
    ```
    手写 C++ 主循环时，调用 `dut->final()` 才会执行这个 `final` 块

### 转换与构建

把 DUT、testbench 和波形支持一起构建：

```bash
verilator --cc --exe --build -Wall --trace-fst \
  --top-module counter counter.sv sim_main.cpp
```

可以生成可直接运行的仿真器：`./obj_dir/Vcounter`。如果不使用 `--build`，也可以手动执行生成的构建规则：

```bash
verilator --cc --exe -Wall --trace-fst \
  --top-module counter counter.sv sim_main.cpp
make -C obj_dir -f Vcounter.mk Vcounter
```

### 波形生成说明

Verilator 生成波形需要同时完成两件事：

1. Verilation 时用 `--trace-fst` 或 `--trace-vcd` 将波形支持编译进模型；
2. testbench 中创建相应的 trace 对象，打开文件，并在 `eval()` 后调用 `dump()`。

生成得到的 `.fst` 以及 `.vcd` 文件都可以用 gtkwave 打开。FST 和 VCD 两种格式比较：

| 格式 | Verilator 参数 | C++ 类型 | 特点 |
| --- | --- | --- | --- |
| FST | `--trace-fst` | `VerilatedFstC` | 二进制、文件通常更小，适合日常使用 |
| VCD | `--trace-vcd` | `VerilatedVcdC` | 文本格式、兼容工具更多，但文件通常更大 |

对于大型设计，波形 IO 可能显著降低仿真速度并占用大量磁盘。可以使用 `--trace-depth 1` 限制层数，延后 `trace.open()` 的时间，或仅在失败用例中开启波形。官方 FAQ 的[波形章节](https://verilator.org/guide/latest/faq.html#how-do-i-generate-waveforms-traces-in-c)列出了更多优化方法。

## 常用参数

| 参数 | 作用 |
| --- | --- |
| `--lint-only` | 只做 lint，不生成模型 |
| `-Wall` | 启用更严格的 Verilator 警告 |
| `--cc` / `--sc` | 生成 C++ 模型 / SystemC 模型 |
| `--exe` | 生成可执行文件目标；还需在命令行中传入实现主循环的 C++ 文件 |
| `--build` | 生成代码后自动调用 GNU Make 构建 |
| `--top-module <name>` | 指定顶层模块，并影响默认输出前缀 |
| `--Mdir <dir>` | 修改输出目录，默认为 `obj_dir` |
| `--trace-fst` / `--trace-vcd` | 将对应的波形支持编译进模型 |
| `--trace-depth <n>` | 限制波形记录的模块层数 |
| `-CFLAGS "<flags>"` | 将参数传给 C++ 编译器 |
| `-LDFLAGS "<flags>"` | 将参数传给 C++ 链接阶段 |
| `-j 0` | 构建时使用可用的 CPU 线程；也可以给出明确的线程数 |
| `-I<dir>` | 添加 HDL `include` 和模块搜索目录 |
| `-D<name>=<value>` | 定义 HDL 预处理宏 |
| `-G<name>=<value>` | 覆盖顶层模块参数，例如 `-GWIDTH=16` |
| `-f <file>` | 从文件中读取源文件列表和参数 |
| `--timing` | 启用 HDL 延时、事件控制、`wait`、`fork` 等时序语义 |
| `--binary` | 自动生成 `main()` 并构建；等价于组合使用 `--main --exe --build --timing` |

需要特别区分 HDL 和 C++ 两个处理阶段。直接写在 Verilator 命令行中的 `-I` 和 `-D` 用于 Verilog/SystemVerilog 源码；通过 `-CFLAGS` 传入的 `-I`、`-D` 则用于生成的 C++ 模型和 testbench。`-LDFLAGS` 用于指定 C++ 库目录、待链接的库及其他链接选项。

完整选项及其精确语义应以[官方参数手册](https://verilator.org/guide/latest/exe_verilator.html)为准。

### `--binary` 与 C++ testbench 的选择

`--binary` 在 testbench 本身使用 SystemVerilog 编写，并且不需要 C++ 主动驱动端口时使用：

```bash
verilator --binary -Wall --trace-fst \
  --top-module tb_counter counter.sv tb_counter.sv
./obj_dir/Vtb_counter
```

`--binary` 会生成基本的 `main()` 和支持 timing 的事件循环。HDL testbench 可以用 `initial`、`#5`、`@(posedge clk)`、`$dumpfile`、`$dumpvars` 和 `$finish` 控制仿真。

若需要复用 C++ 库、连接软件模型、自定义激励与 scoreboard，或精确控制多个 DUT，则使用本文示例的 `--cc --exe --build` 加自定义 `sim_main.cpp`。

## 从示例扩展到验证工程

本文的 testbench 直接按周期驱动端口并比较结果，适合入门和较小的模块。设计变复杂后，如果继续把所有激励与检查堆在一个 `main()` 循环里，代码会很快变得难以复用。

[It's Embedded! 的 Part 3](https://www.itsembedded.com/dhd/verilator_3/)将这种写法称为传统的、基于时间的验证；[Part 4](https://www.itsembedded.com/dhd/verilator_4/)则进一步展示了事务级 C++ testbench。文章给出的拆分方式为：
- a block that generates stimulus data for the DUT (transaction generator / sequence)
- a block that drives the aforementioned data onto the DUT (driver)
- a block that observes the DUT’s outputs and generates result data packets (monitor)
- a block that collects various data packets, then compares them for correctness (scoreboard)
- a block that collects various data packets, and calculates functional coverage (coverage)
