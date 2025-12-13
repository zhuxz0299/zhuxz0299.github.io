---
title: Hexo 构建原理解析
cover: 'https://source.fomal.cc/img/default_cover_151.webp'
tags:
  - hexo
  - npm
abbrlink: 6834d799
date: 2025-07-16 14:51:13
description: 介绍了 npm 包的管理机制以及 Hexo 博客的构建原理，还有关于 Twikoo 评论区如何工作
---

## 从 Node.js 开始
Node.js 是一个开源的、跨平台的 JavaScript 运行时环境，基于 Chrome V8 JavaScript 引擎构建。它的核心价值在于将 JavaScript 从浏览器拓展到了服务器端，彻底改变了前后端开发模式。在博客网站构建中的主要作用为：

### Node.js 在博客构建中的作用
Hexo 本质上是 Node.js 应用，其作用可分三层：
1. 运行时环境：所有 Hexo 命令都通过 node 执行，包括 `hexo server` 这样的实时服务
2. 包管理：npm 管理 Hexo 核心、主题、插件等数百个依赖
3. 构建引擎：Markdown 渲染、模板处理、资源优化等构建环节全由 Node.js 驱动

特别值得注意的是，Hexo 的扩展性完全依赖 Node.js 的模块化设计。比如 Butterfly 主题的 Pug 模板编译，就是通过 `hexo-renderer-pug` 这个 npm 包实现的。用户修改主题配置时，背后其实是 Node.js 的 require 机制在加载 `_config.butterfly.yml`。

### npm 的工作原理
npm（Node Package Manager）是 Node.js 的官方包管理工具，负责依赖安装、版本管理和脚本执行。其工作流程如下：
* 依赖解析：
  * 读取项目中的 `package.json` 文件，解析 `dependencies` 和 `devDependencies` 字段。
  * 根据语义化版本规则（如 ^1.2.3）确定兼容的包版本范围。
* 构建依赖树：
  * npm v3+ 采用扁平化依赖结构（hoisting），将可共用的依赖提升到顶层 `node_modules`，减少嵌套和冗余。
  * 若版本冲突，则局部依赖会嵌套安装在子包的 `node_modules` 中。
* 下载与安装：
  * 查询 npm Registry（默认源：https://registry.npmjs.org/）获取包信息。
  * 下载压缩包（tarball）到本地缓存目录（`~/.npm/_cacache`），再解压到项目 `node_modules`。
* 版本锁定与一致性：
  * 生成 `package-lock.json` 文件，精确锁定所有依赖的版本，确保多环境安装一致性。
* 脚本与生命周期钩子：
  * 支持通过 `package.json` 的 `scripts` 字段定义命令。
    * 例如 Hexo 项目的 `package.json` 文件中就提供了
    ```json
    "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server"
    }
    ```
    此时运行 `npm run build` 就相当于运行 `hexo generate`。
  * 提供生命周期钩子（如 preinstall、postinstall）在安装前后执行自定义逻辑。


### npm 相关的重要文件夹
npm 包的安装位置取决于安装方式（本地 or 全局）：

1. 本地安装（项目级依赖）
   * 位置：项目根目录下的 `node_modules` 文件夹（例如：`/your-project/node_modules/`）
   * 特点：
     * 每个项目独立一套依赖，避免版本冲突。
     * 依赖通过 `require()` 直接引入代码。
     * 默认安装命令：`npm install <package>`。

2. 全局安装（系统级工具）
   * 位置：系统级的 `node_global` 文件夹（路径可自定义）。
     * Windows：`%AppData%\npm\node_modules`
     * macOS/Linux：`/usr/local/lib/node_modules` 或 `~/.npm-global/`
   * 特点：
     * 包作为全局命令行工具使用（如 `vue-cli`、`http-server`）。
     * 安装命令：`npm install -g <package>`。
     * 需将 `node_global` 路径加入系统 PATH 才能直接运行命令。

3. 缓存目录（加速重复安装）
   * 位置：`~/.npm/_cacache`（npm v5+）。
   * 作用：存储已下载包的压缩副本，避免重复下载。

4. Node.js 安装根目录下的 `node_modules`
   *  这些模块的更新和版本管理是跟随 Node.js 本身的版本一起发布的。你不能用 `npm install` 或 `npm uninstall` 来操作它们。升级 Node.js 版本会整体替换这个文件夹的内容。

### npm 相关配置
配置文件优先级
|配置类型|	存放位置/方式|	优先级|	作用范围|
|---|---|---|---|
|命令行参数|	`npm install --registry=xxx`|	最高|	单次命令生效|
|项目级 .npmrc	|项目根目录：`/your-project/.npmr`|	中高|	仅当前项目生效|
|用户级 .npmrc|	`~/.npmrc` (用户主目录)|	中|	当前用户所有项目生效
|npm 默认配置|	Node.js 安装目录：`nodejs/node_modules/npm/npmrc`|	最低|	全局默认值

* `npm config list -l` 显示的大部分配置是 npm 自身代码中定义的默认值（"default" config from default values）
* `npm config set` 命令改变的是 ~/.npmrc 的内容

### Node.js 版本管理
如果电脑中需要多个版本的 Node.js，可以使用 nvm 来管理版本。在 [Node.js 的下载官网](https://nodejs.org/en/download) 可以就可以找到通过 nvm 安装不同版本 Node.js 的方法。

## Hexo 项目构建
### Hexo 文件夹创建

`npm install hexo-cli -g`
* 作用：全局安装 Hexo 命令行工具
* 工作原理：
  * 将 hexo-cli 安装到全局 `node_modules`（如 `D:\nodejs\node_global\node_modules` 文件夹下）
  * 在全局 `D:\nodejs\node_global` 目录创建可执行文件（这个目录在系统路径中）
* 结果：终端可直接执行 `hexo` 命令

`hexo init blog`
* 作用：创建 Hexo 项目骨架
* 工作原理：
  1. 创建 `blog` 目录
  2. 从 GitHub 仓库 hexojs/hexo-starter 下载配置文件
  3. 生成 `package.json` 文件（包含核心依赖）

执行完之后会有如下文件与文件夹
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2025/7/16     18:41                .github
d-----         2025/7/16     18:41                node_modules
d-----         2025/7/16     18:41                scaffolds
d-----         2025/7/16     18:41                source
d-----         2025/7/16     18:41                themes
-a----         2025/7/16     18:41             89 .gitignore
-a----         2025/7/16     18:41          94272 package-lock.json
-a----         2025/7/16     18:41            641 package.json
-a----         2025/7/16     18:41              0 _config.landscape.yml
-a----         2025/7/16     18:41           2547 _config.yml
```

且此时 `node_modules` 中已经安装了很多包，看起来是已经执行了 `npm install` 的步骤。因为 `package.json` 中的依赖都可以在 `node_modules` 中找到。

### Hexo 博客内容文件生成
```bash
hexo new [layout] "Title"
```

layout 参数：`post`（默认）或 `page`, `draft`。生成文件的模板放在 `scaffolds/` 文件夹下，因此理论上可以往里面添加其他模板。


### Butterfly 主题与静态网页生成
下载 Butterfly 主题，将文件夹放在 `themes` 中。将其 `_config.yml` 复制出来，放在 Hexo 根目录下，并且将其重命名为 `_config.butterfly.yml`。

有了主题之后，静态网页生成的流程为：
1. 配置加载阶段
   1. 站点配置：`_config.yml`
      * 控制全局设置（URL/目录/部署等）
   2. 主题配置：`_config.butterfly.yml`
      * 覆盖主题默认设置（菜单/样式/插件等）
   3. 最终配置 = 合并 `_config.yml` + `_config.butterfly.yml`
2. 源文件处理阶段
   * 内容来源：
     * 用户文章：`source/_posts/*.md`
     * 主题资源：`[butterfly_path]/source/` (CSS/JS/图片)
   * 关键处理：
     * Markdown → HTML 转换
     * Front-Matter 元数据提取
     * 资源文件复制/压缩
3. 模板渲染阶段
   * 模板引擎：pug
   * 内容来源：
     * post 与 page：`source/` 下的 `.md` 文件。
     * 模板路径 `[butterfly_path]/layout`，其中有很多 `.pug` 文件
   * 数据注入，例如
        ```pug
        //- 使用站点配置
        title= config.title
        //- 使用主题配置
        if theme.fancybox
        script(src='/js/fancybox.js')
        //- 使用页面数据
        h1= page.title
        .content!= page.content
        ```
   * 主题资源注入：
     * 自动插入主题的 CSS/JS 文件
     * 应用 `_config.butterfly.yml` 中的样式变量
     * 例如：
        ```pug
        //- 根据主题配置显示搜索框
        if theme.search.enable
        include includes/widget/search.pug
        ```
4. 静态文件生成
   * HTML：根据模板 + 内容生成
   * 资源：`source/` 和 `[butterfly_path]/source/` → 合并到 `public/`


## 评论区设置 (Twikoo)
### 工作原理
可以通过配置 Vercel + MongoDB 的方式让评论区能够工作。在这种配置下，假如在评论区添加一条评论，其工作流程为：
1. 发起请求 (前端 -> Vercel)
  评论者点击“提交”按钮。博客网页上的 Twikoo.js 代码会发起一个 HTTP 请求（POST 请求），目标地址是配置好的 Vercel 域名（例如 https://your-twikoo.vercel.app/api）。
   * POST 请求包含的东西： 评论内容、昵称、邮箱、文章的 URL。
2. 处理逻辑 (Vercel 唤醒)
  Vercel 收到请求，发现是找 Twikoo 的，于是瞬间启动一个云函数容器（Serverless Function）。
   * 逻辑处理：Twikoo 的后端代码开始运行：
     1. （如果有）检查评论内容是否违规。
     2. 连接 MongoDB 数据库。
3. 数据存取 (Vercel <-> MongoDB)
   Vercel 里的 Twikoo 代码通过密钥（`MONGODB_URI`）访问 MongoDB 数据库。MongoDB 执行完操作后把结果（比如“保存成功”或具体的评论列表）返回给 Vercel。
   * 写操作：Vercel 要求 MongoDB 将评论数据写入
   * 读操作：（如果是刷新页面）Vercel 向 MongoDB 请求文章下的所有评论
4. 返回结果 (Vercel -> 前端)
   Vercel 拿到数据后，将其打包成 JSON 格式，返回给读者的浏览器。
   * 此时 Vercel 的任务完成，云函数实例随即冻结或销毁，不再占用资源（也不再计费）。
5. 展示 (前端渲染)
   读者的浏览器收到了 Vercel 的回复“保存成功”，Twikoo.js 就会在页面上动态插入刚刚那条评论的 HTML，读者就看到评论上墙了

### 配置信息
Vercel 域名：
* 第一步提到的用于向 Vercel 发起请求的目标地址
* 需要填写在配置文件 `_config.butterfly.yml` 的 `twikoo:envId:` 项下
* 域名可以在 Vercel 部署好的 project（这里一键部署的 project 名称叫 twikoo-api）下的 Overview 页面看到

`MONGODB_URI`：
* 第三步提到的 Vercel 访问 MongoDB 数据库的密钥
* 需要填写在 Vercel twikoo-api 这个 project 的 setting-Environment Variable 中。格式为 `mongodb+srv://用户名:密码@服务器地址/数据库名`
* 登录 MongoDB 会指引创建一个 Cluster，同时会设置项目名和密码。在创建得到的 Cluster 面板上点击 Connect，然后选择 Drivers，设置好驱动版本，复制提供的 `MONGODB_URI` (密码部分需要手动修改)，完成设置，即可使用。
  * 这里选 Drivers 是为了与 Twikoo 这个使用 Node.js 开发的插件适配

MongoDB 网络设置：
* Vercel 的服务器 IP 是动态的（不固定的），所以需要允许任意 IP连接数据库，否则 Vercel 会被挡在门外。
* 因此需要在项目的 DataBase/Network Access 中添加 IP 地址 0.0.0.0/0

### 迁移博客是否影响评论
在博客评论区能够找到齿轮图标⚙️，点击之后在“配置管理”-“通用”中存在设置项 CORS_ALLOW_ORIGIN，这个被用来配置能够访问评论数据库的域名。如果没有设置，那么别的网站假如也能拿到上面提到的 Vercel 域名，那么同样可以读取、写入评论的数据库。因此在没有配置 CORS_ALLOW_ORIGIN 的情况下，迁移博客不影响评论使用。

但是需要注意的是，Twikoo 通过 Permalink 来加载评论，因此迁移博客之后要保证每篇文章的链接结构不变。这一点可以到 `_config.yml` 的 `permalinks:` 项进行检查。