---
title: 利用al-folio主题部署个人学术主页
categories:
  - Dev Tools
  - al-folio
cover: 'https://source.fomal.cc/img/default_cover_186.webp'
tags:
  - al-folio
  - github action
  - blog
abbrlink: 136bdd49
date: 2026-01-03 16:01:55
description: 利用 al-folio 主题构建学术主页指南：详解 GitHub Action 部署流程、Docker 本地调试环境搭建，以及网站配置自定义与精简优化的方法。
---

## 网站部署与调试
### 网站部署
部署流程非常简单，只要按照官方文档 [Installing and Deploying](https://github.com/alshedivat/al-folio/blob/main/INSTALL.md) 中的 [Recommended Approach](https://github.com/alshedivat/al-folio/blob/main/INSTALL.md#recommended-approach) 一步步做就行。以及官方文档中还给了一个视频教程，看起来更直观。

唯一一点需要注意的是，这里默认把个人主页部署在 `https://<your-github-username>.github.io`，但是如果希望把博客部署在网站的子目录下，那在 `_config.yml` 中需要把 `baseurl` 设置为 `/<your-repository-name>/`。

接下来 Github Action 就会自动开始工作，最后在 `https://<your-github-username>.github.io/<your-repository-name>/` 中就能看到部署好的个人主页。

### 本地调试
由于 Github Action 工作一次需要很长时间（大约 4 分钟），因此每次改完推送到 GitHub 上再去网站上看结果非常费时，以及有时候还可能构建失败。因此需要本地预览（类似 `hexo server`）。

首先把仓库拉到本地：
```bash
git clone git@github.com:<your-username>/<your-repo-name>.git
```

为了免去配置环境等各种麻烦的操作（就像 Hexo 需要配置 Node.js 环境一样），al-folio 的作者非常贴心的提供了 docker 镜像。安装好 `docker` 和 `docker-compose` 之后，在项目主目录下运行：
```bash
docker compose pull
docker compose up
```

docker 启动并且运行成功之后就可以在 `http://localhost:8080/<your-repository-name>/` 下看到本地预览的个人主页。构建网站的时间不会太长，如果太久卡着不动，那可能是某些地方配置出问题了。

## 网站设置
就是把个人主页填上自己的信息，以及把网站设置成自己需要的样子，同样有官方文档 [Customize](https://github.com/alshedivat/al-folio/blob/main/CUSTOMIZE.md)。

### 网站精简
参考官方文档中 [Removing content](https://github.com/alshedivat/al-folio/blob/main/CUSTOMIZE.md#removing-content) 的建议，把不需要的内容写到 `_config.yml` 文件的 `exclude:` 字段下。具体的不需要的内容参考官方文档下面的 "Removing xxx page"。理论上直接删除也可以，但是试过之后发现容易删掉一些在别的文件里被调用的东西，导致本地预览的时候就莫名其妙报错。

由于这个主题是直接从主题作者的 GitHub 里面直接 fork 过来的，所以里面也包含了很多诸如 `README.md` 之类实际上没什么用的文件，文件太多了看着很烦，所以都可以直接删了。同时注意需要在 `_config.yml` 文件的 `exclude:` 字段下把这些文件名也都一起删掉。

除此之外 `lighthouse_results/` 也作用不大，连同 `.github/workflows/lighthouse-badger.yml` 一起删了。`.github/workflows/prettier.yml` 以及 `prettier-html.yml`, `prettier-comment-on-pr.yml` 对应的 GitHub Action 在网站部署的时候老是报错，但是对网站也没啥影响，也删了。

### 文件结构分析
这一点在 [Project structure](https://github.com/alshedivat/al-folio/blob/main/CUSTOMIZE.md#project-structure) 里面有，下面再结合自己修改博客的过程补充一点内容：

{% hideToggle 项目文件具体结构及其作用 %}

- `_bibliography/`: 存放学术引用相关文件。
  - `papers.bib`: BibTeX 格式的论文列表，网站会自动解析此文件生成 publications 页面。

- `_data/`: 存放网站的数据文件（YAML 格式），用于动态生成页面内容。
  - `citations.yml`: 论文引用数据，不过博客无法实时去爬取 Google Scholar 的数据。通常需要运行一个脚本来生成该文件。平时可以不用。
  - `coauthors.yml`: 合作者信息，可以填写其主页链接。效果为在网站生成的论文数据中，如果出现了这些 co-author 的名字，会为这些名字自动生成超链接，跳转到其主页。
  - `cv.yml`: 简历数据（如果使用 YAML 生成 CV）。是 `assets/json/resume.json` 的 fallback。
  - `repositories.yml`: GitHub 仓库展示配置。
  - `socials.yml`: 社交媒体链接配置。
  - `venues.yml`: 会议/期刊全称映射表。效果为在网站生成的论文数据旁边加上一个带颜色的会议/期刊名称标签。如果在 `venues.yml` 中还写了 `url` 项，点击标签可以跳转到相应网页。

- `_includes/`: 存放可复用的 Liquid 模板片段，可以在其他布局或页面中引用。
- `_layouts/`: 也是 Liquid 模板片段，存放各种页面的 HTML 布局模板。

- `_news/`: 存放新闻动态的 Markdown 文件。
  - 这些内容会显示在主页的 "News" 板块。

- `_pages/`: 存放网站的主要页面（Markdown 格式）。
  - `about.md`: 网站首页（About Me）。
  - `cv.md`: 简历页面。实际的数据在 `assets/json/resume.json` 中。
  - `publications.md`: 发表论文列表页面。实际的数据在 `_bibliography/papers.bib` 中。
  - `projects.md`: 项目展示页面。
  - `blog.md`: 博客索引页。
  - `404.md`: 404 错误页。

- `_projects/`: 存放具体项目的介绍页面（Markdown 格式）。
  - 每个文件代表一个项目，会显示在 Projects 页面中。

- `_sass/`: 存放 SCSS 样式文件。
  - `_variables.scss`: 定义颜色、字体等变量。
  - `_layout.scss`: 布局样式。
  - `_themes.scss`: 主题（深色/浅色模式）样式。

- `_scripts/`: 存放用于页面功能的 JavaScript 脚本（通常是 Liquid 模板生成的 JS）。
  - `google-analytics-setup.js`: Google Analytics 设置。
  - `giscus-setup.js`: 评论系统设置。

- `assets/`: 存放静态资源文件。
  - `css`, `fonts`, `html`, `js`, `webfonts`: 目前看起来是比较重要的配置文件，不用动
  - `json`：里面有 `resume.json`，用于生成简历。
  - 其他：就是一些存放资源的文件夹，需要的话加上就行。

- `bin/`: 存放维护和部署脚本。
  - `deploy`: 部署脚本。
  - `entry_point.sh`: Docker 容器启动脚本。
  - `update_scholar_citations.py`: 更新 Google Scholar 引用的 Python 脚本。

- `_site/` (自动生成): Jekyll 构建生成的静态网站目录。此目录下的文件不应直接编辑，因为每次构建都会被覆盖。

- `_config.yml`: Jekyll 的主配置文件。包含了网站的标题、作者信息、主题设置、插件配置等全局选项。
- `docker-compose.yml / docker-compose-slim.yml`: Docker 编排文件，用于在本地容器化环境中运行和预览网站。
- `Dockerfile`: 定义了构建网站所需的 Docker 镜像环境。
- `Gemfile`: Ruby 依赖定义文件，列出了 Jekyll 及其插件所需的 Ruby gems。
- `package.json`: Node.js 依赖定义文件，主要用于前端工具或构建脚本。
- `requirements.txt`: Python 依赖文件，可能用于某些辅助脚本（如更新学术引用）。
- `robots.txt`: 搜索引擎爬虫协议文件，告诉搜索引擎哪些页面可以抓取。

{% endhideToggle %}


## 导航栏设置外部链接
由于我自己的博客网址为 https://zhuxz0299.github.io, 利用 Hexo+Butterfly 构建；但是个人主页网址为 https://zhuxz0299.github.io/my-profile, 因此博客与 al-folio 主题默认的构建方式不同。如果希望依然能在导航栏设置一个跳转到博客页面的链接，需要对网站配置文件进行一些修改。

首先将 `header.liquid` 中 102-103 行原本的
```liquid
<li class="nav-item {% if page.url contains parent_link %}active{% endif %}">
    {%- if p.permalink contains '://' -%}
```

改为
```liquid
<li class="nav-item {% if page.url contains parent_link and p.external_url == nil %}active{% endif %}">
    {%- if p.external_url -%}
    {%- assign url = p.external_url -%}
    {%- elsif p.permalink contains '://' -%}
```

以增加对 front matter 中 `external_url` 词条的支持。同时在 `_pages/` 文件夹下添加 `external_blog.md` 文件，内容为
```yml
---
layout: page
title: blog
nav: true
nav_order: 1
external_url: https://zhuxz0299.github.io/
---
```

即可支持点击 blog 按钮跳转到博客网站。