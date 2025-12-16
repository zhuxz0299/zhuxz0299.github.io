/**
 * scripts/category_card_injector.js
 * Version 7.0 (Section Layout): 
 * 1. 读取 source/_data/categories_info.yml 配置
 * 2. 将嵌套的列表重构为 "板块化" 布局
 * 3. 一级分类：宽卡片 (左图右文)
 * 4. 二级分类：网格卡片
 */

hexo.extend.filter.register('after_render:html', function (str, data) {
  // 仅在 category 页面生效
  if (!data.path.includes('categories/index.html') && data.page.type !== 'categories') {
    return str;
  }

  // 1. 读取配置
  const categoriesInfo = hexo.locals.get('data').categories_info || {};
  const configJson = JSON.stringify(categoriesInfo);

  // 2. CSS 样式定义
  const css = `
    <style>
      /* 隐藏原始列表，防止闪烁 (JS执行完后会移除这个类或替换内容) */
      .category-lists ul.category-list {
        visibility: hidden; 
        height: 0;
        overflow: hidden;
      }

      /* === 容器 === */
      .category-section {
        margin-bottom: 40px;
        animation: slide-in 0.5s ease-out;
      }

      @keyframes slide-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* === 一级分类 Header (宽卡片) === */
      .category-header {
        display: flex;
        background: var(--card-bg);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--card-box-shadow);
        transition: all 0.3s;
        height: 180px; /* 固定高度 */
        margin-bottom: 20px;
        border: 1px solid var(--card-border, #e3e8f7);
        text-decoration: none !important; /* 去除链接下划线 */
        color: var(--font-color) !important;
        position: relative;
      }

      .category-header:hover {
        transform: translateY(-5px);
        box-shadow: var(--card-hover-box-shadow);
        border-color: var(--theme-color, #49b1f5);
      }

      /* 左侧图片 */
      .category-header-img {
        width: 35%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s;
      }
      
      .category-header:hover .category-header-img {
        transform: scale(1.05);
      }

      /* 右侧内容 */
      .category-header-content {
        flex: 1;
        padding: 20px 25px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
      }

      .category-header-title {
        font-size: 1.8em;
        font-weight: bold;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        color: var(--text-highlight-color, #1f2d3d);
      }

      [data-theme="dark"] .category-header-title {
        color: #e0e0e0;
      }

      .category-header-count {
        font-size: 0.5em;
        background: rgba(150, 150, 150, 0.1);
        color: #999;
        padding: 2px 8px;
        border-radius: 10px;
        margin-left: 10px;
        vertical-align: middle;
        font-weight: normal;
      }

      .category-header-desc {
        font-size: 0.95em;
        color: #666;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3; /* 最多显示3行 */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      [data-theme="dark"] .category-header-desc {
        color: #a0a0a0;
      }

      /* === 二级分类 Grid === */
      .category-sub-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 15px;
        padding-left: 20px; /* 稍微缩进一点，体现层级 */
        border-left: 2px solid var(--btn-bg, #f0f0f0);
      }

      .category-sub-item {
        position: relative;
        background: var(--card-bg);
        border-radius: 8px;
        overflow: hidden;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        text-decoration: none !important;
        border: 1px solid var(--card-border, #e3e8f7);
        transition: all 0.3s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        cursor: pointer;
      }

      .category-sub-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 10px rgba(0,0,0,0.1);
        border-color: var(--theme-color, #49b1f5);
      }

      /* 二级分类背景图模式 */
      .category-sub-item.has-bg {
        border: none;
      }
      
      /* 遮罩层 */
      .category-sub-item.has-bg::after {
        content: '';
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.4);
        transition: background 0.3s;
        z-index: 1;
      }
      
      .category-sub-item.has-bg:hover::after {
        background: rgba(0,0,0,0.2);
      }

      .category-sub-item-content {
        position: relative;
        z-index: 2; /* 确保在遮罩之上 */
        padding: 0 10px;
        width: 100%;
      }

      .category-sub-title {
        font-weight: bold;
        font-size: 1em;
        color: var(--font-color);
        display: block;
      }
      
      .category-sub-item.has-bg .category-sub-title {
        color: #fff;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      }

      .category-sub-count {
        font-size: 0.8em;
        color: #858585;
        margin-top: 4px;
        display: block;
      }

      .category-sub-item.has-bg .category-sub-count {
        color: rgba(255,255,255,0.8);
      }

      /* === 移动端适配 === */
      @media (max-width: 768px) {
        .category-header {
          height: auto;
          flex-direction: column;
        }
        .category-header-img {
          width: 100%;
          height: 120px;
        }
        .category-sub-grid {
          padding-left: 0;
          border-left: none;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
      }
    </style>
  `;

  // 3. JS 逻辑
  const js = `
    <script>
    document.addEventListener('DOMContentLoaded', function () {
      const config = ${configJson};
      const container = document.querySelector('.category-lists');
      const originalList = container.querySelector('ul.category-list');
      
      if (!originalList) return;

      // 解析 DOM 结构为数据对象
      function parseList(ul) {
        const items = [];
        // 获取直接子元素 li
        const lis = Array.from(ul.children).filter(child => child.tagName === 'LI');
        
        lis.forEach(li => {
          const link = li.querySelector('a.category-list-link');
          const countSpan = li.querySelector('span.category-list-count');
          if (!link) return;

          const name = link.textContent.trim();
          const url = link.getAttribute('href');
          const count = countSpan ? countSpan.textContent.trim() : '0';
          
          // 查找子列表
          const childUl = li.querySelector('ul.category-list-child');
          const children = childUl ? parseList(childUl) : [];

          items.push({ name, url, count, children });
        });
        return items;
      }

      const categories = parseList(originalList);
      
      // 生成新的 HTML
      let newHtml = '';

      categories.forEach(cat => {
        const info = config[cat.name] || {};
        const imgSrc = info.image || '/img/404.jpg'; // 默认图
        const desc = info.description || '暂无描述';

        // 生成一级分类 Header
        let sectionHtml = \`
          <div class="category-section">
            <a href="\${cat.url}" class="category-header">
              <img class="category-header-img" src="\${imgSrc}" alt="\${cat.name}" onerror="this.src='/img/404.jpg'">
              <div class="category-header-content">
                <div class="category-header-title">
                  \${cat.name}
                  <span class="category-header-count">\${cat.count}</span>
                </div>
                <div class="category-header-desc">\${desc}</div>
              </div>
            </a>
        \`;

        // 生成二级分类 Grid
        if (cat.children && cat.children.length > 0) {
          sectionHtml += '<div class="category-sub-grid">';
          
          cat.children.forEach(sub => {
            const subInfo = config[sub.name] || {};
            const subImg = subInfo.image; // 二级分类可能有图，也可能没图
            const hasBgClass = subImg ? 'has-bg' : '';
            
            // 如果有图，直接内联 background-image
            const styleAttr = subImg ? \`style="background-image: url('\${subImg}'); background-size: cover; background-position: center;"\` : '';
            
            sectionHtml += \`
              <a href="\${sub.url}" class="category-sub-item \${hasBgClass}" \${styleAttr}>
                <div class="category-sub-item-content">
                  <span class="category-sub-title">\${sub.name}</span>
                  <span class="category-sub-count">\${sub.count} 篇</span>
                </div>
              </a>
            \`;
          });

          sectionHtml += '</div>';
        }

        sectionHtml += '</div>'; // end category-section
        newHtml += sectionHtml;
      });

      // 替换 DOM
      container.innerHTML = newHtml;
      // 移除原来的隐藏样式
      container.style.visibility = 'visible';
    });
    </script>
  `;

  return str.replace('</body>', css + js + '</body>');
});
