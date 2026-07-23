---
title: hexo 博客部署记录
cover: https://source.fomal.cc/img/default_cover_139.webp
description: 为了解决博客主题版本落后的问题，重新搭建了一下博客，并且记录一下搭建流程，免得后面又忘了
tags:
  - hexo
  - butterfly
  - npm
  - node
  - github
abbrlink: f51eef37
date: 2025-12-08 22:48:31
categories: [Dev Tools, Hexo]

---

## Hexo + Butterfly 基础安装

{% note info %}
参照 [hexo 文档](https://hexo.io/docs/)，[Butterfly 文档：快速开始](https://butterfly.js.org/posts/21cfbf15/)
{% endnote %}

当前博客使用的是 Hexo 8.1.1 和 Butterfly 5.5.2。由于 Butterfly 现在是作为 npm 依赖安装的，所以主题本身也会被记录在 `package.json` 和 `package-lock.json` 中，不需要再把主题代码手动复制到 `themes/` 文件夹。

1. 安装 Node.js 以及 Git
2. `npm install -g hexo-cli`，如果失败，就运行 `sudo npm install -g hexo-cli` (事实上这个步骤也可以不需要，只是没法在任意工作目录下运行 `hexo` 命令)
3. `npm install hexo-theme-butterfly`
4. 找一个合适的路径，`hexo init blog`，会创建一个 `blog` 文件夹并且在其中完成初始化
5. 运行 `npm install` 安装必要的包。现在 `hexo init` 通常会顺手安装一遍依赖，但是换电脑同步源码之后仍然需要在项目根目录运行 `npm install`
6. 修改文件夹下的 `_config.yml`，把主题改为 `butterfly`: 
    ```yaml
    theme: butterfly
    ```
7. 安装 pug 以及 stylus 的渲染器：
    ```bash
    npm install hexo-renderer-pug hexo-renderer-stylus --save
    ```
8. 在 hexo 的根目录创建一个文件 `_config.butterfly.yml`，之后的配置可以都写在这里
9. 运行 `hexo g` 以及 `hexo s` 就可以看到部署在本地端口的网站

## Github 配置
将设备的公钥放入 Github 的 SSH keys -> Authentication keys 中 (其实就是方便首先 push 的时候走 SSH)

安装远程部署所需包：
```bash
npm install hexo-deployer-git --save
```

然后在 `_config.yml` 文件中配置：
```yaml
deploy:
  - type: git
    repository: git@github.com:zhuxz0299/zhuxz0299.github.io.git
    branch: main
```

{% note warning %}
如果在上述 `repository` 中填写 `https://github.com/zhuxz0299/zhuxz0299.github.io.git`，可能会在某天 `hexo deploy` 的时候突然要求输入用户名密码登录。但是 Github 目前已经在命令行禁止了这种登录途径，导致无法正常推送代码到 GitHub。
{% endnote %}

## 创建主题页面
{% note info %}
参照 [Butterfly 文档：主题页面](https://butterfly.js.org/posts/dc584b87/)
{% endnote %}

* 创建 tag 页面：`hexo new page tags`
* 创建 category 页面：`hexo new page categories`
* 创建友链页面：`hexo new page link`
* 创建说说页面：`hexo new page shuoshuo`
* 创建关于页面：`hexo new page about`

{% note default %}
如果没有全局安装 `hexo-cli`，在博客目录下运行时在最前面加上 `npx` 即可，例如 `npx hexo new page tags`。
{% endnote %}

然后在几个新创建的页面中编辑 Front-matter 中的 `type`，让 butterfly 知道怎么渲染

### 数据来源
tag 和 category 页面可以自动生成，但是友链和说说的页面是需要手动添加内容的。因此创建 `source/_data` 文件夹，然后分别创建 `link.yml` 以及 `shuoshuo.yml` 文件。

当前导航栏中实际启用了主页、归档、标签、分类、关于、日志和学术主页。其中学术主页是跳转到 `/my-profile/`，由另一个 al-folio 项目生成；友链页面虽然还保留在 `source/link/`，但是导航栏入口暂时注释掉了。

## Butterfly 主题配置
{% note info %}
参照 [Butterfly 文档：主题配置](https://butterfly.js.org/posts/4aa8abbe/)
{% endnote %}

内容见 `_config.yml` 以及 `_config.butterfly.yml` 的注释。现在基本分成两类：

* `_config.yml`：站点基础信息、永久链接、语法高亮、部署配置、全局 Markdown 渲染配置
* `_config.butterfly.yml`：菜单、封面、侧边栏、搜索、评论、主题样式、CDN、自定义 CSS/JS 注入等主题配置

{% note warning %}
数学公式使用 KaTeX。目前安装的是 `hexo-renderer-markdown-it`、`katex` 和 `@renbaoshuo/markdown-it-katex`。出于不知名的原因，这段配置必须放在 `_config.yml` 下：
```yaml
markdown:
  plugins:
    - '@renbaoshuo/markdown-it-katex'
```
{% endnote %}

## 后续配置
* 永久链接：使用 `hexo-abbrlink` 生成文章短链接，`_config.yml` 中配置为 `permalink: posts/:abbrlink.html`。这个设置会影响评论区按文章链接加载评论，所以迁移博客时尽量不要改。
* 一图流：在 `/source/css/only_bg_img.css` 中实现了配置，主要是让页头、页脚和部分卡片背景透明，配合 `_config.butterfly.yml` 中的 `background: /img/violet_light.jpg`
* 自定义字体：在 `/source/css/font.css` 引入字体，目前主要用于导航栏、站点标题和文章标题
* wowjs 动画：
  * `npm install hexo-butterfly-wowjs --save`
  * 然后在 `_config.butterfly.yml` 的 `wowjs` 中进行配置
  * 目前 `wowjs.enable` 为 `false`，依赖和配置还保留，但是没有启用
* 鼠标样式：通过 `/source/css/cursor.css` 以及 `/source/js/cursor.js` 实现配置
* 导航栏配置：通过 `/source/css/nav_bar.css` 配置，实现页面顶部导航栏菜单居中
* 页面整体配置：通过 `/source/css/page_border.css` 配置，实现了页面组件的圆角
* 滚动条配置：通过 `/source/css/scroll_bar.css` 配置，配置文件利用了一些 Chromium 内核提供的私有属性，因此在 Chrome 与 Firefox 中的呈现会略有不同
* 标签页面修改：通过 `scripts/tag_filter_injector.js` 替换 Butterfly 默认的标签云，支持标签搜索、AND/OR 匹配和按标签筛选文章；样式在 `/source/css/tag_filter.css` 中
* Mermaid：在 `_config.butterfly.yml` 中启用 `mermaid.code_write`，并且在 `_config.yml` 的 `highlight.exclude_languages` 中排除 `mermaid`，避免图表代码块被语法高亮抢先处理
* 图片处理脚本：`tools/blog_image.js` 用于将文章图片整理到 `source/figure/` 并转换/压缩为 webp，常用命令写在 `package.json` 中：
  ```bash
  npm run img:post -- source/_posts/xxx.md
  npm run img:all
  npm run img:migrate
  ```
* KaTeX 检查脚本：
  ```bash
  npm run katex:check
  npm run katex:wrap-gather
  ```
  前者用于检查公式渲染警告，后者用于把包含裸换行的显示公式包进 `gather*` 环境
* 搜索引擎收录：
  * `npm install hexo-generator-sitemap --save` 用于生成 `sitemap` 文件
  * 到 [Google Search Console](https://search.google.com/search-console) 中获取验证码，按照 butterfly 官方文档填写到 `site_verification` 字段下
  * 完成验证之后再到 Google Search Console 页面，在左侧导航栏点击“站点地图”，输入 `sitemap.xml` 并提交。

## 多端同步
为了方便在不同的电脑上编写博客并且保持同步，可以将源码也放到 Github 中。
```bash
git init
git remote add origin https://github.com/zhuxz0299/zhuxz0299.github.io.git
git checkout -b hexo-v3
git push -u origin hexo-v3
```

目前远程仓库中，`main` 分支用于放 `hexo deploy` 生成的静态页面，`hexo-v3` 分支用于保存 Hexo 源码。换新设备时拉取 `hexo-v3`，运行 `npm install` 恢复依赖，然后就可以继续写文章和部署。

同时为了方便部署，还在 `package.json` 的 `"scripts"` 项中添加了这几条命令：
```json
  "scripts": {
    ...
    "dev": "hexo clean && hexo generate && hexo server",
    "publish": "hexo generate && hexo deploy",
    "redeploy": "hexo clean && hexo generate && hexo deploy"
  },
```

在调用的 hexo 命令中，`hexo generate` 用于将写好的 `.md` 渲染成 `.html`，并且将 `source` 文件夹下的其他资源文件（如图片）复制到 `public` 文件夹下；`hexo deploy` 则是将数据推送到 GitHub 相应分支，这两个命令在部署网站的时候都必不可少。而 `hexo clean` 命令通常用于修改了配置文件、主题配置、自定义脚本之后清理缓存，防止页面错乱，不需要每次都运行。