这是一个使用 [Hexo](https://hexo.io/) 和 Butterfly 主题构建的博客。

## 基本用法

首次使用时先安装依赖：

```bash
npm install
```

`package.json` 中的 scripts 可通过 `npm run <script>` 执行。

## Scripts 说明

### Hexo 构建与部署

| 命令 | 作用 |
| --- | --- |
| `npm run build` | 生成静态网站，输出到 `public/`。 |
| `npm run clean` | 删除 Hexo 缓存和已生成的 `public/` 目录。 |
| `npm run server` | 启动本地预览服务，默认访问 `http://localhost:4000/`。 |
| `npm run dev` | 依次清理、生成网站，然后启动本地预览服务。 |
| `npm run deploy` | 将已生成的静态网站部署到 `_config.yml` 中配置的 Git 仓库。 |
| `npm run publish` | 生成静态网站并部署，不会先清理缓存。 |
| `npm run redeploy` | 清理缓存后重新生成并部署，适合处理缓存或残留文件问题。 |

### KaTeX 公式工具

| 命令 | 作用 |
| --- | --- |
| `npm run katex:check` | 检查 `source/_posts/` 中的 Markdown 公式，报告 KaTeX 警告、错误及所在行。 |
| `npm run katex:wrap-gather` | 将含有裸换行的块级公式包装到 `gather*` 环境中。该命令会直接修改 Markdown 文件。 |

可在 `--` 后传入文件或目录，只处理指定范围：

```bash
npm run katex:check -- source/_posts/example.md
npm run katex:wrap-gather -- source/_posts/example.md
```

### 图片工具

图片转换依赖 ImageMagick（`magick` 或 `convert`）。

| 命令 | 作用 |
| --- | --- |
| `npm run img:post -- <文章路径>` | 将单篇文章图片目录中的 PNG/JPEG 转为 WebP，并更新文章引用。 |
| `npm run img:all` | 优化 `source/figure/` 中的全部 PNG/JPEG，并更新相关文章引用。 |
| `npm run img:migrate` | 将文章引用的图片整理到按文章划分的目录中，并更新引用路径。 |

图片命令默认保留原文件。建议先用 `--dry-run` 预览迁移结果；确认无误后，可使用 `--delete-originals` 删除原图。常用选项还有 `--quality <N>`、`--max-width <N>` 和迁移时的 `--convert-webp`。

```bash
npm run img:post -- source/_posts/linux_/example.md --quality 88 --max-width 1800
npm run img:migrate -- --dry-run --convert-webp
```
