---
title: hexo 构建原理解析
cover: 'https://source.fomal.cc/img/default_cover_151.webp'
tags:
  - hexo
  - npm
abbrlink: 6834d799
date: 2025-07-16 14:51:13
description:
---

## 从 Node.js 开始
Node.js 是一个开源的、跨平台的 JavaScript 运行时环境，基于 Chrome V8 JavaScript 引擎构建。它的核心价值在于将 JavaScript 从浏览器拓展到了服务器端，彻底改变了前后端开发模式16。在博客网站构建中的主要作用为：

### npm 的工作原理
npm（Node Package Manager）是 Node.js 的官方包管理工具，负责依赖安装、版本管理和脚本执行。其工作流程如下：
* 依赖解析：
  * 读取项目中的 package.json 文件，解析 dependencies 和 devDependencies 字段。
  * 根据语义化版本规则（如 ^1.2.3）确定兼容的包版本范围。
* 构建依赖树：
  * npm v3+ 采用扁平化依赖结构（hoisting），将可共用的依赖提升到顶层 node_modules，减少嵌套和冗余。
  * 若版本冲突，则局部依赖会嵌套安装在子包的 node_modules 中。
* 下载与安装：
  * 查询 npm Registry（默认源：https://registry.npmjs.org/）获取包信息。
  * 下载压缩包（tarball）到本地缓存目录（~/.npm/_cacache），再解压到项目 node_modules。
* 版本锁定与一致性：
  * 生成 package-lock.json 文件，精确锁定所有依赖的版本，确保多环境安装一致性。
* 脚本与生命周期钩子：
  * 支持通过 package.json 的 scripts 字段定义命令（如 npm run build）。
    * 例如 Hexo 项目的 package.json 文件中就提供了
    ```json
    "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server"
    }
    ```
    此时运行 npm run build 就相当于运行 `hexo generate`。
  * 提供生命周期钩子（如 preinstall、postinstall）在安装前后执行自定义逻辑。


### npm 相关的重要文件夹
npm 包的安装位置取决于安装方式（本地 or 全局）：

1. 本地安装（项目级依赖）
   * 位置：项目根目录下的 node_modules 文件夹（例如：/your-project/node_modules/）
   * 特点：
     * 每个项目独立一套依赖，避免版本冲突。
     * 依赖通过 require() 直接引入代码。
     * 默认安装命令：npm install <package>。

2. 全局安装（系统级工具）
   * 位置：系统级的 node_global 文件夹（路径可自定义）。
     * Windows：%AppData%\npm\node_modules
     * macOS/Linux：/usr/local/lib/node_modules 或 ~/.npm-global/
   * 特点：
     * 包作为全局命令行工具使用（如 vue-cli、http-server）。
     * 安装命令：npm install -g <package>。
     * 需将 node_global 路径加入系统 PATH 才能直接运行命令。

3. 缓存目录（加速重复安装）
   * 位置：~/.npm/_cacache（npm v5+）。
   * 作用：存储已下载包的压缩副本，避免重复下载。

4. Node.js 安装根目录下的 node_modules
   *  这些模块的更新和版本管理是跟随 Node.js 本身的版本一起发布的。你不能用 npm install 或 npm uninstall 来操作它们。升级 Node.js 版本会整体替换这个文件夹的内容。

### npm 相关配置
配置文件优先级
|配置类型|	存放位置/方式|	优先级|	作用范围|
|---|---|---|---|
|命令行参数|	npm install --registry=xxx|	最高|	单次命令生效|
|项目级 .npmrc	|项目根目录：/your-project/.npmr|	中高|	仅当前项目生效|
|用户级 .npmrc|	~/.npmrc (用户主目录)|	中|	当前用户所有项目生效
|npm 默认配置|	Node.js 安装目录：nodejs/node_modules/npm/npmrc|	最低|	全局默认值

npm config list -l 显示的大部分配置是 npm 自身代码中定义的默认值（"default" config from default values）

npm config set 命令改变的是 ~/.npmrc 的内容

## hexo 项目构建
### hexo 文件夹创建

npm install hexo-cli -g
* 作用：全局安装 Hexo 命令行工具
* 工作原理：
  * 将 hexo-cli 安装到全局 node_modules（如 D:\nodejs\node_global\node_modules 文件夹下）
  * 在全局 D:\nodejs\node_global 目录创建可执行文件（这个目录在系统路径中）
* 结果：终端可直接执行 hexo 命令

hexo init blog
* 作用：创建 Hexo 项目骨架
* 工作原理：
  1. 创建 blog 目录
  2. 从 GitHub 仓库 hexojs/hexo-starter 下载配置文件
  3. 生成 package.json 文件（包含核心依赖）

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

且此时 node_modules 中已经安装了很多包，看起来是已经执行了 npm install 的步骤。因为 `package.json` 中的依赖都可以在 `node_modules` 中找到。

### hexo 文件生成
```bash
hexo new [layout] "Title"
```

layout 参数：post（默认）或 page, draft。生成文件的模板放在 `scaffolds/` 文件夹下，因此理论上可以往里面添加其他模板。


### butterfly 主题与静态网页生成
下载 butterfly 主题，将文件夹放在 `themes` 中。将其 `_config.yml` 复制出来，放在 hexo 根目录下，并且将其重命名为 `_config.butterfly.yml`。

有了主题之后，静态网页生成的流程为：
1. 配置加载阶段
   1. 站点配置：_config.yml
      * 控制全局设置（URL/目录/部署等）
   2. 主题配置：_config.butterfly.yml
      * 覆盖主题默认设置（菜单/样式/插件等）
   3. 最终配置 = 合并 _config.yml + _config.butterfly.yml
2. 源文件处理阶段
   * 内容来源：
     * 用户文章：source/_posts/*.md
     * 主题资源：themes/butterfly/source/ (CSS/JS/图片)
   * 关键处理：
     * Markdown → HTML 转换
     * Front-Matter 元数据提取
     * 资源文件复制/压缩
3. 模板渲染阶段
   * 模板引擎：pug
   * 内容来源：
     * post 与 page：`source/` 下的 `.md` 文件。
     * 模板路径 `/theme/butterfly/layout`
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
     * 应用 _config.butterfly.yml 中的样式变量
     * 例如：
        ```pug
        //- 根据主题配置显示搜索框
        if theme.search.enable
        include includes/widget/search.pug
        ```
4. 静态文件生成
   * HTML：根据模板 + 内容生成
   * 资源：source/ 和 themes/butterfly/source/ → 合并到 public/