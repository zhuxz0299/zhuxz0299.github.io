---
title: yazi 文件管理器
tags:
  - yazi
  - tui
  - filechooser
  - file-manager
description: 记录 Yazi 的本机配置、插件与快捷键
cover: https://source.fomal.cc/img/default_cover_149.webp
categories:
  - Dev Tools
  - Software
abbrlink: c55202f6
date: 2026-02-08 00:45:51
---

{% note info %}
基本安装与默认快捷键可直接参考 [Yazi 官方文档](https://yazi-rs.github.io/docs/installation)，快捷键记不住时可以按 `F1` 查询。本文记录当前系统中相对默认配置所做的修改。
{% endnote %}

yazi 默认配置目录为 `~/.config/yazi/`：

```text
~/.config/yazi/
├── init.lua       # Lua 初始化与自定义 linemode
├── keymap.toml    # 自定义快捷键
├── package.toml   # ya 管理的插件依赖
├── theme.toml     # 当前为空，使用默认主题
└── yazi.toml      # 布局、打开规则与预览器
```

这些文件只包含需要覆盖或追加的项。Yazi 升级后，未设置选项会自动使用新版默认值。

## 在 Shell 中跟随 Yazi 切换目录

直接运行 `yazi` 时，退出后 Shell 仍会留在原目录。当前在 `~/.zshrc` 中定义了 `y` 函数，通过 `--cwd-file` 读取退出时的目录：

```zsh
function y() {
	local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
	command yazi "$@" --cwd-file="$tmp"
	IFS= read -r -d '' cwd < "$tmp"
	[ "$cwd" != "$PWD" ] && [ -d "$cwd" ] && builtin cd -- "$cwd"
	rm -f -- "$tmp"
}
```

重新加载 Zsh 配置后，使用 `y` 进入 Yazi，退出时即可同步切换 Shell 的工作目录。

## 界面、排序与打开规则

`~/.config/yazi/yazi.toml` 中的基础部分如下：

```toml
[mgr]
ratio    = [ 3, 9, 8 ]
sort_by  = "natural"
linemode = "size_and_mtime"

[opener]
edit = [
	{ run = "${EDITOR:-nvim} %s", desc = "$EDITOR", for = "unix", block = true },
]

[open]
prepend_rules = [
	# 强制将 .service 文件交给 nvim (edit) 处理
	{ url = "*.service", use = [ "edit", "reveal" ] },
]
```

- `ratio = [ 3, 9, 8 ]` 调整父目录、当前目录和预览窗格的宽度比例。
- `sort_by = "natural"` 使文件名按自然顺序排列，例如 `file2` 会排在 `file10` 前面。
- `edit` 优先使用 `$EDITOR`，没有设置时回退到 Neovim，并等待编辑器退出。
- `.service` 文件会优先使用 `edit` 和 `reveal` 规则。

### 同时显示文件大小与修改时间

在 `~/.config/yazi/init.lua` 中定义 `size_and_mtime`，将大小和修改时间放在同一行：

```lua
function Linemode:size_and_mtime()
	local time = math.floor(self._file.cha.mtime or 0)
	if time == 0 then
		time = ""
	elseif os.date("%Y", time) == os.date("%Y") then
		time = os.date("%b %d %H:%M", time)
	else
		time = os.date("%b %d  %Y", time)
	end

	local size = self._file:size()
	return string.format("%s %s", size and ya.readable_size(size) or "-", time)
end
```

当年文件显示“月日 + 时分”，其他年份的文件显示“月日 + 年份”；文件大小则通过 `ya.readable_size` 转换成易读格式。`yazi.toml` 中的 `linemode = "size_and_mtime"` 会将它设为默认模式。

## 增加或覆盖快捷键

根据官方文档 [keymap.toml](https://yazi-rs.github.io/docs/configuration/keymap) 中的说明，当我们需要在默认快捷键的基础上增加快捷键时，可以使用 `prepend_keymap` 或者 `append_keymap` 增加前置或是后置快捷键。由于 Yazi 选择第一个匹配的键来运行，因此前置键始终比默认键具有更高的优先级，而后置键始终比默认键具有较低的优先级。

当前的 `~/.config/yazi/keymap.toml` 只包含两个前置快捷键：

```toml
[mgr]
prepend_keymap = [
  { on = "y", run = [
    'shell -- for path in %s; do echo "file://$path"; done | wl-copy -t text/uri-list',
    "yank"
  ], desc = "Yank selected files (copy) and send to system clipboard" },
  { on = "<C-n>", run = 'shell -- dragon-drop -a -x -i -T "$@"' },
]
```

### `y`：同时复制到 Yazi 和系统剪贴板

覆盖默认 `y` 后，会先把选中路径按 `text/uri-list` 格式写入 Wayland 剪贴板，再执行内置 `yank`。因此既能在 Yazi 中按 `p` 粘贴，也能粘贴到支持文件剪贴板的图形应用中。

该功能依赖 `wl-copy`：

```bash
sudo pacman -S wl-clipboard
```

{% note warning %}
这段配置面向 Wayland；在 X11 环境下需要改用 `xclip` 或 `xsel`。
{% endnote %}

### `Ctrl+n`：将选中文件放入拖拽窗口

安装 [dragon-drop](https://github.com/mwh/dragon) 后，在 Yazi 中选中一个或多个文件并按 `Ctrl+n`，会弹出一个可向其他应用拖拽文件的窗口。

```bash
sudo pacman -S dragon-drop
```

## 预览压缩包与 Debian 软件包

当前安装了两个预览相关插件：

```bash
sudo pacman -S ouch 7zip
ya pkg add ndtoan96/ouch
ya pkg add yazi-rs/plugins:piper
```

`yazi.toml` 中的配置为：

```toml
[plugin]
prepend_previewers = [
  { url = "*.deb", run = 'piper -- 7z l "$1"' },
  { mime = "application/{*zip,tar,bzip2,7z*,rar,xz,zstd,java-archive}", run = "ouch" },
]
```

- [ouch.yazi](https://github.com/ndtoan96/ouch.yazi) 调用 `ouch` 以树形结构展示常见压缩包的内容，可用 `J` 和 `K` 滚动预览区。
- `piper.yazi` 可将任意命令的输出作为预览内容。这里对 `.deb` 文件执行 `7z l`，用来查看软件包内的文件列表。

## 显示 Git 文件状态

当前还安装了官方 `git.yazi` 插件：

```bash
ya pkg add yazi-rs/plugins:git
```

在 `init.lua` 中初始化插件：

```lua
require("git"):setup({
	-- Order of status signs showing in the linemode
	order = 1500,
})
```

再在 `yazi.toml` 中分别为文件和目录注册 fetcher：

```toml
[[plugin.prepend_fetchers]]
url   = "*"
run   = "git"
group = "git"

[[plugin.prepend_fetchers]]
url   = "*/"
run   = "git"
group = "git"
```

进入 Git 仓库后，文件列表会显示未跟踪、未暂存、已暂存、已删除等状态标记。当前 `theme.toml` 为空，因此使用插件的默认样式和字符。

## 插件管理

上述三个插件会被记录到 `~/.config/yazi/package.toml`。可以用下列命令查看和更新：

```bash
ya pkg list
ya pkg upgrade
```

当前的插件列表为：

```text
ndtoan96/ouch
yazi-rs/plugins:piper
yazi-rs/plugins:git
```

## 将 Yazi 设为系统文件选择器
这里需要使用 [xdg-desktop-portal-termfilechooser](https://github.com/hunkyburrito/xdg-desktop-portal-termfilechooser?)。首先进行安装：
```bash
yay -S xdg-desktop-portal-termfilechooser-hunkyburrito-git
```

安装完成后 `/usr/share/xdg-desktop-portal-termfilechooser/` 下会有一系列配置所需文件。复制 `config` 到 `~/.config/xdg-desktop-portal-termfilechooser/` 并修改为以下内容：
```conf
[filechooser]
cmd=yazi-wrapper.sh
default_dir=$HOME
; Uncomment to skip creating destination save files with instructions in them
; create_help_file=0
; Uncomment and edit the line below to change the terminal emulator command
env=TERMCMD=ghostty -e

; Mode must be one of 'suggested', 'default', or 'last'.
open_mode=suggested
save_mode=suggested
```
其中 `yazi-wrapper.sh` 也可以复制到 `~/.local/bin/` 中，这样方便调用。

再到 `~/.config/xdg-desktop-portal/portals.conf` 中加入如下内容，将 `termfilechooser` 设为默认文件选择器：
```conf
[preferred]
org.freedesktop.impl.portal.FileChooser=termfilechooser
```

然后重启一下 portal即可使用：
```bash
systemctl --user restart xdg-desktop-portal.service
```
