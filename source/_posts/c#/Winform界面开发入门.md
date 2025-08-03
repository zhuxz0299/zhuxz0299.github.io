---
title: Winform界面开发入门
tags:
  - c#
  - Winform
cover: 'https://source.fomal.cc/img/default_cover_155.webp'
abbrlink: 67555dd6
date: 2025-07-26 16:07:49
description: 上手 Winform 时的一点笔记
---

## 代码执行入口
使用 VS 创建 Winform 项目之后，通常会有一个 `Program.cs` 文件，例如以下所示：
```c#
namespace FolderMonitorApp
{
    internal static class Program
    {
        [DllImport("shcore.dll")]
        private static extern int SetProcessDpiAwareness(int value);

        [STAThread]
        static void Main()
        {
            // 设置DPI感知以改善高DPI显示器上的字体清晰度
            // Windows 8.1及以上版本使用SetProcessDpiAwareness
            SetProcessDpiAwareness(2); // PROCESS_PER_MONITOR_DPI_AWARE

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            Application.Run(new Form1());
        }
    }
}
```

`static void Main()` 函数指明了这个项目中代码执行的入口。

接下来对这段示例代码进行解释：
* `internal static class Program`:
  * `internal`：限制访问范围，只在本项目内可见。
  * `static`：不允许实例化，只能有静态成员。
* `[DllImport("shcore.dll")]`：指定函数位于 `shcore.dll` 系统库
* `extern int SetProcessDpiAwareness()`：声明函数签名
* `SetProcessDpiAwareness(2)`
  * 参数 `2` 的含义：动态适应各显示器 DPI，并且适用于多显示器混合 DPI 环境
  * 作用：系统不再拉伸位图，字体和矢量元素保持清晰锐利
* `[STAThread]`
  * `[STAThread]` 是 C# 中一个关键的特性(Attribute)，方括号 `[]` 是 C# 中声明特性的语法。
  * STA = Single Threaded Apartment (单线程单元)，它声明应用程序的主线程使用 COM 单线程单元模型



## 分部类
`Form1.cs` 和 `Form1.Designer.cs` 文件在同一个命名空间中使用了同名的 `class`。这个在正常的两个 `.cs` 文件中是不可行的。这是因为 C# 中，有个东西叫“分部类”，把一个类拆分到不同的文件中。

注意一下拆分的语法：
* `Form1.cs` 中：`public partial class Form1 : Form`
* `Form1.Designer.cs` 中：`partial class Form1`

利用了 `partial` 关键字。目的是开发的时候让代码结构更清晰，编译的时候两个文件会合并起来。


## 界面设计与处理文件
利用 VS 生成 Winform 项目时，会默认给出 `Form1.Designer.cs` 以及 `Form1.cs` 文件。前者主要用于界面外观的设计；后者用于界面上交互功能的设计。

### 界面初始化
`Form1.Designer.cs` 是用于设计界面的文件，其中主要包含一个初始化函数 `private void InitializeComponent()`，作用就是把对界面初始化的部分写好。

以下为初始化某个按钮的示例：
```c#
    // 
    // saveRemarkButton
    // 
    this.saveRemarkButton.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(122)))), ((int)(((byte)(204)))));
    this.saveRemarkButton.Dock = System.Windows.Forms.DockStyle.Fill;
    this.saveRemarkButton.FlatAppearance.BorderSize = 0;
    this.saveRemarkButton.FlatAppearance.MouseDownBackColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(102)))), ((int)(((byte)(184)))));
    this.saveRemarkButton.FlatAppearance.MouseOverBackColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(132)))), ((int)(((byte)(224)))));
    this.saveRemarkButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
    this.saveRemarkButton.Font = new System.Drawing.Font("Microsoft YaHei UI", 10F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
    this.saveRemarkButton.ForeColor = System.Drawing.Color.White;
    this.saveRemarkButton.Location = new System.Drawing.Point(0, 10);
    this.saveRemarkButton.Name = "saveRemarkButton";
    this.saveRemarkButton.Size = new System.Drawing.Size(757, 50);
    this.saveRemarkButton.TabIndex = 0;
    this.saveRemarkButton.Text = "💾 保存备注";
    this.saveRemarkButton.UseVisualStyleBackColor = false;
    this.saveRemarkButton.Click += new System.EventHandler(this.saveRemarkButton_Click);
```

这里不仅设置了这个按钮的颜色、大小、位置之类的静态参数，同时 `this.saveRemarkButton.Click +=` 还增加了点击事件，表示点击之后会调用 `saveRemarkButton_Click` 函数。同时注意到这里用的是 `+=`，因此一个点击事件可以绑定好几个函数。

### 事件处理函数
事件处理函数通常位于 `Form1.cs` 文件中。其形式如下：
```c#
private void saveRemarkButton_Click(object sender, EventArgs e)
```

#### `object sender` 参数
* 含义：触发事件的对象（事件源）
* 作用：
  * 告知你哪个控件触发了这个事件
  * 可以安全转换为具体的控件类型（如 Button, TextBox 等）
  * 当多个控件共享同一个事件处理器时，可用此参数区分来源

例如：
```c#
// 三个按钮共用同一个点击处理方法
saveButton.Click += Button_Click;
cancelButton.Click += Button_Click;
clearButton.Click += Button_Click;

private void Button_Click(object sender, EventArgs e)
{
    Button btn = (Button)sender;
    
    switch (btn.Name)
    {
        case "saveButton":
            SaveData();
            break;
        case "cancelButton":
            CancelOperation();
            break;
        case "clearButton":
            ClearFields();
            break;
    }
}
```

或者说如果某些控件是用 for 循环定义的，没有自己的名字，这个时候也可以利用 `sender` 这个参数来告知需要处理的是哪个控件
```c#
public Forml(){
    InitializeComponent ();
    int x = O;
    int y = 0;
    for (int i = O; i < 5; i++){
        x = x + 50;
        у = y + 50;
        Button buttonl = new Button():
        buttonl.Location = new Point(x, y):
        buttonl.Size = new Size(100, 50);
        buttonl.Text = "我是代码"；
        buttonl.Click += new System.EventHandler(button1_Click);
        this.Controls.Add(buttonl):
    }
}
```

此时使用
```c#
private void Button_Click(object sender, EventArgs e)
{
    Button btn = (Button)sender;
    btn.Text = '123';
}
```

就能达到想要的效果。

#### 安全类型转换
不过直接使用 `Button btn = (Button)sender;` 时，如果 `sender` 不是 `Button` 类型（比如意外绑定到 `Label` 的点击事件），程序会崩溃。因此可以采用更加安全的方法：
* 使用 `as` 操作符：
```c#
Button button = sender as Button;  // 尝试转换
if (button != null)                // 检查是否转换成功
{
    button.Text = "已点击";
    // ……
}
```

* 使用 `is` 操作符：
```c#
if (sender is Button button)  // 在条件中同时检查和转换
{
    button.Text = "已点击";
    // ……
}
```

### `SuspendLayout` 方法
该方法被用于 `Form1.Designer.cs` 文件中。例如：
```c#
this.mainPanel.SuspendLayout();
```

`SuspendLayout()` 方法作用：暂停控件及其子控件的布局逻辑，避免每次添加/修改控件时立即重绘界面。

底层工作原理——布局计数器：
* 每个控件内部有 LayoutSuspendCount 计数器
  * `SuspendLayout()` 使计数器 +1
  * `ResumeLayout()` 使计数器 -1

`ResumeLayout()` 参数：
```c#
panel.ResumeLayout(false); // 仅恢复计数，不立即布局
panel.ResumeLayout(true);  // 恢复计数并立即执行布局
```

窗体初始化时自动应用以下内容：
```c#
// Form1.Designer.cs 中自动生成的代码
private void InitializeComponent()
{
    this.SuspendLayout(); // 窗体级暂停
    // 创建所有控件...
    this.ResumeLayout(false);
    this.PerformLayout(); // 显式触发布局
}
```


### `#region` 语法

例子：
```c#
#region 我的区域
// 这里的代码可以被折叠
int a = 1;
int b = 2;
#endregion
```

`#region` ... `#endregion` 是用来折叠和分组代码块，在 Visual Studio 这类 IDE 里可以收起/展开，适合管理大段代码（比如设计器自动生成的代码）。

> 可以将 `#region` 看成能控制阅读源代码的复杂度的一种方式。因为你可以将一些相关的代码放在一个区域（`#region`）里面。但是，这不是你随便就创建新方法或者新类的借口。其实 Region 并不能消除复杂度，它只是在你阅读代码的时候，隐藏了部分代码。你必须通过写出小巧，清晰，重点突出的方法和类，才能控制代码的复杂度。
