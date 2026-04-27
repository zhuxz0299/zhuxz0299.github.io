---
title: uv-python包与项目管理器
tags:
  - uv
  - python
description: 记录一些频繁使用到的 uv 的操作
cover: 'https://source.fomal.cc/img/default_cover_192.webp'
categories:
  - Dev Tools
  - Software
abbrlink: 20b007b1
date: 2026-02-04 14:22:54
---


## uv 使用
### 项目环境管理
可以通过 `uv init <proj-dir>` 初始化项目，或者是进入项目文件夹后再运行 `uv init`。如果希望指定特定的 python 版本，例如 3.12，在初始化时加上 `--python 3.12` 即可。
uv 将创建以下文件：
```
├── .gitignore
├── .python-version
├── README.md
├── main.py
└── pyproject.toml
```

* 假如项目中原先没有使用 git 管理，`uv init` 会自动调用 `git init` 操作；`.gitignore` 文件也仅在原本不存在的情况下自动创建。
* `README.md` 情况类似，一个项目通常总是会有 README 的，所以如果原本没有，uv 会自动创建
* `main.py` 感觉通常没啥用
* `.python-version` 包含项目的默认 Python 版本。此文件告诉 uv 在创建项目的虚拟环境时使用哪个 Python 版本。
* `pyproject.toml` 包含关于项目的元数据，主要是 python 依赖项，还可以包括项目的 description、License 之类的信息。对于 python 依赖的管理，可以手动编辑此文件，效果和 `uv add` 和 `uv remove` 等命令相同。

刚刚完成初始化之后不会自动生成虚拟环境，只有在第一次运行项目命令（即 `uv run`、`uv sync` 或 `uv lock`）时，uv 才会项目根目录中创建一个虚拟环境和 `uv.lock` 文件。

但是如果使用 vscode 作为代码编辑器，vscode python 插件的 IntelliSense 总是希望指定一个 python 环境以方便语法检测，那么可以初始化完成之后先运行一次 `uv sync`，生成 `.venv` 文件夹及其环境；或者直接运行 `uv add <python_package>`，这样也可以自动创建环境。

### 脚本运行
如果并不是为了运行项目中的代码，而仅仅是需要临时运行某个 python 脚本（假设叫做 `example.py`），可以直接使用 `uv run example.py` 运行：当 uv 在当前目录下检测不到代表项目环境的 `pyproject.toml` 文件时，会自动创建一个临时的环境用于运行脚本。

#### 直接运行带依赖的脚本
如果运行的脚本包含某些依赖，例如依赖于 `numpy`，那么在运行脚本的时候可以使用 
```bash
uv run --with numpy example.py
```
uv 会在临时的环境中下载并使用 `numpy` 包。

#### python 脚本管理
uv 也可以像管理 python 项目那样管理一个脚本及其依赖。例如需要创建一个 python 脚本，并将 python 版本指定为 3.12：
```bash
uv init --script example.py --python 3.12
```

此时就会得到一个文件，内容为：
```python
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///

def main() -> None:
    print("Hello from example.py!")

if __name__ == "__main__":
    main()
```

如果这个脚本需要依赖于某些包，则可以运行
```bash
uv add --script example.py 'requests<3' 'rich'
```

将需要的包加上。此时脚本文件的注释区域将会变为：
```python
# /// script
# dependencies = [
#   "requests<3",
#   "rich",
# ]
# ///
```

这部分 toml 格式的注释对于 python 脚本文件而言，就像 `pyproject.toml` 之于整个项目，都是用来管理 python 版本及其依赖的。有了上面的注释，运行脚本的时候就不需要使用 `--with` 参数再指定依赖，而是可以直接使用 `uv run example.py`。