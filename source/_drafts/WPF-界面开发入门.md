---
title: WPF 界面开发入门
date: 2025-07-27 14:05:00
tags:
---

WPF 学习用 xaml 描述页面，以及 xaml 如何与 c# 交互。
与 winform 中直接用 c# 相比，使用 xaml 描述界面更加简单

winform 想要更新界面中的值
1. 修改变量的值
2. 同步更新到界面中（告诉屏幕需要绘制）

wpf：绑定
可以将界面中的某个属性绑定到某个界面中，

---

```xml
<Application x:Class="WPF_Study.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="clr-namespace:WPF_Study"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
         
    </Application.Resources>
</Application>
```

App.xaml 中的 StartupUri="MainWindow.xaml" 决定了项目编译启动之后第一个显示的窗体为 MainWindow.xaml 的对应窗体

---

窗体 .xaml <Window> 解析

```xml
<Window x:Class="WPF_Study.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WPF_Study"
        mc:Ignorable="d"
        d:DataContext="{d:DesignInstance local:MainWindow}"
        Title="MainWindow" Height="450" Width="800">
    <Grid></Grid>
</Window>
```


* 窗口声名：`<Window x:Class="WPF_Study.MainWindow"`
  * <Window>：根元素，表示这是一个 WPF 窗口。
  * x:Class="WPF_Study.MainWindow"：将 XAML 文件与后台代码类关联（位于 WPF_Study 命名空间中的 MainWindow 类）。
* XML 命名空间声明
  * `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"`
    * 默认命名空间：包含所有标准 WPF 控件（如 Grid, Button, TextBox 等）。
    * 这是最重要的命名空间，运行时必需
    * •	没有前缀，所以直接写 `<Button>` 而不是 `<presentation:Button>`
  * `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`
    * XAML 语言命名空间（x: 前缀）：提供 XAML 语言特性（如 x:Name, x:Class）。
  * `xmlns:d="http://schemas.microsoft.com/expression/blend/2008"`
    * 设计时命名空间（d: 前缀）：用于设计工具（如 Visual Studio、Blend）的辅助属性（例如 d:DesignHeight）。
    * 设计时特性 - 仅在设计器中生效（因为后面有 mc:Ignorable="d"）
  * `xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"`
    * 标记兼容性命名空间（mc: 前缀）：支持 XAML 版本兼容性。
  * `xmlns:local="clr-namespace:WPF_Study"`
    * 本地项目命名空间（local: 前缀）：允许引用当前项目中的自定义类（如用户控件、转换器等）。
* 设计时属性：`mc:Ignorable="d"`
  * 忽略设计时属性：指示 XAML 解析器在运行时忽略 d: 前缀的属性。
* `d:DataContext="{d:DesignInstance local:MainWindow}"`
  * 自己加的，方便在绑定变量的时候让 VS 识别到变量，以及支持自动补全
  * d:DataContext - 设计时数据上下文
    * 作用：告诉 XAML 设计器在设计时使用什么作为数据上下文。
  * DesignInstance 是一个特殊的标记扩展，它告诉设计器：
    * 创建类型实例：在设计时创建指定类型的实例
    * 提供智能提示：基于这个实例提供属性绑定的 IntelliSense
    * 设计时预览：可能在设计视图中显示默认数据
  * local:MainWindow 的含义
    * local: - 引用本地命名空间
    * MainWindow - 您的窗口类
    * 所以 local:MainWindow 等同于 WPF_LoginUI.MainWindow。

说明：
xmlns 是 "XML Namespace" 的缩写，它是 XML 标准的一部分，用于声明命名空间。这个概念类似于 C# 中的 using 语句。
基本语法：
```xml
xmlns:[前缀]="[命名空间URI]"
```

上面提到的 URL，例如 `"http://schemas.microsoft.com/winfx/2006/xaml/presentation"` 仅仅是唯一标识符，类型信息已内置在 .NET 中，因此不需要真的访问网站。


`<Grid></Grid>` 里面是客户区

---

`<Window></Window>` 里面只能有一个 Content，例如里面不能放两个 Button。所以一般中间赛一个 `<Grid></Grid>`

---

WPF 是像素无关的，会随着 DPI 变化。每个单位为 1/96 英寸；而 WinForm 中，一个单位就是一个像素。

---
常见布局控件：

`<Grid></Grid>`
Grid 是表格布局，默认看到的 Grid 是一行一列，所以控件默认在中间
可以动态分配行或者列。

划分行，这里划成两行
```xml
<Grid.RowDefinitions>
    <RowDefinition Height="20"/>
    <RowDefinition/>
</Grid.RowDefinitions>
```

也支持按照比例划分
```xml
<Grid.RowDefinitions>
    <RowDefinition Height="1*"/>
    <RowDefinition Height="2*"/>
</Grid.RowDefinitions>
```

或者按照内容其中的内容自动调整大小
```xml
<Grid.RowDefinitions>
    <RowDefinition Height="AUTO"/>
    <RowDefinition/>
</Grid.RowDefinitions>
```

如果第一行没有内容，那么高度就为 0。

塞两个 Button 到表格的 (0, 0) 位置
```xml
<Button HorizontalAlignment="Left" Width="40" Grid.Column="0" Grid.Row="0"/>
<Button HorizontalAlignment="Left" Margin="40, 0, 0, 0" Width="40" Grid.Column="0" Grid.Row="0"/>
```

利用 StackPanel 可以自动化堆叠
```xml
<StackPanel Grid.Row="0" Grid.Column="0" Orientation="Horizontal">
    <Button Height="20" Width="40"/>
    <Button Height="20" Width="40"/>
</StackPanel>
```

Grid 里面也可以继续嵌套 Grid


`<StackPanel></StackPanel>`
控件从上到下堆叠（修改 `Orientation` 属性可以改变堆叠方向）

---
`<Window.Resources>` 作用类似 CSS

```xml
<Window>
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="Red"/>
        </Style>
    </Window.Resources>
</Window>
```

样式也支持继承
```xml
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="White"/>
            <Setter Property="FontSize" Value="20"/>
            <Setter Property="Margin" Value="20, 10"/>
            <Setter Property="Height" Value="30"/>
        </Style>

        <Style x:Key="LoginStyle" TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
            <Setter Property="Background" Value="LightBlue"/>
        </Style>

        <Style x:Key="LogoutStyle" TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
            <Setter Property="Background" Value="LightCoral"/>
        </Style>
    </Window.Resources>
```

也支持像 CSS 一样把样式放到单独的文件中
右键项目——“添加”——“资源字典”，此时就会在项目中出现一个 .xaml 文件，例如创建一个 `ButtonStyle.xaml`，然后将 Style 放入其中。
如果想要将 `ButtonStyle.xaml` 中的 Style 应用于整个项目，需要在 `App.xaml` 中加入
```xml
    <Application.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="/ButtonStyle.xaml"/>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </Application.Resources>
```


---

C# 程序属性与绑定

首先设置一下数据上下文，这里先设置为 `this`，表示 `MainWindow` 类底下的属性都是可以绑定的
```c#
public MainWindow()
{
    InitializeComponent();
    this.DataContext = this; // Set the DataContext to enable data binding
}

// ……
public string Username { get; set; } = "111";
```

`public string UserName { get; set; }` 是一个 自动实现的属性（Auto-Implemented Property）
* 定义了一个公开的字符串属性 UserName。
  * `{ get; set; }` 表示该属性可读可写：
  * get：允许外部代码读取属性值（如 obj.UserName）。
  * set：允许外部代码设置属性值（如 obj.UserName = "John"）。
* 底层实现
    ```c#
    private string _userName; // 隐藏的私有字段
    public string UserName
    {
        get { return _userName; }
        set { _userName = value; }
    }
    ```

前端利用 `{Binding xxx}` 语法实现绑定
```xml
<TextBox Text="{Binding Username}" Grid.Row="0" Grid.Column="1"/>
```

