---
title: hexo 博客部署记录
cover: 'https://source.fomal.cc/img/default_cover_7.webp'
description: 为了解决博客主题版本落后的问题，重新搭建了一下博客，并且记录一下搭建流程，免得后面又忘了
tags:
  - hexo
  - butterfly
abbrlink: f51eef37
date: 2025-12-08 22:48:31
categories: [Dev Tools, Hexo]

---

## Hexo + Butterfly 基础安装

{% note info %}
参照 [hexo 文档](https://hexo.io/docs/)，[Butterfly 文档：快速开始](https://butterfly.js.org/posts/21cfbf15/)
{% endnote %}

1. 安装 Node.js 以及 Git
2. `npm install -g hexo-cli`，如果失败，就运行 `sudo npm install -g hexo-cli`
3. `npm install hexo-theme-butterfly`
4. 找一个合适的路径，`hexo init blog`，会创建一个 `blog` 文件夹并且在其中完成初始化
5. 运行 `npm install` 安装必要的包（这一步似乎可以略过了）
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
将设备的公钥放入 Github 的 SSH keys -> Authentication keys 中，流程和[这篇博客](https://zhuxz0299.github.io/posts/4d4a0720.html)相同。

安装远程部署所需包：
```bash
npm install hexo-deployer-git --save
```

然后在 `_config.yaml` 文件中配置：
```yaml
deploy:
  - type: git
    repository: https://github.com/zhuxz0299/zhuxz0299.github.io.git
    branch: main
```

## 创建主题页面
{% note info %}
参照 [Butterfly 文档：主题页面](https://butterfly.js.org/posts/dc584b87/)
{% endnote %}

* 创建 tag 页面：`hexo new page tags`
* 创建 category 页面：`hexo new page categories`
* 创建友链页面：`hexo new page link`
* 创建说说页面：`hexo new page shuoshuo`

然后在几个新创建的页面中编辑 Front-matter 中的 `type`，让 butterfly 知道怎么渲染

### 数据来源
tag 和 category 页面可以自动生成，但是友链和说说的页面是需要手动添加内容的。因此创建 `source/_data` 文件夹，然后分别创建 `link.yml` 以及 `shuoshuo.yml` 文件。

## Butterfly 主题配置
{% note info %}
参照 [Butterfly 文档：主题配置](https://butterfly.js.org/posts/4aa8abbe/)
{% endnote %}

内容见 `_config.yml` 以及 `_config.butterfly.yml` 的注释

注：数学公式支持处于不知名的原因，这段配置必须放在 `_config.yml` 下：
```yaml
markdown:
  plugins:
    - '@renbaoshuo/markdown-it-katex'
```


## 后续配置
* 一图流：在 `/source/css/only_bg_img.css` 中实现了配置
* 自定义字体：在 `/source/css/font.css` 引入字体，然后在 `_config.butterfly.yml` 的 `font` 中进行配置
* wowjs 动画：
  * `npm install hexo-butterfly-wowjs --save`
  * 然后在 `_config.butterfly.yml` 的 `wowjs` 中进行配置
  * 发现在新的主题下不太好用，关了
* 鼠标样式：通过 `/source/css/cursor.css` 以及 `/source/js/cursor.js` 实现配置
* 导航栏配置：通过 `/source/css/nav_bar.css` 配置，实现页面顶部导航栏菜单居中
* 页面整体配置：通过 `/source/css/page_border.css` 配置，实现了页面组件的圆角
* 滚动条配置：通过 `/source/css/scroll_bar.css` 配置，配置文件利用了一些 Chromium 内核提供的私有属性，因此在 Chrome 与 Firefox 中的呈现会略有不同
* category 页面修改：通过 `scripts/category_card_injector.js` 对页面元素进行调整，配置的数据路径为 `source/_data/category_images.yml`

## 多端同步
为了方便在不同的电脑上编写博客并且保持同步，可以将源码也放到 Github 中。
```bash
git init
git remote add origin https://github.com/zhuxz0299/zhuxz0299.github.io.git
git checkout -b hexo-v2
git push -u origin hexo-v2
```

同时为了方便部署，还在 `package.json` 的 `"scripts"` 项中添加了这几条命令：
```json
  "scripts": {
    ...
    "dev": "hexo clean && hexo generate && hexo server",
    "publish": "hexo generate && hexo deploy",
    "redeploy": "hexo clean && hexo generate && hexo deploy"
  },
```

在调用的 hexo 命令中，`hexo generate` 用于将写好的 `.md` 渲染成 `.html`，并且将 `source` 文件夹下的其他资源文件（如图片）复制到 `public` 文件夹下；`hexo deploy` 则是将数据推送到 github 相应分支，这两个命令在部署网站的时候都必不可少。而 `hexo clean` 命令通常用于修改了修改了配置文件、主题代码之后清理缓存，防止页面错乱，不需要每次都运行。