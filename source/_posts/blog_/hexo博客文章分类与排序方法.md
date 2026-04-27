---
title: hexo博客文章分类与排序方法
cover: https://source.fomal.cc/img/default_cover_8.webp
tags: hexo
abbrlink: 3d9bb40a
date: 2023-03-20 19:17:45
description: 让文章以想要的顺序排序的方法
categories: [Dev Tools, Hexo]

---

## 本地文章分类
如果文章太多全都放在 `_posts` 文件夹中会显得很乱，所以可以在 `_posts` 文件夹中建立子文件夹，将文章放入。这样操作不会影响文章在网站上的正常显示。

## 网站文章排序
{% note warning %}
像下面这样直接修改 Node.js 的包内容不是一个好习惯，包更新之后修改内容就会没掉。
{% endnote %}

### 源文件修改
在博客目录中的 `node_modules`=>`hexo-generate-category`=>`lib`=>`generate.js` 文件中，修改 `const orderBy` 为
```javascript
const orderBy = config.category_generator.order_by || '-order';
```

就可以手动指定 order 排序，`'-order'` 中的负号表示降序排序。

### 文章标记
在文章的 front-matter 出添加 `order:` 就行。如
```yaml
title: Chapter1-Introduction
categories: Operating system
abbrlink: a733b7f0
order: 1 # 手动指定文章顺序
date: 2023-03-14 14:21:12
tags:
```

然后文章就会按照设置的方式排序。